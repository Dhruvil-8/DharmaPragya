'use client';

import React, { useState, useEffect } from 'react';
import { DailyShloka } from '../types';
import { getTodayShloka } from '../lib/dailyShlokas';
import { Flame, Play, Pause, Compass, Share2, Quote, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface DailyContemplationProps {
  onAskQuestion?: (query: string, source: string) => void;
  onOpenShareModal?: (shloka: DailyShloka) => void;
}

export default function DailyContemplation({
  onAskQuestion,
  onOpenShareModal,
}: DailyContemplationProps) {
  const [shloka, setShloka] = useState<DailyShloka | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeLang, setActiveLang] = useState<'english' | 'hindi'>('english');
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    setShloka(getTodayShloka());
  }, []);

  const toggleAudio = () => {
    if (!shloka?.audio_path) return;

    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const audioInstance = audio || new Audio(shloka.audio_path);
      if (!audio) setAudio(audioInstance);

      audioInstance.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.error("Audio playback error:", e));

      audioInstance.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const handleAskDharmaPragya = () => {
    if (onAskQuestion && shloka) {
      const query = `Explain the profound philosophical and practical meaning of ${shloka.source_name} Chapter ${shloka.chapter_number} Verse ${shloka.verse_number} in relation to ${shloka.theme}.`;
      onAskQuestion(query, shloka.source_name);
    }
  };

  if (!shloka) return null;

  // Get a single-line preview of the Sanskrit text
  const sanskritPreview = shloka.sanskrit_text.split('\n')[0];

  return (
    <div className="w-full bg-white rounded-3xl border border-cream-400 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden mb-6">
      {/* Compact Header Bar — Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 p-4 md:px-6 md:py-4 cursor-pointer group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-saffron-100 text-saffron-700 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold tracking-widest text-saffron-800 uppercase font-sans block">
              Daily Contemplation
            </span>
            <p className="text-sm font-bold font-cinzel text-saffron-950 truncate">
              {shloka.theme}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-xs font-bold px-2.5 py-1 rounded-full bg-cream-300 text-saffron-900 border border-cream-400">
            {shloka.source_name} • Ch. {shloka.chapter_number}, V. {shloka.verse_number}
          </span>
          <div className="p-1 rounded-full text-saffron-700 group-hover:bg-saffron-100 transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Collapsed Preview — Sanskrit snippet */}
      {!isExpanded && (
        <div className="px-4 md:px-6 pb-4 -mt-1">
          <p className="font-sanskrit text-base text-stone-600 truncate leading-relaxed">
            {sanskritPreview}…
          </p>
        </div>
      )}

      {/* Expanded Full Content */}
      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 md:px-6 pb-5 space-y-4">
          {/* Source Badge (mobile) */}
          <div className="flex items-center justify-between gap-2 sm:hidden">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cream-300 text-saffron-900 border border-cream-400">
              {shloka.source_name} • Ch. {shloka.chapter_number}, V. {shloka.verse_number}
            </span>

            {shloka.audio_path && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  isPlaying
                    ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white'
                    : 'bg-cream-300 hover:bg-saffron-100 text-saffron-900 border border-cream-400'
                }`}
                title={isPlaying ? "Pause Sacred Chant" : "Listen to Sacred Chant"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Chant'}</span>
              </button>
            )}
          </div>

          {/* Audio Button (desktop) */}
          {shloka.audio_path && (
            <div className="hidden sm:flex justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  isPlaying
                    ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white'
                    : 'bg-cream-300 hover:bg-saffron-100 text-saffron-900 border border-cream-400'
                }`}
                title={isPlaying ? "Pause Sacred Chant" : "Listen to Sacred Chant"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Chant'}</span>
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3 ml-1">
                    <span className="vedic-bar" />
                    <span className="vedic-bar" />
                    <span className="vedic-bar" />
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Centerpiece: Devanagari Sanskrit Text */}
          <div className="text-center py-1 space-y-2">
            <p className="font-sanskrit text-xl md:text-2xl font-bold text-stone-950 leading-relaxed whitespace-pre-wrap">
              {shloka.sanskrit_text}
            </p>

            {shloka.transliteration && (
              <p className="font-serif italic text-xs md:text-sm text-stone-700 font-medium max-w-xl mx-auto leading-relaxed">
                {shloka.transliteration}
              </p>
            )}
          </div>

          {/* Translation & Reflection */}
          <div className="pt-3 border-t border-cream-300/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-saffron-900">
                <Quote className="w-3 h-3 text-saffron-700" />
                <span>Translation</span>
              </div>

              <div className="flex bg-cream-300 p-0.5 rounded-lg border border-cream-400 text-[10px]">
                <button
                  onClick={() => setActiveLang('english')}
                  className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    activeLang === 'english'
                      ? 'bg-saffron-600 text-white shadow-xs'
                      : 'text-stone-700 hover:text-saffron-900'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveLang('hindi')}
                  className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    activeLang === 'hindi'
                      ? 'bg-saffron-600 text-white shadow-xs'
                      : 'text-stone-700 hover:text-saffron-900'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            <p className="font-serif italic text-sm md:text-base text-stone-900 leading-relaxed font-medium">
              &quot;{activeLang === 'english' ? shloka.translation_english : shloka.translation_hindi}&quot;
            </p>

            {/* Practical Modern Contemplation */}
            <div className="p-3 bg-saffron-50/80 rounded-xl border border-saffron-200/60">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-saffron-900 mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-saffron-700" />
                <span>Modern Living Reflection</span>
              </div>
              <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-sans font-medium">
                {shloka.reflection}
              </p>
            </div>
          </div>

          {/* Bottom Action Triggers */}
          <div className="pt-3 border-t border-cream-300/60 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleAskDharmaPragya}
              className="flex items-center gap-1.5 text-xs font-bold text-saffron-800 hover:text-saffron-950 cursor-pointer group"
            >
              <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform text-saffron-700" />
              <span>Inquire Deeper with AI</span>
            </button>

            {onOpenShareModal && (
              <button
                onClick={() => onOpenShareModal(shloka)}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-saffron-900 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-saffron-700" />
                <span>Share Daily Card</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
