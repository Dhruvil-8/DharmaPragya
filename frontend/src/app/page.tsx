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

  const handleModeChange = (newMode: 'ask' | 'read') => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', newMode);
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6 md:px-8 md:py-10 bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 text-stone-900 relative overflow-x-hidden selection:bg-saffron-200 selection:text-saffron-700">
      {/* Decorative background radial glow */}
      <div className="absolute top-[-8%] left-[50%] translate-x-[-50%] w-[700px] h-[500px] bg-gradient-to-b from-saffron-300/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl z-10 flex flex-col flex-grow">
        <Header 
          onOpenSanctuary={() => setIsSanctuaryOpen(true)} 
          mode={mode} 
          onModeChange={handleModeChange} 
        />

        {/* Daily Contemplation Shloka Widget */}
        <DailyContemplation
          onAskQuestion={handleAskQuestionFromDaily}
          onOpenShareModal={handleOpenShareModalFromDaily}
        />

        {/* Dynamic Mode Content Views */}
        <div className="w-full">
          <div className={mode === 'ask' ? 'block animate-fade-in' : 'hidden'}>
            <AskMode apiBaseUrl={API_BASE_URL} />
          </div>

          <div className={mode === 'read' ? 'block animate-fade-in' : 'hidden'}>
            <ReadMode 
              apiBaseUrl={API_BASE_URL}
              isActive={mode === 'read'}
              onOpenShareModal={handleOpenShareModalFromVerse}
              targetCoordinate={targetCoordinate}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-cream-400/40 text-center space-y-1">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase font-bold text-saffron-800">DharmaPragya</p>
          <p className="text-[10px] text-stone-500 font-medium">
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
