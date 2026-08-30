'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
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
  Compass
} from 'lucide-react';
import { getBookmarks } from '../lib/bookmarks';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSanctuary?: () => void;
  mode?: 'ask' | 'read';
  onModeChange?: (mode: 'ask' | 'read') => void;
}

type SidePanelView = 'main' | 'about' | 'related';

export default function SidePanel({ 
  isOpen, 
  onClose,
  onOpenSanctuary,
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

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, currentView]);

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

  const handleModeSelect = (newMode: 'ask' | 'read') => {
    onClose();
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleSanctuaryClick = () => {
    onClose();
    if (onOpenSanctuary) {
      onOpenSanctuary();
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] overflow-hidden flex justify-start"
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
              <h2 id="side-panel-title" className="text-sm font-bold font-cinzel text-saffron-800 dark:text-amber-300">
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
              </div>

              {/* Preferences & Features Section */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold tracking-wider text-saffron-800 dark:text-amber-400 uppercase block px-1">
                  Features & Settings
                </span>

                {/* Saved Sanctuary Button */}
                <button
                  type="button"
                  onClick={handleSanctuaryClick}
                  className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/40 rounded-2xl shadow-2xs transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-saffron-100 dark:bg-amber-950/60 flex items-center justify-center text-saffron-700 dark:text-amber-300 relative shrink-0 group-hover:scale-105 transition-transform">
                      <Bookmark className="w-4 h-4" />
                      {bookmarkCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-saffron-600 text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                          {bookmarkCount > 9 ? '9+' : bookmarkCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-slate-100 block">
                        Saved Sanctuary
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                        {bookmarkCount} {bookmarkCount === 1 ? 'verse bookmarked' : 'verses bookmarked'}
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
                    <div className="w-8 h-8 rounded-xl bg-cream-200 dark:bg-slate-800 flex items-center justify-center text-saffron-800 dark:text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
                      {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-saffron-800" />}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-slate-100 block">
                        {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                        Toggle reading appearance
                      </span>
                    </div>
                  </div>
                </button>

                {/* Open About Tab */}
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
                      <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-slate-100 block">
                        About DharmaPragya
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                        Mission, scriptures & source code
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-saffron-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                </button>

                {/* Open Related Sites Tab */}
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
                      <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-slate-100 block">
                        Our Related Sites
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                        Vedic Jyotish & Sanatan Directory
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-saffron-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: About DharmaPragya Sub-page */}
          {currentView === 'about' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4.5 bg-white dark:bg-slate-900/90 rounded-2xl border border-cream-400/50 dark:border-amber-500/20 shadow-2xs">
                <p className="text-xs sm:text-sm text-stone-700 dark:text-slate-200 leading-relaxed font-serif">
                  DharmaPragya is a platform that allows users to explore the wisdom of Sanatan Dharma by asking questions. The system leverages AI to intelligently route questions and synthesize answers based on citations drawn directly from foundational texts like the Srimad Bhagavad Gita, the Vedas, the Upanishads, the Mahabharata, the Ramayana, the Yoga Sutras, and classical Sanatan Dharma scriptures.
                </p>
              </div>

              {/* Source Code Link */}
              <a
                href="https://github.com/Dhruvil-8/DharmaPragya"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-500/40 dark:hover:border-amber-500/40 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-saffron-100 dark:bg-amber-950/60 border border-saffron-300/40 dark:border-amber-500/30 flex items-center justify-center text-saffron-700 dark:text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-xs sm:text-sm text-saffron-900 dark:text-amber-200 block group-hover:text-saffron-700 dark:group-hover:text-amber-300 transition-colors">
                      Open Source Repository
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                      View code on GitHub
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-saffron-600 dark:group-hover:text-amber-300 transition-colors shrink-0 ml-2" />
              </a>
            </div>
          )}

          {/* VIEW 3: Our Related Sites Sub-page */}
          {currentView === 'related' && (
            <div className="space-y-3 animate-fade-in">
              {/* 1-Click: Vedic Jyotish Portal */}
              <a 
                href="https://vedic-jyotish.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-500/40 dark:hover:border-amber-500/40 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-saffron-100 dark:bg-amber-950/60 border border-saffron-300/40 dark:border-amber-500/30 flex items-center justify-center text-saffron-700 dark:text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs sm:text-sm text-saffron-900 dark:text-amber-200 block group-hover:text-saffron-700 dark:group-hover:text-amber-300 transition-colors">
                      Vedic Jyotish Portal
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                      Astronomical calculations and chart analysis
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-saffron-600 dark:group-hover:text-amber-300 transition-colors shrink-0 ml-2" />
              </a>

              {/* 1-Click: Sanatan Dharma Directory */}
              <a 
                href="https://dhruvil-8.github.io/SanatanDharmaDirectory/site/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-500/40 dark:hover:border-amber-500/40 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-saffron-100 dark:bg-amber-950/60 border border-saffron-300/40 dark:border-amber-500/30 flex items-center justify-center text-saffron-700 dark:text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs sm:text-sm text-saffron-900 dark:text-amber-200 block group-hover:text-saffron-700 dark:group-hover:text-amber-300 transition-colors">
                      Sanatan Dharma Directory
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                      Curated directory of resources & scriptures
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-saffron-600 dark:group-hover:text-amber-300 transition-colors shrink-0 ml-2" />
              </a>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="px-5 py-3.5 bg-cream-200/60 dark:bg-slate-900/90 border-t border-cream-400/40 dark:border-amber-500/20 text-center text-[11px] text-stone-500 dark:text-slate-400 font-medium shrink-0">
          &copy; {new Date().getFullYear()} DharmaPragya
        </div>
      </div>
    </div>,
    document.body
  );
}
