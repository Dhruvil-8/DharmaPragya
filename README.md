# DharmaPragya

DharmaPragya is a platform that allows users to explore the wisdom of Sanatan Dharma by asking questions. The system leverages AI to intelligently route questions and synthesize answers based on citations drawn directly from foundational texts like the Srimad Bhagavad Gita, the Vedas, the Upanishads, the Mahabharata, the Ramayana, and the Yoga Sutras.

**Note:** This project is an extension and scalable evolution of the original [SrimadBhgavadGita](https://github.com/Dhruvil-8/SrimadBhgavadGita) repository.

## Core Idea
The core idea is that anyone should be able to explore the wisdom of Sanatan Dharma by simply asking a question, with answers drawn directly from its sacred foundations: the Vedas, Puranas, and related scriptures.

## Why Not a Vector Database (RAG)?

Vector databases often suffer from keyword blindness, broken contextual chunking, and hallucinated citations when dealing with ancient, esoteric scriptures. Instead, this platform relies on Gemini as an intelligent router. The AI mathematically pinpoints the exact authoritative chapter and verse required to answer the question, and the Go backend fetches the **complete, unbroken verse** (along with all its translations and commentaries) from a lightning-fast SQLite database. 

## Features
- **Ask AI Mode:** Ask philosophical questions and get synthesized answers with direct verse citations.
- **Reading Mode:** Browse and read scriptures with multi-language translations and commentaries
- **Scalable Architecture:** A modern, component-based Next.js frontend paired with a high-performance Go API backend.

## Technology Stack
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Go (Golang), SQLite, Google Gen AI SDK (Gemini)
- **Ingestion:** Python

## Data Sources
The scriptures are ingested and stored inside a unified SQLite database schema. Below is the current mapping status of translations and commentaries:

| Scripture Source | Verses | Sanskrit Text | English Translation | Hindi Translation | Commentaries |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Bhagavad Gita** | 701 | Yes | Yes (5 authors) | Yes (2 authors) | Yes (15+ authors / Sanskrit, Hindi, English) |
| **Rigveda** | 10,552 | Yes | Yes (Griffith) | No | No |
| **Patanjali Yoga Sutras** | 195 | Yes | Yes (Johnston) | No | No |
| **Mahabharata** | 73,436 | Yes | No | No | No |
| **Valmiki Ramayana** | 18,761 | Yes | No | No | No |
| **Atharva Veda** | 6,190 | Yes | No | No | No |
| **Yajur Veda** | 1,967 | Yes | No | No | No |
| **15 Upanishads** | 2,900+ | Yes | No | No | No |

### Sourcing & Ingestion details:
- **Bhagavad Gita**: Ingested from the open-source [Gita GitHub Project](https://github.com/gita/gita), credited to the [IIT Kanpur Gita Supersite](https://www.gitasupersite.iitk.ac.in/).
- **Rigveda**: Ingested from the [VedaWeb Project](https://github.com/VedaWebProject/vedaweb-data).
- **Mahabharata & Valmiki Ramayana**: Digitized BORI critical editions sourced from the [Bhandarkar Oriental Research Institute Electronic Text (BORI)](https://bombay.indology.info/).
- **Atharva Veda & Yajur Veda**: Shukla Yajurveda (Madhyandina Samhita) and Atharva Veda (Shaunaka Samhita) JSON datasets sourced from [DharmicData](https://github.com/bhavykhatri/DharmicData).
- **Patanjali Yoga Sutras**: Ingested and aligned 1-to-1 from [Sanskrit Documents](https://sanskritdocuments.org/doc_yoga/yogasuutra.html) (Sanskrit) and Charles Johnston's translation from [Project Gutenberg](https://dn790000.ca.archive.org/0/items/theyogasutrasofp02526gut/patan10.txt) (English).
- **Upanishads**: Scraped and split verse-by-verse from raw HTML pages at [Sanskrit Documents](https://sanskritdocuments.org/sanskrit/upanishhat/). Includes *Brihadaranyaka, Chandogya, Taittiriya, Aitareya, Isha, Kena, Katha, Prashna, Mundaka, Mandukya, Shvetashvatara, Kaushitaki, Maitri, Amritabindu, and Tejobindu*.

## Getting Started

### Backend
1. Navigate to the `backend` directory.
2. Create a `.env` file and add your `GEMINI_API_KEY`.
3. Run the server:
   ```bash
   go run ./cmd/server/main.go
   ```
   *The API will be available at `http://localhost:8080`.*

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The site will be available at `http://localhost:3000`.*

## Limitations & Future Work
- **Data Verification:** The scriptures and datasets ingested into the platform have been parsed from various open-source archives and texts. They have not been thoroughly, manually verified verse-by-verse for absolute typographical or structural accuracy.
- **Scripture Coordinate Precision:** Direct coordinate routing leverages the LLM's internal scriptural memory. While this is highly accurate for well-known or shorter texts (like the Bhagavad Gita and Patanjali Yoga Sutras), the LLM's memory can be less precise for massive scriptures (like the 73,000+ verses of the Mahabharata or the 15 Mukhya Upanishads). This fuzzy coordinate memory can occasionally result in suggesting a verse that is slightly off-topic or doesn't exist (which the backend automatically ignores).
- **AI Hallucinations:** While the system utilizes source routing to minimize hallucinations, the AI can still make mistakes or misinterpret esoteric philosophy. The synthesized answers should be used for spiritual exploration, not as absolute dogma.
- **Future Improvements:** Future work will focus on adding multiple language translations and commentaries, improving data accuracy, expanding the repository of scriptures, and implementing a post-retrieval AI verification loop to automatically double-check and filter out coordinate routing errors before they are displayed.
