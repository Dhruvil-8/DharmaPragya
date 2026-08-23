/**
 * Intelligent Sanskrit and Vedic text utility functions.
 */

/**
 * Splits a Sanskrit verse or Vedic mantra into classical hemistichs (Ardharca / Padas)
 * based on Dandās (। and ॥) and explicit line breaks, while ensuring verse number end-markers
 * (e.g., '।।1.1।।', '॥ १.१ ॥', '॥ १ ॥', '।। 1 .1 ।।') stay cleanly attached at the end of the verse line.
 */
export function formatSanskritVerseLines(text?: string | null): string[] {
  if (!text) return [];

  // 1. Normalize malformed space inside numbers like '1 .1' or '1 . 1' -> '1.1'
  const cleanedText = text.replace(/(\d|[\u0966-\u096F])\s*\.\s*(\d|[\u0966-\u096F])/g, '$1.$2');

  const rawLines = cleanedText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const formatted: string[] = [];

  // Regex matching single/double dandas (Devanagari or ASCII pipe) with optional verse number coordinates
  // E.g.: '।', '॥', '||', '|', '॥ १.१ ॥', '।।1.1।।', '।। 1.1 ।।', '॥ 1 ॥', '|| 1.1 ||'
  const dandaRegex = /([।॥|]{1,2}(?:\s*[\d०-९.-]+\s*[।॥|]{1,2})*)/g;

  for (const line of rawLines) {
    const parts = line.split(dandaRegex).filter(Boolean);
    let buffer = '';

    for (let i = 0; i < parts.length; i++) {
      const pStr = parts[i].trim();
      if (!pStr) continue;

      // Check if token matches a danda or danda + verse number sequence
      if (/^[।॥|]{1,2}(?:\s*[\d०-९.-]+\s*[।॥|]{1,2})*$/.test(pStr)) {
        if (buffer) {
          buffer = buffer + '\u00A0' + pStr;
        } else {
          buffer = pStr;
        }
        formatted.push(buffer.trim());
        buffer = '';
      } else {
        if (buffer) {
          buffer += ' ' + pStr;
        } else {
          buffer = pStr;
        }
      }
    }

    if (buffer.trim()) {
      formatted.push(buffer.trim());
    }
  }

  return formatted.length > 0 ? formatted : [cleanedText.trim()];
}
