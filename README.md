# DharmaPragya

**Live Site:** [dharma-pragya.vercel.app](https://dharma-pragya.vercel.app/)

DharmaPragya is a platform that allows users to explore the wisdom of Sanatan Dharma by asking questions. The system leverages AI to intelligently route questions and synthesize answers based on citations drawn directly from foundational texts like the Srimad Bhagavad Gita, the Vedas, the Upanishads, the Mahabharata, the Ramayana, and the Yoga Sutras.

**Note:** This project is an extension and scalable evolution of the original [SrimadBhgavadGita](https://github.com/Dhruvil-8/SrimadBhgavadGita) repository.

---

## Core Idea
The core idea is that anyone should be able to explore the wisdom of Sanatan Dharma by simply asking a question, with answers drawn directly from its sacred foundations: the Vedas, Puranas, and related scriptures.

---

## Key Features
- **Ask AI Mode:** Ask philosophical questions with intelligent routing across scriptures, lexical grounding with canonical dictionaries, and multi-layer synthesis with elevated Scripture Cards.
- **Reading Mode:** Browse sacred scriptures with Devanagari Sanskrit, IAST transliteration, word-by-word Anvaya, multiple translations, and classical commentaries.
- **Interactive Sanskrit Lexicon:** Double-click or tap any word in Sanskrit verses or Vedic Padapatha to instantly inspect root derivations (*dhātu*), grammatical forms, and English definitions from V. S. Apte (1890) and Monier-Williams (1899).
- **Sacred Suktams & Mantras Index (`/suktams`):** Canonical directory of 33+ verified Vedic Suktams, Maha Mantras, Upanishadic Shanti Pathas, and Puranic/Epic Stotras with precision deep-linking to exact verses in the unified database.
- **Authentic Recitation:** Stream authentic Sanskrit audio recitation for the Srimad Bhagavad Gita.

---

## Technology Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend:** Go (Golang), Triple SQLite Storage (`scriptures.db` + `vedas.db` + `dictionary.db`), FTS5 Full-Text Search, Google Gen AI SDK (Gemini)

---

## Data Sources & Provenance

The scriptures, Vedic Samhitas, and lexicons are stored across unified SQLite databases (`scriptures.db`, `vedas.db`, and `dictionary.db`). Below is the current mapping and translation status:

| Scripture Source | Verses / Mantras | Sanskrit Text | English Translation | Hindi Translation | Commentaries / Bhashyas |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Rigveda Samhita** | 10,552 | Yes (Svara & Plain) | Yes (Ralph T.H. Griffith) | Yes (Padartha & Bhavartha) | Maharshi Dayananda Saraswati, Pandit Aryamuni, Swami Brahmamuni |
| **Yajurveda Samhita** | 1,975 | Yes (Svara & Plain) | Yes (Ralph T.H. Griffith, 1,948 verses) | Yes (Dayananda) | Maharshi Dayananda Saraswati |
| **Samaveda Samhita** | 1,875 | Yes (Svara & Plain) | Yes (Ralph T.H. Griffith, 1,778 verses) | Yes (Padartha & Bhavartha) | Vishaya, Padartha, Rigveda Cross-References |
| **Atharvaveda Samhita** | 5,977 | Yes (Svara & Plain) | Pending | Yes (Bhavartha) | Vishaya, Bhashyartha, Bhavartha, Tippani |
| **Bhagavad Gita** | 701 | Yes | Yes (5+ authors) | Yes (2+ authors) | 15+ classical commentators (Shankara, Ramanuja, Madhva, etc.) |
| **Ashtavakra Gita** | 298 | Yes | Yes (John Henry Richards) | Yes (Vedic Scriptures) | Complete 20 Prakaranas with dual translations |
| **Avadhuta Gita** | 271 | Yes | Pending | Pending | Complete 8 Chapters on Non-Dual Advaita |
| **Devi Mahatmyam (Durga Saptashati)** | 581 | Yes | Pending | Pending | Complete 13 Adhyayas from Markandeya Purana |
| **Patanjali Yoga Sutras** | 196 | Yes | Yes (IGS / Woods) | Yes | Devanagari Sanskrit, IAST, English word meanings |
| **Mahabharata (BORI Critical Edition)** | 73,436 | Yes | Pending | Pending | Complete 18 Parvas (1,995 Adhyayas) |
| **Valmiki Ramayana (Critical Edition)** | 18,761 | Yes | Pending | Pending | Complete 6 Kandas (606 Sargas) |
| **Garuda Purana** | 11,970 | Yes | Pending | Pending | Purva Khanda (Achara) & Uttara Khanda (Preta Kalpa) |
| **Devi Bhagavata Mahapurana** | 18,758 | Yes | Yes (Swami Vijnanananda, 17,892 verses) | Pending | Complete 12 Skandhas, 318 Adhyayas (includes Devi Gita) |
| **Brahma Purana** | 14,052 | Yes | Pending | Pending | Complete 246 Adhyayas (Tübingen Purana Project) |
| **Shrimad Bhagavata Purana** | 15,409 | Yes | Pending | Pending | Mahatmyam & Complete 12 Skandhas |
| **Shiva Mahapurana** | 26,307 | Yes | Pending | Pending | Mahatmyam & Complete 7 Samhitas (12 Khandas) |
| **Harivamsha Purana** | 16,711 | Yes | Pending | Pending | Complete 3 Parvas (Harivamsha, Vishnu, Bhavishya) |
| **15 Principal Upanishads** | 2,196 | Yes | Yes (Advaita Ashrama) | Pending | Isha, Kena, Katha, Prashna, Mundaka, Mandukya, Taittiriya, Aitareya, Chandogya, Brihadaranyaka, Shvetashvatara, Kaushitaki, Maitri, Amritabindu, Tejobindu |
| **108 Muktika Upanishads Canon** | 108 Texts | Directory | Yes (Advaita Ashrama) | — | Systematic classification across Rigveda (10), Shukla Yajur (19), Krishna Yajur (33), Samaveda (16), Atharvaveda (31) with Vedic Shanti Mantras |

### Sanskrit-English Lexicon Sources (`dictionary.db`):
- **Vaman Shivram Apte (1890)**: *The Practical Sanskrit-English Dictionary* (Poona: Shiralkar, 68,324 entries with roots, *dhātu* derivations, and classical quotations).
- **Sir Monier Monier-Williams (1899)**: *A Sanskrit-English Dictionary* (Oxford: Clarendon Press, 287,443 entries with Indo-European cognates and Vedic/Purāṇic citations).
- **Digitization & Licensing**: Digitized by the [Cologne Digital Sanskrit Lexicon (CDSL)](https://www.sanskrit-lexicon.uni-koeln.de/) and released under **Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0)**. The original 19th-century printed works are in the **Public Domain**.

### Data Sources & Credits:
- **108 Upanishads Muktika Canon**: Canonical Vedic classification and English verse-by-verse translations from Advaita Ashrama and Ramakrishna Math tradition (Swami Gambhirananda, Swami Madhavananda, and Vidyavachaspati V. Panoli, public domain).
- **The Four Vedas**: Digitized Vedic Samhitas, Padapatha, and classical Bhashyas sourced from [VedaKosh](http://www.vedakosh.com). English translations for Rigveda, White Yajurveda, and Samaveda by Ralph T.H. Griffith.
- **Devi Bhagavata Mahapurana**: Sanskrit text digitized from [Sanskrit Documents](https://sanskritdocuments.org). Unabridged English verse-by-verse translation by Swami Vijnanananda (Hari Prasanna Chatterjee, 1921–1923, *Sacred Books of the Hindus*, public domain).
- **Bhagavad Gita**: Sourced from the open-source [Gita GitHub Project](https://github.com/gita/gita) & [IIT Kanpur Gita Supersite](https://www.gitasupersite.iitk.ac.in/).
- **Ashtavakra Gita**: Structured Devanagari text with John Henry Richards English and Hindi translations sourced from the [dhrmaorg/ashtavakra_gita](https://github.com/dhrmaorg/ashtavakra_gita) dataset.
- **Avadhuta Gita**: Sourced from [Wikisource Sanskrit (अवधूतगीता)](https://sa.wikisource.org/wiki/अवधूतगीता).
- **Devi Mahatmyam (Durga Saptashati)**: Sourced from [SanskritDocuments](https://sanskritdocuments.org/doc_devii/durga700.html) and Gita Press Gorakhpur editions.
- **Mahabharata & Valmiki Ramayana**: Digitized BORI critical editions sourced from the [Bhandarkar Oriental Research Institute Electronic Text (BORI)](https://bombay.indology.info/).
- **The Mahapuranas & Upanishads**: Digitized, encoded, and structured from [Sanskrit Documents](https://sanskritdocuments.org).
- **Patanjali Yoga Sutras**: Sourced from the [International Gita Society (IGS)](https://www.gita-society.com/wp-content/uploads/PDF/Patanjali-yogasutra.IGS.pdf).

---

## Future Improvement Work

1. **AI Verse Retrieval Precision & Relevance**: Sometimes AI verse retrieval may not be completely correct or fully relevant to specific philosophical questions. Ongoing improvements focus on refining semantic query routing, canonical keyword mapping, and re-ranking.
2. **Scripture Expansion & Multi-Language Translations**: Ingesting additional scriptures and adding comprehensive multi-language translations (Hindi, English, and regional Indian languages) for texts that currently only contain Sanskrit verses.
3. **Source Ingestion Verification & Data Quality**: Current sources are parsed and ingested from different digital archives and open repositories, and not all texts have been manually verified or audited end-to-end against critical editions.

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
   *The server will start on `http://localhost:8080` (with `scriptures.db` + `vedas.db` + `dictionary.db` active).*

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Create a `.env.local` file (configured for the local Go backend):
   ```env
   BACKEND_URL=http://localhost:8080
   FRONTEND_SECRET=your_secret_key_here
   ```
3. Install dependencies using `pnpm` (recommended) or `npm`:
   ```bash
   pnpm install
   ```
4. Start the Next.js development server:
   ```bash
   pnpm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*
