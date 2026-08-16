import { BookmarkItem, VerseData } from '../types';

export type { BookmarkItem };

const BOOKMARKS_STORAGE_KEY = 'dharmapragya_bookmarks_v1';

export function getBookmarks(): BookmarkItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse bookmarks from localStorage', e);
    return [];
  }
}

export function isVerseBookmarked(sourceName: string, chapterNumber: number, verseNumber: number): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some(
    b => b.source_name === sourceName && b.chapter_number === chapterNumber && b.verse_number === verseNumber
  );
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
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
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
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
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
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('dharmapragya_bookmarks_updated'));
}
