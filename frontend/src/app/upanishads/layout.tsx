import type { Metadata } from 'next';
import React from 'react';
import { CANONICAL_108_UPANISHADS } from '../../data/canonicalUpanishads';

export const metadata: Metadata = {
  title: '108 Canonical Upanishads (Muktika Canon) | Complete Sanskrit & English | DharmaPragya',
  description: 'Explore the 108 Canonical Upanishads of the Muktika Canon, systematically classified across the Rigveda, Shukla Yajurveda, Krishna Yajurveda, Samaveda, and Atharvaveda with authentic Sanskrit verses, IAST transliteration, and English translations.',
  keywords: [
    '108 Upanishads',
    'Muktika Upanishad',
    'Muktika Canon',
    'Principal Upanishads',
    'Mukhya Upanishads',
    'Rigveda Upanishads',
    'Yajurveda Upanishads',
    'Samaveda Upanishads',
    'Atharvaveda Upanishads',
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
    'Shvetashvatara Upanishad',
    'Kaivalya Upanishad',
    'Advaita Vedanta',
    'Sanatan Dharma Scriptures',
  ],
  alternates: {
    canonical: 'https://dharma-pragya.vercel.app/upanishads',
  },
  openGraph: {
    title: '108 Canonical Upanishads (Muktika Canon) | DharmaPragya',
    description: 'Explore all 108 Muktika Upanishads classified by the Five Vedic Traditions with complete Sanskrit text, English translations, and Vedic Shanti Mantras.',
    url: 'https://dharma-pragya.vercel.app/upanishads',
    siteName: 'DharmaPragya',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '108 Canonical Upanishads (Muktika Canon) | DharmaPragya',
    description: 'Complete 108 Muktika Upanishads with Devanagari Sanskrit, IAST, and English verse-by-verse translations.',
  },
};

export default function UpanishadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '108 Canonical Upanishads (Muktika Canon)',
    description: 'The complete canon of 108 Upanishads classified across Rigveda, Shukla Yajurveda, Krishna Yajurveda, Samaveda, and Atharvaveda.',
    url: 'https://dharma-pragya.vercel.app/upanishads',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: CANONICAL_108_UPANISHADS.map((up, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: up.name,
          alternateName: up.sanskritName,
          description: up.summary,
          genre: `${up.veda} • ${up.category} Upanishad`,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
