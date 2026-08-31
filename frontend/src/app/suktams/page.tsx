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
  ExternalLink,
  Flame
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
    division2?: number;
    verseNumber?: number;
  }) => {
    const params = new URLSearchParams();
    params.set('mode', 'read');
    params.set('source', coord.sourceName);
    if (coord.chapterNumber) params.set('chapter', String(coord.chapterNumber));
    if (coord.division2) params.set('div2', String(coord.division2));
    if (coord.verseNumber) params.set('verse', String(coord.verseNumber));
    window.location.href = `/?${params.toString()}`;
  };

  // Structured Data Schema for Google SEO
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Sacred Suktams & Mantras - Complete Vedic & Puranic Hymns',
    description: 'Explore and study authentic Vedic Suktams (Purusha Suktam, Nasadiya Suktam, Gayatri Mantra, Sri Rudram), Upanishadic Shanti Pathas, and Epic Stotrams with Sanskrit text and verse-by-verse translation.',
    url: 'https://dharmapragya.org/suktams',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: FAMOUS_SUKTAMS_AND_MANTRAS.map((hymn, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: hymn.name,
        alternateName: hymn.sanskritName,
        description: hymn.summary,
        url: `https://dharmapragya.org/suktams?hymn=${hymn.id}`
      }))
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 dark:from-[#070A0F] dark:via-[#0B0F19] dark:to-[#070A0F] text-stone-900 dark:text-slate-100 relative overflow-x-hidden selection:bg-saffron-200 dark:selection:bg-amber-900/50 selection:text-saffron-700 dark:selection:text-amber-200 transition-colors duration-300">
      
      {/* Google SEO JSON-LD Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Decorative background radial glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-[-8%] left-[50%] translate-x-[-50%] w-[700px] h-[500px] bg-gradient-to-b from-saffron-300/8 dark:from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" 
      />

      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-cream-100/95 dark:bg-[#070A0F]/95 backdrop-blur-md border-b border-cream-300/60 dark:border-amber-900/30 py-2.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold font-cinzel text-saffron-800 dark:text-amber-300 hover:text-saffron-600 dark:hover:text-amber-200 px-3 py-1.5 rounded-xl hover:bg-cream-300/60 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/"
            className="flex items-center shrink-0 group focus:outline-none transition-transform active:scale-95"
            title="DharmaPragya Home"
            aria-label="DharmaPragya Home"
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
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cream-100 via-saffron-50 to-cream-200 dark:from-[#0E1526] dark:via-[#0B0F19] dark:to-[#090D16] border border-cream-300 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-saffron-950 dark:text-amber-100 tracking-wide">
              Sacred Suktams & Mantras
            </h1>
            <p className="text-sm font-sanskrit text-saffron-800 dark:text-amber-400 font-bold">
              पवित्र सूक्त, महामंत्र एवं प्रमुख स्तोत्र संग्रह
            </p>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Explore authentic Vedic Suktams, Upanishadic Shanti Pathas, Bhagavad Gita Mahashlokas, and Puranic & Epic Stotrams with verse-by-verse recitation and complete translations.
            </p>
          </div>

          {/* Search Box */}
          <div className="mt-6 relative">
            <Search className="w-4 h-4 text-saffron-700 dark:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Purusha Suktam, Gayatri, Rudram, Asato Ma, Aditya Hridaya..."
              className="w-full pl-11 pr-4 py-3 bg-white/90 dark:bg-slate-900/90 border border-cream-300 dark:border-amber-500/30 rounded-2xl text-xs sm:text-sm text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-saffron-500/40 shadow-2xs transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-saffron-600 text-white border-saffron-700 dark:bg-amber-500 dark:text-stone-950 dark:border-amber-400 shadow-2xs'
                    : 'bg-white/80 dark:bg-slate-900/80 text-stone-700 dark:text-slate-300 border-cream-300 dark:border-slate-800 hover:border-saffron-400 dark:hover:border-amber-500/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400 px-1">
          <span>Showing {filteredHymns.length} sacred {filteredHymns.length === 1 ? 'hymn' : 'hymns'}</span>
          {selectedCategory !== 'All' && (
            <button
              type="button"
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="text-saffron-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Grid of Sacred Hymns */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHymns.map((hymn) => (
            <article
              key={hymn.id}
              onClick={() => setSelectedHymnModal(hymn)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedHymnModal(hymn);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Read ${hymn.name}`}
              className="p-5 rounded-3xl bg-white/95 dark:bg-slate-900/90 hover:bg-cream-50 dark:hover:bg-slate-800/95 border border-cream-300/80 dark:border-amber-500/20 hover:border-saffron-500/60 dark:hover:border-amber-400/50 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-saffron-500/40"
              style={{ contentVisibility: 'auto', containIntrinsicSize: '220px' }}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-saffron-100 dark:bg-amber-950/80 text-saffron-800 dark:text-amber-300 border border-saffron-200 dark:border-amber-600/30">
                    {hymn.category}
                  </span>
                  <span className="text-[11px] font-medium text-stone-500 dark:text-slate-400">
                    {hymn.exactScripture.split('(')[0].trim()}
                  </span>
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-bold font-cinzel text-stone-900 dark:text-amber-200 group-hover:text-saffron-700 dark:group-hover:text-amber-300 transition-colors">
                    {hymn.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-sanskrit text-saffron-800 dark:text-amber-400 font-semibold mt-0.5">
                    {hymn.sanskritName}
                  </p>
                </div>

                {hymn.openingSnippet && (
                  <div className="p-3 rounded-2xl bg-cream-200/50 dark:bg-black/30 border border-cream-300/40 dark:border-amber-500/10">
                    <p className="text-xs font-sanskrit text-stone-800 dark:text-slate-200 line-clamp-2 leading-relaxed italic">
                      "{hymn.openingSnippet}"
                    </p>
                  </div>
                )}

                <p className="text-xs text-stone-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-sans">
                  {hymn.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-cream-200/80 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-stone-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">
                  {hymn.canonicalRef}
                </span>

                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInScripture({
                        sourceName: hymn.sourceName,
                        chapterNumber: hymn.chapterNumber || hymn.division1 || 1,
                        division2: hymn.division2,
                        verseNumber: hymn.startVerse || hymn.verseNumber || 1,
                      });
                    }}
                    className="p-1.5 text-stone-500 hover:text-saffron-800 dark:text-slate-400 dark:hover:text-amber-300 rounded-xl hover:bg-cream-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-cream-300 dark:border-slate-700"
                    title="Open directly in Scripture Library"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-saffron-600 dark:bg-amber-500 text-white dark:text-stone-950 text-xs font-bold shadow-2xs group-hover:bg-saffron-700 dark:group-hover:bg-amber-400 transition-all">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Mode</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>

      </div>

      {/* Interactive Modal Reader directly fetching canonical DB verses */}
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
