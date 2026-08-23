import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../../components/Header';
import { ArrowLeft, BookOpen, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import { SectionData } from '../../../types';

interface PageProps {
  params: Promise<{
    source: string;
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
  const { source } = await params;
  const sourceName = normalizeSourceName(source);
  const title = `${sourceName} - Chapters, Sanskrit Shlokas & Translations | DharmaPragya`;
  const description = `Read all chapters and divisions of ${sourceName} in original Sanskrit with transliterations, English and Hindi translations, and commentaries.`;

  return {
    title,
    description,
    keywords: [
      sourceName,
      `${sourceName} Chapters`,
      `${sourceName} Sanskrit`,
      `${sourceName} Shlokas`,
      'Sanatan Dharma',
      'Hindu Scriptures',
    ],
    alternates: {
      canonical: `https://dharma-pragya.vercel.app/read/${encodeURIComponent(sourceName)}`,
    },
    openGraph: {
      title,
      description,
      url: `https://dharma-pragya.vercel.app/read/${encodeURIComponent(sourceName)}`,
      siteName: 'DharmaPragya',
      type: 'website',
    },
  };
}

async function getSections(sourceName: string): Promise<SectionData[]> {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
  const secret = process.env.FRONTEND_SECRET || '';

  try {
    const res = await fetch(`${backendUrl}/api/read?source=${encodeURIComponent(sourceName)}`, {
      headers: { 'X-App-Token': secret },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch sections server-side:', e);
    return [];
  }
}

export default async function SourceChaptersPage({ params }: PageProps) {
  const { source } = await params;
  const sourceName = normalizeSourceName(source);
  const sections = await getSections(sourceName);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: sourceName,
    about: 'Sanatan Dharma Sacred Scripture',
    url: `https://dharma-pragya.vercel.app/read/${encodeURIComponent(sourceName)}`,
    publisher: {
      '@type': 'Organization',
      name: 'DharmaPragya',
      url: 'https://dharma-pragya.vercel.app',
    },
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6 md:px-8 md:py-10 bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 text-stone-900 relative overflow-x-hidden selection:bg-saffron-200 selection:text-saffron-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full max-w-4xl z-10 flex flex-col flex-grow space-y-6">
        <Header />

        {/* Breadcrumb Bar */}
        <nav className="flex items-center gap-1.5 text-xs text-stone-700 font-bold bg-cream-300 px-4 py-2.5 rounded-2xl border border-cream-400/80 shadow-2xs">
          <Link href="/read" className="hover:text-saffron-800 transition-colors">
            All Scriptures
          </Link>
          <span className="text-stone-400">/</span>
          <span className="text-saffron-950 font-cinzel font-bold">{sourceName}</span>
        </nav>

        {/* Hero Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-400/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-saffron-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-saffron-600" />
            <span>Scripture Overview</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-cinzel text-saffron-950">
            {sourceName}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm font-serif leading-relaxed">
            Select a chapter or division below to explore all verses in original Sanskrit with word-by-word meanings and commentaries.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href={`/?mode=read&source=${encodeURIComponent(sourceName)}&chapter=1`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-saffron-600 to-terracotta-600 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read in Interactive App</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-80" />
            </Link>
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-cinzel text-saffron-950 border-b border-cream-300 pb-2">
            Chapters & Divisions ({sections.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sections.map((sec) => (
              <Link
                key={sec.id}
                href={`/read/${encodeURIComponent(sourceName)}/${sec.chapter_number}`}
                className="p-4 bg-white hover:bg-saffron-50/60 border border-cream-400 hover:border-saffron-400 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h3 className="font-cinzel font-bold text-sm text-saffron-950 group-hover:text-saffron-800 transition-colors">
                    {sec.chapter_name === sourceName ? 'Complete Text' : sec.chapter_name}
                  </h3>
                  <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
                    Chapter {sec.chapter_number}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-saffron-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center text-xs text-stone-500 space-y-1 border-t border-cream-400/40">
          <p className="font-cinzel font-bold text-saffron-800">DharmaPragya Scripture Index</p>
          <p>Synthesizing timeless Sanatan Dharma wisdom with modern intelligence.</p>
        </footer>
      </div>
    </main>
  );
}
