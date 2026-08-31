'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  BookOpen, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronRight,
  ChevronDown,
  Loader2,
  Sparkles
} from 'lucide-react';
import { SacredHymn } from '../data/famousSuktams';
import { VerseData } from '../types';

interface VedaMantra {
  id: number;
  veda_id: string;
  division_1: number;
  division_2: number;
  division_3: number;
  krama_number: number;
  sanskrit_svara?: string;
  sanskrit_plain?: string;
  transliteration_iast?: string;
  rishi?: string;
  devata?: string;
  chhandas?: string;
  bhashyas?: Array<{
    language: string;
    mantra_vishaya?: string;
    anvaya?: string;
    bhavartha?: string;
  }>;
}

interface HymnVerse {
  verseNumber: number;
  sanskrit: string;
  transliteration?: string;
  english?: string;
  hindi?: string;
}

interface SacredHymnModalProps {
  isOpen: boolean;
  hymn: SacredHymn | null;
  onClose: () => void;
  onOpenInScripture?: (coord: {
    sourceName: string;
    chapterNumber?: number;
    division2?: number;
    verseNumber?: number;
  }) => void;
}

// Module-level in-memory cache for instant 0ms retrieval
const hymnVersesCache = new Map<string, HymnVerse[]>();

export default function SacredHymnModal({
  isOpen,
  hymn,
  onClose,
  onOpenInScripture,
}: SacredHymnModalProps) {
  const [copiedVerseIndex, setCopiedVerseIndex] = useState<number | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [dbVerses, setDbVerses] = useState<HymnVerse[] | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const versesContainerRef = useRef<HTMLDivElement>(null);

  // Direct Database Retrieval with in-memory caching
  useEffect(() => {
    if (!isOpen || !hymn) {
      setDbVerses(null);
      setIsLoadingDb(false);
      setIsSummaryOpen(false);
      setVisibleCount(20);
      return;
    }

    // Check in-memory cache first for instant 0ms load
    if (hymnVersesCache.has(hymn.id)) {
      setDbVerses(hymnVersesCache.get(hymn.id)!);
      setIsLoadingDb(false);
      return;
    }

    let isMounted = true;
    const fetchFromDb = async () => {
      setIsLoadingDb(true);
      try {
        const vedaMap: Record<string, string> = {
          'Rigveda': 'rigveda',
          'Yajur Veda': 'yajurveda',
          'Atharva Veda': 'atharvaveda',
          'Samaveda': 'samaveda',
        };

        const vedaId = hymn.vedaId || vedaMap[hymn.sourceName];

        if (vedaId && (hymn.division1 || hymn.chapterNumber)) {
          const div1 = hymn.division1 || hymn.chapterNumber || 1;
          const div2 = hymn.division2;
          
          let apiUrl = `/api/veda/read?veda=${vedaId}&div1=${div1}`;
          if (div2 && vedaId !== 'yajurveda') {
            apiUrl += `&div2=${div2}`;
          }

          const res = await fetch(apiUrl);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              let filtered = data;
              if (hymn.startVerse && hymn.endVerse) {
                filtered = data.filter((m: VedaMantra) => {
                  const vNum = m.division_3 || m.krama_number;
                  return vNum >= (hymn.startVerse || 1) && vNum <= (hymn.endVerse || 9999);
                });
              } else if (hymn.startVerse) {
                filtered = data.filter((m: VedaMantra) => (m.division_3 || m.krama_number) >= (hymn.startVerse || 1));
              }

              const mapped: HymnVerse[] = filtered.map((m: VedaMantra) => {
                const hindiBhashya = m.bhashyas?.find(b => b.language === 'hi' || b.language === 'Hindi');
                const engBhashya = m.bhashyas?.find(b => b.language === 'en' || b.language === 'English');

                return {
                  verseNumber: m.division_3 || m.krama_number,
                  sanskrit: m.sanskrit_svara || m.sanskrit_plain || '',
                  transliteration: m.transliteration_iast,
                  english: engBhashya?.bhavartha || '',
                  hindi: hindiBhashya?.bhavartha || hindiBhashya?.mantra_vishaya || '',
                };
              });

              if (isMounted && mapped.length > 0) {
                hymnVersesCache.set(hymn.id, mapped);
                setDbVerses(mapped);
              }
            }
          }
        } else if (hymn.sourceName && hymn.chapterNumber) {
          const res = await fetch(`/api/read?source=${encodeURIComponent(hymn.sourceName)}&chapter=${hymn.chapterNumber}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              let filtered = data;
              if (hymn.startVerse && hymn.endVerse) {
                filtered = data.filter((v: VerseData) => 
                  v.verse_number >= (hymn.startVerse || 1) && v.verse_number <= (hymn.endVerse || 9999)
                );
              } else if (hymn.startVerse) {
                filtered = data.filter((v: VerseData) => v.verse_number >= (hymn.startVerse || 1));
              }

              if (filtered.length > 0) {
                const mapped: HymnVerse[] = filtered.map((v: VerseData) => {
                  const engTrans = v.translations?.find(t => t.language === 'en' || t.language === 'English');
                  const hiTrans = v.translations?.find(t => t.language === 'hi' || t.language === 'Hindi');

                  return {
                    verseNumber: v.verse_number,
                    sanskrit: v.sanskrit_text,
                    transliteration: v.transliteration,
                    english: engTrans?.text || '',
                    hindi: hiTrans?.text || '',
                  };
                });

                if (isMounted && mapped.length > 0) {
                  hymnVersesCache.set(hymn.id, mapped);
                  setDbVerses(mapped);
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Direct DB fetch error:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDb(false);
        }
      }
    };

    fetchFromDb();

    return () => {
      isMounted = false;
    };
  }, [isOpen, hymn]);

  // Lock background scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !hymn) return null;

  const versesToRender: HymnVerse[] = dbVerses || (hymn.openingSnippet ? [{
    verseNumber: hymn.startVerse || 1,
    sanskrit: hymn.openingSnippet,
  }] : []);

  const handleCopyVerse = (verse: HymnVerse, index: number) => {
    let copyText = `${verse.sanskrit}\n`;
    if (verse.transliteration) copyText += `\n${verse.transliteration}\n`;
    if (verse.hindi) copyText += `\nहिन्दी: ${verse.hindi}\n`;
    if (verse.english) copyText += `\nEnglish: ${verse.english}\n`;
    copyText += `\n— ${hymn.name} (${hymn.canonicalRef})`;

    navigator.clipboard.writeText(copyText);
    setCopiedVerseIndex(index);
    setTimeout(() => setCopiedVerseIndex(null), 2500);
  };

  const handleOpenInReader = () => {
    onClose();
    if (onOpenInScripture) {
      onOpenInScripture({
        sourceName: hymn.sourceName,
        chapterNumber: hymn.chapterNumber || hymn.division1 || 1,
        division2: hymn.division2,
        verseNumber: hymn.startVerse || hymn.verseNumber || 1,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-3xl h-[92vh] sm:h-[88vh] flex flex-col bg-cream-50 dark:bg-[#0B0F19] border border-cream-300/80 dark:border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-hymn-title"
      >
        
        {/* 1. Header Bar */}
        <div className="relative px-4 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-cream-100 via-cream-50 to-cream-100 dark:from-[#0E1526] dark:via-[#0B0F19] dark:to-[#0E1526] border-b border-cream-300/70 dark:border-amber-500/15 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-saffron-800 dark:text-amber-300 bg-saffron-100/90 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-saffron-300/60 dark:border-amber-600/30 font-cinzel">
                  {hymn.category}
                </span>
                <span className="text-xs font-medium text-stone-600 dark:text-amber-200/90 truncate font-sans">
                  {hymn.exactScripture}
                </span>
              </div>

              <h2 id="modal-hymn-title" className="text-lg sm:text-2xl font-bold font-cinzel text-saffron-950 dark:text-amber-100 truncate">
                {hymn.name}
              </h2>
              <p className="text-xs sm:text-sm font-sanskrit text-saffron-800 dark:text-amber-400 font-semibold truncate">
                {hymn.sanskritName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-amber-200 hover:bg-cream-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Collapsible Essence / Theme info */}
          <div className="mt-2 pt-2 border-t border-cream-200/80 dark:border-amber-500/10">
            <button
              type="button"
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-saffron-800 dark:text-amber-400 hover:underline cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSummaryOpen ? 'Hide Overview & Theme' : 'Show Overview & Theme'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSummaryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSummaryOpen && (
              <div className="mt-2 p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-cream-300/70 dark:border-amber-500/20 text-xs text-stone-700 dark:text-slate-300 leading-relaxed animate-fade-in font-sans">
                <p>
                  <strong className="text-saffron-900 dark:text-amber-300">Theme: </strong>
                  {hymn.deityOrTheme}
                </p>
                <p className="mt-1">
                  <strong className="text-saffron-900 dark:text-amber-300">Essence: </strong>
                  {hymn.summary}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Scrollable Verses Feed */}
        <div 
          ref={versesContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 select-text"
        >
          {isLoadingDb && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-saffron-700 dark:text-amber-400 font-cinzel font-bold text-sm animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin text-saffron-600 dark:text-amber-400" />
              <span>Loading sacred verses...</span>
            </div>
          )}

          {!isLoadingDb && versesToRender.slice(0, visibleCount).map((verse, index) => {
            const isCopied = copiedVerseIndex === index;

            return (
              <article 
                id={`modal-verse-${verse.verseNumber}`}
                key={index} 
                className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0F172A]/90 border border-cream-300/70 dark:border-amber-500/15 shadow-xs hover:border-saffron-400/60 dark:hover:border-amber-500/30 transition-all space-y-3.5 scroll-mt-6"
              >
                {/* Verse Header */}
                <div className="flex items-center justify-between border-b border-cream-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold font-cinzel text-saffron-800 dark:text-amber-400">
                      Verse {verse.verseNumber}
                    </span>
                    <span className="text-[10px] text-stone-400 dark:text-slate-500 font-mono">
                      ({index + 1} of {versesToRender.length})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyVerse(verse, index)}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-slate-400 hover:text-saffron-700 dark:hover:text-amber-300 transition-colors px-2.5 py-1 rounded-lg hover:bg-cream-100 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-cream-300 dark:hover:border-slate-700"
                    title="Copy Verse with Translations"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sanskrit Shloka Typography */}
                <div className="py-2 text-center sm:text-left">
                  <p className="font-sanskrit text-base sm:text-xl md:text-2xl text-saffron-950 dark:text-amber-100 font-bold leading-relaxed sm:leading-loose whitespace-pre-line tracking-wide selection:bg-saffron-200 dark:selection:bg-amber-900/50">
                    {verse.sanskrit}
                  </p>
                </div>

                {/* IAST Transliteration */}
                {verse.transliteration && (
                  <div className="p-3 rounded-xl bg-cream-100/60 dark:bg-slate-800/40 border border-cream-200 dark:border-slate-700/40">
                    <p className="text-xs sm:text-sm font-serif text-stone-700 dark:text-slate-300 italic tracking-wider leading-relaxed">
                      {verse.transliteration}
                    </p>
                  </div>
                )}

                {/* Hindi Translation */}
                {verse.hindi && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border-l-3 border-saffron-500 dark:border-amber-500">
                    <p className="text-xs sm:text-sm text-stone-800 dark:text-slate-200 leading-relaxed font-sans">
                      <strong className="text-saffron-900 dark:text-amber-300 font-medium">हिन्दी: </strong>
                      {verse.hindi}
                    </p>
                  </div>
                )}

                {/* English Translation */}
                {verse.english && (
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-800/30 border-l-3 border-stone-400 dark:border-slate-600">
                    <p className="text-xs sm:text-sm text-stone-800 dark:text-slate-200 leading-relaxed font-sans">
                      <strong className="text-stone-900 dark:text-slate-100 font-medium">English: </strong>
                      {verse.english}
                    </p>
                  </div>
                )}
              </article>
            );
          })}

          {/* Progressive Load Next Batch */}
          {!isLoadingDb && visibleCount < versesToRender.length && (
            <div className="py-4 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount(prev => prev + 30)}
                className="px-6 py-2.5 bg-white dark:bg-slate-900 hover:bg-cream-100 dark:hover:bg-slate-800 rounded-2xl border border-cream-300 dark:border-amber-500/30 text-xs font-bold text-saffron-900 dark:text-amber-300 transition-all cursor-pointer shadow-xs hover:scale-105"
              >
                Showing {Math.min(visibleCount, versesToRender.length)} of {versesToRender.length} • Load More Verses ↓
              </button>
            </div>
          )}
        </div>

        {/* 3. Footer Action Bar (Single Primary Study Button & Reference) */}
        <div className="px-4 py-3 sm:px-6 bg-cream-100/90 dark:bg-[#070A0F]/95 border-t border-cream-300/70 dark:border-amber-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="text-[11px] sm:text-xs text-stone-600 dark:text-slate-400 truncate max-w-full sm:max-w-md">
            <span>Ref: </span>
            <strong className="text-stone-900 dark:text-slate-200 font-cinzel">{hymn.canonicalRef}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto justify-end">
            <button
              type="button"
              onClick={handleOpenInReader}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-saffron-600 hover:bg-saffron-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-bold font-cinzel rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Study in Scripture Library</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-cream-200 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-cream-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
