package main

import (
	"log"
	"net/http"

	"dharmapragya/internal/api"
	"dharmapragya/internal/storage"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	dbPath := "./data/scriptures.db"
	db, err := storage.NewSQLiteStorage(dbPath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	handler := api.NewHandler(db)

	http.HandleFunc("/api/read", handler.ReadVerses)
	http.HandleFunc("/api/ask", handler.AskAI)
	
	// Serve static audio files (publicly accessible for HTML5 audio streaming)
	audioHandler := http.StripPrefix("/api/audio/", http.FileServer(http.Dir("../raw_data/gita/audio")))
	http.HandleFunc("/api/audio/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Range")
		if r.Method == "OPTIONS" {
			return
		}
		audioHandler.ServeHTTP(w, r)
	})

	log.Println("Server listening on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
