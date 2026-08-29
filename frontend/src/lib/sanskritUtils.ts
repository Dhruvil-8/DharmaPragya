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

export interface ParsedWordMeaning {
  word: string;
  meaning: string;
}

/**
 * Robust parser for scripture word-by-word Anvaya (Gita, Upanishads, etc.).
 * Handles em-dash (—), en-dash (–), double hyphen (--), equals (=), colons (:),
 * and preserves internal commas in English explanations.
 */
export function parseWordMeanings(raw?: string | null): ParsedWordMeaning[] {
  if (!raw || !raw.trim()) return [];

  // Split on semicolons or newlines (do NOT split on commas as meanings frequently contain commas)
  const items = raw.split(/[;\r\n]+/).map(s => s.trim()).filter(Boolean);
  const results: ParsedWordMeaning[] = [];

  for (const item of items) {
    // Priority 1: Match em-dash, en-dash, horizon bar, double dash, equals, or colon
    const dashMatch = item.match(/^(.+?)\s*(?:[\u2014\u2013\u2015]|--|=|\s+-\s+|:\s*)\s*(.+)$/);
    if (dashMatch) {
      const word = dashMatch[1].trim();
      const meaning = dashMatch[2].trim();
      if (word && meaning) {
        results.push({ word, meaning });
        continue;
      }
    }

    // Priority 2: Fallback for single hyphen with space or at boundary
    const singleHyphenMatch = item.match(/^([^\s-][^-]*?)\s+-\s+(.+)$/);
    if (singleHyphenMatch) {
      const word = singleHyphenMatch[1].trim();
      const meaning = singleHyphenMatch[2].trim();
      if (word && meaning) {
        results.push({ word, meaning });
        continue;
      }
    }

    // Priority 3: Fallback for "word - meaning" where word might be single token
    const parts = item.split(/\s*-\s*/);
    if (parts.length >= 2) {
      const word = parts[0].trim();
      const meaning = parts.slice(1).join(' - ').trim();
      if (word && meaning) {
        results.push({ word, meaning });
      }
    }
  }

  return results;
}

/**
 * Cleans commentary text to remove word-by-word prefix artifacts (e.g. Swami Sivananda)
 * and suppresses "No Commentary." placeholder markers.
 */
export function cleanCommentaryText(author: string, text?: string | null): string {
  if (!text || !text.trim()) return '';

  const trimmed = text.trim();

  // If text is simply "No Commentary." or ".No Commentary."
  if (/^\.?\s*No Commentary\.?\s*$/i.test(trimmed) || trimmed.endsWith('No Commentary.') && trimmed.length < 30) {
    return '';
  }

  // If commentary has embedded ".Commentary <actual text>" or "Commentary: <actual text>"
  const commMatch = trimmed.match(/\.?\s*Commentary[:\s]+([\s\S]+)$/i);
  if (commMatch && commMatch[1].trim()) {
    const extracted = commMatch[1].trim();
    if (/^\.?\s*No Commentary\.?\s*$/i.test(extracted)) {
      return '';
    }
    return extracted;
  }

  // If Swami Sivananda commentary ends with "No Commentary." after word gloss, remove it
  if (trimmed.includes('No Commentary.')) {
    const withoutNoComm = trimmed.replace(/\.?\s*No Commentary\.?\s*$/i, '').trim();
    // If only word gloss remains and no actual commentary, return empty
    if (/^[\d.]+\s*[\u0900-\u097F]/.test(withoutNoComm) && !withoutNoComm.includes('Commentary')) {
      return '';
    }
    return withoutNoComm;
  }

  return trimmed;
}

