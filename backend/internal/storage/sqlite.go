package storage

import (
	"database/sql"
	"fmt"

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
	return &Storage{db: db}, nil
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
		SELECT v.id, v.section_id, v.verse_number, v.sanskrit_text, v.transliteration, v.word_meanings, src.name, sec.chapter_name, sec.chapter_number
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
	for rows.Next() {
		var v models.Verse
		rows.Scan(&v.ID, &v.SectionID, &v.VerseNumber, &v.SanskritText, &v.Transliteration, &v.WordMeanings, &v.SourceName, &v.ChapterName, &v.ChapterNumber)
		
		// Load translations
		tRows, _ := s.db.Query("SELECT language, text, author FROM translations WHERE verse_id = ?", v.ID)
		if tRows != nil {
			for tRows.Next() {
				var t models.Translation
				tRows.Scan(&t.Language, &t.Text, &t.Author)
				v.Translations = append(v.Translations, t)
			}
			tRows.Close()
		}

		// Load commentaries
		cRows, _ := s.db.Query("SELECT language, text, author FROM commentaries WHERE verse_id = ?", v.ID)
		if cRows != nil {
			for cRows.Next() {
				var c models.Commentary
				cRows.Scan(&c.Language, &c.Text, &c.Author)
				v.Commentaries = append(v.Commentaries, c)
			}
			cRows.Close()
		}

		verses = append(verses, v)
	}
	return verses, nil
}

func (s *Storage) GetVerse(sourceName string, chapterNumber int, verseNumber int) (*models.Verse, error) {
	query := `
		SELECT v.id, v.section_id, v.verse_number, v.sanskrit_text, v.transliteration, v.word_meanings, src.name, sec.chapter_name, sec.chapter_number
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
