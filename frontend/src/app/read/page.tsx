import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import { BookMarked, ChevronRight, BookOpen, Sparkles, Compass } from 'lucide-react';
import { SourceData } from '../../types';

export const metadata: Metadata = {
  title: 'Read Sacred Sanatan Dharma Scriptures | Vedas, Upanishads, Gita, Ramayana | DharmaPragya',
  description: 'Explore and read sacred Sanatan Dharma scriptures including Bhagavad Gita, Rigveda, Patanjali Yoga Sutras, 15 Principal Upanishads, Mahabharata, and Valmiki Ramayana with original Sanskrit, English & Hindi translations.',
  keywords: [
    'Sanatan Dharma Scriptures',
    'Bhagavad Gita Online',
    'Vedas Sanskrit',
    'Rigveda English Translation',
    'Principal Upanishads',
    'Patanjali Yoga Sutras',
    'Mahabharata Critical Edition',
    'Valmiki Ramayana Sanskrit',
  ],
  alternates: {
    canonical: 'https://dharma-pragya.vercel.app/read',
  },
  openGraph: {
    title: 'Read Sacred Sanatan Dharma Scriptures | DharmaPragya',
    description: 'Explore and read sacred Sanatan Dharma scriptures with original Sanskrit, transliteration, and multi-author commentaries.',
    url: 'https://dharma-pragya.vercel.app/read',
    siteName: 'DharmaPragya',
    type: 'website',
  },
};

async function getSources(): Promise<SourceData[]> {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
  const secret = process.env.FRONTEND_SECRET || '';

  try {
    const res = await fetch(`${backendUrl}/api/read`, {
      headers: { 'X-App-Token': secret },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch sources server-side:', e);
    return [];
  }
}

export default async function ReadDirectoryPage() {
  const sources = await getSources();

  const categorize = (name: string) => {
    if (name.includes('Upanishad')) return 'Upanishads';
    if (name.includes('Veda') || name.includes('Rigveda')) return 'Vedas';
    if (name.includes('Purana') || name === 'Harivamsha Purana') return 'Puranas';
    if (name === 'Bhagavad Gita' || name === 'Mahabharata' || name === 'Valmiki Ramayana') return 'Itihasa';
    return 'Other Scriptures';
  };

  const grouped = sources.reduce((acc, src) => {
    const cat = categorize(src.name);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(src);
    return acc;
  }, {} as Record<string, SourceData[]>);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Sanatan Dharma Scripture Index',
    description: 'A complete index of foundational Vedic and Classical Hindu scriptures with original Sanskrit texts and translations.',
    url: 'https://dharma-pragya.vercel.app/read',
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

        {/* Hero Section */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-400/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-saffron-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-saffron-600" />
            <span>Sacred Scripture Library</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-cinzel text-saffron-950">
            Read Sacred Sanatan Dharma Scriptures
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm font-serif leading-relaxed max-w-2xl">
            Browse through over 200,000+ authoritative verses from the Vedas, Upanishads, Puranas, Bhagavad Gita, Mahabharata, Ramayana, and Patanjali Yoga Sutras.
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            <Link
              href="/?mode=ask"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-saffron-600 to-terracotta-600 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Ask AI Any Question</span>
            </Link>

            <Link
              href="/?mode=read"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 border border-cream-400 text-saffron-900 text-xs font-bold transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Interactive Reader</span>
            </Link>
          </div>
        </div>

        {/* Category & Scripture Source Cards */}
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catSources]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-cream-300 pb-2">
                <BookMarked className="w-4 h-4 text-saffron-700" />
                <h2 className="text-lg font-bold font-cinzel text-saffron-950">
                  {category}
                </h2>
                <span className="text-xs text-stone-500 font-medium">({catSources.length} texts)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {catSources.map((src) => (
                  <Link
                    key={src.id}
                    href={`/read/${encodeURIComponent(src.name)}`}
                    className="p-5 bg-white hover:bg-saffron-50/50 border border-cream-400 hover:border-saffron-400 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between h-28 group cursor-pointer"
                  >
                    <div>
                      <h3 className="font-cinzel font-bold text-sm text-saffron-950 group-hover:text-saffron-800 transition-colors">
                        {src.name}
                      </h3>
                      <p className="text-[11px] text-stone-500 capitalize mt-0.5">
                        {src.type.toLowerCase().replace('_', ' ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-stone-600 group-hover:text-saffron-700">
                      <span>View Chapters</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-saffron-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
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
