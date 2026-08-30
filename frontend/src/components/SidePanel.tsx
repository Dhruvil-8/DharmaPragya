'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { 
  X, 
  Globe, 
  BookOpen, 
  ExternalLink, 
  Bookmark,
  Sun,
  Moon,
  Info,
  ChevronRight,
  ArrowLeft,
  Compass,
  Flame
} from 'lucide-react';
import { getBookmarks } from '../lib/bookmarks';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSaved?: () => void;
  mode?: 'ask' | 'read';
  onModeChange?: (mode: 'ask' | 'read') => void;
  onSelectCoordinate?: (coord: {
    sourceName: string;
    chapterNumber?: number;
    verseNumber?: number;
  }) => void;
}

type SidePanelView = 'main' | 'about' | 'related';

export default function SidePanel({ 
  isOpen, 
  onClose,
  onOpenSaved,
  mode = 'ask',
  onModeChange
}: SidePanelProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [currentView, setCurrentView] = useState<SidePanelView>('main');

  useEffect(() => {
    setMounted(true);
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

  // Reset view to main when drawer is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentView('main');
    }
  }, [isOpen]);

  // Handle Escape key and body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentView !== 'main') {
          setCurrentView('main');
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentView, onClose]);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleModeSelect = (newMode: 'ask' | 'read') => {
    if (onModeChange) {
      onModeChange(newMode);
    }
    onClose();
  };

  const handleSavedClick = () => {
    onClose();
    if (onOpenSaved) {
      onOpenSaved();
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby="side-panel-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over Panel from Left */}
      <div className="relative w-full max-w-md h-full bg-cream-100 dark:bg-[#0b0f19] border-r border-cream-400 dark:border-amber-500/20 shadow-2xl flex flex-col z-10 animate-slide-right select-text">
        {/* Panel Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-cream-300 to-cream-200 dark:from-[#111827] dark:to-[#0b0f19] border-b border-cream-400/50 dark:border-amber-500/20 flex items-center justify-between shrink-0">
          {currentView === 'main' ? (
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="DharmaPragya Logo" 
                width={32}
                height={32}
                className="w-8 h-8 rounded-full shadow-xs object-cover bg-white dark:bg-slate-900 border border-cream-400 dark:border-amber-500/30 shrink-0" 
              />
              <div>
                <h2 id="side-panel-title" className="text-lg font-bold font-cinzel text-saffron-800 dark:text-amber-300 leading-tight">
                  DharmaPragya
                </h2>
                <p className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">
                  Wisdom of Sanatan Dharma
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentView('main')}
                className="flex items-center gap-1 text-xs font-bold text-saffron-800 dark:text-amber-300 hover:text-saffron-600 dark:hover:text-amber-200 p-1.5 rounded-lg hover:bg-cream-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <span className="text-stone-300 dark:text-slate-700">|</span>
              <h2 id="side-panel-title" className="text-sm font-bold font-cinzel text-saffron-800 dark:text-amber-300 truncate">
                {currentView === 'about' ? 'About Platform' : 'Our Related Sites'}
              </h2>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-500 dark:text-slate-400 hover:text-saffron-700 dark:hover:text-amber-300 hover:bg-cream-400/50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto">
          {/* VIEW 1: Main Menu Root View */}
          {currentView === 'main' && (
            <div className="space-y-3 animate-fade-in">
              {/* Navigation Modes Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-wider text-saffron-800 dark:text-amber-400 uppercase block px-1">
                  Navigation
                </span>

                {/* 1. Ask AI Mode Option */}
                <button
                  type="button"
                  onClick={() => handleModeSelect('ask')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer text-left border ${
                    mode === 'ask'
                      ? 'bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-600 dark:to-saffron-700 text-white border-transparent shadow-xs'
                      : 'bg-white dark:bg-slate-900/90 text-stone-900 dark:text-slate-100 hover:bg-cream-200 dark:hover:bg-slate-800/90 border-cream-400/40 dark:border-amber-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      mode === 'ask' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-saffron-100 dark:bg-amber-950/60 text-saffron-700 dark:text-amber-300'
                    }`}>
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold block">
                        Ask AI
                      </span>
                      <span className={`text-[11px] block ${mode === 'ask' ? 'text-white/80' : 'text-stone-500 dark:text-slate-400'}`}>
                        Ask philosophical questions with citations
                      </span>
                    </div>
                  </div>
                  {mode === 'ask' && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>

                {/* 2. Read Scriptures Mode Option */}
                <button
                  type="button"
                  onClick={() => handleModeSelect('read')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer text-left border ${
                    mode === 'read'
                      ? 'bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-600 dark:to-saffron-700 text-white border-transparent shadow-xs'
                      : 'bg-white dark:bg-slate-900/90 text-stone-900 dark:text-slate-100 hover:bg-cream-200 dark:hover:bg-slate-800/90 border-cream-400/40 dark:border-amber-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      mode === 'read'
                        ? 'bg-white/20 text-white'
                        : 'bg-saffron-100 dark:bg-amber-950/60 text-saffron-700 dark:text-amber-300'
                    }`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold block">
                        Read Mode
                      </span>
                      <span className={`text-[11px] block ${mode === 'read' ? 'text-white/80' : 'text-stone-500 dark:text-slate-400'}`}>
                        Explore Vedas, Gita, Puranas & Upanishads
                      </span>
                    </div>
                  </div>
                  {mode === 'read' && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>

                {/* 3. Dedicated Sacred Suktams & Mantras Page Link */}
                <Link
                  href="/suktams"
                  onClick={onClose}
                  className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-saffron-50/80 via-cream-100 to-amber-50/60 dark:from-slate-900 dark:via-[#131b2e] dark:to-slate-900 hover:from-saffron-100 hover:to-amber-100 dark:hover:from-slate-800 dark:hover:to-[#17223b] border border-saffron-300/70 dark:border-amber-500/30 rounded-2xl shadow-xs transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-saffron-700 flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-saffron-950 dark:text-amber-200 block font-cinzel">
                        Sacred Suktams & Mantras
                      </span>
                      <span className="text-[11px] text-stone-600 dark:text-slate-400 block mt-0.5">
                        Purusha, Gayatri, Rudram, Nasadiya & Stotras
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-saffron-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
              </div>

              {/* Preferences & Features Section */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold tracking-wider text-saffron-800 dark:text-amber-400 uppercase block px-1">
                  Features & Settings
                </span>

                {/* Saved Verses Button */}
                <button
                  type="button"
                  onClick={handleSavedClick}
                  className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/40 rounded-2xl shadow-2xs transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-saffron-100 dark:bg-amber-950/60 flex items-center justify-center text-saffron-700 dark:text-amber-300 relative shrink-0 group-hover:scale-105 transition-transform">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-slate-200 block">
                        Saved Verses
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                        Your bookmarked verses ({bookmarkCount})
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-saffron-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                </button>

                {/* Theme Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/40 rounded-2xl shadow-2xs transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cream-300 dark:bg-slate-800 flex items-center justify-center text-stone-700 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-slate-200 block">
                        Theme
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                        Currently: {isDark ? 'Dark Mode' : 'Light Theme'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-saffron-800 dark:text-amber-400 px-2 py-1 bg-cream-200 dark:bg-slate-800 rounded-lg">
                    {isDark ? 'Switch to Light' : 'Switch to Dark'}
                  </span>
                </button>
              </div>

              {/* Exploration Sub-views */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold tracking-wider text-saffron-800 dark:text-amber-400 uppercase block px-1">
                  Information & Ecosystem
                </span>

                {/* About DharmaPragya */}
                <button
                  type="button"
                  onClick={() => setCurrentView('about')}
                  className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/40 rounded-2xl shadow-2xs transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-saffron-100 dark:bg-amber-950/60 flex items-center justify-center text-saffron-700 dark:text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-slate-200 block">
                        About DharmaPragya
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                        Our mission, philosophy & design
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-saffron-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                </button>

                {/* Related Sites */}
                <button
                  type="button"
                  onClick={() => setCurrentView('related')}
                  className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/40 rounded-2xl shadow-2xs transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-saffron-100 dark:bg-amber-950/60 flex items-center justify-center text-saffron-700 dark:text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-slate-200 block">
                        Related Sanatan Platforms
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                        Gita, Upanishads & Veda libraries
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-saffron-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: About Platform Sub-Page */}
          {currentView === 'about' && (
            <div className="space-y-4 text-stone-700 dark:text-slate-300 text-xs leading-relaxed animate-fade-in">
              <div className="p-4 rounded-2xl bg-cream-200/80 dark:bg-slate-900/90 border border-cream-400/60 dark:border-amber-500/20 space-y-2">
                <h3 className="text-sm font-bold font-cinzel text-saffron-800 dark:text-amber-300">
                  Timeless Wisdom, Sovereign Intelligence
                </h3>
                <p>
                  <strong>DharmaPragya</strong> is a specialized AI inquiry and scripture research portal designed to illuminate the eternal truths of Sanatan Dharma.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 dark:text-slate-100 uppercase tracking-wider text-[10px]">
                  Core Capabilities
                </h4>
                <ul className="space-y-2 pl-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-saffron-600 dark:bg-amber-400 mt-1.5 shrink-0" />
                    <span><strong>Grounded Citations:</strong> Synthesizes verified shlokas from Vedas, Bhagavad Gita, Upanishads, and Epics.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-saffron-600 dark:bg-amber-400 mt-1.5 shrink-0" />
                    <span><strong>Multi-Scripture Reader:</strong> Word-by-word meanings, Devanagari text, IAST transliterations, and multi-language translations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-saffron-600 dark:bg-amber-400 mt-1.5 shrink-0" />
                    <span><strong>Offline Local SQLite:</strong> Fast retrieval with zero reliance on third-party scrapers.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-cream-300 dark:border-amber-500/20 text-center space-y-1">
                <p className="text-[11px] font-sanskrit text-saffron-800 dark:text-amber-300 font-bold">
                  ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ।
                </p>
                <p className="text-[10px] text-stone-500 dark:text-slate-400">
                  From ignorance lead me to truth; from darkness lead me to light.
                </p>
              </div>
            </div>
          )}

          {/* VIEW 3: Related Sites Sub-Page */}
          {currentView === 'related' && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs text-stone-600 dark:text-slate-400 mb-2">
                Curated open resources and digital sanctuaries for Sanatan Dharma:
              </p>

              {[
                {
                  name: 'Rigveda Samhita Digital Archive',
                  desc: 'Comprehensive Devanagari texts with Sayana Bhashya and Padapatha',
                  url: 'https://rigveda.org',
                },
                {
                  name: 'Advaita Vedanta Library',
                  desc: 'Major Upanishads with Adi Shankara commentary & English translations',
                  url: 'https://advaitavedanta.org',
                },
                {
                  name: 'Bhagavad Gita As It Is Online',
                  desc: 'Sanskrit verses, word synonyms, translations, and purports',
                  url: 'https://vedabase.io',
                },
                {
                  name: 'Valmiki Ramayana Sanskrit Corpus',
                  desc: 'Critically edited Valmiki Ramayana with Tilaka commentary',
                  url: 'https://valmikiramayan.net',
                },
              ].map((site, idx) => (
                <a
                  key={idx}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/40 shadow-2xs transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-slate-100 group-hover:text-saffron-700 dark:group-hover:text-amber-300 transition-colors">
                        {site.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {site.desc}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-saffron-600 dark:group-hover:text-amber-400 shrink-0 mt-0.5" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-4 bg-cream-200/80 dark:bg-[#0e1422] border-t border-cream-400/40 dark:border-amber-500/20 text-center shrink-0">
          <p className="text-[10px] text-stone-500 dark:text-slate-500 font-medium">
            DharmaPragya • Dedicated to Truth, Self-Knowledge & Dharma
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
