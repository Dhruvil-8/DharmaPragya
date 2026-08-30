'use client';

import React, { useState } from 'react';
import { 
  Menu, 
  Compass, 
  BookOpen 
} from 'lucide-react';
import Image from 'next/image';
import SidePanel from './SidePanel';

interface HeaderProps {
  onOpenSanctuary?: () => void;
  onOpenAbout?: () => void;
  mode?: 'ask' | 'read';
  onModeChange?: (mode: 'ask' | 'read') => void;
  onHomeClick?: () => void;
}

export default function Header({ 
  onOpenSanctuary, 
  onOpenAbout, 
  mode, 
  onModeChange, 
  onHomeClick
}: HeaderProps) {
  const [internalAboutOpen, setInternalAboutOpen] = useState(false);

  const handleBrandClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else if (onModeChange) {
      onModeChange('ask');
    }
  };

  const handleMenuClick = () => {
    if (onOpenAbout) {
      onOpenAbout();
    } else {
      setInternalAboutOpen(true);
    }
  };

  return (
    <>
      <div className="relative w-full flex items-center justify-between select-none min-h-[40px] transition-colors duration-300">
        {/* Left: Clean Menu / Side Panel Trigger */}
        <div className="flex items-center gap-1.5 shrink-0 z-10">
          <button
            type="button"
            onClick={handleMenuClick}
            className="flex items-center justify-center w-8 h-8 text-saffron-800 dark:text-amber-300 bg-cream-300/50 dark:bg-slate-900/70 hover:bg-cream-300 dark:hover:bg-slate-800 border border-cream-400/50 dark:border-amber-500/20 rounded-full cursor-pointer transition-all duration-200 hover:shadow-xs"
            title="Menu & Navigation"
            aria-label="Menu & Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Absolute Dead Center: Integrated 2-Mode Segment Switcher */}
        {mode && onModeChange && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
            <div className="bg-cream-300/90 dark:bg-slate-900/90 p-1 rounded-full border border-cream-400/70 dark:border-amber-500/20 flex shadow-2xs">
              <button
                type="button"
                onClick={() => onModeChange('ask')}
                className={`flex items-center gap-1.5 py-1 px-3 sm:px-4 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  mode === 'ask'
                    ? 'bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-saffron-600 text-white shadow-xs'
                    : 'text-saffron-900 dark:text-slate-300 hover:text-saffron-700 dark:hover:text-amber-300 hover:bg-cream-200 dark:hover:bg-slate-800/80'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>

              <button
                type="button"
                onClick={() => onModeChange('read')}
                className={`flex items-center gap-1.5 py-1 px-3 sm:px-4 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  mode === 'read'
                    ? 'bg-gradient-to-r from-saffron-600 to-terracotta-600 dark:from-amber-500 dark:to-saffron-600 text-white shadow-xs'
                    : 'text-saffron-900 dark:text-slate-300 hover:text-saffron-700 dark:hover:text-amber-300 hover:bg-cream-200 dark:hover:bg-slate-800/80'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read</span>
              </button>
            </div>
          </div>
        )}

        {/* Right: Brand Logo & Title (Clicking returns to Home / Ask AI) */}
        <button
          type="button"
          onClick={handleBrandClick}
          className="flex items-center gap-2 shrink-0 cursor-pointer text-right group focus:outline-none transition-transform active:scale-95 z-10 ml-auto"
          title="DharmaPragya Home - Return to main sanctuary"
          aria-label="DharmaPragya Home"
        >
          <div className="flex flex-col items-end">
            <span className="font-cinzel text-xs sm:text-sm font-bold tracking-widest text-saffron-950 dark:text-amber-200 group-hover:text-saffron-700 dark:group-hover:text-amber-300 transition-colors">
              धर्मप्रज्ञा
            </span>
            <span className="text-[9px] tracking-wider text-saffron-700/80 dark:text-amber-400/80 uppercase font-semibold">
              DharmaPragya
            </span>
          </div>
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-saffron-400/50 dark:border-amber-500/40 shadow-2xs group-hover:border-saffron-600 dark:group-hover:border-amber-400 transition-colors">
            <Image
              src="/logo.png"
              alt="DharmaPragya Emblem"
              fill
              className="object-cover"
              sizes="32px"
              priority
            />
          </div>
        </button>
      </div>

      {/* Embedded SidePanel fallback if opened directly from header state */}
      <SidePanel 
        isOpen={internalAboutOpen} 
        onClose={() => setInternalAboutOpen(false)}
        onOpenSanctuary={onOpenSanctuary}
        mode={mode}
        onModeChange={onModeChange}
      />
    </>
  );
}
