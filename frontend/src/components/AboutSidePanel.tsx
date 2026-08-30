'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { 
  X, 
  Globe, 
  BookOpen, 
  ExternalLink, 
  Sparkles,
  Compass
} from 'lucide-react';

interface AboutSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutSidePanel({ isOpen, onClose }: AboutSidePanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Escape key and body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] overflow-hidden flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-panel-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-md h-full bg-cream-100 dark:bg-[#0b0f19] border-l border-cream-400 dark:border-amber-500/20 shadow-2xl flex flex-col z-10 animate-slide-left select-text">
        {/* Panel Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-cream-300 to-cream-200 dark:from-[#111827] dark:to-[#0b0f19] border-b border-cream-400/50 dark:border-amber-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="DharmaPragya Logo" 
              width={32}
              height={32}
              className="w-8 h-8 rounded-full shadow-xs object-cover bg-white dark:bg-slate-900 border border-cream-400 dark:border-amber-500/30 shrink-0" 
            />
            <div>
              <h2 id="about-panel-title" className="text-lg font-bold font-cinzel text-saffron-800 dark:text-amber-300 leading-tight">
                About DharmaPragya
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">
                Wisdom of Sanatan Dharma
              </p>
            </div>
          </div>
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
        <div className="flex-1 px-5 py-5 space-y-6 overflow-y-auto">
          {/* Concise Single-Paragraph Mission Overview */}
          <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-cream-400/50 dark:border-amber-500/20 shadow-2xs">
            <p className="text-sm text-stone-700 dark:text-slate-200 leading-relaxed font-serif">
              DharmaPragya is an open intelligence platform that synthesizes the profound wisdom of Sanatan Dharma across the Vedas, Upanishads, Bhagavad Gita, Mahabharata, Ramayana, Puranas, and classical Sanatan Dharma scriptures.
            </p>
          </div>

          {/* Related Sanatan Ecosystem Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold tracking-wider text-saffron-800 dark:text-amber-300 uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
              <span>Related Sanatan Ecosystem</span>
            </h3>
            
            <div className="space-y-2.5">
              {/* 1-Click: Vedic Jyotish Portal */}
              <a 
                href="https://vedic-jyotish.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-500/40 dark:hover:border-amber-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-saffron-100 dark:bg-amber-950/60 border border-saffron-300/40 dark:border-amber-500/30 flex items-center justify-center text-saffron-700 dark:text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
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
                className="group flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-500/40 dark:hover:border-amber-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-saffron-100 dark:bg-amber-950/60 border border-saffron-300/40 dark:border-amber-500/30 flex items-center justify-center text-saffron-700 dark:text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
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

              {/* 1-Click: Open Source GitHub */}
              <a
                href="https://github.com/Dhruvil-8/DharmaPragya"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 hover:bg-cream-200 dark:hover:bg-slate-800/90 border border-cream-400/40 dark:border-amber-500/20 hover:border-saffron-500/40 dark:hover:border-amber-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-saffron-100 dark:bg-amber-950/60 border border-saffron-300/40 dark:border-amber-500/30 flex items-center justify-center text-saffron-700 dark:text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
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
          </div>
        </div>

        {/* Panel Footer */}
        <div className="px-5 py-3.5 bg-cream-200/60 dark:bg-slate-900/90 border-t border-cream-400/40 dark:border-amber-500/20 text-center text-[11px] text-stone-500 dark:text-slate-400 font-medium shrink-0">
          DharmaPragya Platform &bull; Open Knowledge
        </div>
      </div>
    </div>,
    document.body
  );
}
