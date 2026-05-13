'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { MapPin, Bell, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type CheckResult = {
  platform: string;
  inStock: boolean;
  price: string | null;
  productUrl: string;
  deliveryTime?: string;
};

export default function SubscribeForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);

  const handleCheckStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) return;
    
    setStatus('loading');
    setMessage('');
    
    try {
      const response = await fetch(`/api/live-check?pincode=${pincode}`);
      
      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.error || 'Failed to check stock');
      }

      const data = await response.json();
      setCheckResults(data.results);
      setStep(2);
      setStatus('idle');
      trackEvent('check_stock', { pincode });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
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
        setStatus('success');
        setMessage('You\'re subscribed! We\'ll alert you when stock arrives.');
        trackEvent('subscribe', { pincode });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to subscribe');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setStatus('error');
      setMessage(errorMessage);
    }
  };

  const isAnyInStock = checkResults.some(r => r.inStock);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 p-6 text-center text-white">
        <h2 className="text-xl font-bold flex items-center justify-center">
          {step === 1 ? (
            <>
              <MapPin className="w-5 h-5 mr-2" />
              Check Hyperlocal Stock
            </>
          ) : (
            <>
              <Bell className="w-5 h-5 mr-2" />
              Stock Results at {pincode}
            </>
          )}
        </h2>
      </div>

      <div className="p-6">
        {step === 1 ? (
          <form onSubmit={handleCheckStock} className="space-y-4">
            <p className="text-gray-600 text-center text-sm mb-4">
              Enter your pincode to check real-time availability on <strong>Blinkit</strong> and <strong>Zepto</strong>.
            </p>
            
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <div className="relative">
                <input
                  id="pincode"
                  type="text"
                  required
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="400001"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  disabled={status === 'loading'}
                />
                <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || pincode.length !== 6}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white transition flex items-center justify-center ${
                status === 'loading' ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'
              }`}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scanning Stores...
                </>
              ) : 'Check Availability'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Results Grid */}
            <div className="grid grid-cols-1 gap-3">
              {checkResults.map((result) => (
                <div 
                  key={result.platform}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    result.inStock ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div>
                    <div className="font-bold text-gray-800">{result.platform}</div>
                    <div className={`text-xs font-medium ${result.inStock ? 'text-green-600' : 'text-gray-500'}`}>
                      {result.inStock ? (
                        <span className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          In Stock ({result.deliveryTime})
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                  {result.inStock && (
                    <a 
                      href={result.productUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center hover:bg-green-700"
                    >
                      Buy Now
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Subscribe Section */}
            <div className="pt-4 border-t border-gray-100">
              {status === 'success' ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center text-sm font-medium border border-green-100">
                  {message}
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <p className="text-gray-600 text-center text-sm">
                    {isAnyInStock 
                      ? "Want alerts for other stores too?" 
                      : "No stock found. We'll alert you the moment it arrives!"}
                  </p>
                  
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === 'loading'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg flex items-center justify-center"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : 'Notify Me!'}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => { setStep(1); setCheckResults([]); setMessage(''); setStatus('idle'); }}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 font-medium"
                  >
                    ← Check another pincode
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center border border-red-100 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
