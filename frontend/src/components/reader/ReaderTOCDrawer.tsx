'use client';

import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import { VedaInfo, VedaSection, SectionData } from '../../types';

interface ReaderTOCDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentVeda: VedaInfo | null;
  currentSource: string | null;
  vedaSections: VedaSection[];
  sectionList: SectionData[];
  currentVedaSection: number | null;
  currentSection: number | null;
  tocFilterQuery: string;
  setTocFilterQuery: (q: string) => void;
  vedaSectionSubdivisionMap: Record<string, VedaSection[]> | null;
  sectionSubdivisionMap: Record<string, SectionData[]> | null;
  filteredVedaSections: VedaSection[];
  filteredSections: SectionData[];
  onSelectVedaChapter: (vedaId: string, sectionNumber: number) => void;
  onSelectChapter: (sourceName: string, chapterNumber: number) => void;
}

export default function ReaderTOCDrawer({
  isOpen,
  onClose,
  currentVeda,
  currentSource,
  vedaSections,
  sectionList,
  currentVedaSection,
  currentSection,
  tocFilterQuery,
  setTocFilterQuery,
  vedaSectionSubdivisionMap,
  sectionSubdivisionMap,
  filteredVedaSections,
  filteredSections,
  onSelectVedaChapter,
  onSelectChapter,
}: ReaderTOCDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
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
            onClick={onClose}
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
                            onClick={() => onSelectVedaChapter(currentVeda.id, sec.section_number)}
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
                    onClick={() => onSelectVedaChapter(currentVeda.id, sec.section_number)}
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
                            if (currentSource) onSelectChapter(currentSource, sec.chapter_number);
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
                    if (currentSource) onSelectChapter(currentSource, sec.chapter_number);
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
  );
}
