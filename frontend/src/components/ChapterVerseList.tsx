'use client';

import React, { useState } from 'react';
import VerseBlock from './VerseBlock';
import { VerseData } from '../types';

interface ChapterVerseListProps {
  verses: VerseData[];
}

export default function ChapterVerseList({ verses }: ChapterVerseListProps) {
  const [visibleCount, setVisibleCount] = useState<number>(30);

  const visibleVerses = verses.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {visibleVerses.map((verse, idx) => (
        <div key={verse.id} id={`verse-${verse.verse_number}`}>
          <VerseBlock
            verse={verse}
            index={idx}
            isAskMode={false}
            readingMode="study"
          />
        </div>
      ))}

      {visibleCount < verses.length && (
        <div className="py-6 flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount(prev => prev + 30)}
            className="px-6 py-3 bg-white dark:bg-slate-900 hover:bg-cream-100 dark:hover:bg-slate-800 rounded-2xl border border-cream-400 dark:border-amber-500/30 text-xs font-bold text-stone-800 dark:text-slate-200 transition-all cursor-pointer shadow-xs hover:scale-105"
          >
            Showing {visibleCount} of {verses.length} verses — Load Next 30 Verses
          </button>
        </div>
      )}
    </div>
  );
}
