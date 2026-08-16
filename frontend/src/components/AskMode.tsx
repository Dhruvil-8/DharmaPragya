import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { AiResponse, VerseData } from '../types';
import VerseBlock from './VerseBlock';
import { Compass, AlertCircle, ArrowRight, HelpCircle, FileText, Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface AskModeProps {
  apiBaseUrl: string;
}

export default function AskMode({ apiBaseUrl }: AskModeProps) {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [language, setLanguage] = useState('english');
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [sourceVerseData, setSourceVerseData] = useState<VerseData[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesList, setVoicesList] = useState<SpeechSynthesisVoice[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(prev => (prev ? prev + ' ' : '') + transcript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    
    // Match SpeechSynthesis voice by selected language code prefix
    const langPrefixes: Record<string, string> = {
      english: 'en',
      hindi: 'hi',
      gujarati: 'gu',
      marathi: 'mr',
      tamil: 'ta',
      telugu: 'te',
      bengali: 'bn',
      kannada: 'kn',
    };
    const prefix = langPrefixes[language] || 'en';

    // Choose a high-quality, natural-sounding voice if available
    const preferredVoice = 
      availableVoices.find(v => v.lang.startsWith(prefix) && v.name.includes('Natural')) ||
      availableVoices.find(v => v.lang.startsWith(prefix) && v.name.includes('Google')) ||
      availableVoices.find(v => v.lang.startsWith(prefix)) ||
      // Fallback to English if target language voice is not available in browser
      availableVoices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
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
        body: JSON.stringify({ question: query, source_filter: sourceFilter, language: language }),
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
    <div className="space-y-5">
      {/* Query Card */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-cream-400/60 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-saffron-900 font-bold font-cinzel text-sm">
              <Compass className="w-4 h-4 text-saffron-600" />
              <span>Ask the Sacred Scriptures</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] text-stone-600 font-bold uppercase tracking-wider">Source:</label>
                <select 
                  value={sourceFilter} 
                  onChange={e => setSourceFilter(e.target.value)} 
                  className="p-1.5 text-xs bg-cream-200 hover:bg-cream-300 border border-cream-400/60 rounded-lg text-stone-900 font-semibold focus:outline-none focus:ring-1 focus:ring-saffron-500 transition-all cursor-pointer"
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

              <div className="flex items-center gap-1.5">
                <label className="text-[10px] text-stone-600 font-bold uppercase tracking-wider">Language:</label>
                <select 
                  value={language} 
                  onChange={e => {
                    setLanguage(e.target.value);
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }} 
                  className="p-1.5 text-xs bg-cream-200 hover:bg-cream-300 border border-cream-400/60 rounded-lg text-stone-900 font-semibold focus:outline-none focus:ring-1 focus:ring-saffron-500 transition-all cursor-pointer"
                >
                  <option value="english">English</option>
                  <option value="hindi">हिन्दी (Hindi)</option>
                  <option value="gujarati">ગુજરાતી (Gujarati)</option>
                  <option value="marathi">मराठी (Marathi)</option>
                  <option value="tamil">தமிழ் (Tamil)</option>
                  <option value="telugu">తెలుగు (Telugu)</option>
                  <option value="bengali">বাংলা (Bengali)</option>
                  <option value="kannada">ಕನ್ನಡ (Kannada)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="relative">
            <textarea 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="e.g., How does one achieve peace of mind amidst chaos and duty?" 
              className="w-full p-4 pr-12 border border-cream-400/60 hover:border-cream-500 bg-cream-50 rounded-xl text-stone-900 placeholder-stone-400 font-medium focus:outline-none focus:ring-2 focus:ring-saffron-400/20 focus:border-saffron-500 focus:bg-white transition-all text-sm leading-relaxed" 
              rows={2} 
            />
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`absolute right-3.5 bottom-3.5 p-2 rounded-xl transition-all duration-300 cursor-pointer ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-sm' 
                  : 'text-stone-500 hover:text-saffron-700 hover:bg-cream-200'
              }`}
              title={isListening ? "Listening... click to stop" : "Speak query via microphone"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isAiLoading || !query.trim()} 
            className="w-full mt-3 py-2.5 px-6 glow-btn cursor-pointer bg-gradient-to-r from-saffron-600 via-saffron-500 to-terracotta-600 hover:from-saffron-500 hover:to-terracotta-500 text-white font-bold text-[13px] font-cinzel tracking-wider uppercase rounded-xl shadow-md disabled:from-stone-300 disabled:to-stone-400 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isAiLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Sacred Wisdom...</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                <span>Seek Scriptural Wisdom</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Curated Philosophical Inquiries (Starter Themes) */}
        {!aiResponse && !isAiLoading && (
          <div className="mt-6 pt-5 border-t border-cream-300 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-saffron-800 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-saffron-600" />
              <span>Try these questions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  theme: 'Duty & Action',
                  text: 'How to perform duty selflessly without being consumed by results?',
                  source: 'Bhagavad Gita',
                },
                {
                  theme: 'Mind Mastery',
                  text: 'How does one quiet a restless and turbulent mind?',
                  source: 'Patanjali Yoga Sutras',
                },
                {
                  theme: 'Inner Resilience',
                  text: 'How to maintain equanimity during severe grief and adversity?',
                  source: 'Bhagavad Gita',
                },
                {
                  theme: 'True Consciousness',
                  text: 'What is the distinction between the witness self (Sakshi) and the ego?',
                  source: 'Upanishad',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(item.text);
                    setSourceFilter(item.source);
                  }}
                  className="p-3 bg-cream-100 hover:bg-saffron-50 border border-cream-400/50 hover:border-saffron-300 rounded-xl text-left cursor-pointer transition-all duration-200 group card-lift flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-saffron-700">
                      {item.theme}
                    </span>
                    <span className="text-[9px] font-semibold text-stone-500">
                      {item.source}
                    </span>
                  </div>
                  <p className="text-xs text-stone-800 font-serif font-medium group-hover:text-saffron-900 transition-colors leading-relaxed">
                    &quot;{item.text}&quot;
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
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
        <div className="bg-white p-5 md:p-7 rounded-2xl shadow-sm border border-cream-400/60 border-t-2 border-t-saffron-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <FileText className="w-40 h-40 text-stone-900" />
          </div>

          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-300/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-saffron-100 text-saffron-700 rounded-lg">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold font-cinzel text-saffron-950">Synthesized Wisdom</h2>
            </div>
            
            {language === 'english' && (
              <button
                type="button"
                onClick={speakAnswer}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs ${
                  isSpeaking 
                    ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white' 
                    : 'bg-cream-300 hover:bg-saffron-100 border border-cream-400 text-saffron-900'
                }`}
                title={isSpeaking ? "Stop reading" : "Read answer aloud"}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Stop Voice' : 'Listen Answer'}</span>
              </button>
            )}
          </div>

          <div className="text-base leading-relaxed text-stone-950 font-serif">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-saffron-950 font-cinzel" {...props} />,
                h2: ({ ...props }) => <h2 className="text-xl font-semibold mt-5 mb-2 text-saffron-900 font-cinzel" {...props} />,
                h3: ({ ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-saffron-900 font-cinzel" {...props} />,
                p: ({ ...props }) => <p className="mb-4 text-stone-900 leading-relaxed font-normal" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc pl-5 mb-4 text-stone-900 space-y-1.5 font-sans text-sm" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-4 text-stone-900 space-y-1.5 font-sans text-sm" {...props} />,
                li: ({ ...props }) => <li className="mb-1" {...props} />,
                strong: ({ ...props }) => <strong className="font-bold text-stone-950 font-sans text-sm" {...props} />,
                em: ({ ...props }) => <em className="italic text-stone-900 font-medium" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-4 border-saffron-500 pl-4 py-1.5 italic my-4 text-stone-900 font-medium bg-cream-200/60 rounded-r-lg" {...props} />
                ),
              }}
            >
              {aiResponse.answer}
            </ReactMarkdown>
          </div>

          {/* Interactive Citation Badges */}
          {aiResponse.citations && aiResponse.citations.length > 0 && (
            <div className="mt-6 pt-5 border-t border-cream-300/40">
              <h4 className="text-[11px] font-bold text-saffron-950 tracking-wider uppercase mb-3">Verified Canonical Citations</h4>
              <div className="flex flex-wrap gap-2">
                {aiResponse.citations.map((cit, idx) => {
                  const targetId = `source-verse-${idx}`;
                  return (
                    <button
                      key={idx}
                      onClick={() => scrollToVerse(targetId)}
                      className="px-3.5 py-1.5 text-xs bg-cream-300 hover:bg-saffron-100 border border-cream-400 hover:border-saffron-300 rounded-full text-saffron-900 font-bold cursor-pointer transition-all duration-300 flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="font-bold text-[10px] bg-saffron-600 text-white w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      {cit.source_name} — Ch. {cit.chapter_number}, Verse {cit.verse_number}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-cream-300/40 flex items-center gap-2 text-stone-600 text-xs italic font-medium">
            <HelpCircle className="w-4 h-4 shrink-0 text-saffron-600" />
            <span>Synthesized answers are drawn strictly from foundational canonical records.</span>
          </div>
        </div>
      )}

      {/* Relevant Sources Display */}
      {sourceVerseData.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-400 pb-2">
            <FileText className="w-5 h-5 text-saffron-600" />
            <h2 className="text-xl font-bold font-cinzel text-saffron-800">Verified Scripture Records</h2>
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
