'use client';

import { useEffect, useState } from 'react';
import SubscribeForm from '@/components/SubscribeForm';
import StockStatusCard from '@/components/StockStatusCard';
import AdSlot from '@/components/AdSlot';
import NotificationBanner from '@/components/NotificationBanner';
import { StockStatus } from '@/lib/types';
import { Gamepad2, Zap, MapPin } from 'lucide-react';

export default function Home() {
  const [stocks, setStocks] = useState<StockStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stock-status')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStocks(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <NotificationBanner />
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-200">
            <Gamepad2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
          Never Miss PS5 in <span className="text-blue-600">Stock</span> Again
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          We watch Amazon, Flipkart, Croma, Vijay Sales & Quick Commerce 24/7 so you don&apos;t have to. Real-time alerts delivered to your inbox.
        </p>
        
        <SubscribeForm />
      </section>

      {/* Ad Break */}
      <AdSlot slot="1234567890" className="mb-16" />

      {/* Live Status Grid */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-500 fill-yellow-500" />
            Live Stock Status
          </h2>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Updates Hourly
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <StockStatusCard key={stock.id} status={stock} />
            ))}
            {stocks.length === 0 && !loading && (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium italic">No stock data available yet. Our robots are currently scanning the stores!</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-white rounded-3xl p-10 md:p-16 border border-gray-100 shadow-sm mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 font-black text-2xl">1</div>
            <h3 className="font-bold text-xl mb-4">Enter Details</h3>
            <p className="text-gray-600">Give us your email and pincode. We use the pincode to check Blinkit & Zepto near you.</p>
          </div>
          <div>
            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 font-black text-2xl">2</div>
            <h3 className="font-bold text-xl mb-4">We Scan</h3>
            <p className="text-gray-600">Our bots crawl top retailers every hour, checking for PS5 Standard, Digital, and Slim models.</p>
          </div>
          <div>
            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 font-black text-2xl">3</div>
            <h3 className="font-bold text-xl mb-4">Get Alerted</h3>
            <p className="text-gray-600 text-sm">The moment we find stock, we blast you an email. Blinkit & Zepto alerts include 10-min delivery updates!</p>
          </div>
        </div>
      </section>

      {/* Hyperlocal Note */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden mb-20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="md:max-w-xl mb-8 md:mb-0">
            <div className="flex items-center mb-4 text-yellow-400 font-bold uppercase tracking-widest text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              Unique Hyperlocal Tracking
            </div>
            <h2 className="text-3xl font-black mb-4">The Only Tracker with Quick-Commerce Support</h2>
            <p className="text-slate-400 text-lg">
              PS5s sometimes appear on Blinkit and Zepto for flash sales. We are the ONLY tool in India that checks these platforms based on your specific pincode.
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="flex items-center text-green-400 mb-2 font-bold">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></span>
              Live Monitoring
            </div>
            <div className="space-y-3">
              <div className="h-2 w-48 bg-slate-700 rounded"></div>
              <div className="h-2 w-32 bg-slate-700 rounded"></div>
              <div className="h-2 w-40 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
      </div>

      <AdSlot slot="0987654321" />

      {/* Footer */}
      <footer className="text-center pt-20 border-t border-gray-100">
        <p className="text-gray-400 text-sm mb-4">
          © 2026 PS5 Stock Tracker India. We earn affiliate commission or ad revenue from some links.
        </p>
        <p className="text-gray-300 text-[10px] max-w-xl mx-auto italic leading-relaxed">
          Disclaimer: This site is an independent service and is not affiliated with, authorized, or endorsed by Sony Interactive Entertainment, Amazon, Flipkart, or any other mentioned retailer. All product names, logos, and brands are property of their respective owners.
        </p>
      </footer>
    </main>
  );
}
