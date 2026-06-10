import React, { useState, useRef } from 'react';
import { VerseData, Language } from '../types';
import { Play, Pause, ChevronLeft, ChevronRight, Languages, BookOpen, Volume2 } from 'lucide-react';

interface VerseBlockProps {
  verse: VerseData;
  index: number;
  totalVerses?: number;
  isAskMode?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function VerseBlock({
  verse,
  index,
  totalVerses,
  isAskMode = false,
  onNext,
  onPrev
}: VerseBlockProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioPath = `/api/audio/${verse.chapter_number}/${verse.verse_number}.mp3`;

  const playAudio = () => {
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
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const hasTranslations = verse.translations && verse.translations.filter(t => t.language?.toLowerCase() === selectedLanguage).length > 0;
  const hasCommentaries = verse.commentaries && verse.commentaries.filter(c => c.language?.toLowerCase() === selectedLanguage).length > 0;

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-cream-400 hover:border-saffron-500/20 transition-all duration-300 relative overflow-hidden">
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

      {/* Language / Translation Tab Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-cream-300/40">
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
          <Languages className="w-4 h-4 text-stone-400" />
          <span>DISPLAY LANGUAGE</span>
        </div>

        <div className="flex gap-1.5 bg-cream-300/80 p-1 rounded-full border border-cream-400/50">
          {(['english', 'hindi'] as Language[]).map((lang) => (
            <button 
              key={lang} 
              onClick={() => setSelectedLanguage(lang)} 
              className={`px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all duration-300 ${
                selectedLanguage === lang 
                  ? 'bg-gradient-to-r from-saffron-500 to-terracotta-500 text-white shadow-sm' 
                  : 'text-saffron-700 hover:text-saffron-600 hover:bg-cream-300/40'
              }`}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Translations & Commentaries Display */}
      <div className="space-y-6">
        {/* Translations Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-700 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Translations ({selectedLanguage})</span>
          </div>

          {hasTranslations ? (
            <div className="grid gap-3">
              {verse.translations
                .filter(t => t.language?.toLowerCase() === selectedLanguage)
                .map((t, i) => (
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
              No translation available in {selectedLanguage} for this verse.
            </p>
          )}
        </div>

        {/* Commentaries Section */}
        {verse.commentaries && verse.commentaries.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-700 uppercase tracking-wider">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Commentaries ({selectedLanguage})</span>
            </div>

            {hasCommentaries ? (
              <div className="space-y-3">
                {verse.commentaries
                  .filter(c => c.language?.toLowerCase() === selectedLanguage)
                  .map((c, i) => (
                    <div key={i} className="p-5 bg-stone-50 border border-cream-400/60 rounded-xl hover:shadow-sm transition-all duration-200">
                      <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-stone-500 bg-stone-200/50 px-2 py-0.5 rounded border border-stone-300/30 mb-2">
                        {c.author}
                      </span>
                      <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap font-serif">&quot;{c.text}&quot;</p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-stone-400 italic text-xs p-4 bg-cream-200/20 rounded-xl border border-dashed border-cream-400/40 text-center">
                No commentary available in {selectedLanguage} for this verse.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Prev/Next Verse Navigation (Only in Reading Mode) */}
      {!isAskMode && onNext && onPrev && (
        <div className="mt-8 pt-5 border-t border-cream-300/40 flex justify-between items-center gap-4">
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
