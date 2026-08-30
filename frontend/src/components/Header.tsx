'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bookmark, 
  Compass, 
  BookOpen, 
  Sun, 
  Moon 
} from 'lucide-react';
import Image from 'next/image';
import { getBookmarks } from '../lib/bookmarks';
import AboutSidePanel from './AboutSidePanel';

interface HeaderProps {
  onOpenSanctuary?: () => void;
  onOpenAbout?: () => void;
  mode?: 'ask' | 'read';
  onModeChange?: (mode: 'ask' | 'read') => void;
  onHomeClick?: () => void;
}

export default function Header({ 
  onOpenSanctuary, 
  onOpenAbout, 
  mode, 
  onModeChange, 
  onHomeClick 
}: HeaderProps) {
  const [internalAboutOpen, setInternalAboutOpen] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setBookmarkCount(getBookmarks().length);

    const handleBookmarksUpdate = () => {
      setBookmarkCount(getBookmarks().length);
    };

    window.addEventListener('dharmapragya_bookmarks_updated', handleBookmarksUpdate);
    
    // Check initial theme
    const isDarkTheme = document.documentElement.classList.contains('dark');
    setIsDark(isDarkTheme);

    return () => window.removeEventListener('dharmapragya_bookmarks_updated', handleBookmarksUpdate);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dharmapragya_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dharmapragya_theme', 'light');
    }
  };

  const handleBrandClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else if (onModeChange) {
      onModeChange('ask');
    }
  };

  const handleMenuClick = () => {
    if (onOpenAbout) {
      onOpenAbout();
    } else {
      setInternalAboutOpen(true);
    }
  };

  return (
    <>
      <div className="w-full flex items-center justify-between select-none gap-2 transition-colors duration-300">
        {/* Left: Brand Logo (Clicking returns to Home Page) */}
        <button
          type="button"
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer text-left group focus:outline-none transition-transform active:scale-95"
          title="DharmaPragya Home - Return to main sanctuary"
          aria-label="DharmaPragya Home"
        >
          <div className="relative">
            <Image 
              src="/logo.png" 
              alt="DharmaPragya Logo" 
              width={32}
              height={32}
              priority
              className="w-7 h-7 rounded-full shadow-xs object-cover bg-white dark:bg-slate-900 border border-cream-400 dark:border-amber-500/30 shrink-0 group-hover:scale-105 transition-transform" 
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-saffron-700 to-terracotta-800 dark:from-amber-300 dark:to-saffron-400 font-cinzel leading-none group-hover:brightness-110 transition-all">
              DharmaPragya
            </h1>
            <span className="text-[9px] text-saffron-700 dark:text-amber-400/80 font-semibold tracking-wider uppercase mt-0.5 hidden xs:inline">
              Wisdom of Sanatan Dharma
            </span>
          </div>
        </button>

        {/* Center: Integrated Mode Segment Switcher */}
        {mode && onModeChange && (
          <div className="bg-cream-300/90 dark:bg-slate-900/90 p-1 rounded-full border border-cream-400/70 dark:border-amber-500/20 flex shadow-2xs">
            <button
              type="button"
              onClick={() => onModeChange('ask')}
              className={`flex items-center gap-1.5 py-1 px-3 sm:px-4 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                mode === 'ask'
                  ? 'bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-saffron-600 text-white shadow-xs'
                  : 'text-saffron-900 dark:text-slate-300 hover:text-saffron-700 dark:hover:text-amber-300 hover:bg-cream-200 dark:hover:bg-slate-800/80'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>

            <button
              type="button"
              onClick={() => onModeChange('read')}
              className={`flex items-center gap-1.5 py-1 px-3 sm:px-4 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                mode === 'read'
                  ? 'bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-saffron-600 text-white shadow-xs'
                  : 'text-saffron-900 dark:text-slate-300 hover:text-saffron-700 dark:hover:text-amber-300 hover:bg-cream-200 dark:hover:bg-slate-800/80'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read</span>
            </button>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 text-saffron-800 dark:text-amber-300 bg-cream-300/50 dark:bg-slate-900/70 hover:bg-cream-300 dark:hover:bg-slate-800 border border-cream-400/50 dark:border-amber-500/20 rounded-full cursor-pointer transition-all duration-200 hover:shadow-xs"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-300 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-saffron-800 transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Saved Sanctuary Bookmarks */}
          {onOpenSanctuary && (
            <button
              type="button"
              onClick={onOpenSanctuary}
              className="relative flex items-center justify-center w-8 h-8 text-saffron-800 dark:text-amber-300 bg-cream-300/50 dark:bg-slate-900/70 hover:bg-cream-300 dark:hover:bg-slate-800 border border-cream-400/50 dark:border-amber-500/20 rounded-full cursor-pointer transition-all duration-200 hover:shadow-xs"
              title="Saved Sanctuary (Offline Verses)"
              aria-label="Saved Sanctuary"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-saffron-500 to-terracotta-500 dark:from-amber-500 dark:to-saffron-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-cream-100 dark:border-slate-900">
                  {bookmarkCount > 9 ? '9+' : bookmarkCount}
                </span>
              )}
            </button>
          )}

          {/* Menu / About Side Panel Trigger */}
          <button
            type="button"
            onClick={handleMenuClick}
            className="flex items-center justify-center w-8 h-8 text-saffron-800 dark:text-amber-300 bg-cream-300/50 dark:bg-slate-900/70 hover:bg-cream-300 dark:hover:bg-slate-800 border border-cream-400/50 dark:border-amber-500/20 rounded-full cursor-pointer transition-all duration-200 hover:shadow-xs"
            title="About & Ecosystem Menu"
            aria-label="About & Ecosystem Menu"
          >
            <Menu className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fallback Internal About Side Panel (if not externally controlled) */}
      {!onOpenAbout && (
        <AboutSidePanel 
          isOpen={internalAboutOpen} 
          onClose={() => setInternalAboutOpen(false)} 
        />
      )}
    </>
  );
}
