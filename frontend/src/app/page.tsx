'use client';

import { useState, useEffect, Suspense } from 'react';
import Header from '../components/Header';
import AskMode from '../components/AskMode';
import ReadMode from '../components/ReadMode';
import DailyContemplation from '../components/DailyContemplation';
import SavedSanctuary from '../components/SavedSanctuary';
import ShareCardModal from '../components/ShareCardModal';
import { Compass, BookOpen } from 'lucide-react';
import { DailyShloka } from '../types';

const API_BASE_URL = '';

function HomePageContent() {
  const [mode, setMode] = useState<'ask' | 'read'>('ask');
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState<{
    isOpen: boolean;
    details: {
      sourceName: string;
      chapterNumber: number;
      verseNumber: number;
      sanskritText: string;
      transliteration?: string;
      translationText: string;
    } | null;
  }>({
    isOpen: false,
    details: null,
  });

  const [targetCoordinate, setTargetCoordinate] = useState<{
    sourceName: string;
    chapterNumber: number;
    verseNumber?: number;
  } | null>(null);

  // Parse deep-link URL params on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      const source = params.get('source');
      const chapter = params.get('chapter');
      const verse = params.get('verse');

      if (urlMode === 'read' || (source && chapter)) {
        setMode('read');
        if (source && chapter) {
          setTargetCoordinate({
            sourceName: source,
            chapterNumber: parseInt(chapter, 10),
            verseNumber: verse ? parseInt(verse, 10) : undefined,
          });
        }
      } else if (urlMode === 'saved') {
        setIsSanctuaryOpen(true);
      }
    }
  }, []);

  const handleOpenShareModalFromDaily = (shloka: DailyShloka) => {
    setShareModalData({
      isOpen: true,
      details: {
        sourceName: shloka.source_name,
        chapterNumber: shloka.chapter_number,
        verseNumber: shloka.verse_number,
        sanskritText: shloka.sanskrit_text,
        transliteration: shloka.transliteration,
        translationText: shloka.translation_english,
      },
    });
  };

  const handleOpenShareModalFromVerse = (details: {
    sourceName: string;
    chapterNumber: number;
    verseNumber: number;
    sanskritText: string;
    transliteration?: string;
    translationText: string;
  }) => {
    setShareModalData({
      isOpen: true,
      details,
    });
  };

  const handleSelectVerseFromSanctuary = (sourceName: string, chapterNumber: number, verseNumber: number) => {
    setMode('read');
    setTargetCoordinate({
      sourceName,
      chapterNumber,
      verseNumber,
    });
    // Update URL without page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'read');
      url.searchParams.set('source', sourceName);
      url.searchParams.set('chapter', String(chapterNumber));
      url.searchParams.set('verse', String(verseNumber));
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleAskQuestionFromDaily = (_query: string, source: string) => {
    setMode('ask');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Also trigger query in AskMode via DOM event or input
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = _query;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      const select = document.querySelector('select');
      if (select && source) {
        select.value = source;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 text-gray-800 relative overflow-x-hidden selection:bg-saffron-200 selection:text-saffron-700">
      {/* Decorative background sun glow */}
      <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[600px] h-[600px] bg-gradient-to-b from-saffron-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl z-10 flex flex-col flex-grow">
        <Header onOpenSanctuary={() => setIsSanctuaryOpen(true)} />

        {/* Daily Contemplation Shloka Widget */}
        <DailyContemplation
          onAskQuestion={handleAskQuestionFromDaily}
          onOpenShareModal={handleOpenShareModalFromDaily}
        />

        {/* Tab Segmented Control */}
        <div className="w-full max-w-md mx-auto mb-8 bg-cream-400/50 backdrop-blur-md p-1.5 rounded-full border border-cream-500/20 flex shadow-sm">
          <button
            onClick={() => {
              setMode('ask');
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.set('mode', 'ask');
                window.history.pushState({}, '', url.toString());
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
              mode === 'ask'
                ? 'bg-gradient-to-r from-saffron-500 to-terracotta-500 text-white shadow-md'
                : 'text-saffron-700 hover:text-saffron-600 hover:bg-cream-300/40'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Ask AI</span>
          </button>

          <button
            onClick={() => {
              setMode('read');
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.set('mode', 'read');
                window.history.pushState({}, '', url.toString());
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
              mode === 'read'
                ? 'bg-gradient-to-r from-saffron-500 to-terracotta-500 text-white shadow-md'
                : 'text-saffron-700 hover:text-saffron-600 hover:bg-cream-300/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Reading Mode</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-grow transition-all duration-300">
          <div className={mode === 'ask' ? 'animate-fade-in' : 'hidden'}>
            <AskMode apiBaseUrl={API_BASE_URL} />
          </div>
          <div className={mode === 'read' ? 'animate-fade-in' : 'hidden'}>
            <ReadMode
              apiBaseUrl={API_BASE_URL}
              isActive={mode === 'read'}
              onOpenShareModal={handleOpenShareModalFromVerse}
              targetCoordinate={targetCoordinate}
            />
          </div>
        </div>

        {/* Sacred Footer */}
        <footer className="mt-16 py-8 border-t border-cream-400/30 dark:border-[#2d261e] text-center text-xs text-saffron-800/60 dark:text-saffron-300/60 font-medium space-y-1.5">
          <p className="font-cinzel tracking-widest uppercase font-bold text-saffron-800 dark:text-saffron-300">DharmaPragya</p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Synthesizing canonical Sanatan Dharma wisdom with modern intelligence.
          </p>
        </footer>
      </div>

      {/* Personal Saved Sanctuary Drawer */}
      <SavedSanctuary
        isOpen={isSanctuaryOpen}
        onClose={() => setIsSanctuaryOpen(false)}
        onSelectVerse={handleSelectVerseFromSanctuary}
      />

      {/* Share / Export Card Modal */}
      <ShareCardModal
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData({ isOpen: false, details: null })}
        verseDetails={shareModalData.details}
      />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-100" />}>
      <HomePageContent />
    </Suspense>
  );
}
