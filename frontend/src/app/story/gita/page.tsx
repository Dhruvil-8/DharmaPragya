'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GitaStoryPlayer, { StoryDisplayLanguage } from '../../../components/GitaStoryPlayer';
import { VerseData } from '../../../types';
import { GITA_CHAPTERS } from '../../../data/gitaChapters';

function GitaStoryContent() {
  const searchParams = useSearchParams();

  const rawChapter = searchParams.get('chapter');
  const rawVerse = searchParams.get('verse');
  const rawLang = searchParams.get('lang');

  const chapterNum = rawChapter ? Math.max(1, Math.min(18, parseInt(rawChapter, 10))) : 1;
  const verseNum = rawVerse ? Math.max(1, parseInt(rawVerse, 10)) : 1;
  
  const displayLang: StoryDisplayLanguage = 
    rawLang === 'sanskrit' || rawLang === 'hindi' ? rawLang : 'english';

  const [activeChapter, setActiveChapter] = useState<number>(chapterNum);
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveChapter(chapterNum);
  }, [chapterNum]);

  // Fetch chapter verses
  useEffect(() => {
    let isCancelled = false;

    async function fetchChapterData(ch: number) {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/read?source=${encodeURIComponent('Bhagavad Gita')}&chapter=${ch}&v=2`);
        if (!res.ok) {
          throw new Error(`Failed to load verses for Chapter ${ch} (Status: ${res.status})`);
        }
        const data = await res.json();
        if (!isCancelled) {
          if (Array.isArray(data)) {
            setVerses(data);
          } else {
            setVerses([]);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to fetch Gita story verses:", err);
          setError(err instanceof Error ? err.message : 'Failed to load chapter verses');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchChapterData(activeChapter);

    return () => {
      isCancelled = true;
    };
  }, [activeChapter]);

  const handleSelectChapter = (newChapter: number) => {
    setActiveChapter(newChapter);
    const url = new URL(window.location.href);
    url.searchParams.set('chapter', String(newChapter));
    url.searchParams.set('verse', '1');
    window.history.pushState({}, '', url.toString());
  };

  return (
    <GitaStoryPlayer
      initialChapter={activeChapter}
      initialVerseNumber={verseNum}
      initialLanguage={displayLang}
      verses={verses}
      isLoading={isLoading}
      error={error}
      onSelectChapter={handleSelectChapter}
    />
  );
}

export default function GitaStoryPage() {
  return (
    <Suspense 
      fallback={
        <div className="w-full h-[100dvh] bg-black flex flex-col items-center justify-center text-amber-200 gap-4">
          <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          <span className="text-sm font-cinzel tracking-widest uppercase">
            Entering Gita Darshan...
          </span>
        </div>
      }
    >
      <GitaStoryContent />
    </Suspense>
  );
}
