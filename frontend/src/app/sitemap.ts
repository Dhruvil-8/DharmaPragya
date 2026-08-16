import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dharma-pragya.vercel.app';

  const gitaChapters = Array.from({ length: 18 }, (_, i) => ({
    url: `${baseUrl}/?mode=read&source=Bhagavad+Gita&chapter=${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

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
    url: `${baseUrl}/?mode=read&source=${encodeURIComponent(source)}&chapter=1`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
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
    ...gitaChapters,
    ...coreScriptures,
  ];
}
