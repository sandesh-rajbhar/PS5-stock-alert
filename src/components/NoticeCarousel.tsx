'use client';

export default function NoticeCarousel() {
  const announcements = [
    {
      icon: '🏪',
      text: 'OFFLINE RESTOCK: Croma & Reliance Digital offline stores are actively restocking. Visit your local stores directly if online shows out of stock!'
    },
    {
      icon: '⚡',
      text: 'TELEGRAM ALERTS: Connect our Telegram bot for instant 1-second push notifications as soon as stock is detected online.'
    },
    {
      icon: '🛍️',
      text: 'QUICK COMMERCE: Blinkit, Zepto, and Instamart route consoles from micro-warehouses. Use the deep-links above to check instantly.'
    }
  ];

  // Duplicate items to ensure smooth, seamless infinite scrolling loop
  const tickerItems = [...announcements, ...announcements];

  return (
    <div className="w-full bg-theme-nav border-y border-theme-nav backdrop-blur-md relative overflow-hidden py-2 select-none">
      <style>{`
        @keyframes ticker-scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll 35s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        {/* Ticker Window */}
        <div className="flex-1 overflow-hidden relative">
          {/* Faders to blend text at boundary edges */}
          <div className="ticker-fader-left absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"></div>
          <div className="ticker-fader-right absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"></div>

          <div className="ticker-track">
            {tickerItems.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2.5 mx-12 text-xs sm:text-sm font-semibold tracking-wide text-zinc-400 font-mono whitespace-nowrap cursor-help"
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="dark:text-zinc-200 text-zinc-700 font-bold">{item.text.split(':')[0]}:</span>
                <span>{item.text.split(':')[1]}</span>
                <span className="dark:text-zinc-800 text-zinc-300 ml-6 select-none font-sans">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
