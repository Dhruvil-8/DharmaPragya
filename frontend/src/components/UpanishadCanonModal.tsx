'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  CheckCircle2,
  ScrollText,
  Info
} from 'lucide-react';
import { 
  CANONICAL_108_UPANISHADS, 
  VEDIC_SHANTI_MANTRAS, 
  VedicTradition, 
  UpanishadCategory
} from '../data/canonicalUpanishads';

interface UpanishadCanonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUpanishad?: (sourceName: string) => void;
}

export default function UpanishadCanonModal({
  isOpen,
  onClose,
  onSelectUpanishad
}: UpanishadCanonModalProps) {
  const [selectedVeda, setSelectedVeda] = useState<VedicTradition | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<UpanishadCategory | 'ALL'>('ALL');
  const [isShantiExpanded, setIsShantiExpanded] = useState(false);

  // Filtered Upanishads
  const filteredUpanishads = useMemo(() => {
    return CANONICAL_108_UPANISHADS.filter(u => {
      // Veda Filter
      if (selectedVeda !== 'ALL' && u.veda !== selectedVeda) return false;

      // Category Filter
      if (selectedCategory !== 'ALL' && u.category !== selectedCategory) return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesSanskrit = u.sanskritName.toLowerCase().includes(q);
        const matchesMuktika = u.muktikaNumber.toString() === q || `muktika #${u.muktikaNumber}`.includes(q);
        const matchesCategory = u.category.toLowerCase().includes(q);
        const matchesVeda = u.veda.toLowerCase().includes(q);
        return matchesName || matchesSanskrit || matchesMuktika || matchesCategory || matchesVeda;
      }

      return true;
    });
  }, [selectedVeda, selectedCategory, searchQuery]);

  // Active Shanti Mantra to show in header banner
  const activeShantiMantra = useMemo(() => {
    if (selectedVeda !== 'ALL') {
      return VEDIC_SHANTI_MANTRAS[selectedVeda];
    }
    return VEDIC_SHANTI_MANTRAS['Shukla Yajurveda']; // Default to Purnamadah
  }, [selectedVeda]);

  // Vedic badge color styling
  const getVedaBadgeClasses = (veda: VedicTradition) => {
    switch (veda) {
      case 'Rigveda':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40';
      case 'Shukla Yajurveda':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40';
      case 'Krishna Yajurveda':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40';
      case 'Samaveda':
        return 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/40';
      case 'Atharvaveda':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40';
      default:
        return 'bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700';
    }
  };

  const getCategoryBadgeClasses = (category: UpanishadCategory) => {
    switch (category) {
      case 'Mukhya':
        return 'bg-saffron-100 dark:bg-amber-900/40 text-saffron-800 dark:text-amber-300 border-saffron-300 dark:border-amber-700/50 font-extrabold';
      case 'Yoga':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40 font-bold';
      case 'Sannyasa':
        return 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40 font-bold';
      case 'Shaiva':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40 font-bold';
      case 'Vaishnava':
        return 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/40 font-bold';
      case 'Shakta':
        return 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/40 font-bold';
      default:
        return 'bg-stone-50 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border-stone-200 dark:border-slate-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-cream-50 dark:bg-[#0B0F17] rounded-3xl border border-saffron-300/80 dark:border-amber-500/30 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-cream-300/80 dark:border-amber-900/30 bg-gradient-to-r from-saffron-100/70 via-cream-100 to-amber-50 dark:from-[#111726] dark:via-[#0E131F] dark:to-[#111726] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-saffron-700 flex items-center justify-center text-white shadow-md shrink-0">
              <ScrollText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-saffron-800 dark:text-amber-400">
                  Muktika Canon (अष्टोत्तरशत उपनिषदः)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-saffron-200 dark:bg-amber-900/60 text-saffron-900 dark:text-amber-200 border border-saffron-300/50">
                  108 Upanishads
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold font-cinzel text-saffron-950 dark:text-amber-200 leading-tight">
                Canonical Upanishad Index by Veda
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-600 dark:text-slate-400 mt-0.5">
                Authentic classification organized by the 5 Vedic traditions • 15 Available with Verses in DharmaPragya
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white border border-cream-300 dark:border-amber-500/20 shadow-2xs transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. VEDIC SHANTI MANTRA BANNER */}
        <div className="px-5 sm:px-6 py-3.5 bg-gradient-to-r from-amber-50/90 via-cream-100 to-saffron-50/80 dark:from-[#131929] dark:via-[#0F1422] dark:to-[#131929] border-b border-cream-300/60 dark:border-amber-900/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-saffron-900 dark:text-amber-300 font-cinzel">
                {activeShantiMantra.nameSanskrit}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-slate-400 hidden md:inline">
                ({activeShantiMantra.essence})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsShantiExpanded(!isShantiExpanded)}
              className="text-[11px] font-bold text-saffron-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
            >
              <span>{isShantiExpanded ? 'Hide Peace Chanting' : 'View Vedic Peace Chanting (शान्ति मन्त्र)'}</span>
            </button>
          </div>

          {isShantiExpanded && (
            <div className="mt-3 p-4 bg-white/90 dark:bg-slate-900/80 rounded-2xl border border-saffron-200 dark:border-amber-500/20 shadow-inner space-y-2.5 animate-fade-in">
              <p className="font-sanskrit text-sm sm:text-base text-stone-900 dark:text-amber-100 font-bold leading-relaxed text-center whitespace-pre-line">
                {activeShantiMantra.sanskrit}
              </p>
              <p className="text-[11px] sm:text-xs text-stone-600 dark:text-slate-400 italic text-center leading-relaxed">
                {activeShantiMantra.transliteration}
              </p>
              <div className="pt-2 border-t border-cream-200 dark:border-slate-800 text-[11px] sm:text-xs text-stone-700 dark:text-slate-300 leading-relaxed text-center">
                <span className="font-bold text-saffron-800 dark:text-amber-400">Meaning: </span>
                {activeShantiMantra.translation}
              </div>
            </div>
          )}
        </div>

        {/* 3. VEDIC TABS & SEARCH BAR */}
        <div className="p-4 sm:p-5 border-b border-cream-300/80 dark:border-amber-900/30 bg-white/60 dark:bg-[#0D121D]/80 backdrop-blur-xs space-y-3 shrink-0">
          {/* Vedic Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {([
              { id: 'ALL', label: 'All 108 Canon', count: 108 },
              { id: 'Rigveda', label: 'Rigveda (ऋग्वेद)', count: 10 },
              { id: 'Shukla Yajurveda', label: 'Shukla Yajur (शुक्ल)', count: 19 },
              { id: 'Krishna Yajurveda', label: 'Krishna Yajur (कृष्ण)', count: 32 },
              { id: 'Samaveda', label: 'Samaveda (सामवेद)', count: 16 },
              { id: 'Atharvaveda', label: 'Atharvaveda (अथर्ववेद)', count: 31 }
            ] as const satisfies readonly { id: VedicTradition | 'ALL'; label: string; count: number }[]).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedVeda(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedVeda === tab.id
                    ? 'bg-saffron-600 text-white shadow-xs'
                    : 'bg-cream-100 dark:bg-slate-900 text-stone-700 dark:text-slate-300 border border-cream-300 dark:border-amber-500/20 hover:bg-cream-200 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedVeda === tab.id
                    ? 'bg-white/30 text-white'
                    : 'bg-cream-200 dark:bg-slate-800 text-stone-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Upanishad name, Sanskrit, Muktika #, or category..."
                className="w-full pl-10 pr-4 py-2 bg-cream-100/80 dark:bg-slate-900 rounded-xl border border-cream-300 dark:border-amber-500/25 text-xs text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:border-saffron-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Classification Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-0.5">
              {([
                { id: 'ALL', label: 'All Types' },
                { id: 'Mukhya', label: 'Mukhya (Major)' },
                { id: 'Yoga', label: 'Yoga' },
                { id: 'Sannyasa', label: 'Sannyasa' },
                { id: 'Shaiva', label: 'Shaiva' },
                { id: 'Vaishnava', label: 'Vaishnava' },
                { id: 'Shakta', label: 'Shakta' },
                { id: 'Samanya', label: 'Vedanta' }
              ] as const satisfies readonly { id: UpanishadCategory | 'ALL'; label: string }[]).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-stone-800 text-white dark:bg-amber-400 dark:text-stone-950'
                      : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 border border-cream-300 dark:border-slate-800 hover:bg-cream-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. UPANISHADS GRID LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-cream-50/50 dark:bg-[#080C14]">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400 font-medium px-1">
            <span>Showing {filteredUpanishads.length} of 108 Upanishads</span>
            <span>Reference: Muktika Canon & 108 Upanishads PDF</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredUpanishads.map((up) => {
              return (
                <div
                  key={up.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    up.inDatabase
                      ? 'bg-white dark:bg-[#0F1422] border-saffron-300/80 dark:border-amber-500/40 shadow-xs hover:shadow-md hover:border-saffron-500'
                      : 'bg-white/80 dark:bg-[#0D111A] border-cream-300/70 dark:border-slate-800/80 hover:border-cream-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top Row: Muktika # & Badges */}
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-slate-200 border border-stone-200 dark:border-slate-700">
                          #{up.muktikaNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border ${getVedaBadgeClasses(up.veda)}`}>
                          {up.veda}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border ${getCategoryBadgeClasses(up.category)}`}>
                        {up.category}
                      </span>
                    </div>

                    {/* Titles */}
                    <h3 className="font-extrabold font-cinzel text-base text-stone-900 dark:text-amber-200 leading-snug">
                      {up.name}
                    </h3>
                    <p className="font-sanskrit text-xs text-saffron-800 dark:text-amber-400 font-semibold mt-0.5">
                      {up.sanskritName}
                    </p>

                    {/* Summary */}
                    <p className="text-[11px] text-stone-600 dark:text-slate-400 line-clamp-3 leading-relaxed mt-2 font-normal">
                      {up.summary}
                    </p>
                  </div>

                  {/* Bottom Actions / Availability */}
                  <div className="pt-3 mt-3 border-t border-cream-200 dark:border-slate-800/80 flex items-center justify-between">
                    {up.inDatabase ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{up.verseCount} Verses</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (up.dbSourceName && onSelectUpanishad) {
                              onSelectUpanishad(up.dbSourceName);
                              onClose();
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Now</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] text-stone-500 dark:text-slate-500 font-medium">
                          PDF Page {up.startPage}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-400 dark:text-slate-500 italic">
                          Muktika Canon
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUpanishads.length === 0 && (
            <div className="py-16 text-center space-y-2">
              <Info className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm font-bold text-stone-700 dark:text-slate-300">
                No Upanishads matched your search.
              </p>
              <p className="text-xs text-stone-500 dark:text-slate-500">
                Try searching with another keyword or resetting the filter tabs.
              </p>
            </div>
          )}
        </div>

        {/* 5. MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-cream-300/80 dark:border-amber-900/30 bg-cream-100/90 dark:bg-[#0B0F17] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-stone-600 dark:text-slate-400">
            <span className="font-bold text-stone-800 dark:text-slate-200">The Muktika Canon</span> establishes that studying the 10 Principal Upanishads or the full 108 dissolves all doubt and leads to Kaivalya Mukti.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white dark:bg-slate-800 hover:bg-cream-200 dark:hover:bg-slate-700 border border-cream-400 dark:border-slate-700 rounded-xl text-xs font-bold text-stone-800 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
}
