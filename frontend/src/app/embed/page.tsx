'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { VerseData } from '../../types';
import { getTodayShloka } from '../../lib/dailyShlokas';
import { Play, Pause, ExternalLink, BookOpen } from 'lucide-react';

function EmbedContent() {
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [lang, setLang] = useState<'english' | 'hindi'>('english');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const source = params.get('source');
      const chapter = params.get('chapter');
      const verseNum = params.get('verse');

      if (source && chapter) {
        fetch(`/api/read?source=${encodeURIComponent(source)}&chapter=${chapter}`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              if (verseNum) {
                const found = data.find((v: VerseData) => v.verse_number === parseInt(verseNum, 10));
                setVerse(found || data[0]);
              } else {
                setVerse(data[0]);
              }
            }
          })
          .catch((err) => console.error('Embed fetch error:', err))
          .finally(() => setIsLoading(false));
      } else {
        // Default to Today's Daily Shloka if no params provided
        const today = getTodayShloka();
        setVerse({
          id: 0,
          section_id: 0,
          source_name: today.source_name,
          chapter_number: today.chapter_number,
          chapter_name: today.source_name,
          verse_number: today.verse_number,
          sanskrit_text: today.sanskrit_text,
          transliteration: today.transliteration,
          word_meanings: '',
          translations: [
            { author: 'Swami Sivananda', language: 'english', text: today.translation_english },
            { author: 'Swami Ramsukhdas', language: 'hindi', text: today.translation_hindi },
          ],
          commentaries: [],
        });
        setIsLoading(false);
      }
    }
  }, []);

  const toggleAudio = () => {
    if (!verse || verse.source_name !== 'Bhagavad Gita') return;
    const audioPath = `/api/audio/${verse.chapter_number}/${verse.verse_number}.mp3`;

    if (isPlaying && audioObj) {
      audioObj.pause();
      setIsPlaying(false);
    } else {
      const newAudio = audioObj || new Audio(audioPath);
      if (!audioObj) setAudioObj(newAudio);

      newAudio.play().then(() => setIsPlaying(true)).catch((e) => console.error('Audio error:', e));
      newAudio.onended = () => setIsPlaying(false);
    }
  };

  const activeTranslation = verse?.translations?.find(
    (t) => t.language?.toLowerCase() === lang
  )?.text || verse?.translations?.[0]?.text || '';

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[220px] flex items-center justify-center bg-[#fdfbf7] text-[#2d261e]">
        <div className="w-6 h-6 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="w-full h-full min-h-[220px] flex items-center justify-center text-xs text-stone-400 bg-[#fdfbf7]">
        Scripture shloka could not be loaded.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[240px] p-4 sm:p-5 flex flex-col justify-between select-text rounded-2xl border bg-[#fdfbf7] text-[#2d261e] border-cream-400">
      {/* Top Coordinate Badge & Controls */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-cream-300/60">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-saffron-600 bg-saffron-50 px-2 py-0.5 rounded border border-saffron-200/40">
            {verse.source_name}
          </span>
          <span className="text-[11px] font-bold font-cinzel text-stone-500">
            Ch. {verse.chapter_number}, Verse {verse.verse_number}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'english' ? 'hindi' : 'english')}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-cream-400 hover:text-saffron-600 cursor-pointer"
          >
            {lang === 'english' ? 'हिन्दी' : 'EN'}
          </button>

          {/* Audio Chanting Player */}
          {verse.source_name === 'Bhagavad Gita' && (
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                isPlaying
                  ? 'bg-terracotta-600 text-white'
                  : 'bg-cream-300 text-saffron-800 border border-cream-400'
              }`}
            >
              {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              <span>{isPlaying ? 'Pause' : 'Chant'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sanskrit Text Centerpiece */}
      <div className="py-3 text-center space-y-2">
        <p className="font-sanskrit text-lg sm:text-xl font-bold leading-relaxed whitespace-pre-wrap">
          {verse.sanskrit_text}
        </p>

        {verse.transliteration && (
          <p className="font-serif italic text-xs text-stone-500 leading-relaxed">
            {verse.transliteration}
          </p>
        )}

        <div className="pt-2 border-t border-dashed border-cream-300/60">
          <p className="font-serif italic text-xs sm:text-sm text-stone-700 leading-relaxed">
            &quot;{activeTranslation}&quot;
          </p>
        </div>
      </div>

      {/* Footer Powered-by Link */}
      <div className="pt-2 border-t border-cream-300/60 flex items-center justify-between text-[10px] text-stone-400">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-saffron-500" />
          <span>Vedic Scripture Widget</span>
        </span>

        <a
          href={`https://dharma-pragya.vercel.app/?mode=read&source=${encodeURIComponent(verse.source_name)}&chapter=${verse.chapter_number}&verse=${verse.verse_number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-bold text-saffron-700 hover:underline"
        >
          <span>Explore on DharmaPragya</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs">Loading embed...</div>}>
      <EmbedContent />
    </Suspense>
  );
}
