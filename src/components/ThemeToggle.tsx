'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const OPTIONS = [
  { value: 'system', Icon: Monitor, label: 'System' },
  { value: 'light',  Icon: Sun,     label: 'Light'  },
  { value: 'dark',   Icon: Moon,    label: 'Dark'   },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-32 h-8" />;

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="flex items-center rounded-lg border border-theme-nav bg-theme-card overflow-hidden"
    >
      {OPTIONS.map(({ value, Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={`Switch to ${label} theme`}
            aria-pressed={active}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer
              ${active
                ? 'bg-ps-neon-blue text-white'
                : 'text-theme-muted hover:text-theme-page hover:bg-theme-card'
              }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
