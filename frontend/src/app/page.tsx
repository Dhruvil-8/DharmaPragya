'use client';

import { useState } from 'react';
import Header from '../components/Header';
import AskMode from '../components/AskMode';
import ReadMode from '../components/ReadMode';

const API_BASE_URL = '';

export default function HomePage() {
  const [mode, setMode] = useState<'ask' | 'read'>('ask');

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-orange-50 text-gray-800">
      <div className="w-full max-w-4xl">
        <Header />

        <div className="flex justify-center space-x-4 mb-6">
          <button 
            onClick={() => setMode('ask')} 
            className={`px-4 py-2 rounded-md font-medium ${
              mode === 'ask' 
                ? 'bg-orange-600 text-white' 
                : 'bg-white border border-orange-200 text-orange-600 hover:bg-orange-50'
            }`}
          >
            Ask AI
          </button>
          <button 
            onClick={() => setMode('read')} 
            className={`px-4 py-2 rounded-md font-medium ${
              mode === 'read' 
                ? 'bg-orange-600 text-white' 
                : 'bg-white border border-orange-200 text-orange-600 hover:bg-orange-50'
            }`}
          >
            Reading Mode
          </button>
        </div>

        <div className={mode === 'ask' ? '' : 'hidden'}>
          <AskMode apiBaseUrl={API_BASE_URL} />
        </div>
        <div className={mode === 'read' ? '' : 'hidden'}>
          <ReadMode apiBaseUrl={API_BASE_URL} />
        </div>
        
      </div>
    </main>
  );
}
