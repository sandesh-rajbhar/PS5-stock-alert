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

  if (!mounted) return <div className="w-28 h-8" />;

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/40"
    >
      {OPTIONS.map(({ value, Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={`${label} theme`}
            aria-pressed={active}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[9px] text-[10px] font-bold uppercase tracking-widest transition-all duration-150 cursor-pointer select-none
              ${active
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
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
