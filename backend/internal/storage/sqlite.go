package storage

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"unicode"

	"dharmapragya/internal/models"

	_ "modernc.org/sqlite"
)

type Storage struct {
	db *sql.DB
}

func NewSQLiteStorage(dbPath string) (*Storage, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	// Enable WAL mode for significantly better read concurrency
	if _, err := db.Exec("PRAGMA journal_mode=WAL;"); err != nil {
		return nil, fmt.Errorf("failed to enable WAL mode: %w", err)
	}

	// Configure connection pooling
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)

	if err := db.Ping(); err != nil {
		return nil, err
	}

	// Create indexes if they don't exist to speed up joins and lookups
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_verses_section_id ON verses(section_id);",
		"CREATE INDEX IF NOT EXISTS idx_translations_verse_id ON translations(verse_id);",
		"CREATE INDEX IF NOT EXISTS idx_commentaries_verse_id ON commentaries(verse_id);",
		"CREATE INDEX IF NOT EXISTS idx_sections_source_id_chap ON sections(source_id, chapter_number);",
	}
	for _, idxQuery := range indexes {
		if _, err := db.Exec(idxQuery); err != nil {
			return nil, fmt.Errorf("failed to create index: %w", err)
		}
	}

	s := &Storage{db: db}

	// Ensure FTS5 index exists
	s.ensureFTSIndex()

	return s, nil
}

func (s *Storage) ensureFTSIndex() {
	var count int
	err := s.db.QueryRow("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='verses_fts'").Scan(&count)
	if err == nil && count > 0 {
		return
	}

	// Create FTS5 virtual table if it doesn't exist
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
	return s.db.Close()
}

func (s *Storage) GetSources() ([]models.Source, error) {
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
	return sources, nil
}

func (s *Storage) GetSections(sourceID int) ([]models.Section, error) {
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
	return sections, nil
}

func (s *Storage) GetVersesBySection(sectionID int) ([]models.Verse, error) {
	query := `
		SELECT v.id, v.section_id, v.verse_number, COALESCE(v.sanskrit_text, ''), COALESCE(v.transliteration, ''), COALESCE(v.word_meanings, ''), src.name, sec.chapter_name, sec.chapter_number
		FROM verses v
		JOIN sections sec ON v.section_id = sec.id
		JOIN sources src ON sec.source_id = src.id
		WHERE v.section_id = ?
	`
	rows, err := s.db.Query(query, sectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var verses []models.Verse
	verseMap := make(map[int]*models.Verse)
	for rows.Next() {
		var v models.Verse
		err := rows.Scan(&v.ID, &v.SectionID, &v.VerseNumber, &v.SanskritText, &v.Transliteration, &v.WordMeanings, &v.SourceName, &v.ChapterName, &v.ChapterNumber)
		if err != nil {
			return nil, err
		}
		
		// Initialize empty slices so JSON encoder doesn't output null
		v.Translations = []models.Translation{}
		v.Commentaries = []models.Commentary{}

		verses = append(verses, v)
	}

	if len(verses) == 0 {
		return verses, nil
	}

	// Map IDs to pointers of the elements inside the slice
	for i := range verses {
		verseMap[verses[i].ID] = &verses[i]
	}

	// Batch query all translations for this section
	tQuery := `
		SELECT t.verse_id, t.language, t.text, t.author
		FROM translations t
		JOIN verses v ON t.verse_id = v.id
		WHERE v.section_id = ?
	`
	tRows, err := s.db.Query(tQuery, sectionID)
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

	// Batch query all commentaries for this section
	cQuery := `
		SELECT c.verse_id, c.language, c.text, c.author
		FROM commentaries c
		JOIN verses v ON c.verse_id = v.id
		WHERE v.section_id = ?
	`
	cRows, err := s.db.Query(cQuery, sectionID)
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

func (s *Storage) GetVerse(sourceName string, chapterNumber int, verseNumber int) (*models.Verse, error) {
	query := `
		SELECT v.id, v.section_id, v.verse_number, COALESCE(v.sanskrit_text, ''), COALESCE(v.transliteration, ''), COALESCE(v.word_meanings, ''), src.name, sec.chapter_name, sec.chapter_number
		FROM verses v
		JOIN sections sec ON v.section_id = sec.id
		JOIN sources src ON sec.source_id = src.id
		WHERE src.name = ? AND sec.chapter_number = ? AND v.verse_number = ?
	`
	row := s.db.QueryRow(query, sourceName, chapterNumber, verseNumber)

	var v models.Verse
	err := row.Scan(&v.ID, &v.SectionID, &v.VerseNumber, &v.SanskritText, &v.Transliteration, &v.WordMeanings, &v.SourceName, &v.ChapterName, &v.ChapterNumber)
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
			tRows.Scan(&t.Language, &t.Text, &t.Author)
			v.Translations = append(v.Translations, t)
		}
	}

	cRows, err := s.db.Query("SELECT language, text, author FROM commentaries WHERE verse_id = ?", v.ID)
	if err == nil {
		defer cRows.Close()
		for cRows.Next() {
			var c models.Commentary
			cRows.Scan(&c.Language, &c.Text, &c.Author)
			v.Commentaries = append(v.Commentaries, c)
		}
	}

	return &v, nil
}

func (s *Storage) GetVerseByID(verseID int) (*models.Verse, error) {
	query := `
		SELECT v.id, v.section_id, v.verse_number, COALESCE(v.sanskrit_text, ''), COALESCE(v.transliteration, ''), COALESCE(v.word_meanings, ''), src.name, sec.chapter_name, sec.chapter_number
		FROM verses v
		JOIN sections sec ON v.section_id = sec.id
		JOIN sources src ON sec.source_id = src.id
		WHERE v.id = ?
	`
	row := s.db.QueryRow(query, verseID)

	var v models.Verse
	err := row.Scan(&v.ID, &v.SectionID, &v.VerseNumber, &v.SanskritText, &v.Transliteration, &v.WordMeanings, &v.SourceName, &v.ChapterName, &v.ChapterNumber)
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
			tRows.Scan(&t.Language, &t.Text, &t.Author)
			v.Translations = append(v.Translations, t)
		}
	}

	cRows, err := s.db.Query("SELECT language, text, author FROM commentaries WHERE verse_id = ?", v.ID)
	if err == nil {
		defer cRows.Close()
		for cRows.Next() {
			var c models.Commentary
			cRows.Scan(&c.Language, &c.Text, &c.Author)
			v.Commentaries = append(v.Commentaries, c)
		}
	}

	return &v, nil
}

func sanitizeToken(t string) string {
	var sb strings.Builder
	for _, r := range t {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			sb.WriteRune(r)
		}
	}
	return sb.String()
}

func (s *Storage) SearchVersesFTS(sourceFilter string, sanskritTerms []string, englishTerms []string, limit int) ([]*models.Verse, error) {
	var matchClauses []string

	var sanTokens []string
	for _, t := range sanskritTerms {
		cleaned := sanitizeToken(t)
		if len(cleaned) > 0 {
			sanTokens = append(sanTokens, fmt.Sprintf(`"%s"*`, cleaned))
		}
	}
	if len(sanTokens) > 0 {
		matchClauses = append(matchClauses, fmt.Sprintf("sanskrit_text: (%s)", strings.Join(sanTokens, " OR ")))
	}

	var engTokens []string
	for _, t := range englishTerms {
		cleaned := sanitizeToken(t)
		if len(cleaned) > 0 {
			engTokens = append(engTokens, fmt.Sprintf(`"%s"*`, cleaned))
		}
	}
	if len(engTokens) > 0 {
		matchClauses = append(matchClauses, fmt.Sprintf("english_text: (%s)", strings.Join(engTokens, " OR ")))
	}

	if len(matchClauses) == 0 {
		return nil, nil
	}

	matchQuery := strings.Join(matchClauses, " OR ")

	query := `
		SELECT verse_id 
		FROM verses_fts 
		WHERE verses_fts MATCH ?
	`
	var args []interface{}
	args = append(args, matchQuery)

	if sourceFilter != "" && !strings.EqualFold(sourceFilter, "all") {
		if strings.EqualFold(sourceFilter, "upanishad") {
			query += " AND source_name LIKE '%Upanishad%'"
		} else {
			query += " AND source_name = ?"
			args = append(args, sourceFilter)
		}
	}

	query += " ORDER BY rank LIMIT ?"
	if limit <= 0 {
		limit = 5
	}
	args = append(args, limit)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var verseIDs []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err == nil {
			verseIDs = append(verseIDs, id)
		}
	}

	var verses []*models.Verse
	for _, id := range verseIDs {
		v, err := s.GetVerseByID(id)
		if err == nil && v != nil {
			verses = append(verses, v)
		}
	}

	return verses, nil
}

func parseCoordinates(query string) (string, int, int, bool) {
	q := strings.TrimSpace(query)
	
	// Check for pattern like "2.47" or "2:47"
	parts := strings.FieldsFunc(q, func(r rune) bool {
		return r == '.' || r == ':' || r == ' ' || r == '/' || r == '-'
	})
	
	if len(parts) == 2 {
		ch, err1 := strconv.Atoi(parts[0])
		v, err2 := strconv.Atoi(parts[1])
		if err1 == nil && err2 == nil && ch > 0 && v > 0 {
			return "", ch, v, true
		}
	} else if len(parts) >= 3 {
		// e.g. "Gita 2 47" or "Gita 2.47"
		ch, err1 := strconv.Atoi(parts[len(parts)-2])
		v, err2 := strconv.Atoi(parts[len(parts)-1])
		if err1 == nil && err2 == nil && ch > 0 && v > 0 {
			srcName := strings.Join(parts[:len(parts)-2], " ")
			return srcName, ch, v, true
		}
	}
	return "", 0, 0, false
}

func (s *Storage) DirectSearch(query string, sourceFilter string, limit int) ([]*models.Verse, error) {
	if limit <= 0 {
		limit = 15
	}
	trimmed := strings.TrimSpace(query)
	if trimmed == "" {
		return nil, nil
	}

	var results []*models.Verse
	seenIDs := make(map[int]bool)

	// 1. Coordinate lookup check
	srcHint, ch, v, isCoord := parseCoordinates(trimmed)
	if isCoord {
		var candidateSources []string
		if sourceFilter != "" && !strings.EqualFold(sourceFilter, "all") {
			candidateSources = append(candidateSources, sourceFilter)
		} else if srcHint != "" {
			// Try to match srcHint to sources
			sources, _ := s.GetSources()
			for _, src := range sources {
				if strings.Contains(strings.ToLower(src.Name), strings.ToLower(srcHint)) {
					candidateSources = append(candidateSources, src.Name)
				}
			}
		} else {
			candidateSources = []string{"Bhagavad Gita", "Patanjali Yoga Sutras", "Isha Upanishad", "Rigveda"}
		}

		for _, src := range candidateSources {
			verse, err := s.GetVerse(src, ch, v)
			if err == nil && verse != nil && !seenIDs[verse.ID] {
				seenIDs[verse.ID] = true
				results = append(results, verse)
				if len(results) >= limit {
					return results, nil
				}
			}
		}
	}

	// 2. Full-Text Search across FTS5 table
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

	matchQuery := strings.Join(tokens, " AND ")

	sqlQuery := `
		SELECT verse_id 
		FROM verses_fts 
		WHERE verses_fts MATCH ?
	`
	var args []interface{}
	args = append(args, matchQuery)

	if sourceFilter != "" && !strings.EqualFold(sourceFilter, "all") {
		if strings.EqualFold(sourceFilter, "upanishad") {
			sqlQuery += " AND source_name LIKE '%Upanishad%'"
		} else {
			sqlQuery += " AND source_name = ?"
			args = append(args, sourceFilter)
		}
	}

	sqlQuery += " ORDER BY rank LIMIT ?"
	args = append(args, limit)

	rows, err := s.db.Query(sqlQuery, args...)
	if err != nil {
		// Fallback to OR query if AND query returns error or no matches
		orMatchQuery := strings.Join(tokens, " OR ")
		args[0] = orMatchQuery
		rows, err = s.db.Query(sqlQuery, args...)
		if err != nil {
			return results, nil
		}
	}
	defer rows.Close()

	var verseIDs []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err == nil {
			verseIDs = append(verseIDs, id)
		}
	}

	for _, id := range verseIDs {
		if seenIDs[id] {
			continue
		}
		verse, err := s.GetVerseByID(id)
		if err == nil && verse != nil {
			seenIDs[id] = true
			results = append(results, verse)
			if len(results) >= limit {
				break
			}
		}
	}

	return results, nil
}

