'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  BookOpen, 
  Layers, 
  ChevronRight, 
  ArrowLeft,
  Compass,
  Database,
  ExternalLink
} from 'lucide-react';
import { FAMOUS_SUKTAMS_AND_MANTRAS, SacredHymn } from '../../data/famousSuktams';
import SacredHymnModal from '../../components/SacredHymnModal';

function SuktamsPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedHymnModal, setSelectedHymnModal] = useState<SacredHymn | null>(null);

  const categories = [
    'All',
    'Vedic Suktam',
    'Maha Mantra',
    'Upanishadic Shanti',
    'Gita Shloka',
    'Puranic & Epic Stotram'
  ];

  const filteredHymns = useMemo(() => {
    return FAMOUS_SUKTAMS_AND_MANTRAS.filter((hymn) => {
      const matchesCategory = selectedCategory === 'All' || hymn.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        hymn.name.toLowerCase().includes(q) ||
        hymn.sanskritName.includes(q) ||
        hymn.exactScripture.toLowerCase().includes(q) ||
        hymn.deityOrTheme.toLowerCase().includes(q) ||
        hymn.summary.toLowerCase().includes(q)
      );
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenInScripture = (coord: {
    sourceName: string;
    chapterNumber?: number;
    verseNumber?: number;
  }) => {
    const params = new URLSearchParams();
    params.set('mode', 'read');
    params.set('source', coord.sourceName);
    if (coord.chapterNumber) params.set('chapter', String(coord.chapterNumber));
    if (coord.verseNumber) params.set('verse', String(coord.verseNumber));
    window.location.href = `/?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 dark:from-[#070A0F] dark:via-[#0B0F19] dark:to-[#070A0F] text-stone-900 dark:text-slate-100 relative overflow-x-hidden selection:bg-saffron-200 dark:selection:bg-amber-900/50 selection:text-saffron-700 dark:selection:text-amber-200 transition-colors duration-300">
      {/* Decorative background radial glow */}
      <div className="absolute top-[-8%] left-[50%] translate-x-[-50%] w-[700px] h-[500px] bg-gradient-to-b from-saffron-300/8 dark:from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-cream-100/95 dark:bg-[#070A0F]/95 backdrop-blur-md border-b border-cream-300/60 dark:border-amber-900/30 py-2.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold font-cinzel text-saffron-800 dark:text-amber-300 hover:text-saffron-600 dark:hover:text-amber-200 px-3 py-1.5 rounded-xl hover:bg-cream-300/60 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sanctuary</span>
          </Link>

          <Link
            href="/"
            className="flex items-center shrink-0 group focus:outline-none transition-transform active:scale-95"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-saffron-400/50 dark:border-amber-500/40 shadow-2xs group-hover:border-saffron-600 dark:group-hover:border-amber-400 transition-colors">
              <Image
                src="/logo.png"
                alt="DharmaPragya Emblem"
                fill
                className="object-cover"
                sizes="32px"
                priority
              />
            </div>
          </Link>
        </div>
      </header>

      {/* Main Page Container */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 md:px-8 space-y-6">
        
        {/* Hero Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cream-100 via-saffron-50 to-cream-200 dark:from-[#0E1526] dark:via-[#0B0F19] dark:to-[#090D16] border border-cream-300 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-100/80 dark:bg-amber-950/70 border border-saffron-300 dark:border-amber-600/30 text-saffron-900 dark:text-amber-300 text-xs font-bold font-cinzel">
              <Database className="w-3.5 h-3.5" />
              <span>Direct Database Retrieval</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-saffron-950 dark:text-amber-100 tracking-wide">
              Sacred Suktams & Mantras
            </h1>
            <p className="text-sm font-sanskrit text-saffron-800 dark:text-amber-400 font-bold">
              पवित्र सूक्त, महामंत्र एवं प्रमुख स्तोत्र संग्रह
            </p>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Explore and study authentic Vedic Suktams, Upanishadic Shanti Pathas, Bhagavad Gita Mahashlokas, and Epic Stotrams retrieved directly from the canonical scripture database.
            </p>
          </div>

          {/* Search Box */}
          <div className="mt-6 relative">
            <Search className="w-4 h-4 text-saffron-700 dark:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hymns by name, deity, or scripture (e.g. Purusha Suktam, Gayatri, Aditya Hridaya)..."
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-900/90 border border-cream-400/80 dark:border-amber-500/30 rounded-2xl text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-saffron-500/50 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-amber-300 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold font-cinzel transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-saffron-700 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'bg-white/80 dark:bg-slate-800/80 text-stone-600 dark:text-slate-300 hover:bg-cream-200 dark:hover:bg-slate-700 border border-cream-300 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Hymn Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHymns.map((hymn) => {
            const verseCount = (hymn.endVerse && hymn.startVerse)
              ? (hymn.endVerse - hymn.startVerse + 1)
              : 1;

            return (
              <div
                key={hymn.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0E1422] border border-cream-300 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/40 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-800 dark:text-amber-300 bg-saffron-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-saffron-200 dark:border-amber-600/30">
                      {hymn.category}
                    </span>
                    <span className="text-xs font-bold text-stone-500 dark:text-amber-300/80 font-cinzel">
                      {hymn.exactScripture}
                    </span>
                  </div>

                  {/* Titles */}
                  <div>
                    <h2 className="text-base font-bold font-cinzel text-saffron-950 dark:text-amber-100 group-hover:text-saffron-700 dark:group-hover:text-amber-300 transition-colors">
                      {hymn.name}
                    </h2>
                    <p className="text-xs font-sanskrit text-saffron-800 dark:text-amber-400 font-semibold mt-0.5">
                      {hymn.sanskritName} • <span className="font-sans text-[11px] font-normal text-stone-500 dark:text-slate-400">{hymn.coordinateText}</span>
                    </p>
                  </div>

                  {/* Opening Sanskrit Shloka Snippet */}
                  {hymn.openingSnippet && (
                    <div className="p-3 rounded-2xl bg-cream-100 dark:bg-slate-950/80 border border-cream-300/70 dark:border-amber-900/30">
                      <p className="text-xs font-sanskrit text-stone-900 dark:text-amber-100/95 leading-relaxed font-semibold line-clamp-2">
                        {hymn.openingSnippet}
                      </p>
                    </div>
                  )}

                  {/* Summary */}
                  <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {hymn.summary}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-cream-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[11px] text-saffron-700 dark:text-amber-400 font-bold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{verseCount} {verseCount === 1 ? 'Mantra' : 'Mantras / Verses'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenInScripture({
                        sourceName: hymn.sourceName,
                        chapterNumber: hymn.chapterNumber || 1,
                        verseNumber: hymn.startVerse || hymn.verseNumber || 1,
                      })}
                      className="p-2 text-stone-500 hover:text-saffron-700 dark:text-slate-400 dark:hover:text-amber-300 rounded-xl hover:bg-cream-200 dark:hover:bg-slate-800 transition-colors"
                      title="Open in Scripture Library"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedHymnModal(hymn)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-saffron-700 hover:bg-saffron-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-bold font-cinzel rounded-xl shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>Read Full Hymn</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredHymns.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-cream-300 dark:border-amber-500/20 space-y-2">
            <p className="text-sm font-bold text-stone-600 dark:text-slate-300 font-cinzel">
              No hymns or mantras match "{searchQuery}"
            </p>
            <p className="text-xs text-stone-500 dark:text-slate-400">
              Try searching for another deity, scripture, or keyword.
            </p>
          </div>
        )}
      </div>

      {/* Full Interactive Hymn Modal */}
      <SacredHymnModal
        isOpen={!!selectedHymnModal}
        hymn={selectedHymnModal}
        onClose={() => setSelectedHymnModal(null)}
        onOpenInScripture={handleOpenInScripture}
      />
    </main>
  );
}

export default function SuktamsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-100 dark:bg-[#070A0F]" />}>
      <SuktamsPageContent />
    </Suspense>
  );
}
