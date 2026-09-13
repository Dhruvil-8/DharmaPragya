'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Determine current theme state
    const currentIsDark = document.documentElement.classList.contains('dark');
    setIsDark(currentIsDark);

    // Listen for theme changes across components
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isDark: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isDark === 'boolean') {
        setIsDark(customEvent.detail.isDark);
      } else {
        setIsDark(document.documentElement.classList.contains('dark'));
      }
    };

    window.addEventListener('dharmapragya_theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('dharmapragya_theme_changed', handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextDark = !isDark;

    if (nextDark) {
      root.classList.add('dark');
      try {
        localStorage.setItem('dharmapragya_theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } catch (e) {}
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('dharmapragya_theme', 'light');
        localStorage.setItem('theme', 'light');
      } catch (e) {}
    }

    setIsDark(nextDark);

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
