'use client';

import { useEffect, useState } from 'react';
import SubscribeForm from '@/components/SubscribeForm';
import StockStatusCard from '@/components/StockStatusCard';
import NoticeCarousel from '@/components/NoticeCarousel';
import Footer from '@/components/Footer';
import { StockStatus } from '@/lib/types';
import { ShieldCheck, Zap } from 'lucide-react';

const MODELS = [
  'Slim Disc', 'Slim Digital', 'Disc Standard', 'Digital Edition',
  'FC26 Bundle', 'Fortnite Bundle', 'GTA V', 'Spider-Man 2', 'EA FC 24',
];

export default function TrackerPage() {
  const [stocks, setStocks]             = useState<StockStatus[]>([]);
  const [searchPincode, setSearchPincode] = useState<string | null>(null);
  const [searchArea, setSearchArea]     = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetch('/api/stock-status')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setStocks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStockUpdate = (pincode: string, results: any[], areaName?: string) => {
    setSearchPincode(pincode);
    setSearchArea(areaName || null);

    const mapped: StockStatus[] = results.map((r, i) => {
      return {
        id: `live-${i}`,
        platform: r.platform,
        product_name: r.productName,
        in_stock: r.inStock,
        price: r.price,
        product_url: r.productUrl,
        available_items: r.items,
        // Platforms whose check isn't pincode-aware (scope 'national', e.g.
        // Vijay Sales) must show as national stock, not local.
        is_pincode_dependent: r.scope !== 'national',
        is_location_dependent: false,
        note: r.note,
        last_checked: new Date().toISOString(),
      };
    });
    setStocks(mapped);
  };

  return (
    <main className="min-h-screen bg-theme-page text-theme-page">

      <NoticeCarousel />

      {/* Page hero */}
      <section className="px-4 py-10 md:py-20 max-w-4xl mx-auto text-center relative">
        <div className="hero-glow absolute inset-0 pointer-events-none" />

        <div className="relative flex flex-col items-center gap-6 animate-slide-up">
          <div>
            <p className="text-[10px] font-black text-ps-neon-blue uppercase tracking-[0.2em] mb-2">Real-time · India-wide</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] text-theme-page">
              PS5 Scanner
            </h1>
            <p className="text-theme-muted mt-4 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
              Enter your pincode to check live PS5 availability across Amazon,
              Flipkart, Croma, Reliance Digital &amp; Vijay Sales.
            </p>
            <p className="text-[11px] font-medium text-theme-faint mt-2 max-w-lg mx-auto">
              Amazon, Flipkart, Croma &amp; Reliance Digital are checked for delivery to your
              pincode · Vijay Sales shows India-wide stock only (alerts via Telegram, not email)
            </p>
          </div>

          {/* Subscribe form */}
          <div id="subscribe" className="w-full max-w-lg mt-2">
            <SubscribeForm onResults={handleStockUpdate} />
          </div>

          {/* Coverage chips */}
          <div className="w-full max-w-lg bg-theme-card rounded-2xl border border-theme-card p-4 backdrop-blur-sm">
            <p className="text-[10px] font-black text-ps-neon-blue uppercase tracking-widest mb-3 flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 mr-2" /> Hardware &amp; Bundles Tracked
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {MODELS.map(m => (
                <span key={m} className="text-[9px] font-bold bg-theme-card text-theme-muted px-2.5 py-1 rounded-md border border-theme-card">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 text-[10px] font-black text-theme-faint uppercase tracking-widest">
            <span className="flex items-center bg-theme-card px-3 py-2 rounded-xl border border-theme-card">
              <ShieldCheck className="w-3.5 h-3.5 mr-2 text-ps-neon-blue" /> Verified Stores
            </span>
            <span className="flex items-center bg-theme-card px-3 py-2 rounded-xl border border-theme-card">
              <Zap className="w-3.5 h-3.5 mr-2 text-ps-neon-blue" /> Instant Alerts
            </span>
          </div>
        </div>
      </section>

      {/* Live status grid */}
      <section id="status" className="bg-theme-section border-t border-theme-section py-16 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-theme-page">
              Live Store Status
            </h2>
            <p className="text-xs font-bold text-theme-faint uppercase tracking-widest mt-1">
              {searchPincode
                ? `Showing results for ${searchPincode}${searchArea ? ` (${searchArea})` : ''}`
                : 'Real-time availability and prices across India'}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-theme-card border border-theme-card rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stocks.map(stock => <StockStatusCard key={stock.id} status={stock} />)}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
