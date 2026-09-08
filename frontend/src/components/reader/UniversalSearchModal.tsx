'use client';

import React from 'react';
import { Search, X, Command } from 'lucide-react';
import { VerseData, VedaMantra } from '../../types';

interface UniversalSearchModalProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isSearching: boolean;
  searchResults: VerseData[];
  vedaSearchResults: VedaMantra[];
  onSelectSearchResult: (verse: VerseData) => void;
  onSelectVedaSearchResult: (mantra: VedaMantra) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function UniversalSearchModal({
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen,
  isSearching,
  searchResults,
  vedaSearchResults,
  onSelectSearchResult,
  onSelectVedaSearchResult,
  searchInputRef,
  searchContainerRef,
}: UniversalSearchModalProps) {
  return (
    <div ref={searchContainerRef} className="relative w-full">
      <div className="relative flex items-center bg-white/95 dark:bg-[#0d121d]/95 backdrop-blur-md rounded-2xl border border-cream-400 dark:border-amber-500/20 shadow-xs focus-within:border-saffron-500 dark:focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-saffron-400/20 dark:focus-within:ring-amber-500/20 transition-all">
        <Search className="w-4 h-4 text-saffron-600 dark:text-amber-400 ml-4 shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          placeholder="Search all Vedas, Gita, Puranas & Upanishads (e.g. 'अग्निमीळे', 'karmanye', '2.47')... [Ctrl+K]"
          className="w-full py-2.5 px-3 text-xs sm:text-sm bg-transparent text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 font-medium focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
            }}
            className="p-1 text-stone-400 dark:text-slate-500 hover:text-stone-600 dark:hover:text-slate-300 mr-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-1 mr-3 px-2 py-0.5 rounded-md bg-cream-200 dark:bg-slate-800 border border-cream-300 dark:border-amber-500/20 text-[10px] font-mono text-stone-500 dark:text-slate-400 select-none">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>

      {/* Live Search Dropdown */}
      {isSearchOpen && (searchQuery.trim().length >= 2 || searchResults.length > 0 || vedaSearchResults.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0d121d] rounded-2xl border border-cream-400 dark:border-amber-500/20 shadow-xl overflow-hidden max-h-[65vh] sm:max-h-96 overflow-y-auto overscroll-contain z-50 animate-fade-in">
          <div className="p-3 bg-cream-100 dark:bg-slate-900 border-b border-cream-300 dark:border-amber-500/20 flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-slate-300 uppercase tracking-wider">
            <span>{isSearching ? 'Searching sacred scriptures...' : `${searchResults.length + vedaSearchResults.length} results found`}</span>
            <span className="text-[10px] text-stone-400 dark:text-slate-500 font-normal">Click record to jump</span>
          </div>

          {/* Vedic Search Matches */}
          {vedaSearchResults.map((m) => (
            <button
              key={`veda-${m.id}`}
              type="button"
              onClick={() => onSelectVedaSearchResult(m)}
              className="w-full p-3.5 text-left border-b border-cream-200 dark:border-amber-900/30 hover:bg-saffron-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex flex-col gap-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700/40">
                  {m.veda_name}
                </span>
                <span className="text-xs font-bold font-cinzel text-stone-600 dark:text-slate-400 group-hover:text-saffron-800 dark:group-hover:text-amber-300">
                  {m.coordinate_str}
                </span>
              </div>
              <p className="font-sanskrit text-sm font-semibold text-stone-900 dark:text-amber-200 line-clamp-1 mt-0.5">
                {m.sanskrit_svara || m.sanskrit_plain}
              </p>
            </button>
          ))}

          {/* Standard Scripture Matches */}
          {searchResults.map((v) => (
            <button
              key={`sec-${v.id}`}
              type="button"
              onClick={() => onSelectSearchResult(v)}
              className="w-full p-3.5 text-left border-b border-cream-200 dark:border-amber-900/30 hover:bg-saffron-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex flex-col gap-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-800 dark:text-amber-300 bg-saffron-100 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-saffron-300 dark:border-amber-700/40">
                  {v.source_name}
                </span>
                <span className="text-xs font-bold font-cinzel text-stone-600 dark:text-slate-400 group-hover:text-saffron-800 dark:group-hover:text-amber-300">
                  {v.chapter_name} • Verse {v.verse_number}
                </span>
              </div>
              <p className="font-sanskrit text-sm font-semibold text-stone-900 dark:text-amber-200 line-clamp-1 mt-0.5">
                {v.sanskrit_text}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
