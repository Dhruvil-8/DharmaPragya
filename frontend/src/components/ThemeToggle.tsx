'use client';

import React, { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

const emptySubscribe = () => () => {};

function subscribeTheme(callback: () => void) {
  window.addEventListener('dharmapragya_theme_changed', callback);
  return () => {
    window.removeEventListener('dharmapragya_theme_changed', callback);
  };
}

function getThemeSnapshot(): boolean {
  return document.documentElement.classList.contains('dark');
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => false);

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextDark = !root.classList.contains('dark');

    if (nextDark) {
      root.classList.add('dark');
      try {
        localStorage.setItem('dharmapragya_theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } catch {}
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('dharmapragya_theme', 'light');
        localStorage.setItem('theme', 'light');
      } catch {}
    }

    // Dispatch event to sync all other ThemeToggle instances & SidePanel
    window.dispatchEvent(
      new CustomEvent('dharmapragya_theme_changed', {
        detail: { isDark: nextDark },
      })
    );
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-full bg-cream-300/50 dark:bg-slate-900/70 border border-cream-400/50 dark:border-amber-500/20 ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center justify-center w-8 h-8 text-saffron-800 dark:text-amber-300 bg-cream-300/50 dark:bg-slate-900/70 hover:bg-cream-300 dark:hover:bg-slate-800 border border-cream-400/50 dark:border-amber-500/20 rounded-full cursor-pointer transition-all duration-200 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-saffron-400/40 dark:focus:ring-amber-500/40 active:scale-95 ${className}`}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-stone-700 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
