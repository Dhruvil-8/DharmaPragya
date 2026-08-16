import React, { useState, useEffect } from 'react';
import { BookmarkItem } from '../types';
import { getBookmarks, removeBookmark } from '../lib/bookmarks';
import { Bookmark, X, ArrowRight, Trash2, BookOpen } from 'lucide-react';

interface SavedSanctuaryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVerse: (sourceName: string, chapterNumber: number, verseNumber: number) => void;
}

export default function SavedSanctuary({ isOpen, onClose, onSelectVerse }: SavedSanctuaryProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  const loadBookmarks = () => {
    setBookmarks(getBookmarks());
  };

  useEffect(() => {
    if (isOpen) {
      loadBookmarks();
    }
    const handleUpdate = () => loadBookmarks();
    window.addEventListener('dharmapragya_bookmarks_updated', handleUpdate);
    return () => window.removeEventListener('dharmapragya_bookmarks_updated', handleUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRemove = (e: React.MouseEvent, item: BookmarkItem) => {
    e.stopPropagation();
    removeBookmark(item.source_name, item.chapter_number, item.verse_number);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md transform transition-all duration-300 ease-out">
          <div className="h-full flex flex-col bg-cream-100 dark:bg-[#171411] border-l border-cream-400 dark:border-[#3a3229] shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-cream-300 to-cream-200 dark:from-[#221c17] dark:to-[#1a1613] border-b border-cream-400 dark:border-[#2d261e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-saffron-100 dark:bg-saffron-950/60 text-saffron-600 dark:text-saffron-400">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-cinzel font-bold text-lg text-saffron-800 dark:text-saffron-200">
                    Saved Sanctuary
                  </h2>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 font-sans tracking-wide uppercase">
                    {bookmarks.length} {bookmarks.length === 1 ? 'Sacred Verse' : 'Sacred Verses'} Saved
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-stone-500 hover:text-saffron-700 dark:hover:text-saffron-300 hover:bg-cream-400/40 dark:hover:bg-[#2e2720] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bookmarks List */}
            <div className="flex-1 px-6 py-6 overflow-y-auto space-y-4">
              {bookmarks.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-cream-300 dark:bg-[#25201b] border border-cream-400 dark:border-[#3a3229] flex items-center justify-center mx-auto text-stone-400">
                    <BookOpen className="w-6 h-6 text-saffron-600/60" />
                  </div>
                  <p className="font-cinzel font-bold text-sm text-stone-700 dark:text-stone-300">
                    No Saved Verses Yet
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
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
                    className="group relative p-4 bg-white dark:bg-[#1f1a15] rounded-2xl border border-cream-400 dark:border-[#3a3229] hover:border-saffron-500/40 dark:hover:border-saffron-400/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-saffron-950/60 px-2.5 py-0.5 rounded-full border border-saffron-200/40 dark:border-saffron-900/40 uppercase tracking-wider">
                        {item.source_name}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleRemove(e, item)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-saffron-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>

                    <h4 className="font-cinzel font-bold text-xs text-stone-800 dark:text-stone-200">
                      Ch. {item.chapter_number}, Verse {item.verse_number}
                    </h4>

                    <p className="font-cinzel text-xs text-stone-700 dark:text-stone-300 font-semibold line-clamp-2">
                      {item.sanskrit_text}
                    </p>

                    {item.translation_text && (
                      <p className="font-serif italic text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                        &quot;{item.translation_text}&quot;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-cream-200/50 dark:bg-[#141210] border-t border-cream-400/50 dark:border-[#2d261e] text-center text-[10px] text-stone-500 dark:text-stone-400 font-sans">
              100% Private &amp; Stored Locally in Your Browser
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
