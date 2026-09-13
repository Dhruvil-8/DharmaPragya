import { BookmarkItem, VerseData } from '../types';

export type { BookmarkItem };

const BOOKMARKS_STORAGE_KEY = 'dharmapragya_bookmarks_v1';

let cachedBookmarks: BookmarkItem[] | null = null;
let cachedKeySet: Set<string> | null = null;

function makeBookmarkKey(sourceName: string, chapterNumber: number, verseNumber: number): string {
  return `${sourceName.trim().toLowerCase()}::${chapterNumber}::${verseNumber}`;
}

function refreshCache(items: BookmarkItem[]) {
  cachedBookmarks = items;
  cachedKeySet = new Set(
    items.map(b => makeBookmarkKey(b.source_name, b.chapter_number, b.verse_number))
  );
}

export function getBookmarks(): BookmarkItem[] {
  if (typeof window === 'undefined') return [];
  if (cachedBookmarks !== null) {
    return [...cachedBookmarks];
  }
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    const parsed: BookmarkItem[] = raw ? JSON.parse(raw) : [];
    refreshCache(parsed);
    return [...parsed];
  } catch (e) {
    console.error('Failed to parse bookmarks from localStorage', e);
    refreshCache([]);
    return [];
  }
}

export function isVerseBookmarked(sourceName: string, chapterNumber: number, verseNumber: number): boolean {
  if (typeof window === 'undefined') return false;
  if (cachedKeySet === null) {
    getBookmarks();
  }
  return cachedKeySet?.has(makeBookmarkKey(sourceName, chapterNumber, verseNumber)) ?? false;
}

export function toggleBookmark(verse: VerseData): boolean {
  if (typeof window === 'undefined') return false;
  const bookmarks = getBookmarks();
  const index = bookmarks.findIndex(
    b => b.source_name === verse.source_name && b.chapter_number === verse.chapter_number && b.verse_number === verse.verse_number
  );

  if (index >= 0) {
    // Remove
    bookmarks.splice(index, 1);
    refreshCache(bookmarks);
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {}
    window.dispatchEvent(new Event('dharmapragya_bookmarks_updated'));
    return false;
  } else {
    // Add
    const englishTrans = verse.translations?.find(t => t.language?.toLowerCase() === 'english')?.text || verse.translations?.[0]?.text;
    const newItem: BookmarkItem = {
      id: verse.id,
      source_name: verse.source_name,
      chapter_number: verse.chapter_number,
      chapter_name: verse.chapter_name,
      verse_number: verse.verse_number,
      sanskrit_text: verse.sanskrit_text,
      transliteration: verse.transliteration,
      translation_text: englishTrans,
      saved_at: Date.now(),
    };
    bookmarks.unshift(newItem);
    refreshCache(bookmarks);
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {}
    window.dispatchEvent(new Event('dharmapragya_bookmarks_updated'));
    return true;
  }
}

export function removeBookmark(sourceName: string, chapterNumber: number, verseNumber: number): void {
  if (typeof window === 'undefined') return;
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter(
    b => !(b.source_name === sourceName && b.chapter_number === chapterNumber && b.verse_number === verseNumber)
  );
  refreshCache(filtered);
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(filtered));
  } catch {}
  window.dispatchEvent(new Event('dharmapragya_bookmarks_updated'));
}

export function clearBookmarks(): void {
  if (typeof window === 'undefined') return;
  refreshCache([]);
  try {
    localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
  } catch {}
  window.dispatchEvent(new Event('dharmapragya_bookmarks_updated'));
}


