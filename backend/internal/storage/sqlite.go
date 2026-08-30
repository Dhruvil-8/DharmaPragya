package storage

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"unicode"

	"dharmapragya/internal/models"

	_ "modernc.org/sqlite"
)

type Storage struct {
	db           *sql.DB
	vedasDB      *sql.DB
	sourcesCache []models.Source
	vedasCache   []models.VedaInfo
	sectionsMap  map[int][]models.Section
	cacheMu      sync.RWMutex
}

func NewSQLiteStorage(scripturesDBPath string, vedasDBPath string) (*Storage, error) {
	db, err := sql.Open("sqlite", scripturesDBPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open scriptures db: %w", err)
	}

	pragmas := []string{
		"PRAGMA journal_mode=WAL;",
		"PRAGMA synchronous=NORMAL;",
		"PRAGMA mmap_size=536870912;", // 512MB Memory-Mapped I/O for zero-copy reads
		"PRAGMA cache_size=-131072;",  // 128MB RAM Page Cache
		"PRAGMA temp_store=MEMORY;",   // In-memory temporary tables
		"PRAGMA busy_timeout=5000;",
	}
	for _, p := range pragmas {
		_, _ = db.Exec(p)
	}

	db.SetMaxOpenConns(50)
	db.SetMaxIdleConns(50)

	if err := db.Ping(); err != nil {
		return nil, err
	}

	var vDB *sql.DB
	if vedasDBPath != "" {
		vDB, err = sql.Open("sqlite", vedasDBPath)
		if err == nil {
			vPragmas := []string{
				"PRAGMA journal_mode=WAL;",
				"PRAGMA synchronous=NORMAL;",
				"PRAGMA mmap_size=536870912;",
				"PRAGMA cache_size=-65536;", // 64MB RAM Page Cache
				"PRAGMA temp_store=MEMORY;",
				"PRAGMA busy_timeout=5000;",
			}
			for _, p := range vPragmas {
				_, _ = vDB.Exec(p)
			}
			vDB.SetMaxOpenConns(50)
			vDB.SetMaxIdleConns(50)
			_ = vDB.Ping()

			vIndexes := []string{
				"CREATE INDEX IF NOT EXISTS idx_mantras_veda_divs ON mantras(veda_id, division_1, division_2, division_3);",
				"CREATE INDEX IF NOT EXISTS idx_mantras_div1_div2 ON mantras(veda_id, division_1, division_2);",
				"CREATE INDEX IF NOT EXISTS idx_mantras_krama ON mantras(krama_number);",
				"CREATE INDEX IF NOT EXISTS idx_bhashyas_mantra ON bhashyas(mantra_id);",
				"CREATE INDEX IF NOT EXISTS idx_word_meanings_mantra ON word_meanings(mantra_id);",
				"CREATE INDEX IF NOT EXISTS idx_sections_veda ON sections(veda_id, section_number);",
			}
			for _, vIdx := range vIndexes {
				_, _ = vDB.Exec(vIdx)
			}
		}
	}

	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_sources_name ON sources(name);",
		"CREATE INDEX IF NOT EXISTS idx_sources_name_nocase ON sources(name COLLATE NOCASE);",
		"CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(type);",
		"CREATE INDEX IF NOT EXISTS idx_verses_section_id ON verses(section_id);",
		"CREATE INDEX IF NOT EXISTS idx_verses_section_verse ON verses(section_id, verse_number);",
		"CREATE INDEX IF NOT EXISTS idx_translations_verse_id ON translations(verse_id);",
		"CREATE INDEX IF NOT EXISTS idx_commentaries_verse_id ON commentaries(verse_id);",
		"CREATE INDEX IF NOT EXISTS idx_sections_source_id_chap ON sections(source_id, chapter_number);",
	}
	for _, idxQuery := range indexes {
		if _, err := db.Exec(idxQuery); err != nil {
			return nil, fmt.Errorf("failed to create index: %w", err)
		}
	}

	s := &Storage{
		db:          db,
		vedasDB:     vDB,
		sectionsMap: make(map[int][]models.Section),
	}
	s.ensureFTSIndex()

	return s, nil
}

func (s *Storage) ensureFTSIndex() {
	var count int
	err := s.db.QueryRow("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='verses_fts'").Scan(&count)
	if err == nil && count > 0 {
		return
	}

	_, _ = s.db.Exec(`
		CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(
			verse_id UNINDEXED,
			sanskrit_text,
			transliteration,
			english_text,
			source_name,
			chapter_number UNINDEXED,
			verse_number UNINDEXED,
			tokenize='unicode61 remove_diacritics 2'
		);
	`)

	_, _ = s.db.Exec(`
		INSERT INTO verses_fts (verse_id, sanskrit_text, transliteration, english_text, source_name, chapter_number, verse_number)
		SELECT 
			v.id,
			COALESCE(v.sanskrit_text, ''),
			COALESCE(v.transliteration, ''),
			COALESCE(GROUP_CONCAT(t.text, ' '), ''),
			src.name,
			s.chapter_number,
			v.verse_number
		FROM verses v
		JOIN sections s ON v.section_id = s.id
		JOIN sources src ON s.source_id = src.id
		LEFT JOIN translations t ON t.verse_id = v.id
		GROUP BY v.id;
	`)
}

func (s *Storage) Close() error {
	if s.vedasDB != nil {
		_ = s.vedasDB.Close()
	}
	return s.db.Close()
}

// -------------------------------------------------------------
// SCRIPTURES.DB METHODS
// -------------------------------------------------------------

func (s *Storage) GetSources() ([]models.Source, error) {
	s.cacheMu.RLock()
	if len(s.sourcesCache) > 0 {
		cached := make([]models.Source, len(s.sourcesCache))
		copy(cached, s.sourcesCache)
		s.cacheMu.RUnlock()
		return cached, nil
	}
	s.cacheMu.RUnlock()

	rows, err := s.db.Query("SELECT id, name, type FROM sources")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sources []models.Source
	for rows.Next() {
		var src models.Source
		rows.Scan(&src.ID, &src.Name, &src.Type)
		sources = append(sources, src)
	}

	s.cacheMu.Lock()
	s.sourcesCache = sources
	s.cacheMu.Unlock()

	return sources, nil
}

func (s *Storage) GetSections(sourceID int) ([]models.Section, error) {
	s.cacheMu.RLock()
	if secs, ok := s.sectionsMap[sourceID]; ok {
		cached := make([]models.Section, len(secs))
		copy(cached, secs)
		s.cacheMu.RUnlock()
		return cached, nil
	}
	s.cacheMu.RUnlock()

	rows, err := s.db.Query("SELECT id, source_id, chapter_number, chapter_name FROM sections WHERE source_id = ?", sourceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sections []models.Section
	for rows.Next() {
		var sec models.Section
		rows.Scan(&sec.ID, &sec.SourceID, &sec.ChapterNumber, &sec.ChapterName)
		sections = append(sections, sec)
	}

	s.cacheMu.Lock()
	s.sectionsMap[sourceID] = sections
	s.cacheMu.Unlock()

	return sections, nil
}

func (s *Storage) GetVersesByChapter(sourceName string, chapterNumber int) ([]models.Verse, error) {
	query := `
		SELECT v.id, v.section_id, v.verse_number, COALESCE(v.sanskrit_text, ''), COALESCE(v.transliteration, ''), COALESCE(v.word_meanings, ''), src.name, sec.chapter_name, sec.chapter_number
		FROM sections sec
		JOIN sources src ON sec.source_id = src.id
		JOIN verses v ON v.section_id = sec.id
		WHERE LOWER(src.name) = LOWER(?) AND sec.chapter_number = ?
		ORDER BY v.verse_number ASC
	`
	rows, err := s.db.Query(query, sourceName, chapterNumber)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var verses []models.Verse
	var verseIDs []interface{}
	verseMap := make(map[int]*models.Verse)
	for rows.Next() {
		var v models.Verse
		err := rows.Scan(&v.ID, &v.SectionID, &v.VerseNumber, &v.SanskritText, &v.Transliteration, &v.WordMeanings, &v.SourceName, &v.ChapterName, &v.ChapterNumber)
		if err != nil {
			return nil, err
		}
		v.Translations = []models.Translation{}
		v.Commentaries = []models.Commentary{}
		verses = append(verses, v)
	}

	if len(verses) == 0 {
		return verses, nil
	}

	for i := range verses {
		verseMap[verses[i].ID] = &verses[i]
		verseIDs = append(verseIDs, verses[i].ID)
	}

	// Fetch translations with indexed IN query
	placeholders := strings.Repeat("?,", len(verseIDs))
	placeholders = placeholders[:len(placeholders)-1]

	tQuery := fmt.Sprintf("SELECT verse_id, language, text, author FROM translations WHERE verse_id IN (%s)", placeholders)
	tRows, err := s.db.Query(tQuery, verseIDs...)
	if err == nil {
		defer tRows.Close()
		for tRows.Next() {
			var verseID int
			var t models.Translation
			if err := tRows.Scan(&verseID, &t.Language, &t.Text, &t.Author); err == nil {
				if vPtr, exists := verseMap[verseID]; exists {
					vPtr.Translations = append(vPtr.Translations, t)
				}
			}
		}
	}

	cQuery := fmt.Sprintf("SELECT verse_id, language, text, author FROM commentaries WHERE verse_id IN (%s)", placeholders)
	cRows, err := s.db.Query(cQuery, verseIDs...)
	if err == nil {
		defer cRows.Close()
		for cRows.Next() {
			var verseID int
			var c models.Commentary
			if err := cRows.Scan(&verseID, &c.Language, &c.Text, &c.Author); err == nil {
				if vPtr, exists := verseMap[verseID]; exists {
					vPtr.Commentaries = append(vPtr.Commentaries, c)
				}
			}
		}
	}

	return verses, nil
}

func (s *Storage) GetVersesBySection(sectionID int) ([]models.Verse, error) {
	query := `
		SELECT v.id, v.section_id, v.verse_number, COALESCE(v.sanskrit_text, ''), COALESCE(v.transliteration, ''), COALESCE(v.word_meanings, ''), src.name, sec.chapter_name, sec.chapter_number
		FROM verses v
		JOIN sections sec ON v.section_id = sec.id
		JOIN sources src ON sec.source_id = src.id
		WHERE v.section_id = ?
		ORDER BY v.verse_number ASC
	`
	rows, err := s.db.Query(query, sectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var verses []models.Verse
	var verseIDs []interface{}
	verseMap := make(map[int]*models.Verse)
	for rows.Next() {
		var v models.Verse
		err := rows.Scan(&v.ID, &v.SectionID, &v.VerseNumber, &v.SanskritText, &v.Transliteration, &v.WordMeanings, &v.SourceName, &v.ChapterName, &v.ChapterNumber)
		if err != nil {
			return nil, err
		}
		
		v.Translations = []models.Translation{}
		v.Commentaries = []models.Commentary{}
		verses = append(verses, v)
	}

	if len(verses) == 0 {
		return verses, nil
	}

	for i := range verses {
		verseMap[verses[i].ID] = &verses[i]
		verseIDs = append(verseIDs, verses[i].ID)
	}

	placeholders := strings.Repeat("?,", len(verseIDs))
	placeholders = placeholders[:len(placeholders)-1]

	tQuery := fmt.Sprintf("SELECT verse_id, language, text, author FROM translations WHERE verse_id IN (%s)", placeholders)
	tRows, err := s.db.Query(tQuery, verseIDs...)
	if err == nil {
		defer tRows.Close()
		for tRows.Next() {
			var verseID int
			var t models.Translation
			if err := tRows.Scan(&verseID, &t.Language, &t.Text, &t.Author); err == nil {
				if vPtr, exists := verseMap[verseID]; exists {
					vPtr.Translations = append(vPtr.Translations, t)
				}
			}
		}
	}

	cQuery := fmt.Sprintf("SELECT verse_id, language, text, author FROM commentaries WHERE verse_id IN (%s)", placeholders)
	cRows, err := s.db.Query(cQuery, verseIDs...)
	if err == nil {
		defer cRows.Close()
		for cRows.Next() {
			var verseID int
			var c models.Commentary
			if err := cRows.Scan(&verseID, &c.Language, &c.Text, &c.Author); err == nil {
				if vPtr, exists := verseMap[verseID]; exists {
					vPtr.Commentaries = append(vPtr.Commentaries, c)
				}
			}
		}
	}

	return verses, nil
}

func (s *Storage) GetVerseByID(id int) (*models.Verse, error) {
	query := `
		SELECT v.id, v.section_id, v.verse_number, COALESCE(v.sanskrit_text, ''), COALESCE(v.transliteration, ''), COALESCE(v.word_meanings, ''), src.name, sec.chapter_name, sec.chapter_number
		FROM verses v
		JOIN sections sec ON v.section_id = sec.id
		JOIN sources src ON sec.source_id = src.id
		WHERE v.id = ?
	`
	var v models.Verse
	err := s.db.QueryRow(query, id).Scan(&v.ID, &v.SectionID, &v.VerseNumber, &v.SanskritText, &v.Transliteration, &v.WordMeanings, &v.SourceName, &v.ChapterName, &v.ChapterNumber)
	if err != nil {
		return nil, err
	}

	v.Translations = []models.Translation{}
	v.Commentaries = []models.Commentary{}

	tRows, err := s.db.Query("SELECT language, text, author FROM translations WHERE verse_id = ?", id)
	if err == nil {
		defer tRows.Close()
		for tRows.Next() {
			var t models.Translation
			if err := tRows.Scan(&t.Language, &t.Text, &t.Author); err == nil {
				v.Translations = append(v.Translations, t)
			}
		}
	}

	cRows, err := s.db.Query("SELECT language, text, author FROM commentaries WHERE verse_id = ?", id)
	if err == nil {
		defer cRows.Close()
		for cRows.Next() {
			var c models.Commentary
			if err := cRows.Scan(&c.Language, &c.Text, &c.Author); err == nil {
				v.Commentaries = append(v.Commentaries, c)
			}
		}
	}

	return &v, nil
}

func (s *Storage) GetVersesByIDs(ids []int) ([]*models.Verse, error) {
	if len(ids) == 0 {
		return []*models.Verse{}, nil
	}

	placeholders := strings.Repeat("?,", len(ids))
	placeholders = placeholders[:len(placeholders)-1]

	var idArgs []interface{}
	for _, id := range ids {
		idArgs = append(idArgs, id)
	}

	query := fmt.Sprintf(`
		SELECT v.id, v.section_id, v.verse_number, COALESCE(v.sanskrit_text, ''), COALESCE(v.transliteration, ''), COALESCE(v.word_meanings, ''), src.name, sec.chapter_name, sec.chapter_number
		FROM verses v
		JOIN sections sec ON v.section_id = sec.id
		JOIN sources src ON sec.source_id = src.id
		WHERE v.id IN (%s)
	`, placeholders)

	rows, err := s.db.Query(query, idArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	verseMap := make(map[int]*models.Verse)
	for rows.Next() {
		var v models.Verse
		err := rows.Scan(&v.ID, &v.SectionID, &v.VerseNumber, &v.SanskritText, &v.Transliteration, &v.WordMeanings, &v.SourceName, &v.ChapterName, &v.ChapterNumber)
		if err != nil {
			return nil, err
		}
		v.Translations = []models.Translation{}
		v.Commentaries = []models.Commentary{}
		verseCopy := v
		verseMap[v.ID] = &verseCopy
	}

	// Fetch translations for all verses in 1 batched query
	tQuery := fmt.Sprintf("SELECT verse_id, language, text, author FROM translations WHERE verse_id IN (%s)", placeholders)
	tRows, err := s.db.Query(tQuery, idArgs...)
	if err == nil {
		defer tRows.Close()
		for tRows.Next() {
			var verseID int
			var t models.Translation
			if err := tRows.Scan(&verseID, &t.Language, &t.Text, &t.Author); err == nil {
				if vPtr, exists := verseMap[verseID]; exists {
					vPtr.Translations = append(vPtr.Translations, t)
				}
			}
		}
	}

	// Fetch commentaries for all verses in 1 batched query
	cQuery := fmt.Sprintf("SELECT verse_id, language, text, author FROM commentaries WHERE verse_id IN (%s)", placeholders)
	cRows, err := s.db.Query(cQuery, idArgs...)
	if err == nil {
		defer cRows.Close()
		for cRows.Next() {
			var verseID int
			var c models.Commentary
			if err := cRows.Scan(&verseID, &c.Language, &c.Text, &c.Author); err == nil {
				if vPtr, exists := verseMap[verseID]; exists {
					vPtr.Commentaries = append(vPtr.Commentaries, c)
				}
			}
		}
	}

	// Preserve the original ranking order
	var orderedResults []*models.Verse
	for _, id := range ids {
		if v, exists := verseMap[id]; exists {
			orderedResults = append(orderedResults, v)
		}
	}

	return orderedResults, nil
}

func (s *Storage) GetVerseByCoordinate(sourceName string, chapterNumber, verseNumber int) (*models.Verse, error) {
	query := `
		SELECT v.id, v.section_id, v.verse_number, COALESCE(v.sanskrit_text, ''), COALESCE(v.transliteration, ''), COALESCE(v.word_meanings, ''), src.name, sec.chapter_name, sec.chapter_number
		FROM verses v
		JOIN sections sec ON v.section_id = sec.id
		JOIN sources src ON sec.source_id = src.id
		WHERE LOWER(src.name) = LOWER(?) AND sec.chapter_number = ? AND v.verse_number = ?
		LIMIT 1
	`
	var v models.Verse
	err := s.db.QueryRow(query, sourceName, chapterNumber, verseNumber).Scan(&v.ID, &v.SectionID, &v.VerseNumber, &v.SanskritText, &v.Transliteration, &v.WordMeanings, &v.SourceName, &v.ChapterName, &v.ChapterNumber)
	if err != nil {
		return nil, err
	}

	v.Translations = []models.Translation{}
	v.Commentaries = []models.Commentary{}

	tRows, err := s.db.Query("SELECT language, text, author FROM translations WHERE verse_id = ?", v.ID)
	if err == nil {
		defer tRows.Close()
		for tRows.Next() {
			var t models.Translation
			if err := tRows.Scan(&t.Language, &t.Text, &t.Author); err == nil {
				v.Translations = append(v.Translations, t)
			}
		}
	}

	cRows, err := s.db.Query("SELECT language, text, author FROM commentaries WHERE verse_id = ?", v.ID)
	if err == nil {
		defer cRows.Close()
		for cRows.Next() {
			var c models.Commentary
			if err := cRows.Scan(&c.Language, &c.Text, &c.Author); err == nil {
				v.Commentaries = append(v.Commentaries, c)
			}
		}
	}

	return &v, nil
}

func (s *Storage) GetVerse(sourceName string, chapterNumber, verseNumber int) (*models.Verse, error) {
	return s.GetVerseByCoordinate(sourceName, chapterNumber, verseNumber)
}

func sanitizeToken(t string) string {
	var b strings.Builder
	for _, r := range t {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func (s *Storage) SearchVerses(query string, sourceFilter string, limit int) ([]*models.Verse, error) {
	if limit <= 0 {
		limit = 5
	}
	trimmed := strings.TrimSpace(query)
	if trimmed == "" {
		return []*models.Verse{}, nil
	}

	var results []*models.Verse
	seenIDs := make(map[int]bool)

	// Coordinate Search
	parts := strings.Split(trimmed, ".")
	if len(parts) == 2 {
		chStr := strings.TrimSpace(parts[0])
		vStr := strings.TrimSpace(parts[1])

		subParts := strings.Fields(chStr)
		targetSource := sourceFilter
		if len(subParts) > 1 {
			targetSource = strings.Join(subParts[:len(subParts)-1], " ")
			chStr = subParts[len(subParts)-1]
		}

		chNum, err1 := strconv.Atoi(chStr)
		vNum, err2 := strconv.Atoi(vStr)
		if err1 == nil && err2 == nil {
			if targetSource == "" || strings.EqualFold(targetSource, "all") {
				targetSource = "Bhagavad Gita"
			}
			verse, err := s.GetVerseByCoordinate(targetSource, chNum, vNum)
			if err == nil && verse != nil {
				seenIDs[verse.ID] = true
				results = append(results, verse)
				if len(results) >= limit {
					return results, nil
				}
			}
		}
	}

	// FTS5 Full-Text Search
	words := strings.Fields(trimmed)
	var tokens []string
	for _, w := range words {
		cleaned := sanitizeToken(w)
		if len(cleaned) > 0 {
			tokens = append(tokens, fmt.Sprintf(`"%s"*`, cleaned))
		}
	}

	if len(tokens) == 0 {
		return results, nil
	}

	buildFTSQuery := func(matchOperator string) (string, []interface{}) {
		matchQuery := strings.Join(tokens, fmt.Sprintf(" %s ", matchOperator))
		sql := `
			SELECT verse_id 
			FROM verses_fts 
			WHERE verses_fts MATCH ?
		`
		var qArgs []interface{}
		qArgs = append(qArgs, matchQuery)

		if sourceFilter != "" && !strings.EqualFold(sourceFilter, "all") {
			sfLower := strings.ToLower(strings.TrimSpace(sourceFilter))
			if strings.Contains(sfLower, "upanishad") {
				sql += " AND source_name LIKE '%Upanishad%'"
			} else if strings.Contains(sfLower, "purana") {
				sql += " AND source_name LIKE '%Purana%'"
			} else if strings.Contains(sfLower, "veda") {
				sql += " AND (source_name LIKE '%Veda%' OR source_name LIKE '%Rigveda%' OR source_name LIKE '%Samaveda%')"
			} else {
				sql += " AND (LOWER(source_name) = ? OR source_name LIKE ?)"
				qArgs = append(qArgs, sfLower, "%"+sourceFilter+"%")
			}
		}

		sql += " ORDER BY rank LIMIT ?"
		qArgs = append(qArgs, limit)
		return sql, qArgs
	}

	// Try AND match if few tokens (<= 2), otherwise or as fallback use OR match
	var verseIDs []int
	if len(tokens) <= 2 {
		andSQL, andArgs := buildFTSQuery("AND")
		rows, err := s.db.Query(andSQL, andArgs...)
		if err == nil {
			for rows.Next() {
				var id int
				if err := rows.Scan(&id); err == nil {
					verseIDs = append(verseIDs, id)
				}
			}
			rows.Close()
		}
	}

	if len(verseIDs) == 0 {
		orSQL, orArgs := buildFTSQuery("OR")
		rows, err := s.db.Query(orSQL, orArgs...)
		if err == nil {
			for rows.Next() {
				var id int
				if err := rows.Scan(&id); err == nil {
					verseIDs = append(verseIDs, id)
				}
			}
			rows.Close()
		}
	}

	var idsToFetch []int
	for _, id := range verseIDs {
		if !seenIDs[id] {
			idsToFetch = append(idsToFetch, id)
			if len(results)+len(idsToFetch) >= limit {
				break
			}
		}
	}

	if len(idsToFetch) > 0 {
		fetchedVerses, err := s.GetVersesByIDs(idsToFetch)
		if err == nil {
			for _, v := range fetchedVerses {
				if !seenIDs[v.ID] {
					seenIDs[v.ID] = true
					results = append(results, v)
				}
			}
		}
	}

	return results, nil
}

func (s *Storage) DirectSearch(query string, sourceFilter string, limit int) ([]*models.Verse, error) {
	return s.SearchVerses(query, sourceFilter, limit)
}

func (s *Storage) SearchVersesFTS(sourceFilter string, sanskritKeywords []string, englishKeywords []string, limit int) ([]*models.Verse, error) {
	var tokens []string
	tokens = append(tokens, sanskritKeywords...)
	tokens = append(tokens, englishKeywords...)
	if len(tokens) == 0 {
		return []*models.Verse{}, nil
	}
	return s.SearchVerses(strings.Join(tokens, " "), sourceFilter, limit)
}


// -------------------------------------------------------------
// DEDICATED VEDAS.DB METHODS
// -------------------------------------------------------------

func (s *Storage) GetVedas() ([]models.VedaInfo, error) {
	if s.vedasDB == nil {
		return nil, fmt.Errorf("vedas database not connected")
	}

	s.cacheMu.RLock()
	if len(s.vedasCache) > 0 {
		cached := make([]models.VedaInfo, len(s.vedasCache))
		copy(cached, s.vedasCache)
		s.cacheMu.RUnlock()
		return cached, nil
	}
	s.cacheMu.RUnlock()

	rows, err := s.vedasDB.Query("SELECT id, name_sanskrit, name_english, shakha, total_mantras, description FROM vedas ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vedas []models.VedaInfo
	for rows.Next() {
		var v models.VedaInfo
		rows.Scan(&v.ID, &v.NameSanskrit, &v.NameEnglish, &v.Shakha, &v.TotalMantras, &v.Description)
		vedas = append(vedas, v)
	}

	s.cacheMu.Lock()
	s.vedasCache = vedas
	s.cacheMu.Unlock()

	return vedas, nil
}

func (s *Storage) GetVedaSections(vedaID string) ([]models.VedaSection, error) {
	if s.vedasDB == nil {
		return nil, fmt.Errorf("vedas database not connected")
	}
	rows, err := s.vedasDB.Query(`
		SELECT id, veda_id, section_type, section_number, section_name, total_subdivisions, total_mantras 
		FROM sections 
		WHERE veda_id = ? 
		ORDER BY section_number
	`, vedaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sections []models.VedaSection
	for rows.Next() {
		var sec models.VedaSection
		rows.Scan(&sec.ID, &sec.VedaID, &sec.SectionType, &sec.SectionNumber, &sec.SectionName, &sec.TotalSubdivisions, &sec.TotalMantras)
		sections = append(sections, sec)
	}
	return sections, nil
}

func (s *Storage) GetVedaMantras(vedaID string, division1 int, division2 int) ([]models.VedaMantra, error) {
	if s.vedasDB == nil {
		return nil, fmt.Errorf("vedas database not connected")
	}
	var rows *sql.Rows
	var err error

	if division2 > 0 {
		rows, err = s.vedasDB.Query(`
			SELECT 
				m.id, m.veda_id, v.name_english, m.krama_number, m.division_1, m.division_2, m.division_3, m.division_4,
				m.coordinate_str, COALESCE(m.ashtaka_coordinate, ''), COALESCE(m.kauthuma_coordinate, ''), COALESCE(m.ranayaniya_coordinate, ''),
				m.sanskrit_svara, m.sanskrit_plain, COALESCE(m.padapatha_svara, ''), COALESCE(m.padapatha_plain, ''), COALESCE(m.transliteration_iast, ''),
				COALESCE(m.rishi, ''), COALESCE(m.devata, ''), COALESCE(m.chhandas, ''), COALESCE(m.svara, ''),
				COALESCE(m.gana, ''), COALESCE(m.ganaparva, ''), COALESCE(m.rigveda_ref, ''), COALESCE(m.yajurveda_ref, ''), COALESCE(m.atharvaveda_ref, ''), m.is_repetition
			FROM mantras m
			JOIN vedas v ON m.veda_id = v.id
			WHERE m.veda_id = ? AND m.division_1 = ? AND m.division_2 = ?
			ORDER BY m.krama_number ASC
		`, vedaID, division1, division2)
	} else {
		rows, err = s.vedasDB.Query(`
			SELECT 
				m.id, m.veda_id, v.name_english, m.krama_number, m.division_1, m.division_2, m.division_3, m.division_4,
				m.coordinate_str, COALESCE(m.ashtaka_coordinate, ''), COALESCE(m.kauthuma_coordinate, ''), COALESCE(m.ranayaniya_coordinate, ''),
				m.sanskrit_svara, m.sanskrit_plain, COALESCE(m.padapatha_svara, ''), COALESCE(m.padapatha_plain, ''), COALESCE(m.transliteration_iast, ''),
				COALESCE(m.rishi, ''), COALESCE(m.devata, ''), COALESCE(m.chhandas, ''), COALESCE(m.svara, ''),
				COALESCE(m.gana, ''), COALESCE(m.ganaparva, ''), COALESCE(m.rigveda_ref, ''), COALESCE(m.yajurveda_ref, ''), COALESCE(m.atharvaveda_ref, ''), m.is_repetition
			FROM mantras m
			JOIN vedas v ON m.veda_id = v.id
			WHERE m.veda_id = ? AND m.division_1 = ?
			ORDER BY m.krama_number ASC
		`, vedaID, division1)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mantras []models.VedaMantra
	mantraMap := make(map[string]*models.VedaMantra)

	for rows.Next() {
		var m models.VedaMantra
		err := rows.Scan(
			&m.ID, &m.VedaID, &m.VedaName, &m.KramaNumber, &m.Division1, &m.Division2, &m.Division3, &m.Division4,
			&m.CoordinateStr, &m.AshtakaCoordinate, &m.KauthumaCoordinate, &m.RanayaniyaCoordinate,
			&m.SanskritSvara, &m.SanskritPlain, &m.PadapathaSvara, &m.PadapathaPlain, &m.TransliterationIAST,
			&m.Rishi, &m.Devata, &m.Chhandas, &m.Svara,
			&m.Gana, &m.Ganaparva, &m.RigvedaRef, &m.YajurvedaRef, &m.AtharvavedaRef, &m.IsRepetition,
		)
		if err != nil {
			return nil, err
		}
		m.WordMeanings = []models.VedaWordMeaning{}
		m.Bhashyas = []models.VedaBhashya{}
		mantras = append(mantras, m)
	}

	if len(mantras) == 0 {
		return mantras, nil
	}

	for i := range mantras {
		mantraMap[mantras[i].ID] = &mantras[i]
	}

	var wQuery string
	var bQuery string
	var qArgs []interface{}
	if division2 > 0 {
		wQuery = `
			SELECT wm.mantra_id, wm.commentator, wm.language, wm.padartha_text
			FROM word_meanings wm
			JOIN mantras m ON wm.mantra_id = m.id
			WHERE m.veda_id = ? AND m.division_1 = ? AND m.division_2 = ?
		`
		bQuery = `
			SELECT b.mantra_id, b.author, b.language, COALESCE(b.mantra_vishaya, ''), COALESCE(b.anvaya, ''), COALESCE(b.bhavartha, ''), COALESCE(b.tika, '')
			FROM bhashyas b
			JOIN mantras m ON b.mantra_id = m.id
			WHERE m.veda_id = ? AND m.division_1 = ? AND m.division_2 = ?
		`
		qArgs = []interface{}{vedaID, division1, division2}
	} else {
		wQuery = `
			SELECT wm.mantra_id, wm.commentator, wm.language, wm.padartha_text
			FROM word_meanings wm
			JOIN mantras m ON wm.mantra_id = m.id
			WHERE m.veda_id = ? AND m.division_1 = ?
		`
		bQuery = `
			SELECT b.mantra_id, b.author, b.language, COALESCE(b.mantra_vishaya, ''), COALESCE(b.anvaya, ''), COALESCE(b.bhavartha, ''), COALESCE(b.tika, '')
			FROM bhashyas b
			JOIN mantras m ON b.mantra_id = m.id
			WHERE m.veda_id = ? AND m.division_1 = ?
		`
		qArgs = []interface{}{vedaID, division1}
	}

	wRows, err := s.vedasDB.Query(wQuery, qArgs...)
	if err == nil {
		defer wRows.Close()
		for wRows.Next() {
			var mid string
			var wm models.VedaWordMeaning
			if err := wRows.Scan(&mid, &wm.Commentator, &wm.Language, &wm.PadarthaText); err == nil {
				if mPtr, exists := mantraMap[mid]; exists {
					mPtr.WordMeanings = append(mPtr.WordMeanings, wm)
				}
			}
		}
	}

	bRows, err := s.vedasDB.Query(bQuery, qArgs...)
	if err == nil {
		defer bRows.Close()
		for bRows.Next() {
			var mid string
			var bh models.VedaBhashya
			if err := bRows.Scan(&mid, &bh.Author, &bh.Language, &bh.MantraVishaya, &bh.Anvaya, &bh.Bhavartha, &bh.Tika); err == nil {
				if mPtr, exists := mantraMap[mid]; exists {
					mPtr.Bhashyas = append(mPtr.Bhashyas, bh)
				}
			}
		}
	}

	return mantras, nil
}

func (s *Storage) SearchVedas(query string, vedaID string, limit int) ([]models.VedaMantra, error) {
	if s.vedasDB == nil {
		return nil, fmt.Errorf("vedas database not connected")
	}
	if limit <= 0 {
		limit = 10
	}
	trimmed := strings.TrimSpace(query)
	if trimmed == "" {
		return []models.VedaMantra{}, nil
	}

	sqlQuery := `
		SELECT mantra_id
		FROM mantras_fts
		WHERE mantras_fts MATCH ?
	`
	var args []interface{}
	args = append(args, trimmed)

	if vedaID != "" && !strings.EqualFold(vedaID, "all") {
		sqlQuery += " AND veda_id = ?"
		args = append(args, vedaID)
	}

	sqlQuery += " ORDER BY rank LIMIT ?"
	args = append(args, limit)

	rows, err := s.vedasDB.Query(sqlQuery, args...)
	if err != nil {
		// Fallback to phrase prefix or individual words
		words := strings.Fields(trimmed)
		var tokens []string
		for _, w := range words {
			if len(w) > 0 {
				tokens = append(tokens, w)
			}
		}
		if len(tokens) > 0 {
			args[0] = strings.Join(tokens, " OR ")
			rows, err = s.vedasDB.Query(sqlQuery, args...)
		}
	}
	if err != nil {
		return []models.VedaMantra{}, nil
	}
	defer rows.Close()

	var mantraIDs []string
	for rows.Next() {
		var mid string
		if err := rows.Scan(&mid); err == nil {
			mantraIDs = append(mantraIDs, mid)
		}
	}

	if len(mantraIDs) == 0 {
		return []models.VedaMantra{}, nil
	}

	placeholders := strings.Repeat("?,", len(mantraIDs))
	placeholders = placeholders[:len(placeholders)-1]

	var idArgs []interface{}
	for _, mid := range mantraIDs {
		idArgs = append(idArgs, mid)
	}

	mQuery := fmt.Sprintf(`
		SELECT 
			m.id, m.veda_id, v.name_english, m.krama_number, m.division_1, m.division_2, m.division_3, m.division_4,
			m.coordinate_str, COALESCE(m.ashtaka_coordinate, ''), COALESCE(m.kauthuma_coordinate, ''), COALESCE(m.ranayaniya_coordinate, ''),
			m.sanskrit_svara, m.sanskrit_plain, COALESCE(m.padapatha_svara, ''), COALESCE(m.padapatha_plain, ''), COALESCE(m.transliteration_iast, ''),
			COALESCE(m.rishi, ''), COALESCE(m.devata, ''), COALESCE(m.chhandas, ''), COALESCE(m.svara, ''),
			COALESCE(m.gana, ''), COALESCE(m.ganaparva, ''), COALESCE(m.rigveda_ref, ''), COALESCE(m.yajurveda_ref, ''), COALESCE(m.atharvaveda_ref, ''), m.is_repetition
		FROM mantras m
		JOIN vedas v ON m.veda_id = v.id
		WHERE m.id IN (%s)
	`, placeholders)

	mRows, err := s.vedasDB.Query(mQuery, idArgs...)
	if err != nil {
		return []models.VedaMantra{}, nil
	}
	defer mRows.Close()

	mantraMap := make(map[string]*models.VedaMantra)
	for mRows.Next() {
		var m models.VedaMantra
		err := mRows.Scan(
			&m.ID, &m.VedaID, &m.VedaName, &m.KramaNumber, &m.Division1, &m.Division2, &m.Division3, &m.Division4,
			&m.CoordinateStr, &m.AshtakaCoordinate, &m.KauthumaCoordinate, &m.RanayaniyaCoordinate,
			&m.SanskritSvara, &m.SanskritPlain, &m.PadapathaSvara, &m.PadapathaPlain, &m.TransliterationIAST,
			&m.Rishi, &m.Devata, &m.Chhandas, &m.Svara,
			&m.Gana, &m.Ganaparva, &m.RigvedaRef, &m.YajurvedaRef, &m.AtharvavedaRef, &m.IsRepetition,
		)
		if err == nil {
			m.WordMeanings = []models.VedaWordMeaning{}
			m.Bhashyas = []models.VedaBhashya{}
			mCopy := m
			mantraMap[m.ID] = &mCopy
		}
	}

	// Fetch word meanings for all mantras in 1 batched query
	wQuery := fmt.Sprintf("SELECT wm.mantra_id, wm.commentator, wm.language, wm.padartha_text FROM word_meanings wm WHERE wm.mantra_id IN (%s)", placeholders)
	wRows, err := s.vedasDB.Query(wQuery, idArgs...)
	if err == nil {
		defer wRows.Close()
		for wRows.Next() {
			var mid string
			var wm models.VedaWordMeaning
			if err := wRows.Scan(&mid, &wm.Commentator, &wm.Language, &wm.PadarthaText); err == nil {
				if mPtr, exists := mantraMap[mid]; exists {
					mPtr.WordMeanings = append(mPtr.WordMeanings, wm)
				}
			}
		}
	}

	// Fetch bhashyas for all mantras in 1 batched query
	bQuery := fmt.Sprintf("SELECT b.mantra_id, b.author, b.language, COALESCE(b.mantra_vishaya, ''), COALESCE(b.anvaya, ''), COALESCE(b.bhavartha, ''), COALESCE(b.tika, '') FROM bhashyas b WHERE b.mantra_id IN (%s)", placeholders)
	bRows, err := s.vedasDB.Query(bQuery, idArgs...)
	if err == nil {
		defer bRows.Close()
		for bRows.Next() {
			var mid string
			var bh models.VedaBhashya
			if err := bRows.Scan(&mid, &bh.Author, &bh.Language, &bh.MantraVishaya, &bh.Anvaya, &bh.Bhavartha, &bh.Tika); err == nil {
				if mPtr, exists := mantraMap[mid]; exists {
					mPtr.Bhashyas = append(mPtr.Bhashyas, bh)
				}
			}
		}
	}

	// Preserve the original rank order
	var orderedMantras []models.VedaMantra
	for _, mid := range mantraIDs {
		if mPtr, exists := mantraMap[mid]; exists {
			orderedMantras = append(orderedMantras, *mPtr)
		}
	}

	return orderedMantras, nil
}


