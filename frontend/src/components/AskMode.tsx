import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { ConversationalMessage, ChatHistoryMessage, VerseData } from '../types';
import VerseBlock from './VerseBlock';
import { Compass, AlertCircle, ArrowRight, FileText, Mic, MicOff, Volume2, VolumeX, RefreshCw, User, Bot, CheckCircle2, ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface AskModeProps {
  apiBaseUrl: string;
  initialPrompt?: {
    query: string;
    sourceFilter?: string;
    timestamp: number;
  } | null;
}

const MAX_QUERIES_PER_SESSION = 10;

export default function AskMode({ apiBaseUrl, initialPrompt }: AskModeProps) {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [language, setLanguage] = useState('english');
  const [messages, setMessages] = useState<ConversationalMessage[]>([]);
  const [sessionQueryCount, setSessionQueryCount] = useState(0);
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
  const isUserAtBottomRef = useRef(true);
  const scrollThrottleRef = useRef<number | null>(null);
  const lastInitialPromptTimestamp = useRef<number>(0);

  const isLimitReached = sessionQueryCount >= MAX_QUERIES_PER_SESSION;
  const remainingQueries = Math.max(0, MAX_QUERIES_PER_SESSION - sessionQueryCount);

  // Track if user is scrolled near the bottom
  useEffect(() => {
    const handleScroll = () => {
      const threshold = 180;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold;
      isUserAtBottomRef.current = atBottom;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const smoothScrollToBottom = () => {
    if (scrollThrottleRef.current) return;
    scrollThrottleRef.current = window.setTimeout(() => {
      if (isUserAtBottomRef.current) {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth',
        });
      }
      scrollThrottleRef.current = null;
    }, 80);
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
      if (scrollThrottleRef.current) {
        clearTimeout(scrollThrottleRef.current);
      }
    };
  }, []);

  const startListening = () => {
    if (isLimitReached) return;
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

    const langMap: Record<string, string> = {
      english: 'en-IN',
      hindi: 'hi-IN',
      gujarati: 'gu-IN',
      marathi: 'mr-IN',
      tamil: 'ta-IN',
      telugu: 'te-IN',
      bengali: 'bn-IN',
      kannada: 'kn-IN',
    };
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Speech start error:", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const speakAnswer = (messageId: string, markdownText: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = markdownText
      .replace(/#+\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/>\s?/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    const langCodeMap: Record<string, string> = {
      english: 'en',
      hindi: 'hi',
      gujarati: 'gu',
      marathi: 'mr',
      tamil: 'ta',
      telugu: 'te',
      bengali: 'bn',
      kannada: 'kn',
    };

    const targetPrefix = langCodeMap[language] || 'en';
    const matchedVoice = voicesList.find(
      v => v.lang.toLowerCase().startsWith(targetPrefix) || v.lang.toLowerCase().includes(targetPrefix)
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.lang = matchedVoice ? matchedVoice.lang : (targetPrefix === 'hi' ? 'hi-IN' : 'en-IN');
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleVerseSection = (msgIdx: number) => {
    setExpandedVerseMap(prev => ({
      ...prev,
      [msgIdx]: !prev[msgIdx],
    }));
  };

  const handleClearThread = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setMessages([]);
    setSessionQueryCount(0);
    setQuery('');
    setError(null);
    setExpandedVerseMap({});
  };

  const executeInquiry = useCallback(async (inquiryText: string, currentSource: string) => {
    if (!inquiryText.trim() || isAiLoading || isLimitReached) return;

    const currentQuery = inquiryText.trim();
    setQuery('');
    setError(null);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    const userMsg: ConversationalMessage = {
      id: userMessageId,
      role: 'user',
      content: currentQuery,
      timestamp: Date.now(),
    };

    const placeholderAssistantMsg: ConversationalMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: Date.now(),
      statusMessage: 'Routing inquiry through sacred Vedic scriptures...',
    };

    setMessages(prev => [...prev, userMsg, placeholderAssistantMsg]);
    setSessionQueryCount(prev => prev + 1);
    setIsAiLoading(true);

    const historyPayload: ChatHistoryMessage[] = messages
      .filter(m => m.content && !m.isStreaming && !m.isError)
      .slice(-6)
      .map(m => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const response = await fetch(`${apiBaseUrl}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentQuery,
          source_filter: currentSource,
          language: language,
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
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
                smoothScrollToBottom();
              } else if (eventType === 'citations') {
                accumulatedCitations = parsed.citations || [];
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, citations: accumulatedCitations }
                      : msg
                  )
                );
                smoothScrollToBottom();
              } else if (eventType === 'chunk') {
                accumulatedAnswer += parsed.text || '';
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedAnswer, statusMessage: undefined }
                      : msg
                  )
                );
                smoothScrollToBottom();
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
                smoothScrollToBottom();
              }
            } catch (err) {
              console.warn('SSE Chunk JSON parse warning:', err, dataStr);
            }
          }
        }
      }

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
  }, [apiBaseUrl, isAiLoading, isLimitReached, language, messages]);

  // Handle Initial Prompt Triggers (e.g. from "Ask AI about this Verse")
  useEffect(() => {
    if (initialPrompt && initialPrompt.query && initialPrompt.timestamp !== lastInitialPromptTimestamp.current) {
      lastInitialPromptTimestamp.current = initialPrompt.timestamp;
      const targetSource = initialPrompt.sourceFilter || sourceFilter;
      if (initialPrompt.sourceFilter) {
        setSourceFilter(initialPrompt.sourceFilter);
      }
      executeInquiry(initialPrompt.query, targetSource);
    }
  }, [initialPrompt, executeInquiry, sourceFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isAiLoading || isLimitReached) return;
    executeInquiry(query, sourceFilter);
  };

  const scrollToVerse = (id: string, msgIdx: number) => {
    setExpandedVerseMap(prev => ({ ...prev, [msgIdx]: true }));
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-saffron-500', 'dark:ring-amber-400', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-saffron-500', 'dark:ring-amber-400', 'ring-offset-2');
        }, 2000);
      }
    }, 100);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-32">
      {/* 1. Header Bar with Thread & Session Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0d121d] p-3.5 sm:p-4 rounded-2xl border border-cream-400/60 dark:border-amber-500/20 shadow-xs transition-colors duration-300">
        <div className="flex items-center gap-2 text-saffron-900 dark:text-amber-300 font-bold font-cinzel text-sm">
          <Compass className="w-4 h-4 text-saffron-600 dark:text-amber-400" />
          <span>Vedic Scripture Dialogue</span>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
              isLimitReached
                ? 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/40'
                : remainingQueries <= 3
                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/40'
                : 'bg-saffron-100 dark:bg-amber-950/30 text-saffron-800 dark:text-amber-300 border-saffron-200 dark:border-amber-700/30'
            }`}
          >
            {isLimitReached ? 'Session Limit Reached (10/10)' : `${remainingQueries} / ${MAX_QUERIES_PER_SESSION} inquiries remaining`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5 bg-cream-200 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-cream-400/60 dark:border-amber-500/20 text-xs">
            <label className="text-[9px] text-stone-600 dark:text-slate-400 font-bold uppercase tracking-wider">Source:</label>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="bg-transparent text-stone-900 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="dark:bg-slate-900 font-bold">All Sources</option>
              
              <optgroup label="The Mahapuranas (पुराण)" className="dark:bg-slate-900 font-bold">
                <option value="Puranas" className="dark:bg-slate-900">All Puranas (महापुराण)</option>
                <option value="Shiva Purana" className="dark:bg-slate-900">Shiva Purana</option>
                <option value="Bhagavata Purana" className="dark:bg-slate-900">Bhagavata Purana (Srimad Bhagavatam)</option>
                <option value="Devi Bhagavata Purana" className="dark:bg-slate-900">Devi Bhagavata Purana</option>
                <option value="Garuda Purana" className="dark:bg-slate-900">Garuda Purana</option>
                <option value="Brahma Purana" className="dark:bg-slate-900">Brahma Purana</option>
                <option value="Harivamsha Purana" className="dark:bg-slate-900">Harivamsha Purana</option>
              </optgroup>

              <optgroup label="Foundational Epics & Smriti (इतिहास)" className="dark:bg-slate-900 font-bold">
                <option value="Bhagavad Gita" className="dark:bg-slate-900">Bhagavad Gita</option>
                <option value="Mahabharata" className="dark:bg-slate-900">Mahabharata</option>
                <option value="Valmiki Ramayana" className="dark:bg-slate-900">Valmiki Ramayana</option>
              </optgroup>

              <optgroup label="The Four Vedas (चतुर्वेद)" className="dark:bg-slate-900 font-bold">
                <option value="Vedas" className="dark:bg-slate-900">All 4 Vedas (वेद संहिता)</option>
                <option value="Rigveda" className="dark:bg-slate-900">Rigveda</option>
                <option value="Yajur Veda" className="dark:bg-slate-900">Yajurveda</option>
                <option value="Samaveda" className="dark:bg-slate-900">Samaveda</option>
                <option value="Atharva Veda" className="dark:bg-slate-900">Atharvaveda</option>
              </optgroup>

              <optgroup label="Upanishads & Sutras (दर्शन)" className="dark:bg-slate-900 font-bold">
                <option value="Upanishad" className="dark:bg-slate-900">Upanishads (15 Principal)</option>
                <option value="Patanjali Yoga Sutras" className="dark:bg-slate-900">Patanjali Yoga Sutras</option>
              </optgroup>
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-cream-200 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-cream-400/60 dark:border-amber-500/20 text-xs">
            <label className="text-[9px] text-stone-600 dark:text-slate-400 font-bold uppercase tracking-wider">Lang:</label>
            <select
              value={language}
              onChange={e => {
                setLanguage(e.target.value);
                window.speechSynthesis.cancel();
                setSpeakingMessageId(null);
              }}
              className="bg-transparent text-stone-900 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="english" className="dark:bg-slate-900">English</option>
              <option value="hindi" className="dark:bg-slate-900">हिन्दी (Hindi)</option>
              <option value="gujarati" className="dark:bg-slate-900">ગુજરાતી (Gujarati)</option>
              <option value="marathi" className="dark:bg-slate-900">मराठी (Marathi)</option>
              <option value="tamil" className="dark:bg-slate-900">தமிழ் (Tamil)</option>
              <option value="telugu" className="dark:bg-slate-900">తెలుగు (Telugu)</option>
              <option value="bengali" className="dark:bg-slate-900">বাংলা (Bengali)</option>
              <option value="kannada" className="dark:bg-slate-900">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          {/* Reset Session / New Inquiry Button */}
          {(messages.length > 0 || sessionQueryCount > 0) && (
            <button
              type="button"
              onClick={handleClearThread}
              className="flex items-center gap-1 px-3 py-1 bg-cream-200 dark:bg-slate-900 hover:bg-cream-300 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-saffron-800 dark:hover:text-amber-300 rounded-xl border border-cream-400/60 dark:border-amber-500/20 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Start a fresh conversation thread (resets query limit to 10)"
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
                  <div className="bg-gradient-to-r from-saffron-700 to-terracotta-700 dark:from-amber-600 dark:to-terracotta-700 text-white px-5 py-3 rounded-2xl rounded-tr-xs shadow-sm max-w-xl">
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-saffron-800 dark:bg-amber-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              );
            }

            const isVersesExpanded = expandedVerseMap[msgIdx] || false;

            // Assistant Synthesis Card
            return (
              <div key={msg.id} className="flex items-start gap-3 pr-2 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-saffron-100 dark:bg-slate-900 text-saffron-800 dark:text-amber-400 border border-saffron-300 dark:border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4.5 h-4.5" />
                </div>

                <div className="flex-1 bg-white dark:bg-[#0d121d] p-5 md:p-7 rounded-3xl shadow-sm border border-cream-400/70 dark:border-amber-500/20 border-t-2 border-t-saffron-500 dark:border-t-amber-500 relative overflow-hidden space-y-4 transition-colors duration-300">
                  <div className="flex items-center justify-between border-b border-cream-300/40 dark:border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-cinzel font-bold text-base md:text-lg text-saffron-950 dark:text-amber-300">
                        Scriptural Synthesis
                      </h3>
                      {msg.isStreaming && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-saffron-700 dark:text-amber-300 bg-saffron-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full animate-pulse border border-saffron-200 dark:border-amber-700/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-saffron-600 dark:bg-amber-400 animate-ping" />
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
                            : 'bg-cream-200 dark:bg-slate-900 hover:bg-saffron-100 dark:hover:bg-slate-800 border border-cream-400 dark:border-amber-500/20 text-saffron-900 dark:text-amber-200'
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
                    <div className="flex items-center gap-2 py-2 px-3 bg-cream-100 dark:bg-slate-900 rounded-xl border border-cream-300 dark:border-amber-500/20 text-xs font-semibold text-saffron-900 dark:text-amber-300 animate-pulse">
                      <div className="w-3 h-3 border-2 border-saffron-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>{msg.statusMessage}</span>
                    </div>
                  )}

                  {/* Rendered Synthesis Text */}
                  {msg.content ? (
                    <div className="text-sm md:text-base leading-relaxed text-stone-900 dark:text-slate-200 font-serif space-y-3">
                      <ReactMarkdown
                        components={{
                          h1: ({ ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-saffron-950 dark:text-amber-300 font-cinzel" {...props} />,
                          h2: ({ ...props }) => <h2 className="text-lg font-bold mt-3 mb-1.5 text-saffron-900 dark:text-amber-400 font-cinzel" {...props} />,
                          h3: ({ ...props }) => <h3 className="text-base font-semibold mt-2.5 mb-1 text-saffron-900 dark:text-amber-400 font-cinzel" {...props} />,
                          p: ({ ...props }) => <p className="mb-3 text-stone-900 dark:text-slate-200 leading-relaxed font-normal" {...props} />,
                          ul: ({ ...props }) => <ul className="list-disc pl-5 mb-3 text-stone-900 dark:text-slate-300 space-y-1 font-sans text-xs sm:text-sm" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-3 text-stone-900 dark:text-slate-300 space-y-1 font-sans text-xs sm:text-sm" {...props} />,
                          li: ({ ...props }) => <li className="mb-0.5" {...props} />,
                          strong: ({ ...props }) => <strong className="font-bold text-stone-950 dark:text-amber-200 font-sans text-xs sm:text-sm" {...props} />,
                          em: ({ ...props }) => <em className="italic text-stone-900 dark:text-slate-200 font-medium" {...props} />,
                          blockquote: ({ ...props }) => (
                            <blockquote className="border-l-4 border-saffron-500 dark:border-amber-500 pl-4 py-1.5 italic my-3 text-stone-900 dark:text-slate-200 font-medium bg-cream-200/60 dark:bg-slate-900/60 rounded-r-lg" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : null}

                  {/* Interactive Scripture Citation Badges */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-3 border-t border-cream-300/40 dark:border-amber-500/20 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-saffron-950 dark:text-amber-300 tracking-wider uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
                          <span>Scripture Citations ({msg.citations.length})</span>
                        </div>

                        {!msg.isStreaming && (
                          <button
                            type="button"
                            onClick={() => toggleVerseSection(msgIdx)}
                            className="flex items-center gap-1 text-[11px] font-bold text-saffron-800 dark:text-amber-400 hover:text-saffron-950 dark:hover:text-amber-200 cursor-pointer transition-colors"
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
                            className="px-3 py-1 text-xs bg-cream-200 dark:bg-slate-900 hover:bg-saffron-100 dark:hover:bg-slate-800 border border-cream-400 dark:border-amber-500/20 hover:border-saffron-300 dark:hover:border-amber-500/40 rounded-full text-saffron-900 dark:text-amber-200 font-bold cursor-pointer transition-all duration-200 flex items-center gap-1.5 shadow-2xs"
                          >
                            <span className="text-[9px] bg-saffron-600 dark:bg-amber-600 text-white w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                              {citIdx + 1}
                            </span>
                            <span>{cit.source_name} — Ch. {cit.chapter_number}, Verse {cit.verse_number}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clean Scripture Reference Blocks */}
                  {msg.citations && msg.citations.length > 0 && !msg.isStreaming && isVersesExpanded && (
                    <div className="pt-4 border-t border-cream-300/40 dark:border-amber-500/20 space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-saffron-600 dark:text-amber-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-saffron-900 dark:text-amber-300 font-cinzel">
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
        /* 3. Welcome View (When empty) */
        <div className="bg-white dark:bg-[#0d121d] p-6 md:p-8 rounded-3xl border border-cream-400/60 dark:border-amber-500/20 shadow-sm space-y-4 text-center transition-colors duration-300">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-saffron-500 to-terracotta-600 dark:from-amber-500 dark:to-terracotta-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-cinzel text-saffron-950 dark:text-amber-300">
            Seek the Eternal Wisdom
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 font-serif leading-relaxed max-w-lg mx-auto">
            Ask any question on dharma, philosophy, duty, karma, and spiritual consciousness.
          </p>
        </div>
      )}

      {/* 4. Limit Reached Alert Banner */}
      {isLimitReached && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-300 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs">
            <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>You have reached the limit of 10 inquiries for this session. Start a new inquiry to reset.</span>
          </div>
          <button
            type="button"
            onClick={handleClearThread}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            Start New Session
          </button>
        </div>
      )}

      {/* 5. Global Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-2xl flex items-start gap-3 shadow-xs animate-fade-in" role="alert">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold">Unable to Complete Inquiry</h4>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* 6. Fixed Bottom Ask Box Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-cream-100 via-cream-100/95 to-transparent dark:from-[#070A0F] dark:via-[#070A0F]/95 pt-3 pb-4 px-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto bg-white/95 dark:bg-[#0d121d]/95 backdrop-blur-md p-2.5 sm:p-3 rounded-3xl border border-cream-400/80 dark:border-amber-500/20 shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-center">
              <textarea
                value={query}
                disabled={isLimitReached}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={
                  isLimitReached
                    ? "Session limit reached. Click 'New Inquiry' above to continue..."
                    : messages.length > 0
                    ? "Ask a follow-up inquiry (e.g. 'Can you explain the 2nd verse in more detail?')..."
                    : "Ask the sacred scriptures (e.g. 'How does one attain mental peace amidst adversity?')..."
                }
                className="w-full p-3 pr-24 border border-cream-400/80 dark:border-amber-500/20 hover:border-cream-500 dark:hover:border-amber-500/40 bg-cream-50 dark:bg-slate-900 rounded-2xl text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-saffron-400/20 dark:focus:ring-amber-500/20 focus:border-saffron-500 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs sm:text-sm leading-relaxed resize-none min-h-[48px] max-h-28 disabled:opacity-60 disabled:cursor-not-allowed"
                rows={1}
              />

              <div className="absolute right-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isLimitReached}
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-xs'
                      : 'text-stone-500 dark:text-slate-400 hover:text-saffron-700 dark:hover:text-amber-300 hover:bg-cream-200 dark:hover:bg-slate-800'
                  }`}
                  title={isListening ? "Listening... click to stop" : "Speak query via microphone"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  disabled={isAiLoading || !query.trim() || isLimitReached}
                  className="p-2 rounded-xl bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-terracotta-600 hover:from-saffron-500 hover:to-terracotta-500 text-white disabled:from-stone-300 dark:disabled:from-slate-700 disabled:to-stone-400 dark:disabled:to-slate-600 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
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
          </form>
        </div>
      </div>
    </div>
  );
}
