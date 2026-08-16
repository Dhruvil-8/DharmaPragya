'use client';

import React, { useState, useRef, useEffect } from 'react';
import { VerseData, Language } from '../types';
import { isVerseBookmarked, toggleBookmark } from '../lib/bookmarks';
import { Play, Pause, ChevronLeft, ChevronRight, Languages, BookOpen, Volume2, Bookmark, Share2 } from 'lucide-react';
import { ManuscriptCorners } from './VedicOrnaments';

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
  onOpenShareModal?: (details: {
    sourceName: string;
    chapterNumber: number;
    verseNumber: number;
    sanskritText: string;
    transliteration?: string;
    translationText: string;
  }) => void;
}

export default function VerseBlock({
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
  onOpenShareModal,
}: VerseBlockProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showMeaningsFocus, setShowMeaningsFocus] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const audioPath = `/api/audio/${verse.chapter_number}/${verse.verse_number}.mp3`;

  useEffect(() => {
    setIsBookmarked(isVerseBookmarked(verse.source_name, verse.chapter_number, verse.verse_number));
    const handleUpdate = () => {
      setIsBookmarked(isVerseBookmarked(verse.source_name, verse.chapter_number, verse.verse_number));
    };
    window.addEventListener('dharmapragya_bookmarks_updated', handleUpdate);
    return () => window.removeEventListener('dharmapragya_bookmarks_updated', handleUpdate);
  }, [verse.source_name, verse.chapter_number, verse.verse_number]);

  // Sync preferredLanguage prop to internal selectedLanguage
  useEffect(() => {
    if (preferredLanguage) {
      Promise.resolve().then(() => {
        setSelectedLanguage(preferredLanguage as Language);
      });
    }
  }, [preferredLanguage]);

  // Audio lifecycle and autoplay synchronization on verse navigation
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    if (autoPlayChant && readingMode === 'focus' && isActive && verse.source_name === 'Bhagavad Gita' && !isAskMode) {
      const timer = setTimeout(() => {
        playAudio();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse.id, verse.chapter_number, verse.verse_number, autoPlayChant, readingMode, isActive]);

  // Clean up audio player on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio if the component becomes inactive (e.g. tab switched)
  useEffect(() => {
    if (!isActive) {
      pauseAudio();
    }
  }, [isActive]);

  function playAudio() {
    try {
      setIsAudioLoading(true);
      if (!audioRef.current) {
        audioRef.current = new Audio(audioPath);
      } else if (audioRef.current.src !== window.location.origin + audioPath) {
        audioRef.current.src = audioPath;
        audioRef.current.load();
      }
      
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsAudioLoading(false);
        })
        .catch(e => {
          console.error("Audio playback failed:", e);
          setIsPlaying(false);
          setIsAudioLoading(false);
        });

      audioRef.current.onended = () => {
        setIsPlaying(false);
        if (autoPlayChant && onNext && !isAskMode) {
          onNext();
        }
      };
      
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setIsAudioLoading(false);
      };
    } catch (e) {
      console.error('Audio play failed', e);
      setIsPlaying(false);
      setIsAudioLoading(false);
    }
  }

  function pauseAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }

  const handleBookmarkToggle = () => {
    const nextState = toggleBookmark(verse);
    setIsBookmarked(nextState);
  };

  const handleShareClick = () => {
    if (onOpenShareModal) {
      const activeTrans = filteredTranslations[0]?.text || verse.translations?.[0]?.text || '';
      onOpenShareModal({
        sourceName: verse.source_name,
        chapterNumber: verse.chapter_number,
        verseNumber: verse.verse_number,
        sanskritText: verse.sanskrit_text,
        transliteration: verse.transliteration,
        translationText: activeTrans,
      });
    }
  };

  // Touch Swipe Handlers for Mobile Focus Mode
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    const threshold = 60;
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onPrev) {
        onPrev();
      } else if (deltaX < 0 && onNext) {
        onNext();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Parse Sanskrit word meanings from semicolon-separated key-values
  const parseWordMeanings = (meaningsStr: string) => {
    if (!meaningsStr) return [];
    return meaningsStr.split(';').map(item => {
      let parts = item.split('—');
      if (parts.length < 2) parts = item.split('–');
      if (parts.length < 2) {
        const match = item.match(/(.+?)\s*[-:]\s*(.+)/);
        if (match) {
          parts = [match[1], match[2]];
        }
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

  const focusTranslation = filteredTranslations[0];

  // 1. RENDER FOCUS MODE CARD
  if (readingMode === 'focus') {
    return (
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-3xl mx-auto flex flex-col manuscript-card diya-card-glow border border-saffron-300/40 dark:border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden hover:border-saffron-400 dark:hover:border-amber-400/50 transition-all duration-300 min-h-[500px] select-none relative"
      >
        <ManuscriptCorners />

        {/* Top Info Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-cream-200 to-cream-100 dark:from-[#221c17] dark:to-[#1a1613] border-b border-cream-300 dark:border-[#2d261e] flex justify-between items-center z-10">
          <div>
            <span className="text-[10px] font-extrabold text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-saffron-950/60 px-2.5 py-1 rounded-full border border-saffron-200/20 dark:border-saffron-900/40 uppercase tracking-widest">
              {verse.source_name}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-cinzel font-bold ml-2.5">
              Ch. {verse.chapter_number}, Verse {verse.verse_number}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-saffron-500 text-white border-saffron-600 shadow-xs'
                  : 'bg-white dark:bg-[#201a15] text-stone-400 hover:text-saffron-600 dark:hover:text-saffron-300 border-cream-400 dark:border-[#3a3229]'
              }`}
              title={isBookmarked ? "Remove from Sanctuary" : "Save to Sanctuary"}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>

            {/* Share Card button */}
            {onOpenShareModal && (
              <button
                onClick={handleShareClick}
                className="p-2 rounded-full bg-white dark:bg-[#201a15] text-stone-400 hover:text-saffron-600 dark:hover:text-saffron-300 border border-cream-400 dark:border-[#3a3229] transition-all cursor-pointer"
                title="Share as Image Card"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Audio Chanting controls (Only Gita) */}
            {verse.source_name === 'Bhagavad Gita' && (
              <button 
                onClick={isPlaying ? pauseAudio : playAudio} 
                disabled={isAudioLoading}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs ${
                  isPlaying 
                    ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white' 
                    : 'bg-cream-300 dark:bg-[#25201b] hover:bg-saffron-100 dark:hover:bg-[#2e2720] text-saffron-800 dark:text-saffron-200 border border-cream-400 dark:border-[#3a3229]'
                }`}
              >
                {isAudioLoading ? (
                  <div className="w-3 h-3 border-2 border-saffron-600/30 border-t-saffron-700 rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                <span>{isPlaying ? 'Pause' : 'Chant'}</span>
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3 ml-1">
                    <span className="vedic-bar" />
                    <span className="vedic-bar" />
                    <span className="vedic-bar" />
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Central Scripture Panel */}
        <div className="flex-grow p-6 md:p-10 flex flex-col justify-center text-center space-y-6 md:space-y-8">
          {/* Devangari Sanskrit Text */}
          <div className="space-y-4">
            <h4 className="text-[9px] font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase">Sanskrit</h4>
            <p className="font-sanskrit text-2xl md:text-3xl text-stone-800 dark:text-[#f5eedc] font-bold leading-loose tracking-wide whitespace-pre-wrap py-2 select-text">
              {verse.sanskrit_text}
            </p>
          </div>

          {/* Transliteration */}
          {verse.transliteration && (
            <div className="py-2 border-t border-dashed border-cream-300 dark:border-[#2d261e] max-w-xl mx-auto w-full">
              <h4 className="text-[9px] font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-1">Transliteration</h4>
              <p className="font-serif italic text-sm md:text-base text-stone-500 dark:text-stone-400 leading-relaxed select-text">
                {verse.transliteration}
              </p>
            </div>
          )}

          {/* Preferred Translation (Single choice) */}
          <div className="pt-4 border-t border-cream-300 dark:border-[#2d261e] max-w-xl mx-auto w-full">
            <h4 className="text-[9px] font-bold text-saffron-600 dark:text-saffron-400 tracking-widest uppercase mb-2 flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Translation ({activeLanguage})</span>
            </h4>
            
            {focusTranslation ? (
              <div className="space-y-1.5">
                <p className="font-serif italic text-stone-700 dark:text-stone-200 text-base md:text-lg leading-relaxed select-text">
                  &quot;{focusTranslation.text}&quot;
                </p>
                <span className="inline-block text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                  — {focusTranslation.author}
                </span>
              </div>
            ) : (
              <p className="text-stone-400 dark:text-stone-500 italic text-xs">
                No translation available in {activeLanguage} for this verse.
              </p>
            )}
          </div>
        </div>

        {/* Collapsible Word meanings / Navigation buttons footer */}
        <div className="px-6 py-4 bg-cream-200 dark:bg-[#161310] border-t border-cream-300 dark:border-[#2d261e] flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            {/* Word Breakdown Toggle */}
            {!isAskMode && parsedMeanings.length > 0 ? (
              <button 
                onClick={() => setShowMeaningsFocus(!showMeaningsFocus)}
                className="text-xs font-bold text-saffron-700 dark:text-saffron-300 hover:text-saffron-600 cursor-pointer flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showMeaningsFocus ? 'Hide' : 'Show'} Word Meanings</span>
              </button>
            ) : (
              <div />
            )}

            {/* Desktop Navigation Helper Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onPrev}
                disabled={index === 0}
                className="p-1.5 rounded-lg border border-cream-400 dark:border-[#3a3229] bg-white dark:bg-[#1f1a15] text-stone-600 dark:text-stone-300 hover:text-saffron-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous Verse"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {index + 1} / {totalVerses || 1}
              </span>
              <button
                onClick={onNext}
                disabled={index === (totalVerses || 0) - 1}
                className="p-1.5 rounded-lg border border-cream-400 dark:border-[#3a3229] bg-white dark:bg-[#1f1a15] text-stone-600 dark:text-stone-300 hover:text-saffron-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next Verse"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Word Meanings Expanded Grid */}
          {showMeaningsFocus && parsedMeanings.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-3 border-t border-cream-300 dark:border-[#2d261e] max-h-48 overflow-y-auto pr-1 animate-fade-in select-text">
              {parsedMeanings.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-[#1f1a15] p-2 rounded-xl border border-cream-300 dark:border-[#3a3229] shadow-inner flex flex-col">
                  <span className="font-serif font-bold text-xs text-saffron-800 dark:text-saffron-300">{item.word}</span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 leading-tight">{item.meaning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. RENDER STUDY (NORMAL) MODE BLOCK
  return (
    <div className="manuscript-card p-6 md:p-8 rounded-3xl shadow-md border border-saffron-300/40 dark:border-amber-500/30 hover:border-saffron-400 dark:hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden select-text">
      <ManuscriptCorners />
      {/* Decorative vertical saffron stripe on the left edge */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-saffron-500 to-terracotta-600" />

      {/* Header Info, Actions & Audio Player */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-cream-300/40 dark:border-[#2d261e] z-10 relative">
        <div>
          <span className="text-[10px] font-bold text-saffron-600 dark:text-saffron-400 uppercase tracking-widest bg-saffron-50 dark:bg-saffron-950/60 px-2.5 py-1 rounded-full border border-saffron-200/20 dark:border-saffron-900/40">
            {verse.source_name}
          </span>
          <h3 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-saffron-700 to-terracotta-800 dark:from-amber-400 dark:to-saffron-300 font-cinzel mt-1.5">
            {verse.chapter_name}, Verse {verse.verse_number}
          </h3>
          {!isAskMode && totalVerses && (
            <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider mt-0.5">Verse {index + 1} of {totalVerses}</p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Bookmark Action */}
          <button
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-saffron-500 text-white border-saffron-600 shadow-xs'
                : 'bg-cream-200 dark:bg-[#201a15] text-stone-500 dark:text-stone-400 hover:text-saffron-700 dark:hover:text-saffron-300 border-cream-400 dark:border-[#3a3229]'
            }`}
            title={isBookmarked ? "Remove from Sanctuary" : "Save to Sanctuary"}
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Share as Card Action */}
          {onOpenShareModal && (
            <button
              onClick={handleShareClick}
              className="p-2 rounded-xl bg-cream-200 dark:bg-[#201a15] text-stone-500 dark:text-stone-400 hover:text-saffron-700 dark:hover:text-saffron-300 border border-cream-400 dark:border-[#3a3229] transition-all cursor-pointer"
              title="Share as Image Card"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {/* Audio Player Button (Bhagavad Gita only) */}
          {verse.source_name === 'Bhagavad Gita' && (
            <button 
              onClick={isPlaying ? pauseAudio : playAudio} 
              disabled={isAudioLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs ${
                isPlaying 
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white' 
                  : 'bg-cream-300 dark:bg-[#25201b] hover:bg-saffron-100 dark:hover:bg-[#2e2720] border border-cream-400 dark:border-[#3a3229] text-saffron-800 dark:text-saffron-200'
              }`}
            >
              {isAudioLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-saffron-600/30 border-t-saffron-700 rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>{isPlaying ? 'Pause Audio' : 'Play Chant'}</span>
              
              {/* Vedic Harmonic Wave Visualizer */}
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="vedic-bar" />
                  <span className="vedic-bar" />
                  <span className="vedic-bar" />
                  <span className="vedic-bar" />
                  <span className="vedic-bar" />
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sanskrit Text Centerpiece with Sacred Styling */}
      <div className="my-6 p-6 md:p-8 bg-cream-200/50 dark:bg-[#161310] rounded-2xl border border-cream-400/60 dark:border-[#2d261e] shadow-inner text-center space-y-4">
        <h4 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest text-left select-none">SANSKRIT TEXT</h4>
        <p className="font-sanskrit text-xl md:text-2xl text-stone-800 dark:text-[#f5eedc] font-bold leading-loose tracking-wide whitespace-pre-wrap py-2">
          {verse.sanskrit_text}
        </p>
        
        {verse.transliteration && (
          <div className="pt-3 border-t border-cream-300/50 dark:border-[#2d261e]">
            <h4 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest text-left mb-2 select-none">TRANSLITERATION</h4>
            <p className="font-serif italic text-sm md:text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mx-auto">
              {verse.transliteration}
            </p>
          </div>
        )}
      </div>

      {/* Structured Word meanings collapsible grid */}
      {!isAskMode && parsedMeanings.length > 0 && (
        <div className="my-6 p-5 bg-cream-300/40 dark:bg-[#181411] rounded-2xl border border-cream-400/50 dark:border-[#2d261e]">
          <h4 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1 select-none">
            <BookOpen className="w-3.5 h-3.5 text-saffron-500" />
            <span>Sanskrit Word Meanings</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
            {parsedMeanings.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-[#201a15] p-2.5 rounded-xl border border-cream-400/60 dark:border-[#3a3229] shadow-xs flex flex-col hover:border-saffron-300 dark:hover:border-saffron-500/40 transition-colors">
                <span className="font-serif font-bold text-xs text-saffron-800 dark:text-saffron-300">{item.word}</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-tight">{item.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Language / Translation Tab Controls */}
      {availableLanguages.length > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-cream-300/40 dark:border-[#2d261e] select-none">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-semibold">
            <Languages className="w-4 h-4 text-stone-400" />
            <span>DISPLAY LANGUAGE</span>
          </div>

          <div className="flex gap-1.5 bg-cream-300/80 dark:bg-[#25201b] p-1 rounded-full border border-cream-400/50 dark:border-[#3a3229]">
            {availableLanguages.map((lang) => (
              <button 
                key={lang} 
                onClick={() => setSelectedLanguage(lang)} 
                className={`px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all duration-300 ${
                  activeLanguage === lang 
                    ? 'bg-gradient-to-r from-saffron-500 to-terracotta-500 text-white shadow-xs' 
                    : 'text-saffron-800 dark:text-saffron-300 hover:text-saffron-600 dark:hover:text-saffron-200'
                }`}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Translations & Commentaries Display */}
      <div className="space-y-6">
        {/* Translations Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-800 dark:text-saffron-400 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Translations ({activeLanguage})</span>
          </div>

          {hasTranslations ? (
            <div className="grid gap-3">
              {filteredTranslations.map((t, i) => (
                <div key={i} className="p-4 bg-saffron-50/60 dark:bg-[#201a15] border border-saffron-200/30 dark:border-[#3a3229] hover:border-saffron-300 dark:hover:border-saffron-500/40 rounded-2xl transition-all duration-200 shadow-xs">
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-saffron-700 dark:text-saffron-400 bg-saffron-100/60 dark:bg-saffron-950/60 px-2 py-0.5 rounded border border-saffron-200/40 dark:border-saffron-900/40 mb-2">
                    {t.author}
                  </span>
                  <p className="font-serif italic text-stone-700 dark:text-stone-300 text-sm leading-relaxed">&quot;{t.text}&quot;</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 dark:text-stone-500 italic text-xs p-4 bg-cream-200/20 dark:bg-[#181411] rounded-xl border border-dashed border-cream-400/40 dark:border-[#2d261e] text-center">
              No translation available in {activeLanguage} for this verse.
            </p>
          )}
        </div>

        {/* Commentaries Section */}
        {hasCommentaries && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-800 dark:text-saffron-400 uppercase tracking-wider">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Commentaries ({activeLanguage})</span>
            </div>

            <div className="space-y-3">
              {filteredCommentaries.map((c, i) => (
                <div key={i} className="p-5 bg-stone-50 dark:bg-[#1e1914] border border-cream-400/60 dark:border-[#3a3229] rounded-2xl hover:shadow-xs transition-all duration-200">
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-stone-600 dark:text-stone-400 bg-stone-200/60 dark:bg-stone-800/60 px-2 py-0.5 rounded border border-stone-300/40 dark:border-stone-700/40 mb-2">
                    {c.author}
                  </span>
                  <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-wrap font-serif">&quot;{c.text}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prev/Next Verse Navigation (Only in Reading Mode) */}
      {!isAskMode && onNext && onPrev && (
        <div className="mt-8 pt-5 border-t border-cream-300/40 dark:border-[#2d261e] flex justify-between items-center gap-4 select-none">
          <button 
            onClick={onPrev} 
            disabled={index === 0} 
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-cream-400 dark:border-[#3a3229] bg-white dark:bg-[#201a15] text-stone-600 dark:text-stone-300 hover:text-saffron-700 dark:hover:text-saffron-300 hover:bg-saffron-50 dark:hover:bg-[#28221b] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Verse</span>
          </button>
          
          <button 
            onClick={onNext} 
            disabled={index === (totalVerses || 0) - 1} 
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-cream-400 dark:border-[#3a3229] bg-white dark:bg-[#201a15] text-stone-600 dark:text-stone-300 hover:text-saffron-700 dark:hover:text-saffron-300 hover:bg-saffron-50 dark:hover:bg-[#28221b] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 shadow-xs"
          >
            <span>Next Verse</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
