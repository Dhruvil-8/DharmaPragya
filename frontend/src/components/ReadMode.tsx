'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VerseData, SectionData, SourceData, VedaInfo, VedaSection, VedaMantra } from '../types';
import VerseBlock, { SanskritFontSize } from './VerseBlock';
import VedicVerseBlock from './VedicVerseBlock';
import { 
  ChevronRight, 
  ChevronLeft,
  BookOpen, 
  X, 
  Search, 
  Command, 
  Sparkles,
  ChevronDown,
  Layers,
  Compass,
  Menu,
  Type,
  AlignLeft,
  FileText
} from 'lucide-react';

interface ReadModeProps {
  apiBaseUrl: string;
  isActive?: boolean;
  onOpenShareModal?: (details: {
    sourceName: string;
    chapterNumber: number;
    verseNumber: number;
    sanskritText: string;
    transliteration?: string;
    translationText: string;
  }) => void;
  onAskAboutVerse?: (verse: VerseData) => void;
  targetCoordinate?: {
    sourceName: string;
    chapterNumber: number;
    verseNumber?: number;
  } | null;
}

export default function ReadMode({
  apiBaseUrl,
  isActive = true,
  onOpenShareModal,
  onAskAboutVerse,
  targetCoordinate,
}: ReadModeProps) {
  const [sources, setSources] = useState<SourceData[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<string | null>(null);
  const [sectionList, setSectionList] = useState<SectionData[]>([]);
  const [currentSection, setCurrentSection] = useState<number | null>(null);
  const [chapterData, setChapterData] = useState<VerseData[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Dedicated Vedas State
  const [vedas, setVedas] = useState<VedaInfo[]>([]);
  const [currentVeda, setCurrentVeda] = useState<VedaInfo | null>(null);
  const [vedaSections, setVedaSections] = useState<VedaSection[]>([]);
  const [currentVedaSection, setCurrentVedaSection] = useState<number | null>(null);
  const [vedaMantras, setVedaMantras] = useState<VedaMantra[]>([]);
  const [currentMantraIndex, setCurrentMantraIndex] = useState<number>(0);

  // Reader Global View Settings (Persisted in localStorage)
  const [fontSize, setFontSize] = useState<SanskritFontSize>('md');
  const [autoPlayChant, setAutoPlayChant] = useState<boolean>(true);
  const [preferredLanguage, setPreferredLanguage] = useState<string>('english');
  const [isTocDrawerOpen, setIsTocDrawerOpen] = useState<boolean>(false);
  const [tocFilterQuery, setTocFilterQuery] = useState<string>('');
  const [verseJumpInput, setVerseJumpInput] = useState<string>('');

  // Global Unified Layer Visibility State (Persisted in localStorage)
  const [globalLayers, setGlobalLayers] = useState<{
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
  }>({
    showTransliteration: true,
    showWordMeanings: true,
    showTranslation: true,
    showCommentaries: true,
    showSvara: true,
    showIAST: false,
    showPadapatha: true,
    showAnvaya: true,
    showBhavartha: true,
    showBhashyas: true,
  });

  // Load saved preferences on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLayers = localStorage.getItem('dharmapragya_global_layers');
        if (savedLayers) {
          setGlobalLayers(prev => ({ ...prev, ...JSON.parse(savedLayers) }));
        }
        const savedFontSize = localStorage.getItem('dharmapragya_font_size') as SanskritFontSize;
        if (savedFontSize && ['sm', 'md', 'lg', 'xl'].includes(savedFontSize)) {
          setFontSize(savedFontSize);
        }
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) setPreferredLanguage(savedLang);
        const savedAutoPlay = localStorage.getItem('autoPlayChant');
        if (savedAutoPlay !== null) setAutoPlayChant(savedAutoPlay === 'true');
      } catch (e) {}
    }
  }, []);

  const handleToggleGlobalLayer = (layerKey: string) => {
    setGlobalLayers(prev => {
      const updated = { ...prev };
      if (layerKey === 'transliteration' || layerKey === 'iast') {
        const nextVal = !prev.showTransliteration;
        updated.showTransliteration = nextVal;
        updated.showIAST = nextVal;
      } else if (layerKey === 'wordMeanings' || layerKey === 'padapatha' || layerKey === 'anvaya') {
        const nextVal = !prev.showWordMeanings;
        updated.showWordMeanings = nextVal;
        updated.showPadapatha = nextVal;
        updated.showAnvaya = nextVal;
      } else if (layerKey === 'translation') {
        updated.showTranslation = !prev.showTranslation;
      } else if (layerKey === 'commentaries' || layerKey === 'bhashyas') {
        const nextVal = !prev.showCommentaries;
        updated.showCommentaries = nextVal;
        updated.showBhashyas = nextVal;
      } else if (layerKey === 'svara') {
        updated.showSvara = !prev.showSvara;
      } else if (layerKey === 'bhavartha') {
        updated.showBhavartha = !prev.showBhavartha;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('dharmapragya_global_layers', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleFontSizeChange = (newSize: SanskritFontSize) => {
    setFontSize(newSize);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dharmapragya_font_size', newSize);
    }
  };

  // Progressive Lazy Rendering State for 60fps Continuous Mode
  const [visibleCount, setVisibleCount] = useState<number>(25);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Direct Universal Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VerseData[]>([]);
  const [vedaSearchResults, setVedaSearchResults] = useState<VedaMantra[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Progressive Lazy Loading Observer (Batches 25 verses at a time when scrolling near bottom)
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => prev + 25);
      }
    }, { rootMargin: '800px' });

    observer.observe(currentRef);
    return () => {
      observer.disconnect();
    };
  }, [chapterData.length, vedaMantras.length, visibleCount]);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setVedaSearchResults([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [scripRes, vedaRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/search?q=${encodeURIComponent(searchQuery.trim())}`).catch(() => null),
          fetch(`${apiBaseUrl}/api/veda/search?q=${encodeURIComponent(searchQuery.trim())}`).catch(() => null),
        ]);

        if (scripRes && scripRes.ok) {
          const sData = await scripRes.json();
          setSearchResults(Array.isArray(sData) ? sData : []);
        } else {
          setSearchResults([]);
        }

        if (vedaRes && vedaRes.ok) {
          const vData = await vedaRes.json();
          setVedaSearchResults(Array.isArray(vData) ? vData : []);
        } else {
          setVedaSearchResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, apiBaseUrl]);

  // Global Keyboard Shortcuts (Ctrl+K, Esc, [ and ] for chapters)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          setIsSearchOpen(false);
          setIsTocDrawerOpen(false);
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
        return;
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsTocDrawerOpen(false);
        return;
      }
      if (e.key === ']' || (e.altKey && e.key === 'ArrowRight')) {
        goToNextChapter();
      } else if (e.key === '[' || (e.altKey && e.key === 'ArrowLeft')) {
        goToPrevChapter();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch sources and vedas on mount
  useEffect(() => {
    async function fetchSourcesAndVedas() {
      try {
        setIsLoading(true);
        const [srcRes, vedaRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/read`).catch(() => null),
          fetch(`${apiBaseUrl}/api/veda/read`).catch(() => null),
        ]);

        if (srcRes && srcRes.ok) {
          const sData = await srcRes.json();
          if (Array.isArray(sData)) {
            const nonVedaSources = sData.filter(s => !['Rigveda', 'Yajurveda', 'Samaveda', 'Atharva Veda', 'Yajur Veda'].includes(s.name));
            setSources(nonVedaSources);
          }
        }

        if (vedaRes && vedaRes.ok) {
          const vData = await vedaRes.json();
          if (Array.isArray(vData)) {
            setVedas(vData);
          }
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to load scriptures.';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSourcesAndVedas();
  }, [apiBaseUrl]);

  // Deep-linking navigation
  useEffect(() => {
    if (!targetCoordinate) return;

    const matchedVeda = vedas.find(v => 
      v.name_english.toLowerCase().includes(targetCoordinate.sourceName.toLowerCase()) ||
      v.id.toLowerCase() === targetCoordinate.sourceName.toLowerCase() ||
      targetCoordinate.sourceName.toLowerCase().includes(v.id.toLowerCase())
    );

    if (matchedVeda) {
      setCurrentCategory('VEDAS');
      loadVedaSource(matchedVeda, targetCoordinate.chapterNumber, targetCoordinate.verseNumber);
      return;
    }

    const matchedSource = sources.find(
      s => s.name.toLowerCase() === targetCoordinate.sourceName.toLowerCase()
    );

    if (matchedSource) {
      const isGitaText = matchedSource.name === 'Bhagavad Gita' || matchedSource.name.toLowerCase().includes('gita');
      setCurrentCategory(isGitaText ? 'Gita' : matchedSource.type);
      setCurrentSource(matchedSource.name);
      loadSourceAndSection(matchedSource.name, targetCoordinate.chapterNumber, targetCoordinate.verseNumber);
    }
  }, [targetCoordinate, sources, vedas]);

  // ---------------- Veda Handlers ----------------
  const loadVedaSource = async (veda: VedaInfo, targetDivision?: number, targetMantraNum?: number) => {
    setIsLoading(true);
    setError(null);
    setCurrentVeda(veda);
    setCurrentSource(null);
    setCurrentCategory('VEDAS');
    setCurrentVedaSection(null);
    setVedaMantras([]);
    try {
      const res = await fetch(`${apiBaseUrl}/api/veda/read?veda=${veda.id}`);
      const data = await res.json();
      setVedaSections(Array.isArray(data) ? data : []);
      if (targetDivision) {
        await loadVedaChapter(veda.id, targetDivision, targetMantraNum);
      } else if (Array.isArray(data) && data.length > 0) {
        await loadVedaChapter(veda.id, data[0].section_number);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load Veda divisions';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVedaChapter = async (vedaID: string, division1: number, targetMantraNum?: number) => {
    setIsLoading(true);
    setError(null);
    setCurrentVedaSection(division1);
    setCurrentMantraIndex(0);
    setVisibleCount(30);
    try {
      const res = await fetch(`${apiBaseUrl}/api/veda/read?veda=${vedaID}&div1=${division1}`);
      const data = await res.json();
      const mantrasArray = Array.isArray(data) ? data : [];
      setVedaMantras(mantrasArray);
      setIsTocDrawerOpen(false);

      if (targetMantraNum && mantrasArray.length > 0) {
        const mIdx = mantrasArray.findIndex((m: VedaMantra) => m.division_3 === targetMantraNum || m.krama_number === targetMantraNum);
        setCurrentMantraIndex(mIdx >= 0 ? mIdx : 0);
        if (mIdx >= 0) {
          setVisibleCount(prev => Math.max(prev, mIdx + 30));
        }
        setTimeout(() => {
          const el = document.getElementById(`mantra-anchor-${targetMantraNum}`) || 
                     document.getElementById(`verse-anchor-${targetMantraNum}`) || 
                     document.getElementById(`mantra-anchor-${mIdx + 1}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load Veda mantras';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Standard Scripture Handlers ----------------
  const loadSourceAndSection = async (sourceName: string, chapterNum: number, targetVerseNum?: number) => {
    setIsLoading(true);
    setError(null);
    setCurrentVeda(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/read?source=${encodeURIComponent(sourceName)}`);
      const data = await res.json();
      setSectionList(data);

      const chRes = await fetch(`${apiBaseUrl}/api/read?source=${encodeURIComponent(sourceName)}&chapter=${chapterNum}`);
      const chData = await chRes.json();
      setChapterData(chData);
      setCurrentSection(chapterNum);
      setIsTocDrawerOpen(false);

      if (targetVerseNum && chData.length > 0) {
        const vIdx = chData.findIndex((v: VerseData) => v.verse_number === targetVerseNum);
        setCurrentVerseIndex(vIdx >= 0 ? vIdx : 0);
        if (vIdx >= 0) {
          setVisibleCount(prev => Math.max(prev, vIdx + 30));
        }
        setTimeout(() => {
          const el = document.getElementById(`verse-anchor-${targetVerseNum}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      } else {
        setCurrentVerseIndex(0);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error loading scripture coordinate';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSource = async (sourceName: string, initialChapter?: number) => {
    setIsLoading(true);
    setError(null);
    setCurrentSource(sourceName);
    setCurrentVeda(null);
    setCurrentSection(null);
    setChapterData([]);
    const isGitaText = sourceName === 'Bhagavad Gita' || sourceName.toLowerCase().includes('gita');
    setCurrentCategory(isGitaText ? 'Gita' : (sources.find(s => s.name === sourceName)?.type || null));
    try {
      const res = await fetch(`${apiBaseUrl}/api/read?source=${encodeURIComponent(sourceName)}`);
      const data = await res.json();
      setSectionList(data);
      if (Array.isArray(data) && data.length > 0) {
        const chapToLoad = initialChapter || data[0].chapter_number;
        await loadChapter(sourceName, chapToLoad);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load chapters';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChapter = async (sourceName: string, chapterNumber: number) => {
    setIsLoading(true);
    setError(null);
    setCurrentSection(chapterNumber);
    setCurrentVerseIndex(0);
    try {
      const res = await fetch(`${apiBaseUrl}/api/read?source=${encodeURIComponent(sourceName)}&chapter=${chapterNumber}`);
      const data = await res.json();
      setChapterData(data);
      setIsTocDrawerOpen(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load chapter verses';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSearchResult = async (verse: VerseData) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setVedaSearchResults([]);

    const isGitaText = verse.source_name === 'Bhagavad Gita' || verse.source_name.toLowerCase().includes('gita');
    const matchedSource = sources.find(s => s.name.toLowerCase() === verse.source_name.toLowerCase());
    if (matchedSource || isGitaText) {
      const srcName = matchedSource ? matchedSource.name : verse.source_name;
      setCurrentCategory(isGitaText ? 'Gita' : (matchedSource?.type || 'Itihasa/Smriti'));
      setCurrentSource(srcName);
      await loadSourceAndSection(srcName, verse.chapter_number, verse.verse_number);
    }
  };

  const handleSelectVedaSearchResult = async (mantra: VedaMantra) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setVedaSearchResults([]);

    const matchedVeda = vedas.find(v => v.id === mantra.veda_id);
    if (matchedVeda) {
      setCurrentCategory('VEDAS');
      setCurrentVeda(matchedVeda);
      await loadVedaChapter(matchedVeda.id, mantra.division_1);
    }
  };

  // Chapter Navigation (Previous / Next)
  const goToNextChapter = () => {
    if (currentVeda && currentVedaSection !== null) {
      const currentIdx = vedaSections.findIndex(s => s.section_number === currentVedaSection);
      if (currentIdx >= 0 && currentIdx < vedaSections.length - 1) {
        loadVedaChapter(currentVeda.id, vedaSections[currentIdx + 1].section_number);
      }
    } else if (currentSource && currentSection !== null) {
      const currentIdx = sectionList.findIndex(s => s.chapter_number === currentSection);
      if (currentIdx >= 0 && currentIdx < sectionList.length - 1) {
        loadChapter(currentSource, sectionList[currentIdx + 1].chapter_number);
      }
    }
  };

  const goToPrevChapter = () => {
    if (currentVeda && currentVedaSection !== null) {
      const currentIdx = vedaSections.findIndex(s => s.section_number === currentVedaSection);
      if (currentIdx > 0) {
        loadVedaChapter(currentVeda.id, vedaSections[currentIdx - 1].section_number);
      }
    } else if (currentSource && currentSection !== null) {
      const currentIdx = sectionList.findIndex(s => s.chapter_number === currentSection);
      if (currentIdx > 0) {
        loadChapter(currentSource, sectionList[currentIdx - 1].chapter_number);
      }
    }
  };

  const nextVerse = () => {
    if (currentVeda) {
      if (currentMantraIndex < vedaMantras.length - 1) {
        goToVerseIndex(currentMantraIndex + 1);
      }
    } else {
      if (currentVerseIndex < chapterData.length - 1) {
        goToVerseIndex(currentVerseIndex + 1);
      }
    }
  };

  const prevVerse = () => {
    if (currentVeda) {
      if (currentMantraIndex > 0) {
        goToVerseIndex(currentMantraIndex - 1);
      }
    } else {
      if (currentVerseIndex > 0) {
        goToVerseIndex(currentVerseIndex - 1);
      }
    }
  };

  const goToVerseIndex = (idx: number) => {
    setVisibleCount(prev => Math.max(prev, idx + 30));
    if (currentVeda) {
      setCurrentMantraIndex(idx);
    } else {
      setCurrentVerseIndex(idx);
    }
    setTimeout(() => {
      const element = currentVeda
        ? (document.getElementById(`mantra-anchor-${vedaMantras[idx]?.division_3}`) || 
           document.getElementById(`verse-anchor-${idx + 1}`) ||
           document.getElementById(`mantra-anchor-${idx + 1}`))
        : document.getElementById(`verse-anchor-${chapterData[idx]?.verse_number}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  const handleDirectVerseJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(verseJumpInput.trim(), 10);
    if (isNaN(num) || num <= 0) return;
    if (currentVeda) {
      if (num <= vedaMantras.length) {
        goToVerseIndex(num - 1);
      }
    } else {
      const idx = chapterData.findIndex(v => v.verse_number === num);
      if (idx >= 0) {
        goToVerseIndex(idx);
      }
    }
    setVerseJumpInput('');
  };

  // Group Sources by Type Category (Dedicated Gitas section: Bhagavad Gita, Ashtavakra Gita, Avadhuta Gita)
  const gitaSources = useMemo(() => {
    return sources.filter(s => s.name === 'Bhagavad Gita' || s.name.toLowerCase().includes('gita') || s.type === 'gita');
  }, [sources]);

  const epicsSources = useMemo(() => {
    return sources.filter(s => s.type === 'Itihasa/Smriti' && s.name !== 'Bhagavad Gita' && !s.name.toLowerCase().includes('gita'));
  }, [sources]);

  const puranaSources = useMemo(() => {
    return sources.filter(s => (s.type === 'Purana' || s.type === 'purana') && !s.name.toLowerCase().includes('gita'));
  }, [sources]);

  const upanishadSources = useMemo(() => {
    return sources.filter(s => s.type === 'Shruti' && !s.name.toLowerCase().includes('gita'));
  }, [sources]);

  const sutraSources = useMemo(() => {
    return sources.filter(s => s.type === 'Sutra' && !s.name.toLowerCase().includes('gita'));
  }, [sources]);

  // Group Multi-Division Chapters (Skandhas, Parvas, Kandas, Samhitas)
  const sectionSubdivisionMap = useMemo(() => {
    if (!currentSource || sectionList.length <= 15) return null;
    const hasSubdivisions = sectionList.some(sec => sec.chapter_name.includes(','));
    if (hasSubdivisions) {
      const groups: Record<string, SectionData[]> = {};
      sectionList.forEach(sec => {
        const groupKey = sec.chapter_name.split(',')[0].trim();
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(sec);
      });
      return groups;
    }
    return null;
  }, [currentSource, sectionList]);

  // Group Veda Divisions (Purvarchika, Mahanamyarchika, Uttararchika, Mandalas, Adhyayas, Kandas)
  const vedaSectionSubdivisionMap = useMemo(() => {
    if (!currentVeda || vedaSections.length === 0) return null;
    if (currentVeda.id === 'samaveda') {
      const groups: Record<string, VedaSection[]> = {
        'पूर्वार्चिकः (Purvarchika - 6 Prapathakas)': [],
        'महानाम्न्यार्चिकः (Mahanamyarchika)': [],
        'उत्तरार्चिकः (Uttararchika - 9 Prapathakas)': [],
      };
      vedaSections.forEach(sec => {
        if (sec.section_number <= 6) {
          groups['पूर्वार्चिकः (Purvarchika - 6 Prapathakas)'].push(sec);
        } else if (sec.section_number === 7) {
          groups['महानाम्न्यार्चिकः (Mahanamyarchika)'].push(sec);
        } else {
          groups['उत्तरार्चिकः (Uttararchika - 9 Prapathakas)'].push(sec);
        }
      });
      return groups;
    }
    return null;
  }, [currentVeda, vedaSections]);

  // Active Chapter Title & Sub-division
  const activeChapterInfo = useMemo(() => {
    if (currentVeda) {
      const sec = vedaSections.find(s => s.section_number === currentVedaSection);
      return {
        title: sec ? sec.section_name : 'Vedic Chanting',
        subtitle: currentVeda.name_sanskrit,
        total: vedaMantras.length,
      };
    }
    if (currentSource && chapterData.length > 0) {
      const chName = chapterData[0]?.chapter_name || `Chapter ${currentSection}`;
      return {
        title: chName === currentSource ? 'Complete Scripture' : chName,
        subtitle: currentSource,
        total: chapterData.length,
      };
    }
    return null;
  }, [currentVeda, currentVedaSection, vedaSections, vedaMantras, currentSource, chapterData, currentSection]);

  // Filtered TOC Chapter List
  const filteredSections = useMemo(() => {
    if (!tocFilterQuery.trim()) return sectionList;
    const q = tocFilterQuery.toLowerCase();
    return sectionList.filter(s => 
      s.chapter_name.toLowerCase().includes(q) || 
      String(s.chapter_number).includes(q)
    );
  }, [sectionList, tocFilterQuery]);

  const filteredVedaSections = useMemo(() => {
    if (!tocFilterQuery.trim()) return vedaSections;
    const q = tocFilterQuery.toLowerCase();
    return vedaSections.filter(s => 
      s.section_name.toLowerCase().includes(q) || 
      String(s.section_number).includes(q)
    );
  }, [vedaSections, tocFilterQuery]);

  const isReading = Boolean((currentSource && currentSection) || (currentVeda && currentVedaSection));

  // Dynamically detect which languages actually exist for the current text / Veda
  const availableTextLanguages = useMemo(() => {
    if (currentVeda) {
      if (currentVeda.id === 'rigveda') return ['english', 'hindi'];
      return ['hindi'];
    }
    if (chapterData && chapterData.length > 0) {
      const langs = new Set<string>();
      chapterData.forEach(v => {
        v.translations?.forEach(t => {
          if (t.language) langs.add(t.language.toLowerCase());
        });
        v.commentaries?.forEach(c => {
          if (c.language) langs.add(c.language.toLowerCase());
        });
      });
      const res: string[] = [];
      if (langs.has('english')) res.push('english');
      if (langs.has('hindi')) res.push('hindi');
      return res.length > 0 ? res : ['english', 'hindi'];
    }
    return ['english', 'hindi'];
  }, [currentVeda, chapterData]);

  const effectiveLanguage = useMemo(() => {
    if (availableTextLanguages.includes(preferredLanguage)) {
      return preferredLanguage;
    }
    return availableTextLanguages[0] || 'english';
  }, [availableTextLanguages, preferredLanguage]);

  const resetToLibrary = () => {
    setCurrentCategory(null);
    setCurrentSource(null);
    setCurrentVeda(null);
    setCurrentSection(null);
    setCurrentVedaSection(null);
    setChapterData([]);
    setVedaMantras([]);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-24 px-2 sm:px-4">
      {/* 1. UNIVERSAL TOP BAR (Sticky Search & Quick Navigation Bar) */}
      <div className="sticky top-[58px] z-40 space-y-2 transition-all">
        {/* Universal Search Bar */}
        <div ref={searchContainerRef} className="relative w-full">
          <div className="relative flex items-center bg-white/95 dark:bg-[#0d121d]/95 backdrop-blur-md rounded-2xl border border-cream-400 dark:border-amber-500/20 shadow-xs focus-within:border-saffron-500 dark:focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-saffron-400/20 dark:focus-within:ring-amber-500/20 transition-all">
            <Search className="w-4 h-4 text-saffron-600 dark:text-amber-400 ml-4 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search all Vedas, Gita, Puranas & Upanishads (e.g. 'अग्निमीळे', 'karmanye', '2.47')... [Ctrl+K]"
              className="w-full py-2.5 px-3 text-xs sm:text-sm bg-transparent text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 font-medium focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setVedaSearchResults([]);
                }}
                className="p-1 text-stone-400 dark:text-slate-500 hover:text-stone-600 dark:hover:text-slate-300 mr-2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 mr-3 px-2 py-0.5 rounded-md bg-cream-200 dark:bg-slate-800 border border-cream-300 dark:border-amber-500/20 text-[10px] font-mono text-stone-500 dark:text-slate-400 select-none">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>

          {/* Live Search Dropdown */}
          {isSearchOpen && (searchQuery.trim().length >= 2 || searchResults.length > 0 || vedaSearchResults.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0d121d] rounded-2xl border border-cream-400 dark:border-amber-500/20 shadow-xl overflow-hidden max-h-[65vh] sm:max-h-96 overflow-y-auto overscroll-contain z-50 animate-fade-in">
              <div className="p-3 bg-cream-100 dark:bg-slate-900 border-b border-cream-300 dark:border-amber-500/20 flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-slate-300 uppercase tracking-wider">
                <span>{isSearching ? 'Searching sacred scriptures...' : `${searchResults.length + vedaSearchResults.length} results found`}</span>
                <span className="text-[10px] text-stone-400 dark:text-slate-500 font-normal">Click record to jump</span>
              </div>

              {/* Vedic Search Matches */}
              {vedaSearchResults.map((m) => (
                <button
                  key={`veda-${m.id}`}
                  type="button"
                  onClick={() => handleSelectVedaSearchResult(m)}
                  className="w-full p-3.5 text-left border-b border-cream-200 dark:border-amber-900/30 hover:bg-saffron-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700/40">
                      {m.veda_name}
                    </span>
                    <span className="text-xs font-bold font-cinzel text-stone-600 dark:text-slate-400 group-hover:text-saffron-800 dark:group-hover:text-amber-300">
                      {m.coordinate_str}
                    </span>
                  </div>
                  <p className="font-sanskrit text-sm font-semibold text-stone-900 dark:text-amber-200 line-clamp-1 mt-0.5">
                    {m.sanskrit_svara || m.sanskrit_plain}
                  </p>
                </button>
              ))}

              {/* Standard Scripture Matches */}
              {searchResults.map((v) => (
                <button
                  key={`sec-${v.id}`}
                  type="button"
                  onClick={() => handleSelectSearchResult(v)}
                  className="w-full p-3.5 text-left border-b border-cream-200 dark:border-amber-900/30 hover:bg-saffron-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-800 dark:text-amber-300 bg-saffron-100 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-saffron-300 dark:border-amber-700/40">
                      {v.source_name}
                    </span>
                    <span className="text-xs font-bold font-cinzel text-stone-600 dark:text-slate-400 group-hover:text-saffron-800 dark:group-hover:text-amber-300">
                      {v.chapter_name} • Verse {v.verse_number}
                    </span>
                  </div>
                  <p className="font-sanskrit text-sm font-semibold text-stone-900 dark:text-amber-200 line-clamp-1 mt-0.5">
                    {v.sanskrit_text}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 1-Click Fast Scripture & Navigation Bar */}
        <div className="bg-white/95 dark:bg-[#0d121d]/95 backdrop-blur-md p-2.5 rounded-2xl border border-cream-400 dark:border-amber-500/20 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Breadcrumbs & Instant Scripture Switcher */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Library Home Button */}
            <button
              type="button"
              onClick={resetToLibrary}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-cream-100 dark:bg-slate-900 hover:bg-cream-200 dark:hover:bg-slate-800 rounded-xl border border-cream-400/80 dark:border-amber-500/30 text-xs font-bold text-stone-700 dark:text-slate-300 hover:text-saffron-800 dark:hover:text-amber-300 transition-colors cursor-pointer shadow-2xs"
              title="Return to Sacred Library Home"
            >
              <Compass className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
              <span>Library</span>
            </button>

            {/* Quick Scripture Dropdown */}
            <div className="relative flex items-center">
              <select
                value={currentVeda ? currentVeda.id : (currentSource || '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    resetToLibrary();
                    return;
                  }
                  const matchedVeda = vedas.find(v => v.id === val);
                  if (matchedVeda) {
                    loadVedaSource(matchedVeda);
                  } else {
                    const matchedSrc = sources.find(s => s.name === val);
                    if (matchedSrc) {
                      loadSource(matchedSrc.name);
                    }
                  }
                }}
                className="bg-cream-100 dark:bg-slate-900 text-saffron-950 dark:text-amber-300 font-bold px-3 py-1.5 rounded-xl border border-cream-400/80 dark:border-amber-500/30 text-xs focus:outline-none cursor-pointer pr-6 appearance-none font-cinzel shadow-2xs"
              >
                <option value="">Select Scripture...</option>

                {/* 1. Dedicated Gitas Section */}
                <optgroup label="Gitas (गीता)" className="font-bold dark:bg-slate-900">
                  {gitaSources.length > 0 ? (
                    gitaSources.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))
                  ) : (
                    <option value="Bhagavad Gita">Bhagavad Gita</option>
                  )}
                </optgroup>

                {/* 2. The Four Vedas */}
                <optgroup label="The Four Vedas (वेद संहिता)" className="font-bold dark:bg-slate-900">
                  {vedas.map(v => (
                    <option key={v.id} value={v.id}>{v.name_sanskrit} ({v.name_english})</option>
                  ))}
                </optgroup>
                
                {/* 3. The Puranas */}
                <optgroup label="The Puranas (पुराण)" className="font-bold dark:bg-slate-900">
                  {puranaSources.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </optgroup>

                {/* 4. Epics & Smriti (Mahabharata, Ramayana) */}
                <optgroup label="Epics & Smriti (इतिहास)" className="font-bold dark:bg-slate-900">
                  {epicsSources.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </optgroup>

                {/* 5. Upanishads */}
                <optgroup label="Upanishads (उपनिषद्)" className="font-bold dark:bg-slate-900">
                  {upanishadSources.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </optgroup>

                {/* 6. Sutras */}
                <optgroup label="Sutras (दर्शन सूत्र)" className="font-bold dark:bg-slate-900">
                  {sutraSources.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-saffron-700 dark:text-amber-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Quick Chapter Selector Dropdown with Sub-Division Groups */}
            {isReading && (
              <div className="relative flex items-center">
                <select
                  value={currentVeda ? (currentVedaSection || '') : (currentSection || '')}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    if (currentVeda) {
                      loadVedaChapter(currentVeda.id, num);
                    } else if (currentSource) {
                      loadChapter(currentSource, num);
                    }
                  }}
                  className="bg-cream-100 dark:bg-slate-900 text-stone-900 dark:text-slate-100 font-semibold px-3 py-1.5 rounded-xl border border-cream-400/80 dark:border-amber-500/30 text-xs focus:outline-none cursor-pointer pr-6 appearance-none shadow-2xs max-w-[180px] sm:max-w-[260px] truncate"
                >
                  {currentVeda ? (
                    vedaSectionSubdivisionMap ? (
                      Object.keys(vedaSectionSubdivisionMap).map(groupName => (
                        <optgroup key={groupName} label={groupName} className="font-bold dark:bg-slate-900">
                          {vedaSectionSubdivisionMap[groupName].map(sec => (
                            <option key={sec.id} value={sec.section_number}>
                              {sec.section_name} ({sec.total_mantras} Mantras)
                            </option>
                          ))}
                        </optgroup>
                      ))
                    ) : (
                      vedaSections.map(sec => (
                        <option key={sec.id} value={sec.section_number}>
                          {sec.section_name} ({sec.total_mantras} Mantras)
                        </option>
                      ))
                    )
                  ) : sectionSubdivisionMap ? (
                    Object.keys(sectionSubdivisionMap).map(groupName => (
                      <optgroup key={groupName} label={groupName} className="font-bold dark:bg-slate-900">
                        {sectionSubdivisionMap[groupName].map(sec => (
                          <option key={sec.id} value={sec.chapter_number}>
                            {sec.chapter_name.includes(',') ? sec.chapter_name.split(',')[1].trim() : sec.chapter_name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  ) : (
                    sectionList.map(sec => (
                      <option key={sec.id} value={sec.chapter_number}>
                        {sec.chapter_name === currentSource ? 'Complete Text' : sec.chapter_name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400 absolute right-2 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Right: Usability Toolset (Chapter Flippers, TOC Drawer) */}
          <div className="flex items-center gap-1.5">
            {isReading && (
              <>
                {/* Quick Chapter Flippers */}
                <button
                  type="button"
                  onClick={goToPrevChapter}
                  title="Previous Chapter ([)"
                  className="p-1.5 bg-cream-100 dark:bg-slate-900 hover:bg-cream-200 dark:hover:bg-slate-800 rounded-xl border border-cream-400/80 dark:border-amber-500/30 text-stone-700 dark:text-slate-300 hover:text-saffron-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={goToNextChapter}
                  title="Next Chapter (])"
                  className="p-1.5 bg-cream-100 dark:bg-slate-900 hover:bg-cream-200 dark:hover:bg-slate-800 rounded-xl border border-cream-400/80 dark:border-amber-500/30 text-stone-700 dark:text-slate-300 hover:text-saffron-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Table of Contents Drawer Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsTocDrawerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-saffron-100 dark:bg-amber-950/40 hover:bg-saffron-200 dark:hover:bg-amber-900/50 text-saffron-950 dark:text-amber-300 font-bold rounded-xl border border-saffron-300 dark:border-amber-500/30 text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <Menu className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Index</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. TABLE OF CONTENTS SLIDE-OVER DRAWER */}
      {isTocDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsTocDrawerOpen(false)}
            className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Drawer Sidebar */}
          <div className="relative ml-auto w-full max-w-md bg-cream-50 dark:bg-[#0d121d] h-full shadow-2xl border-l border-cream-400 dark:border-amber-500/20 flex flex-col z-10 animate-slide-in-right">
            {/* Drawer Header */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-cream-300 dark:border-amber-500/20 flex items-center justify-between">
              <div>
                <h3 className="font-cinzel font-bold text-base text-saffron-950 dark:text-amber-300">
                  {currentVeda ? currentVeda.name_sanskrit : currentSource}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-slate-400">
                  {currentVeda ? `${vedaSections.length} Divisions` : `${sectionList.length} Chapters / Adhyayas`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTocDrawerOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-lg hover:bg-cream-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Filter Search inside Drawer */}
            <div className="p-3 border-b border-cream-300/60 dark:border-amber-500/20 bg-cream-100/50 dark:bg-slate-900/50">
              <input
                type="text"
                value={tocFilterQuery}
                onChange={e => setTocFilterQuery(e.target.value)}
                placeholder="Filter chapters (e.g. '1', 'स्कन्ध', 'अध्याय')..."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 rounded-xl border border-cream-400 dark:border-amber-500/30 text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Chapter List inside Drawer */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {currentVeda ? (
                vedaSectionSubdivisionMap && !tocFilterQuery.trim() ? (
                  Object.keys(vedaSectionSubdivisionMap).map(groupName => {
                    const groupSections = vedaSectionSubdivisionMap[groupName];
                    return (
                      <div key={groupName} className="border border-cream-300 dark:border-amber-900/30 rounded-2xl overflow-hidden bg-white/70 dark:bg-slate-900/50">
                        <div className="p-3 bg-cream-100/70 dark:bg-slate-800/80 flex items-center justify-between font-bold text-xs text-saffron-950 dark:text-amber-300 font-cinzel">
                          <span>{groupName}</span>
                          <span className="text-[10px] text-stone-500 dark:text-slate-400">{groupSections.length} Sections</span>
                        </div>
                        <div className="p-2 space-y-1">
                          {groupSections.map(sec => {
                            const isCurrent = sec.section_number === currentVedaSection;
                            return (
                              <button
                                key={sec.id}
                                onClick={() => loadVedaChapter(currentVeda.id, sec.section_number)}
                                className={`w-full p-2.5 text-left rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer ${
                                  isCurrent
                                    ? 'bg-saffron-100 dark:bg-amber-950/60 border border-saffron-400 dark:border-amber-500 text-saffron-950 dark:text-amber-300 font-bold shadow-xs'
                                    : 'hover:bg-cream-100 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="line-clamp-1">{sec.section_name}</span>
                                <span className="text-[10px] opacity-70 font-mono shrink-0 ml-2">{sec.total_mantras} m</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  filteredVedaSections.map(sec => {
                    const isCurrent = sec.section_number === currentVedaSection;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => loadVedaChapter(currentVeda.id, sec.section_number)}
                        className={`w-full p-3 text-left rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                          isCurrent
                            ? 'bg-saffron-100 dark:bg-amber-950/60 border-saffron-400 dark:border-amber-500 text-saffron-950 dark:text-amber-300 font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-900/80 border-cream-300 dark:border-amber-900/30 text-stone-700 dark:text-slate-300 hover:bg-cream-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{sec.section_name}</span>
                        <span className="text-[10px] opacity-70 font-mono">{sec.total_mantras} Mantras</span>
                      </button>
                    );
                  })
                )
              ) : sectionSubdivisionMap && !tocFilterQuery.trim() ? (
                /* Subdivided Accordion List */
                Object.keys(sectionSubdivisionMap).map(groupName => {
                  const groupSections = sectionSubdivisionMap[groupName];
                  return (
                    <div key={groupName} className="border border-cream-300 dark:border-amber-900/30 rounded-2xl overflow-hidden bg-white/70 dark:bg-slate-900/50">
                      <div className="p-3 bg-cream-100/70 dark:bg-slate-800/80 flex items-center justify-between font-bold text-xs text-saffron-950 dark:text-amber-300 font-cinzel">
                        <span>{groupName}</span>
                        <span className="text-[10px] text-stone-500 dark:text-slate-400">{groupSections.length} Chaps</span>
                      </div>
                      <div className="p-2 space-y-1">
                        {groupSections.map(sec => {
                          const isCurrent = sec.chapter_number === currentSection;
                          return (
                            <button
                              key={sec.id}
                              onClick={() => {
                                if (currentSource) loadChapter(currentSource, sec.chapter_number);
                              }}
                              className={`w-full p-2.5 text-left rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer ${
                                isCurrent
                                  ? 'bg-saffron-100 dark:bg-amber-950/60 border border-saffron-400 dark:border-amber-500 text-saffron-950 dark:text-amber-300 font-bold shadow-xs'
                                  : 'hover:bg-cream-100 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="line-clamp-1">{sec.chapter_name.includes(',') ? sec.chapter_name.split(',')[1].trim() : sec.chapter_name}</span>
                              <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-2 text-stone-400 dark:text-slate-500" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Flat Chapter List */
                filteredSections.map(sec => {
                  const isCurrent = sec.chapter_number === currentSection;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        if (currentSource) loadChapter(currentSource, sec.chapter_number);
                      }}
                      className={`w-full p-3 text-left rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                        isCurrent
                          ? 'bg-saffron-100 dark:bg-amber-950/60 border-saffron-400 dark:border-amber-500 text-saffron-950 dark:text-amber-300 font-bold shadow-xs'
                          : 'bg-white dark:bg-slate-900/80 border-cream-300 dark:border-amber-900/30 text-stone-700 dark:text-slate-300 hover:bg-cream-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="line-clamp-1">{sec.chapter_name === currentSource ? 'Complete Text' : sec.chapter_name}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-2 text-stone-400 dark:text-slate-500" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 px-5 py-4 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 border-2 border-saffron-300 dark:border-amber-500/30 border-t-saffron-600 dark:border-t-amber-500 rounded-full animate-spin" />
          <div className="text-saffron-950 dark:text-amber-300 text-sm font-bold tracking-wide animate-pulse">
            Opening sacred scripture...
          </div>
        </div>
      )}

      {/* 3. SACRED LIBRARY VIEW (When no scripture is actively opened) */}
      {!isLoading && !isReading && (
        <div className="space-y-6 pt-2">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All Sacred Library' },
              { id: 'Gita', label: 'Gita (गीता)' },
              { id: 'VEDAS', label: 'The Four Vedas (वेद)' },
              { id: 'Purana', label: 'Puranas (पुराण)' },
              { id: 'Itihasa/Smriti', label: 'Epics & Itihasa (इतिहास)' },
              { id: 'Shruti', label: 'Upanishads & Sutras (दर्शन)' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCurrentCategory(cat.id === 'ALL' ? null : cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  (cat.id === 'ALL' && !currentCategory) || currentCategory === cat.id
                    ? 'bg-saffron-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-cream-400 dark:border-amber-500/20 text-stone-700 dark:text-slate-300 hover:bg-cream-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Scripture Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* 1. Dedicated Gitas Cards */}
            {(!currentCategory || currentCategory === 'Gita') && gitaSources.map((src) => (
              <button 
                key={src.id} 
                onClick={() => loadSource(src.name)} 
                className="group p-5 bg-white dark:bg-[#0d121d] border border-cream-400 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/50 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between h-40 cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-700 dark:text-amber-400 bg-saffron-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-saffron-200 dark:border-amber-500/20">
                      Gita (गीता)
                    </span>
                    <span className="text-[11px] font-bold text-saffron-700 dark:text-amber-400 font-cinzel">
                      {src.name === 'Bhagavad Gita' ? '701 Verses' : src.name === 'Ashtavakra Gita' ? '298 Verses' : '271 Verses'}
                    </span>
                  </div>
                  <p className="text-base font-bold font-cinzel text-saffron-950 dark:text-amber-300 group-hover:text-saffron-700 dark:group-hover:text-amber-200 transition-colors">
                    {src.name}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400 font-medium mt-0.5">
                    {src.name === 'Bhagavad Gita' ? '18 Adhyayas • Word-by-Word & Commentaries' : src.name === 'Ashtavakra Gita' ? '20 Prakaranas • English & Hindi Translations' : '8 Chapters • Authentic Sanskrit Text'}
                  </p>
                </div>
                <div className="flex justify-end items-center w-full pt-2">
                  <ChevronRight className="w-4 h-4 text-saffron-600 dark:text-amber-400 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}

            {/* 2. The Four Vedas Cards */}
            {(!currentCategory || currentCategory === 'VEDAS') && vedas.map((v) => (
              <button 
                key={v.id} 
                onClick={() => loadVedaSource(v)} 
                className="group p-5 bg-white dark:bg-[#0d121d] border border-cream-400 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/50 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between h-40 cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                      Veda Samhita
                    </span>
                  </div>
                  <p className="text-base font-bold font-cinzel text-saffron-950 dark:text-amber-300 group-hover:text-saffron-700 dark:group-hover:text-amber-200 transition-colors">
                    {v.name_sanskrit} ({v.name_english})
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">{v.total_mantras.toLocaleString()} Mantras &bull; Padapatha & Bhashyas</p>
                </div>
                <div className="flex justify-end items-center w-full pt-2">
                  <ChevronRight className="w-4 h-4 text-saffron-600 dark:text-amber-400 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}

            {/* 3. Puranas Cards */}
            {(!currentCategory || currentCategory === 'Purana') && puranaSources.map((src) => (
              <button 
                key={src.id} 
                onClick={() => loadSource(src.name)} 
                className="group p-5 bg-white dark:bg-[#0d121d] border border-cream-400 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/50 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between h-40 cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-700 dark:text-amber-400 bg-saffron-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-saffron-200 dark:border-amber-500/20">
                      Puran
                    </span>
                  </div>
                  <p className="text-base font-bold font-cinzel text-saffron-950 dark:text-amber-300 group-hover:text-saffron-700 dark:group-hover:text-amber-200 transition-colors">
                    {src.name}
                  </p>
                </div>
                <div className="flex justify-end items-center w-full pt-2">
                  <ChevronRight className="w-4 h-4 text-saffron-600 dark:text-amber-400 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}

            {/* 4. Epics / Itihasa Cards (Mahabharata, Ramayana) */}
            {(!currentCategory || currentCategory === 'Itihasa/Smriti') && epicsSources.map((src) => (
              <button 
                key={src.id} 
                onClick={() => loadSource(src.name)} 
                className="group p-5 bg-white dark:bg-[#0d121d] border border-cream-400 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/50 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between h-40 cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-700 dark:text-amber-400 bg-saffron-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-saffron-200 dark:border-amber-500/20">
                      Itihasa
                    </span>
                  </div>
                  <p className="text-base font-bold font-cinzel text-saffron-950 dark:text-amber-300 group-hover:text-saffron-700 dark:group-hover:text-amber-200 transition-colors">
                    {src.name}
                  </p>
                </div>
                <div className="flex justify-end items-center w-full pt-2">
                  <ChevronRight className="w-4 h-4 text-saffron-600 dark:text-amber-400 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}

            {/* 5. Upanishads Cards */}
            {(!currentCategory || currentCategory === 'Shruti') && upanishadSources.map((src) => (
              <button 
                key={src.id} 
                onClick={() => loadSource(src.name)} 
                className="group p-5 bg-white dark:bg-[#0d121d] border border-cream-400 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/50 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between h-40 cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-700 dark:text-amber-400 bg-saffron-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-saffron-200 dark:border-amber-500/20">
                      Upanishad
                    </span>
                  </div>
                  <p className="text-base font-bold font-cinzel text-saffron-950 dark:text-amber-300 group-hover:text-saffron-700 dark:group-hover:text-amber-200 transition-colors">
                    {src.name}
                  </p>
                </div>
                <div className="flex justify-end items-center w-full pt-2">
                  <ChevronRight className="w-4 h-4 text-saffron-600 dark:text-amber-400 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}

            {/* 6. Yoga Sutras */}
            {(!currentCategory || currentCategory === 'Shruti') && sutraSources.map((src) => (
              <button 
                key={src.id} 
                onClick={() => loadSource(src.name)} 
                className="group p-5 bg-white dark:bg-[#0d121d] border border-cream-400 dark:border-amber-500/20 hover:border-saffron-400 dark:hover:border-amber-500/50 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between h-40 cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-700 dark:text-amber-400 bg-saffron-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-saffron-200 dark:border-amber-500/20">
                      Sutra
                    </span>
                  </div>
                  <p className="text-base font-bold font-cinzel text-saffron-950 dark:text-amber-300 group-hover:text-saffron-700 dark:group-hover:text-amber-200 transition-colors">
                    {src.name}
                  </p>
                </div>
                <div className="flex justify-end items-center w-full pt-2">
                  <ChevronRight className="w-4 h-4 text-saffron-600 dark:text-amber-400 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. ACTIVE CHAPTER READING VIEW (Continuous Book View) */}
      {!isLoading && isReading && activeChapterInfo && (
        <div className="space-y-6">
          {/* Chapter Header Banner */}
          <div className="bg-white dark:bg-[#0d121d] p-5 rounded-3xl border border-cream-400 dark:border-amber-500/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-saffron-700 dark:text-amber-400">
                {activeChapterInfo.subtitle}
              </span>
              <h1 className="text-lg sm:text-xl font-bold font-cinzel text-saffron-950 dark:text-amber-300 mt-0.5">
                {activeChapterInfo.title}
              </h1>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                {activeChapterInfo.total} {currentVeda ? 'Mantras' : 'Shlokas / Verses'} in this chapter
              </p>
            </div>

            {/* Direct Verse Jump Input Form */}
            <form onSubmit={handleDirectVerseJump} className="flex items-center gap-1.5 self-start sm:self-auto">
              <label htmlFor="verse-jump-input" className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
                Jump to #:
              </label>
              <input
                id="verse-jump-input"
                type="number"
                min="1"
                max={activeChapterInfo.total}
                value={verseJumpInput}
                onChange={e => setVerseJumpInput(e.target.value)}
                placeholder={`1-${activeChapterInfo.total}`}
                className="w-16 px-2 py-1 bg-cream-100 dark:bg-slate-900 border border-cream-400 dark:border-amber-500/30 rounded-xl text-xs text-center font-bold text-stone-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Go
              </button>
            </form>
          </div>

          {/* Unified Global View Settings & Layer Controls Bar */}
          <div className="bg-white dark:bg-[#0d121d] p-3.5 rounded-2xl border border-cream-400 dark:border-amber-500/20 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            {/* Left: Global Layer Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-800 dark:text-amber-400 flex items-center gap-1 mr-1">
                <Layers className="w-3.5 h-3.5" />
                <span>View Settings:</span>
              </span>

              {/* Transliteration (IAST) */}
              <button
                type="button"
                onClick={() => handleToggleGlobalLayer('transliteration')}
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
                onClick={() => handleToggleGlobalLayer('wordMeanings')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                  globalLayers.showWordMeanings
                    ? 'bg-saffron-600 dark:bg-amber-500 text-white border-saffron-600 dark:border-amber-400 shadow-2xs'
                    : 'bg-cream-100 dark:bg-slate-900 border-cream-300 dark:border-slate-800 text-stone-500 dark:text-slate-400 opacity-60'
                }`}
              >
                <span>📖 {currentVeda ? 'पदपाठः / पदार्थः' : 'Word-by-Word Anvaya'}</span>
              </button>

              {/* Translations (For Scriptures & Vedas) */}
              <button
                type="button"
                onClick={() => handleToggleGlobalLayer('translation')}
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
                onClick={() => handleToggleGlobalLayer('commentaries')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                  globalLayers.showCommentaries
                    ? 'bg-saffron-600 dark:bg-amber-500 text-white border-saffron-600 dark:border-amber-400 shadow-2xs'
                    : 'bg-cream-100 dark:bg-slate-900 border-cream-300 dark:border-slate-800 text-stone-500 dark:text-slate-400 opacity-60'
                }`}
              >
                <span>💬 {currentVeda ? 'Vedic Bhashyas' : 'Commentaries'}</span>
              </button>

              {/* Svara Toggle for Vedas */}
              {currentVeda && (
                <button
                  type="button"
                  onClick={() => handleToggleGlobalLayer('svara')}
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

            {/* Right: Global Language & Sanskrit Font Sizing Controls */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Dynamic Language Selector: Only show languages available for the current text */}
              {availableTextLanguages.length > 1 ? (
                <div className="flex items-center gap-1 bg-cream-100 dark:bg-slate-800 p-0.5 rounded-xl border border-cream-300 dark:border-amber-500/20">
                  {availableTextLanguages.includes('english') && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreferredLanguage('english');
                        if (typeof window !== 'undefined') localStorage.setItem('preferredLanguage', 'english');
                      }}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                        effectiveLanguage === 'english'
                          ? 'bg-saffron-600 dark:bg-amber-500 text-white shadow-2xs'
                          : 'text-stone-600 dark:text-slate-400 hover:text-saffron-800 dark:hover:text-slate-200'
                      }`}
                      title="Switch translation to English (Ralph T.H. Griffith / English Commentaries)"
                    >
                      English
                    </button>
                  )}
                  {availableTextLanguages.includes('hindi') && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreferredLanguage('hindi');
                        if (typeof window !== 'undefined') localStorage.setItem('preferredLanguage', 'hindi');
                      }}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                        effectiveLanguage === 'hindi'
                          ? 'bg-saffron-600 dark:bg-amber-500 text-white shadow-2xs'
                          : 'text-stone-600 dark:text-slate-400 hover:text-saffron-800 dark:hover:text-slate-200'
                      }`}
                      title="Switch translation to Hindi (हिंदी अनुवाद / भावार्थ)"
                    >
                      हिंदी
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center px-2.5 py-1 bg-cream-100 dark:bg-slate-800 rounded-xl border border-cream-300 dark:border-amber-500/20 text-[10px] font-bold text-stone-600 dark:text-slate-400">
                  <span>{availableTextLanguages[0] === 'hindi' ? '🇮🇳 हिंदी (Hindi)' : '🌐 English'}</span>
                </div>
              )}

              {/* Font Size Controls */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
                  <span className="hidden sm:inline">Font:</span>
                </span>
                <div className="flex items-center gap-0.5 bg-cream-100 dark:bg-slate-800 p-0.5 rounded-xl border border-cream-300 dark:border-amber-500/20">
                  {(['sm', 'md', 'lg', 'xl'] as SanskritFontSize[]).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleFontSizeChange(size)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                        fontSize === size
                          ? 'bg-saffron-600 dark:bg-amber-500 text-white shadow-2xs'
                          : 'text-stone-600 dark:text-slate-400 hover:text-saffron-800 dark:hover:text-slate-200'
                      }`}
                      title={`Set Sanskrit font size to ${size.toUpperCase()}`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Verse Jump Carousel Pill Bar */}
          {activeChapterInfo.total > 1 && (
            <div className="bg-white dark:bg-[#0d121d] p-3 rounded-2xl border border-cream-400 dark:border-amber-500/20 shadow-2xs">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                {Array.from({ length: activeChapterInfo.total }, (_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => goToVerseIndex(idx)} 
                    title={`Go to Verse ${idx + 1}`}
                    className={`min-w-[32px] h-7 px-2 rounded-lg text-xs font-bold flex items-center justify-center border cursor-pointer transition-all duration-200 shrink-0 ${
                      idx === (currentVeda ? currentMantraIndex : currentVerseIndex)
                        ? 'bg-gradient-to-br from-saffron-500 to-terracotta-600 dark:from-amber-500 dark:to-saffron-600 text-white border-saffron-600 dark:border-amber-400 shadow-sm scale-105' 
                        : 'bg-cream-50 dark:bg-slate-900 border-cream-300 dark:border-amber-500/20 text-stone-700 dark:text-slate-300 hover:bg-saffron-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verses Content Rendering (Continuous Book View) */}
          {currentVeda ? (
            /* Continuous Book View for Vedas with Progressive Lazy Batching */
            <div className="space-y-6">
              {vedaMantras.slice(0, visibleCount).map((mantra, idx) => (
                <div key={mantra.id} id={`verse-anchor-${idx + 1}`}>
                  <VedicVerseBlock
                    mantra={mantra}
                    index={idx}
                    totalMantras={vedaMantras.length}
                    onNext={nextVerse}
                    onPrev={prevVerse}
                    preferredLanguage={effectiveLanguage}
                    isActive={isActive}
                    fontSize={fontSize}
                    globalLayers={globalLayers}
                    onToggleGlobalLayer={handleToggleGlobalLayer}
                    onOpenShareModal={onOpenShareModal}
                    onAskAboutMantra={(m) => {
                      if (onAskAboutVerse) {
                        onAskAboutVerse({
                          id: m.krama_number,
                          section_id: m.division_1,
                          verse_number: m.division_3,
                          sanskrit_text: m.sanskrit_svara || m.sanskrit_plain,
                          transliteration: m.transliteration_iast || '',
                          word_meanings: m.word_meanings?.[0]?.padartha_text || '',
                          source_name: m.veda_name,
                          chapter_name: m.coordinate_str,
                          chapter_number: m.division_1,
                          translations: m.bhashyas?.filter(b => b.bhavartha).map(b => ({
                            language: b.language || 'hindi',
                            text: b.bhavartha || '',
                            author: b.author || '',
                          })) || [],
                          commentaries: [],
                        });
                      }
                    }}
                  />
                </div>
              ))}

              {/* Progressive Lazy Sentinel */}
              {visibleCount < vedaMantras.length && (
                <div ref={loadMoreRef} className="py-6 flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 30)}
                    className="px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-cream-100 dark:hover:bg-slate-800 rounded-2xl border border-cream-400 dark:border-amber-500/30 text-xs font-bold text-stone-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs hover:scale-105"
                  >
                    Showing {Math.min(visibleCount, vedaMantras.length)} of {vedaMantras.length} — Load Next Batch
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Continuous Book View for Scriptures with Progressive Lazy Batching */
            <div className="space-y-6">
              {chapterData.slice(0, visibleCount).map((verse, idx) => (
                <div key={verse.id} id={`verse-anchor-${verse.verse_number}`}>
                  <VerseBlock 
                    verse={verse} 
                    index={idx} 
                    totalVerses={chapterData.length} 
                    isAskMode={false} 
                    onNext={nextVerse} 
                    onPrev={prevVerse} 
                    preferredLanguage={effectiveLanguage}
                    autoPlayChant={autoPlayChant}
                    isActive={isActive}
                    fontSize={fontSize}
                    globalLayers={globalLayers}
                    onToggleGlobalLayer={handleToggleGlobalLayer}
                    onOpenShareModal={onOpenShareModal}
                    onAskAboutVerse={onAskAboutVerse}
                  />
                </div>
              ))}

              {/* Progressive Lazy Sentinel */}
              {visibleCount < chapterData.length && (
                <div ref={loadMoreRef} className="py-6 flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 30)}
                    className="px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-cream-100 dark:hover:bg-slate-800 rounded-2xl border border-cream-400 dark:border-amber-500/30 text-xs font-bold text-stone-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs hover:scale-105"
                  >
                    Showing {Math.min(visibleCount, chapterData.length)} of {chapterData.length} — Load Next Batch
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chapter Flipping Footer Bar */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-cream-300/60 dark:border-amber-900/30">
            <button
              type="button"
              onClick={goToPrevChapter}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 hover:bg-cream-100 dark:hover:bg-slate-800 rounded-2xl border border-cream-400 dark:border-amber-500/30 text-xs sm:text-sm font-bold text-stone-800 dark:text-slate-200 transition-all cursor-pointer shadow-xs hover:-translate-x-0.5"
            >
              <ChevronLeft className="w-4 h-4 text-saffron-600 dark:text-amber-400" />
              <span>Previous Chapter</span>
            </button>

            <button
              type="button"
              onClick={goToNextChapter}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 hover:bg-cream-100 dark:hover:bg-slate-800 rounded-2xl border border-cream-400 dark:border-amber-500/30 text-xs sm:text-sm font-bold text-stone-800 dark:text-slate-200 transition-all cursor-pointer shadow-xs hover:translate-x-0.5"
            >
              <span>Next Chapter</span>
              <ChevronRight className="w-4 h-4 text-saffron-600 dark:text-amber-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

