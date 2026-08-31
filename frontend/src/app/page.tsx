'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import AskMode from '../components/AskMode';
import ReadMode from '../components/ReadMode';
import { VerseData } from '../types';
import { SacredHymn, FAMOUS_SUKTAMS_AND_MANTRAS } from '../data/famousSuktams';

const SavedVerses = dynamic(() => import('../components/SavedVerses'), { ssr: false });
const ShareCardModal = dynamic(() => import('../components/ShareCardModal'), { ssr: false });
const SidePanel = dynamic(() => import('../components/SidePanel'), { ssr: false });
const SacredHymnModal = dynamic(() => import('../components/SacredHymnModal'), { ssr: false });

const API_BASE_URL = '';

function HomePageContent() {
  const [mode, setMode] = useState<'ask' | 'read'>('ask');
  const [isSavedOpen, setIsSavedOpen] = useState(false);
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
    division2?: number;
    verseNumber?: number;
  } | null>(null);

  // Parse deep-link URL params on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      const source = params.get('source');
      const chapter = params.get('chapter');
      const div2 = params.get('div2');
      const verse = params.get('verse');
      const hymnId = params.get('hymn') || params.get('suktam');

      if (hymnId) {
        const found = FAMOUS_SUKTAMS_AND_MANTRAS.find(h => h.id === hymnId);
        if (found) {
          setSelectedHymnModal(found);
        }
      }

      if (urlMode === 'read' || source) {
        setMode('read');
        if (source) {
          setTargetCoordinate({
            sourceName: source,
            chapterNumber: chapter ? parseInt(chapter, 10) : 1,
            division2: div2 ? parseInt(div2, 10) : undefined,
            verseNumber: verse ? parseInt(verse, 10) : undefined,
          });
        }
      } else if (urlMode === 'saved' || urlMode === 'bookmarks') {
        setIsSavedOpen(true);
      } else if (urlMode === 'suktams' || urlMode === 'hymns') {
        setIsAboutOpen(true);
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

  const handleSelectSavedVerse = (sourceName: string, chapterNumber: number, verseNumber: number) => {
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

  const handleAskAboutVerse = (verse: VerseData) => {
    setMode('ask');
    setAskInitialPrompt({
      query: `Please explain the philosophical meaning, context, and spiritual significance of ${verse.source_name} Chapter ${verse.chapter_number}, Verse ${verse.verse_number}: "${verse.sanskrit_text}".`,
      sourceFilter: verse.source_name,
      timestamp: Date.now(),
    });
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'ask');
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleSelectCoordinate = (coord: {
    sourceName: string;
    chapterNumber?: number;
    division2?: number;
    verseNumber?: number;
  }) => {
    setMode('read');
    if (coord.chapterNumber) {
      setTargetCoordinate({
        sourceName: coord.sourceName,
        chapterNumber: coord.chapterNumber,
        division2: coord.division2,
        verseNumber: coord.verseNumber,
      });
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('mode', 'read');
        url.searchParams.set('source', coord.sourceName);
        url.searchParams.set('chapter', String(coord.chapterNumber));
        if (coord.division2) url.searchParams.set('div2', String(coord.division2));
        if (coord.verseNumber) url.searchParams.set('verse', String(coord.verseNumber));
        window.history.pushState({}, '', url.toString());
      }
    }
    setIsAboutOpen(false);
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
      const url = new URL(window.location.origin + window.location.pathname);
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <main className="min-h-screen bg-cream-100 dark:bg-[#070A0F] text-stone-900 dark:text-slate-100 flex flex-col items-center justify-between relative overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* Visual Background Ornaments */}
      <div 
        aria-hidden="true" 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-saffron-200/40 via-amber-100/20 to-transparent dark:from-amber-950/20 dark:via-transparent dark:to-transparent pointer-events-none blur-3xl" 
      />

      {/* 100% Fixed Header with Backdrop Blur */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-cream-100/95 dark:bg-[#070A0F]/95 backdrop-blur-md border-b border-cream-300/60 dark:border-amber-900/30 py-2.5 px-4 sm:px-8 shadow-xs transition-colors">
        <div className="max-w-4xl mx-auto w-full">
          <Header 
            onOpenSaved={() => setIsSavedOpen(true)} 
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

      {/* Personal Saved Verses Drawer */}
      <SavedVerses
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        onSelectVerse={handleSelectSavedVerse}
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
        onOpenSaved={() => setIsSavedOpen(true)}
        mode={mode}
        onModeChange={handleModeChange}
        onSelectCoordinate={handleSelectCoordinate}
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
