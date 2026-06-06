import React, { useState, useEffect } from 'react';
import { VerseData, SectionData, SourceData } from '../types';
import VerseBlock from './VerseBlock';

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
      setIsLoading(true);
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
        .finally(() => setIsLoading(false));
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
  };

  const prevVerse = () => goToVerseIndex(currentVerseIndex - 1);
  const nextVerse = () => goToVerseIndex(currentVerseIndex + 1);

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      {isLoading && <div className="text-center py-4 text-orange-600 animate-pulse font-medium">Loading wisdom...</div>}
      
      {!isLoading && !currentCategory ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">Select Scripture Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(groupedSources).map((cat) => (
              <button 
                key={cat} 
                onClick={() => setCurrentCategory(cat)} 
                className="p-6 bg-white shadow rounded-lg border hover:bg-orange-50 transition text-left"
              >
                <p className="text-xl font-semibold text-orange-700">{cat}</p>
                <p className="text-sm text-gray-500">{groupedSources[cat].length} sources</p>
              </button>
            ))}
          </div>
        </div>
      ) : !isLoading && currentCategory && !currentSource ? (
        <div>
          <div className="mb-4">
            <button onClick={() => setCurrentCategory(null)} className="text-orange-600 underline">← Back to Categories</button>
            <h2 className="text-2xl font-semibold text-orange-700 mt-2">{currentCategory}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupedSources[currentCategory]?.map((src) => (
              <button 
                key={src.id} 
                onClick={() => loadSource(src.name)} 
                className="p-6 bg-white shadow rounded-lg border hover:bg-orange-50 transition text-left"
              >
                <p className="text-xl font-semibold text-orange-700">{src.name}</p>
                <p className="text-sm text-gray-500">{src.type}</p>
              </button>
            ))}
          </div>
        </div>
      ) : !isLoading && currentSource && !currentSection ? (
        <div>
          <div className="mb-4">
            <button onClick={() => { setCurrentSource(null); setCurrentGroup(null); }} className="text-orange-600 underline">← Back to {currentCategory}</button>
            <h2 className="text-2xl font-semibold text-orange-700 mt-2">{currentSource} Sections</h2>
          </div>

          {sectionGroups && !currentGroup ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.keys(sectionGroups).map(groupName => (
                <button 
                  key={groupName} 
                  onClick={() => setCurrentGroup(groupName)} 
                  className="p-4 bg-white shadow rounded-lg border hover:bg-orange-50 transition text-left"
                >
                  <p className="font-semibold text-orange-700">{groupName}</p>
                  <p className="text-sm text-gray-500">{sectionGroups[groupName].length} sections</p>
                </button>
              ))}
            </div>
          ) : (
            <div>
              {currentGroup && sectionGroups && (
                <button onClick={() => setCurrentGroup(null)} className="text-orange-600 underline mb-4 text-sm inline-block">← Back to Groups</button>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(currentGroup && sectionGroups ? sectionGroups[currentGroup] : sectionList).map((sec) => (
                  <button 
                    key={sec.id} 
                    onClick={() => loadChapter(sec.chapter_number)} 
                    className="p-4 bg-white shadow rounded-lg border hover:bg-orange-50 transition text-left"
                  >
                    <p className="font-semibold text-orange-700">
                      {sec.chapter_name === currentSource ? 'Complete Text' : sec.chapter_name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : !isLoading && currentSection ? (
        <div>
          <div className="mb-4">
            <button onClick={() => { setCurrentSection(null); }} className="text-orange-600 underline">← Back to {currentSource}</button>
          </div>
          
          {chapterData.length > 0 && chapterData[currentVerseIndex] && (
            <VerseBlock 
              verse={chapterData[currentVerseIndex]} 
              index={currentVerseIndex} 
              totalVerses={chapterData.length} 
              isAskMode={false} 
              onNext={nextVerse} 
              onPrev={prevVerse} 
              apiBaseUrl={apiBaseUrl} 
            />
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">All verses in this chapter</h3>
            <div className="grid gap-2">
              {chapterData.map((v, idx) => (
                <button 
                  key={v.id} 
                  onClick={() => goToVerseIndex(idx)} 
                  className={`text-left p-3 rounded border ${idx === currentVerseIndex ? 'bg-orange-50 border-orange-300' : 'bg-white'} hover:bg-orange-50`}
                >
                  <div className="font-medium text-gray-800">Verse {v.verse_number}</div>
                  <div className="text-sm text-gray-500 truncate">{v.sanskrit_text.slice(0, 50)}...</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
