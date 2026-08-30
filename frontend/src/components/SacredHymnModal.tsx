'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  Languages, 
  ChevronRight,
  Loader2,
  Database
} from 'lucide-react';
import { SacredHymn, HymnVerse } from '../data/famousSuktams';
import { VedaMantra, VerseData } from '../types';

interface SacredHymnModalProps {
  isOpen: boolean;
  onClose: () => void;
  hymn: SacredHymn | null;
  onOpenInScripture?: (coord: {
    sourceName: string;
    chapterNumber?: number;
    verseNumber?: number;
  }) => void;
}

export default function SacredHymnModal({
  isOpen,
  onClose,
  hymn,
  onOpenInScripture,
}: SacredHymnModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedVerseIndex, setCopiedVerseIndex] = useState<number | null>(null);
  const [showHindi, setShowHindi] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [dbVerses, setDbVerses] = useState<HymnVerse[] | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch directly from database when modal opens for a hymn
  useEffect(() => {
    if (!isOpen || !hymn) {
      setDbVerses(null);
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

        const vedaId = vedaMap[hymn.sourceName];

        if (vedaId && hymn.chapterNumber) {
          // Fetch from /api/veda/read
          const div1 = hymn.chapterNumber;
          const div2 = hymn.startVerse || 1;
          const res = await fetch(`/api/veda/read?veda=${vedaId}&div1=${div1}&div2=${div2}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const mapped: HymnVerse[] = data.map((m: VedaMantra) => {
                const hindiBhashya = m.bhashyas?.find(b => b.language === 'hi' || b.language === 'Hindi');
                const engBhashya = m.bhashyas?.find(b => b.language === 'en' || b.language === 'English');

                return {
                  verseNumber: m.division_3 || m.krama_number,
                  sanskrit: m.sanskrit_svara || m.sanskrit_plain,
                  transliteration: m.transliteration_iast,
                  english: engBhashya?.bhavartha || '',
                  hindi: hindiBhashya?.bhavartha || hindiBhashya?.mantra_vishaya || '',
                };
              });

              if (isMounted && mapped.length > 0) {
                setDbVerses(mapped);
              }
            }
          }
        } else if (hymn.sourceName && hymn.chapterNumber) {
          // Fetch from /api/read for scriptures.db
          const res = await fetch(`/api/read?source=${encodeURIComponent(hymn.sourceName)}&chapter=${hymn.chapterNumber}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              let filtered = data;
              if (hymn.startVerse && hymn.endVerse) {
                filtered = data.filter((v: VerseData) => 
                  v.verse_number >= (hymn.startVerse || 1) && v.verse_number <= (hymn.endVerse || 9999)
                );
              }

              if (filtered.length > 0) {
                const mapped: HymnVerse[] = filtered.map((v: VerseData) => {
                  const engTrans = v.translations?.find(t => t.language === 'en' || t.language === 'English');
                  const hiTrans = v.translations?.find(t => t.language === 'hi' || t.language === 'Hindi');

                  return {
                    verseNumber: v.verse_number,
                    sanskrit: v.sanskrit_text,
                    transliteration: v.transliteration,
                    english: engTrans?.text || v.translation_text || '',
                    hindi: hiTrans?.text || '',
                  };
                });

                if (isMounted && mapped.length > 0) {
                  setDbVerses(mapped);
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Direct DB fetch fallback to curated hymn data:', err);
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

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const handleCopyVerse = (verseText: string, index: number) => {
    navigator.clipboard.writeText(verseText);
    setCopiedVerseIndex(index);
    setTimeout(() => setCopiedVerseIndex(null), 2000);
  };

  const handleJumpToReader = () => {
    if (!hymn) return;
    onClose();
    if (onOpenInScripture) {
      onOpenInScripture({
        sourceName: hymn.sourceName,
        chapterNumber: hymn.chapterNumber,
        verseNumber: hymn.startVerse || hymn.verseNumber,
      });
    }
  };

  if (!isOpen || !mounted || !hymn) return null;

  // Use database verses if fetched successfully, otherwise curated full verses
  const displayVerses = (dbVerses && dbVerses.length > 0) ? dbVerses : hymn.verses;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hymn-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/80 dark:bg-black/90 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-cream-100 dark:bg-[#0b0f19] border border-cream-400 dark:border-amber-500/30 rounded-3xl shadow-2xl flex flex-col z-10 animate-fade-in overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-cream-300 via-cream-200 to-cream-300 dark:from-[#111827] dark:via-[#162032] dark:to-[#0b0f19] border-b border-cream-400/60 dark:border-amber-500/20 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-800 dark:text-amber-300 bg-saffron-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-saffron-300/60 dark:border-amber-600/30">
                {hymn.category}
              </span>
              <span className="text-[11px] font-bold text-stone-600 dark:text-amber-200/90 font-cinzel flex items-center gap-1">
                <Database className="w-3 h-3 text-saffron-600 dark:text-amber-400" />
                {hymn.exactScripture}
              </span>
            </div>
            <h2 id="hymn-modal-title" className="text-lg sm:text-xl font-bold font-cinzel text-saffron-950 dark:text-amber-200 leading-tight">
              {hymn.name}
            </h2>
            <p className="text-sm font-sanskrit text-saffron-800 dark:text-amber-400 font-semibold mt-0.5">
              {hymn.sanskritName} • <span className="font-sans text-xs font-normal text-stone-500 dark:text-slate-400">{hymn.coordinateText}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 dark:text-slate-400 hover:text-saffron-700 dark:hover:text-amber-300 hover:bg-cream-400/50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Close Hymn View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Translation & View Controls */}
        <div className="px-5 py-2.5 bg-cream-200/50 dark:bg-slate-900/60 border-b border-cream-300/60 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
              Translations:
            </span>
            <button
              type="button"
              onClick={() => setShowHindi(!showHindi)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                showHindi 
                  ? 'bg-saffron-600 text-white shadow-2xs' 
                  : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-slate-400 border border-cream-300 dark:border-slate-700'
              }`}
            >
              हिन्दी {showHindi ? '✓' : ''}
            </button>
            <button
              type="button"
              onClick={() => setShowEnglish(!showEnglish)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                showEnglish 
                  ? 'bg-saffron-600 text-white shadow-2xs' 
                  : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-slate-400 border border-cream-300 dark:border-slate-700'
              }`}
            >
              English {showEnglish ? '✓' : ''}
            </button>
            <button
              type="button"
              onClick={() => setShowTransliteration(!showTransliteration)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                showTransliteration 
                  ? 'bg-saffron-100 dark:bg-amber-950/80 text-saffron-800 dark:text-amber-300 border border-saffron-300 dark:border-amber-600/40' 
                  : 'bg-white dark:bg-slate-800 text-stone-500 dark:text-slate-400 border border-cream-300 dark:border-slate-700'
              }`}
            >
              Transliteration
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-slate-400 font-medium">
            {isLoadingDb && (
              <span className="flex items-center gap-1 text-saffron-700 dark:text-amber-400 font-bold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Syncing Database...</span>
              </span>
            )}
            <span>
              Total {displayVerses.length} {displayVerses.length === 1 ? 'Mantra' : 'Mantras / Verses'}
            </span>
          </div>
        </div>

        {/* Scrollable Hymn Verses Body */}
        <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto">
          {/* Overview Callout */}
          <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-2xl border border-cream-400/40 dark:border-amber-500/20 shadow-2xs">
            <p className="text-xs text-stone-700 dark:text-slate-300 leading-relaxed font-serif">
              <span className="font-bold text-saffron-800 dark:text-amber-300">Essence & Significance: </span>
              {hymn.summary}
            </p>
          </div>

          {/* Sequential Verses List */}
          <div className="space-y-4">
            {displayVerses.map((verse, idx) => (
              <div
                key={verse.verseNumber || idx}
                className="p-4 sm:p-5 bg-white dark:bg-slate-900/90 border border-cream-400/60 dark:border-amber-500/20 rounded-2xl shadow-2xs hover:border-saffron-400 dark:hover:border-amber-500/40 transition-all"
              >
                {/* Verse Number & Actions Bar */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-cream-300/40 dark:border-slate-800">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-saffron-800 dark:text-amber-300 font-cinzel">
                    Verse / Mantra {verse.verseNumber}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyVerse(`${verse.sanskrit}\n\n${verse.english || verse.hindi}`, idx)}
                    className="flex items-center gap-1 text-[10px] font-bold text-stone-500 dark:text-slate-400 hover:text-saffron-700 dark:hover:text-amber-300 px-2 py-1 rounded-lg hover:bg-cream-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Copy Verse"
                  >
                    {copiedVerseIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sanskrit Shloka Text */}
                <div className="my-2">
                  <p className="text-sm sm:text-base font-sanskrit text-stone-950 dark:text-amber-100 font-semibold leading-relaxed whitespace-pre-line text-center py-2">
                    {verse.sanskrit}
                  </p>
                </div>

                {/* Roman Transliteration */}
                {showTransliteration && verse.transliteration && (
                  <div className="my-2 px-3 py-2 bg-cream-200/50 dark:bg-slate-950/60 rounded-xl border border-cream-300/50 dark:border-slate-800 text-center">
                    <p className="text-xs text-stone-600 dark:text-slate-300 italic leading-relaxed">
                      {verse.transliteration}
                    </p>
                  </div>
                )}

                {/* Hindi Translation */}
                {showHindi && verse.hindi && (
                  <div className="mt-3 pt-2.5 border-t border-cream-300/40 dark:border-slate-800/80">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-saffron-800 dark:text-amber-400 mb-1">
                      हिन्दी अनुवाद:
                    </p>
                    <p className="text-xs sm:text-sm text-stone-800 dark:text-slate-200 font-serif leading-relaxed">
                      {verse.hindi}
                    </p>
                  </div>
                )}

                {/* English Translation */}
                {showEnglish && verse.english && (
                  <div className="mt-3 pt-2.5 border-t border-cream-300/40 dark:border-slate-800/80">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-saffron-800 dark:text-amber-400 mb-1 font-cinzel">
                      English Translation:
                    </p>
                    <p className="text-xs sm:text-sm text-stone-800 dark:text-slate-200 leading-relaxed">
                      {verse.english}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bar with Jump to Scripture Action */}
        <div className="px-5 py-3.5 bg-cream-300/60 dark:bg-[#111827] border-t border-cream-400/50 dark:border-amber-500/20 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="text-[11px] text-stone-600 dark:text-slate-400">
            Source: <strong className="text-saffron-900 dark:text-amber-300">{hymn.exactScripture}</strong> ({hymn.canonicalRef})
          </div>

          <button
            type="button"
            onClick={handleJumpToReader}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-600 dark:to-saffron-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md hover:brightness-105 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open in Scripture Library</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
