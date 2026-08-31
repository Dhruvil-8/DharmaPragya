import type { Metadata } from 'next';
import React from 'react';
import { FAMOUS_SUKTAMS_AND_MANTRAS } from '../../data/famousSuktams';

export const metadata: Metadata = {
  title: 'Sacred Suktams & Mantras | Vedic Hymns, Shanti Patha & Stotrams | DharmaPragya',
  description: 'Explore and chant authentic Vedic Suktams, Maha Mantras, Upanishadic Shanti Pathas, Bhagavad Gita Mahashlokas, and Puranic & Epic Stotrams with Sanskrit text, IAST transliteration, and English/Hindi translations.',
  keywords: [
    'Sacred Suktams',
    'Vedic Mantras',
    'Purusha Suktam',
    'Sri Suktam',
    'Nasadiya Suktam',
    'Gayatri Mantra',
    'Mahamrityunjaya Mantra',
    'Sri Rudram Chamakam',
    'Aditya Hridaya Stotram',
    'Vishnu Sahasranama',
    'Upanishadic Shanti Patha',
    'Asato Ma Sadgamaya',
    'Bhagavad Gita Shlokas',
    'Sanatan Dharma Chants',
  ],
  alternates: {
    canonical: 'https://dharma-pragya.vercel.app/suktams',
  },
  openGraph: {
    title: 'Sacred Suktams & Mantras | DharmaPragya',
    description: 'Authentic Vedic Suktams, Maha Mantras, and Stotrams with verse-by-verse recitation, Sanskrit lyrics, and Hindi/English translations.',
    url: 'https://dharma-pragya.vercel.app/suktams',
    siteName: 'DharmaPragya',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sacred Suktams & Mantras | DharmaPragya',
    description: 'Authentic Vedic Suktams, Maha Mantras, and Stotrams with verse-by-verse recitation and complete translations.',
  },
};

export default function SuktamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema.org Structured Data (ItemList of Sacred Hymns)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Sacred Suktams & Mantras',
    description: 'Comprehensive collection of Vedic Suktams, Maha Mantras, and Sacred Stotrams of Sanatan Dharma.',
    url: 'https://dharma-pragya.vercel.app/suktams',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: FAMOUS_SUKTAMS_AND_MANTRAS.map((hymn, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: hymn.name,
          alternateName: hymn.sanskritName,
          abstract: hymn.summary,
          genre: hymn.category,
          inLanguage: ['sa', 'en', 'hi'],
          isPartOf: {
            '@type': 'Book',
            name: hymn.exactScripture,
          },
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
