import React, { useState } from 'react';
import { AiResponse, VerseData } from '../types';
import VerseBlock from './VerseBlock';

interface AskModeProps {
  apiBaseUrl: string;
}

export default function AskMode({ apiBaseUrl }: AskModeProps) {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [sourceVerseData, setSourceVerseData] = useState<VerseData[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setAiResponse(null);
    setSourceVerseData([]);
    setIsAiLoading(true);

    try {
      const askResponse = await fetch(`${apiBaseUrl}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, source_filter: sourceFilter }),
      });

      if (!askResponse.ok) throw new Error('Failed to get a response from the AI.');

      const askData: AiResponse = await askResponse.json();
      setAiResponse(askData);
      setIsAiLoading(false);

      if (askData.citations?.length) {
        setIsSourceLoading(true);

        const versePromises = askData.citations.map((s) =>
          fetch(`${apiBaseUrl}/api/read?source=${encodeURIComponent(s.source)}&chapter=${s.chapter}&verse=${s.verse}`).then((res) => {
            if (!res.ok) throw new Error(`Failed to retrieve verse`);
            return res.json();
          })
        );

        const versesData: VerseData[] = await Promise.all(versePromises);
        setSourceVerseData(versesData.filter(v => v !== null));
        setIsSourceLoading(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred.');
      setIsAiLoading(false);
      setIsSourceLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="mr-2 text-gray-700 font-medium">Source Filter:</label>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="p-2 border rounded border-gray-300">
            <option value="All">All Sources</option>
            <option value="Bhagavad Gita">Bhagavad Gita</option>
            <option value="Rigveda">Rigveda</option>
            <option value="Mahabharata">Mahabharata</option>
            <option value="Valmiki Ramayana">Valmiki Ramayana</option>
            <option value="Atharva Veda">Atharva Veda</option>
            <option value="Yajur Veda">Yajur Veda</option>
            <option value="Patanjali Yoga Sutras">Patanjali Yoga Sutras</option>
            <option value="Upanishad">Upanishads</option>
          </select>
        </div>
        <textarea 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="What is the nature of duty?" 
          className="w-full p-3 border border-orange-200 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" 
          rows={3} 
        />
        <button 
          type="submit" 
          disabled={isAiLoading || isSourceLoading} 
          className="w-full mt-2 p-3 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isAiLoading ? 'Synthesizing Wisdom...' : 'Seek Wisdom'}
        </button>
      </form>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">{error}</div>}
      
      {aiResponse && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <h2 className="text-2xl font-semibold mb-3 text-orange-700">Synthesized Answer</h2>
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{aiResponse.answer}</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 italic">
              AI-generated answers can make mistakes. Please verify important philosophical interpretations with original texts or a guru.
            </p>
          </div>
        </div>
      )}
      
      {isSourceLoading && <p className="text-center mt-4">Loading source details...</p>}

      {sourceVerseData.length > 0 && (
        <div className="mt-6 space-y-6">
          <h2 className="text-2xl font-semibold text-orange-700 mb-4">Relevant Sources</h2>
          {sourceVerseData.map((verse, idx) => (
            <VerseBlock 
              key={`${verse.source_name}-${verse.id}-${idx}`} 
              verse={verse} 
              index={idx} 
              isAskMode={true} 
              apiBaseUrl={apiBaseUrl} 
            />
          ))}
        </div>
      )}
    </>
  );
}
