'use client';

import { useState, useEffect } from 'react';
import { StockStatus } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';
import { ExternalLink, Check, X, MapPin } from 'lucide-react';

interface Props {
  status: StockStatus;
}

export default function StockStatusCard({ status }: Props) {
  const [mounted, setMounted] = useState(false);
  const isAvailable = status.in_stock;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '---';
    }
  };

  return (
    <div className={`ps-card overflow-hidden flex flex-col h-full transition-all duration-300 ${
      !isAvailable && 'opacity-55 bg-black/20 border-white/[0.03]'
    }`}>
      {/* Retailer Info */}
      <div className="p-5 sm:p-6 flex-1">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight truncate">{status.platform}</h3>
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest whitespace-nowrap">
              {`Checked ${mounted ? formatTime(status.last_checked) : '...'}`}
            </p>
          </div>
          <div className={`status-pill shrink-0 border ${
            isAvailable
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {isAvailable ? (
              <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> Stock</span>
            ) : (
              <span className="flex items-center"><X className="w-3 h-3 mr-1" /> Out</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-zinc-400 text-sm font-medium line-clamp-2 min-h-[2.5rem]">
            {isAvailable ? (status.product_name || 'PS5 Console') : 'PS5 Console'}
          </p>
          <div className="text-2xl sm:text-3xl font-black text-white">{isAvailable ? (status.price || '---') : '---'}</div>
        </div>

        <div className={`mt-5 flex items-center text-[10px] font-black px-3 py-1.5 rounded-lg w-fit uppercase tracking-wider border ${
          isAvailable
            ? 'text-ps-neon-blue bg-ps-neon-blue/10 border-ps-neon-blue/20'
            : 'text-zinc-500 bg-zinc-800/40 border-zinc-700/20'
        }`}>
          <MapPin className="w-3 h-3 mr-1.5" />
          {status.is_location_dependent
            ? 'Darkstore stock'
            : status.is_pincode_dependent
              ? 'Local Area Stock'
              : 'National Stock'}
        </div>

        {/* Multiple Items Support */}
        {isAvailable && status.available_items && status.available_items.length > 1 && (
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Other available versions</p>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {status.available_items
                .filter(item => item.url !== status.product_url)
                .map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-bold text-zinc-200 line-clamp-1">{item.name}</span>
                    <span className="text-[11px] font-black text-ps-neon-blue shrink-0">{item.price}</span>
                  </div>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-ps-neon-blue hover:text-white uppercase flex items-center mt-1 transition-colors"
                  >
                    Buy this version <ExternalLink className="w-2.5 h-2.5 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="p-5 sm:p-6 pt-0">
        <a
          href={status.product_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('buy_click', { platform: status.platform })}
          className={`w-full ps-button py-3.5 sm:py-4 text-sm sm:text-base border transition-all ${
            isAvailable
              ? 'ps-button-primary' 
              : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/20 cursor-not-allowed pointer-events-none'
          }`}
        >
          {isAvailable ? (
            <>Buy Now <ExternalLink className="w-4 h-4 ml-2" /></>
          ) : status.note ? (
            'Not Available Here'
          ) : (
            'Not Available'
          )}
        </a>
      </div>

    </div>
  );
}
