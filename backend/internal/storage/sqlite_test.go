package storage

import (
	"testing"
)

func TestSearchVersesFTS(t *testing.T) {
	s, err := NewSQLiteStorage("../../data/scriptures.db")
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}
	defer s.Close()

	// Test 1: Sanskrit keywords in Gita
	results, err := s.SearchVersesFTS("Bhagavad Gita", []string{"कर्म", "अधिकार"}, nil, 3)
	if err != nil {
		t.Fatalf("FTS search failed: %v", err)
	}
	if len(results) == 0 {
		t.Fatalf("Expected results for Sanskrit search, got 0")
	}
	t.Logf("Found %d results for Sanskrit search. Top verse: %s Ch %d V %d -> %s",
		len(results), results[0].SourceName, results[0].ChapterNumber, results[0].VerseNumber, results[0].SanskritText)

	// Test 2: English keywords in Yoga Sutras
	results2, err := s.SearchVersesFTS("Patanjali Yoga Sutras", nil, []string{"vibrations", "non-operation"}, 3)
	if err != nil {
		t.Fatalf("FTS search failed: %v", err)
	}
	if len(results2) == 0 {
		t.Fatalf("Expected results for English search, got 0")
	}
	t.Logf("Found %d results for English search. Top verse: %s Ch %d V %d",
		len(results2), results2[0].SourceName, results2[0].ChapterNumber, results2[0].VerseNumber)

	// Test 3: Sanskrit keywords in Mahabharata (Sanskrit only)
	results3, err := s.SearchVersesFTS("Mahabharata", []string{"काम", "उपभोग", "शाम्यति"}, nil, 3)
	if err != nil {
		t.Fatalf("FTS search failed: %v", err)
	}
	if len(results3) == 0 {
		t.Fatalf("Expected results for Mahabharata search, got 0")
	}
	t.Logf("Found %d results for Mahabharata search. Top verse: %s Ch %d V %d",
		len(results3), results3[0].SourceName, results3[0].ChapterNumber, results3[0].VerseNumber)
}

func TestDirectSearch(t *testing.T) {
	s, err := NewSQLiteStorage("../../data/scriptures.db")
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}
	defer s.Close()

	// 1. Test coordinate search: "2.47"
	coordResults, err := s.DirectSearch("2.47", "", 5)
	if err != nil {
		t.Fatalf("DirectSearch coordinate failed: %v", err)
	}
	if len(coordResults) == 0 {
		t.Fatalf("Expected coordinate results for 2.47, got 0")
	}
	t.Logf("Coordinate search 2.47 found: %s Ch %d V %d -> %s",
		coordResults[0].SourceName, coordResults[0].ChapterNumber, coordResults[0].VerseNumber, coordResults[0].SanskritText)

	// 2. Test keyword search: "duty"
	keywordResults, err := s.DirectSearch("duty", "Bhagavad Gita", 5)
	if err != nil {
		t.Fatalf("DirectSearch keyword failed: %v", err)
	}
	if len(keywordResults) == 0 {
		t.Fatalf("Expected keyword results for duty, got 0")
	}
	t.Logf("Keyword search 'duty' found %d results. Top: %s Ch %d V %d",
		len(keywordResults), keywordResults[0].SourceName, keywordResults[0].ChapterNumber, keywordResults[0].VerseNumber)
}

