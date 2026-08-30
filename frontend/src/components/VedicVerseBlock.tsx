'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { VedaMantra, VerseData } from '../types';
import { isVerseBookmarked, toggleBookmark } from '../lib/bookmarks';
import { formatSanskritVerseLines } from '../lib/sanskritUtils';
import { 
  Bookmark, 
  Share2, 
  Sparkles, 
  BookOpen, 
  Check, 
  Copy, 
  User, 
  Sparkle, 
  Music, 
  Compass, 
  Feather, 
  FileText
} from 'lucide-react';

export type SanskritFontSize = 'sm' | 'md' | 'lg' | 'xl';

interface VedicVerseBlockProps {
  mantra: VedaMantra;
  index?: number;
  totalMantras?: number;
  onNext?: () => void;
  onPrev?: () => void;
  preferredLanguage?: string;
  isActive?: boolean;
  fontSize?: SanskritFontSize;
  globalLayers?: {
    showSvara?: boolean;
    showIAST?: boolean;
    showPadapatha?: boolean;
    showAnvaya?: boolean;
    showTranslation?: boolean;
    showBhavartha?: boolean;
    showBhashyas?: boolean;
  };
  onToggleGlobalLayer?: (layer: 'svara' | 'iast' | 'padapatha' | 'anvaya' | 'translation' | 'bhavartha' | 'bhashyas') => void;
  onOpenShareModal?: (details: {
    sourceName: string;
    chapterNumber: number;
    verseNumber: number;
    sanskritText: string;
    transliteration?: string;
    translationText: string;
  }) => void;
  onAskAboutMantra?: (mantra: VedaMantra) => void;
}

function VedicVerseBlock({
  mantra,
  index = 0,
  totalMantras = 1,
  onNext,
  onPrev,
  preferredLanguage = 'hindi',
  isActive = true,
  fontSize = 'md',
  globalLayers,
  onToggleGlobalLayer,
  onOpenShareModal,
  onAskAboutMantra,
}: VedicVerseBlockProps) {
  // Layer Toggles: Derived from globalLayers (Translation & Bhashyas default to true)
  const showSvara = globalLayers?.showSvara !== undefined ? globalLayers.showSvara : true;
  const showIAST = globalLayers?.showIAST !== undefined ? globalLayers.showIAST : false;
  const showPadapatha = globalLayers?.showPadapatha !== undefined ? globalLayers.showPadapatha : true;
  const showAnvaya = globalLayers?.showAnvaya !== undefined ? globalLayers.showAnvaya : true;
  const showTranslation = globalLayers?.showTranslation !== undefined ? globalLayers.showTranslation : true;
  const showBhashyas = globalLayers?.showBhashyas !== undefined ? globalLayers.showBhashyas : true;
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>(preferredLanguage || 'english');
  const [selectedBhashyaAuthor, setSelectedBhashyaAuthor] = useState<string>('Maharshi Dayananda Saraswati');
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync preferredLanguage prop
  useEffect(() => {
    if (preferredLanguage) {
      setSelectedLanguage(preferredLanguage.toLowerCase());
    }
  }, [preferredLanguage]);

  // Update Bookmark state & sync across windows/drawers
  useEffect(() => {
    setIsBookmarkedState();
    const handleUpdate = () => {
      setIsBookmarkedState();
    };
    window.addEventListener('dharmapragya_bookmarks_updated', handleUpdate);
    return () => window.removeEventListener('dharmapragya_bookmarks_updated', handleUpdate);
  }, [mantra]);

  const setIsBookmarkedState = () => {
    setBookmarked(isVerseBookmarked(mantra.veda_name, mantra.division_1, mantra.division_3));
  };

  // Find English translation across bhashyas
  const englishTranslation = useMemo(() => {
    if (!mantra.bhashyas || mantra.bhashyas.length === 0) return null;
    const found = mantra.bhashyas.find(
      b => b.language?.toLowerCase() === 'english' || 
           b.author?.toLowerCase().includes('griffith') ||
           b.author?.toLowerCase().includes('english')
    );
    if (found && (found.bhavartha || found.mantra_vishaya)) {
      return {
        author: found.author || 'Ralph T.H. Griffith',
        text: (found.bhavartha || found.mantra_vishaya || '').trim(),
      };
    }
    return null;
  }, [mantra.bhashyas]);

  // Find Hindi translation across bhashyas
  const hindiTranslation = useMemo(() => {
    if (!mantra.bhashyas || mantra.bhashyas.length === 0) return null;
    const found = mantra.bhashyas.find(
      b => b.language?.toLowerCase() === 'hindi' && (b.bhavartha || b.mantra_vishaya)
    );
    if (found && (found.bhavartha || found.mantra_vishaya)) {
      return {
        author: found.author || 'Maharshi Dayananda Saraswati',
        text: (found.bhavartha || found.mantra_vishaya || '').trim(),
      };
    }
    return null;
  }, [mantra.bhashyas]);

  // Active translation based on selected language with clear provenance
  const activeTranslation = useMemo(() => {
    if (selectedLanguage === 'english') {
      if (englishTranslation) {
        return {
          author: englishTranslation.author,
          text: englishTranslation.text,
          isEnglish: true,
        };
      }
      if (hindiTranslation) {
        return {
          author: `${hindiTranslation.author} (Hindi Purport)`,
          text: hindiTranslation.text,
          isEnglish: false,
        };
      }
    } else if (selectedLanguage === 'hindi') {
      if (hindiTranslation) {
        return {
          author: hindiTranslation.author,
          text: hindiTranslation.text,
          isEnglish: false,
        };
      }
      if (englishTranslation) {
        return {
          author: `${englishTranslation.author} (English)`,
          text: englishTranslation.text,
          isEnglish: true,
        };
      }
    }
    if (englishTranslation) return { ...englishTranslation, isEnglish: true };
    if (hindiTranslation) return { ...hindiTranslation, isEnglish: false };
    return null;
  }, [selectedLanguage, englishTranslation, hindiTranslation]);

  // Group traditional bhashyas by author (excluding English translation author who is already in the translation layer)
  const bhashyasByAuthor = useMemo(() => {
    const map: Record<string, { 
      sanskrit?: string; 
      hindi?: string; 
      vishaya_sk?: string; 
      vishaya_hi?: string; 
      tika?: string 
    }> = {};
    mantra.bhashyas?.forEach(b => {
      // Exclude English translation author (Griffith) from traditional Bhashyakara tabs
      if (b.language?.toLowerCase() === 'english' || b.author?.toLowerCase().includes('griffith')) {
        return;
      }
      if (!map[b.author]) map[b.author] = {};
      if (b.language === 'sanskrit') {
        map[b.author].sanskrit = b.bhavartha;
        map[b.author].vishaya_sk = b.mantra_vishaya;
        map[b.author].tika = b.tika;
      } else if (b.language === 'hindi') {
        map[b.author].hindi = b.bhavartha;
        map[b.author].vishaya_hi = b.mantra_vishaya;
        if (b.tika) map[b.author].tika = b.tika;
      }
    });
    return map;
  }, [mantra.bhashyas]);

  const authorsList = useMemo(() => {
    const list = Object.keys(bhashyasByAuthor).filter(
      author => !author.toLowerCase().includes('griffith') &&
                (bhashyasByAuthor[author]?.hindi || 
                 bhashyasByAuthor[author]?.sanskrit || 
                 bhashyasByAuthor[author]?.vishaya_hi || 
                 bhashyasByAuthor[author]?.vishaya_sk || 
                 bhashyasByAuthor[author]?.tika)
    );
    // Prioritize traditional commentary authors (Dayananda, Aryamuni, Brahmamuni)
    return list.sort((a, b) => {
      if (a.includes('Dayananda')) return -1;
      if (b.includes('Dayananda')) return 1;
      if (a.includes('Aryamuni')) return -1;
      if (b.includes('Aryamuni')) return 1;
      if (a.includes('Brahmamuni')) return -1;
      if (b.includes('Brahmamuni')) return 1;
      return a.localeCompare(b);
    });
  }, [bhashyasByAuthor]);

  useEffect(() => {
    if (authorsList.length > 0 && !authorsList.includes(selectedBhashyaAuthor)) {
      setSelectedBhashyaAuthor(authorsList[0]);
    }
  }, [authorsList, selectedBhashyaAuthor]);

  const fontSizeClassMap: Record<SanskritFontSize, string> = {
    sm: 'text-base sm:text-lg md:text-xl leading-relaxed',
    md: 'text-lg sm:text-xl md:text-2xl leading-relaxed',
    lg: 'text-xl sm:text-2xl md:text-3xl leading-relaxed',
    xl: 'text-2xl sm:text-3xl md:text-4xl leading-relaxed font-semibold',
  };

  const handleCopySanskrit = () => {
    const textToCopy = showSvara ? (mantra.sanskrit_svara || mantra.sanskrit_plain) : mantra.sanskrit_plain;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleBookmarkCurrent = () => {
    const tempVerse: VerseData = {
      id: mantra.krama_number,
      section_id: mantra.division_1,
      verse_number: mantra.division_3,
      sanskrit_text: mantra.sanskrit_plain,
      transliteration: mantra.transliteration_iast || '',
      word_meanings: mantra.word_meanings?.[0]?.padartha_text || '',
      source_name: mantra.veda_name,
      chapter_name: mantra.coordinate_str,
      chapter_number: mantra.division_1,
      translations: mantra.bhashyas?.map(b => ({
        author: b.author,
        language: b.language,
        text: b.bhavartha || b.mantra_vishaya || '',
      })) || [],
      commentaries: [],
    };
    const nowBookmarked = toggleBookmark(tempVerse);
    setBookmarked(nowBookmarked);
  };

  return (
    <article 
      id={`veda-mantra-${index}`}
      data-mantra-anchor={`mantra-anchor-${mantra.division_3}`}
      className="w-full bg-white dark:bg-[#0d121d] rounded-3xl p-5 md:p-8 shadow-xs border border-cream-300 dark:border-amber-500/20 hover:border-cream-400 dark:hover:border-amber-500/30 transition-all duration-300 relative flex flex-col justify-between space-y-6 scroll-mt-28"
    >
      
      {/* 1. Header & Arsha Quad-Metadata Chips */}
      <div className="space-y-3 border-b border-cream-300/60 dark:border-amber-500/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-saffron-100 dark:bg-amber-950/50 text-saffron-800 dark:text-amber-300 border border-saffron-200 dark:border-amber-700/40">
              {mantra.veda_name}
            </span>
            <span className="font-cinzel text-xs font-bold text-stone-600 dark:text-slate-400">
              {mantra.coordinate_str}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {mantra.ashtaka_coordinate && (
              <span className="text-[10px] font-mono font-bold bg-cream-200 dark:bg-slate-800 px-2 py-0.5 rounded text-stone-600 dark:text-slate-400">
                Ashtaka: {mantra.ashtaka_coordinate}
              </span>
            )}
            {mantra.kauthuma_coordinate && (
              <span className="text-[10px] font-mono font-bold bg-cream-200 dark:bg-slate-800 px-2 py-0.5 rounded text-stone-600 dark:text-slate-400" title="Kauthuma Shakha coordinate">
                Kauthuma: {mantra.kauthuma_coordinate}
              </span>
            )}
            {mantra.ranayaniya_coordinate && (
              <span className="text-[10px] font-mono font-bold bg-cream-200 dark:bg-slate-800 px-2 py-0.5 rounded text-stone-600 dark:text-slate-400" title="Ranayaniya Shakha coordinate">
                Ranayaniya: {mantra.ranayaniya_coordinate}
              </span>
            )}
            <button
              type="button"
              onClick={handleCopySanskrit}
              className="flex items-center gap-1 px-2 py-0.5 bg-cream-100 dark:bg-slate-800 hover:bg-cream-200 dark:hover:bg-slate-700 text-stone-600 dark:text-slate-300 rounded-md border border-cream-300 dark:border-amber-500/20 transition-colors cursor-pointer text-[10px] font-semibold"
              title="Copy Sanskrit text"
            >
              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Arsha Quad-Metadata Grid (Rishi, Devata, Chhandas, Svara) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {mantra.rishi && (
            <div className="p-2 bg-cream-100 dark:bg-slate-900 rounded-xl border border-cream-300 dark:border-amber-500/20 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 flex items-center gap-1">
                <User className="w-2.5 h-2.5 text-saffron-600 dark:text-amber-400" />
                ऋषिः (Rishi)
              </span>
              <span className="text-xs font-semibold text-saffron-950 dark:text-amber-200 font-sanskrit mt-0.5 line-clamp-1" title={mantra.rishi}>
                {mantra.rishi}
              </span>
            </div>
          )}

          {mantra.devata && (
            <div className="p-2 bg-cream-100 dark:bg-slate-900 rounded-xl border border-cream-300 dark:border-amber-500/20 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                देवता (Devata)
              </span>
              <span className="text-xs font-semibold text-saffron-950 dark:text-amber-200 font-sanskrit mt-0.5 line-clamp-1" title={mantra.devata}>
                {mantra.devata}
              </span>
            </div>
          )}

          {mantra.chhandas && (
            <div className="p-2 bg-cream-100 dark:bg-slate-900 rounded-xl border border-cream-300 dark:border-amber-500/20 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 flex items-center gap-1">
                <Feather className="w-2.5 h-2.5 text-terracotta-600 dark:text-amber-400" />
                छन्दः (Chhandas)
              </span>
              <span className="text-xs font-semibold text-saffron-950 dark:text-amber-200 font-sanskrit mt-0.5 line-clamp-1" title={mantra.chhandas}>
                {mantra.chhandas}
              </span>
            </div>
          )}

          {mantra.svara && (
            <div className="p-2 bg-cream-100 dark:bg-slate-900 rounded-xl border border-cream-300 dark:border-amber-500/20 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 flex items-center gap-1">
                <Music className="w-2.5 h-2.5 text-saffron-600 dark:text-amber-400" />
                स्वरः (Svara)
              </span>
              <span className="text-xs font-semibold text-saffron-950 dark:text-amber-200 font-sanskrit mt-0.5 line-clamp-1" title={mantra.svara}>
                {mantra.svara}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Sacred Mantra Text Display */}
      <div className="py-2 text-center select-text space-y-2">
        {formatSanskritVerseLines(showSvara ? (mantra.sanskrit_svara || mantra.sanskrit_plain) : mantra.sanskrit_plain).map((line, idx) => (
          <p 
            key={idx} 
            className={`font-sanskrit text-saffron-950 dark:text-amber-200 tracking-wide font-normal ${fontSizeClassMap[fontSize]}`}
          >
            {line}
          </p>
        ))}

        {showIAST && mantra.transliteration_iast && (
          <div className="mt-3 space-y-1">
            {formatSanskritVerseLines(mantra.transliteration_iast).map((tLine, tIdx) => (
              <p key={tIdx} className="font-serif italic text-xs sm:text-sm text-stone-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                {tLine}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 3. Expanded Layers Content */}
      
      {/* A. Padapatha (पदपाठः) */}
      {showPadapatha && (mantra.padapatha_svara || mantra.padapatha_plain) && (
        <div className="p-3.5 bg-cream-100/80 dark:bg-slate-900/60 rounded-2xl border border-cream-300 dark:border-amber-500/20 space-y-1.5 animate-fade-in">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-saffron-800 dark:text-amber-400">
            <BookOpen className="w-3 h-3" />
            <span>पदपाठः (Sandhi-Split Words)</span>
          </div>
          <p className="font-sanskrit text-sm font-medium text-stone-800 dark:text-slate-200 leading-relaxed">
            {showSvara ? (mantra.padapatha_svara || mantra.padapatha_plain) : mantra.padapatha_plain}
          </p>
        </div>
      )}

      {/* B. Word-by-Word Anvaya / Padartha */}
      {showAnvaya && mantra.word_meanings && mantra.word_meanings.length > 0 && (
        <div className="p-4 bg-cream-100/90 dark:bg-slate-900/70 rounded-2xl border border-cream-300 dark:border-amber-500/20 space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-saffron-800 dark:text-amber-400 font-cinzel">
              पदार्थः (Word-by-Word Anvaya)
            </span>
          </div>
          <div className="space-y-2 text-xs font-serif leading-relaxed text-stone-800 dark:text-slate-200">
            {mantra.word_meanings.map((wm, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-stone-500 dark:text-slate-400">
                  {wm.commentator} ({wm.language}):
                </span>
                <p className="pl-2 border-l-2 border-saffron-400 dark:border-amber-500/40 text-stone-800 dark:text-slate-200">
                  {wm.padartha_text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C. Translation Layer (English / Hindi depending on selected language) */}
      {showTranslation && activeTranslation && activeTranslation.text && (
        <div className="p-4.5 bg-amber-50/70 dark:bg-amber-950/25 rounded-2xl border border-amber-200/70 dark:border-amber-500/30 space-y-2 animate-fade-in shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-900 dark:text-amber-300 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
              <span>
                {activeTranslation.isEnglish
                  ? 'English Translation'
                  : selectedLanguage === 'english'
                    ? 'भावार्थः / Hindi Purport (English Translation Not Available)'
                    : 'हिंदी अनुवाद / भावार्थ'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Optional inline language switch if both exist */}
              {englishTranslation && hindiTranslation && (
                <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 p-0.5 rounded-lg border border-amber-200/60 dark:border-amber-500/30 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('english')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                      selectedLanguage === 'english'
                        ? 'bg-saffron-600 dark:bg-amber-500 text-white'
                        : 'text-stone-600 dark:text-slate-400 hover:text-saffron-800'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('hindi')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                      selectedLanguage === 'hindi'
                        ? 'bg-saffron-600 dark:bg-amber-500 text-white'
                        : 'text-stone-600 dark:text-slate-400 hover:text-saffron-800'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              )}

              <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-saffron-800 dark:text-amber-300 bg-saffron-100/90 dark:bg-amber-900/40 px-2 py-0.5 rounded border border-saffron-200/60 dark:border-amber-700/40">
                {activeTranslation.author}
              </span>
            </div>
          </div>
          <p className="font-serif italic text-stone-900 dark:text-slate-100 font-medium text-sm md:text-base leading-relaxed whitespace-pre-line">
            &quot;{activeTranslation.text}&quot;
          </p>
        </div>
      )}

      {/* D. Multi-Bhashya & Bhavartha Commentary View */}
      {showBhashyas && authorsList.length > 0 && (
        <div className="p-4.5 bg-cream-100/90 dark:bg-slate-900/70 rounded-2xl border border-cream-300 dark:border-amber-500/20 space-y-3 animate-fade-in">
          {/* Author Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-cream-300 dark:border-amber-500/20">
            <span className="text-[10px] font-bold uppercase text-stone-500 dark:text-slate-400 mr-1">Bhashyakara:</span>
            {authorsList.map((author) => (
              <button
                key={author}
                type="button"
                onClick={() => setSelectedBhashyaAuthor(author)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedBhashyaAuthor === author
                    ? 'bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-saffron-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-saffron-800 dark:hover:text-amber-300'
                }`}
              >
                {author}
              </button>
            ))}
          </div>

          {/* Render selected Bhashya content */}
          {bhashyasByAuthor[selectedBhashyaAuthor] && (
            <div className="space-y-2.5 text-xs font-serif leading-relaxed text-stone-800 dark:text-slate-200">
              {/* Mantra Theme / Vishaya */}
              {(bhashyasByAuthor[selectedBhashyaAuthor].vishaya_hi || bhashyasByAuthor[selectedBhashyaAuthor].vishaya_sk) && (
                <div className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-cream-300 dark:border-amber-500/20">
                  <span className="text-[10px] font-bold uppercase text-saffron-800 dark:text-amber-400 block mb-0.5">
                    विषयः (Theme):
                  </span>
                  <p>{bhashyasByAuthor[selectedBhashyaAuthor].vishaya_hi || bhashyasByAuthor[selectedBhashyaAuthor].vishaya_sk}</p>
                </div>
              )}

              {/* Bhavartha (Hindi Purport) */}
              {bhashyasByAuthor[selectedBhashyaAuthor].hindi && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-saffron-800 dark:text-amber-400">
                    भावार्थः (Hindi Purport):
                  </span>
                  <p className="leading-relaxed whitespace-pre-line text-stone-800 dark:text-slate-200">
                    {bhashyasByAuthor[selectedBhashyaAuthor].hindi}
                  </p>
                </div>
              )}

              {/* Sanskrit Purport */}
              {bhashyasByAuthor[selectedBhashyaAuthor].sanskrit && (
                <div className="space-y-1 pt-1 border-t border-cream-200 dark:border-amber-900/30">
                  <span className="text-[10px] font-bold uppercase text-saffron-800 dark:text-amber-400 font-sanskrit">
                    भावार्थः (संस्कृतम्):
                  </span>
                  <p className="font-sanskrit text-stone-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {bhashyasByAuthor[selectedBhashyaAuthor].sanskrit}
                  </p>
                </div>
              )}

              {/* Tika / Notes */}
              {bhashyasByAuthor[selectedBhashyaAuthor].tika && (
                <div className="p-2 bg-cream-200/60 dark:bg-slate-800/60 rounded-xl text-[11px] text-stone-600 dark:text-slate-400 italic">
                  <span className="font-bold">टीका: </span>
                  {bhashyasByAuthor[selectedBhashyaAuthor].tika}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* E. Cross-Veda Concordance Link */}
      {(mantra.rigveda_ref || mantra.yajurveda_ref || mantra.atharvaveda_ref) && (
        <div className="flex items-center gap-2 text-xs bg-saffron-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-saffron-200 dark:border-amber-800/30 text-saffron-900 dark:text-amber-300">
          <Compass className="w-4 h-4 text-saffron-600 dark:text-amber-400 shrink-0" />
          <span>
            {mantra.rigveda_ref && `Correlated Rigveda Mantra: Mandala ${mantra.rigveda_ref}`}
            {mantra.yajurveda_ref && ` • Yajurveda ${mantra.yajurveda_ref}`}
            {mantra.atharvaveda_ref && ` • Atharvaveda ${mantra.atharvaveda_ref}`}
          </span>
        </div>
      )}

      {/* 4. Interactive Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-cream-300/60 dark:border-amber-500/20">
        <div className="flex flex-wrap items-center gap-2">
          {/* Ask AI about this Mantra */}
          {onAskAboutMantra && (
            <button
              type="button"
              onClick={() => onAskAboutMantra(mantra)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-saffron-600 hover:from-saffron-500 hover:to-terracotta-500 text-white transition-all duration-200 cursor-pointer shadow-xs"
              title="Ask AI for deep philosophical analysis of this mantra"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI about Mantra</span>
            </button>
          )}

          {/* Bookmark */}
          <button
            type="button"
            onClick={toggleBookmarkCurrent}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
              bookmarked
                ? 'bg-saffron-50 dark:bg-amber-950/40 text-saffron-700 dark:text-amber-300 border-saffron-300 dark:border-amber-600'
                : 'bg-cream-200 dark:bg-slate-900 hover:bg-saffron-100 dark:hover:bg-slate-800 text-stone-600 dark:text-slate-400 border border-cream-400 dark:border-amber-500/20'
            }`}
            title={bookmarked ? "Saved to Bookmarks" : "Save Verse"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current text-saffron-600 dark:text-amber-400' : ''}`} />
            <span>{bookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Share Card */}
          {onOpenShareModal && (
            <button
              type="button"
              onClick={() => onOpenShareModal({
                sourceName: mantra.veda_name,
                chapterNumber: mantra.division_1,
                verseNumber: mantra.division_3,
                sanskritText: mantra.sanskrit_svara,
                transliteration: mantra.transliteration_iast,
                translationText: englishTranslation?.text || mantra.bhashyas?.[0]?.bhavartha || mantra.coordinate_str,
              })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cream-200 dark:bg-slate-900 hover:bg-saffron-100 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-300 border border-cream-400 dark:border-amber-500/20 transition-all duration-200 cursor-pointer"
              title="Generate shareable card"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>

    </article>
  );
}

export default React.memo(VedicVerseBlock);

