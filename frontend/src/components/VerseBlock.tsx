'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VerseData, Language } from '../types';
import { isVerseBookmarked, toggleBookmark } from '../lib/bookmarks';
import { formatSanskritVerseLines, parseWordMeanings, cleanCommentaryText } from '../lib/sanskritUtils';
import { 
  Bookmark, 
  Share2, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  Pause,
  Languages, 
  FileText,
  AlignLeft
} from 'lucide-react';

export type SanskritFontSize = 'sm' | 'md' | 'lg' | 'xl';

interface VerseBlockProps {
  verse: VerseData;
  index: number;
  totalVerses?: number;
  isAskMode?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  preferredLanguage?: string;
  autoPlayChant?: boolean;
  isActive?: boolean;
  readingMode?: string;
  fontSize?: SanskritFontSize;
  globalLayers?: {
    showTransliteration?: boolean;
    showWordMeanings?: boolean;
    showTranslation?: boolean;
    showCommentaries?: boolean;
  };
  onToggleGlobalLayer?: (layer: 'transliteration' | 'wordMeanings' | 'translation' | 'commentaries') => void;
  onOpenShareModal?: (details: {
    sourceName: string;
    chapterNumber: number;
    verseNumber: number;
    sanskritText: string;
    transliteration?: string;
    translationText: string;
  }) => void;
  onAskAboutVerse?: (verse: VerseData) => void;
}

function VerseBlock({
  verse,
  index,
  totalVerses,
  isAskMode = false,
  onNext,
  onPrev,
  preferredLanguage = 'english',
  autoPlayChant = false,
  isActive = true,
  fontSize = 'md',
  globalLayers,
  onToggleGlobalLayer,
  onOpenShareModal,
  onAskAboutVerse,
}: VerseBlockProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Unified Layer Visibility: Derived from globalLayers (defaults to true)
  const showTransliteration = globalLayers?.showTransliteration !== undefined ? globalLayers.showTransliteration : true;
  const showWordMeanings = globalLayers?.showWordMeanings !== undefined ? globalLayers.showWordMeanings : true;
  const showTranslation = globalLayers?.showTranslation !== undefined ? globalLayers.showTranslation : true;
  const showCommentaries = globalLayers?.showCommentaries !== undefined ? globalLayers.showCommentaries : true;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioPath = `/api/audio/${verse.chapter_number}/${verse.verse_number}.mp3`;

  // Bookmark synchronization
  useEffect(() => {
    setIsBookmarked(isVerseBookmarked(verse.source_name, verse.chapter_number, verse.verse_number));
    const handleUpdate = () => {
      setIsBookmarked(isVerseBookmarked(verse.source_name, verse.chapter_number, verse.verse_number));
    };
    window.addEventListener('dharmapragya_bookmarks_updated', handleUpdate);
    return () => window.removeEventListener('dharmapragya_bookmarks_updated', handleUpdate);
  }, [verse.source_name, verse.chapter_number, verse.verse_number]);

  // Sync preferredLanguage prop
  useEffect(() => {
    if (preferredLanguage) {
      Promise.resolve().then(() => {
        setSelectedLanguage(preferredLanguage as Language);
      });
    }
  }, [preferredLanguage]);

  // Clean up audio on unmount or when inactive
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const playAudio = () => {
    if (verse.source_name === 'Bhagavad Gita' || verse.source_name === 'Gita') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsAudioLoading(true);
      const audio = new Audio(audioPath);
      audioRef.current = audio;

      audio.onplaying = () => {
        setIsAudioLoading(false);
        setIsPlaying(true);
      };

      audio.onpause = () => {
        setIsPlaying(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsAudioLoading(false);
        setIsPlaying(false);
      };

      audio.play().catch(e => {
        console.warn("Audio playback issue:", e);
        setIsAudioLoading(false);
        setIsPlaying(false);
      });
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleBookmarkToggle = () => {
    const newStatus = toggleBookmark(verse);
    setIsBookmarked(newStatus);
  };

  const handleShareClick = () => {
    if (!onOpenShareModal) return;
    const defaultTranslation = verse.translations?.[0]?.text || '';
    onOpenShareModal({
      sourceName: verse.source_name,
      chapterNumber: verse.chapter_number,
      verseNumber: verse.verse_number,
      sanskritText: verse.sanskrit_text,
      transliteration: verse.transliteration,
      translationText: defaultTranslation,
    });
  };

  const handleAskAI = () => {
    if (onAskAboutVerse) {
      onAskAboutVerse(verse);
    }
  };

  // Robust parsing of all word-by-word Anvaya pairs
  const parsedMeanings = useMemo(() => {
    return parseWordMeanings(verse.word_meanings);
  }, [verse.word_meanings]);

  // Cleaned and filtered commentaries (strips word-by-word prefix from Sivananda and suppresses empty notes)
  const cleanedCommentaries = useMemo(() => {
    if (!verse.commentaries) return [];
    return verse.commentaries
      .map(c => {
        const cleaned = cleanCommentaryText(c.author, c.text);
        if (!cleaned) return null;
        return {
          ...c,
          text: cleaned,
        };
      })
      .filter((c): c is { author: string; language: string; text: string } => Boolean(c));
  }, [verse.commentaries]);

  // Dynamic Language Fallback Checks
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    if (verse.translations) {
      verse.translations.forEach(t => {
        if (t.language) langs.add(t.language.toLowerCase());
      });
    }
    cleanedCommentaries.forEach(c => {
      if (c.language) langs.add(c.language.toLowerCase());
    });

    const result: Language[] = [];
    if (langs.has('english')) result.push('english');
    if (langs.has('hindi')) result.push('hindi');
    if (langs.has('sanskrit')) result.push('sanskrit');
    return result;
  }, [verse.translations, cleanedCommentaries]);

  const activeLanguage = availableLanguages.includes(selectedLanguage)
    ? selectedLanguage
    : (availableLanguages.includes('english') ? 'english' : (availableLanguages[0] || 'english'));

  const filteredTranslations = useMemo(() => {
    return verse.translations
      ? verse.translations.filter(t => t.language?.toLowerCase() === activeLanguage && t.text && t.text.trim())
      : [];
  }, [verse.translations, activeLanguage]);

  const filteredCommentaries = useMemo(() => {
    return cleanedCommentaries.filter(c => c.language?.toLowerCase() === activeLanguage);
  }, [cleanedCommentaries, activeLanguage]);

  const hasTranslations = filteredTranslations.length > 0;
  const hasCommentaries = filteredCommentaries.length > 0;

  // Font size class mapping for Devanagari Sanskrit
  const getSanskritFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-lg md:text-xl leading-relaxed';
      case 'lg':
        return 'text-2xl md:text-3xl leading-loose';
      case 'xl':
        return 'text-3xl md:text-4xl leading-loose font-semibold';
      case 'md':
      default:
        return 'text-xl md:text-2xl leading-loose';
    }
  };

  return (
    <article className="bg-white dark:bg-[#0d121d] p-6 md:p-8 rounded-3xl shadow-xs border border-cream-300 dark:border-amber-500/20 hover:border-cream-400 dark:hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden select-text space-y-6">
      
      {/* Header Info & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-300/60 dark:border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-saffron-800 dark:text-amber-300 uppercase tracking-widest bg-saffron-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-saffron-200/60 dark:border-amber-700/40">
              {verse.source_name}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-saffron-700 to-terracotta-800 dark:from-amber-300 dark:to-saffron-400 font-cinzel mt-1.5">
            {verse.chapter_name}, Verse {verse.verse_number}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* 🔊 Authentic Recitation (Gita Only) */}
          {(verse.source_name === 'Bhagavad Gita' || verse.source_name === 'Gita') && (
            <button 
              type="button"
              onClick={isPlaying ? pauseAudio : playAudio} 
              disabled={isAudioLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-2xs ${
                isPlaying
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white' 
                  : 'bg-cream-200 dark:bg-slate-800 hover:bg-saffron-100 dark:hover:bg-slate-700 border border-cream-400 dark:border-amber-500/20 text-saffron-900 dark:text-amber-300'
              }`}
              title="Authentic Bhagavad Gita Sanskrit Recitation"
            >
              {isAudioLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-saffron-600/30 border-t-saffron-700 rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              <span>{isPlaying ? 'Pause' : 'Recite'}</span>
            </button>
          )}

          {/* 💬 "Ask AI about this Verse" */}
          <button
            type="button"
            onClick={handleAskAI}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-saffron-600 hover:from-saffron-500 hover:to-terracotta-500 text-white font-bold text-xs shadow-2xs cursor-pointer transition-all"
            title="Ask AI for deep philosophical explanation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>

          {/* 🔖 Bookmark */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-saffron-500 dark:bg-amber-600 text-white border-saffron-600 dark:border-amber-500 shadow-2xs'
                : 'bg-cream-200 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-saffron-800 dark:hover:text-amber-300 border border-cream-400 dark:border-amber-500/20'
            }`}
            title={isBookmarked ? "Remove from Saved Verses" : "Save Verse"}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* 🎴 Share Card */}
          {onOpenShareModal && (
            <button
              type="button"
              onClick={handleShareClick}
              className="p-2 rounded-xl bg-cream-200 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-saffron-800 dark:hover:text-amber-300 border border-cream-400 dark:border-amber-500/20 transition-all cursor-pointer"
              title="Generate Aesthetic Share Card"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Devanagari Sanskrit Text Centerpiece */}
      <div className="p-6 md:p-8 bg-cream-200/50 dark:bg-slate-900/60 rounded-2xl border border-cream-400/60 dark:border-amber-500/20 shadow-inner text-center space-y-4">
        <div className="space-y-2 py-2">
          {formatSanskritVerseLines(verse.sanskrit_text).map((line, idx) => (
            <p 
              key={idx} 
              className={`font-sanskrit ${getSanskritFontSizeClass()} text-stone-950 dark:text-amber-200 font-bold tracking-wide transition-all duration-200`}
            >
              {line}
            </p>
          ))}
        </div>
        
        {verse.transliteration && showTransliteration && (
          <div className="pt-3 border-t border-cream-300/50 dark:border-amber-500/20 animate-fade-in space-y-1">
            <h4 className="text-[10px] font-bold text-stone-600 dark:text-slate-400 uppercase tracking-widest text-left mb-2 select-none">
              IAST Transliteration
            </h4>
            {formatSanskritVerseLines(verse.transliteration).map((tLine, tIdx) => (
              <p key={tIdx} className="font-serif italic text-sm md:text-base text-stone-800 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
                {tLine}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Word-by-Word Anvaya Meanings Grid (Complete & Formatted) */}
      {!isAskMode && showWordMeanings && parsedMeanings.length > 0 && (
        <div className="p-5 bg-cream-200/70 dark:bg-slate-900/60 rounded-2xl border border-cream-400/60 dark:border-amber-500/20 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-saffron-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5 select-none font-cinzel">
              <BookOpen className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
              <span>Word-by-Word Anvaya ({parsedMeanings.length} Words)</span>
            </h4>
            <span className="text-[10px] text-stone-500 dark:text-slate-400 font-mono">
              Padartha breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {parsedMeanings.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-800/95 p-2.5 rounded-xl border border-cream-400/70 dark:border-amber-500/20 shadow-2xs flex flex-col justify-between hover:border-saffron-400 dark:hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-serif font-bold text-xs sm:text-sm text-saffron-900 dark:text-amber-300">
                    {item.word}
                  </span>
                  <span className="text-[9px] font-mono text-stone-400 dark:text-slate-500 shrink-0">
                    #{idx + 1}
                  </span>
                </div>
                <span className="text-xs text-stone-700 dark:text-slate-300 mt-1 leading-snug font-medium">
                  {item.meaning}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display Language Tabs */}
      {availableLanguages.length > 1 && (hasTranslations || hasCommentaries) && showTranslation && (
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-cream-300/40 dark:border-amber-500/20 select-none">
          <div className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-slate-300 font-bold">
            <Languages className="w-4 h-4 text-stone-600 dark:text-slate-400" />
            <span>TRANSLATION LANGUAGE:</span>
          </div>

          <div className="flex gap-1.5 bg-cream-300/80 dark:bg-slate-900/80 p-1 rounded-full border border-cream-400/50 dark:border-amber-500/20">
            {availableLanguages.map((lang) => (
              <button 
                key={lang} 
                type="button"
                onClick={() => setSelectedLanguage(lang)} 
                className={`px-4 py-1 text-xs font-bold rounded-full cursor-pointer transition-all duration-300 ${
                  activeLanguage === lang 
                    ? 'bg-gradient-to-r from-saffron-500 to-terracotta-500 dark:from-amber-500 dark:to-saffron-600 text-white shadow-xs' 
                    : 'text-saffron-900 dark:text-slate-300 hover:text-saffron-700 dark:hover:text-amber-300'
                }`}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Translations & Commentaries Section */}
      {(hasTranslations || hasCommentaries) && (
        <div className="space-y-6">
          {/* Translations Section */}
          {showTranslation && hasTranslations && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-900 dark:text-amber-300 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
                <span>Translations ({activeLanguage})</span>
              </div>

              <div className="grid gap-3">
                {filteredTranslations.map((t, i) => (
                  <div key={i} className="p-4 bg-saffron-50/70 dark:bg-amber-950/20 border border-saffron-200/50 dark:border-amber-500/20 hover:border-saffron-300 dark:hover:border-amber-500/40 rounded-2xl transition-all duration-200 shadow-2xs">
                    <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-saffron-800 dark:text-amber-300 bg-saffron-100/90 dark:bg-amber-900/40 px-2 py-0.5 rounded border border-saffron-200/60 dark:border-amber-700/40 mb-2">
                      {t.author}
                    </span>
                    <p className="font-serif italic text-stone-900 dark:text-slate-100 font-medium text-sm md:text-base leading-relaxed">
                      &quot;{t.text}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commentaries Section */}
          {!isAskMode && showCommentaries && hasCommentaries && (
            <div className="space-y-3 pt-2 animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-900 dark:text-amber-300 uppercase tracking-wider">
                <AlignLeft className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
                <span>Classical Commentaries ({activeLanguage})</span>
              </div>

              <div className="space-y-3">
                {filteredCommentaries.map((c, i) => (
                  <div key={i} className="p-5 bg-stone-50 dark:bg-slate-900/80 border border-cream-400/60 dark:border-amber-500/20 rounded-2xl hover:shadow-xs transition-all duration-200">
                    <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-stone-700 dark:text-amber-300 bg-stone-200/80 dark:bg-slate-800 px-2 py-0.5 rounded border border-stone-300/60 dark:border-amber-700/40 mb-2">
                      {c.author}
                    </span>
                    <p className="text-stone-900 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-serif font-medium">
                      &quot;{c.text}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </article>
  );
}

export default React.memo(VerseBlock);
