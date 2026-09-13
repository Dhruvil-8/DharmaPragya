'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, X, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { DictionaryEntry } from '../types';

interface DictionaryModalProps {
  isOpen: boolean;
  word: string;
  onClose: () => void;
  apiBaseUrl?: string;
}

export default function DictionaryModal({
  isOpen,
  word,
  onClose,
  apiBaseUrl = '',
}: DictionaryModalProps) {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Clean word: strip non-Devanagari punctuation, dandas, hyphens
  const cleanWord = word.replace(/[^\u0900-\u097F]/g, '').trim();

  useEffect(() => {
    if (!isOpen || !cleanWord) {
      setEntries([]);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchDefinition = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/dictionary/lookup?word=${encodeURIComponent(cleanWord)}`);
        if (!res.ok) {
          throw new Error(`Lookup failed with status ${res.status}`);
        }
        const data: DictionaryEntry[] = await res.json();
        if (isMounted) {
          setEntries(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch dictionary definition');
          setLoading(false);
        }
      }
    };

    fetchDefinition();

    return () => {
      isMounted = false;
    };
  }, [isOpen, cleanWord, apiBaseUrl]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-stone-900/95 dark:bg-[#0c0f17]/95 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-500/80 uppercase tracking-widest font-cinzel">
                Authentic Sanskrit Lexicon
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-sanskrit text-amber-100 flex items-center gap-2">
                <span>{cleanWord || word}</span>
                {cleanWord !== word && (
                  <span className="text-xs font-mono text-stone-400 font-normal">({word})</span>
                )}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-amber-200 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-sm font-cinzel text-amber-300/80">
                Consulting V. S. Apte (1890) & Monier-Williams (1899)...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="text-amber-400/60 font-serif italic text-base">
                No direct entry found for &ldquo;{cleanWord}&rdquo;
              </div>
              <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
                In classical Sanskrit scriptures, words in verses are frequently inflected compounds (<i>samāsa</i>) or declined case endings (<i>vibhakti</i>). Try looking up the base grammatical root or stem.
              </p>
            </div>
          ) : (
            entries.map((entry, idx) => {
              const isApte = entry.source.includes('Apte');
              return (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-stone-800/60 dark:bg-stone-900/60 border border-stone-700/50 hover:border-amber-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold font-sanskrit text-lg text-amber-200">
                      {entry.headword}
                    </div>
                    <span 
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        isApte 
                          ? 'bg-saffron-950/50 border-saffron-500/40 text-saffron-300' 
                          : 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      {entry.source}
                    </span>
                  </div>
                  <div className="text-sm text-stone-300 font-sans leading-relaxed whitespace-pre-wrap">
                    {entry.definition}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-amber-500/10 bg-black/40 flex flex-wrap items-center justify-between text-[10px] text-stone-400 gap-2">
          <span>Sources: V. S. Apte (1890) & M. Monier-Williams (1899)</span>
          <span className="font-mono text-amber-400/70">Cologne Digital Sanskrit Lexicon (CC-BY-SA 4.0)</span>
        </div>
      </div>
    </div>
  );
}
