import { Cart } from '@/components/pos/Cart'

export default function POSPage() {
  return (
    <main className="h-screen flex flex-col p-4 bg-muted/30">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Magazin Terminal (POS)</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground font-medium">Sotuvchi: Administrator</span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Left Side: Product browsing (if desired, but user focused on Cart and Inventory) */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
           <div className="bg-card border rounded-xl flex-1 flex flex-col justify-center items-center text-muted-foreground p-8">
              <p>Mahsulotlar ro'yxati bu yerda bo'ladi.</p>
              <p className="text-xs mt-2 italic text-muted-foreground/60">Mahsulotni qo'shish uchun barcode skanerlang yoki qidiring.</p>
           </div>
        </div>

        {/* Right Side: Cart Interface */}
        <div className="lg:col-span-2 h-full overflow-hidden">
          <Cart />
        </div>
      </div>
    </main>
  )
}
