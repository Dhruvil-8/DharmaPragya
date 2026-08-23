# DharmaPragya

**Live Site:** [dharma-pragya.vercel.app](https://dharma-pragya.vercel.app/)

DharmaPragya is a platform that allows users to explore the wisdom of Sanatan Dharma by asking questions. The system leverages AI to intelligently route questions and synthesize answers based on citations drawn directly from foundational texts like the Srimad Bhagavad Gita, the Vedas, the Upanishads, the Mahabharata, the Ramayana, and the Yoga Sutras.

**Note:** This project is an extension and scalable evolution of the original [SrimadBhgavadGita](https://github.com/Dhruvil-8/SrimadBhgavadGita) repository.

---

## Core Idea
The core idea is that anyone should be able to explore the wisdom of Sanatan Dharma by simply asking a question, with answers drawn directly from its sacred foundations: the Vedas, Puranas, and related scriptures.

---

## Key Features
- **Ask AI Mode:** Ask philosophical questions with intelligent routing across scriptures and multi-layer synthesis with verified citations.
- **Reading Mode:** Browse sacred scriptures with Devanagari Sanskrit, IAST transliteration, word-by-word Anvaya, multiple translations, and classical commentaries.
- **Authentic Recitation:** Stream authentic Sanskrit audio recitation for the Srimad Bhagavad Gita.

---

## Technology Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend:** Go (Golang), Dual SQLite Storage (`scriptures.db` + `vedas.db`), FTS5 Full-Text Search, Google Gen AI SDK (Gemini)

---

## Data Sources

The scriptures and Vedic Samhitas are stored across unified SQLite databases (`scriptures.db` and `vedas.db`). Below is the current mapping status:

| Scripture Source | Verses / Mantras | Sanskrit Text | English Translation | Hindi Translation | Commentaries / Bhashyas |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Rigveda Samhita** | 10,552 | Yes (Svara & Plain) | Yes (Griffith) | Yes (Padartha & Bhavartha) | Dayananda Saraswati, Aryamuni, Brahmamuni, Shivashankar Sharma |
| **Yajurveda Samhita** | 1,975 | Yes (Svara & Plain) | No | Yes (Dayananda) | Maharshi Dayananda Saraswati |
| **Samaveda Samhita** | 1,875 | Yes (Svara & Plain) | No | Yes (Padartha & Bhavartha) | Vishaya, Padartha, Rigveda Cross-References |
| **Atharvaveda Samhita** | 5,977 | Yes (Svara & Plain) | No | Yes (Bhavartha) | Vishaya, Bhashyartha, Bhavartha, Tippani |
| **Bhagavad Gita** | 701 | Yes | Yes (5 authors) | Yes (2 authors) | Yes (15+ classical commentators in Sanskrit, Hindi, English) |
| **Patanjali Yoga Sutras** | 196 | Yes | Yes (IGS) | No | Devanagari Sanskrit, IAST, English word meanings |
| **Mahabharata (BORI Critical Edition)** | 73,436 | Yes | No | No | Complete 18 Parvas (1,995 Adhyayas) |
| **Valmiki Ramayana (Critical Edition)** | 18,761 | Yes | No | No | Complete 6 Kandas (606 Sargas) |
| **Garuda Purana** | 11,970 | Yes | No | No | Purva Khanda (Achara) & Uttara Khanda (Preta Kalpa) — 317 Adhyayas |
| **Devi Bhagavata Mahapurana** | 18,758 | Yes | No | No | Complete 12 Skandhas (includes Devi Gita) — 105 Adhyayas |
| **Brahma Purana** | 14,052 | Yes | No | No | Complete 246 Adhyayas (Tübingen Purana Project) |
| **Shrimad Bhagavata Purana** | 15,409 | Yes | No | No | Mahatmyam & Complete 12 Skandhas — 302 Adhyayas |
| **Shiva Mahapurana** | 26,307 | Yes | No | No | Mahatmyam & Complete 7 Samhitas (12 Khandas) — 339 Adhyayas |
| **Harivamsha Purana** | 16,711 | Yes | No | No | Complete 3 Parvas (Harivamsha, Vishnu, Bhavishya) — 324 Adhyayas |
| **15 Principal Upanishads** | 2,900+ | Yes | No | No | Brihadaranyaka, Chandogya, Taittiriya, Aitareya, Isha, Kena, Katha, Prashna, Mundaka, Mandukya, Shvetashvatara, Kaushitaki, Maitri, Amritabindu, Tejobindu |

### Provenance Credits:
- **The Four Vedas**: Digitized Vedic Samhitas, Padapatha, and Bhashyas sourced from [VedaKosh.com](http://www.VedaKosh.com).
- **Bhagavad Gita**: Sourced from the open-source [Gita GitHub Project](https://github.com/gita/gita), credited to the [IIT Kanpur Gita Supersite](https://www.gitasupersite.iitk.ac.in/).
- **Mahabharata & Valmiki Ramayana**: Digitized BORI critical editions sourced from the [Bhandarkar Oriental Research Institute Electronic Text (BORI)](https://bombay.indology.info/).
- **The Mahapuranas & Upanishads**: Digitized, encoded, and structured from [Sanskrit Documents](https://sanskritdocuments.org)
- **Patanjali Yoga Sutras**: Sourced from the [International Gita Society (IGS)](https://www.gita-society.com/wp-content/uploads/PDF/Patanjali-yogasutra.IGS.pdf).

---

## Getting Started

### Prerequisites
- [Go 1.22+](https://golang.org/)
- [Node.js 18+](https://nodejs.org/)

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file with your Gemini API key:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-flash-lite-latest
   FRONTEND_SECRET=your_secret_key_here
   PORT=8080
   ```
3. Run the Go server:
   ```bash
   go run ./cmd/server/main.go
   ```
   *The server will start on `http://localhost:8080` (with `scriptures.db` + `vedas.db` active).*

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*
