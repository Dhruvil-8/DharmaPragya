export type Language = 'english' | 'hindi' | 'sanskrit' | 'gujarati';

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

export interface Citation {
  source: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: VerseData[];
  statusMessage?: string;
  isStreaming?: boolean;
  isError?: boolean;
  timestamp: number;
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

// Dedicated Vedic Types
export interface VedaInfo {
  id: string;
  name_sanskrit: string;
  name_english: string;
  shakha: string;
  total_mantras: number;
  description: string;
}

export interface VedaSection {
  id: number;
  veda_id: string;
  section_type: string;
  section_number: number;
  section_name: string;
  total_subdivisions: number;
  total_mantras: number;
}

export interface VedaWordMeaning {
  commentator: string;
  language: string;
  padartha_text: string;
}

export interface VedaBhashya {
  author: string;
  language: string;
  mantra_vishaya?: string;
  anvaya?: string;
  bhavartha?: string;
  tika?: string;
}

export interface VedaMantra {
  id: string;
  veda_id: string;
  veda_name: string;
  krama_number: number;
  division_1: number;
  division_2: number;
  division_3: number;
  division_4?: number;
  coordinate_str: string;
  ashtaka_coordinate?: string;
  kauthuma_coordinate?: string;
  ranayaniya_coordinate?: string;
  sanskrit_svara: string;
  sanskrit_plain: string;
  padapatha_svara?: string;
  padapatha_plain?: string;
  transliteration_iast?: string;
  rishi?: string;
  devata?: string;
  chhandas?: string;
  svara?: string;
  gana?: string;
  ganaparva?: string;
  rigveda_ref?: string;
  yajurveda_ref?: string;
  atharvaveda_ref?: string;
  is_repetition: number;
  word_meanings: VedaWordMeaning[];
  bhashyas: VedaBhashya[];
}
