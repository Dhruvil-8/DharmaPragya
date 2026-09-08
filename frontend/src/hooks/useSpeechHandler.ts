'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechHandlerProps {
  language: string;
  isLimitReached?: boolean;
  onTranscript: (transcript: string) => void;
}

export function useSpeechHandler({ language, isLimitReached = false, onTranscript }: UseSpeechHandlerProps) {
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voicesList, setVoicesList] = useState<SpeechSynthesisVoice[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearSpeechHeartbeat = useCallback(() => {
    if (speechIntervalRef.current) {
      clearInterval(speechIntervalRef.current);
      speechIntervalRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    clearSpeechHeartbeat();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  }, [clearSpeechHeartbeat]);

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
      clearSpeechHeartbeat();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [clearSpeechHeartbeat]);

  const startListening = useCallback(() => {
    if (isLimitReached) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
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
      onTranscript(transcript);
      setIsListening(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Speech start error:', e);
      setIsListening(false);
    }
  }, [isLimitReached, language, onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speakAnswer = useCallback((messageId: string, markdownText: string) => {
    if (language !== 'english') {
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speakingMessageId === messageId) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

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

    const availableVoices = voicesList.length > 0 ? voicesList : window.speechSynthesis.getVoices();

    const englishVoice =
      availableVoices.find(v => v.lang.toLowerCase() === 'en-in') ||
      availableVoices.find(v => v.lang.toLowerCase().includes('en-in')) ||
      availableVoices.find(v => v.lang.toLowerCase().startsWith('en-')) ||
      availableVoices.find(v => v.lang.toLowerCase().startsWith('en')) ||
      availableVoices[0];

    if (englishVoice) {
      utterance.voice = englishVoice;
      utterance.lang = englishVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
      speechIntervalRef.current = setInterval(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    };

    utterance.onend = () => {
      clearSpeechHeartbeat();
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      clearSpeechHeartbeat();
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [clearSpeechHeartbeat, language, speakingMessageId, stopSpeaking, voicesList]);

  return {
    isListening,
    startListening,
    stopListening,
    speakingMessageId,
    speakAnswer,
    stopSpeaking,
  };
}
