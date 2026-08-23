'use client';

import React, { useState, useRef, useEffect } from 'react';
import { VerseData, Language } from '../types';
import { isVerseBookmarked, toggleBookmark } from '../lib/bookmarks';
import { formatSanskritVerseLines } from '../lib/sanskritUtils';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Languages, 
  BookOpen, 
  Volume2, 
  Bookmark, 
  Share2, 
  Sparkles, 
  Type, 
  Layers, 
  FileText,
  AlignLeft
} from 'lucide-react';

interface VerseBlockProps {
  verse: VerseData;
  index: number;
  totalVerses?: number;
  isAskMode?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  readingMode?: 'study' | 'focus';
  preferredLanguage?: string;
  autoPlayChant?: boolean;
  isActive?: boolean;
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

type SanskritFontSize = 'sm' | 'md' | 'lg' | 'xl';

function VerseBlock({
  verse,
  index,
  totalVerses,
  isAskMode = false,
  onNext,
  onPrev,
  readingMode = 'study',
  preferredLanguage = 'english',
  autoPlayChant = false,
  isActive = true,
  globalLayers,
  onToggleGlobalLayer,
  onOpenShareModal,
  onAskAboutVerse,
}: VerseBlockProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Custom Font Size State
  const [fontSize, setFontSize] = useState<SanskritFontSize>('md');

  // Unified Layer Visibility: Derived from globalLayers
  const showTransliteration = globalLayers?.showTransliteration !== undefined ? globalLayers.showTransliteration : true;
  const showWordMeanings = globalLayers?.showWordMeanings !== undefined ? globalLayers.showWordMeanings : true;
  const showTranslation = globalLayers?.showTranslation !== undefined ? globalLayers.showTranslation : true;
  const showCommentaries = globalLayers?.showCommentaries !== undefined ? globalLayers.showCommentaries : true;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

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

  // Load saved font size preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSize = localStorage.getItem('dharmapragya_verse_fontsize') as SanskritFontSize;
      if (savedSize && ['sm', 'md', 'lg', 'xl'].includes(savedSize)) {
        setFontSize(savedSize);
      }
    }
  }, []);

  // Sync preferredLanguage prop
  useEffect(() => {
    if (preferredLanguage) {
      Promise.resolve().then(() => {
        setSelectedLanguage(preferredLanguage as Language);
      });
    }
  }, [preferredLanguage]);

  // Audio lifecycle and autoplay synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setIsAudioLoading(false);
    }

    if (autoPlayChant && readingMode === 'focus' && isActive && verse.source_name === 'Bhagavad Gita' && !isAskMode) {
      const timer = setTimeout(() => {
        playAudio();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse.id, verse.chapter_number, verse.verse_number, autoPlayChant, readingMode, isActive]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio if component becomes inactive
  useEffect(() => {
    if (!isActive) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  const handleFontSizeChange = (newSize: SanskritFontSize) => {
    setFontSize(newSize);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dharmapragya_verse_fontsize', newSize);
    }
  };

  const playAudio = () => {
    if (verse.source_name === 'Bhagavad Gita') {
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
        console.warn("Audio autoplay blocked or unavailable:", e);
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

  // Mobile Swipe Gesture Handlers (for Focus Mode)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold && onNext) {
      onNext();
    } else if (diff < -threshold && onPrev) {
      onPrev();
    }
  };

  // Parse structured word meanings
  const parseWordMeanings = (raw: string | undefined) => {
    if (!raw) return [];
    const items = raw.split(/[;,\n]/).map(s => s.trim()).filter(Boolean);
    return items.map(item => {
      let parts = item.split('--');
      if (parts.length < 2) parts = item.split('=');
      if (parts.length < 2) {
        const match = item.match(/(.+?)\s*[-:]\s*(.+)/);
        if (match) parts = [match[1], match[2]];
      }
      return {
        word: parts[0]?.trim(),
        meaning: parts[1]?.trim()
      };
    }).filter(item => item.word && item.meaning);
  };

  const parsedMeanings = parseWordMeanings(verse.word_meanings);

  // Dynamic Language Fallback Checks
  const verseLanguages = new Set<string>();
  if (verse.translations) {
    verse.translations.forEach(t => {
      if (t.language) verseLanguages.add(t.language.toLowerCase());
    });
  }
  if (verse.commentaries) {
    verse.commentaries.forEach(c => {
      if (c.language) verseLanguages.add(c.language.toLowerCase());
    });
  }

  const availableLanguages: Language[] = [];
  if (verseLanguages.has('english')) availableLanguages.push('english');
  if (verseLanguages.has('hindi')) availableLanguages.push('hindi');
  if (verseLanguages.has('sanskrit')) availableLanguages.push('sanskrit');

  const activeLanguage = availableLanguages.includes(selectedLanguage)
    ? selectedLanguage
    : (availableLanguages.includes('english') ? 'english' : (availableLanguages[0] || 'english'));

  const filteredTranslations = verse.translations
    ? verse.translations.filter(t => t.language?.toLowerCase() === activeLanguage)
    : [];
  const filteredCommentaries = verse.commentaries
    ? verse.commentaries.filter(c => c.language?.toLowerCase() === activeLanguage)
    : [];

  const hasTranslations = filteredTranslations.length > 0;
  const hasCommentaries = filteredCommentaries.length > 0;

  // Font size class mapping
  const getSanskritFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-lg md:text-xl leading-relaxed';
      case 'lg':
        return 'text-2xl md:text-3xl leading-loose';
      case 'xl':
        return 'text-3xl md:text-4xl leading-loose';
      case 'md':
      default:
        return 'text-xl md:text-2xl leading-loose';
    }
  };

  // 2. RENDER STUDY (NORMAL) MODE BLOCK
  return (
    <div className="bg-white dark:bg-[#0d121d] p-6 md:p-8 rounded-3xl shadow-sm border border-cream-400 dark:border-amber-500/20 hover:border-saffron-500/20 dark:hover:border-amber-500/40 transition-all duration-300 relative overflow-hidden select-text space-y-6">
      
      {/* Header Info & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-300/40 dark:border-amber-500/20">
        <div>
          <span className="text-[10px] font-bold text-saffron-800 dark:text-amber-300 uppercase tracking-widest bg-saffron-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-saffron-200/40 dark:border-amber-700/40">
            {verse.source_name}
          </span>
          <h3 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-saffron-700 to-terracotta-800 dark:from-amber-300 dark:to-saffron-400 font-cinzel mt-1.5">
            {verse.chapter_name}, Verse {verse.verse_number}
          </h3>
          {!isAskMode && totalVerses && (
            <p className="text-xs text-stone-600 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Verse {index + 1} of {totalVerses}</p>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* 1. 🔊 Authentic Recitation (Bhagavad Gita Only) */}
          {verse.source_name === 'Bhagavad Gita' && (
            <button 
              onClick={isPlaying ? pauseAudio : playAudio} 
              disabled={isAudioLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs ${
                isPlaying
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white' 
                  : 'bg-cream-300 dark:bg-slate-800 hover:bg-saffron-100 dark:hover:bg-slate-700 border border-cream-400 dark:border-amber-500/20 text-saffron-900 dark:text-amber-300'
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
              
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="vedic-bar" />
                  <span className="vedic-bar" />
                  <span className="vedic-bar" />
                </div>
              )}
            </button>
          )}

          {/* 2. 💬 "Ask AI about this Verse" */}
          <button
            onClick={handleAskAI}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-saffron-600 hover:from-saffron-500 hover:to-terracotta-500 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
            title="Ask AI for deep philosophical explanation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>

          {/* 3. 🔖 Bookmark to Sanctuary */}
          <button
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-saffron-500 dark:bg-amber-600 text-white border-saffron-600 dark:border-amber-500 shadow-xs'
                : 'bg-cream-200 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-saffron-800 dark:hover:text-amber-300 border-cream-400 dark:border-amber-500/20'
            }`}
            title={isBookmarked ? "Remove from Sanctuary" : "Save to Sanctuary"}
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* 4. 🎴 Aesthetic Instagram/Twitter Share Card */}
          {onOpenShareModal && (
            <button
              onClick={handleShareClick}
              className="p-2 rounded-xl bg-cream-200 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-saffron-800 dark:hover:text-amber-300 border border-cream-400 dark:border-amber-500/20 transition-all cursor-pointer"
              title="Generate Aesthetic Share Card"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Layer Toggle Pills Bar & Font Size Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-cream-100 dark:bg-slate-900/90 p-2.5 rounded-2xl border border-cream-300/80 dark:border-amber-500/20 select-none text-xs">
        {/* Toggle Layer Visibility Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
            <span>Layers:</span>
          </span>

          {verse.transliteration && (
            <button
              type="button"
              onClick={() => onToggleGlobalLayer ? onToggleGlobalLayer('transliteration') : null}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                showTransliteration
                  ? 'bg-saffron-100 dark:bg-amber-950/60 text-saffron-900 dark:text-amber-300 border-saffron-300 dark:border-amber-600/40 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-stone-500 dark:text-slate-400 border-cream-300 dark:border-slate-700 opacity-60'
              }`}
            >
              IAST Transliteration
            </button>
          )}

          {!isAskMode && parsedMeanings.length > 0 && (
            <button
              type="button"
              onClick={() => onToggleGlobalLayer ? onToggleGlobalLayer('wordMeanings') : null}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                showWordMeanings
                  ? 'bg-saffron-100 dark:bg-amber-950/60 text-saffron-900 dark:text-amber-300 border-saffron-300 dark:border-amber-600/40 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-stone-500 dark:text-slate-400 border-cream-300 dark:border-slate-700 opacity-60'
              }`}
            >
              Word-by-Word Anvaya
            </button>
          )}

          {hasTranslations && (
            <button
              type="button"
              onClick={() => onToggleGlobalLayer ? onToggleGlobalLayer('translation') : null}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                showTranslation
                  ? 'bg-saffron-100 dark:bg-amber-950/60 text-saffron-900 dark:text-amber-300 border-saffron-300 dark:border-amber-600/40 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-stone-500 dark:text-slate-400 border-cream-300 dark:border-slate-700 opacity-60'
              }`}
            >
              Translation ({activeLanguage})
            </button>
          )}

          {!isAskMode && hasCommentaries && (
            <button
              type="button"
              onClick={() => onToggleGlobalLayer ? onToggleGlobalLayer('commentaries') : null}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                showCommentaries
                  ? 'bg-saffron-100 dark:bg-amber-950/60 text-saffron-900 dark:text-amber-300 border-saffron-300 dark:border-amber-600/40 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-stone-500 dark:text-slate-400 border-cream-300 dark:border-slate-700 opacity-60'
              }`}
            >
              Commentaries ({filteredCommentaries.length})
            </button>
          )}
        </div>

        {/* Custom Sanskrit Font Size Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Type className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
            <span>Font:</span>
          </span>
          <div className="flex items-center gap-0.5 bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-cream-300 dark:border-amber-500/20">
            {(['sm', 'md', 'lg', 'xl'] as SanskritFontSize[]).map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleFontSizeChange(size)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  fontSize === size
                    ? 'bg-saffron-600 dark:bg-amber-600 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-slate-400 hover:text-saffron-800 dark:hover:text-slate-200'
                }`}
                title={`Set Sanskrit font size to ${size.toUpperCase()}`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Devanagari Sanskrit Text Centerpiece */}
      <div className="p-6 md:p-8 bg-cream-200/50 dark:bg-slate-900/60 rounded-2xl border border-cream-400/60 dark:border-amber-500/20 shadow-inner text-center space-y-4">
        <h4 className="text-[10px] font-bold text-stone-600 dark:text-slate-400 uppercase tracking-widest text-left select-none">
          Sanskrit Verse
        </h4>
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

      {/* Word-by-Word Anvaya Meanings Grid */}
      {!isAskMode && showWordMeanings && parsedMeanings.length > 0 && (
        <div className="p-5 bg-cream-300/40 dark:bg-slate-900/40 rounded-2xl border border-cream-400/50 dark:border-amber-500/20 animate-fade-in">
          <h4 className="text-[10px] font-bold text-stone-700 dark:text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1 select-none">
            <BookOpen className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
            <span>Word-by-Word Anvaya (Sanskrit Meanings)</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
            {parsedMeanings.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-cream-400/60 dark:border-amber-500/20 shadow-xs flex flex-col hover:border-saffron-300 dark:hover:border-amber-500/40 transition-colors">
                <span className="font-serif font-bold text-xs text-saffron-900 dark:text-amber-300">{item.word}</span>
                <span className="text-[10px] text-stone-700 dark:text-slate-300 mt-1 leading-tight font-medium">{item.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display Language Tabs */}
      {availableLanguages.length > 1 && showTranslation && (
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-cream-300/40 dark:border-amber-500/20 select-none">
          <div className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-slate-300 font-bold">
            <Languages className="w-4 h-4 text-stone-600 dark:text-slate-400" />
            <span>TRANSLATION LANGUAGE:</span>
          </div>

          <div className="flex gap-1.5 bg-cream-300/80 dark:bg-slate-900/80 p-1 rounded-full border border-cream-400/50 dark:border-amber-500/20">
            {availableLanguages.map((lang) => (
              <button 
                key={lang} 
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
      <div className="space-y-6">
        {/* Translations Section */}
        {showTranslation && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-900 dark:text-amber-300 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
              <span>Translations ({activeLanguage})</span>
            </div>

            {hasTranslations ? (
              <div className="grid gap-3">
                {filteredTranslations.map((t, i) => (
                  <div key={i} className="p-4 bg-saffron-50/60 dark:bg-amber-950/20 border border-saffron-200/40 dark:border-amber-500/20 hover:border-saffron-300 dark:hover:border-amber-500/40 rounded-2xl transition-all duration-200 shadow-xs">
                    <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-saffron-800 dark:text-amber-300 bg-saffron-100/80 dark:bg-amber-900/40 px-2 py-0.5 rounded border border-saffron-200/60 dark:border-amber-700/40 mb-2">
                      {t.author}
                    </span>
                    <p className="font-serif italic text-stone-900 dark:text-slate-100 font-medium text-sm md:text-base leading-relaxed">&quot;{t.text}&quot;</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-600 dark:text-slate-400 italic text-xs p-4 bg-cream-200/20 dark:bg-slate-900/40 rounded-xl border border-dashed border-cream-400/40 dark:border-amber-500/20 text-center">
                No translation available in {activeLanguage} for this verse.
              </p>
            )}
          </div>
        )}

        {/* Commentaries Section */}
        {!isAskMode && showCommentaries && hasCommentaries && (
          <div className="space-y-3 pt-2 animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-900 dark:text-amber-300 uppercase tracking-wider">
              <AlignLeft className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
              <span>Commentaries ({activeLanguage})</span>
            </div>

            <div className="space-y-3">
              {filteredCommentaries.map((c, i) => (
                <div key={i} className="p-5 bg-stone-50 dark:bg-slate-900/80 border border-cream-400/60 dark:border-amber-500/20 rounded-2xl hover:shadow-xs transition-all duration-200">
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-stone-700 dark:text-amber-300 bg-stone-200/80 dark:bg-slate-800 px-2 py-0.5 rounded border border-stone-300/60 dark:border-amber-700/40 mb-2">
                    {c.author}
                  </span>
                  <p className="text-stone-900 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-serif font-medium">&quot;{c.text}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prev/Next Verse Navigation */}
      {!isAskMode && onNext && onPrev && (
        <div className="mt-8 pt-5 border-t border-cream-300/40 dark:border-amber-500/20 flex justify-between items-center gap-4 select-none">
          <button 
            onClick={onPrev} 
            disabled={index === 0} 
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-cream-400 dark:border-amber-500/20 bg-white dark:bg-slate-900 text-stone-800 dark:text-slate-200 hover:text-saffron-900 dark:hover:text-amber-300 hover:bg-saffron-50 dark:hover:bg-slate-800 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Verse</span>
          </button>
          
          <button 
            onClick={onNext} 
            disabled={index === (totalVerses || 0) - 1} 
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-cream-400 dark:border-amber-500/20 bg-white dark:bg-slate-900 text-stone-800 dark:text-slate-200 hover:text-saffron-900 dark:hover:text-amber-300 hover:bg-saffron-50 dark:hover:bg-slate-800 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 shadow-xs"
          >
            <span>Next Verse</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default React.memo(VerseBlock);
