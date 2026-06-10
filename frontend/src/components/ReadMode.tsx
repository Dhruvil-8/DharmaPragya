import React, { useState, useEffect } from 'react';
import { VerseData, SectionData, SourceData } from '../types';
import VerseBlock from './VerseBlock';
import { ChevronRight, List, BookMarked, ArrowLeft } from 'lucide-react';

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
          <div className="flex items-center justify-between">
            <button 
              onClick={() => { setCurrentSection(null); }} 
              className="flex items-center gap-1.5 text-xs text-saffron-700 hover:text-saffron-600 font-semibold cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to Chapters
            </button>
          </div>
          
          {/* Active Verse Block wrapper */}
          <div id="active-verse-view">
            {chapterData.length > 0 && chapterData[currentVerseIndex] && (
              <VerseBlock 
                verse={chapterData[currentVerseIndex]} 
                index={currentVerseIndex} 
                totalVerses={chapterData.length} 
                isAskMode={false} 
                onNext={nextVerse} 
                onPrev={prevVerse} 
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
        </div>
      )}
    </div>
  );
}
