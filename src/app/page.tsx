import Link from 'next/link';
import Footer from '@/components/Footer';
import { MapPin, Bell, ArrowRight, Check, X } from 'lucide-react';

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

function MockGamePrice() {
  const rows = [
    { store: 'Amazon India',     price: '₹3,799', was: '₹4,999', best: true  },
    { store: 'PlayStation Store',price: '₹4,499', was: null,     best: false },
    { store: 'Flipkart',         price: '₹3,999', was: null,     best: false },
  ];
  return (
    <div className="relative w-full max-w-xs mx-auto">
      <span aria-hidden className="absolute -top-6 -right-6 text-[100px] font-black leading-none select-none pointer-events-none dark:text-amber-500/[0.05] text-amber-500/[0.06]">△</span>
      <div className="ps-card p-5 relative z-10">
        {/* Game header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-theme-divider">
          <div className="w-10 h-10 rounded-lg bg-ps-neon-blue/10 border border-ps-neon-blue/20 flex items-center justify-center font-black text-ps-neon-blue text-[10px] tracking-tight">
            GTA<br />VI
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-theme-page text-sm">GTA VI</div>
            <div className="text-[10px] text-theme-muted">PS5 Physical Edition</div>
          </div>
          <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest whitespace-nowrap">
            Historical Low
          </span>
        </div>
        {/* Price rows */}
        <div className="space-y-0">
          {rows.map(r => (
            <div key={r.store} className="flex items-center gap-3 py-2.5 border-b border-theme-divider last:border-0">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.best ? 'bg-green-400' : 'bg-theme-faint/20'}`} />
              <span className="text-xs text-theme-page flex-1">{r.store}</span>
              <div className="text-right">
                {r.was && <span className="text-[10px] text-theme-faint line-through mr-1.5">{r.was}</span>}
                <span className={`text-xs font-black ${r.best ? 'text-green-400' : 'text-theme-page'}`}>{r.price}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Alert footer */}
        <div className="mt-4 p-2.5 rounded-xl bg-amber-500/8 border border-amber-500/15 text-[10px] font-black text-amber-500 uppercase tracking-widest">
          Price drop alert available soon
        </div>
      </div>
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

/* ─── Stats ──────────────────────────────────────────────────── */
const STATS = [
  { value: '06',   label: 'Retailers\ntracked'       },
  { value: '<1s',  label: 'Alert delay\nguaranteed'  },
  { value: '₹0',   label: 'Cost,\nforever'           },
  { value: '5+',   label: 'PS5 models\nmonitored'    },
];

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

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 lg:gap-8 items-center py-20">

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
            <h1 className="font-black uppercase leading-[0.88] mb-8 text-theme-page">
              <span className="block text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-light tracking-tight opacity-60">
                Never miss
              </span>
              <span className="block text-5xl sm:text-6xl md:text-7xl xl:text-8xl tracking-tight dark:text-gradient text-gradient-light">
                a PS5
              </span>
              <span className="block text-5xl sm:text-6xl md:text-7xl xl:text-8xl tracking-tight">
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
                className="ps-button ps-button-primary w-auto inline-flex px-8 py-4 text-sm"
              >
                Check Stock Now
              </Link>
              <Link
                href="/news"
                className="ps-button w-auto inline-flex items-center gap-2 px-8 py-4 text-sm bg-theme-card border border-theme-card text-theme-page hover:border-theme-nav transition-colors"
              >
                Latest PS5 News
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Social proof — PS symbols, no generic icons */}
            <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-theme-faint">
              {[
                { sym: '○', t: '6 Stores Tracked' },
                { sym: '□', t: 'Sub-1s Alerts'    },
                { sym: '△', t: '₹0 Cost Forever'  },
              ].map(({ sym, t }) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="text-ps-neon-blue font-black text-base leading-none">{sym}</span>
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

      {/* ══ STATS ══════════════════════════════════════════════ */}
      <section className="bg-stats py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-black text-ps-neon-blue uppercase tracking-[0.25em] text-center mb-14">
            By the numbers
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-theme-divider border border-theme-divider rounded-2xl overflow-hidden">
            {STATS.map(({ value, label }) => (
              <div key={value} className="flex flex-col items-center justify-center text-center py-10 px-4 bg-theme-card">
                <span className="text-5xl md:text-6xl font-black text-ps-neon-blue leading-none mb-3">
                  {value}
                </span>
                <span className="text-[10px] font-black text-theme-faint uppercase tracking-widest whitespace-pre-line leading-relaxed">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═══════════════════════════════════════════ */}
      {FEATURES.map(({ n, accent, label, headline, body, cta, href, visual, flip }, idx) => (
        <section
          key={n}
          className={`py-24 px-6 md:px-12 lg:px-20 ${idx % 2 === 1 ? 'bg-hero-alt' : 'bg-hero'}`}
        >
          <div className="max-w-6xl mx-auto">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>

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

      {/* ══ GAME DEALS TEASER ══════════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-20 bg-hero-alt">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Text */}
            <div className="relative">
              <span className="absolute -top-10 -left-4 text-[120px] font-black leading-none select-none pointer-events-none opacity-[0.04] text-amber-500">
                04
              </span>
              <div className="relative">
                <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-4 border text-amber-500 bg-amber-500/10 border-amber-500/25">
                  Coming Next
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-theme-page leading-tight mb-5">
                  Game price comparison.<br />Historical lows. Deal alerts.
                </h2>
                <p className="text-base text-theme-muted leading-relaxed mb-8 max-w-md">
                  We&apos;re building cross-platform game price tracking for PS5 titles across Amazon, Flipkart, and PlayStation Store. Historical low badges, wishlist price alerts, and a deal hub — free.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['GTA VI', 'Spider-Man 2', 'FC 26', 'God of War', 'NBA 2K26', 'Elden Ring'].map(g => (
                    <span key={g} className="text-[10px] font-bold px-2.5 py-1 rounded-md border border-theme-divider text-theme-muted bg-theme-card">
                      {g}
                    </span>
                  ))}
                </div>
                <Link href="/tracker#subscribe" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-500 group">
                  Get Early Access <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            {/* Visual */}
            <div className="flex justify-center lg:justify-end">
              <MockGamePrice />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
