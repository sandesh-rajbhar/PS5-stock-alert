'use client';

import { StockStatus } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';

interface Props {
  status: StockStatus;
}

export default function StockStatusCard({ status }: Props) {
  const isQuickCommerce = ['blinkit', 'zepto'].includes(status.platform);
  
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg capitalize text-gray-800">{status.platform}</h3>
          <p className="text-xs text-gray-400">
            Last checked: {new Date(status.last_checked).toLocaleTimeString()}
          </p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
          status.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {status.in_stock ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 line-clamp-1">
          {status.product_name || 'PS5 Console'}
        </p>
        <p className="text-xl font-bold text-gray-900 mt-1">
          {status.price || '---'}
        </p>
      </div>

      {isQuickCommerce && (
        <div className="mb-4 px-3 py-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 font-medium flex items-center">
            <span className="mr-1">📍</span> Stock varies by pincode
          </p>
        </div>
      )}

      <a
        href={status.product_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
           trackEvent('buy_click', { platform: status.platform });
        }}
        className={`w-full block text-center py-2 rounded-lg font-semibold transition ${
          status.in_stock 
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
        }`}
      >
        {status.in_stock ? 'Buy Now →' : 'Out of Stock'}
      </a>
    </div>
  );
}
