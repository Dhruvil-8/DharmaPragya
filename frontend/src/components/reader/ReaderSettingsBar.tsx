'use client';

import React from 'react';
import { Layers, Type, Volume2, VolumeX } from 'lucide-react';
import { SanskritFontSize } from '../VerseBlock';

export interface GlobalLayersState {
  showTransliteration: boolean;
  showWordMeanings: boolean;
  showTranslation: boolean;
  showCommentaries: boolean;
  showSvara: boolean;
  showIAST: boolean;
  showPadapatha: boolean;
  showAnvaya: boolean;
  showBhavartha: boolean;
  showBhashyas: boolean;
}

interface ReaderSettingsBarProps {
  globalLayers: GlobalLayersState;
  onToggleGlobalLayer: (layerKey: string) => void;
  isVeda: boolean;
  availableTextLanguages: string[];
  effectiveLanguage: string;
  onSelectLanguage: (lang: string) => void;
  fontSize: SanskritFontSize;
  onChangeFontSize: (size: SanskritFontSize) => void;
  autoPlayChant: boolean;
  onToggleAutoPlay: () => void;
}

export default function ReaderSettingsBar({
  globalLayers,
  onToggleGlobalLayer,
  isVeda,
  availableTextLanguages,
  effectiveLanguage,
  onSelectLanguage,
  fontSize,
  onChangeFontSize,
  autoPlayChant,
  onToggleAutoPlay,
}: ReaderSettingsBarProps) {
  return (
    <div className="bg-white dark:bg-[#0d121d] p-3.5 rounded-2xl border border-cream-400 dark:border-amber-500/20 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
      {/* Left: Global Layer Toggles */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-800 dark:text-amber-400 flex items-center gap-1 mr-1">
          <Layers className="w-3.5 h-3.5" />
          <span>View Settings:</span>
        </span>

        {/* Transliteration (IAST) */}
        <button
          type="button"
          onClick={() => onToggleGlobalLayer('transliteration')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
            globalLayers.showTransliteration
              ? 'bg-saffron-600 dark:bg-amber-500 text-white border-saffron-600 dark:border-amber-400 shadow-2xs'
              : 'bg-cream-100 dark:bg-slate-900 border-cream-300 dark:border-slate-800 text-stone-500 dark:text-slate-400 opacity-60'
          }`}
        >
          <span>🔤 Transliteration</span>
        </button>

        {/* Padapatha / Anvaya / Word Meanings */}
        <button
          type="button"
          onClick={() => onToggleGlobalLayer('wordMeanings')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
            globalLayers.showWordMeanings
              ? 'bg-saffron-600 dark:bg-amber-500 text-white border-saffron-600 dark:border-amber-400 shadow-2xs'
              : 'bg-cream-100 dark:bg-slate-900 border-cream-300 dark:border-slate-800 text-stone-500 dark:text-slate-400 opacity-60'
          }`}
        >
          <span>📖 {isVeda ? 'पदपाठः / पदार्थः' : 'Word-by-Word Anvaya'}</span>
        </button>

        {/* Translations (For Scriptures & Vedas) */}
        <button
          type="button"
          onClick={() => onToggleGlobalLayer('translation')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
            globalLayers.showTranslation
              ? 'bg-saffron-600 dark:bg-amber-500 text-white border-saffron-600 dark:border-amber-400 shadow-2xs'
              : 'bg-cream-100 dark:bg-slate-900 border-cream-300 dark:border-slate-800 text-stone-500 dark:text-slate-400 opacity-60'
          }`}
        >
          <span>🌐 Translation</span>
        </button>

        {/* Commentaries / Bhashyas */}
        <button
          type="button"
          onClick={() => onToggleGlobalLayer('commentaries')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
            globalLayers.showCommentaries
              ? 'bg-saffron-600 dark:bg-amber-500 text-white border-saffron-600 dark:border-amber-400 shadow-2xs'
              : 'bg-cream-100 dark:bg-slate-900 border-cream-300 dark:border-slate-800 text-stone-500 dark:text-slate-400 opacity-60'
          }`}
        >
          <span>💬 {isVeda ? 'Vedic Bhashyas' : 'Commentaries'}</span>
        </button>

        {/* Svara Toggle for Vedas */}
        {isVeda && (
          <button
            type="button"
            onClick={() => onToggleGlobalLayer('svara')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
              globalLayers.showSvara
                ? 'bg-saffron-600 dark:bg-amber-500 text-white border-saffron-600 dark:border-amber-400 shadow-2xs'
                : 'bg-cream-100 dark:bg-slate-900 border-cream-300 dark:border-slate-800 text-stone-500 dark:text-slate-400 opacity-60'
            }`}
          >
            <span>🕉️ Svara Accents</span>
          </button>
        )}
      </div>

      {/* Right: Global Language, Font Sizing, and Audio Chanting Controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Dynamic Language Selector */}
        {availableTextLanguages.length > 1 && (
          <div className="flex items-center gap-1 bg-cream-100 dark:bg-slate-800 p-0.5 rounded-xl border border-cream-300 dark:border-amber-500/20">
            {availableTextLanguages.includes('english') && (
              <button
                type="button"
                onClick={() => onSelectLanguage('english')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                  effectiveLanguage === 'english'
                    ? 'bg-saffron-600 dark:bg-amber-500 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-slate-400 hover:text-saffron-800 dark:hover:text-slate-200'
                }`}
                title="Switch translation to English"
              >
                EN
              </button>
            )}
            {availableTextLanguages.includes('hindi') && (
              <button
                type="button"
                onClick={() => onSelectLanguage('hindi')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                  effectiveLanguage === 'hindi'
                    ? 'bg-saffron-600 dark:bg-amber-500 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-slate-400 hover:text-saffron-800 dark:hover:text-slate-200'
                }`}
                title="Switch translation to Hindi"
              >
                HI
              </button>
            )}
          </div>
        )}

        {/* Sanskrit Font Size Switcher */}
        <div className="flex items-center gap-1 bg-cream-100 dark:bg-slate-800 p-0.5 rounded-xl border border-cream-300 dark:border-amber-500/20">
          <Type className="w-3 h-3 text-stone-400 dark:text-slate-500 ml-1.5" />
          {(['sm', 'md', 'lg', 'xl'] as SanskritFontSize[]).map(size => (
            <button
              key={size}
              type="button"
              onClick={() => onChangeFontSize(size)}
              className={`w-6 h-6 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center ${
                fontSize === size
                  ? 'bg-saffron-600 dark:bg-amber-500 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-slate-400 hover:text-saffron-800 dark:hover:text-slate-200'
              }`}
              title={`Set Sanskrit Font Size to ${size.toUpperCase()}`}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Global Auto-Play Chanting Toggle */}
        <button
          type="button"
          onClick={onToggleAutoPlay}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            autoPlayChant
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300'
              : 'bg-cream-100 dark:bg-slate-800 border-cream-300 dark:border-slate-700 text-stone-400 dark:text-slate-500 opacity-60'
          }`}
          title={autoPlayChant ? 'Continuous Audio Chanting is ON' : 'Audio Chanting is paused'}
        >
          {autoPlayChant ? <Volume2 className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline text-[11px] font-medium">Chant</span>
        </button>
      </div>
    </div>
  );
}
