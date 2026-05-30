import Link from 'next/link';
import Footer from '@/components/Footer';
import { Search, Bell, Newspaper, ArrowRight, Zap, ShieldCheck, MapPin, ChevronRight } from 'lucide-react';

const STORES = ['Amazon', 'Flipkart', 'Croma', 'Reliance Digital', 'Vijay Sales'];
const QC_STORES = ['Blinkit', 'Zepto', 'Instamart'];

const STEPS = [
  {
    n: '01',
    icon: MapPin,
    title: 'Enter Pincode',
    desc: 'Your local pincode lets us check store-specific availability in your delivery zone.',
  },
  {
    n: '02',
    icon: Search,
    title: 'We Scan Instantly',
    desc: 'Our bot checks Amazon, Flipkart, Croma, Reliance Digital, and Vijay Sales in real-time.',
  },
  {
    n: '03',
    icon: Bell,
    title: 'Get Alerted',
    desc: 'Instant email or Telegram push notification the moment stock appears — before it sells out.',
  },
];

const FEATURES = [
  {
    icon: Search,
    label: 'PS5 Scanner',
    headline: 'Real-time stock check across 6+ Indian retailers',
    desc: 'Enter your pincode and see live availability — national and local — across every major store.',
    cta: 'Check Stock Now',
    href: '/tracker',
    accent: '#0070ff',
  },
  {
    icon: Bell,
    label: 'Instant Alerts',
    headline: 'Email & Telegram push the moment stock drops',
    desc: 'Subscribe once. We watch 24/7. You get an alert faster than anyone else — guaranteed.',
    cta: 'Subscribe for Alerts',
    href: '/tracker#subscribe',
    accent: '#22c55e',
  },
  {
    icon: Newspaper,
    label: 'PS5 News',
    headline: 'Latest from Push Square, PlayStation Blog & VGC',
    desc: 'Aggregated PS5 news, game announcements, and deals — one place, always fresh.',
    cta: 'Read Latest News',
    href: '/news',
    accent: '#a855f7',
  },
];

export default function LandingPage() {
  return (
    <main className="bg-theme-page text-theme-page overflow-hidden">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 py-20">
        {/* Glow background */}
        <div className="hero-glow absolute inset-0 pointer-events-none" />

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-6 animate-slide-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ps-neon-blue opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ps-neon-blue" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ps-neon-blue">
            Live · PS5 Tracker India
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight leading-[0.88] mb-6 animate-slide-up"
          style={{ animationDelay: '0.05s' }}
        >
          <span className="dark:text-gradient text-gradient-light">Never Miss</span>
          <br />
          <span className="text-theme-page">a PS5 Deal.</span>
        </h1>

        {/* Sub */}
        <p
          className="text-base sm:text-lg md:text-xl text-theme-muted max-w-xl mx-auto mb-10 leading-relaxed animate-slide-up font-medium"
          style={{ animationDelay: '0.1s' }}
        >
          India&apos;s smartest PS5 stock tracker. Real-time availability,
          instant alerts, and the latest deals — completely free.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center gap-3 mb-16 animate-slide-up"
          style={{ animationDelay: '0.15s' }}
        >
          <Link
            href="/tracker"
            className="ps-button ps-button-primary px-8 py-4 text-sm animate-glow-pulse w-auto inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Check Stock Now
          </Link>
          <Link
            href="/news"
            className="ps-button px-8 py-4 text-sm bg-theme-card border border-theme-card text-theme-page hover:border-ps-neon-blue/40 w-auto inline-flex items-center gap-2 transition-colors"
          >
            <Newspaper className="w-4 h-4" /> Latest PS5 News
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[10px] font-black uppercase tracking-widest text-theme-faint animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          {[
            { icon: ShieldCheck, text: '6 Stores Tracked' },
            { icon: Zap,         text: 'Instant Alerts'   },
            { icon: Bell,        text: '100% Free'         },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-ps-neon-blue" />
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-theme-section border-t border-theme-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-ps-neon-blue uppercase tracking-[0.2em] mb-2">Simple by design</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-theme-page">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-transparent via-ps-neon-blue/30 to-transparent" />

            {STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-ps-neon-blue/10 border border-ps-neon-blue/20 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-ps-neon-blue" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-black text-ps-neon-blue bg-theme-page border border-ps-neon-blue/30 rounded-full w-6 h-6 flex items-center justify-center">
                    {n}
                  </span>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-theme-page">{title}</h3>
                <p className="text-sm text-theme-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-ps-neon-blue uppercase tracking-[0.2em] mb-2">Everything in one place</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-theme-page">What You Get</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, label, headline, desc, cta, href, accent }) => (
              <Link
                key={label}
                href={href}
                className="ps-card p-6 flex flex-col gap-5 group cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}30` }}
                >
                  <Icon className="w-6 h-6" style={{ color: accent }} />
                </div>

                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: accent }}>
                    {label}
                  </span>
                  <h3 className="text-base font-black text-theme-page mt-1 leading-snug">{headline}</h3>
                  <p className="text-sm text-theme-muted mt-2 leading-relaxed">{desc}</p>
                </div>

                <div
                  className="mt-auto flex items-center text-[11px] font-black uppercase tracking-widest gap-1 transition-gap group-hover:gap-2"
                  style={{ color: accent }}
                >
                  {cta} <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stores ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-theme-section border-t border-theme-section">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-black text-ps-neon-blue uppercase tracking-[0.2em] mb-8">Store coverage</p>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {STORES.map(s => (
              <span
                key={s}
                className="px-4 py-2 rounded-xl border border-theme-card bg-theme-card text-sm font-bold text-theme-page"
              >
                {s}
              </span>
            ))}
          </div>

          <p className="text-[10px] font-black text-theme-faint uppercase tracking-widest mb-3">
            Quick-commerce (check directly on their apps)
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {QC_STORES.map(s => (
              <span key={s} className="px-3 py-1.5 rounded-lg border border-theme-card bg-theme-card text-xs font-bold text-theme-muted">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-28 px-4 text-center relative overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none rotate-180" />
        <div className="max-w-2xl mx-auto relative">
          <p className="text-[10px] font-black text-ps-neon-blue uppercase tracking-[0.2em] mb-4">Ready?</p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-theme-page leading-[0.9] mb-6">
            Start tracking.<br />It&apos;s free.
          </h2>
          <p className="text-theme-muted mb-10 text-base leading-relaxed">
            Enter your pincode, subscribe once, and we handle the rest.
            No app. No payment. Just alerts.
          </p>
          <Link
            href="/tracker"
            className="ps-button ps-button-primary px-10 py-5 text-base w-auto inline-flex items-center gap-2"
          >
            <Search className="w-5 h-5" /> Open PS5 Scanner
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
