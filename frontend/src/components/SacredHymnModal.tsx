'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Copy, 
  Check, 
  ExternalLink, 
  Languages, 
  ChevronRight,
  Database,
  Loader2
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
    verseNumber?: number;
  }) => void;
}

export default function SacredHymnModal({
  isOpen,
  hymn,
  onClose,
  onOpenInScripture,
}: SacredHymnModalProps) {
  const [copiedVerseIndex, setCopiedVerseIndex] = useState<number | null>(null);
  const [showHindi, setShowHindi] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [dbVerses, setDbVerses] = useState<HymnVerse[] | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // Direct Database Retrieval on mount/hymn change
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

        const vedaId = hymn.vedaId || vedaMap[hymn.sourceName];

        if (vedaId && (hymn.division1 || hymn.chapterNumber)) {
          // Fetch from /api/veda/read
          const div1 = hymn.division1 || hymn.chapterNumber || 1;
          const div2 = hymn.division2 || 1;
          const res = await fetch(`/api/veda/read?veda=${vedaId}&div1=${div1}&div2=${div2}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              let filtered = data;
              if (hymn.startVerse && hymn.endVerse && hymn.startVerse === hymn.endVerse) {
                filtered = data.filter((m: VedaMantra) => m.division_3 === hymn.startVerse);
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
                    english: engTrans?.text || '',
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
        chapterNumber: hymn.chapterNumber || 1,
        verseNumber: hymn.startVerse || hymn.verseNumber || 1,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-cream-100 dark:bg-[#0B0F19] border border-cream-300 dark:border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden transition-colors">
        
        {/* Header Bar */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-saffron-50 via-cream-100 to-saffron-50 dark:from-[#0E1526] dark:via-[#0B0F19] dark:to-[#0E1526] border-b border-cream-300/80 dark:border-amber-500/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-saffron-800 dark:text-amber-300 bg-saffron-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-saffron-300/60 dark:border-amber-600/30 font-cinzel">
                  {hymn.category}
                </span>
                <span className="text-xs font-bold text-stone-600 dark:text-amber-200/90 font-cinzel">
                  {hymn.exactScripture}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300/50">
                  <Database className="w-3 h-3" />
                  Direct Database Retrieval
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-saffron-950 dark:text-amber-100 pt-1">
                {hymn.name}
              </h2>
              <p className="text-sm font-sanskrit text-saffron-800 dark:text-amber-400 font-bold">
                {hymn.sanskritName} • <span className="font-sans text-xs font-normal text-stone-500 dark:text-slate-400">{hymn.coordinateText}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-amber-200 hover:bg-cream-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Close Hymn View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hymn Theme Summary */}
          <div className="mt-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-cream-300/60 dark:border-amber-500/10">
            <p className="text-xs text-stone-700 dark:text-slate-300 leading-relaxed font-sans">
              <strong className="text-saffron-900 dark:text-amber-300">Essence: </strong>
              {hymn.summary}
            </p>
          </div>

          {/* Controls and Language Filter Switches */}
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-cream-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500 dark:text-slate-400 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
                Display:
              </span>
              <button
                type="button"
                onClick={() => setShowHindi(!showHindi)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  showHindi 
                    ? 'bg-saffron-600 text-white border-saffron-700 dark:bg-amber-600 dark:border-amber-500' 
                    : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-slate-300 border-cream-300 dark:border-slate-700'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setShowEnglish(!showEnglish)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  showEnglish 
                    ? 'bg-saffron-600 text-white border-saffron-700 dark:bg-amber-600 dark:border-amber-500' 
                    : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-slate-300 border-cream-300 dark:border-slate-700'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setShowTransliteration(!showTransliteration)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  showTransliteration 
                    ? 'bg-saffron-600 text-white border-saffron-700 dark:bg-amber-600 dark:border-amber-500' 
                    : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-slate-300 border-cream-300 dark:border-slate-700'
                }`}
              >
                IAST
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenInReader}
              className="flex items-center gap-1.5 px-3 py-1 bg-saffron-100 hover:bg-saffron-200 dark:bg-amber-950/70 dark:hover:bg-amber-900/80 text-saffron-900 dark:text-amber-300 text-xs font-bold font-cinzel rounded-xl border border-saffron-300 dark:border-amber-600/40 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open in Scripture Library</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Verses List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isLoadingDb && (
            <div className="flex items-center justify-center py-10 gap-3 text-saffron-700 dark:text-amber-400 font-cinzel font-bold text-sm animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading complete hymn directly from database...</span>
            </div>
          )}

          {!isLoadingDb && versesToRender.map((verse, index) => {
            const isCopied = copiedVerseIndex === index;

            return (
              <div 
                key={index} 
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-cream-300 dark:border-amber-500/20 shadow-2xs hover:border-saffron-400 dark:hover:border-amber-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-cream-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold font-cinzel text-saffron-800 dark:text-amber-400">
                    Verse / Mantra {verse.verseNumber}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyVerse(verse, index)}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-slate-400 hover:text-saffron-700 dark:hover:text-amber-300 transition-colors px-2 py-1 rounded-md hover:bg-cream-100 dark:hover:bg-slate-800"
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
                <div className="text-center sm:text-left py-1">
                  <p className="text-base sm:text-lg font-sanskrit text-saffron-950 dark:text-amber-100 font-bold leading-relaxed whitespace-pre-line tracking-wide selection:bg-saffron-200">
                    {verse.sanskrit}
                  </p>
                </div>

                {/* IAST Transliteration */}
                {showTransliteration && verse.transliteration && (
                  <p className="text-xs font-serif text-stone-600 dark:text-slate-300 italic tracking-wider">
                    {verse.transliteration}
                  </p>
                )}

                {/* Hindi Translation */}
                {showHindi && verse.hindi && (
                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border-l-2 border-saffron-500 dark:border-amber-500">
                    <p className="text-xs text-stone-800 dark:text-slate-200 leading-relaxed font-sans">
                      <strong className="text-saffron-900 dark:text-amber-300">हिन्दी अनुवाद: </strong>
                      {verse.hindi}
                    </p>
                  </div>
                )}

                {/* English Translation */}
                {showEnglish && verse.english && (
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800/50 border-l-2 border-stone-400 dark:border-slate-600">
                    <p className="text-xs text-stone-800 dark:text-slate-200 leading-relaxed font-sans">
                      <strong className="text-stone-900 dark:text-slate-100">English Translation: </strong>
                      {verse.english}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-cream-200/90 dark:bg-[#070A0F] border-t border-cream-300 dark:border-amber-500/20 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-stone-600 dark:text-slate-400">
            <span>Canonical Reference: </span>
            <strong className="text-stone-900 dark:text-slate-200 font-cinzel">{hymn.canonicalRef}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenInReader}
              className="flex items-center gap-1.5 px-4 py-2 bg-saffron-700 hover:bg-saffron-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-bold font-cinzel rounded-xl shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Study in Scripture Library</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-cream-100 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-cream-300 dark:border-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
