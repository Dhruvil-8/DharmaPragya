import React, { useState, useRef } from 'react';
import { VerseData, Language } from '../types';

interface VerseBlockProps {
  verse: VerseData;
  index: number;
  totalVerses?: number;
  isAskMode?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  apiBaseUrl: string;
}

export default function VerseBlock({
  verse,
  index,
  totalVerses,
  isAskMode = false,
  onNext,
  onPrev,
  apiBaseUrl
}: VerseBlockProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioPath = `/api/audio/${verse.chapter_number}/${verse.verse_number}`;

  const playAudio = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioPath);
      } else if (audioRef.current.src !== audioPath) {
        audioRef.current.src = audioPath;
        audioRef.current.load();
      }
      
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.error("Audio playback failed:", e));

      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    } catch (e) {
      console.error('Audio play failed', e);
      setIsPlaying(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-orange-700">
            {verse.source_name} - {verse.chapter_name}, Verse {verse.verse_number}
          </h3>
          {!isAskMode && totalVerses && (
            <p className="text-sm text-gray-500">Verse {index + 1} of {totalVerses}</p>
          )}
        </div>
        {verse.source_name === 'Bhagavad Gita' && (
          <div className="flex items-center space-x-2">
            <button 
              onClick={isPlaying ? pauseAudio : playAudio} 
              className="px-3 py-1 rounded-md border bg-white text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2 border-b pb-4">
        {(['english', 'hindi', 'sanskrit'] as Language[]).map((lang) => (
          <button 
            key={lang} 
            onClick={() => setSelectedLanguage(lang)} 
            className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
              selectedLanguage === lang 
                ? 'bg-orange-600 text-white border-orange-600' 
                : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-100'
            }`}
          >
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-6">
        <div>
          <h4 className="font-semibold text-gray-600">Sanskrit:</h4>
          <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap">{verse.sanskrit_text}</p>
        </div>
        {verse.transliteration && (
          <div>
            <h4 className="font-semibold text-gray-600">Transliteration:</h4>
            <p className="italic text-gray-500 whitespace-pre-wrap">{verse.transliteration}</p>
          </div>
        )}
        <div>
          <h4 className="font-semibold text-gray-600 mb-2">Translations ({selectedLanguage}):</h4>
          {verse.translations?.filter(t => t.language?.toLowerCase() === selectedLanguage).map((t, i) => (
            <div key={i} className="p-3 bg-orange-50 border border-orange-100 rounded-md mb-2">
              <p className="font-medium text-sm text-orange-900">{t.author}:</p>
              <p className="italic">&quot;{t.text}&quot;</p>
            </div>
          ))}
          {(!verse.translations || verse.translations.filter(t => t.language?.toLowerCase() === selectedLanguage).length === 0) && (
            <p className="text-gray-400 italic">No translation available in {selectedLanguage}.</p>
          )}
        </div>
        {verse.commentaries && verse.commentaries.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-600 mb-2">Commentaries ({selectedLanguage}):</h4>
            {verse.commentaries.filter(c => c.language?.toLowerCase() === selectedLanguage).map((c, i) => (
              <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-md mb-2">
                <p className="font-medium text-sm text-gray-800">{c.author}:</p>
                <p className="text-gray-700 whitespace-pre-wrap">&quot;{c.text}&quot;</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAskMode && onNext && onPrev && (
        <div className="mt-6 flex justify-between items-center">
          <div>
            <button onClick={onPrev} disabled={index === 0} className="px-4 py-2 rounded-md border bg-white disabled:opacity-50">
              Previous
            </button>
            <button onClick={onNext} disabled={index === (totalVerses || 0) - 1} className="ml-2 px-4 py-2 rounded-md border bg-white disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
