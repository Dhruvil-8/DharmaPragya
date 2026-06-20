import React, { useState, useRef, useEffect } from 'react';
import { VerseData, Language } from '../types';
import { Play, Pause, ChevronLeft, ChevronRight, Languages, BookOpen, Volume2 } from 'lucide-react';

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
  isActive = true
}: VerseBlockProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showMeaningsFocus, setShowMeaningsFocus] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const audioPath = `/api/audio/${verse.chapter_number}/${verse.verse_number}.mp3`;

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
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Auto-play next verse if autoplay is enabled, readingMode is focus, and source is Gita
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
        // Autoplay next verse when current chant finishes
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

  // Touch Swipe Handlers for Mobile Focus Mode
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    const threshold = 60; // minimum swipe distance in pixels
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onPrev) {
        // Swipe Right -> Go to Previous Verse
        onPrev();
      } else if (deltaX < 0 && onNext) {
        // Swipe Left -> Go to Next Verse
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
      let parts = item.split('—'); // EM dash
      if (parts.length < 2) parts = item.split('–'); // EN dash
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

  // Single focus translation (usually show the first author's translation in Focus Mode)
  const focusTranslation = filteredTranslations[0];

  // 1. RENDER FOCUS MODE CARD
  if (readingMode === 'focus') {
    return (
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-3xl mx-auto flex flex-col bg-white border border-cream-400 rounded-3xl shadow-xl overflow-hidden hover:border-saffron-300 transition-all duration-300 min-h-[500px] select-none"
      >
        {/* Top Info Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-cream-200 to-cream-100 border-b border-cream-300 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold text-saffron-600 bg-saffron-50 px-2.5 py-1 rounded-full border border-saffron-200/20 uppercase tracking-widest">
              {verse.source_name}
            </span>
            <span className="text-xs text-stone-500 font-cinzel font-bold ml-2.5">
              Ch. {verse.chapter_number}, Verse {verse.verse_number}
            </span>
          </div>
          
          {/* Audio Chanting controls (Only Gita) */}
          {verse.source_name === 'Bhagavad Gita' && (
            <button 
              onClick={isPlaying ? pauseAudio : playAudio} 
              disabled={isAudioLoading}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm ${
                isPlaying 
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white' 
                  : 'bg-cream-300 hover:bg-saffron-100 text-saffron-700'
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
            </button>
          )}
        </div>

        {/* Central Scripture Panel */}
        <div className="flex-grow p-6 md:p-10 flex flex-col justify-center text-center space-y-6 md:space-y-8">
          {/* Devangari Sanskrit Text */}
          <div className="space-y-4">
            <h4 className="text-[9px] font-bold text-stone-400 tracking-widest uppercase">Sanskrit</h4>
            <p className="font-cinzel text-2xl md:text-3xl text-stone-800 font-bold leading-loose tracking-wide whitespace-pre-wrap py-2 select-text">
              {verse.sanskrit_text}
            </p>
          </div>

          {/* Transliteration */}
          {verse.transliteration && (
            <div className="py-2 border-t border-dashed border-cream-300 max-w-xl mx-auto w-full">
              <h4 className="text-[9px] font-bold text-stone-400 tracking-widest uppercase mb-1">Transliteration</h4>
              <p className="font-serif italic text-sm md:text-base text-stone-500 leading-relaxed select-text">
                {verse.transliteration}
              </p>
            </div>
          )}

          {/* Preferred Translation (Single choice) */}
          <div className="pt-4 border-t border-cream-300 max-w-xl mx-auto w-full">
            <h4 className="text-[9px] font-bold text-saffron-600 tracking-widest uppercase mb-2 flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Translation ({activeLanguage})</span>
            </h4>
            
            {focusTranslation ? (
              <div className="space-y-1.5">
                <p className="font-serif italic text-stone-700 text-base md:text-lg leading-relaxed select-text">
                  &quot;{focusTranslation.text}&quot;
                </p>
                <span className="inline-block text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                  — {focusTranslation.author}
                </span>
              </div>
            ) : (
              <p className="text-stone-400 italic text-xs">
                No translation available in {activeLanguage} for this verse.
              </p>
            )}
          </div>
        </div>

        {/* Collapsible Word meanings / Navigation buttons footer */}
        <div className="px-6 py-4 bg-cream-200 border-t border-cream-300 flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            {/* Word Breakdown Toggle */}
            {!isAskMode && parsedMeanings.length > 0 ? (
              <button 
                onClick={() => setShowMeaningsFocus(!showMeaningsFocus)}
                className="text-xs font-bold text-saffron-700 hover:text-saffron-600 cursor-pointer flex items-center gap-1"
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
                className="p-1.5 rounded-lg border border-cream-400 bg-white text-stone-600 hover:text-saffron-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous Verse"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                {index + 1} / {totalVerses || 1}
              </span>
              <button
                onClick={onNext}
                disabled={index === (totalVerses || 0) - 1}
                className="p-1.5 rounded-lg border border-cream-400 bg-white text-stone-600 hover:text-saffron-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next Verse"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Word Meanings Expanded Grid */}
          {showMeaningsFocus && parsedMeanings.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-3 border-t border-cream-300 max-h-48 overflow-y-auto pr-1 animate-fade-in select-text">
              {parsedMeanings.map((item, idx) => (
                <div key={idx} className="bg-white p-2 rounded-xl border border-cream-300 shadow-inner flex flex-col">
                  <span className="font-serif font-bold text-xs text-saffron-800">{item.word}</span>
                  <span className="text-[10px] text-stone-500 mt-0.5 leading-tight">{item.meaning}</span>
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
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-cream-400 hover:border-saffron-500/20 transition-all duration-300 relative overflow-hidden select-text">
      {/* Decorative vertical saffron stripe on the left edge */}
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-saffron-500 to-terracotta-600" />

      {/* Header Info & Audio Player */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-cream-300/40">
        <div>
          <span className="text-[10px] font-bold text-saffron-600 uppercase tracking-widest bg-saffron-50 px-2.5 py-1 rounded-full border border-saffron-200/20">
            {verse.source_name}
          </span>
          <h3 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-saffron-700 to-terracotta-800 font-cinzel mt-1.5">
            {verse.chapter_name}, Verse {verse.verse_number}
          </h3>
          {!isAskMode && totalVerses && (
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Verse {index + 1} of {totalVerses}</p>
          )}
        </div>

        {/* Audio Player Button (Bhagavad Gita only) */}
        {verse.source_name === 'Bhagavad Gita' && (
          <div className="flex items-center self-start sm:self-auto">
            <button 
              onClick={isPlaying ? pauseAudio : playAudio} 
              disabled={isAudioLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm hover:shadow ${
                isPlaying 
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white hover:from-terracotta-600 hover:to-terracotta-700' 
                  : 'bg-cream-300 hover:bg-saffron-100 border border-cream-400 text-saffron-700 hover:text-saffron-800'
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
              
              {/* Sound wave icon when playing */}
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s', height: '100%' }} />
                  <span className="w-0.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s', height: '60%' }} />
                  <span className="w-0.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s', height: '80%' }} />
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Sanskrit Text Centerpiece */}
      <div className="my-6 p-6 md:p-8 bg-cream-200/40 rounded-2xl border border-cream-400/40 shadow-inner text-center space-y-4">
        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-left select-none">SANSKRIT TEXT</h4>
        <p className="font-cinzel text-xl md:text-2xl text-stone-800 font-bold leading-loose tracking-wide whitespace-pre-wrap py-2">
          {verse.sanskrit_text}
        </p>
        
        {verse.transliteration && (
          <div className="pt-2 border-t border-cream-300/40">
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-left mb-2 select-none">TRANSLITERATION</h4>
            <p className="font-serif italic text-sm md:text-base text-stone-500 leading-relaxed max-w-2xl mx-auto">
              {verse.transliteration}
            </p>
          </div>
        )}
      </div>

      {/* Structured Word meanings collapsible grid */}
      {!isAskMode && parsedMeanings.length > 0 && (
        <div className="my-6 p-5 bg-cream-300/30 rounded-2xl border border-cream-400/50">
          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-1 select-none">
            <BookOpen className="w-3.5 h-3.5 text-saffron-500" />
            <span>Sanskrit Word Meanings</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
            {parsedMeanings.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-cream-400/60 shadow-sm flex flex-col hover:border-saffron-300 transition-colors">
                <span className="font-serif font-bold text-xs text-saffron-800">{item.word}</span>
                <span className="text-[10px] text-stone-500 mt-1 leading-tight">{item.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Language / Translation Tab Controls */}
      {availableLanguages.length > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-cream-300/40 select-none">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
            <Languages className="w-4 h-4 text-stone-400" />
            <span>DISPLAY LANGUAGE</span>
          </div>

          <div className="flex gap-1.5 bg-cream-300/80 p-1 rounded-full border border-cream-400/50">
            {availableLanguages.map((lang) => (
              <button 
                key={lang} 
                onClick={() => setSelectedLanguage(lang)} 
                className={`px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all duration-300 ${
                  activeLanguage === lang 
                    ? 'bg-gradient-to-r from-saffron-500 to-terracotta-500 text-white shadow-sm' 
                    : 'text-saffron-700 hover:text-saffron-600 hover:bg-cream-300/40'
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
          <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-700 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Translations ({activeLanguage})</span>
          </div>

          {hasTranslations ? (
            <div className="grid gap-3">
              {filteredTranslations.map((t, i) => (
                <div key={i} className="p-4 bg-saffron-50/50 border border-saffron-200/20 hover:border-saffron-200/40 rounded-xl transition-all duration-200 shadow-sm">
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-saffron-600 bg-saffron-100/50 px-2 py-0.5 rounded border border-saffron-200/30 mb-2">
                    {t.author}
                  </span>
                  <p className="font-serif italic text-stone-700 text-sm leading-relaxed">&quot;{t.text}&quot;</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 italic text-xs p-4 bg-cream-200/20 rounded-xl border border-dashed border-cream-400/40 text-center">
              No translation available in {activeLanguage} for this verse.
            </p>
          )}
        </div>

        {/* Commentaries Section */}
        {hasCommentaries && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-700 uppercase tracking-wider">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Commentaries ({activeLanguage})</span>
            </div>

            <div className="space-y-3">
              {filteredCommentaries.map((c, i) => (
                <div key={i} className="p-5 bg-stone-50 border border-cream-400/60 rounded-xl hover:shadow-sm transition-all duration-200">
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-stone-500 bg-stone-200/50 px-2 py-0.5 rounded border border-stone-300/30 mb-2">
                    {c.author}
                  </span>
                  <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap font-serif">&quot;{c.text}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prev/Next Verse Navigation (Only in Reading Mode) */}
      {!isAskMode && onNext && onPrev && (
        <div className="mt-8 pt-5 border-t border-cream-300/40 flex justify-between items-center gap-4 select-none">
          <button 
            onClick={onPrev} 
            disabled={index === 0} 
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-cream-400 bg-white text-stone-600 hover:text-saffron-700 hover:bg-saffron-50 hover:border-saffron-300 font-semibold text-xs disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-stone-600 disabled:hover:border-cream-400 disabled:cursor-not-allowed cursor-pointer transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Verse</span>
          </button>
          
          <button 
            onClick={onNext} 
            disabled={index === (totalVerses || 0) - 1} 
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-cream-400 bg-white text-stone-600 hover:text-saffron-700 hover:bg-saffron-50 hover:border-saffron-300 font-semibold text-xs disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-stone-600 disabled:hover:border-cream-400 disabled:cursor-not-allowed cursor-pointer transition-all duration-300"
          >
            <span>Next Verse</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
