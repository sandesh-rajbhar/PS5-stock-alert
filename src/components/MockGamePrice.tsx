'use client';

const rows = [
  { store: 'Amazon India',      price: '₹3,499', was: '₹4,999', best: true  },
  { store: 'PlayStation Store', price: '₹4,299', was: null,     best: false },
  { store: 'Flipkart',          price: '₹3,799', was: null,     best: false },
];

export default function MockGamePrice() {
  return (
    <div className="relative w-full max-w-xs mx-auto">
      <span aria-hidden className="absolute -top-6 -right-6 text-[100px] font-black leading-none select-none pointer-events-none dark:text-amber-500/[0.05] text-amber-500/[0.06]">△</span>
      <div className="ps-card p-5 relative z-10">
        {/* Game header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-theme-divider">
          <img
            src="/spiderman.jpg"
            alt="Marvel's Spider-Man 2"
            className="w-10 h-14 rounded-lg object-cover shrink-0 shadow"
          />
          <div className="flex-1 min-w-0">
            <div className="font-black text-theme-page text-sm leading-tight">Marvel&apos;s Spider-Man 2</div>
            <div className="text-[10px] text-theme-muted mt-0.5">PS5 Physical Edition</div>
          </div>
          <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest whitespace-nowrap">
            Historical Low
          </span>
        </div>

        {/* Price rows */}
        <div className="space-y-0">
          {rows.map(r => (
            <div key={r.store} className="flex items-center gap-3 py-2.5 border-b border-theme-divider last:border-0">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.best ? 'bg-green-400' : 'bg-theme-faint/20'}`} />
              <span className="text-xs text-theme-page flex-1">{r.store}</span>
              <div className="text-right">
                {r.was && <span className="text-[10px] text-theme-faint line-through mr-1.5">{r.was}</span>}
                <span className={`text-xs font-black ${r.best ? 'text-green-400' : 'text-theme-page'}`}>{r.price}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 p-2.5 rounded-xl bg-amber-500/8 border border-amber-500/15 text-[10px] font-black text-amber-500 uppercase tracking-widest">
          Price drop alert available soon
        </div>
      </div>
    </div>
  );
}
