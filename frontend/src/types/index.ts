export interface Citation {
  source: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface AiResponse {
  answer: string;
  citations: VerseData[] | null;
}

export interface Translation {
  author: string;
  language: string;
  text: string;
}

export interface Commentary {
  author: string;
  language: string;
  text: string;
}

export interface VerseData {
  id: number;
  section_id: number;
  verse_number: number;
  sanskrit_text: string;
  transliteration: string;
  word_meanings: string;
  source_name: string;
  chapter_name: string;
  chapter_number: number;
  translations: Translation[];
  commentaries: Commentary[];
}

export interface SectionData {
  id: number;
  source_id: number;
  chapter_number: number;
  chapter_name: string;
}

export interface SourceData {
  id: number;
  name: string;
  type: string;
}

export type Language = 'english' | 'hindi' | 'sanskrit';

export interface BookmarkItem {
  id: number;
  source_name: string;
  chapter_number: number;
  chapter_name: string;
  verse_number: number;
  sanskrit_text: string;
  transliteration?: string;
  translation_text?: string;
  saved_at: number;
}

export interface DailyShloka {
  source_name: string;
  chapter_number: number;
  verse_number: number;
  sanskrit_text: string;
  transliteration: string;
  translation_english: string;
  translation_hindi: string;
  reflection: string;
  theme: string;
  audio_path?: string;
}
