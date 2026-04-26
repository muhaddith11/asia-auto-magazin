'use client'

import React from 'react'
import { formatCurrency } from '@/lib/format'
import { CartItem } from '@/types'

interface ReceiptProps {
  items: CartItem[]
  total: number
  paymentMethod: string
  saleId?: string
  storeSettings?: any
}

export function Receipt({ items, total, paymentMethod, saleId, storeSettings }: ReceiptProps) {
  const now = new Date()

  return (
    <div id="receipt-content" className="p-4 bg-white text-black font-mono text-[12px] w-[80mm] mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-[16px] font-bold uppercase">{storeSettings?.name || 'MAGAZIN'}</h2>
        <p>{storeSettings?.address || ''}</p>
        <p>Tel: {storeSettings?.phone || ''}</p>
        <div className="border-b border-dashed my-2"></div>
        <p>CHEK #{saleId?.slice(-6).toUpperCase() || 'NEW'}</p>
        <p>{now.toLocaleString()}</p>
      </div>

      <div className="mb-2">
        <div className="flex justify-between font-bold border-b border-dashed pb-1 mb-1">
          <span>Nomi</span>
          <div className="flex gap-4">
             <span>Soni</span>
             <span>Narxi</span>
          </div>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col mb-1">
            <div className="flex justify-between">
              <span className="flex-1 truncate">{item.name}</span>
            </div>
            <div className="flex justify-end gap-6 text-[10px]">
              <span>{item.quantity} x {formatCurrency(item.price)}</span>
              <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed pt-2 space-y-1">
        <div className="flex justify-between text-[14px] font-bold">
          <span>JAMI:</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between opacity-70">
          <span>To'lov turi:</span>
          <span className="uppercase">{paymentMethod === 'cash' ? 'Naqd' : paymentMethod === 'card' ? 'Karta' : 'Nasiya'}</span>
        </div>
      </div>

      <div className="text-center mt-6 pt-4 border-t border-dashed">
        <p className="italic">{storeSettings?.receiptFooter || "Xaridingiz uchun rahmat!"}</p>
        <div className="mt-2 text-[10px] opacity-50">
           Tizim: POS-TERMINAL v1.0
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
