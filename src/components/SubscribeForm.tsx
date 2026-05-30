'use client';

import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { MapPin, ExternalLink, Loader2, Mail, Send } from 'lucide-react';

type CheckResult = {
  platform: string;
  inStock: boolean;
  price: string | null;
  productUrl: string;
  deliveryTime?: string;
  listingCount?: number;
  note?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SubscribeForm({ onResults }: { onResults?: (pincode: string, results: any[], areaName?: string) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [pincode, setPincode] = useState('');
  const [areaName, setAreaName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState<'pending_confirmation' | 'already_active' | null>(null);
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);

  useEffect(() => {
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      return;
    }

    let active = true;
    const fetchAreaName = async () => {
      try {
        const response = await fetch(`/api/pincode-lookup?pincode=${pincode}`);
        if (response.ok) {
          const data = await response.json();
          if (active) {
            setAreaName(data.areaName || '');
          }
        }
      } catch (e) {
        console.error('Error fetching area name:', e);
      }
    };
    fetchAreaName();

    return () => {
      active = false;
    };
  }, [pincode]);

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
      if (onResults) onResults(pincode, data.results, areaName);
      
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

  const handleTelegramOnly = async () => {
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const response = await fetch('/api/telegram-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode }),
      });
      const data = await response.json();
      if (!response.ok || !data.telegramLink) {
        throw new Error(data.error || 'Telegram setup unavailable');
      }
      trackEvent('telegram_only_click', { pincode });
      window.open(data.telegramLink, '_blank', 'noopener,noreferrer');
      setStatus('idle');
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
    <div className="w-full max-w-lg mx-auto bg-theme-form backdrop-blur-md p-5 sm:p-8 rounded-3xl border border-theme-form shadow-2xl text-theme-page">
      {step === 1 ? (
        <form onSubmit={handleCheckStock} className="space-y-6">
          <div className="space-y-2">
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1 leading-relaxed">
              Enter your pincode to check real-time availability.
            </span>
            <div className="relative flex items-center">
              <MapPin className="w-5 h-5 text-zinc-400 absolute left-4 z-10" />
              <input
                type="text"
                required
                pattern="\d{6}"
                maxLength={6}
                placeholder="Enter Pincode"
                className="w-full pl-12 pr-6 py-4 sm:py-5 bg-theme-input border-2 border-theme-input rounded-2xl focus:outline-none transition-all font-bold text-theme-input text-base sm:text-lg placeholder-zinc-400 dark:placeholder-zinc-500"
                onChange={(e) => {
                  const val = e.target.value;
                  setPincode(val);
                  if (val.length !== 6) {
                    setAreaName('');
                  }
                }}
                disabled={status === 'loading'}
              />
            </div>
            {areaName && (
              <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 px-1 animate-slide-up">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {areaName}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || pincode.length !== 6}
            className="w-full ps-button ps-button-primary py-4 sm:py-5 text-base sm:text-lg cursor-pointer"
          >
            {status === 'loading' ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Check Availability'}
          </button>

          <div className="relative flex items-center my-1">
            <div className="flex-grow border-t border-theme-divider"></div>
            <span className="mx-3 text-[10px] font-bold text-theme-faint uppercase tracking-widest">Quick-commerce (10-min delivery)</span>
            <div className="flex-grow border-t border-theme-divider"></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <a
              href="https://blinkit.com/prn/sony-ps5-console-slim/prid/547392"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('qc_deeplink', { platform: 'blinkit' })}
              className="ps-button py-3 inline-flex items-center justify-center gap-1.5 bg-yellow-300 hover:bg-yellow-400 text-black font-bold text-[10px]"
            >
              <ExternalLink className="w-3 h-3" /> Blinkit
            </a>
            <a
              href="https://www.zepto.com/cn/electronics-appliances/ps5/cid/5c3d33b8-f346-4ade-9eeb-98ed6c409dd3/scid/7d29933e-06f5-43cb-9f5a-7eda3b18bc4f"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('qc_deeplink', { platform: 'zepto' })}
              className="ps-button py-3 inline-flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px]"
            >
              <ExternalLink className="w-3 h-3" /> Zepto
            </a>
            <a
              href="https://www.swiggy.com/instamart/p/sony-ps5-1tb-slim-cd-version-single-controller-console-BDFUT1SDIF"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('qc_deeplink', { platform: 'instamart' })}
              className="ps-button py-3 inline-flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px]"
            >
              <ExternalLink className="w-3 h-3" /> Instamart
            </a>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 leading-relaxed -mt-2">
            <p className="font-bold mb-1">⚠ No alerts for quick-commerce</p>
            <p>
              Blinkit, Zepto, and Instamart route stock by your exact darkstore — we can&apos;t check or alert
              from our servers. Tap above to check directly on their site.
            </p>
          </div>
        </form>
      ) : (
        <div className="space-y-6 sm:space-y-8 animate-slide-up">
          <div className="flex items-center justify-between border-b border-theme-divider pb-4">
            <h3 className="font-black text-sm sm:text-base uppercase tracking-tight text-theme-page">
              Results for {pincode} {areaName ? `(${areaName})` : ''}
            </h3>
            <button 
              onClick={() => { setStep(1); setCheckResults([]); setStatus('idle'); }}
              className="text-[10px] sm:text-xs font-bold text-ps-neon-blue hover:text-white transition-colors"
            >
              Change Location
            </button>
          </div>

          <div className="space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {checkResults.map((result) => (
              <div key={result.platform} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-theme-item bg-theme-item">
                <div className="flex flex-col">
                  <span className="font-bold text-xs sm:text-sm text-theme-page">{result.platform}</span>
                  {result.note ? (
                    <span className="text-[8px] font-medium text-amber-400 uppercase tracking-tighter">
                      {result.note}
                    </span>
                  ) : result.listingCount && result.listingCount > 0 ? (
                    <span className="text-[8px] font-medium text-zinc-400 uppercase tracking-tighter">
                      Scanned {result.listingCount} listings
                    </span>
                  ) : null}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-1 rounded border ${
                  result.inStock 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : result.note 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'dark:bg-zinc-800 dark:border-zinc-700/20 bg-zinc-100 border-zinc-200 text-zinc-500'
                }`}>
                  {result.inStock ? 'Available' : result.note ? 'N/A' : 'No Stock'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-theme-divider text-center">
            {status === 'success' ? (
              <div className="space-y-4 animate-bounce-in">
                {subStatus === 'pending_confirmation' ? (
                  <>
                    <div className="bg-green-600/90 border border-green-500/30 text-white p-4 rounded-2xl">
                      <p className="font-bold text-sm">📧 Confirmation email sent to {email}</p>
                      <p className="text-xs mt-1 opacity-90">Click the link in the email to activate alerts.</p>
                      <p className="text-[11px] mt-2 opacity-95 font-semibold text-green-200">⚠ Check your Spam/Promotions folder — confirmation and stock alerts may land there.</p>
                    </div>
                    {telegramLink && (
                      <div className="relative">
                        <div className="absolute inset-x-0 -top-2 flex justify-center">
                          <span className="bg-[var(--form-bg-solid)] text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3">Or — instant alerts</span>
                        </div>
                        <a
                          href={telegramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackEvent('telegram_connect_click', { pincode })}
                          className="w-full ps-button py-3.5 mt-4 inline-flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1c8dc2] text-white font-bold text-sm transition-all"
                        >
                          <Send className="w-4 h-4" /> Activate via Telegram (one tap)
                        </a>
                        <p className="text-[10px] text-zinc-400 mt-2">Opens Telegram, links your account, and skips email confirmation.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-green-600/90 border border-green-500/30 text-white p-4 rounded-2xl font-bold">{message}</div>
                )}
                {telegramLink && subStatus === 'already_active' && (
                  <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('telegram_connect_click', { pincode })}
                    className="w-full ps-button py-3 inline-flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1c8dc2] text-white font-bold text-sm transition-all"
                  >
                    <Send className="w-4 h-4" /> Also get alerts on Telegram
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <p className="font-black text-xs sm:text-sm uppercase tracking-tight text-center text-theme-page">
                  Get stock alerts for {pincode} {areaName ? `(${areaName})` : ''}
                </p>

                <button
                  type="button"
                  onClick={handleTelegramOnly}
                  disabled={status === 'loading'}
                  className="w-full ps-button py-4 inline-flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1c8dc2] text-white font-bold text-sm disabled:opacity-60 transition-all cursor-pointer"
                >
                  {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Get alerts on Telegram</>}
                </button>
                <p className="text-[10px] text-zinc-400 text-center -mt-2">One tap — no email required. Instant push.</p>

                <div className="relative flex items-center my-3">
                  <div className="flex-grow border-t border-theme-divider"></div>
                  <span className="mx-3 text-[10px] font-bold text-theme-faint uppercase tracking-widest">Or via email</span>
                  <div className="flex-grow border-t border-theme-divider"></div>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="relative flex items-center">
                    <Mail className="w-5 h-5 text-zinc-400 absolute left-4 z-10" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-6 py-4 bg-theme-input border-2 border-theme-input rounded-2xl focus:outline-none transition-all font-bold text-theme-input text-sm sm:text-base placeholder-zinc-400 dark:placeholder-zinc-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === 'loading'}
                    />
                  </div>
                  <button type="submit" disabled={status === 'loading'} className="w-full ps-button ps-button-primary py-4 cursor-pointer">
                    {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Notify Me by Email'}
                  </button>
                  <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
                    Check your Spam/Promotions folder if you don&apos;t see the confirmation email within a minute. Stock alerts may also land there — mark as Not Spam to ensure delivery.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold text-center">
          {message}
        </div>
      )}
    </div>
  );
}
