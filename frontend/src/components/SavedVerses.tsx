'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark, Trash2, BookOpen, X, ArrowRight, BookMarked } from 'lucide-react';
import { BookmarkItem, getBookmarks, removeBookmark, clearBookmarks } from '../lib/bookmarks';

interface SavedVersesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVerse: (sourceName: string, chapterNumber: number, verseNumber: number) => void;
}

export default function SavedVerses({
  isOpen,
  onClose,
  onSelectVerse,
}: SavedVersesProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setBookmarks(getBookmarks());
    }
  }, [isOpen]);

  const handleRemove = (item: BookmarkItem, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBookmark(item.source_name, item.chapter_number, item.verse_number);
    setBookmarks(getBookmarks());
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved bookmarks?')) {
      clearBookmarks();
      setBookmarks([]);
    }
  };

  const handleVerseClick = (item: BookmarkItem) => {
    onSelectVerse(item.source_name, item.chapter_number, item.verse_number);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-cream-100 dark:bg-[#0b0f19] border border-cream-300 dark:border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-cream-200 via-cream-100 to-cream-200 dark:from-[#111827] dark:via-[#0b0f19] dark:to-[#111827] border-b border-cream-300 dark:border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-saffron-100 dark:bg-amber-950/70 text-saffron-800 dark:text-amber-300 flex items-center justify-center shadow-2xs border border-saffron-200 dark:border-amber-500/30">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-cinzel text-saffron-950 dark:text-amber-200">
                Saved Verses
              </h2>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                {bookmarks.length} {bookmarks.length === 1 ? 'verse' : 'verses'} bookmarked
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {bookmarks.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-stone-500 hover:text-terracotta-700 dark:text-slate-400 dark:hover:text-red-400 font-medium px-2.5 py-1.5 rounded-lg hover:bg-cream-300/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-amber-200 hover:bg-cream-300 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 text-stone-500 dark:text-slate-400">
              <div className="w-12 h-12 rounded-full bg-cream-200 dark:bg-slate-800 flex items-center justify-center text-stone-400 dark:text-slate-500">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <p className="text-sm font-bold font-cinzel text-stone-700 dark:text-slate-300">
                  No Saved Verses Yet
                </p>
                <p className="text-xs leading-relaxed">
                  Click the bookmark icon on any verse while reading to save it to your personal library for offline study.
                </p>
              </div>
            </div>
          ) : (
            bookmarks.map((item) => (
              <div
                key={item.id}
                onClick={() => handleVerseClick(item)}
                className="group p-4 bg-white dark:bg-slate-900/90 hover:bg-cream-200/90 dark:hover:bg-slate-800/90 border border-cream-300 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/40 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold font-cinzel text-saffron-800 dark:text-amber-400 tracking-wider">
                      {item.source_name} • Chapter {item.chapter_number}, Verse {item.verse_number}
                    </span>
                    <p className="text-xs sm:text-sm font-sanskrit text-stone-800 dark:text-slate-100 font-semibold line-clamp-2 leading-relaxed">
                      {item.sanskrit_text}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-slate-300 line-clamp-2 font-sans leading-relaxed">
                      {item.translation_text}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleRemove(item, e)}
                    className="p-1.5 text-stone-400 hover:text-terracotta-700 dark:text-slate-500 dark:hover:text-red-400 hover:bg-cream-300 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-end text-[11px] font-bold text-saffron-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Verse in Reader</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-cream-200/70 dark:bg-[#070A0F] border-t border-cream-300 dark:border-amber-500/20 flex items-center justify-between text-xs text-stone-500 dark:text-slate-400">
          <span>Stored locally on this device</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-cream-100 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 rounded-xl border border-cream-300 dark:border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
