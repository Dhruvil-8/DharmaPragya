import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { AiResponse, VerseData } from '../types';
import VerseBlock from './VerseBlock';
import { Sparkles, Compass, AlertCircle, ArrowRight, HelpCircle, FileText, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface AskModeProps {
  apiBaseUrl: string;
}

export default function AskMode({ apiBaseUrl }: AskModeProps) {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [sourceVerseData, setSourceVerseData] = useState<VerseData[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesList, setVoicesList] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        setVoicesList(window.speechSynthesis.getVoices());
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(prev => (prev ? prev + ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakAnswer = () => {
    if (!aiResponse || !aiResponse.answer) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting and citations for clean narration
    const cleanText = aiResponse.answer
      .replace(/\[\^?\d+\]/g, '') // remove markdown/citation index links
      .replace(/[\#\*\_`~\-]/g, '') // remove formatting symbols
      .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      setIsSpeaking(false);
    };

    const availableVoices = voicesList.length > 0 ? voicesList : (typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : []);
    
    // Choose a high-quality, natural-sounding voice if available
    const preferredVoice = 
      availableVoices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) || // Edge natural voices
      availableVoices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||  // Chrome premium voices
      availableVoices.find(v => v.lang.startsWith('en') && v.name.includes('Samantha')) || // macOS native Samantha
      availableVoices.find(v => v.lang.startsWith('en') && v.name.includes('Microsoft')) || // Windows native voices
      availableVoices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Warm, friendly, and spiritual voice configurations
    utterance.rate = 0.92;   // Slightly slower pace (0.92) is much easier to follow
    utterance.pitch = 1.02;  // Slightly warmer pitch

    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setAiResponse(null);
    setSourceVerseData([]);
    setIsAiLoading(true);

    // Stop any active text to speech reading when seeking new wisdom
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

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
        setSourceVerseData(askData.citations);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred.');
      setIsAiLoading(false);
    }
  };

  const scrollToVerse = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add temporary highlight effect
      element.classList.add('ring-2', 'ring-saffron-500', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-saffron-500', 'ring-offset-2');
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Query Card */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-cream-400 shadow-sm hover:shadow-md transition-all duration-300">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-saffron-700 font-semibold">
              <Compass className="w-5 h-5" />
              <span>Ask the Scriptures</span>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <label className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Focus Source:</label>
              <select 
                value={sourceFilter} 
                onChange={e => setSourceFilter(e.target.value)} 
                className="p-2 text-xs bg-cream-200/50 hover:bg-cream-200 border border-cream-400/80 rounded-lg text-saffron-700 font-semibold focus:outline-none focus:ring-1 focus:ring-saffron-500 transition-all cursor-pointer"
              >
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
          </div>

          <div className="relative">
            <textarea 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="e.g., How does one achieve peace of mind amidst chaos?" 
              className="w-full p-4 pr-12 border border-cream-400/80 hover:border-cream-500/80 bg-white rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500/80 transition-all text-sm leading-relaxed" 
              rows={3} 
            />
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`absolute right-3.5 bottom-3.5 p-2 rounded-xl transition-all duration-300 cursor-pointer ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-sm' 
                  : 'text-stone-400 hover:text-saffron-600 hover:bg-cream-200/50'
              }`}
              title={isListening ? "Listening... click to stop" : "Speak query"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isAiLoading || !query.trim()} 
            className="w-full mt-3 py-3 px-6 glow-btn cursor-pointer bg-gradient-to-r from-saffron-500 to-terracotta-600 hover:from-saffron-600 hover:to-terracotta-700 text-white font-semibold rounded-xl shadow-md disabled:from-stone-300 disabled:to-stone-400 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isAiLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Wisdom...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Seek Wisdom</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50/50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm" role="alert">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Action Failed</h4>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Synthesized Answer Output */}
      {aiResponse && (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-cream-400 border-t-4 border-t-saffron-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <FileText className="w-40 h-40 text-stone-900" />
          </div>

          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-300/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-saffron-50 text-saffron-600 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold font-cinzel text-saffron-700">Synthesized Answer</h2>
            </div>
            
            <button
              type="button"
              onClick={speakAnswer}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm hover:shadow ${
                isSpeaking 
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white border-terracotta-600' 
                  : 'bg-cream-300 hover:bg-saffron-100 border border-cream-400 text-saffron-700 hover:text-saffron-800'
              }`}
              title={isSpeaking ? "Stop reading" : "Read answer aloud"}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Stop Voice' : 'Listen Answer'}</span>
            </button>
          </div>

          <div className="text-base leading-relaxed text-stone-800 font-serif">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-saffron-700 font-cinzel" {...props} />,
                h2: ({ ...props }) => <h2 className="text-xl font-semibold mt-5 mb-2 text-saffron-700 font-cinzel" {...props} />,
                h3: ({ ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-saffron-700 font-cinzel" {...props} />,
                p: ({ ...props }) => <p className="mb-4 text-stone-700 leading-relaxed" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc pl-5 mb-4 text-stone-700 space-y-1.5 font-sans text-sm" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-4 text-stone-700 space-y-1.5 font-sans text-sm" {...props} />,
                li: ({ ...props }) => <li className="mb-1" {...props} />,
                strong: ({ ...props }) => <strong className="font-semibold text-stone-900 font-sans text-sm" {...props} />,
                em: ({ ...props }) => <em className="italic text-stone-800" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-4 border-saffron-400 pl-4 py-1 italic my-4 text-stone-600 bg-cream-200/30 rounded-r-lg" {...props} />
                ),
              }}
            >
              {aiResponse.answer}
            </ReactMarkdown>
          </div>

          {/* Interactive Citation Badges */}
          {aiResponse.citations && aiResponse.citations.length > 0 && (
            <div className="mt-6 pt-5 border-t border-cream-300/40">
              <h4 className="text-xs font-bold text-saffron-700 tracking-wider uppercase mb-3">Verified References</h4>
              <div className="flex flex-wrap gap-2">
                {aiResponse.citations.map((cit, idx) => {
                  const targetId = `source-verse-${idx}`;
                  return (
                    <button
                      key={idx}
                      onClick={() => scrollToVerse(targetId)}
                      className="px-3.5 py-1.5 text-xs bg-cream-300/60 hover:bg-saffron-100 border border-cream-400/60 hover:border-saffron-300 rounded-full text-saffron-700 hover:text-saffron-800 font-medium cursor-pointer transition-all duration-300 flex items-center gap-1 shadow-sm hover:shadow"
                    >
                      <span className="font-bold text-[10px] bg-saffron-500 text-white w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      {cit.source_name} — Ch. {cit.chapter_number}, Verse {cit.verse_number}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-cream-300/40 flex items-center gap-2 text-stone-400 text-xs italic">
            <HelpCircle className="w-4 h-4 shrink-0 text-stone-400/80" />
            <span>Answers are generated by AI and citations are served directly from official datasets. Please verify translations with standard copies.</span>
          </div>
        </div>
      )}

      {/* Relevant Sources Display */}
      {sourceVerseData.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-400 pb-2">
            <FileText className="w-5 h-5 text-saffron-600" />
            <h2 className="text-xl font-bold font-cinzel text-saffron-700">Verified Verse Records</h2>
          </div>
          {sourceVerseData.map((verse, idx) => (
            <div id={`source-verse-${idx}`} key={`${verse.source_name}-${verse.id}-${idx}`} className="transition-all duration-500">
              <VerseBlock 
                verse={verse} 
                index={idx} 
                isAskMode={true} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
