package main

import (
	"archive/zip"
	"compress/gzip"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"dharmapragya/internal/api"
	"dharmapragya/internal/storage"

	"github.com/joho/godotenv"
)

type gzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

func (w gzipResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func gzipMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			next(w, r)
			return
		}
		w.Header().Set("Content-Encoding", "gzip")
		gz := gzip.NewWriter(w)
		defer gz.Close()
		gzw := gzipResponseWriter{Writer: gz, ResponseWriter: w}
		next(gzw, r)
	}
}

func ensureUnpacked(dbPath, zipPath string) {
	if _, err := os.Stat(dbPath); err == nil {
		return // DB file already exists
	}
	if _, err := os.Stat(zipPath); os.IsNotExist(err) {
		return
	}
	log.Printf("Unpacking %s -> %s for first-time startup...", zipPath, dbPath)
	r, err := zip.OpenReader(zipPath)
	if err != nil {
		log.Printf("Warning: could not open zip %s: %v", zipPath, err)
		return
	}
	defer r.Close()

	for _, f := range r.File {
		if strings.HasSuffix(f.Name, ".db") {
			rc, err := f.Open()
			if err != nil {
				log.Printf("Warning: could not read %s: %v", f.Name, err)
				continue
			}
			out, err := os.OpenFile(dbPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
			if err != nil {
				rc.Close()
				log.Printf("Warning: could not create %s: %v", dbPath, err)
				continue
			}
			_, _ = io.Copy(out, rc)
			out.Close()
			rc.Close()
			log.Printf("Successfully unpacked %s", dbPath)
			break
		}
	}
}

func main() {
	_ = godotenv.Load()
	dbPath := "./data/scriptures.db"
	vedasDBPath := "./data/vedas.db"

	ensureUnpacked(dbPath, "./data/scriptures.zip")
	ensureUnpacked(vedasDBPath, "./data/vedas.zip")

	db, err := storage.NewSQLiteStorage(dbPath, vedasDBPath)
	if err != nil {
		log.Fatalf("Failed to open databases: %v", err)
	}
	defer db.Close()

	handler := api.NewHandler(db)

	http.HandleFunc("/api/read", gzipMiddleware(handler.ReadVerses))
	http.HandleFunc("/api/search", gzipMiddleware(handler.SearchVerses))
	http.HandleFunc("/api/veda/read", gzipMiddleware(handler.ReadVedas))
	http.HandleFunc("/api/veda/search", gzipMiddleware(handler.SearchVedas))
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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server listening on :%s (scriptures.db + vedas.db active)\n", port)
	if err := http.ListenAndServe(":" + port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
