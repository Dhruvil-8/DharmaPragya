package storage

import (
	"strings"
	"testing"
)

func TestSearchVersesFTS(t *testing.T) {
	s, err := NewSQLiteStorage("../../data/scriptures.db", "../../data/vedas.db")
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
	s, err := NewSQLiteStorage("../../data/scriptures.db", "../../data/vedas.db")
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

func TestFamousHymnsLinking(t *testing.T) {
	s, err := NewSQLiteStorage("../../data/scriptures.db", "../../data/vedas.db")
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}
	defer s.Close()

	testHymns := []struct {
		name        string
		source      string
		isVeda      bool
		vedaID      string
		div1        int
		div2        int
		targetVerse int
	}{
		{"Purusha Suktam", "Rigveda", true, "rigveda", 10, 90, 1},
		{"Nasadiya Suktam", "Rigveda", true, "rigveda", 10, 129, 1},
		{"Devi Suktam", "Rigveda", true, "rigveda", 10, 125, 1},
		{"Hiranyagarbha Suktam", "Rigveda", true, "rigveda", 10, 121, 1},
		{"Gayatri Mantra", "Rigveda", true, "rigveda", 3, 62, 10},
		{"Mahamrityunjaya Mantra", "Rigveda", true, "rigveda", 7, 59, 12},
		{"Sri Rudram", "Yajur Veda", true, "yajurveda", 16, 0, 1},
		{"Asato Ma Sadgamaya", "Brihadaranyaka Upanishad", false, "", 1, 0, 28},
		{"Karmanye Vadhikaraste", "Bhagavad Gita", false, "", 2, 0, 47},
		{"Yada Yada Hi Dharmasya", "Bhagavad Gita", false, "", 4, 0, 7},
		{"Aditya Hridaya Stotram", "Valmiki Ramayana", false, "", 6105, 0, 1},
		{"Vishnu Sahasranama", "Mahabharata", false, "", 13135, 0, 1},
		{"Devi Mahatmyam", "Devi Mahatmyam", false, "", 1, 0, 1},
	}

	for _, h := range testHymns {
		t.Run(h.name, func(t *testing.T) {
			if h.isVeda {
				mantras, err := s.GetVedaMantras(h.vedaID, h.div1, h.div2)
				if err != nil {
					t.Fatalf("Failed to query Veda %s div1=%d div2=%d: %v", h.vedaID, h.div1, h.div2, err)
				}
				if len(mantras) == 0 {
					t.Fatalf("No mantras found for %s (Veda %s, div1=%d, div2=%d)", h.name, h.vedaID, h.div1, h.div2)
				}
				t.Logf("✓ %s: found %d mantras. First: %s (Krama %d, Div3 %d)",
					h.name, len(mantras), mantras[0].SanskritPlain, mantras[0].KramaNumber, mantras[0].Division3)
			} else {
				// Scripture search
				sources, _ := s.GetSources()
				var matchedSourceID int
				for _, src := range sources {
					if strings.EqualFold(src.Name, h.source) {
						matchedSourceID = src.ID
						break
					}
				}
				if matchedSourceID == 0 {
					t.Fatalf("Source not found: %s", h.source)
				}
				sections, err := s.GetSections(matchedSourceID)
				if err != nil || len(sections) == 0 {
					t.Fatalf("No sections for source %s", h.source)
				}
				var targetSecID int
				for _, sec := range sections {
					if sec.ChapterNumber == h.div1 {
						targetSecID = sec.ID
						break
					}
				}
				if targetSecID == 0 {
					t.Fatalf("Section not found for chapter %d in %s", h.div1, h.source)
				}
				verses, err := s.GetVersesBySection(targetSecID)
				if err != nil || len(verses) == 0 {
					t.Fatalf("No verses in section %d for %s", targetSecID, h.name)
				}
				t.Logf("✓ %s: found %d verses in Ch %d. Target Verse %d exists: %v",
					h.name, len(verses), h.div1, h.targetVerse, len(verses) >= h.targetVerse)
			}
		})
	}
}


