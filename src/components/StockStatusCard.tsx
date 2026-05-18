'use client';

import { useState, useEffect } from 'react';
import { StockStatus } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';
import { ExternalLink, Check, X, MapPin, Gamepad2 } from 'lucide-react';

interface Props {
  status: StockStatus;
}

export default function StockStatusCard({ status }: Props) {
  const [mounted, setMounted] = useState(false);
  const isAvailable = status.in_stock;
  const isDeepLinkOnly = status.note === 'Deep link only';

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '---';
    }
  };

  return (
    <div className={`ps-card overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1 duration-300 ${(!isAvailable && !isDeepLinkOnly) && 'bg-gray-50/80'}`}>
      {/* Retailer Info */}
      <div className="p-5 sm:p-6 flex-1">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight truncate">{status.platform}</h3>
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest whitespace-nowrap">
              {isDeepLinkOnly ? 'Manual Check Required' : `Checked ${mounted ? formatTime(status.last_checked) : '...'}`}
            </p>
          </div>
          <div className={`status-pill shrink-0 ${
            isDeepLinkOnly
              ? 'bg-blue-100 text-blue-700'
              : isAvailable
                ? 'bg-green-100 text-green-700'
                : status.note
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
          }`}>
            {isDeepLinkOnly ? (
              <span className="flex items-center"><Gamepad2 className="w-3 h-3 mr-1" /> Link</span>
            ) : isAvailable ? (
              <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> Stock</span>
            ) : status.note ? (
              <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> N/A here</span>
            ) : (
              <span className="flex items-center"><X className="w-3 h-3 mr-1" /> Out</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-500 text-sm font-medium line-clamp-2 min-h-[2.5rem]">
            {isDeepLinkOnly ? 'Check real-time stock on mobile app' : (isAvailable ? (status.product_name || 'PS5 Console') : 'PS5 Console')}
          </p>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{isDeepLinkOnly ? 'APP ONLY' : (isAvailable ? (status.price || '---') : '---')}</div>
        </div>

        <div className={`mt-5 flex items-center text-[10px] font-black px-3 py-1.5 rounded-lg w-fit uppercase tracking-wider ${
          isDeepLinkOnly
            ? 'text-blue-700 bg-blue-50'
            : !isAvailable && status.note
              ? 'text-amber-700 bg-amber-50'
              : 'text-blue-600 bg-blue-50'
        }`}>
          <MapPin className="w-3 h-3 mr-1.5" />
          {isDeepLinkOnly
            ? 'Hyperlocal Delivery'
            : !isAvailable && status.note
              ? status.note
              : status.is_location_dependent
                ? 'Darkstore stock'
                : 'Local Area Stock'}
        </div>

        {/* Multiple Items Support */}
        {isAvailable && !isDeepLinkOnly && status.available_items && status.available_items.length > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Other available versions</p>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {status.available_items
                .filter(item => item.url !== status.product_url)
                .map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{item.name}</span>
                    <span className="text-[11px] font-black text-blue-600 shrink-0">{item.price}</span>
                  </div>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-blue-600 uppercase flex items-center hover:underline mt-1"
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
          className={`w-full ps-button py-3.5 sm:py-4 text-sm sm:text-base ${
            isAvailable || isDeepLinkOnly
              ? 'ps-button-primary' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
          }`}
        >
          {isDeepLinkOnly ? (
            <>Check on App <ExternalLink className="w-4 h-4 ml-2" /></>
          ) : isAvailable ? (
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
