FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy dependency files and download
COPY backend/go.mod backend/go.sum ./backend/
RUN cd backend && go mod download

# Copy the entire backend and raw data (audio)
COPY backend/ ./backend/
COPY raw_data/ ./raw_data/

# Build the Go application
RUN cd backend && CGO_ENABLED=0 GOOS=linux go build -o /app/dharmapragya-backend ./cmd/server/main.go

# Final minimal image
FROM alpine:latest

WORKDIR /app

# Copy the built binary
COPY --from=builder /app/dharmapragya-backend .

# Copy the database and audio files
COPY --from=builder /app/backend/data ./backend/data
COPY --from=builder /app/raw_data ./raw_data

# Expose Hugging Face's default port
EXPOSE 8080

# The Go app expects to be run from the backend directory to resolve relative paths
# like "./data/scriptures.db" and "../raw_data/gita/audio"
WORKDIR /app/backend
CMD ["../dharmapragya-backend"]
