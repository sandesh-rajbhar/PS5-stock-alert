import Link from 'next/link';
import Footer from '@/components/Footer';
import { MapPin, Bell, ArrowRight, Check, X } from 'lucide-react';
import { GAMES } from '@/data/games';

/* ─── Mock product-demo components (static, no JS) ──────────── */

function MockScanner() {
  const rows = [
    { store: 'Amazon India',     ok: true,  price: '₹54,990' },
    { store: 'Flipkart',         ok: false, price: '---'     },
    { store: 'Croma',            ok: true,  price: '₹55,490' },
  ];
  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* Decorative PS symbol watermark */}
      <span
        aria-hidden
        className="absolute -top-8 -right-4 text-[140px] font-black leading-none select-none pointer-events-none
                   dark:text-ps-neon-blue/[0.06] text-ps-neon-blue/[0.08]"
      >
        ○
      </span>
      <span
        aria-hidden
        className="absolute -bottom-4 -left-6 text-[80px] font-black leading-none select-none pointer-events-none
                   dark:text-ps-neon-blue/[0.05] text-ps-neon-blue/[0.06]"
      >
        □
      </span>

      {/* Scanner card */}
      <div className="ps-card p-5 relative z-10">
        {/* Pincode row */}
        <div className="flex items-center gap-3 p-3 bg-theme-input rounded-xl border border-theme-input mb-5">
          <MapPin className="w-4 h-4 text-ps-neon-blue shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-black text-theme-page text-sm">400001</div>
            <div className="text-[10px] text-theme-muted truncate">Mumbai, Maharashtra</div>
          </div>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
        </div>

        {/* Result rows */}
        <div className="space-y-1 mb-5">
          {rows.map(r => (
            <div key={r.store} className="flex items-center gap-3 py-2.5 px-1 border-b border-theme-divider last:border-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${r.ok ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {r.ok
                  ? <Check className="w-3 h-3 text-green-400" />
                  : <X    className="w-3 h-3 text-red-400" />}
              </div>
              <span className="text-xs font-bold text-theme-page flex-1">{r.store}</span>
              <span className={`text-xs font-black ${r.ok ? 'text-ps-neon-blue' : 'text-theme-faint'}`}>{r.price}</span>
            </div>
          ))}
        </div>

        {/* Alert badge */}
        <div className="p-2.5 rounded-xl bg-ps-neon-blue/10 border border-ps-neon-blue/20 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-ps-neon-blue shrink-0" />
          <span className="text-[10px] font-black text-ps-neon-blue uppercase tracking-widest">Alert active · 400001</span>
        </div>
      </div>
    </div>
  );
}

function MockAlert() {
  return (
    <div className="relative w-full max-w-xs mx-auto space-y-3">
      <span
        aria-hidden
        className="absolute top-1/2 -right-8 -translate-y-1/2 text-[100px] font-black leading-none select-none pointer-events-none
                   dark:text-green-500/[0.05] text-green-500/[0.06]"
      >
        △
      </span>

      {/* Telegram notification mock */}
      <div className="ps-card p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#229ED9] flex items-center justify-center shrink-0 text-white font-black text-sm">
          PS
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black text-theme-faint uppercase tracking-widest mb-1">PS Deals Bot · Telegram</div>
          <div className="text-sm font-black text-theme-page leading-snug">⚡ PS5 Slim Disc IN STOCK!</div>
          <div className="text-xs text-theme-muted mt-0.5">Amazon India · ₹54,990</div>
          <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-ps-neon-blue uppercase tracking-widest">
            Buy Now <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Email notification mock */}
      <div className="ps-card p-4 flex items-start gap-3 opacity-70">
        <div className="w-9 h-9 rounded-xl bg-ps-neon-blue/10 border border-ps-neon-blue/20 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-ps-neon-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black text-theme-faint uppercase tracking-widest mb-1">Email Alert · psdeals.in</div>
          <div className="text-sm font-black text-theme-page leading-snug">Stock alert for pincode 400001</div>
          <div className="text-xs text-theme-muted mt-0.5">Croma · PS5 Disc Slim · ₹55,490</div>
        </div>
      </div>
    </div>
  );
}

function MockNews() {
  const cards = [
    { source: 'Push Square',      color: '#f97316', title: 'PS5 Pro Confirmed for India Launch — Price & Date Revealed' },
    { source: 'PlayStation Blog', color: '#0070ff', title: 'August PS Plus Games Announced: Three Big Titles Incoming'   },
    { source: 'VGC',              color: '#a855f7', title: 'GTA VI Release Window Narrowed Down for PS5'                 },
  ];
  return (
    <div className="relative w-full max-w-xs mx-auto space-y-3">
      <span
        aria-hidden
        className="absolute -top-6 -left-8 text-[90px] font-black leading-none select-none pointer-events-none
                   dark:text-purple-500/[0.06] text-purple-500/[0.07]"
      >
        ✕
      </span>
      {cards.map((c, i) => (
        <div
          key={c.source}
          className="ps-card p-4 flex items-start gap-3"
          style={{ opacity: 1 - i * 0.2, transform: `scale(${1 - i * 0.02})`, transformOrigin: 'top center' }}
        >
          <span
            className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-white mt-0.5"
            style={{ backgroundColor: c.color }}
          >
            {c.source.split(' ')[0]}
          </span>
          <p className="text-xs font-bold text-theme-page leading-snug line-clamp-2">{c.title}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Stores marquee ─────────────────────────────────────────── */
const STORES = ['AMAZON', 'FLIPKART', 'CROMA', 'RELIANCE DIGITAL', 'VIJAY SALES', 'BLINKIT', 'ZEPTO', 'INSTAMART'];

function StoresMarquee() {
  const items = [...STORES, ...STORES];
  return (
    <div className="bg-ps-neon-blue overflow-hidden py-3 select-none">
      <div className="marquee-stores">
        {items.map((s, i) => (
          <span key={i} className="flex items-center gap-4 mx-6 text-[11px] font-black text-white uppercase tracking-[0.15em] whitespace-nowrap">
            {s}
            <span className="w-1 h-1 rounded-full bg-white/40 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}


/* ─── Features ───────────────────────────────────────────────── */
const FEATURES = [
  {
    n: '01',
    accent: '#0070ff',
    label: 'PS5 Scanner',
    headline: '10 seconds from pincode to results.',
    body: 'Enter your pincode and our scanner checks 6 Indian retailers simultaneously — showing you exactly what\'s in stock near your delivery address, not just nationally.',
    cta: 'Try the Scanner',
    href: '/tracker',
    visual: <MockScanner />,
    flip: false,
  },
  {
    n: '02',
    accent: '#22c55e',
    label: 'Instant Alerts',
    headline: "You'll know before the listing goes viral.",
    body: 'Subscribe with email or Telegram. We watch 24/7 and push an alert the moment stock appears — before scalpers, before the deal sites, before anyone else.',
    cta: 'Set Up Alerts',
    href: '/tracker#subscribe',
    visual: <MockAlert />,
    flip: true,
  },
  {
    n: '03',
    accent: '#a855f7',
    label: 'PS5 News Hub',
    headline: 'Everything PS5. One feed.',
    body: 'Aggregated from Push Square, PlayStation Blog, and VGC. No algorithm. No clutter. Just the most important PS5 news, refreshed every hour.',
    cta: 'Read Today\'s News',
    href: '/news',
    visual: <MockNews />,
    flip: false,
  },
];

/* ─── Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main className="bg-hero text-theme-page overflow-x-hidden">

      {/* ══ HERO ═══════════════════════════════════════════════ */}
      <section className="relative min-h-[95vh] flex items-center px-6 md:px-12 lg:px-20 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 70% at 100% 50%, rgba(0,112,255,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 40% 40% at 0% 80%, rgba(0,48,135,0.08) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-8 items-center py-14 md:py-20">

          {/* ── Left: Copy ── */}
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ps-neon-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-ps-neon-blue" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-ps-neon-blue">
                Live · PS5 Tracker India
              </span>
            </div>

            {/* Headline — staggered weights */}
            <h1 className="font-black uppercase leading-[0.9] mb-8 text-theme-page">
              <span className="block text-4xl sm:text-5xl md:text-7xl xl:text-8xl font-light tracking-tight opacity-60">
                Never miss
              </span>
              <span className="block text-4xl sm:text-5xl md:text-7xl xl:text-8xl tracking-tight dark:text-gradient text-gradient-light">
                a PS5
              </span>
              <span className="block text-4xl sm:text-5xl md:text-7xl xl:text-8xl tracking-tight">
                restock.
              </span>
            </h1>

            {/* Sub */}
            <p className="text-base md:text-lg text-theme-muted leading-relaxed max-w-lg mb-10">
              Real-time availability across Amazon, Flipkart, Croma &amp; more.
              Instant email &amp; Telegram alerts. Completely free.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-14">
              <Link
                href="/tracker"
                className="ps-button ps-button-primary w-full sm:w-auto inline-flex px-8 py-4 text-sm"
              >
                Check Stock Now
              </Link>
              <Link
                href="/news"
                className="ps-button w-full sm:w-auto inline-flex items-center gap-2 px-8 py-4 text-sm bg-theme-card border border-theme-card text-theme-page hover:border-theme-nav transition-colors"
              >
                Latest PS5 News
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Social proof — PS symbols, no generic icons */}
            <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-theme-faint">
              {[
                {
                  svg: <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8"/>,
                  t: '6 Stores Tracked',
                },
                {
                  svg: <rect x="1.5" y="1.5" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8"/>,
                  t: 'Sub-1s Alerts',
                },
                {
                  svg: <polygon points="7,1.5 13,12.5 1,12.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>,
                  t: '₹0 Cost Forever',
                },
              ].map(({ svg, t }) => (
                <span key={t} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" className="text-ps-neon-blue shrink-0" aria-hidden>
                    {svg}
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: Product demo ── */}
          <div className="hidden lg:block">
            <MockScanner />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30">
          <span className="text-[9px] font-black uppercase tracking-widest text-theme-faint">Scroll</span>
          <div className="w-px h-8 bg-theme-faint" />
        </div>
      </section>

      {/* ══ MARQUEE ════════════════════════════════════════════ */}
      <StoresMarquee />


      {/* ══ FEATURES ═══════════════════════════════════════════ */}
      {FEATURES.map(({ n, accent, label, headline, body, cta, href, visual, flip }, idx) => (
        <section
          key={n}
          className={`py-24 px-6 md:px-12 lg:px-20 ${idx % 2 === 1 ? 'bg-hero-alt' : 'bg-hero'}`}
        >
          <div className="max-w-6xl mx-auto">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>

              {/* Text side */}
              <div className="relative">
                {/* Big watermark number */}
                <span
                  className="absolute -top-10 -left-4 text-[120px] font-black leading-none select-none pointer-events-none opacity-[0.04]"
                  style={{ color: accent }}
                >
                  {n}
                </span>

                <div className="relative">
                  <span
                    className="inline-block text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-4 border"
                    style={{ color: accent, backgroundColor: `${accent}12`, borderColor: `${accent}25` }}
                  >
                    {label}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-theme-page leading-tight mb-5">
                    {headline}
                  </h2>
                  <p className="text-base text-theme-muted leading-relaxed mb-8 max-w-md">
                    {body}
                  </p>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest group"
                    style={{ color: accent }}
                  >
                    {cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Visual side */}
              <div className={`flex items-center justify-center ${flip ? 'lg:justify-start' : 'lg:justify-end'}`}>
                {visual}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ══ GAMES BETA HIGHLIGHT ═══════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-20 bg-hero-alt">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">
            {/* Text */}
            <div className="relative">
              <span aria-hidden className="absolute -top-10 -left-4 text-[120px] font-black leading-none select-none pointer-events-none opacity-[0.04] text-amber-500">04</span>
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25">
                    Beta — Live Now
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-theme-page leading-tight mb-5">
                  Browse 60+ PS5 games.<br />Compare prices. Find deals.
                </h2>
                <p className="text-base text-theme-muted leading-relaxed mb-8 max-w-md">
                  Search by name or genre. Direct links to Amazon &amp; Flipkart listings. Live price tracking and historical lows coming in the next update.
                </p>
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-500 group"
                >
                  Browse PS5 Games <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            {/* Mini game cards preview */}
            <div className="grid grid-cols-2 gap-3">
              {['marvels-spider-man-2', 'elden-ring', 'god-of-war-ragnarok', 'hogwarts-legacy']
                .map(slug => GAMES.find(g => g.slug === slug))
                .filter(Boolean)
                .map(g => (
                  <div key={g!.slug} className={`ps-card overflow-hidden relative bg-gradient-to-br ${g!.gradient} h-28`}>
                    {g!.coverUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g!.coverUrl} alt={g!.title} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-between p-3">
                      <div>
                        {g!.exclusive && (
                          <span className="self-start text-[8px] font-black uppercase tracking-widest bg-ps-neon-blue text-white px-1.5 py-0.5 rounded-full">PS5 Only</span>
                        )}
                      </div>
                      <div>
                        <p className="text-[8px] text-white/50 font-black uppercase tracking-widest">{g!.genre[0]}</p>
                        <p className="text-xs font-black text-white leading-tight line-clamp-2">{g!.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
