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

// VEDA DOMAIN MODELS

type VedaInfo struct {
	ID           string `json:"id"`
	NameSanskrit string `json:"name_sanskrit"`
	NameEnglish  string `json:"name_english"`
	Shakha       string `json:"shakha"`
	TotalMantras int    `json:"total_mantras"`
	Description  string `json:"description"`
}

type VedaSection struct {
	ID                int    `json:"id"`
	VedaID            string `json:"veda_id"`
	SectionType       string `json:"section_type"`
	SectionNumber     int    `json:"section_number"`
	SectionName       string `json:"section_name"`
	TotalSubdivisions int    `json:"total_subdivisions"`
	TotalMantras      int    `json:"total_mantras"`
}

type VedaWordMeaning struct {
	Commentator  string `json:"commentator"`
	Language     string `json:"language"`
	PadarthaText string `json:"padartha_text"`
}

type VedaBhashya struct {
	Author        string `json:"author"`
	Language      string `json:"language"`
	MantraVishaya string `json:"mantra_vishaya,omitempty"`
	Anvaya        string `json:"anvaya,omitempty"`
	Bhavartha     string `json:"bhavartha,omitempty"`
	Tika          string `json:"tika,omitempty"`
}

type VedaMantra struct {
	ID                   string            `json:"id"`
	VedaID               string            `json:"veda_id"`
	VedaName             string            `json:"veda_name"`
	KramaNumber          int               `json:"krama_number"`
	Division1            int               `json:"division_1"`
	Division2            int               `json:"division_2"`
	Division3            int               `json:"division_3"`
	Division4            *int              `json:"division_4,omitempty"`
	CoordinateStr        string            `json:"coordinate_str"`
	AshtakaCoordinate    string            `json:"ashtaka_coordinate,omitempty"`
	KauthumaCoordinate   string            `json:"kauthuma_coordinate,omitempty"`
	RanayaniyaCoordinate string            `json:"ranayaniya_coordinate,omitempty"`
	SanskritSvara        string            `json:"sanskrit_svara"`
	SanskritPlain        string            `json:"sanskrit_plain"`
	PadapathaSvara       string            `json:"padapatha_svara,omitempty"`
	PadapathaPlain       string            `json:"padapatha_plain,omitempty"`
	TransliterationIAST  string            `json:"transliteration_iast,omitempty"`
	Rishi                string            `json:"rishi,omitempty"`
	Devata               string            `json:"devata,omitempty"`
	Chhandas             string            `json:"chhandas,omitempty"`
	Svara                string            `json:"svara,omitempty"`
	Gana                 string            `json:"gana,omitempty"`
	Ganaparva            string            `json:"ganaparva,omitempty"`
	RigvedaRef           string            `json:"rigveda_ref,omitempty"`
	YajurvedaRef         string            `json:"yajurveda_ref,omitempty"`
	AtharvavedaRef       string            `json:"atharvaveda_ref,omitempty"`
	IsRepetition         int               `json:"is_repetition"`
	WordMeanings         []VedaWordMeaning `json:"word_meanings"`
	Bhashyas             []VedaBhashya     `json:"bhashyas"`
}
