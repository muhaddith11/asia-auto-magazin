import { prisma } from './prisma'

export async function sendTelegramMessage(message: string) {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' }
    })

    if (!settings?.telegramToken || !settings?.telegramChatId) {
      console.warn('Telegram settings are not configured')
      return false
    }

    const url = `https://api.telegram.org/bot${settings.telegramToken}/sendMessage`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: settings.telegramChatId,
        text: message,
        parse_mode: 'HTML'
      })
    })

    const data = await response.json()
    return data.ok
  } catch (error) {
    console.error('Telegram notification error:', error)
    return false
  }
}

export function formatSaleNotification(sale: any) {
  const items = sale.items.map((i: any) => `- ${i.product?.name || 'Mahsulot'}: ${i.quantity} dona`).join('\n')
  
  return `
💰 <b>YANGI SOTUV!</b>

🆔 Savdo: #${sale.id.slice(-6).toUpperCase()}
💵 Summa: <b>${new Intl.NumberFormat('uz-UZ').format(sale.totalAmount)} UZS</b>
💳 To'lov: ${sale.paymentMethod.toUpperCase()}

📦 <b>Mahsulotlar:</b>
${items}

📅 <i>${new Date().toLocaleString('uz-UZ')}</i>
  `
}
