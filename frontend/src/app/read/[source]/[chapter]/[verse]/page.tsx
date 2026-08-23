import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../../../../components/Header';
import { ArrowLeft, Compass, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import VerseBlock from '../../../../../components/VerseBlock';
import { VerseData } from '../../../../../types';

interface PageProps {
  params: Promise<{
    source: string;
    chapter: string;
    verse: string;
  }>;
}

function normalizeSourceName(raw: string): string {
  const decoded = decodeURIComponent(raw);
  if (decoded.toLowerCase() === 'gita' || decoded.toLowerCase() === 'bhagavad-gita') {
    return 'Bhagavad Gita';
  }
  return decoded;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { source, chapter, verse } = await params;
  const sourceName = normalizeSourceName(source);
  const title = `${sourceName} Chapter ${chapter}, Verse ${verse} - Sanskrit Shloka, Translation & Commentary | DharmaPragya`;
  const description = `Read ${sourceName} Ch. ${chapter} Verse ${verse} in original Sanskrit with IAST transliteration, Hindi & English translations, Sanskrit word breakdown, and philosophical commentaries.`;

  return {
    title,
    description,
    keywords: [
      sourceName,
      `${sourceName} Chapter ${chapter}`,
      `${sourceName} Verse ${verse}`,
      `${sourceName} ${chapter}.${verse}`,
      'Sanskrit Shloka',
      'Vedic Commentary',
      'Sanatan Dharma',
      'Hindu Scriptures',
    ],
    alternates: {
      canonical: `https://dharma-pragya.vercel.app/read/${encodeURIComponent(sourceName)}/${chapter}/${verse}`,
    },
    openGraph: {
      title,
      description,
      url: `https://dharma-pragya.vercel.app/read/${encodeURIComponent(sourceName)}/${chapter}/${verse}`,
      siteName: 'DharmaPragya',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

async function getVerseData(sourceName: string, chapter: number, verseNum: number): Promise<VerseData | null> {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
  const secret = process.env.FRONTEND_SECRET || '';

  try {
    const res = await fetch(`${backendUrl}/api/read?source=${encodeURIComponent(sourceName)}&chapter=${chapter}`, {
      headers: { 'X-App-Token': secret },
      next: { revalidate: 86400 }, // Cache for 24h
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) {
      const found = data.find((v: VerseData) => v.verse_number === verseNum);
      return found || data[0] || null;
    }
  } catch (e) {
    console.error('Server-side verse fetch failed:', e);
  }
  return null;
}

export default async function ProgrammaticVersePage({ params }: PageProps) {
  const { source, chapter, verse } = await params;
  const sourceName = normalizeSourceName(source);
  const chapterNum = parseInt(chapter, 10);
  const verseNum = parseInt(verse, 10);

  const verseData = await getVerseData(sourceName, chapterNum, verseNum);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${sourceName} - Chapter ${chapterNum}, Verse ${verseNum}`,
    "inLanguage": ["sa", "en", "hi"],
    "about": [
      { "@type": "Thing", "name": sourceName },
      { "@type": "Thing", "name": "Sanatan Dharma" },
    ],
    "author": {
      "@type": "Organization",
      "name": "DharmaPragya",
      "url": "https://dharma-pragya.vercel.app",
    },
    "publisher": {
      "@type": "Organization",
      "name": "DharmaPragya",
      "url": "https://dharma-pragya.vercel.app",
    },
    "mainEntityOfPage": `https://dharma-pragya.vercel.app/read/${encodeURIComponent(sourceName)}/${chapterNum}/${verseNum}`,
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 text-gray-800 relative overflow-x-hidden selection:bg-saffron-200 selection:text-saffron-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full max-w-4xl z-10 flex flex-col flex-grow space-y-6">
        <Header />

        {/* Breadcrumb & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-cream-400 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-stone-700 font-bold">
            <Link href="/read" className="hover:text-saffron-800 transition-colors">
              Scriptures
            </Link>
            <span className="text-stone-400">/</span>
            <Link href={`/read/${encodeURIComponent(sourceName)}`} className="hover:text-saffron-800 transition-colors">
              {sourceName}
            </Link>
            <span className="text-stone-400">/</span>
            <Link href={`/read/${encodeURIComponent(sourceName)}/${chapterNum}`} className="hover:text-saffron-800 transition-colors">
              Ch. {chapterNum}
            </Link>
            <span className="text-stone-400">/</span>
            <span className="text-saffron-950 font-cinzel font-bold">
              Verse {verseNum}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/?mode=read&source=${encodeURIComponent(sourceName)}&chapter=${chapterNum}&verse=${verseNum}`}
              className="flex items-center gap-1.5 text-xs font-bold text-saffron-800 hover:text-saffron-600 transition-colors"
            >
              <span>Interactive App</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Link
              href="/?mode=ask"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-saffron-600 to-terracotta-600 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </Link>
          </div>
        </div>

        {/* Verse Component */}
        {verseData ? (
          <VerseBlock
            verse={verseData}
            index={0}
            totalVerses={1}
            isAskMode={false}
            readingMode="study"
          />
        ) : (
          <div className="bg-white p-10 rounded-3xl border border-cream-400 text-center space-y-4">
            <h2 className="text-xl font-bold font-cinzel text-saffron-800">
              {sourceName} — Chapter {chapterNum}, Verse {verseNum}
            </h2>
            <p className="text-stone-500 text-xs max-w-md mx-auto">
              This scripture record is available in our unified database. Click below to explore all chapters.
            </p>
            <Link
              href={`/?mode=read&source=${encodeURIComponent(sourceName)}&chapter=${chapterNum}&verse=${verseNum}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-saffron-600 text-white text-xs font-bold hover:bg-saffron-700 transition-colors shadow-xs"
            >
              <span>Explore in Reading Mode</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-12 pb-6 text-center text-xs text-stone-500 space-y-1">
          <p className="font-cinzel font-bold text-saffron-800">DharmaPragya Scripture Index</p>
          <p>Synthesizing timeless Sanatan Dharma wisdom with modern intelligence.</p>
        </footer>
      </div>
    </main>
  );
}
