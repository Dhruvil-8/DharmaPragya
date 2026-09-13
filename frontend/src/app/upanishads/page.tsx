'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  ChevronRight, 
  ArrowLeft,
  ScrollText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { 
  CANONICAL_108_UPANISHADS, 
  VEDIC_SHANTI_MANTRAS, 
  VedicTradition, 
  UpanishadCategory 
} from '../../data/canonicalUpanishads';
import ThemeToggle from '../../components/ThemeToggle';

function UpanishadsPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVeda, setSelectedVeda] = useState<VedicTradition | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<UpanishadCategory | 'ALL'>('ALL');
  const [isShantiExpanded, setIsShantiExpanded] = useState(false);

  // Veda tabs configuration
  const vedaTabs: { id: VedicTradition | 'ALL'; label: string; count: number }[] = [
    { id: 'ALL', label: 'All 108 Canon', count: 108 },
    { id: 'Rigveda', label: 'Rigveda (ऋग्वेद)', count: 10 },
    { id: 'Shukla Yajurveda', label: 'Shukla Yajur (शुक्ल)', count: 19 },
    { id: 'Krishna Yajurveda', label: 'Krishna Yajur (कृष्ण)', count: 32 },
    { id: 'Samaveda', label: 'Samaveda (सामवेद)', count: 16 },
    { id: 'Atharvaveda', label: 'Atharvaveda (अथर्ववेद)', count: 31 },
  ];

  // Subject classification pills
  const categories: { id: UpanishadCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Types' },
    { id: 'Mukhya', label: 'Mukhya (Major)' },
    { id: 'Yoga', label: 'Yoga' },
    { id: 'Sannyasa', label: 'Sannyasa' },
    { id: 'Shaiva', label: 'Shaiva' },
    { id: 'Vaishnava', label: 'Vaishnava' },
    { id: 'Shakta', label: 'Shakta' },
    { id: 'Samanya', label: 'Vedanta' },
  ];

  // Active Shanti Mantra based on selected Veda
  const activeShantiMantra = useMemo(() => {
    if (selectedVeda !== 'ALL') {
      return VEDIC_SHANTI_MANTRAS[selectedVeda];
    }
    return VEDIC_SHANTI_MANTRAS['Shukla Yajurveda']; // Default to universal Purnamadah
  }, [selectedVeda]);

  // Filter logic
  const filteredUpanishads = useMemo(() => {
    return CANONICAL_108_UPANISHADS.filter((up) => {
      // Veda Filter
      if (selectedVeda !== 'ALL' && up.veda !== selectedVeda) return false;

      // Category Filter
      if (selectedCategory !== 'ALL' && up.category !== selectedCategory) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = up.name.toLowerCase().includes(q);
        const matchesSanskrit = up.sanskritName.includes(q);
        const matchesNumber = up.muktikaNumber.toString() === q || `#${up.muktikaNumber}` === q;
        const matchesVeda = up.veda.toLowerCase().includes(q);
        const matchesCategory = up.category.toLowerCase().includes(q);
        const matchesSummary = up.summary.toLowerCase().includes(q);
        return matchesName || matchesSanskrit || matchesNumber || matchesVeda || matchesCategory || matchesSummary;
      }

      return true;
    });
  }, [searchQuery, selectedVeda, selectedCategory]);

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

  const getCategoryBadgeClasses = (cat: UpanishadCategory) => {
    switch (cat) {
      case 'Mukhya':
        return 'bg-saffron-100 dark:bg-amber-900/50 text-saffron-900 dark:text-amber-300 border-saffron-300 dark:border-amber-700/50 font-extrabold';
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
        return 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 dark:from-[#070A0F] dark:via-[#0B0F19] dark:to-[#070A0F] text-stone-900 dark:text-slate-100 relative overflow-x-hidden selection:bg-saffron-200 dark:selection:bg-amber-900/50 selection:text-saffron-700 dark:selection:text-amber-200 transition-colors duration-300">
      
      {/* Decorative ambient radial glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-[-8%] left-[50%] translate-x-[-50%] w-[700px] h-[500px] bg-gradient-to-b from-saffron-300/10 dark:from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" 
      />

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-cream-100/95 dark:bg-[#070A0F]/95 backdrop-blur-md border-b border-cream-300/60 dark:border-amber-900/30 py-2.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold font-cinzel text-saffron-800 dark:text-amber-300 hover:text-saffron-600 dark:hover:text-amber-200 px-3 py-1.5 rounded-xl hover:bg-cream-300/60 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/?mode=read"
              className="text-xs font-bold text-stone-600 dark:text-slate-400 hover:text-saffron-700 dark:hover:text-amber-300 px-3 py-1.5 rounded-xl hover:bg-cream-300/50 dark:hover:bg-slate-800 transition-colors"
            >
              Read Mode
            </Link>
            <Link
              href="/suktams"
              className="text-xs font-bold text-stone-600 dark:text-slate-400 hover:text-saffron-700 dark:hover:text-amber-300 px-3 py-1.5 rounded-xl hover:bg-cream-300/50 dark:hover:bg-slate-800 transition-colors hidden sm:inline-block"
            >
              Sacred Suktams
            </Link>
            <ThemeToggle />
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
        </div>
      </header>

      {/* Main Page Container */}
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-16 md:px-8 space-y-6">
        
        {/* Hero Section */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cream-100 via-saffron-50 to-cream-200 dark:from-[#0E1526] dark:via-[#0B0F19] dark:to-[#090D16] border border-cream-300 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-saffron-800 dark:text-amber-400">
                Muktika Canon • मुक्ति का स्रोत
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-saffron-200/80 dark:bg-amber-900/60 text-saffron-900 dark:text-amber-200 border border-saffron-300/50">
                108 Upanishads
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-saffron-950 dark:text-amber-100 tracking-wide">
              108 Canonical Upanishads
            </h1>

            <p className="text-sm font-sanskrit text-saffron-800 dark:text-amber-400 font-bold">
              अष्टोत्तरशत उपनिषदः — The Five Vedic Lineages
            </p>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              In the Muktika Upanishad, Lord Rama instructs Hanuman that studying the 108 Upanishads brings supreme spiritual liberation (Kaivalya). Explore the entire canon classified across Rigveda, Shukla Yajurveda, Krishna Yajurveda, Samaveda, and Atharvaveda with authentic Sanskrit text and English translations.
            </p>
          </div>

          {/* Search Box */}
          <div className="mt-6 relative">
            <Search className="w-4 h-4 text-saffron-700 dark:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Upanishad name (e.g. Isha, Mandukya, Kaivalya), Sanskrit, #1-108, or theme..."
              className="w-full pl-11 pr-10 py-3 bg-white/90 dark:bg-slate-900/90 border border-cream-300 dark:border-amber-500/30 rounded-2xl text-xs sm:text-sm text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-saffron-500/40 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Vedic Tradition Tabs */}
          <div className="mt-5 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-800 dark:text-amber-400 block">
              Filter by Vedic Lineage:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {vedaTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedVeda(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedVeda === tab.id
                      ? 'bg-saffron-600 text-white shadow-xs dark:bg-amber-500 dark:text-stone-950'
                      : 'bg-white/80 dark:bg-slate-900/80 text-stone-700 dark:text-slate-300 border border-cream-300 dark:border-slate-800 hover:border-saffron-400 dark:hover:border-amber-500/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedVeda === tab.id
                      ? 'bg-white/30 text-white dark:bg-black/20 dark:text-stone-950'
                      : 'bg-cream-200 dark:bg-slate-800 text-stone-600 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-stone-800 text-white dark:bg-amber-400 dark:text-stone-950 border-stone-900 dark:border-amber-300'
                    : 'bg-white/70 dark:bg-slate-900/70 text-stone-600 dark:text-slate-400 border-cream-300/80 dark:border-slate-800 hover:bg-cream-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Inline Vedic Shanti Mantra Banner (collapsible, pure inline, no popup layers) */}
        <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-cream-100 to-saffron-50/80 dark:from-[#131929] dark:via-[#0F1422] dark:to-[#131929] border border-saffron-200/80 dark:border-amber-500/20 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-saffron-500 animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-saffron-950 dark:text-amber-300 font-cinzel">
                    {activeShantiMantra.nameSanskrit}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-slate-400">
                    • {activeShantiMantra.veda} Shanti Patha
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-slate-400 truncate">
                  {activeShantiMantra.essence}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsShantiExpanded(!isShantiExpanded)}
              className="shrink-0 text-xs font-bold text-saffron-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-cream-200/60 dark:hover:bg-slate-800"
            >
              <span>{isShantiExpanded ? 'Hide Chant' : 'View Peace Chant'}</span>
              {isShantiExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isShantiExpanded && (
            <div className="mt-4 pt-3 border-t border-saffron-200/60 dark:border-slate-800 space-y-3 animate-fade-in">
              <p className="font-sanskrit text-sm sm:text-base text-stone-900 dark:text-amber-100 font-bold leading-relaxed text-center whitespace-pre-line">
                {activeShantiMantra.sanskrit}
              </p>
              <p className="text-xs text-stone-600 dark:text-slate-400 italic text-center leading-relaxed">
                {activeShantiMantra.transliteration}
              </p>
              <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-xl text-xs text-stone-700 dark:text-slate-300 leading-relaxed text-center border border-cream-300/60 dark:border-slate-800">
                <span className="font-bold text-saffron-800 dark:text-amber-400">Translation: </span>
                {activeShantiMantra.translation}
              </div>
            </div>
          )}
        </section>

        {/* Results Counter & Reset Action */}
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400 px-1">
          <span>Showing {filteredUpanishads.length} of 108 Canonical Upanishads</span>
          {(selectedVeda !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedVeda('ALL');
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="text-saffron-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Grid of Clean Upanishad Cards (Direct navigation, no popup layers) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUpanishads.map((up) => {
            const readUrl = `/?mode=read&source=${encodeURIComponent(up.dbSourceName || up.name)}&chapter=1`;

            return (
              <Link
                key={up.id}
                href={readUrl}
                className="p-5 rounded-3xl bg-white/95 dark:bg-slate-900/90 hover:bg-cream-50 dark:hover:bg-slate-800/95 border border-cream-300/80 dark:border-amber-500/20 hover:border-saffron-500/60 dark:hover:border-amber-400/50 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-saffron-500/40"
              >
                <div className="space-y-2">
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
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

                  {/* Title & Sanskrit */}
                  <div>
                    <h2 className="text-base sm:text-lg font-bold font-cinzel text-stone-900 dark:text-amber-200 group-hover:text-saffron-700 dark:group-hover:text-amber-300 transition-colors">
                      {up.name}
                    </h2>
                    <p className="text-xs sm:text-sm font-sanskrit text-saffron-800 dark:text-amber-400 font-semibold mt-0.5">
                      {up.sanskritName}
                    </p>
                  </div>

                  {/* Clean Summary (No extra quotation boxes) */}
                  <p className="text-xs text-stone-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-sans">
                    {up.summary}
                  </p>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-3 border-t border-cream-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{up.verseCount} Verses</span>
                  </span>

                  <span className="flex items-center gap-1 text-xs font-bold text-saffron-700 dark:text-amber-400 group-hover:text-saffron-600 dark:group-hover:text-amber-300">
                    <span>Read Upanishad</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        {/* Empty State */}
        {filteredUpanishads.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-cream-300 dark:border-slate-800 p-8">
            <ScrollText className="w-10 h-10 text-stone-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-stone-800 dark:text-slate-200">
              No Upanishads matched your search
            </h3>
            <p className="text-xs text-stone-500 dark:text-slate-400 max-w-sm mx-auto">
              Try searching with another keyword, clearing the search box, or selecting &quot;All 108 Canon&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedVeda('ALL');
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-saffron-600 dark:bg-amber-500 text-white dark:text-stone-950 text-xs font-bold rounded-xl cursor-pointer hover:bg-saffron-700"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function UpanishadsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-100 dark:bg-[#070A0F]" />}>
      <UpanishadsPageContent />
    </Suspense>
  );
}
