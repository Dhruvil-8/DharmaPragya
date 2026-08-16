'use client';

import React, { useState, useEffect } from 'react';
import { Info, X, ExternalLink, Globe, Sun, Moon, Bookmark } from 'lucide-react';
import Image from 'next/image';
import { getBookmarks } from '../lib/bookmarks';

interface HeaderProps {
  onOpenSanctuary?: () => void;
}

export default function Header({ onOpenSanctuary }: HeaderProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    // Check initial theme
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark') || localStorage.getItem('dharmapragya_theme') === 'dark';
      setIsDark(isDarkMode);
    }

    const updateCount = () => {
      setBookmarkCount(getBookmarks().length);
    };
    updateCount();

    window.addEventListener('dharmapragya_bookmarks_updated', updateCount);
    return () => window.removeEventListener('dharmapragya_bookmarks_updated', updateCount);
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

  return (
    <>
      <header className="relative w-full flex flex-col items-center mb-8 pt-2">
        {/* Top Control Bar: Theme Switcher & Sanctuary & About */}
        <div className="w-full flex items-center justify-between z-20">
          {/* Left: Surya / Chandra Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold tracking-wide text-saffron-700 dark:text-saffron-300 bg-cream-400/40 dark:bg-[#221c17] hover:bg-cream-400/70 dark:hover:bg-[#2d251f] border border-cream-500/30 dark:border-[#3a3229] rounded-full cursor-pointer transition-all duration-300 shadow-xs"
            title={isDark ? "Switch to Surya (Day Mode)" : "Switch to Chandra (Night Mode)"}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-saffron-600" />}
            <span className="text-[11px] uppercase tracking-wider">{isDark ? 'Surya' : 'Chandra'}</span>
          </button>

          {/* Right: Saved Sanctuary & About */}
          <div className="flex items-center gap-2">
            {onOpenSanctuary && (
              <button
                onClick={onOpenSanctuary}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-saffron-700 dark:text-saffron-300 bg-cream-400/30 dark:bg-[#221c17] hover:bg-cream-400/60 dark:hover:bg-[#2d251f] border border-cream-500/20 dark:border-[#3a3229] rounded-full cursor-pointer transition-all duration-300 shadow-xs"
                title="Open Saved Verses Sanctuary"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SAVED</span>
                {bookmarkCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-saffron-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {bookmarkCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setIsAboutOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-saffron-700 dark:text-saffron-300 bg-cream-400/30 dark:bg-[#221c17] hover:bg-cream-400/60 dark:hover:bg-[#2d251f] border border-cream-500/20 dark:border-[#3a3229] rounded-full cursor-pointer hover:text-saffron-600 dark:hover:text-saffron-200 transition-all duration-300 shadow-xs"
            >
              <Info className="w-3.5 h-3.5" />
              <span>ABOUT</span>
            </button>
          </div>
        </div>

        {/* Main Logo & Title with Sacred Vedic Styling */}
        <div className="flex flex-col items-center mt-4 md:mt-2">
          <div className="relative p-1.5 rounded-full border-2 border-dashed border-saffron-500/40 dark:border-saffron-400/40 mb-3 hover:border-saffron-500/80 transition-all duration-500 hover:rotate-6">
            <Image 
              src="/logo.png" 
              alt="DharmaPragya Logo" 
              width={96}
              height={96}
              priority
              className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-md object-cover bg-white" 
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 via-terracotta-600 to-terracotta-700 dark:from-amber-400 dark:via-saffron-400 dark:to-saffron-300 font-cinzel text-center">
            DharmaPragya
          </h1>
          <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-saffron-400 dark:via-amber-400 to-transparent mt-2 mb-2" />
          <p className="text-center text-[11px] md:text-xs text-saffron-800/80 dark:text-saffron-200/80 font-medium tracking-widest uppercase max-w-md px-4">
            Universal Wisdom of Sanatan Dharma
          </p>
        </div>
      </header>

      {/* Modern Slide-over Drawer for About */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setIsAboutOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md transform transition-all duration-300 ease-out">
              <div className="h-full flex flex-col bg-cream-100 dark:bg-[#1a1613] border-l border-cream-400 dark:border-[#3a3229] shadow-2xl overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-6 bg-gradient-to-r from-cream-300 to-cream-200 dark:from-[#221c17] dark:to-[#1a1613] border-b border-cream-400/40 dark:border-[#2d261e] flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-cinzel text-saffron-800 dark:text-saffron-200">About DharmaPragya</h2>
                  <button
                    onClick={() => setIsAboutOpen(false)}
                    className="p-1 rounded-full text-stone-500 hover:text-saffron-600 dark:hover:text-saffron-300 hover:bg-cream-400/40 dark:hover:bg-[#2e2720] transition-all cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-8 space-y-8">
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
                    DharmaPragya is a platform that allows seekers to explore the profound wisdom of Sanatan Dharma by asking questions in natural language, with synthesized answers drawn strictly from canonical verses.
                  </p>

                  {/* GitHub Link Button */}
                  <div>
                    <a
                      href="https://github.com/Dhruvil-8/DharmaPragya"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-saffron-600 to-terracotta-700 hover:from-saffron-500 hover:to-terracotta-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      GitHub Repository
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  </div>

                  {/* Related Sites */}
                  <div className="space-y-4 pt-4 border-t border-cream-400/40 dark:border-[#3a3229]">
                    <h3 className="text-xs font-bold tracking-wider text-saffron-800 dark:text-saffron-300 uppercase font-cinzel">Our Related Portals</h3>
                    
                    <div className="space-y-3">
                      {/* Vedic Jyotish */}
                      <a
                        href="https://vedic-jyotish.vercel.app"
                        target="_blank"
                        rel="noreferrer"
                        className="group block p-4 bg-white dark:bg-[#201a15] hover:bg-cream-200 dark:hover:bg-[#28221b] border border-cream-400/30 dark:border-[#3a3229] hover:border-saffron-500/30 rounded-xl shadow-xs hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-saffron-800 dark:text-saffron-300 group-hover:text-saffron-600 dark:group-hover:text-saffron-200">Vedic Jyotish Portal</span>
                          <Globe className="w-4 h-4 text-saffron-600/70 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="block text-xs text-stone-500 dark:text-stone-400">Ancient Calculations. AI‑Assisted Interpretation</span>
                      </a>

                      {/* Directory */}
                      <a
                        href="https://dhruvil-8.github.io/SanatanDharmaDirectory/site/"
                        target="_blank"
                        rel="noreferrer"
                        className="group block p-4 bg-white dark:bg-[#201a15] hover:bg-cream-200 dark:hover:bg-[#28221b] border border-cream-400/30 dark:border-[#3a3229] hover:border-saffron-500/30 rounded-xl shadow-xs hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-saffron-800 dark:text-saffron-300 group-hover:text-saffron-600 dark:group-hover:text-saffron-200">Sanatan Dharma Directory</span>
                          <Globe className="w-4 h-4 text-saffron-600/70 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="block text-xs text-stone-500 dark:text-stone-400">A curated directory of Sanatan Dharma resources</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer inside Drawer */}
                <div className="px-6 py-6 bg-cream-200/50 dark:bg-[#141210] border-t border-cream-400/30 dark:border-[#2d261e] text-center text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                  DharmaPragya Platform &copy; {new Date().getFullYear()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
