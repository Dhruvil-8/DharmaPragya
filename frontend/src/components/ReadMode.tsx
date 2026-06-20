import React, { useState, useEffect } from 'react';
import { VerseData, SectionData, SourceData } from '../types';
import VerseBlock from './VerseBlock';
import { ChevronRight, List, BookMarked, ArrowLeft, BookOpen, Eye, Languages, Volume2, VolumeX, X } from 'lucide-react';

interface ReadModeProps {
  apiBaseUrl: string;
}

export default function ReadMode({ apiBaseUrl }: ReadModeProps) {
  const [sources, setSources] = useState<SourceData[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<string | null>(null);
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [sectionList, setSectionList] = useState<SectionData[]>([]);
  const [currentSection, setCurrentSection] = useState<number | null>(null);
  const [chapterData, setChapterData] = useState<VerseData[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [readingMode, setReadingMode] = useState<'study' | 'focus'>('study');
  const [autoPlayChant, setAutoPlayChant] = useState<boolean>(true);
  const [preferredLanguage, setPreferredLanguage] = useState<string>('english');

  // Hydrate states from localStorage after initial render to avoid SSR hydration mismatches
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAutoPlay = localStorage.getItem('autoPlayChant');
      const savedLang = localStorage.getItem('preferredLanguage');
      const savedMode = localStorage.getItem('readingMode');
      
      Promise.resolve().then(() => {
        if (savedAutoPlay !== null) setAutoPlayChant(savedAutoPlay === 'true');
        if (savedLang !== null) setPreferredLanguage(savedLang);
        if (savedMode !== null) setReadingMode(savedMode as 'study' | 'focus');
      });
    }
  }, []);

  useEffect(() => {
    if (sources.length === 0) {
      Promise.resolve().then(() => setIsLoading(true));
      fetch(`${apiBaseUrl}/api/read`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSources(data);
          } else {
            setSources([]);
            setError('Failed to fetch sources: ' + (data?.error || 'Unknown error'));
          }
        })
        .catch((err) => console.error('Could not fetch sources', err))
        .finally(() => {
          Promise.resolve().then(() => setIsLoading(false));
        });
    }
  }, [apiBaseUrl, sources.length]);

  const categorize = (name: string) => {
    if (name.includes('Upanishad')) return 'Upanishads';
    if (name.includes('Veda') || name.includes('Rigveda')) return 'Vedas';
    if (name === 'Bhagavad Gita' || name === 'Mahabharata' || name === 'Valmiki Ramayana') return 'Itihasa & Puranas';
    return 'Other Scriptures';
  };

  const groupedSources = sources.reduce((acc, src) => {
    const cat = categorize(src.name);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(src);
    return acc;
  }, {} as Record<string, SourceData[]>);

  const groupSections = (sections: SectionData[]) => {
    const groups: Record<string, SectionData[]> = {};
    let hasGroups = false;
    sections.forEach(sec => {
      if (sec.chapter_name.includes(',')) {
        hasGroups = true;
        const prefix = sec.chapter_name.split(',')[0].trim();
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(sec);
      } else {
        const prefix = "All Chapters";
        if (!groups[prefix]) groups[prefix] = [];
        groups[prefix].push(sec);
      }
    });
    if (Object.keys(groups).length <= 1 && !hasGroups) return null;
    return groups;
  };

  const sectionGroups = groupSections(sectionList);

  const loadSource = async (sourceName: string) => {
    setCurrentSource(sourceName);
    setCurrentGroup(null);
    setCurrentSection(null);
    setChapterData([]);
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/read?source=${encodeURIComponent(sourceName)}`);
      const data = await res.json();
      const sections = data || [];
      setSectionList(sections);
      
      if (sections.length === 1) {
        loadChapter(sections[0].chapter_number, sourceName);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load sections');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChapter = async (chapterNumber: number, overrideSource?: string) => {
    setCurrentSection(chapterNumber);
    setChapterData([]);
    setCurrentVerseIndex(0);
    setError(null);
    setIsLoading(true);
    try {
      const src = overrideSource || currentSource || '';
      const res = await fetch(`${apiBaseUrl}/api/read?source=${encodeURIComponent(src)}&chapter=${chapterNumber}`);
      const data = await res.json();
      setChapterData(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load chapter');
    } finally {
      setIsLoading(false);
    }
  };

  const goToVerseIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, chapterData.length - 1));
    setCurrentVerseIndex(clamped);
    // Smooth scroll the viewport to show the active verse block
    setTimeout(() => {
      const activeElement = document.getElementById('active-verse-view');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const prevVerse = () => goToVerseIndex(currentVerseIndex - 1);
  const nextVerse = () => goToVerseIndex(currentVerseIndex + 1);

  return (
    <div className="space-y-6">
      {/* Dynamic Breadcrumbs Navigation */}
      {(currentCategory || currentSource || currentSection) && (
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 font-medium bg-cream-300/40 px-4 py-2.5 rounded-xl border border-cream-400/50">
          <button 
            type="button"
            onClick={() => { 
              setCurrentCategory(null); 
              setCurrentSource(null); 
              setCurrentGroup(null);
              setCurrentSection(null); 
              setChapterData([]); 
            }} 
            className="hover:text-saffron-600 transition-colors cursor-pointer"
          >
            Categories
          </button>
          
          {currentCategory && (
            <>
              <span className="text-stone-400">/</span>
              <button 
                type="button"
                onClick={() => { 
                  setCurrentSource(null); 
                  setCurrentGroup(null);
                  setCurrentSection(null); 
                  setChapterData([]); 
                }} 
                className={`hover:text-saffron-600 transition-colors cursor-pointer ${!currentSource ? 'text-saffron-700 font-bold' : ''}`}
              >
                {currentCategory}
              </button>
            </>
          )}

          {currentSource && (
            <>
              <span className="text-stone-400">/</span>
              <button 
                type="button"
                onClick={() => { 
                  setCurrentSection(null); 
                  setChapterData([]); 
                }} 
                className={`hover:text-saffron-600 transition-colors cursor-pointer ${!currentSection ? 'text-saffron-700 font-bold' : ''}`}
              >
                {currentSource}
              </button>
            </>
          )}

          {currentSection && chapterData.length > 0 && (
            <>
              <span className="text-stone-400">/</span>
              <span className="text-saffron-700 font-bold font-cinzel">
                {chapterData[0]?.chapter_name === currentSource ? 'Text' : chapterData[0]?.chapter_name}
              </span>
            </>
          )}
        </nav>
      )}

      {error && <div className="bg-red-50/50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-xs font-semibold">{error}</div>}
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 border-2 border-saffron-300 border-t-saffron-600 rounded-full animate-spin" />
          <div className="text-saffron-700 text-sm font-semibold tracking-wide animate-pulse">Loading wisdom...</div>
        </div>
      )}
      
      {/* 1. Category View */}
      {!isLoading && !currentCategory && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-saffron-600" />
            <h2 className="text-xl font-bold font-cinzel text-saffron-700">Select Scripture Category</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(groupedSources).map((cat) => (
              <button 
                key={cat} 
                onClick={() => setCurrentCategory(cat)} 
                className="group p-6 bg-white border border-cream-400 hover:border-saffron-500/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between h-32 cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-lg font-bold font-cinzel text-saffron-700 group-hover:text-saffron-600 transition-colors">{cat}</p>
                  <p className="text-xs text-stone-500 mt-1">Foundational spiritual records</p>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold bg-cream-300 text-saffron-800 px-2.5 py-1 rounded-full">{groupedSources[cat].length} sources</span>
                  <ChevronRight className="w-4 h-4 text-saffron-500 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Source View */}
      {!isLoading && currentCategory && !currentSource && (
        <div className="space-y-4">
          <button 
            onClick={() => setCurrentCategory(null)} 
            className="flex items-center gap-1.5 text-xs text-saffron-700 hover:text-saffron-600 font-semibold cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Categories
          </button>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupedSources[currentCategory]?.map((src) => (
              <button 
                key={src.id} 
                onClick={() => loadSource(src.name)} 
                className="group p-6 bg-white border border-cream-400 hover:border-saffron-500/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between h-32 cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-lg font-bold font-cinzel text-saffron-700 group-hover:text-saffron-600 transition-colors">{src.name}</p>
                  <p className="text-xs text-stone-500 mt-1 capitalize">{src.type.toLowerCase().replace('_', ' ')}</p>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-semibold text-stone-400">Read chapters</span>
                  <ChevronRight className="w-4 h-4 text-saffron-500 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Section/Chapter View */}
      {!isLoading && currentSource && !currentSection && (
        <div className="space-y-4">
          <button 
            onClick={() => { setCurrentSource(null); setCurrentGroup(null); }} 
            className="flex items-center gap-1.5 text-xs text-saffron-700 hover:text-saffron-600 font-semibold cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to {currentCategory}
          </button>

          {sectionGroups && !currentGroup ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.keys(sectionGroups).map(groupName => (
                <button 
                  key={groupName} 
                  onClick={() => setCurrentGroup(groupName)} 
                  className="group p-4 bg-white border border-cream-400 hover:border-saffron-500/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-left cursor-pointer"
                >
                  <p className="font-bold text-sm text-saffron-700 group-hover:text-saffron-600 transition-colors font-cinzel">{groupName}</p>
                  <p className="text-xs text-stone-500 mt-1">{sectionGroups[groupName].length} divisions</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentGroup && sectionGroups && (
                <button 
                  onClick={() => setCurrentGroup(null)} 
                  className="flex items-center gap-1 text-xs text-saffron-700 hover:text-saffron-600 font-semibold cursor-pointer mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Divisions
                </button>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(currentGroup && sectionGroups ? sectionGroups[currentGroup] : sectionList).map((sec) => (
                  <button 
                    key={sec.id} 
                    onClick={() => loadChapter(sec.chapter_number)} 
                    className="p-4 bg-white hover:bg-cream-200 border border-cream-400 hover:border-saffron-500/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-left cursor-pointer flex justify-between items-center"
                  >
                    <span className="font-semibold text-sm text-saffron-700 font-cinzel">
                      {sec.chapter_name === currentSource ? 'Complete Text' : sec.chapter_name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-saffron-500/80 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Active Verse & Chapter Browser View */}
      {!isLoading && currentSection && (
        <div className="space-y-6">
          
          {/* A. Zen Focus Mode Full-Screen Overlay */}
          {readingMode === 'focus' ? (
            <div className="fixed inset-0 z-50 bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 flex flex-col overflow-y-auto selection:bg-saffron-200 selection:text-saffron-700 animate-fade-in">
              <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col flex-grow space-y-6">
                
                {/* Pinned Top Bar inside Focus Mode */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-cream-400/50 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setReadingMode('study')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-600 hover:text-saffron-700 bg-white border border-cream-400 hover:border-saffron-300 rounded-xl cursor-pointer transition-all shadow-sm"
                      title="Exit Zen focus mode"
                    >
                      <X className="w-4 h-4" />
                      <span>Exit Focus</span>
                    </button>
                    <span className="h-4 w-px bg-stone-300" />
                    <span className="font-cinzel text-xs font-extrabold text-saffron-800 tracking-wider">
                      {chapterData[0]?.chapter_name === currentSource ? currentSource : chapterData[0]?.chapter_name}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Language Preference inside Focus */}
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-cream-400 text-xs shadow-sm">
                      <Languages className="w-3.5 h-3.5 text-saffron-600" />
                      <select
                        value={preferredLanguage}
                        onChange={(e) => {
                          setPreferredLanguage(e.target.value);
                          if (typeof window !== 'undefined') localStorage.setItem('preferredLanguage', e.target.value);
                        }}
                        className="bg-transparent text-saffron-700 font-bold border-none outline-none pr-5 cursor-pointer text-xs"
                      >
                        <option value="english">English</option>
                        <option value="hindi">हिन्दी (Hindi)</option>
                        <option value="sanskrit">Sanskrit</option>
                      </select>
                    </div>

                    {/* Autoplay setting inside Focus */}
                    {currentSource === 'Bhagavad Gita' && (
                      <button
                        onClick={() => {
                          const nextVal = !autoPlayChant;
                          setAutoPlayChant(nextVal);
                          if (typeof window !== 'undefined') localStorage.setItem('autoPlayChant', String(nextVal));
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm cursor-pointer ${
                          autoPlayChant 
                            ? 'bg-saffron-50 border-saffron-200 text-saffron-700' 
                            : 'bg-stone-50 border-stone-200 text-stone-500'
                        }`}
                      >
                        {autoPlayChant ? <Volume2 className="w-3.5 h-3.5 text-saffron-500" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
                        <span>{autoPlayChant ? 'Autoplay On' : 'Autoplay Off'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar inside Focus */}
                {chapterData.length > 0 && (
                  <div className="space-y-1">
                    <div className="w-full bg-cream-400/40 h-1.5 rounded-full overflow-hidden border border-cream-500/20">
                      <div 
                        className="bg-gradient-to-r from-saffron-500 to-terracotta-500 h-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentVerseIndex + 1) / chapterData.length) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-stone-400 tracking-widest uppercase px-1">
                      <span>Verse {currentVerseIndex + 1} of {chapterData.length}</span>
                      <span>{Math.round(((currentVerseIndex + 1) / chapterData.length) * 100)}% read</span>
                    </div>
                  </div>
                )}

                {/* Active Verse Card in Focus */}
                <div className="flex-grow flex items-center justify-center py-4">
                  {chapterData.length > 0 && chapterData[currentVerseIndex] && (
                    <VerseBlock 
                      verse={chapterData[currentVerseIndex]} 
                      index={currentVerseIndex} 
                      totalVerses={chapterData.length} 
                      isAskMode={false} 
                      onNext={nextVerse} 
                      onPrev={prevVerse} 
                      readingMode="focus"
                      preferredLanguage={preferredLanguage}
                      autoPlayChant={autoPlayChant}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            // B. Standard Study Mode Layout
            <>
              {/* Progress Bar in Study Mode */}
              {chapterData.length > 0 && (
                <div className="space-y-1.5">
                  <div className="w-full bg-cream-400/40 h-1.5 rounded-full overflow-hidden border border-cream-500/20">
                    <div 
                      className="bg-gradient-to-r from-saffron-500 to-terracotta-500 h-full transition-all duration-500 ease-out"
                      style={{ width: `${((currentVerseIndex + 1) / chapterData.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 tracking-wider uppercase px-1">
                    <span>Verse {currentVerseIndex + 1} of {chapterData.length}</span>
                    <span>{Math.round(((currentVerseIndex + 1) / chapterData.length) * 100)}% Complete</span>
                  </div>
                </div>
              )}

              {/* Study Mode Top Menu Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-cream-400/50 shadow-sm">
                <button 
                  onClick={() => { setCurrentSection(null); }} 
                  className="flex items-center gap-1.5 text-xs text-saffron-700 hover:text-saffron-600 font-semibold cursor-pointer group px-2 py-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Back to Chapters
                </button>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="flex bg-cream-300 p-0.5 rounded-xl border border-cream-400/50 text-xs">
                    <button
                      onClick={() => {
                        setReadingMode('study');
                        if (typeof window !== 'undefined') localStorage.setItem('readingMode', 'study');
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        (readingMode as string) === 'study'
                          ? 'bg-gradient-to-r from-saffron-500 to-terracotta-500 text-white shadow-sm'
                          : 'text-saffron-700 hover:text-saffron-600'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Study</span>
                    </button>
                    <button
                      onClick={() => {
                        setReadingMode('focus');
                        if (typeof window !== 'undefined') localStorage.setItem('readingMode', 'focus');
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        (readingMode as string) === 'focus'
                          ? 'bg-gradient-to-r from-saffron-500 to-terracotta-500 text-white shadow-sm'
                          : 'text-saffron-700 hover:text-saffron-600'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Focus</span>
                    </button>
                  </div>


                  {/* Language Selector */}
                  <div className="flex items-center gap-1.5 bg-cream-300 px-2.5 py-1.5 rounded-xl border border-cream-400/50 text-xs">
                    <Languages className="w-3.5 h-3.5 text-saffron-600" />
                    <select
                      value={preferredLanguage}
                      onChange={(e) => {
                        setPreferredLanguage(e.target.value);
                        if (typeof window !== 'undefined') localStorage.setItem('preferredLanguage', e.target.value);
                      }}
                      className="bg-transparent text-saffron-700 font-bold border-none outline-none pr-5 cursor-pointer text-xs"
                    >
                      <option value="english">English</option>
                      <option value="hindi">हिन्दी (Hindi)</option>
                      <option value="sanskrit">Sanskrit</option>
                    </select>
                  </div>

                  {/* Audio Autoplay Switch (Only for Gita) */}
                  {currentSource === 'Bhagavad Gita' && (
                    <button
                      onClick={() => {
                        const nextVal = !autoPlayChant;
                        setAutoPlayChant(nextVal);
                        if (typeof window !== 'undefined') localStorage.setItem('autoPlayChant', String(nextVal));
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        autoPlayChant 
                          ? 'bg-saffron-50 border-saffron-200 text-saffron-700' 
                          : 'bg-stone-50 border-stone-200 text-stone-500'
                      }`}
                    >
                      {autoPlayChant ? <Volume2 className="w-3.5 h-3.5 text-saffron-500" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
                      <span>{autoPlayChant ? 'Autoplay On' : 'Autoplay Off'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Verse Block */}
              <div id="active-verse-view">
                {chapterData.length > 0 && chapterData[currentVerseIndex] && (
                  <VerseBlock 
                    verse={chapterData[currentVerseIndex]} 
                    index={currentVerseIndex} 
                    totalVerses={chapterData.length} 
                    isAskMode={false} 
                    onNext={nextVerse} 
                    onPrev={prevVerse} 
                    readingMode="study"
                    preferredLanguage={preferredLanguage}
                    autoPlayChant={autoPlayChant}
                  />
                )}
              </div>

              {/* Quick verse selection grid */}
              {chapterData.length > 1 && (
                <div className="bg-white p-6 rounded-2xl border border-cream-400 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-4 border-b border-cream-300/40 pb-2">
                    <List className="w-4 h-4 text-saffron-600" />
                    <h3 className="text-sm font-bold text-saffron-700 tracking-wider uppercase font-cinzel">Navigate Verses</h3>
                  </div>
                  
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
                    {chapterData.map((v, idx) => (
                      <button 
                        key={v.id} 
                        onClick={() => goToVerseIndex(idx)} 
                        title={`Verse ${v.verse_number}`}
                        className={`aspect-square rounded-lg text-xs font-bold flex items-center justify-center border cursor-pointer transition-all duration-200 ${
                          idx === currentVerseIndex 
                            ? 'bg-gradient-to-br from-saffron-500 to-terracotta-600 text-white border-saffron-600 shadow-sm scale-115 z-10' 
                            : 'bg-white border-cream-400 text-stone-700 hover:bg-saffron-50 hover:border-saffron-300'
                        }`}
                      >
                        {v.verse_number}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      )}
    </div>
  );
}
