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

  if (!mounted) return <div className="w-20 h-8" />;

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="flex items-center p-0.5 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/60 border border-zinc-300/60 dark:border-zinc-700/40"
    >
      {OPTIONS.map(({ value, Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={`${label} theme`}
            aria-pressed={active}
            className={`flex items-center px-2.5 py-1.5 rounded-[9px] transition-all duration-150 cursor-pointer select-none
              ${active
                ? 'bg-ps-neon-blue text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
