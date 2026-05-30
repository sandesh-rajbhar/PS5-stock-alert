'use client';

import { Mail, MessageSquare, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black/60 border-t border-white/[0.04] backdrop-blur-md py-16 sm:py-20 px-6 sm:px-10 lg:px-16 text-zinc-400 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
        {/* Brand Info & Disclaimer */}
        <div className="space-y-5">
          <h4 className="font-black tracking-tighter text-white text-xl">PS DEALS</h4>
          <p className="text-xs leading-relaxed text-zinc-500 font-medium">
            PS Deals is an independent tracker founded by <span className="text-zinc-300 font-semibold hover:text-ps-neon-blue transition-colors">Sandesh Rajbhar</span>, monitoring hardware and game deals across major Indian retailers. We are not affiliated, associated, or officially connected with Sony Group Corporation or PlayStation.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-ps-neon-blue" /> Secure & Ad-Free Tracker
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-5">
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-widest">Quick Navigation</h4>
            <div className="h-[2px] w-6 bg-zinc-800 mt-2 rounded-full"></div>
          </div>
          <ul className="space-y-3.5 text-xs font-semibold text-zinc-400">
            <li>
              <a href="#" className="hover:text-white transition-colors">Home / Search Pincode</a>
            </li>
            <li>
              <a href="#status" className="hover:text-white transition-colors">Live Store Status</a>
            </li>
            <li>
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                Telegram Alerts Bot <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
              </a>
            </li>
          </ul>
        </div>

        {/* Supported Stores */}
        <div className="space-y-5">
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-widest">Tracked Stores</h4>
            <div className="h-[2px] w-6 bg-zinc-800 mt-2 rounded-full"></div>
          </div>
          <ul className="space-y-3 text-xs text-zinc-500 font-semibold grid grid-cols-2 gap-x-4 gap-y-2.5">
            <li className="hover:text-zinc-300 transition-colors">Amazon</li>
            <li className="hover:text-zinc-300 transition-colors">Flipkart</li>
            <li className="hover:text-zinc-300 transition-colors">Croma</li>
            <li className="hover:text-zinc-300 transition-colors">Reliance Digital</li>
            <li className="hover:text-zinc-300 transition-colors">Vijay Sales</li>
            <li className="hover:text-zinc-300 transition-colors">Blinkit (QC)</li>
            <li className="hover:text-zinc-300 transition-colors">Zepto (QC)</li>
            <li className="hover:text-zinc-300 transition-colors">Instamart (QC)</li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div className="space-y-5">
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-widest">Support & Contact</h4>
            <div className="h-[2px] w-6 bg-zinc-800 mt-2 rounded-full"></div>
          </div>
          <p className="text-xs leading-relaxed text-zinc-500 font-medium">
            Have questions, feedback, or business inquiries? Get in touch with us:
          </p>
          <ul className="space-y-3.5 text-xs font-semibold text-zinc-400">
            <li>
              <a href="mailto:support@psdeals.in" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span>support@psdeals.in</span>
              </a>
            </li>
            <li>
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4 text-zinc-500" />
                <span>Telegram Support Channel</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright & Legal */}
      <div className="max-w-7xl mx-auto pt-10 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
          <span>© {new Date().getFullYear()} PS DEALS. FOUNDED BY <span className="text-zinc-400 font-extrabold hover:text-ps-neon-blue transition-colors">SANDESH RAJBHAR</span>. MADE WITH</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
          <span>FOR GAMERS IN INDIA.</span>
        </div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
          <span className="text-zinc-800">•</span>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
