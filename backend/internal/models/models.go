package models

type Verse struct {
	ID              int          `json:"id"`
	SectionID       int          `json:"section_id"`
	VerseNumber     int          `json:"verse_number"`
	SanskritText    string       `json:"sanskrit_text"`
	Transliteration string       `json:"transliteration"`
	WordMeanings    string       `json:"word_meanings"`
	Translations    []Translation `json:"translations"`
	Commentaries    []Commentary  `json:"commentaries"`
	SourceName      string       `json:"source_name"`
	ChapterName     string       `json:"chapter_name"`
	ChapterNumber   int          `json:"chapter_number"`
}

type Translation struct {
	Language string `json:"language"`
	Text     string `json:"text"`
	Author   string `json:"author"`
}

type Commentary struct {
	Language string `json:"language"`
	Text     string `json:"text"`
	Author   string `json:"author"`
}

type Section struct {
	ID            int    `json:"id"`
	SourceID      int    `json:"source_id"`
	ChapterNumber int    `json:"chapter_number"`
	ChapterName   string `json:"chapter_name"`
}

type Source struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
}
