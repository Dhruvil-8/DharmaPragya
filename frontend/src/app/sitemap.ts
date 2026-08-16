import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dharma-pragya.vercel.app';

  // 1. Bhagavad Gita Core Chapters
  const gitaChapters = Array.from({ length: 18 }, (_, i) => ({
    url: `${baseUrl}/read/Bhagavad%20Gita/${i + 1}/1`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // 2. High-Impact Canonical Verses
  const keyVerses = [
    { source: 'Bhagavad Gita', chapter: 2, verse: 47 },
    { source: 'Bhagavad Gita', chapter: 2, verse: 14 },
    { source: 'Bhagavad Gita', chapter: 4, verse: 38 },
    { source: 'Bhagavad Gita', chapter: 6, verse: 5 },
    { source: 'Bhagavad Gita', chapter: 18, verse: 66 },
    { source: 'Isha Upanishad', chapter: 1, verse: 1 },
    { source: 'Patanjali Yoga Sutras', chapter: 1, verse: 2 },
    { source: 'Rigveda', chapter: 10, verse: 129 },
  ].map(({ source, chapter, verse }) => ({
    url: `${baseUrl}/read/${encodeURIComponent(source)}/${chapter}/${verse}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.95,
  }));

  // 3. Core Upanishads & Canonical Scriptures
  const coreScriptures = [
    'Isha Upanishad',
    'Kena Upanishad',
    'Katha Upanishad',
    'Prashna Upanishad',
    'Mundaka Upanishad',
    'Mandukya Upanishad',
    'Taittiriya Upanishad',
    'Aitareya Upanishad',
    'Chandogya Upanishad',
    'Brihadaranyaka Upanishad',
    'Patanjali Yoga Sutras',
    'Rigveda',
    'Valmiki Ramayana',
    'Mahabharata',
  ].map((source) => ({
    url: `${baseUrl}/read/${encodeURIComponent(source)}/1/1`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/?mode=ask`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?mode=read`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...keyVerses,
    ...gitaChapters,
    ...coreScriptures,
  ];
}
