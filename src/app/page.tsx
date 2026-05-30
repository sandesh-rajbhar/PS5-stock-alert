'use client';

import { useEffect, useState } from 'react';
import SubscribeForm from '@/components/SubscribeForm';
import StockStatusCard from '@/components/StockStatusCard';
import NoticeCarousel from '@/components/NoticeCarousel';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';
import NewsSection from '@/components/NewsSection';
import { StockStatus } from '@/lib/types';
import { Zap, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [stocks, setStocks] = useState<StockStatus[]>([]);
  const [searchPincode, setSearchPincode] = useState<string | null>(null);
  const [searchArea, setSearchArea] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stock-status')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Only show non-QC platforms in the status grid
          setStocks(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStockUpdate = (pincode: string, results: any[], areaName?: string) => {
    setSearchPincode(pincode);
    setSearchArea(areaName || null);
    
    const mappedStocks: StockStatus[] = results.map((r, i) => {
      const platform = r.platform.toLowerCase();
      return {
        id: `live-${i}`,
        platform: r.platform, // Keep original casing
        product_name: r.productName,
        in_stock: r.inStock,
        price: r.price,
        product_url: r.productUrl,
        available_items: r.items, // Include ALL items found
        is_pincode_dependent: ['amazon', 'flipkart', 'croma', 'reliance digital', 'vijay sales'].includes(platform),
        is_location_dependent: false,
        note: r.note,
        last_checked: new Date().toISOString()
      };
    });

    setStocks(mappedStocks);
  };

  return (
    <main className="min-h-screen bg-theme-page text-theme-page relative overflow-hidden">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-theme-nav backdrop-blur-md px-4 py-4 border-b border-theme-nav flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-black tracking-tighter text-xl uppercase">PS DEALS</span>
        </div>
        <ThemeToggle />
      </nav>

      <NoticeCarousel />

      {/* Hero Section */}
      <section className="px-4 py-12 md:py-24 max-w-4xl mx-auto relative">
        <div className="flex flex-col items-center justify-center text-center gap-8">
          <div className="animate-slide-up max-w-2xl flex flex-col items-center" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-theme-page mb-6 uppercase tracking-tight leading-[0.9]">
              Is it In Stock?
            </h1>
            <p className="text-lg md:text-xl text-theme-muted mb-10 font-medium max-w-xl mx-auto leading-relaxed">
              Compare prices across Amazon, Flipkart, Gameloot, and local stores in India. Subscribe for instant stock & deal alerts.
            </p>
            
            <div className="w-full max-w-lg mx-auto">
              <SubscribeForm onResults={handleStockUpdate} />
            </div>

            {/* Coverage Info */}
            <div className="mt-8 p-4 bg-theme-card rounded-2xl border border-theme-card w-full max-w-lg mx-auto backdrop-blur-sm">
              <p className="text-[10px] font-black text-ps-neon-blue uppercase tracking-widest mb-3 flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 mr-2" /> Top Hardware & Games Tracked
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Slim Disc', 'Slim Digital', 'Disc Standard', 'Digital Edition', 'FC26 Bundle', 'Fortnite Bundle', 'GTA V', 'Spider-Man 2', 'EA FC 24'].map((model) => (
                  <span key={model} className="text-[9px] font-bold bg-theme-card text-theme-muted px-2.5 py-1 rounded-md border border-theme-card">
                    {model}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3 text-[10px] font-black text-theme-faint uppercase tracking-widest">
              <span className="flex items-center bg-theme-card px-3 py-2 rounded-xl border border-theme-card"><ShieldCheck className="w-3.5 h-3.5 mr-2 text-ps-neon-blue" /> Verified Stores</span>
              <span className="flex items-center bg-theme-card px-3 py-2 rounded-xl border border-theme-card"><Zap className="w-3.5 h-3.5 mr-2 text-ps-neon-blue" /> Instant Alerts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Retailer List */}
      <section id="status" className="bg-theme-section border-t border-theme-section py-20 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
             <div className="text-center sm:text-left">
               <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-theme-page">
                 Live Store Status
               </h2>
               <p className="text-xs font-bold text-theme-faint uppercase tracking-widest mt-1">
                 {searchPincode ? `Showing results for ${searchPincode}${searchArea ? ` (${searchArea})` : ''}` : 'Real-time availability and prices across India'}
               </p>
             </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-theme-card border border-theme-card rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stocks.map((stock) => (
                <StockStatusCard key={stock.id} status={stock} />
              ))}
            </div>
          )}
        </div>
      </section>

      <NewsSection />
      <Footer />
    </main>
  );
}
