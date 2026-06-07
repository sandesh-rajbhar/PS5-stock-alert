'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';


const LINKS = [
  { href: '/',        label: 'Home'        },
  { href: '/tracker', label: 'PS5 Scanner' },
  { href: '/games',   label: 'Games'       },
  { href: '/news',    label: 'News'        },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-theme-nav backdrop-blur-md border-b border-theme-nav">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Mobile: hamburger left | Desktop: hidden */}
          <button
            onClick={() => setOpen(v => !v)}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-theme-nav text-theme-muted hover:text-theme-page transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Logo — centred on mobile, left on desktop */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label="Home"
            className="text-theme-page hover:text-ps-neon-blue transition-colors
                       absolute left-1/2 -translate-x-1/2
                       sm:static sm:left-auto sm:translate-x-0 sm:shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/esports-solid-c-os-255085.svg" alt="PS Deals logo" className="w-7 h-7 sm:w-8 sm:h-8 logo-icon" />
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <div className="hidden sm:flex items-center gap-0.5 sm:gap-1 flex-1 justify-center">
            {LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${active
                      ? 'text-ps-neon-blue bg-ps-neon-blue/10 border border-ps-neon-blue/20'
                      : 'text-theme-muted hover:text-theme-page border border-transparent'
                    }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Desktop: theme toggle in nav bar | Mobile: inside hamburger menu */}
          <div className="hidden sm:block shrink-0"><ThemeToggle /></div>
          {/* Keeps logo centred on mobile by balancing the hamburger width */}
          <div className="w-9 h-9 sm:hidden shrink-0" />
        </div>

        {/* Mobile dropdown menu */}
        {open && (
          <div className="sm:hidden border-t border-theme-nav bg-theme-nav backdrop-blur-md px-4 py-3 flex flex-col gap-1">
            {LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all
                    ${active
                      ? 'text-ps-neon-blue bg-ps-neon-blue/10'
                      : 'text-theme-muted hover:text-theme-page hover:bg-theme-card'
                    }`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-theme-divider my-2" />

            {/* Theme switcher row */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-theme-faint">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
