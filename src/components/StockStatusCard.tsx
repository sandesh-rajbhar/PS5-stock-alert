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
    <div className={`ps-card overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1 duration-300 ${!isAvailable && 'bg-gray-50/80'}`}>
      {/* Retailer Info */}
      <div className="p-5 sm:p-6 flex-1">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight truncate">{status.platform}</h3>
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest whitespace-nowrap">
              Checked {mounted ? formatTime(status.last_checked) : '...'}
            </p>
          </div>
          <div className={`status-pill shrink-0 ${
            isAvailable
              ? 'bg-green-100 text-green-700'
              : status.note
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
          }`}>
            {isAvailable ? (
              <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> Stock</span>
            ) : status.note ? (
              <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> N/A here</span>
            ) : (
              <span className="flex items-center"><X className="w-3 h-3 mr-1" /> Out</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-500 text-sm font-medium line-clamp-2 min-h-[2.5rem]">{isAvailable ? (status.product_name || 'PS5 Console') : 'PS5 Console'}</p>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{isAvailable ? (status.price || '---') : '---'}</div>
        </div>

        <div className={`mt-5 flex items-center text-[10px] font-black px-3 py-1.5 rounded-lg w-fit uppercase tracking-wider ${
          !isAvailable && status.note
            ? 'text-amber-700 bg-amber-50'
            : 'text-blue-600 bg-blue-50'
        }`}>
          <MapPin className="w-3 h-3 mr-1.5" />
          {!isAvailable && status.note
            ? status.note
            : status.is_location_dependent
              ? 'Darkstore stock'
              : 'Local Area Stock'}
        </div>
      </div>

      {/* Action */}
      <div className="p-5 sm:p-6 pt-0">
        <a
          href={status.product_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('buy_click', { platform: status.platform })}
          className={`w-full ps-button py-3.5 sm:py-4 text-sm sm:text-base ${
            isAvailable 
              ? 'ps-button-primary' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
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
