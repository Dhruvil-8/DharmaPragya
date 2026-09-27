'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  BookAudio, 
  Volume2, 
  Sparkles, 
  ChevronRight, 
  Layers,
  ArrowRight,
  Headphones
} from 'lucide-react';
import { GITA_CHAPTERS } from '../data/gitaChapters';

export type StoryLanguageMode = 'sanskrit' | 'english' | 'hindi';

interface GitaStorySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChapter?: number;
  initialVerse?: number;
}

export default function GitaStorySetupModal({
  isOpen,
  onClose,
  initialChapter = 1,
  initialVerse = 1,
}: GitaStorySetupModalProps) {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState<StoryLanguageMode>('english');
  const [selectedChapter, setSelectedChapter] = useState<number>(initialChapter);
  const [selectedVerse, setSelectedVerse] = useState<number>(initialVerse);

  useEffect(() => {
    if (initialChapter) setSelectedChapter(initialChapter);
    if (initialVerse) setSelectedVerse(initialVerse);
  }, [initialChapter, initialVerse]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentChapterInfo = GITA_CHAPTERS.find(c => c.number === selectedChapter) || GITA_CHAPTERS[0];

  const handleBeginJourney = () => {
    onClose();
    router.push(`/story/gita?chapter=${selectedChapter}&verse=${selectedVerse}&lang=${selectedLang}`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-setup-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl max-h-[92dvh] bg-cream-100 dark:bg-[#0c101c] border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden animate-scale-up text-stone-900 dark:text-slate-100">
        
        {/* Ornate Header */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 bg-gradient-to-r from-saffron-600 via-amber-600 to-terracotta-600 text-white relative flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-amber-200 border border-white/20 shadow-inner">
              <BookAudio className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="story-setup-title" className="text-base sm:text-lg font-bold font-cinzel text-white leading-tight">
                  Gita Darshan
                </h2>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-black/30 border border-white/20 text-amber-200">
                  Story Mode
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-100/80 font-medium">
                Cinematic audio & sacred visual immersion
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            aria-label="Close setup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Setup Options */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 text-sm">
          
          {/* Step 1: Language & Subtitle Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-saffron-800 dark:text-amber-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                1. Select Verse Display Mode
              </label>
              <span className="text-[11px] text-stone-500 dark:text-slate-400">
                Single clear translation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option A: Only Sanskrit */}
              <button
                type="button"
                onClick={() => setSelectedLang('sanskrit')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedLang === 'sanskrit'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-saffron-500 dark:border-amber-400 shadow-xs ring-2 ring-saffron-500/20'
                    : 'bg-white dark:bg-slate-900/80 border-cream-400/40 dark:border-slate-800 hover:border-saffron-400/60 dark:hover:border-amber-500/40'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-slate-100 font-sanskrit mb-0.5">
                    केवल संस्कृत
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-slate-400">
                    Only Sanskrit
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-medium text-stone-400 dark:text-slate-400">
                  Pure recitation & sacred chanting focus
                </div>
              </button>

              {/* Option B: Sanskrit + English */}
              <button
                type="button"
                onClick={() => setSelectedLang('english')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedLang === 'english'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-saffron-500 dark:border-amber-400 shadow-xs ring-2 ring-saffron-500/20'
                    : 'bg-white dark:bg-slate-900/80 border-cream-400/40 dark:border-slate-800 hover:border-saffron-400/60 dark:hover:border-amber-500/40'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-slate-100 mb-0.5">
                    Sanskrit + English
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-slate-400">
                    One English Translation
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-medium text-stone-400 dark:text-slate-400">
                  Clear, poetic English meaning per verse
                </div>
              </button>

              {/* Option C: Sanskrit + Hindi */}
              <button
                type="button"
                onClick={() => setSelectedLang('hindi')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedLang === 'hindi'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-saffron-500 dark:border-amber-400 shadow-xs ring-2 ring-saffron-500/20'
                    : 'bg-white dark:bg-slate-900/80 border-cream-400/40 dark:border-slate-800 hover:border-saffron-400/60 dark:hover:border-amber-500/40'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-slate-100 mb-0.5">
                    संस्कृत + हिन्दी
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-slate-400">
                    Hindi Translation
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-medium text-stone-400 dark:text-slate-400">
                  सरल भावार्थ एवं सुगम अर्थ
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Starting Chapter Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="chapter-select" className="text-xs font-bold uppercase tracking-wider text-saffron-800 dark:text-amber-400 flex items-center gap-2">
                <BookAudio className="w-4 h-4" />
                2. Choose Chapter (1 to 18)
              </label>
              <span className="text-[11px] text-saffron-700 dark:text-amber-300 font-semibold">
                {currentChapterInfo.verseCount} Verses
              </span>
            </div>

            <select
              id="chapter-select"
              value={selectedChapter}
              onChange={(e) => {
                const newCh = parseInt(e.target.value, 10);
                setSelectedChapter(newCh);
                setSelectedVerse(1);
              }}
              className="w-full p-3.5 bg-white dark:bg-slate-900 border border-cream-400/60 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-stone-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-saffron-500 dark:focus:ring-amber-400 cursor-pointer"
            >
              {GITA_CHAPTERS.map((ch) => (
                <option key={ch.number} value={ch.number}>
                  Chapter {ch.number}: {ch.nameEnglish} ({ch.nameSanskrit}) — {ch.verseCount} Verses
                </option>
              ))}
            </select>

            {/* Chapter Theme Highlight Card */}
            <div className="p-3.5 bg-cream-200/50 dark:bg-slate-900/40 border border-cream-300 dark:border-slate-800/80 rounded-2xl text-xs flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-slate-400 block">
                  Chapter Essence
                </span>
                <span className="text-stone-700 dark:text-slate-200 font-medium">
                  {currentChapterInfo.theme}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-stone-500 dark:text-slate-400">
                <Headphones className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px]">Audio Ready</span>
              </div>
            </div>
          </div>

          {/* Step 3: Starting Verse */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="start-verse-input" className="text-xs font-bold uppercase tracking-wider text-saffron-800 dark:text-amber-400">
                3. Starting Verse (Optional)
              </label>
              <span className="text-[11px] text-stone-500 dark:text-slate-400">
                1 to {currentChapterInfo.verseCount}
              </span>
            </div>
            <input
              id="start-verse-input"
              type="number"
              min={1}
              max={currentChapterInfo.verseCount}
              value={selectedVerse}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  setSelectedVerse(Math.max(1, Math.min(val, currentChapterInfo.verseCount)));
                }
              }}
              className="w-full p-3 bg-white dark:bg-slate-900 border border-cream-400/60 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-stone-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-saffron-500"
            />
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-6 bg-cream-200/60 dark:bg-[#080c16] border-t border-cream-300 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 hover:bg-cream-300/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleBeginJourney}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-saffron-600 hover:from-saffron-700 hover:to-terracotta-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <span>Begin Experience</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}
