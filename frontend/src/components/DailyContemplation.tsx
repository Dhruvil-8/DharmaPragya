'use client';

import React, { useState, useEffect } from 'react';
import { DailyShloka } from '../types';
import { getTodayShloka } from '../lib/dailyShlokas';
import { Flame, Play, Pause, Compass, Share2, Quote, BookOpen } from 'lucide-react';

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

  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-3xl border border-cream-400 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden mb-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-cream-300/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-saffron-100 text-saffron-600">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-saffron-600 uppercase font-sans">
              Daily Contemplation
            </span>
            <h2 className="text-sm font-bold font-cinzel text-saffron-800">
              {shloka.theme}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cream-300 text-saffron-700 border border-cream-400">
            {shloka.source_name} &bull; Ch. {shloka.chapter_number}, V. {shloka.verse_number}
          </span>

          {shloka.audio_path && (
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isPlaying
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white'
                  : 'bg-cream-300 hover:bg-saffron-100 text-saffron-700 border border-cream-400'
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
          )}
        </div>
      </div>

      {/* Centerpiece: Devanagari Sanskrit Text with Tiro Devanagari Calligraphy */}
      <div className="text-center py-2 space-y-3">
        <p className="font-sanskrit text-2xl md:text-3xl font-bold text-stone-800 leading-relaxed whitespace-pre-wrap">
          {shloka.sanskrit_text}
        </p>

        {shloka.transliteration && (
          <p className="font-serif italic text-xs md:text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
            {shloka.transliteration}
          </p>
        )}
      </div>

      {/* Translation & Reflection */}
      <div className="mt-5 pt-4 border-t border-cream-300/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-saffron-700">
            <Quote className="w-3 h-3" />
            <span>Translation</span>
          </div>

          <div className="flex bg-cream-300 p-0.5 rounded-lg border border-cream-400 text-[10px]">
            <button
              onClick={() => setActiveLang('english')}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                activeLang === 'english'
                  ? 'bg-saffron-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-saffron-700'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLang('hindi')}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                activeLang === 'hindi'
                  ? 'bg-saffron-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-saffron-700'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        <p className="font-serif italic text-sm md:text-base text-stone-700 leading-relaxed">
          &quot;{activeLang === 'english' ? shloka.translation_english : shloka.translation_hindi}&quot;
        </p>

        {/* Practical Modern Contemplation */}
        <div className="p-3.5 bg-saffron-50/70 rounded-xl border border-saffron-200/50">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-saffron-700 mb-1">
            <BookOpen className="w-3 h-3" />
            <span>Modern Living Reflection</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            {shloka.reflection}
          </p>
        </div>
      </div>

      {/* Bottom Action Triggers */}
      <div className="mt-5 pt-3 border-t border-cream-300/60 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleAskDharmaPragya}
          className="flex items-center gap-1.5 text-xs font-semibold text-saffron-700 hover:text-saffron-800 cursor-pointer group"
        >
          <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
          <span>Inquire Deeper with AI</span>
        </button>

        {onOpenShareModal && (
          <button
            onClick={() => onOpenShareModal(shloka)}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-saffron-600 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Daily Card</span>
          </button>
        )}
      </div>
    </div>
  );
}
