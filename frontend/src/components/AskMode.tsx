import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ConversationalMessage, ChatHistoryMessage, VerseData } from '../types';
import VerseBlock from './VerseBlock';
import { Compass, AlertCircle, ArrowRight, HelpCircle, FileText, Mic, MicOff, Volume2, VolumeX, Sparkles, RefreshCw, User, Bot, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface AskModeProps {
  apiBaseUrl: string;
}

export default function AskMode({ apiBaseUrl }: AskModeProps) {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [language, setLanguage] = useState('english');
  const [messages, setMessages] = useState<ConversationalMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voicesList, setVoicesList] = useState<SpeechSynthesisVoice[]>([]);
  const [expandedVerseMap, setExpandedVerseMap] = useState<Record<string, boolean>>({});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

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
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
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
    recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-US';

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

  const speakAnswer = (messageId: string, answerText: string) => {
    if (!answerText) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown formatting and citations for clean narration
    const cleanText = answerText
      .replace(/\[\^?\d+\]/g, '')
      .replace(/[\#\*\_`~\-]/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      setSpeakingMessageId(null);
    };

    const availableVoices = voicesList.length > 0 ? voicesList : (typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : []);
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

    const preferredVoice =
      availableVoices.find(v => v.lang.startsWith(prefix) && v.name.includes('Natural')) ||
      availableVoices.find(v => v.lang.startsWith(prefix) && v.name.includes('Google')) ||
      availableVoices.find(v => v.lang.startsWith(prefix)) ||
      availableVoices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
      availableVoices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.92;
    utterance.pitch = 1.02;

    window.speechSynthesis.speak(utterance);
  };

  const handleClearThread = () => {
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setMessages([]);
    setError(null);
    setExpandedVerseMap({});
  };

  const toggleVerseSection = (msgIdx: number) => {
    setExpandedVerseMap(prev => ({
      ...prev,
      [msgIdx]: !prev[msgIdx]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentQuery = query.trim();
    if (!currentQuery || isAiLoading) return;

    setError(null);
    setQuery('');

    // Stop active speech
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    const userMessage: ConversationalMessage = {
      id: userMessageId,
      role: 'user',
      content: currentQuery,
      timestamp: Date.now(),
    };

    const initialAssistantMessage: ConversationalMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      citations: [],
      statusMessage: 'Routing canonical scriptures...',
      isStreaming: true,
      timestamp: Date.now(),
    };

    // Prepare history for backend multi-turn
    const historyPayload: ChatHistoryMessage[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    setMessages(prev => [...prev, userMessage, initialAssistantMessage]);
    setIsAiLoading(true);

    // Scroll to new user message smoothly
    setTimeout(() => {
      scrollToBottom();
    }, 50);

    try {
      const response = await fetch(`${apiBaseUrl}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          question: currentQuery,
          source_filter: sourceFilter,
          language: language,
          history: historyPayload,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach scripture intelligence server.');
      }

      if (!response.body) {
        throw new Error('No streaming body received from server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedAnswer = '';
      let accumulatedCitations: VerseData[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;

          let eventType = 'message';
          let dataStr = '';

          const blockLines = block.split('\n');
          for (const line of blockLines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataStr = line.slice(6).trim();
            }
          }

          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);

              if (eventType === 'status') {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, statusMessage: parsed.message || parsed.status }
                      : msg
                  )
                );
              } else if (eventType === 'citations') {
                accumulatedCitations = parsed.citations || [];
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, citations: accumulatedCitations }
                      : msg
                  )
                );
              } else if (eventType === 'chunk') {
                accumulatedAnswer += parsed.text || '';
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedAnswer, statusMessage: undefined }
                      : msg
                  )
                );
              } else if (eventType === 'error') {
                throw new Error(parsed.error || 'AI Synthesis error');
              } else if (eventType === 'done') {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, isStreaming: false, statusMessage: undefined }
                      : msg
                  )
                );
              }
            } catch (err) {
              console.warn('SSE Chunk JSON parse warning:', err, dataStr);
            }
          }
        }
      }

      // Finalize streaming
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false, statusMessage: undefined }
            : msg
        )
      );
    } catch (err: unknown) {
      console.error('Ask streaming error:', err);
      const errMsg = err instanceof Error ? err.message : 'An error occurred while streaming response.';
      setError(errMsg);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                isStreaming: false,
                isError: true,
                content: msg.content || 'Unable to complete response. Please verify your connection or try again.',
                statusMessage: undefined,
              }
            : msg
        )
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const scrollToVerse = (id: string, msgIdx: number) => {
    setExpandedVerseMap(prev => ({ ...prev, [msgIdx]: true }));
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-saffron-500', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-saffron-500', 'ring-offset-2');
        }, 2000);
      }
    }, 100);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-36">
      {/* 1. Header Bar with Thread Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-cream-400/60 shadow-xs">
        <div className="flex items-center gap-2 text-saffron-900 font-bold font-cinzel text-sm">
          <Compass className="w-4 h-4 text-saffron-600" />
          <span>Vedic Scripture Dialogue</span>
          {messages.length > 0 && (
            <span className="text-[10px] bg-saffron-100 text-saffron-800 px-2 py-0.5 rounded-full font-bold">
              {Math.floor(messages.length / 2)} {Math.floor(messages.length / 2) === 1 ? 'Turn' : 'Turns'}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5 bg-cream-200 px-2.5 py-1 rounded-xl border border-cream-400/60 text-xs">
            <label className="text-[9px] text-stone-600 font-bold uppercase tracking-wider">Source:</label>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="bg-transparent text-stone-900 font-semibold focus:outline-none cursor-pointer text-xs"
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

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-cream-200 px-2.5 py-1 rounded-xl border border-cream-400/60 text-xs">
            <label className="text-[9px] text-stone-600 font-bold uppercase tracking-wider">Lang:</label>
            <select
              value={language}
              onChange={e => {
                setLanguage(e.target.value);
                window.speechSynthesis.cancel();
                setSpeakingMessageId(null);
              }}
              className="bg-transparent text-stone-900 font-semibold focus:outline-none cursor-pointer text-xs"
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

          {/* Clear Thread Button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearThread}
              className="flex items-center gap-1 px-3 py-1 bg-cream-200 hover:bg-cream-300 text-stone-700 hover:text-saffron-800 rounded-xl border border-cream-400/60 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Start a fresh conversation thread"
            >
              <RefreshCw className="w-3 h-3" />
              <span>New Inquiry</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Conversational Message Thread */}
      {messages.length > 0 ? (
        <div className="space-y-6">
          {messages.map((msg, msgIdx) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex justify-end items-start gap-2.5 pl-8 animate-fade-in">
                  <div className="bg-gradient-to-r from-saffron-700 to-terracotta-700 text-white px-5 py-3 rounded-2xl rounded-tr-xs shadow-sm max-w-xl">
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-saffron-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              );
            }

            const isVersesExpanded = expandedVerseMap[msgIdx] || false;

            // Assistant Synthesis Card
            return (
              <div key={msg.id} className="flex items-start gap-3 pr-2 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-saffron-100 text-saffron-800 border border-saffron-300 flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4.5 h-4.5" />
                </div>

                <div className="flex-1 bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-cream-400/70 border-t-2 border-t-saffron-500 relative overflow-hidden space-y-4">
                  <div className="flex items-center justify-between border-b border-cream-300/40 pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-cinzel font-bold text-base md:text-lg text-saffron-950">
                        Scriptural Synthesis
                      </h3>
                      {msg.isStreaming && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-saffron-700 bg-saffron-50 px-2 py-0.5 rounded-full animate-pulse border border-saffron-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-saffron-600 animate-ping" />
                          Synthesizing...
                        </span>
                      )}
                    </div>

                    {msg.content && !msg.isStreaming && (
                      <button
                        type="button"
                        onClick={() => speakAnswer(msg.id, msg.content)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs ${
                          speakingMessageId === msg.id
                            ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white'
                            : 'bg-cream-200 hover:bg-saffron-100 border border-cream-400 text-saffron-900'
                        }`}
                        title={speakingMessageId === msg.id ? 'Stop listening' : 'Listen aloud'}
                      >
                        {speakingMessageId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{speakingMessageId === msg.id ? 'Stop' : 'Listen'}</span>
                      </button>
                    )}
                  </div>

                  {/* Status indicator during pre-retrieval routing */}
                  {msg.statusMessage && (
                    <div className="flex items-center gap-2 py-2 px-3 bg-cream-100 rounded-xl border border-cream-300 text-xs font-semibold text-saffron-900 animate-pulse">
                      <div className="w-3 h-3 border-2 border-saffron-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>{msg.statusMessage}</span>
                    </div>
                  )}

                  {/* Rendered Synthesis Text */}
                  {msg.content ? (
                    <div className="text-sm md:text-base leading-relaxed text-stone-900 font-serif space-y-3">
                      <ReactMarkdown
                        components={{
                          h1: ({ ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-saffron-950 font-cinzel" {...props} />,
                          h2: ({ ...props }) => <h2 className="text-lg font-bold mt-3 mb-1.5 text-saffron-900 font-cinzel" {...props} />,
                          h3: ({ ...props }) => <h3 className="text-base font-semibold mt-2.5 mb-1 text-saffron-900 font-cinzel" {...props} />,
                          p: ({ ...props }) => <p className="mb-3 text-stone-900 leading-relaxed font-normal" {...props} />,
                          ul: ({ ...props }) => <ul className="list-disc pl-5 mb-3 text-stone-900 space-y-1 font-sans text-xs sm:text-sm" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-3 text-stone-900 space-y-1 font-sans text-xs sm:text-sm" {...props} />,
                          li: ({ ...props }) => <li className="mb-0.5" {...props} />,
                          strong: ({ ...props }) => <strong className="font-bold text-stone-950 font-sans text-xs sm:text-sm" {...props} />,
                          em: ({ ...props }) => <em className="italic text-stone-900 font-medium" {...props} />,
                          blockquote: ({ ...props }) => (
                            <blockquote className="border-l-4 border-saffron-500 pl-4 py-1.5 italic my-3 text-stone-900 font-medium bg-cream-200/60 rounded-r-lg" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : null}

                  {/* Interactive Verified Citation Badges */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-3 border-t border-cream-300/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-saffron-950 tracking-wider uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5 text-saffron-600" />
                          <span>Canonical Citations ({msg.citations.length})</span>
                        </div>

                        {!msg.isStreaming && (
                          <button
                            type="button"
                            onClick={() => toggleVerseSection(msgIdx)}
                            className="flex items-center gap-1 text-[11px] font-bold text-saffron-800 hover:text-saffron-950 cursor-pointer transition-colors"
                          >
                            <span>{isVersesExpanded ? 'Hide Scripture Verses' : 'View Scripture Verses'}</span>
                            {isVersesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cit, citIdx) => (
                          <button
                            key={citIdx}
                            onClick={() => scrollToVerse(`citation-card-${msgIdx}-${citIdx}`, msgIdx)}
                            className="px-3 py-1 text-xs bg-cream-200 hover:bg-saffron-100 border border-cream-400 hover:border-saffron-300 rounded-full text-saffron-900 font-bold cursor-pointer transition-all duration-200 flex items-center gap-1.5 shadow-2xs"
                          >
                            <span className="text-[9px] bg-saffron-600 text-white w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                              {citIdx + 1}
                            </span>
                            <span>{cit.source_name} — Ch. {cit.chapter_number}, Verse {cit.verse_number}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clean Scripture Reference Blocks (Commentaries Excluded) */}
                  {msg.citations && msg.citations.length > 0 && !msg.isStreaming && isVersesExpanded && (
                    <div className="pt-4 border-t border-cream-300/40 space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-saffron-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-saffron-900 font-cinzel">
                          Scripture Verse Records
                        </h4>
                      </div>
                      {msg.citations.map((verse, citIdx) => (
                        <div id={`citation-card-${msgIdx}-${citIdx}`} key={`${verse.source_name}-${verse.id}-${citIdx}`}>
                          <VerseBlock
                            verse={verse}
                            index={citIdx}
                            totalVerses={msg.citations?.length}
                            isAskMode={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        /* 3. Starter Inquiries View (When empty) */
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-400/60 shadow-sm space-y-6">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-saffron-500 to-terracotta-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-cinzel text-saffron-950">
              Seek the Eternal Wisdom
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-serif leading-relaxed">
              Ask deep questions on life, mind mastery, karma, duty, and spiritual consciousness. DharmaPragya synthesizes answers directly with verified verse citations.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-saffron-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
              <span>Recommended Philosophical Inquiries</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                  className="p-3.5 bg-cream-100 hover:bg-saffron-50 border border-cream-400/50 hover:border-saffron-300 rounded-2xl text-left cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
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
        </div>
      )}

      {/* 4. Global Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-start gap-3 shadow-xs animate-fade-in" role="alert">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold">Unable to Complete Inquiry</h4>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* 5. Fixed Bottom Ask Box Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-cream-100 via-cream-100/95 to-transparent pt-4 pb-4 px-4">
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-cream-400/80 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative flex items-center">
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={
                  messages.length > 0
                    ? "Ask a follow-up inquiry (e.g. 'Can you explain the 2nd verse in more detail?')..."
                    : "Ask the sacred scriptures (e.g. 'How does one attain mental peace amidst adversity?')..."
                }
                className="w-full p-3.5 pr-24 border border-cream-400/80 hover:border-cream-500 bg-cream-50 rounded-2xl text-stone-900 placeholder-stone-400 font-medium focus:outline-none focus:ring-2 focus:ring-saffron-400/20 focus:border-saffron-500 focus:bg-white transition-all text-xs sm:text-sm leading-relaxed resize-none min-h-[50px] max-h-28"
                rows={1}
              />

              <div className="absolute right-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-xl transition-all duration-300 cursor-pointer ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-xs'
                      : 'text-stone-500 hover:text-saffron-700 hover:bg-cream-200'
                  }`}
                  title={isListening ? "Listening... click to stop" : "Speak query via microphone"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  disabled={isAiLoading || !query.trim()}
                  className="p-2 rounded-xl bg-gradient-to-r from-saffron-600 to-terracotta-600 hover:from-saffron-500 hover:to-terracotta-500 text-white disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
                  title="Send inquiry"
                >
                  {isAiLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 text-[10px] text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-saffron-600" />
                <span>Press <kbd className="bg-cream-200 px-1 py-0.5 rounded text-[9px] font-mono">Enter</kbd> to ask &bull; <kbd className="bg-cream-200 px-1 py-0.5 rounded text-[9px] font-mono">Shift + Enter</kbd> for newline</span>
              </span>
              <span>Real-time Canonical Synthesis</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
