'use client';

import { useEffect, useState } from 'react';
import SubscribeForm from '@/components/SubscribeForm';
import StockStatusCard from '@/components/StockStatusCard';
import { StockStatus } from '@/lib/types';
import { Zap, ShieldCheck, Gamepad2 } from 'lucide-react';

export default function Home() {
  const [stocks, setStocks] = useState<StockStatus[]>([]);
  const [searchPincode, setSearchPincode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stock-status')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStocks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleStockUpdate = (pincode: string, results: any[]) => {
    setSearchPincode(pincode);
    // Convert live-check results to StockStatus format for the cards
    const mappedStocks: StockStatus[] = results.map((r, i) => ({
      id: `live-${i}`,
      platform: r.platform.toLowerCase(),
      product_name: r.productName,
      in_stock: r.inStock,
      price: r.price,
      product_url: r.productUrl,
      is_pincode_dependent: false,
      last_checked: new Date().toISOString()
    }));
    setStocks(mappedStocks);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* ... rest of nav ... */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#00439c] rounded-lg flex items-center justify-center">
             <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-black italic tracking-tighter text-lg">PS5 TRACKER</span>
        </div>
        <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
           <span className="relative flex h-2 w-2 mr-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
           </span>
           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-12 md:py-24 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-12 lg:gap-8 text-center lg:text-left">
          {/* Visual Hook */}
          <div className="w-full max-w-[320px] md:max-w-md lg:order-2 animate-slide-up shrink-0">
            <div className="relative">
              <img 
                src="/ps5.jpg" 
                alt="PS5 Console" 
                className="w-full h-auto drop-shadow-2xl mx-auto rounded-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent lg:hidden"></div>
            </div>
          </div>

          <div className="animate-slide-up lg:order-1 max-w-xl" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 mb-6 uppercase tracking-tight leading-[0.9]">
              Is it <span className="text-[#00439c]">In Stock?</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-10 font-medium max-w-md mx-auto lg:mx-0">
              We scan local stores every second. Enter your pincode to check real-time availability.
            </p>
            
            <div className="w-full max-w-lg mx-auto lg:mx-0">
              <SubscribeForm onResults={handleStockUpdate} />
            </div>

            {/* Coverage Info */}
            <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 max-w-md mx-auto lg:mx-0">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center">
                <ShieldCheck className="w-3 h-3 mr-2" /> 9+ Models Tracked
              </p>
              <div className="flex flex-wrap gap-2">
                {['Slim Disc', 'Slim Digital', 'Disc Standard', 'Digital Edition', 'FC26 Bundle', 'Fortnite Bundle', 'NBA 2K26', 'COD Bundle'].map((model) => (
                  <span key={model} className="text-[9px] font-bold bg-white text-gray-500 px-2 py-1 rounded-md border border-gray-100">
                    {model}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span className="flex items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100"><ShieldCheck className="w-3.5 h-3.5 mr-2 text-blue-600" /> Secure</span>
              <span className="flex items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100"><Zap className="w-3.5 h-3.5 mr-2 text-blue-600" /> Real-time</span>
            </div>
          </div>
        </div>
      </section>

      {/* Retailer List */}
      <section id="status" className="bg-gray-50/50 py-20 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
             <div className="text-center sm:text-left">
               <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                 {searchPincode ? `Stock in ${searchPincode}` : 'Live Store Status'}
               </h2>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                 {searchPincode ? 'Live results for your pincode' : 'Sample snapshot — enter pincode for local results'}
               </p>
             </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-white rounded-3xl animate-pulse"></div>
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

    </main>
  );
}
