'use client';

import React, { useState, useEffect } from 'react';
import { 
  Info, X, Globe, Bookmark, Compass, BookOpen, Sun, Moon, 
  Sparkles, Scroll, Database, ExternalLink, ShieldCheck, Layers 
} from 'lucide-react';
import Image from 'next/image';
import { getBookmarks } from '../lib/bookmarks';

interface HeaderProps {
  onOpenSanctuary?: () => void;
  mode?: 'ask' | 'read';
  onModeChange?: (mode: 'ask' | 'read') => void;
  onHomeClick?: () => void;
}

export default function Header({ onOpenSanctuary, mode, onModeChange, onHomeClick }: HeaderProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
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

  // Handle Escape key and body scroll locking for About modal
  useEffect(() => {
    if (!isAboutOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAboutOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isAboutOpen]);

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

          {onOpenSanctuary && (
            <button
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

          <button
            onClick={() => setIsAboutOpen(true)}
            className="flex items-center justify-center w-8 h-8 text-saffron-800 dark:text-amber-300 bg-cream-300/50 dark:bg-slate-900/70 hover:bg-cream-300 dark:hover:bg-slate-800 border border-cream-400/50 dark:border-amber-500/20 rounded-full cursor-pointer transition-all duration-200 hover:shadow-xs"
            title="About DharmaPragya"
            aria-label="About DharmaPragya"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* About Drawer Modal */}
      {isAboutOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-stone-900/50 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsAboutOpen(false)}
          />

          {/* Drawer Container (100% responsive, no right-side clipping on mobile) */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-6 pointer-events-none">
            <div className="w-screen max-w-lg pointer-events-auto transform transition-all duration-300 ease-out">
              <div className="h-full flex flex-col bg-cream-100 dark:bg-[#0b0f19] border-l border-cream-400 dark:border-amber-500/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-cream-300 to-cream-200 dark:from-[#111827] dark:to-[#0b0f19] border-b border-cream-400/50 dark:border-amber-500/20 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron-500 to-terracotta-600 flex items-center justify-center text-white shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 id="about-modal-title" className="text-xl font-bold font-cinzel text-saffron-800 dark:text-amber-300">
                        About DharmaPragya
                      </h2>
                      <p className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">
                        Open Intelligence for Sanatan Dharma Wisdom
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAboutOpen(false)}
                    className="p-1.5 rounded-full text-stone-500 dark:text-slate-400 hover:text-saffron-700 dark:hover:text-amber-300 hover:bg-cream-400/50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    aria-label="Close About Modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Content (Selectable Text) */}
                <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto select-text">
                  {/* Mission Summary */}
                  <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-cream-400/40 dark:border-amber-500/20 shadow-2xs">
                    <p className="text-sm text-stone-700 dark:text-slate-200 leading-relaxed font-serif">
                      <strong className="text-saffron-800 dark:text-amber-300 font-sans">DharmaPragya</strong> is an open-source intelligence and contemplation platform synthesizing the timeless wisdom of Sanatan Dharma across <strong className="text-saffron-800 dark:text-amber-300 font-sans">186,000+ Verses and Mantras</strong> with authentic Sanskrit texts, word-by-word Anvaya, transliterations, and multi-school classical commentaries.
                    </p>
                  </div>

                  {/* Core Stats Grid */}
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-saffron-800 dark:text-amber-300 uppercase mb-3 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
                      <span>Sacred Canon Covered</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 bg-cream-200/70 dark:bg-slate-900/60 rounded-xl border border-cream-400/40 dark:border-amber-500/15">
                        <div className="text-base font-bold font-cinzel text-saffron-700 dark:text-amber-300">4 Vedas</div>
                        <div className="text-[11px] text-stone-600 dark:text-slate-400">20,379 Mantras + 4 Bhashyas</div>
                      </div>
                      <div className="p-3 bg-cream-200/70 dark:bg-slate-900/60 rounded-xl border border-cream-400/40 dark:border-amber-500/15">
                        <div className="text-base font-bold font-cinzel text-saffron-700 dark:text-amber-300">6 Mahapuranas</div>
                        <div className="text-[11px] text-stone-600 dark:text-slate-400">103,000+ Verses (Shiva, Vishnu, etc.)</div>
                      </div>
                      <div className="p-3 bg-cream-200/70 dark:bg-slate-900/60 rounded-xl border border-cream-400/40 dark:border-amber-500/15">
                        <div className="text-base font-bold font-cinzel text-saffron-700 dark:text-amber-300">Bhagavad Gita</div>
                        <div className="text-[11px] text-stone-600 dark:text-slate-400">701 Verses &bull; 20+ Commentaries</div>
                      </div>
                      <div className="p-3 bg-cream-200/70 dark:bg-slate-900/60 rounded-xl border border-cream-400/40 dark:border-amber-500/15">
                        <div className="text-base font-bold font-cinzel text-saffron-700 dark:text-amber-300">Itihasas & Upanishads</div>
                        <div className="text-[11px] text-stone-600 dark:text-slate-400">Mahabharata, Ramayana, 15+ Upanishads</div>
                      </div>
                    </div>
                  </div>

                  {/* Key Capabilities */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold tracking-wider text-saffron-800 dark:text-amber-300 uppercase flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
                      <span>Key Capabilities</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-stone-700 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-saffron-600 dark:text-amber-400 font-bold">&bull;</span>
                        <span><strong>Dual-Stage Ask AI:</strong> Semantic question routing, canonical Sanskrit keyword extraction, and multi-text verified citations.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-saffron-600 dark:text-amber-400 font-bold">&bull;</span>
                        <span><strong>Deep Reading Mode:</strong> Svara and plain Devanagari Sanskrit, IAST transliteration, word breakdown, and multi-author translations.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-saffron-600 dark:text-amber-400 font-bold">&bull;</span>
                        <span><strong>Audio Recitation:</strong> Stream authentic traditional Sanskrit audio recitation for verses.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-saffron-600 dark:text-amber-400 font-bold">&bull;</span>
                        <span><strong>Personal Sanctuary:</strong> Bookmark and study verses offline with exportable share cards.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Provenance & Scholarly Credits */}
                  <div className="space-y-3 pt-4 border-t border-cream-400/40 dark:border-amber-500/20">
                    <h3 className="text-xs font-bold tracking-wider text-saffron-800 dark:text-amber-300 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
                      <span>Scholarly Provenance & Credits</span>
                    </h3>
                    <div className="space-y-2 text-xs text-stone-600 dark:text-slate-300 font-sans">
                      <p className="leading-relaxed">
                        <strong className="text-stone-800 dark:text-slate-200">The Four Vedas:</strong> Digitized Samhitas and Dayananda/Aryamuni/Brahmamuni Bhashyas sourced from <a href="http://www.VedaKosh.com" target="_blank" rel="noopener noreferrer" className="text-saffron-700 dark:text-amber-400 underline hover:opacity-80">VedaKosh.com</a>.
                      </p>
                      <p className="leading-relaxed">
                        <strong className="text-stone-800 dark:text-slate-200">Bhagavad Gita:</strong> Commentaries and transliterations credited to the <a href="https://www.gitasupersite.iitk.ac.in/" target="_blank" rel="noopener noreferrer" className="text-saffron-700 dark:text-amber-400 underline hover:opacity-80">IIT Kanpur Gita Supersite</a> and open-source Gita datasets.
                      </p>
                      <p className="leading-relaxed">
                        <strong className="text-stone-800 dark:text-slate-200">Mahabharata & Ramayana:</strong> Digitized BORI Critical Editions sourced via the <a href="https://bombay.indology.info/" target="_blank" rel="noopener noreferrer" className="text-saffron-700 dark:text-amber-400 underline hover:opacity-80">Bhandarkar Oriental Research Institute (BORI)</a>.
                      </p>
                      <p className="leading-relaxed">
                        <strong className="text-stone-800 dark:text-slate-200">Puranas & Upanishads:</strong> Digitized, encoded, and formatted from <a href="https://sanskritdocuments.org" target="_blank" rel="noopener noreferrer" className="text-saffron-700 dark:text-amber-400 underline hover:opacity-80">SanskritDocuments.org</a>.
                      </p>
                      <p className="leading-relaxed">
                        <strong className="text-stone-800 dark:text-slate-200">Patanjali Yoga Sutras:</strong> Sourced from the <a href="https://www.gita-society.com" target="_blank" rel="noopener noreferrer" className="text-saffron-700 dark:text-amber-400 underline hover:opacity-80">International Gita Society (IGS)</a>.
                      </p>
                    </div>
                  </div>

                  {/* GitHub Link Button */}
                  <div>
                    <a
                      href="https://github.com/Dhruvil-8/DharmaPragya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 px-6 py-3 text-xs font-semibold text-white bg-gradient-to-r from-saffron-600 to-terracotta-700 dark:from-amber-600 dark:to-terracotta-700 rounded-xl hover:opacity-95 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      <span>GitHub &bull; View Open Source Code</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  </div>

                  {/* Related Sites Ecosystem */}
                  <div className="space-y-3 pt-4 border-t border-cream-400/40 dark:border-amber-500/20">
                    <h3 className="text-xs font-bold tracking-wider text-saffron-800 dark:text-amber-300 uppercase">
                      Related Sanatan Ecosystem
                    </h3>
                    
                    <div className="space-y-2.5">
                      {/* Vedic Jyotish */}
                      <a 
                        href="https://vedic-jyotish.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-500/30 dark:hover:border-amber-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-xs sm:text-sm text-saffron-800 dark:text-amber-300 group-hover:text-saffron-600 dark:group-hover:text-amber-200">
                            Vedic Jyotish Portal
                          </span>
                          <Globe className="w-3.5 h-3.5 text-saffron-600/80 dark:text-amber-400/80 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="block text-[11px] text-stone-500 dark:text-slate-400">
                          Ancient Astronomical Calculations & AI-Assisted Interpretations
                        </span>
                      </a>

                      {/* Directory */}
                      <a 
                        href="https://dhruvil-8.github.io/SanatanDharmaDirectory/site/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-500/30 dark:hover:border-amber-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-xs sm:text-sm text-saffron-800 dark:text-amber-300 group-hover:text-saffron-600 dark:group-hover:text-amber-200">
                            Sanatan Dharma Directory
                          </span>
                          <Globe className="w-3.5 h-3.5 text-saffron-600/80 dark:text-amber-400/80 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="block text-[11px] text-stone-500 dark:text-slate-400">
                          A curated directory and encyclopedia of Sanatan Dharma resources
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer inside Drawer */}
                <div className="px-6 py-4 bg-cream-200/60 dark:bg-slate-900/90 border-t border-cream-400/40 dark:border-amber-500/20 text-center text-[10px] text-stone-500 dark:text-slate-400 font-medium shrink-0">
                  DharmaPragya Platform &copy; {new Date().getFullYear()} &bull; Open Knowledge
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
