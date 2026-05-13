'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationBanner() {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Simulate real-time social proof
    const timer = setTimeout(() => {
      setCount(Math.floor(Math.random() * 20) + 5);
      setVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-bounce-in">
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-slate-700">
        <div className="bg-blue-600 p-2 rounded-full">
          <Bell className="w-4 h-4 text-white" />
        </div>
        <p className="text-sm font-medium">
          <span className="text-blue-400 font-bold">{count} people</span> just joined the alerts!
        </p>
        <button 
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-white transition"
        >
          ×
        </button>
      </div>
    </div>
  );
}
