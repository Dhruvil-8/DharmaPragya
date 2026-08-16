import React from 'react';

/**
 * Traditional Indian Manuscript Corner Filigree (Hashiya / Rekha)
 */
export function ManuscriptCorners() {
  return (
    <>
      {/* Top-Left Corner Filigree */}
      <svg
        className="absolute top-2 left-2 w-5 h-5 text-saffron-600/30 dark:text-amber-400/30 pointer-events-none select-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M2 10V4a2 2 0 0 1 2-2h6" />
        <circle cx="4" cy="4" r="1.5" fill="currentColor" />
        <path d="M7 2a5 5 0 0 0-5 5" strokeDasharray="1 1" />
      </svg>

      {/* Top-Right Corner Filigree */}
      <svg
        className="absolute top-2 right-2 w-5 h-5 text-saffron-600/30 dark:text-amber-400/30 pointer-events-none select-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M22 10V4a2 2 0 0 0-2-2h-6" />
        <circle cx="20" cy="4" r="1.5" fill="currentColor" />
        <path d="M17 2a5 5 0 0 1 5 5" strokeDasharray="1 1" />
      </svg>

      {/* Bottom-Left Corner Filigree */}
      <svg
        className="absolute bottom-2 left-2 w-5 h-5 text-saffron-600/30 dark:text-amber-400/30 pointer-events-none select-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M2 14v6a2 2 0 0 0 2 2h6" />
        <circle cx="4" cy="20" r="1.5" fill="currentColor" />
        <path d="M7 22a5 5 0 0 1-5-5" strokeDasharray="1 1" />
      </svg>

      {/* Bottom-Right Corner Filigree */}
      <svg
        className="absolute bottom-2 right-2 w-5 h-5 text-saffron-600/30 dark:text-amber-400/30 pointer-events-none select-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M22 14v6a2 2 0 0 1-2 2h-6" />
        <circle cx="20" cy="20" r="1.5" fill="currentColor" />
        <path d="M17 22a5 5 0 0 0 5-5" strokeDasharray="1 1" />
      </svg>
    </>
  );
}

/**
 * Minimalist Vedic Divider (Clean, non-intrusive geometric flourish)
 */
export function VedicDivider() {
  return (
    <div className="flex items-center justify-center gap-2.5 my-4 py-1 select-none opacity-50">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-saffron-400/30 dark:via-amber-500/20 to-saffron-500/50 dark:to-amber-400/40" />
      <span className="text-[9px] text-saffron-600 dark:text-amber-400">❖</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-saffron-400/30 dark:via-amber-500/20 to-saffron-500/50 dark:to-amber-400/40" />
    </div>
  );
}

/**
 * Sacred Diya / Lotus Acoustic Ripple Visualizer
 */
export function HarmonicLotusRipple() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
      <div className="w-24 h-24 rounded-full border border-saffron-400/20 dark:border-amber-400/20 animate-ping opacity-75" />
      <div className="w-16 h-16 rounded-full border border-saffron-500/30 dark:border-amber-500/30 animate-pulse" />
    </div>
  );
}
