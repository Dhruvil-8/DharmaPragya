/**
 * Intelligent Sanskrit and Vedic text utility functions.
 */

/**
 * Splits a Sanskrit verse or Vedic mantra into classical hemistichs (Ardharca / Padas)
 * based on Dandās (। and ॥) and explicit line breaks.
 */
export function formatSanskritVerseLines(text?: string | null): string[] {
  if (!text) return [];
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const formatted: string[] = [];

  for (const line of rawLines) {
    // Split on single danda '।', double danda '॥', with optional mantra numbers e.g. '॥१॥' or '|'
    const parts = line.split(/([।॥|]+(?:\d+[।॥|]*)?)/g).filter(Boolean);
    
    let buffer = '';
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i].trim();
      if (!p) continue;

      if (/^[।॥|]+(?:\d+[।॥|]*)?$/.test(p)) {
        buffer += (buffer ? ' ' : '') + p;
        formatted.push(buffer.trim());
        buffer = '';
      } else {
        if (buffer) buffer += ' ' + p;
        else buffer = p;
      }
    }
    if (buffer.trim()) {
      formatted.push(buffer.trim());
    }
  }

  return formatted.length > 0 ? formatted : [text.trim()];
}
