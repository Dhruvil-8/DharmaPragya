import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../../../components/Header';
import { ArrowLeft, BookOpen, Compass, ExternalLink } from 'lucide-react';
import VerseBlock from '../../../../components/VerseBlock';
import { VerseData } from '../../../../types';

interface PageProps {
  params: Promise<{
    source: string;
    chapter: string;
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
  const { source, chapter } = await params;
  const sourceName = normalizeSourceName(source);
  const title = `${sourceName} Chapter ${chapter} - Sanskrit Shlokas, Translations & Commentary | DharmaPragya`;
  const description = `Read all verses of ${sourceName} Chapter ${chapter} in original Sanskrit with IAST transliteration, Hindi & English translations, Sanskrit word breakdown, and philosophical commentaries.`;

  return {
    title,
    description,
    keywords: [
      sourceName,
      `${sourceName} Chapter ${chapter}`,
      `${sourceName} Ch ${chapter}`,
      'Sanskrit Shloka',
      'Vedic Commentary',
      'Sanatan Dharma',
    ],
    alternates: {
      canonical: `https://dharma-pragya.vercel.app/read/${encodeURIComponent(sourceName)}/${chapter}`,
    },
    openGraph: {
      title,
      description,
      url: `https://dharma-pragya.vercel.app/read/${encodeURIComponent(sourceName)}/${chapter}`,
      siteName: 'DharmaPragya',
      type: 'article',
    },
  };
}

async function getChapterVerses(sourceName: string, chapter: number): Promise<VerseData[]> {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
  const secret = process.env.FRONTEND_SECRET || '';

  try {
    const res = await fetch(`${backendUrl}/api/read?source=${encodeURIComponent(sourceName)}&chapter=${chapter}`, {
      headers: { 'X-App-Token': secret },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Server-side chapter fetch failed:', e);
    return [];
  }
}

export default async function ChapterReadingPage({ params }: PageProps) {
  const { source, chapter } = await params;
  const sourceName = normalizeSourceName(source);
  const chapterNum = parseInt(chapter, 10);
  const verses = await getChapterVerses(sourceName, chapterNum);

  const chapterTitle = verses[0]?.chapter_name === sourceName
    ? sourceName
    : (verses[0]?.chapter_name || `${sourceName} Chapter ${chapterNum}`);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${sourceName} - Chapter ${chapterNum}`,
    inLanguage: ['sa', 'en', 'hi'],
    about: [
      { '@type': 'Thing', name: sourceName },
      { '@type': 'Thing', name: 'Sanatan Dharma' },
    ],
    author: {
      '@type': 'Organization',
      name: 'DharmaPragya',
      url: 'https://dharma-pragya.vercel.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'DharmaPragya',
      url: 'https://dharma-pragya.vercel.app',
    },
    mainEntityOfPage: `https://dharma-pragya.vercel.app/read/${encodeURIComponent(sourceName)}/${chapterNum}`,
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6 md:px-8 md:py-10 bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 text-stone-900 relative overflow-x-hidden selection:bg-saffron-200 selection:text-saffron-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full max-w-4xl z-10 flex flex-col flex-grow space-y-6">
        <Header />

        {/* Dynamic Breadcrumbs Bar */}
        <nav className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-cream-400 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-stone-700 font-bold">
            <Link href="/read" className="hover:text-saffron-800 transition-colors">
              Scriptures
            </Link>
            <span className="text-stone-400">/</span>
            <Link href={`/read/${encodeURIComponent(sourceName)}`} className="hover:text-saffron-800 transition-colors">
              {sourceName}
            </Link>
            <span className="text-stone-400">/</span>
            <span className="text-saffron-950 font-cinzel font-bold">
              Ch. {chapterNum} ({verses.length} Verses)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/?mode=read&source=${encodeURIComponent(sourceName)}&chapter=${chapterNum}`}
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
        </nav>

        {/* Chapter Header Banner */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-400/80 shadow-sm text-center space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-saffron-800 bg-saffron-100 px-3 py-1 rounded-full border border-saffron-200">
            {sourceName}
          </span>
          <h1 className="text-xl md:text-2xl font-bold font-cinzel text-saffron-950 pt-1">
            {chapterTitle}
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Containing {verses.length} sacred Sanskrit shlokas with multi-author commentaries and translations.
          </p>
        </div>

        {/* Verse List */}
        {verses.length > 0 ? (
          <div className="space-y-6">
            {verses.map((verse, idx) => (
              <div key={verse.id} id={`verse-${verse.verse_number}`}>
                <VerseBlock
                  verse={verse}
                  index={idx}
                  totalVerses={verses.length}
                  isAskMode={false}
                  readingMode="study"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-3xl border border-cream-400 text-center space-y-4">
            <h2 className="text-xl font-bold font-cinzel text-saffron-800">
              {sourceName} — Chapter {chapterNum}
            </h2>
            <p className="text-stone-500 text-xs max-w-md mx-auto">
              This chapter is available in our database. Click below to explore in the interactive reader.
            </p>
            <Link
              href={`/?mode=read&source=${encodeURIComponent(sourceName)}&chapter=${chapterNum}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-saffron-600 text-white text-xs font-bold hover:bg-saffron-700 transition-colors shadow-xs"
            >
              <span>Open in Interactive Reader</span>
              <BookOpen className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center text-xs text-stone-500 space-y-1 border-t border-cream-400/40">
          <p className="font-cinzel font-bold text-saffron-800">DharmaPragya Scripture Index</p>
          <p>Synthesizing timeless Sanatan Dharma wisdom with modern intelligence.</p>
        </footer>
      </div>
    </main>
  );
}
