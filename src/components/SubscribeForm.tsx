'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { MapPin, Bell, ExternalLink, CheckCircle, AlertCircle, Loader2, Mail, ArrowRight, Send } from 'lucide-react';

type CheckResult = {
  platform: string;
  inStock: boolean;
  price: string | null;
  productUrl: string;
  deliveryTime?: string;
  listingCount?: number;
  note?: string;
};

export default function SubscribeForm({ onResults }: { onResults?: (pincode: string, results: any[]) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState<'pending_confirmation' | 'already_active' | null>(null);
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);

  const handleCheckStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) return;
    
    setStatus('loading');
    setMessage('');
    
    try {
      const response = await fetch(`/api/live-check?pincode=${pincode}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to check stock');

      setCheckResults(data.results);
      if (onResults) onResults(pincode, data.results);
      
      setStep(2);
      setStatus('idle');
      trackEvent('check_stock', { pincode });

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('status')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong.';
      setStatus('error');
      setMessage(errorMessage);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pincode }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('success');
        setSubStatus(data.status || null);
        setTelegramLink(data.telegramLink || null);
        setMessage(
          data.status === 'already_active'
            ? 'You\'re already subscribed!'
            : 'Almost there — activate alerts below.'
        );
        trackEvent('subscribe', { pincode });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to subscribe');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong.';
      setStatus('error');
      setMessage(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-5 sm:p-8 rounded-3xl border border-gray-100 shadow-xl">
      {step === 1 ? (
        <form onSubmit={handleCheckStock} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black mb-2 uppercase tracking-tight">Check Local Stores</h2>
            <p className="text-gray-500 text-xs sm:text-sm">Enter your pincode to see what&apos;s in stock near you right now.</p>
          </div>
          
          <div className="relative flex items-center">
            <MapPin className="w-5 h-5 text-gray-400 absolute left-4 z-10" />
            <input
              type="text"
              required
              pattern="\d{6}"
              maxLength={6}
              placeholder="Enter Pincode"
              className="w-full pl-12 pr-6 py-4 sm:py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-base sm:text-lg"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              disabled={status === 'loading'}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || pincode.length !== 6}
            className="w-full ps-button ps-button-primary py-4 sm:py-5 text-base sm:text-lg"
          >
            {status === 'loading' ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Check Availability'}
          </button>
        </form>
      ) : (
        <div className="space-y-6 sm:space-y-8 animate-slide-up">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-black text-sm sm:text-base uppercase tracking-tight">Results for {pincode}</h3>
            <button 
              onClick={() => { setStep(1); setCheckResults([]); setStatus('idle'); }}
              className="text-[10px] sm:text-xs font-bold text-blue-600 hover:underline"
            >
              Change Location
            </button>
          </div>

          <div className="space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {checkResults.map((result) => (
              <div key={result.platform} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex flex-col">
                  <span className="font-bold text-xs sm:text-sm">{result.platform}</span>
                  {result.note ? (
                    <span className="text-[8px] font-medium text-amber-600 uppercase tracking-tighter">
                      {result.note}
                    </span>
                  ) : result.listingCount && result.listingCount > 0 ? (
                    <span className="text-[8px] font-medium text-gray-400 uppercase tracking-tighter">
                      Scanned {result.listingCount} listings
                    </span>
                  ) : null}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-1 rounded ${result.inStock ? 'bg-green-100 text-green-700' : result.note ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-400'}`}>
                  {result.inStock ? 'Available' : result.note ? 'N/A' : 'No Stock'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100 text-center">
            {status === 'success' ? (
              <div className="space-y-4 animate-bounce-in">
                {subStatus === 'pending_confirmation' ? (
                  <>
                    <div className="bg-green-600 text-white p-4 rounded-2xl">
                      <p className="font-bold text-sm">📧 Confirmation email sent to {email}</p>
                      <p className="text-xs mt-1 opacity-90">Click the link in the email to activate alerts.</p>
                    </div>
                    {telegramLink && (
                      <div className="relative">
                        <div className="absolute inset-x-0 -top-2 flex justify-center">
                          <span className="bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3">Or — instant alerts</span>
                        </div>
                        <a
                          href={telegramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackEvent('telegram_connect_click', { pincode })}
                          className="w-full ps-button py-3.5 mt-4 inline-flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1c8dc2] text-white font-bold text-sm"
                        >
                          <Send className="w-4 h-4" /> Activate via Telegram (one tap)
                        </a>
                        <p className="text-[10px] text-gray-400 mt-2">Opens Telegram, links your account, and skips email confirmation.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-green-600 text-white p-4 rounded-2xl font-bold">{message}</div>
                )}
                {telegramLink && subStatus === 'already_active' && (
                  <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('telegram_connect_click', { pincode })}
                    className="w-full ps-button py-3 inline-flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1c8dc2] text-white font-bold text-sm"
                  >
                    <Send className="w-4 h-4" /> Also get alerts on Telegram
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <p className="font-black text-xs sm:text-sm uppercase tracking-tight">Get Email Alerts</p>
                <div className="relative flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-4 z-10" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-sm sm:text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                  />
                </div>
                <button type="submit" className="w-full ps-button ps-button-primary py-4">
                  {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Notify Me'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center border border-red-100">
          {message}
        </div>
      )}
    </div>
  );
}
