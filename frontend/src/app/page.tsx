'use client';

import { useState } from 'react';
import Header from '../components/Header';
import AskMode from '../components/AskMode';
import ReadMode from '../components/ReadMode';
import { Sparkles, BookOpen } from 'lucide-react';

const API_BASE_URL = '';

export default function HomePage() {
  const [mode, setMode] = useState<'ask' | 'read'>('ask');

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 text-gray-800 relative overflow-x-hidden selection:bg-saffron-200 selection:text-saffron-700">
      {/* Decorative background sun glow */}
      <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[600px] h-[600px] bg-gradient-to-b from-saffron-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl z-10 flex flex-col flex-grow">
        <Header />

        {/* Tab Segmented Control */}
        <div className="w-full max-w-md mx-auto mb-8 bg-cream-400/50 backdrop-blur-md p-1.5 rounded-full border border-cream-500/20 flex shadow-sm">
          <button
            onClick={() => setMode('ask')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
              mode === 'ask'
                ? 'bg-gradient-to-r from-saffron-500 to-terracotta-500 text-white shadow-md'
                : 'text-saffron-700 hover:text-saffron-600 hover:bg-cream-300/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Ask AI
          </button>
          <button
            onClick={() => setMode('read')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
              mode === 'read'
                ? 'bg-gradient-to-r from-saffron-500 to-terracotta-500 text-white shadow-md'
                : 'text-saffron-700 hover:text-saffron-600 hover:bg-cream-300/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Reading Mode
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-grow transition-all duration-300">
          <div className={mode === 'ask' ? 'animate-fade-in' : 'hidden'}>
            <AskMode apiBaseUrl={API_BASE_URL} />
          </div>
          <div className={mode === 'read' ? 'animate-fade-in' : 'hidden'}>
            <ReadMode apiBaseUrl={API_BASE_URL} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-cream-500/20 text-center text-xs text-saffron-700/60 font-medium">
          <p className="font-cinzel tracking-wider uppercase mb-1">DharmaPragya</p>
          <p>Synthesizing ancient scriptural wisdom with modern intelligence. Made with devotion.</p>
        </footer>
      </div>
    </main>
  );
}
