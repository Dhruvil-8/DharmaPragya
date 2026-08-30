'use client';

import { useState, useEffect, Suspense } from 'react';
import Header from '../components/Header';
import AskMode from '../components/AskMode';
import ReadMode from '../components/ReadMode';
import SavedSanctuary from '../components/SavedSanctuary';
import ShareCardModal from '../components/ShareCardModal';
import SidePanel from '../components/SidePanel';
import SacredHymnModal from '../components/SacredHymnModal';
import { VerseData } from '../types';
import { SacredHymn } from '../data/famousSuktams';

const API_BASE_URL = '';

function HomePageContent() {
  const [mode, setMode] = useState<'ask' | 'read'>('ask');
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [selectedHymnModal, setSelectedHymnModal] = useState<SacredHymn | null>(null);

  const [askInitialPrompt, setAskInitialPrompt] = useState<{
    query: string;
    sourceFilter?: string;
    timestamp: number;
  } | null>(null);

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
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'read');
      url.searchParams.set('source', sourceName);
      url.searchParams.set('chapter', String(chapterNumber));
      url.searchParams.set('verse', String(verseNumber));
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleSelectCoordinate = (coord: {
    sourceName: string;
    chapterNumber?: number;
    verseNumber?: number;
  }) => {
    setMode('read');
    setTargetCoordinate({
      sourceName: coord.sourceName,
      chapterNumber: coord.chapterNumber || 1,
      verseNumber: coord.verseNumber,
    });
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'read');
      url.searchParams.set('source', coord.sourceName);
      if (coord.chapterNumber) {
        url.searchParams.set('chapter', String(coord.chapterNumber));
      }
      if (coord.verseNumber) {
        url.searchParams.set('verse', String(coord.verseNumber));
      }
      window.history.pushState({}, '', url.toString());
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

  const handleHomeClick = () => {
    setMode('ask');
    setTargetCoordinate(null);
    if (typeof window !== 'undefined') {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.pushState({}, '', cleanUrl);
    }
  };

  const handleAskAboutVerse = (verse: VerseData) => {
    setMode('ask');
    const coordinate = verse.chapter_name && !verse.chapter_name.includes('Chapter')
      ? `${verse.source_name} (${verse.chapter_name})`
      : `${verse.source_name} Chapter ${verse.chapter_number}, Verse ${verse.verse_number}`;
    const promptQuery = `Please provide a focused and profound explanation specifically for ${coordinate}:\n"${verse.sanskrit_text}"`;
    setAskInitialPrompt({
      query: promptQuery,
      sourceFilter: verse.source_name,
      timestamp: Date.now(),
    });
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'ask');
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 dark:from-[#070A0F] dark:via-[#0B0F19] dark:to-[#070A0F] text-stone-900 dark:text-slate-100 relative overflow-x-hidden selection:bg-saffron-200 dark:selection:bg-amber-900/50 selection:text-saffron-700 dark:selection:text-amber-200 transition-colors duration-300">
      {/* Decorative background radial glow */}
      <div className="absolute top-[-8%] left-[50%] translate-x-[-50%] w-[700px] h-[500px] bg-gradient-to-b from-saffron-300/8 dark:from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 100% Fixed Header with Backdrop Blur */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-cream-100/95 dark:bg-[#070A0F]/95 backdrop-blur-md border-b border-cream-300/60 dark:border-amber-900/30 py-2.5 px-4 sm:px-8 shadow-xs transition-colors">
        <div className="max-w-4xl mx-auto w-full">
          <Header 
            onOpenSanctuary={() => setIsSanctuaryOpen(true)} 
            onOpenAbout={() => setIsAboutOpen(true)}
            mode={mode} 
            onModeChange={handleModeChange}
            onHomeClick={handleHomeClick}
          />
        </div>
      </header>

      <div className="w-full max-w-4xl z-10 flex flex-col flex-grow px-4 pt-18 pb-6 md:px-8">
        {/* Dynamic Mode Content Views */}
        <div className="w-full">
          <div className={mode === 'ask' ? 'block animate-fade-in' : 'hidden'}>
            <AskMode 
              apiBaseUrl={API_BASE_URL} 
              initialPrompt={askInitialPrompt}
            />
          </div>

          <div className={mode === 'read' ? 'block animate-fade-in' : 'hidden'}>
            <ReadMode 
              apiBaseUrl={API_BASE_URL}
              isActive={mode === 'read'}
              onOpenShareModal={handleOpenShareModalFromVerse}
              onAskAboutVerse={handleAskAboutVerse}
              targetCoordinate={targetCoordinate}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-cream-400/40 dark:border-amber-900/30 text-center space-y-2">
          <div className="flex items-center justify-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="font-cinzel tracking-[0.15em] uppercase font-bold text-saffron-800 dark:text-amber-400 hover:underline cursor-pointer"
            >
              About DharmaPragya
            </button>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-slate-500 font-medium">
            Synthesizing timeless Sanatan Dharma wisdom with modern intelligence.
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

      {/* Comprehensive Side Panel */}
      <SidePanel
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenSanctuary={() => setIsSanctuaryOpen(true)}
        mode={mode}
        onModeChange={handleModeChange}
        onSelectCoordinate={handleSelectCoordinate}
        onOpenHymnModal={(hymn) => setSelectedHymnModal(hymn)}
      />

      {/* Full Sacred Hymn & Mantra Modal */}
      <SacredHymnModal
        isOpen={!!selectedHymnModal}
        hymn={selectedHymnModal}
        onClose={() => setSelectedHymnModal(null)}
        onOpenInScripture={handleSelectCoordinate}
      />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-100 dark:bg-[#070A0F]" />}>
      <HomePageContent />
    </Suspense>
  );
}
