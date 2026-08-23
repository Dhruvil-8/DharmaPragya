'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, X, ArrowRight, Trash2, BookOpen } from 'lucide-react';
import { getBookmarks, removeBookmark, BookmarkItem } from '../lib/bookmarks';

interface SavedSanctuaryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVerse: (sourceName: string, chapterNumber: number, verseNumber: number) => void;
}

export default function SavedSanctuary({
  isOpen,
  onClose,
  onSelectVerse,
}: SavedSanctuaryProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setBookmarks(getBookmarks());
    }
  }, [isOpen]);

  const handleRemove = (e: React.MouseEvent, item: BookmarkItem) => {
    e.stopPropagation();
    removeBookmark(item.source_name, item.chapter_number, item.verse_number);
    setBookmarks(getBookmarks());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md transform transition-all duration-300 ease-out">
          <div className="h-full flex flex-col bg-cream-100 dark:bg-[#0d121d] border-l border-cream-400 dark:border-amber-500/20 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-cream-300 to-cream-200 dark:from-[#111827] dark:to-[#0d121d] border-b border-cream-400/40 dark:border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-saffron-500 dark:bg-amber-600 text-white shadow-xs">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-cinzel font-bold text-lg text-saffron-800 dark:text-amber-300">
                    Saved Sanctuary
                  </h2>
                  <p className="text-[10px] text-stone-500 dark:text-slate-400 font-sans tracking-wide uppercase">
                    {bookmarks.length} {bookmarks.length === 1 ? 'Sacred Verse' : 'Sacred Verses'} Saved
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-stone-500 dark:text-slate-400 hover:text-saffron-700 dark:hover:text-amber-300 hover:bg-cream-400/40 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bookmarks List */}
            <div className="flex-1 px-6 py-6 overflow-y-auto space-y-4">
              {bookmarks.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-cream-300 dark:bg-slate-800 border border-cream-400 dark:border-amber-500/20 flex items-center justify-center mx-auto text-stone-400">
                    <BookOpen className="w-6 h-6 text-saffron-600/60 dark:text-amber-400/60" />
                  </div>
                  <p className="font-cinzel font-bold text-sm text-stone-700 dark:text-slate-300">
                    No Saved Verses Yet
                  </p>
                  <p className="text-xs text-stone-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Click the bookmark icon on any verse while reading to save it to your personal sanctuary for offline study.
                  </p>
                </div>
              ) : (
                bookmarks.map((item) => (
                  <div
                    key={`${item.source_name}-${item.chapter_number}-${item.verse_number}`}
                    onClick={() => {
                      onSelectVerse(item.source_name, item.chapter_number, item.verse_number);
                      onClose();
                    }}
                    className="group relative p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-cream-400 dark:border-amber-500/20 hover:border-saffron-500/40 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-saffron-600 dark:text-amber-300 bg-saffron-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-saffron-200/40 dark:border-amber-700/40 uppercase tracking-wider">
                        {item.source_name}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleRemove(e, item)}
                          className="p-1 text-stone-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500 group-hover:text-saffron-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>

                    <h4 className="font-cinzel font-bold text-xs text-stone-800 dark:text-slate-200">
                      Ch. {item.chapter_number}, Verse {item.verse_number}
                    </h4>

                    <p className="font-sanskrit text-xs text-stone-700 dark:text-amber-200 font-semibold line-clamp-2">
                      {item.sanskrit_text}
                    </p>

                    {item.translation_text && (
                      <p className="font-serif italic text-xs text-stone-500 dark:text-slate-400 line-clamp-2">
                        &quot;{item.translation_text}&quot;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-cream-200/60 dark:bg-slate-900/90 border-t border-cream-400/40 dark:border-amber-500/20 text-center text-[10px] text-stone-500 dark:text-slate-400">
              Verses are saved securely in your browser &bull; Zero login required
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
