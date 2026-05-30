'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const LINKS = [
  { href: '/',        label: 'Home',        mobile: null      }, // logo already = home on mobile
  { href: '/tracker', label: 'PS5 Scanner', mobile: 'Scanner' },
  { href: '/news',    label: 'News',        mobile: 'News'    },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-theme-nav backdrop-blur-md border-b border-theme-nav">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="font-black tracking-tighter text-lg text-theme-page uppercase shrink-0 hover:text-ps-neon-blue transition-colors">
          PS DEALS
        </Link>

        {/* Links */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map(({ href, label, mobile }) => {
            const active = pathname === href;
            if (mobile === null) {
              // Hide on mobile — logo covers home navigation
              return (
                <Link
                  key={href}
                  href={href}
                  className={`hidden sm:inline-flex px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${active
                      ? 'text-ps-neon-blue bg-ps-neon-blue/10 border border-ps-neon-blue/20'
                      : 'text-theme-muted hover:text-theme-page border border-transparent'
                    }`}
                >
                  {label}
                </Link>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-h-[36px] flex items-center
                  ${active
                    ? 'text-ps-neon-blue bg-ps-neon-blue/10 border border-ps-neon-blue/20'
                    : 'text-theme-muted hover:text-theme-page border border-transparent'
                  }`}
              >
                <span className="sm:hidden">{mobile}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        <ThemeToggle />
      </div>
    </nav>
  );
}
