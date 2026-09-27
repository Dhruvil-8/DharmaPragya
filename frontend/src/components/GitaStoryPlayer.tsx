'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Maximize, 
  Minimize, 
  Layers, 
  Languages, 
  Sparkles, 
  BookAudio,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Settings2,
  RefreshCw,
  Info
} from 'lucide-react';
import { VerseData, Translation } from '../types';
import { GITA_CHAPTERS, GitaChapterInfo } from '../data/gitaChapters';
import { formatSanskritVerseLines } from '../lib/sanskritUtils';

export type StoryDisplayLanguage = 'sanskrit' | 'english' | 'hindi';

interface GitaStoryPlayerProps {
  initialChapter: number;
  initialVerseNumber?: number;
  initialLanguage?: StoryDisplayLanguage;
  verses: VerseData[];
  isLoading?: boolean;
  error?: string | null;
  onSelectChapter?: (chapter: number) => void;
}

export default function GitaStoryPlayer({
  initialChapter,
  initialVerseNumber = 1,
  initialLanguage = 'english',
  verses,
  isLoading = false,
  error = null,
  onSelectChapter,
}: GitaStoryPlayerProps) {
  const router = useRouter();

  // Active state
  const [currentChapter, setCurrentChapter] = useState<number>(initialChapter);
  const [displayLanguage, setDisplayLanguage] = useState<StoryDisplayLanguage>(initialLanguage);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isHudVisible, setIsHudVisible] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState<boolean>(false);

  // Audio reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chapter info
  const chapterInfo = useMemo<GitaChapterInfo>(() => {
    return GITA_CHAPTERS.find(c => c.number === currentChapter) || GITA_CHAPTERS[0];
  }, [currentChapter]);

  // Find index of current verse in the loaded verses array
  const currentVerseIndex = useMemo(() => {
    if (!verses || verses.length === 0) return 0;
    const target = initialVerseNumber || 1;
    const idx = verses.findIndex(v => v.verse_number === target);
    return idx >= 0 ? idx : 0;
  }, [verses, initialVerseNumber]);

  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(currentVerseIndex);

  // Sync index when verses or initialVerse changes
  useEffect(() => {
    if (verses && verses.length > 0) {
      if (initialVerseNumber) {
        const idx = verses.findIndex(v => v.verse_number === initialVerseNumber);
        setActiveVerseIndex(idx >= 0 ? idx : 0);
      }
    }
  }, [verses, initialVerseNumber]);

  const currentVerse = useMemo<VerseData | null>(() => {
    if (!verses || verses.length === 0) return null;
    return verses[activeVerseIndex] || verses[0];
  }, [verses, activeVerseIndex]);

  // Single clean translation picker
  const singleTranslation = useMemo<Translation | null>(() => {
    if (!currentVerse || !currentVerse.translations || displayLanguage === 'sanskrit') {
      return null;
    }

    const langTarget = displayLanguage.toLowerCase();
    const matches = currentVerse.translations.filter(
      t => t.language?.toLowerCase() === langTarget && t.text && t.text.trim().length > 0
    );

    if (matches.length === 0) return null;

    // Prefer renowned authoritative commentators
    if (langTarget === 'english') {
      const preferred = matches.find(
        t => t.author?.toLowerCase().includes('sivananda') || t.author?.toLowerCase().includes('gambhirananda')
      );
      return preferred || matches[0];
    } else if (langTarget === 'hindi') {
      const preferred = matches.find(
        t => t.author?.toLowerCase().includes('ramsukhdas') || t.author?.toLowerCase().includes('gita press')
      );
      return preferred || matches[0];
    }

    return matches[0];
  }, [currentVerse, displayLanguage]);

  // Formatted Sanskrit Lines
  const sanskritLines = useMemo(() => {
    if (!currentVerse?.sanskrit_text) return [];
    return formatSanskritVerseLines(currentVerse.sanskrit_text);
  }, [currentVerse]);

  // Check speaker from verse text (e.g. "श्रीभगवानुवाच", "सञ्जय उवाच", "अर्जुन उवाच")
  const speakerTag = useMemo(() => {
    if (!currentVerse?.sanskrit_text) return null;
    const text = currentVerse.sanskrit_text;
    if (text.includes('श्रीभगवानुवाच')) return 'श्रीभगवानुवाच (Sri Krishna)';
    if (text.includes('अर्जुन उवाच')) return 'अर्जुन उवाच (Arjuna)';
    if (text.includes('सञ्जय उवाच')) return 'सञ्जय उवाच (Sanjaya)';
    if (text.includes('धृतराष्ट्र उवाच')) return 'धृतराष्ट्र उवाच (Dhritarashtra)';
    return null;
  }, [currentVerse]);

  // Stop & clean audio on unmount or verse change
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setIsPlaying(false);
    setIsAudioLoading(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // Play audio for a specific verse
  const playVerseAudio = useCallback((chapterNum: number, verseNum: number) => {
    stopAudio();
    setAudioError(false);
    setIsAudioLoading(true);

    const audioUrl = `/api/audio/${chapterNum}/${verseNum}.mp3`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.playbackRate = playbackSpeed;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    audio.onplaying = () => {
      setIsAudioLoading(false);
      setIsPlaying(true);
    };

    audio.onpause = () => {
      setIsPlaying(false);
    };

    audio.onerror = () => {
      setIsAudioLoading(false);
      setIsPlaying(false);
      setAudioError(true);
      console.warn(`Audio streaming unavailable for verse ${chapterNum}.${verseNum}`);
    };

    audio.onended = () => {
      setIsPlaying(false);
      if (autoAdvance) {
        // Natural 1.2-second contemplative pause before next verse
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          setActiveVerseIndex(prev => {
            if (prev + 1 < (verses?.length || 0)) {
              return prev + 1;
            }
            return prev;
          });
        }, 1200);
      }
    };

    audio.play().catch(err => {
      console.warn("Audio autoplay blocked or stream error:", err);
      setIsAudioLoading(false);
      setIsPlaying(false);
    });
  }, [stopAudio, playbackSpeed, autoAdvance, verses]);

  // Trigger audio playback when active verse changes
  useEffect(() => {
    if (currentVerse && isPlaying) {
      playVerseAudio(currentVerse.chapter_number, currentVerse.verse_number);
    }
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, [activeVerseIndex]); // intentionally run on activeVerseIndex changes

  // Toggle Play / Pause
  const togglePlayPause = () => {
    if (!currentVerse) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (audioRef.current && audioRef.current.src && !audioError) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          playVerseAudio(currentVerse.chapter_number, currentVerse.verse_number);
        });
      } else {
        playVerseAudio(currentVerse.chapter_number, currentVerse.verse_number);
      }
    }
  };

  // Skip to next verse
  const handleNextVerse = () => {
    if (activeVerseIndex + 1 < (verses?.length || 0)) {
      setActiveVerseIndex(prev => prev + 1);
      if (isPlaying) {
        // Will auto play in effect
      }
    }
  };

  // Skip to previous verse
  const handlePrevVerse = () => {
    if (activeVerseIndex > 0) {
      setActiveVerseIndex(prev => prev - 1);
    }
  };

  // Seek within current verse audio
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.warn("Error attempting to enable full-screen mode:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowRight') {
        handleNextVerse();
      } else if (e.key === 'ArrowLeft') {
        handlePrevVerse();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'h' || e.key === 'H') {
        setIsHudVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[100dvh] bg-[#05070D] text-white overflow-hidden select-none flex flex-col justify-between font-sans"
    >
      
      {/* 1. AMBIENT SACRED BACKGROUND (Zero-asset pure responsive cosmic glow) */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {/* Soft Radial Ambient Lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] bg-gradient-to-br from-amber-500/10 via-saffron-600/5 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-amber-950/25 via-transparent to-transparent blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

        {/* Subtle Sacred Mandala Ring Silhouette */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] md:w-[640px] h-[340px] sm:h-[520px] md:h-[640px] rounded-full border border-amber-500/10 dark:border-amber-400/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[440px] md:w-[540px] h-[280px] sm:h-[440px] md:h-[540px] rounded-full border border-dashed border-amber-500/15 pointer-events-none animate-[spin_120s_linear_infinite]" />

        {/* Golden Starlight / Dust Particles */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
      </div>

      {/* 2. TOP HUD (Navigation & Chapter Context) */}
      <header 
        className={`relative z-20 w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4 transition-all duration-300 flex items-center justify-between gap-3 ${
          isHudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        {/* Exit & Back Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-stone-200 hover:text-white text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-md"
            title="Exit Story Mode and return to DharmaPragya"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>

          {/* Chapter Selector Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsChapterMenuOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 backdrop-blur-md border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md font-cinzel"
            >
              <BookAudio className="w-4 h-4 text-amber-400" />
              <span className="truncate max-w-[130px] sm:max-w-[200px] md:max-w-none">
                Ch {chapterInfo.number}: {chapterInfo.nameEnglish}
              </span>
            </button>

            {/* Chapter Selection Drawer */}
            {isChapterMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 sm:w-80 max-h-96 overflow-y-auto bg-stone-950/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-2 shadow-2xl z-50 text-xs animate-scale-up">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-400 border-b border-white/10 mb-1">
                  Select Bhagavad Gita Chapter
                </div>
                {GITA_CHAPTERS.map(ch => (
                  <button
                    key={ch.number}
                    type="button"
                    onClick={() => {
                      setIsChapterMenuOpen(false);
                      if (onSelectChapter) {
                        onSelectChapter(ch.number);
                      } else {
                        setCurrentChapter(ch.number);
                        router.push(`/story/gita?chapter=${ch.number}&verse=1&lang=${displayLanguage}`);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      ch.number === currentChapter
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                        : 'text-stone-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>Ch {ch.number}: {ch.nameEnglish}</span>
                    <span className="text-[10px] text-stone-500">{ch.verseCount}v</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Central Verse Pill */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-xs font-semibold text-amber-300 shadow-sm">
          <span>{chapterInfo.nameSanskrit}</span>
          <span className="text-white/40">•</span>
          <span>Verse {activeVerseIndex + 1} of {verses?.length || chapterInfo.verseCount}</span>
        </div>

        {/* Right Settings & Mode Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Quick Display Language Switcher */}
          <div className="flex items-center bg-black/50 backdrop-blur-md border border-white/20 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setDisplayLanguage('sanskrit')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                displayLanguage === 'sanskrit'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Pure Sanskrit Shloka only"
            >
              संस्कृत
            </button>
            <button
              type="button"
              onClick={() => setDisplayLanguage('english')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                displayLanguage === 'english'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Sanskrit + Single English Translation"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setDisplayLanguage('hindi')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                displayLanguage === 'hindi'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Sanskrit + Single Hindi Translation"
            >
              हिन्दी
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-stone-200 hover:text-white transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* HUD Hide Button */}
          <button
            type="button"
            onClick={() => setIsHudVisible(false)}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-stone-300 hover:text-white transition-all cursor-pointer"
            title="Hide UI (Tap screen to show)"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. CENTER SACRED STAGE (The Verse & Single Translation Display) */}
      <main 
        onClick={() => setIsHudVisible(prev => !prev)}
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 max-w-4xl mx-auto w-full text-center overflow-y-auto cursor-pointer"
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-12 animate-fade-in">
            <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
            <span className="text-sm font-cinzel text-amber-200 tracking-wider">
              Summoning Sacred Shlokas...
            </span>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/60 border border-red-500/40 rounded-3xl max-w-md text-center space-y-3 backdrop-blur-md">
            <span className="text-sm text-red-200 font-semibold">{error}</span>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Return Home
            </button>
          </div>
        ) : currentVerse ? (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in w-full py-4"
          >
            
            {/* Top Sacred Marker */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-serif text-amber-400 font-bold drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
                ॐ
              </span>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-amber-200/90 bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-full border border-amber-500/30 shadow-inner">
                <span>Chapter {currentVerse.chapter_number}</span>
                <span>•</span>
                <span>Verse {currentVerse.verse_number}</span>
              </div>
            </div>

            {/* Speaker Tag (if any) */}
            {speakerTag && (
              <div className="text-xs sm:text-sm font-semibold tracking-wider text-amber-300 font-cinzel italic">
                ~ {speakerTag} ~
              </div>
            )}

            {/* Main Sanskrit Shloka (Devanagari) */}
            <div className="space-y-2">
              {sanskritLines.map((line, idx) => (
                <p 
                  key={idx}
                  className="font-sanskrit text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-relaxed tracking-wide text-amber-100 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Optional IAST Transliteration */}
            {showTransliteration && currentVerse.transliteration && (
              <p className="text-xs sm:text-sm md:text-base text-amber-200/80 italic font-serif max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                {currentVerse.transliteration}
              </p>
            )}

            {/* SINGLE CLEAN TRANSLATION DISPLAY */}
            {singleTranslation && (
              <div className="max-w-2xl mx-auto p-4 sm:p-5 md:p-6 rounded-3xl bg-black/55 backdrop-blur-xl border border-amber-500/25 shadow-2xl text-left sm:text-center space-y-2 transition-all">
                <p className="text-xs sm:text-sm md:text-base text-stone-100 font-light leading-relaxed drop-shadow-xs">
                  &ldquo;{singleTranslation.text}&rdquo;
                </p>
                {singleTranslation.author && (
                  <div className="text-[10px] sm:text-[11px] font-medium text-amber-300/80 tracking-wide font-cinzel">
                    — {singleTranslation.author}
                  </div>
                )}
              </div>
            )}

            {/* Audio Error Alert (Non-blocking) */}
            {audioError && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-[11px] text-amber-300 backdrop-blur-md">
                <Info className="w-3.5 h-3.5" />
                <span>Audio stream currently loading or unavailable for this verse</span>
              </div>
            )}

          </div>
        ) : null}
      </main>

      {/* 4. BOTTOM FLOATING CONTROL DOCK */}
      <footer 
        className={`relative z-20 w-full px-3 sm:px-6 md:px-8 pb-4 sm:pb-6 pt-2 transition-all duration-300 ${
          isHudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <div className="max-w-3xl mx-auto bg-stone-950/85 backdrop-blur-2xl border border-amber-500/25 rounded-3xl p-3 sm:p-4 shadow-2xl space-y-2.5">
          
          {/* Progress Slider & Timestamps */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-400 font-medium px-1">
              <span>{formatTime(currentTime)}</span>
              <span className="text-amber-300 font-semibold">
                Verse {activeVerseIndex + 1} of {verses?.length || chapterInfo.verseCount}
              </span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="relative w-full flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 sm:h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Action & Control Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            
            {/* Left Controls: Autoplay & Transliteration Toggles */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setAutoAdvance(prev => !prev)}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  autoAdvance 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                    : 'bg-black/40 border-white/10 text-stone-500'
                }`}
                title="Automatically advance to next verse when audio finishes"
              >
                <RefreshCw className={`w-3 h-3 ${autoAdvance && isPlaying ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Auto-Next</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTransliteration(prev => !prev)}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                  showTransliteration 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                    : 'bg-black/40 border-white/10 text-stone-500'
                }`}
                title="Toggle Roman/IAST transliteration"
              >
                IAST
              </button>
            </div>

            {/* Center Controls: Prev, Play/Pause, Next */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Previous Verse */}
              <button
                type="button"
                onClick={handlePrevVerse}
                disabled={activeVerseIndex === 0}
                className="p-2 sm:p-2.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="Previous Verse (Left Arrow)"
              >
                <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Big Play / Pause Button */}
              <button
                type="button"
                onClick={togglePlayPause}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-600 to-saffron-500 hover:from-amber-500 hover:to-saffron-400 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-400/40"
                title={isPlaying ? "Pause (Space)" : "Play Chanting (Space)"}
              >
                {isAudioLoading ? (
                  <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                )}
              </button>

              {/* Next Verse */}
              <button
                type="button"
                onClick={handleNextVerse}
                disabled={activeVerseIndex >= (verses?.length || 0) - 1}
                className="p-2 sm:p-2.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="Next Verse (Right Arrow)"
              >
                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Right Controls: Playback Speed */}
            <div className="flex items-center gap-1.5">
              <select
                value={playbackSpeed}
                onChange={(e) => {
                  const speed = parseFloat(e.target.value);
                  setPlaybackSpeed(speed);
                  if (audioRef.current) {
                    audioRef.current.playbackRate = speed;
                  }
                }}
                className="p-1 sm:p-1.5 bg-black/60 border border-white/15 rounded-xl text-[10px] sm:text-xs font-semibold text-stone-300 focus:outline-hidden cursor-pointer"
                title="Audio playback speed"
              >
                <option value={0.8}>0.8x</option>
                <option value={1.0}>1.0x</option>
                <option value={1.2}>1.2x</option>
              </select>
            </div>

          </div>
        </div>
      </footer>

      {/* Floating Reveal HUD button when HUD is hidden */}
      {!isHudVisible && (
        <button
          type="button"
          onClick={() => setIsHudVisible(true)}
          className="fixed bottom-4 right-4 z-30 p-3 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-amber-500/30 text-amber-300 shadow-xl transition-all cursor-pointer animate-fade-in"
          title="Show UI Controls"
        >
          <Eye className="w-5 h-5" />
        </button>
      )}

    </div>
  );
}
