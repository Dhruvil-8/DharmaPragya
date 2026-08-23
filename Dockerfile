FROM golang:alpine AS builder

WORKDIR /app

ENV GOTOOLCHAIN=auto

# Install unzip and ca-certificates
RUN apk add --no-cache unzip ca-certificates git

# Copy dependency files and download
COPY backend/go.mod backend/go.sum ./backend/
RUN cd backend && go mod download

# Copy the backend and raw_data
COPY backend/ ./backend/
COPY raw_data/ ./raw_data/

# Unzip the databases and audio directly into their final folders (handling harmless unzip warnings)
RUN if [ -f backend/data/scriptures.zip ]; then unzip -o backend/data/scriptures.zip -d backend/data/ || [ $? -le 1 ]; rm -f backend/data/scriptures.zip; fi
RUN if [ -f backend/data/vedas.zip ]; then unzip -o backend/data/vedas.zip -d backend/data/ || [ $? -le 1 ]; rm -f backend/data/vedas.zip; fi
RUN mkdir -p raw_data/gita/
RUN if [ -f raw_data/audio.zip ]; then unzip -o raw_data/audio.zip -d raw_data/gita/ || [ $? -le 1 ]; rm -f raw_data/audio.zip; fi

# Build the Go application
RUN cd backend && go mod tidy && CGO_ENABLED=0 GOOS=linux go build -o /app/dharmapragya-backend ./cmd/server/main.go

# Final minimal image
FROM alpine:latest

WORKDIR /app

# Copy the built binary
COPY --from=builder /app/dharmapragya-backend .

# Copy the unzipped database and audio
COPY --from=builder /app/backend/data ./backend/data
COPY --from=builder /app/raw_data ./raw_data

# Expose default port
EXPOSE 7860

# The Go app expects to be run from the backend directory to resolve relative paths
WORKDIR /app/backend

ENV PORT=7860

CMD ["../dharmapragya-backend"]
