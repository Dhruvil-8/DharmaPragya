package api

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"unicode"

	"dharmapragya/internal/models"
	"dharmapragya/internal/storage"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type Handler struct {
	db          *storage.Storage
	genaiClient *genai.Client
}

func NewHandler(db *storage.Storage) *Handler {
	apiKey := os.Getenv("GOOGLE_API_KEY")
	var client *genai.Client
	if apiKey != "" {
		c, err := genai.NewClient(context.Background(), option.WithAPIKey(apiKey))
		if err == nil {
			client = c
		} else {
			log.Printf("Warning: failed to initialize persistent Gemini client: %v", err)
		}
	}
	return &Handler{db: db, genaiClient: client}
}

func (h *Handler) Close() {
	if h.genaiClient != nil {
		_ = h.genaiClient.Close()
	}
}

func enableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-App-Token")
}

func validateToken(r *http.Request) bool {
	expected := os.Getenv("FRONTEND_SECRET")
	if expected == "" {
		expected = "dev-secret"
	}
	return r.Header.Get("X-App-Token") == expected
}

func (h *Handler) ReadVerses(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == "OPTIONS" {
		return
	}
	if !validateToken(r) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	source := r.URL.Query().Get("source")
	chapterStr := r.URL.Query().Get("chapter")
	verseStr := r.URL.Query().Get("verse")

	w.Header().Set("Content-Type", "application/json")

	if source == "" {
		sources, _ := h.db.GetSources()
		w.Header().Set("Cache-Control", "public, max-age=3600")
		json.NewEncoder(w).Encode(sources)
		return
	}

	if source != "" && chapterStr == "" {
		sources, _ := h.db.GetSources()
		var sourceID int
		for _, s := range sources {
			if s.Name == source {
				sourceID = s.ID
				break
			}
		}
		sections, err := h.db.GetSections(sourceID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Cache-Control", "public, max-age=86400")
		json.NewEncoder(w).Encode(sections)
		return
	}

	chapter, _ := strconv.Atoi(chapterStr)
	verse, _ := strconv.Atoi(verseStr)

	// Case 1: Specific Verse requested
	if verseStr != "" && verse > 0 {
		v, err := h.db.GetVerse(source, chapter, verse)
		if err != nil {
			http.Error(w, "Verse not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		json.NewEncoder(w).Encode(v)
		return
	}

	// Case 2: Entire Chapter requested (Ultra-fast direct index query)
	verses, err := h.db.GetVersesByChapter(source, chapter)
	if err != nil || len(verses) == 0 {
		http.Error(w, "Chapter not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	json.NewEncoder(w).Encode(verses)
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type AskRequest struct {
	Question     string        `json:"question"`
	Query        string        `json:"query"`
	SourceFilter string        `json:"source_filter"`
	Language     string        `json:"language"`
	History      []ChatMessage `json:"history"`
	Stream       bool          `json:"stream"`
}

type AskResponse struct {
	Answer    string         `json:"answer"`
	Citations []models.Verse `json:"citations"`
}

type FlexibleInt int

func (fi *FlexibleInt) UnmarshalJSON(b []byte) error {
	if len(b) == 0 {
		return nil
	}
	s := string(b)
	if len(s) >= 2 && s[0] == '"' && s[len(s)-1] == '"' {
		s = s[1 : len(s)-1]
	}
	if s == "" || s == "null" {
		*fi = 0
		return nil
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		return nil
	}
	*fi = FlexibleInt(n)
	return nil
}

type RouterResponse struct {
	Source  string      `json:"source"`
	Chapter FlexibleInt `json:"chapter"`
	Verse   FlexibleInt `json:"verse"`
}

type RouterPayload struct {
	Reasoning        string           `json:"reasoning"`
	IsOnTopic        bool             `json:"is_on_topic"`
	SanskritKeywords []string         `json:"sanskrit_keywords"`
	EnglishKeywords  []string         `json:"english_keywords"`
	Verses           []RouterResponse `json:"verses"`
}

func (h *Handler) SearchVerses(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == "OPTIONS" {
		return
	}
	if !validateToken(r) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	q := r.URL.Query().Get("q")
	source := r.URL.Query().Get("source")
	limitStr := r.URL.Query().Get("limit")
	limit := 15
	if limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=3600")

	if strings.TrimSpace(q) == "" {
		json.NewEncoder(w).Encode([]*models.Verse{})
		return
	}

	results, err := h.db.DirectSearch(q, source, limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if results == nil {
		results = []*models.Verse{}
	}

	json.NewEncoder(w).Encode(results)
}

func (h *Handler) LookupDictionaryWord(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == "OPTIONS" {
		return
	}
	if !validateToken(r) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	word := r.URL.Query().Get("word")
	if strings.TrimSpace(word) == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]models.DictionaryEntry{})
		return
	}

	entries, err := h.db.LookupWord(word)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if entries == nil {
		entries = []models.DictionaryEntry{}
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=86400")
	json.NewEncoder(w).Encode(entries)
}

func (h *Handler) AskAI(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == "OPTIONS" {
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if !validateToken(r) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req AskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if req.Question == "" && req.Query != "" {
		req.Question = req.Query
	}

	isStreaming := req.Stream || strings.Contains(r.Header.Get("Accept"), "text/event-stream")
	var flusher http.Flusher
	if isStreaming {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("X-Accel-Buffering", "no")
		if f, ok := w.(http.Flusher); ok {
			flusher = f
			flusher.Flush()
		}
	} else {
		w.Header().Set("Content-Type", "application/json")
	}

	sendSSE := func(eventType string, data interface{}) {
		if !isStreaming {
			return
		}
		b, err := json.Marshal(data)
		if err != nil {
			return
		}
		fmt.Fprintf(w, "event: %s\ndata: %s\n\n", eventType, string(b))
		if flusher != nil {
			flusher.Flush()
		}
	}

	sendSSE("status", map[string]string{"status": "routing", "message": "Analyzing query and routing sacred scriptures..."})

	apiKey := os.Getenv("GOOGLE_API_KEY")
	if apiKey == "" {
		if isStreaming {
			sendSSE("error", map[string]string{"error": "GOOGLE_API_KEY not set"})
		} else {
			http.Error(w, "GOOGLE_API_KEY not set", http.StatusInternalServerError)
		}
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Minute)
	defer cancel()

	client := h.genaiClient
	var localClient *genai.Client
	if client == nil {
		var err error
		localClient, err = genai.NewClient(ctx, option.WithAPIKey(apiKey))
		if err != nil {
			if isStreaming {
				sendSSE("error", map[string]string{"error": err.Error()})
			} else {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
			return
		}
		defer localClient.Close()
		client = localClient
	}

	modelName := os.Getenv("GEMINI_MODEL")
	if modelName == "" {
		modelName = "gemini-2.5-flash"
	}
	model := client.GenerativeModel(modelName)

	// Set persona as native system instructions
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text("You are an expert Sanatan Dharma scripture scholar, philologist, and router. " +
				"Your job is to analyze questions, extract canonical Sanskrit roots and English concepts, and route to authoritative verses."),
		},
	}

	// Enforce Structured JSON Schema for the router output
	model.ResponseMIMEType = "application/json"
	model.ResponseSchema = &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"reasoning": {
				Type:        genai.TypeString,
				Description: "Step-by-step pre-retrieval reasoning: Identify the core philosophical themes, doctrinal concepts, and key Sanskrit terms in the user's question.",
			},
			"is_on_topic": {
				Type:        genai.TypeBoolean,
				Description: "True if the question is related to Sanatan Dharma, spiritual life, philosophy, dharma, or scriptures; false otherwise.",
			},
			"sanskrit_keywords": {
				Type:        genai.TypeArray,
				Description: "3 to 6 canonical Sanskrit roots or words in Devanagari script (e.g. काम, क्रोध, चित्तवृत्ति, अभ्यास, वैराग्य, निष्काम, धर्म, मोक्ष, साक्षी).",
				Items: &genai.Schema{
					Type: genai.TypeString,
				},
			},
			"english_keywords": {
				Type:        genai.TypeArray,
				Description: "3 to 6 key English conceptual search words or translation phrases (e.g. anger, desire, mind control, detachment, selfless duty, witness).",
				Items: &genai.Schema{
					Type: genai.TypeString,
				},
			},
			"verses": {
				Type:        genai.TypeArray,
				Description: "Optional list of high-confidence candidate coordinates if you know the exact chapter and verse.",
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"source": {
							Type:        genai.TypeString,
							Description: "The exact scripture source name from the full corpus: 'Bhagavad Gita', 'Ashtavakra Gita', 'Avadhuta Gita', 'Devi Mahatmyam', 'Patanjali Yoga Sutras', 'Mahabharata', 'Valmiki Ramayana', 'Rigveda', 'Yajur Veda', 'Samaveda', 'Atharva Veda', any Mahapurana ('Bhagavata Purana', 'Shiva Purana', 'Devi Bhagavata Purana', 'Garuda Purana', 'Brahma Purana', 'Harivamsha Purana'), or ANY of the 108 Canonical Upanishads (e.g., 'Isha Upanishad', 'Katha Upanishad', 'Kaivalya Upanishad', 'Mandukya Upanishad', 'Chandogya Upanishad', etc.).",
						},
						"chapter": {
							Type:        genai.TypeInteger,
							Description: "The chapter number based on the specific mapping scheme.",
						},
						"verse": {
							Type:        genai.TypeInteger,
							Description: "The verse number.",
						},
					},
					Required: []string{"source", "chapter", "verse"},
				},
			},
		},
		Required: []string{"reasoning", "is_on_topic", "sanskrit_keywords", "english_keywords"},
	}

	// 1. Build Multi-Turn History Context for Router Prompt
	var historyContext strings.Builder
	if len(req.History) > 0 {
		historyContext.WriteString("\nPREVIOUS CONVERSATION CONTEXT (For follow-up understanding):\n")
		for _, msg := range req.History {
			roleName := "User"
			if msg.Role == "assistant" || msg.Role == "model" {
				roleName = "AI Scholar"
			}
			historyContext.WriteString(fmt.Sprintf("%s: %s\n", roleName, msg.Content))
		}
		historyContext.WriteString("\n")
	}

	prompt := fmt.Sprintf(`%sCurrent User Question: "%s"
Filter preference: "%s"

Analyze the question carefully and route it to relevant scriptures.

1. Cross-Lingual Concept Translation:
   - Provide 3 to 6 essential Sanskrit roots and terms in Devanagari script (e.g., काम, क्रोध, चित्त, निरोध, साक्षी, आत्मन्, धर्म).
   - Provide 3 to 6 English conceptual search terms/phrases.

2. If you know the EXACT chapter and verse with high confidence, provide it in the "verses" array.

SOURCE FILTERING RULE:
- If the "Filter preference" above is a specific scripture name (e.g., "Ashtavakra Gita", "Avadhuta Gita", "Devi Mahatmyam", "Mahabharata", "Valmiki Ramayana", "Shiva Purana", "Isha Upanishad", "Katha Upanishad", "Patanjali Yoga Sutras"), you MUST ONLY route and return terms/verses from that specific scripture.
- If the "Filter preference" is "All Gitas" or "Gitas", you MUST route to relevant Gitas ("Bhagavad Gita", "Ashtavakra Gita", "Avadhuta Gita").
- If the "Filter preference" is "All Puranas" or "Puranas", you MUST route to relevant Puranas ("Bhagavata Purana", "Shiva Purana", "Devi Bhagavata Purana", "Garuda Purana", "Brahma Purana", "Harivamsha Purana", "Devi Mahatmyam").
- If the "Filter preference" is "All Upanishads" or "Upanishad", you MUST route to relevant Upanishads (e.g., "Isha Upanishad", "Katha Upanishad", "Chandogya Upanishad", "Brihadaranyaka Upanishad", "Mundaka Upanishad", "Mandukya Upanishad", etc.).
- If the "Filter preference" is "All 4 Vedas" or "Vedas", you MUST route to relevant Vedas ("Rigveda", "Yajur Veda", "Samaveda", "Atharva Veda").
- If the "Filter preference" is "All" or empty, you are free to suggest relevant terms/verses from any available scripture.

MAPPING SCHEME FOR CHAPTER NUMBERS:
- "Bhagavad Gita": Chapters are numbered 1 to 18.
- "Ashtavakra Gita": Chapters are numbered 1 to 20 directly.
- "Avadhuta Gita": Chapters are numbered 1 to 8 directly.
- "Devi Mahatmyam": Chapters (Adhyayas) are numbered 1 to 13 directly.
- "Rigveda": Calculate chapter as (Mandala * 1000) + Hymn. E.g., Mandala 1, Hymn 164 is chapter 1164. Mandala 10, Hymn 129 is chapter 10129.
- "Mahabharata": Calculate chapter as (Parva * 1000) + Adhyaya. E.g., Adi Parva (Parva 1), Adhyaya 1 is chapter 1001. Bhishma Parva (Parva 6), Adhyaya 25 is chapter 6025.
- "Valmiki Ramayana": Calculate chapter as (Kanda * 1000) + Sarga. E.g., Balakanda (Kanda 1), Sarga 1 is chapter 1001. Yuddhakanda (Kanda 6), Sarga 128 is chapter 6128.
- "Atharva Veda": Calculate chapter as (Kaanda * 1000) + Sukta. E.g., Kaanda 1, Sukta 1 is chapter 1001. Kaanda 20, Sukta 143 is chapter 20143.
- "Yajur Veda": Chapters/Adhyayas are numbered 1 to 40 directly.
- "Patanjali Yoga Sutras": Chapters (Padas) are numbered 1 to 4 directly.
- "Puranas" ("Shiva Purana", "Bhagavata Purana", "Garuda Purana", "Brahma Purana", "Devi Bhagavata Purana", "Harivamsha Purana"): Adhyayas / Chapters are numbered directly as indexed.
- Upanishads: For all 108 Upanishads (e.g., "Isha Upanishad", "Katha Upanishad", "Kaivalya Upanishad", "Mandukya Upanishad", "Muktikopanishad", etc.), chapter is ALWAYS 1.`, historyContext.String(), req.Question, req.SourceFilter)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		if isStreaming {
			sendSSE("error", map[string]string{"error": err.Error()})
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		if isStreaming {
			sendSSE("error", map[string]string{"error": "Failed to route: Empty AI candidate response"})
		} else {
			http.Error(w, "Failed to route: Empty AI candidate response", http.StatusInternalServerError)
		}
		return
	}

	routerText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	routerText = strings.TrimPrefix(routerText, "```json")
	routerText = strings.TrimPrefix(routerText, "```")
	routerText = strings.TrimSuffix(routerText, "```")
	routerText = strings.TrimSpace(routerText)

	var payload RouterPayload
	err = json.Unmarshal([]byte(routerText), &payload)
	if err != nil {
		log.Printf("Router JSON parse error: %v, text: %s", err, routerText)
		payload.IsOnTopic = true
		words := strings.Fields(req.Question)
		for _, w := range words {
			if len(w) > 3 {
				payload.EnglishKeywords = append(payload.EnglishKeywords, w)
			}
		}
	} else {
		log.Printf("[AskAI Router reasoning]: %s", payload.Reasoning)
	}

	// Strong Programmatic Guardrail: Decline immediately if off-topic
	if !payload.IsOnTopic {
		offTopicMsg := "I couldn't find any relevant verses in the scriptures for your question. Please ask a question related to spiritual life, duty, philosophy, or the scriptures."
		if isStreaming {
			sendSSE("chunk", map[string]string{"text": offTopicMsg})
			sendSSE("citations", map[string]interface{}{"citations": []models.Verse{}})
			sendSSE("done", map[string]string{"status": "completed"})
		} else {
			json.NewEncoder(w).Encode(AskResponse{
				Answer:    offTopicMsg,
				Citations: []models.Verse{},
			})
		}
		return
	}

	// 2. Fetch Context using Hybrid Coordinate + FTS5 Search
	var fetchedVerses []*models.Verse
	seenVerseIDs := make(map[int]bool)

	qLower := strings.ToLower(req.Question)
	isSpecificVerseInquiry := strings.Contains(qLower, "specifically for") ||
		strings.Contains(qLower, "chapter") ||
		strings.Contains(qLower, "verse") ||
		strings.Contains(qLower, "mantra") ||
		strings.Contains(qLower, "shloka") ||
		strings.Contains(qLower, "meaning of")

	// A. First try exact coordinates if predicted
	for _, route := range payload.Verses {
		v, err := h.db.GetVerse(route.Source, int(route.Chapter), int(route.Verse))
		if err == nil && v != nil && !seenVerseIDs[v.ID] {
			seenVerseIDs[v.ID] = true
			fetchedVerses = append(fetchedVerses, v)
		}
	}

	// If a specific verse inquiry already retrieved the exact verse, keep ONLY that target verse!
	if !(isSpecificVerseInquiry && len(fetchedVerses) > 0) {
		// B. Supplemental / Fallback FTS5 Search using user question keywords + Sanskrit & English keywords
		ftsLimit := 5
		if len(fetchedVerses) > 0 {
			ftsLimit = 2
		}

		// Extract meaningful keywords from user's authentic question
		var questionKeywords []string
		stopWords := map[string]bool{"what": true, "where": true, "when": true, "which": true, "who": true, "whom": true, "this": true, "that": true, "from": true, "with": true, "about": true, "does": true, "tell": true, "explain": true, "give": true, "have": true, "into": true, "onto": true, "your": true, "some": true}
		for _, w := range strings.Fields(req.Question) {
			clean := strings.ToLower(strings.Trim(w, `?,.!":;'"-`))
			if len(clean) > 2 && !stopWords[clean] {
				questionKeywords = append(questionKeywords, clean)
			}
		}

		combinedEnglish := append([]string{}, payload.EnglishKeywords...)
		combinedEnglish = append(combinedEnglish, questionKeywords...)

		ftsMatches, err := h.db.SearchVersesFTS(req.SourceFilter, payload.SanskritKeywords, combinedEnglish, ftsLimit)
		if err == nil {
			for _, v := range ftsMatches {
				maxAllowed := 5
				if isSpecificVerseInquiry {
					maxAllowed = 1
				}
				if v != nil && !seenVerseIDs[v.ID] && len(fetchedVerses) < maxAllowed {
					seenVerseIDs[v.ID] = true
					fetchedVerses = append(fetchedVerses, v)
				}
			}
		}
	}

	// If no verses were retrieved
	if len(fetchedVerses) == 0 {
		noVerseMsg := "I couldn't find any relevant verses in the scriptures for your question. Please ask a question related to spiritual life, duty, philosophy, or the scriptures."
		if isStreaming {
			sendSSE("chunk", map[string]string{"text": noVerseMsg})
			sendSSE("citations", map[string]interface{}{"citations": []models.Verse{}})
			sendSSE("done", map[string]string{"status": "completed"})
		} else {
			json.NewEncoder(w).Encode(AskResponse{
				Answer:    noVerseMsg,
				Citations: []models.Verse{},
			})
		}
		return
	}

	// Prepare citation list for client
	var citationsList []models.Verse
	for _, vPtr := range fetchedVerses {
		if vPtr != nil {
			citationsList = append(citationsList, *vPtr)
		}
	}

	if isStreaming {
		sendSSE("citations", map[string]interface{}{"citations": citationsList})
		sendSSE("status", map[string]string{"status": "synthesizing", "message": "Synthesizing sacred wisdom..."})
	}

	var contextBuilder strings.Builder
	for vIdx, v := range fetchedVerses {
		var details strings.Builder
		details.WriteString(fmt.Sprintf("=== Retrieved Verse Index: %d ===\n", vIdx))
		details.WriteString(fmt.Sprintf("Source: %s, Chapter/Section: %d, Verse: %d\n", v.SourceName, v.ChapterNumber, v.VerseNumber))
		details.WriteString(fmt.Sprintf("Sanskrit: %s\n", v.SanskritText))
		details.WriteString(fmt.Sprintf("Transliteration: %s\n", v.Transliteration))
		details.WriteString(fmt.Sprintf("Word Meanings: %s\n", v.WordMeanings))
		details.WriteString("Translations:\n")
		for _, t := range v.Translations {
			details.WriteString(fmt.Sprintf("- [%s (%s)]: %s\n", t.Author, t.Language, t.Text))
		}
		details.WriteString("Commentaries:\n")
		for _, c := range v.Commentaries {
			details.WriteString(fmt.Sprintf("- [%s (%s)]: %s\n", c.Author, c.Language, c.Text))
		}
		contextBuilder.WriteString(details.String())
		contextBuilder.WriteString("\n---\n")
	}

	// Canonical Sanskrit Lexicon Grounding (Apte 1890 & Monier-Williams 1899)
	var lexiconBuilder strings.Builder
	seenTokens := make(map[string]bool)
	stopWords := map[string]bool{
		"च": true, "तु": true, "हि": true, "वा": true, "न": true, "अपि": true, "एव": true,
		"तत्": true, "यत्": true, "ते": true, "मे": true, "सः": true, "त्वम्": true, "अहम्": true,
		"इति": true, "तथा": true, "यथा": true,
	}

	for _, v := range fetchedVerses {
		if v == nil || v.SanskritText == "" {
			continue
		}
		rawWords := strings.FieldsFunc(v.SanskritText, func(r rune) bool {
			return unicode.IsSpace(r) || r == '।' || r == '॥' || r == ',' || r == '.' || r == '-' || r == ';'
		})
		for _, rw := range rawWords {
			cleanDeva := strings.Map(func(r rune) rune {
				if r >= 0x0900 && r <= 0x097F {
					return r
				}
				return -1
			}, rw)
			runes := []rune(cleanDeva)
			if len(runes) < 3 || stopWords[cleanDeva] || seenTokens[cleanDeva] {
				continue
			}
			seenTokens[cleanDeva] = true
			entries, err := h.db.LookupWord(cleanDeva)
			if err == nil && len(entries) > 0 {
				e := entries[0]
				defPreview := e.Definition
				if len(defPreview) > 200 {
					defPreview = defPreview[:200] + "..."
				}
				lexiconBuilder.WriteString(fmt.Sprintf("- **%s** [%s]: %s\n", e.Headword, e.Source, defPreview))
			}
			if len(seenTokens) >= 6 {
				break
			}
		}
		if len(seenTokens) >= 6 {
			break
		}
	}
	lexiconGrounding := lexiconBuilder.String()
	if lexiconGrounding != "" {
		contextBuilder.WriteString("\n### CANONICAL SANSKRIT LEXICON GROUNDING (Apte 1890 & Monier-Williams 1899):\n")
		contextBuilder.WriteString(lexiconGrounding)
		contextBuilder.WriteString("\n---\n")
	}

	// Map incoming language codes to display names
	langNames := map[string]string{
		"english":  "English",
		"hindi":    "Hindi",
		"gujarati": "Gujarati",
		"marathi":  "Marathi",
		"tamil":    "Tamil",
		"telugu":   "Telugu",
		"bengali":  "Bengali",
		"kannada":  "Kannada",
	}
	targetLang := "English"
	if val, exists := langNames[strings.ToLower(req.Language)]; exists {
		targetLang = val
	}

	var langInstruction string
	if strings.ToLower(targetLang) != "english" {
		langInstruction = fmt.Sprintf("\n=======================================================\n🚨 MANDATORY RESPONSE LANGUAGE: %s (%s)\n1. YOU MUST WRITE THE ENTIRE RESPONSE IN THE %s LANGUAGE.\n2. All explanations, summaries, commentaries, and headers must be in %s.\n3. Do NOT reproduce full Sanskrit verses (they are displayed in the UI scripture cards). Mention key Sanskrit conceptual terms in parentheses where helpful.\n4. DO NOT OUTPUT IN ENGLISH.\n=======================================================\n", strings.ToUpper(targetLang), targetLang, targetLang, targetLang)
	}

	// Build Synthesis Prompt
	var synthPrompt strings.Builder
	synthPrompt.WriteString("You are DharmaPragya — a warm, wise, and enlightened Vedic mentor having a direct, personal conversation with a seeker. You converse naturally with heartfelt clarity, serene depth, and authentic compassion.\n")
	if langInstruction != "" {
		synthPrompt.WriteString(langInstruction)
	}
	if len(req.History) > 0 {
		synthPrompt.WriteString("\nONGOING CONVERSATION THREAD:\n")
		for _, msg := range req.History {
			role := "Seeker"
			if msg.Role == "assistant" || msg.Role == "model" {
				role = "Dharma Guide"
			}
			synthPrompt.WriteString(fmt.Sprintf("%s: %s\n", role, msg.Content))
		}
	}
	synthPrompt.WriteString(fmt.Sprintf(`
Current Seeker Question: "%s"

Retrieved Sacred Scripture Context:
%s

MANDATORY RULES FOR NATURAL CONVERSATIONAL DIALOGUE & DYNAMIC LENGTH:

1. TALK LIKE A REAL CONVERSATION, NOT AN ESSAY:
   - Speak directly to the seeker with warmth and natural cadence, like a mentor answering in a living room.
   - NEVER use formulaic filler (do NOT say: "In the sacred tradition of Sanatan Dharma...", "This is a profound question...", "According to the scriptures provided...").
   - Jump straight to the direct answer in the very first sentence.

2. DYNAMICALLY SCALE ANSWER LENGTH BASED ON THE QUESTION (STRICT REQUIREMENT):
   Answer length MUST match the seeker's question type. Never default to a long essay!

   • TIER 1 — QUICK FACT, DEFINITION, NAME, OR DIRECT QUESTION (e.g. "Who was Sanjaya?", "What does Sthitaprajna mean?", "Which chapter is Gita 2.47?", "Who wrote Ramayana?"):
     → EXACT LENGTH: 1 to 3 direct sentences (one compact paragraph under 60 words).
     → Answer immediately and STOP. Do NOT add history lessons, do NOT explain other verses, do NOT add section headers, and do NOT add "Explore Further". Keep it crisp, warm, and conversational.

   • TIER 2 — CONVERSATIONAL FOLLOW-UP OR CLARIFICATION (e.g. "Can you explain that more simply?", "Why did Krishna say that?", "What does that look like in daily life?"):
     → EXACT LENGTH: 1 to 2 short conversational paragraphs (under 120 words). Continue the dialogue naturally without repeating what you already explained.

   • TIER 3 — PRACTICAL LIFE DILEMMA OR GUIDANCE (e.g. "How to overcome anger at work?", "How to deal with anxiety about the future?"):
     → EXACT LENGTH: 2 to 3 warm, conversational paragraphs or 3 crisp actionable takeaways (around 150-200 words). Focus on practical, compassionate spiritual clarity.

   • TIER 4 — DEEP PHILOSOPHICAL OR COMPARATIVE TREATISE (e.g. "Compare Advaita and Vishishtadvaita on Jiva and Brahman", "Explain the 4 states of consciousness in Mandukya Upanishad"):
     → EXACT LENGTH: Comprehensive, structured, and insightful exposition (250-400 words). Use clean markdown formatting only when explaining multiple stages or schools.

3. SCRIPTURAL CITATIONS:
   - Naturally mention the scripture name and coordinate in conversation (e.g. "As Sri Krishna says in Bhagavad Gita 2.47...", "The Isha Upanishad opens with...").
   - NEVER mention "database", "retrieved verses", or technical system terms.

4. EXPLORE FURTHER FOLLOW-UPS:
   - For TIER 1 (quick facts / definitions): DO NOT include "Explore Further". Keep the message clean and concise.
   - For TIER 2, 3, and 4: Conclude with 2 to 3 natural conversational questions formatted strictly as:
---
**Explore Further:**
- *[Conversational question]*
- *[Conversational question]*

5. GUARDRAIL: If the question is completely off-topic from spirituality, dharma, ethics, or Indian philosophy, decline politely in 1 sentence.
%s
`, req.Question, contextBuilder.String(), langInstruction))

	if isStreaming {
		// Streaming mode: Generate markdown stream directly
		synthModel := client.GenerativeModel(modelName)
		iter := synthModel.GenerateContentStream(ctx, genai.Text(synthPrompt.String()))
		for {
			chunkResp, err := iter.Next()
			if err == iterator.Done || err == io.EOF {
				break
			}
			if err != nil {
				if strings.Contains(err.Error(), "looking for beginning of value") {
					break
				}
				log.Printf("Synthesis streaming error: %v", err)
				sendSSE("error", map[string]string{"error": fmt.Sprintf("Synthesis streaming error: %v", err)})
				break
			}
			for _, cand := range chunkResp.Candidates {
				if cand.Content != nil {
					for _, part := range cand.Content.Parts {
						txt := fmt.Sprintf("%v", part)
						if txt != "" {
							sendSSE("chunk", map[string]string{"text": txt})
						}
					}
				}
			}
		}
		sendSSE("done", map[string]string{"status": "completed"})
		return
	}

	// Non-streaming fallback: Structured JSON schema verification
	synthModel := client.GenerativeModel(modelName)
	synthModel.ResponseMIMEType = "application/json"
	synthModel.ResponseSchema = &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"answer": {
				Type:        genai.TypeString,
				Description: "A natural, conversational markdown response whose length dynamically matches the question complexity (short for facts, medium for practical guidance, detailed for deep philosophy).",
			},
			"verified_citation_indices": {
				Type:        genai.TypeArray,
				Description: "The 0-indexed list of indices of the retrieved verses that were confirmed to be correct and relevant. Exclude any index that was irrelevant or off-topic.",
				Items: &genai.Schema{
					Type: genai.TypeInteger,
				},
			},
		},
		Required: []string{"answer", "verified_citation_indices"},
	}

	synthResp, err := synthModel.GenerateContent(ctx, genai.Text(synthPrompt.String()))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if len(synthResp.Candidates) == 0 || len(synthResp.Candidates[0].Content.Parts) == 0 {
		http.Error(w, "Failed to synthesize: Empty AI candidate response", http.StatusInternalServerError)
		return
	}

	synthText := fmt.Sprintf("%v", synthResp.Candidates[0].Content.Parts[0])
	synthText = strings.TrimPrefix(synthText, "```json")
	synthText = strings.TrimPrefix(synthText, "```")
	synthText = strings.TrimSuffix(synthText, "```")
	synthText = strings.TrimSpace(synthText)

	type SynthPayload struct {
		Answer                  string `json:"answer"`
		VerifiedCitationIndices []int  `json:"verified_citation_indices"`
	}

	var synthPayload SynthPayload
	err = json.Unmarshal([]byte(synthText), &synthPayload)
	if err != nil {
		log.Printf("Synthesis JSON parse error: %v, text: %s", err, synthText)
		json.NewEncoder(w).Encode(AskResponse{
			Answer:    synthText,
			Citations: citationsList,
		})
		return
	}

	var verifiedCitations []models.Verse
	for _, idx := range synthPayload.VerifiedCitationIndices {
		if idx >= 0 && idx < len(fetchedVerses) {
			verifiedCitations = append(verifiedCitations, *fetchedVerses[idx])
		}
	}

	if len(verifiedCitations) == 0 && len(fetchedVerses) > 0 {
		verifiedCitations = append(verifiedCitations, *fetchedVerses[0])
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AskResponse{
		Answer:    synthPayload.Answer,
		Citations: verifiedCitations,
	})
}

func (h *Handler) ReadVedas(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == "OPTIONS" {
		return
	}
	if !validateToken(r) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	veda := r.URL.Query().Get("veda")
	div1Str := r.URL.Query().Get("div1")
	div2Str := r.URL.Query().Get("div2")

	w.Header().Set("Content-Type", "application/json")

	if veda == "" {
		vedas, err := h.db.GetVedas()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Cache-Control", "public, max-age=86400")
		json.NewEncoder(w).Encode(vedas)
		return
	}

	if veda != "" && div1Str == "" {
		sections, err := h.db.GetVedaSections(veda)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Cache-Control", "public, max-age=86400")
		json.NewEncoder(w).Encode(sections)
		return
	}

	div1, _ := strconv.Atoi(div1Str)
	div2, _ := strconv.Atoi(div2Str)

	mantras, err := h.db.GetVedaMantras(veda, div1, div2)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	json.NewEncoder(w).Encode(mantras)
}

func (h *Handler) SearchVedas(w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == "OPTIONS" {
		return
	}
	if !validateToken(r) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	q := r.URL.Query().Get("q")
	veda := r.URL.Query().Get("veda")
	limitStr := r.URL.Query().Get("limit")
	limit := 15
	if limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=3600")

	if strings.TrimSpace(q) == "" {
		json.NewEncoder(w).Encode([]models.VedaMantra{})
		return
	}

	results, err := h.db.SearchVedas(q, veda, limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if results == nil {
		results = []models.VedaMantra{}
	}

	json.NewEncoder(w).Encode(results)
}
