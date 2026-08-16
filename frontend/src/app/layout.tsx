import type { Metadata, Viewport } from "next";
import { Cinzel, Lora, Plus_Jakarta_Sans, Tiro_Devanagari_Sanskrit } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const tiroDevanagari = Tiro_Devanagari_Sanskrit({
  variable: "--font-sanskrit",
  subsets: ["devanagari", "latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfbf7" },
    { media: "(prefers-color-scheme: dark)", color: "#141210" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://dharma-pragya.vercel.app"),
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  title: "DharmaPragya - Canonical AI Guide to Sanatan Dharma Wisdom",
  description: "Explore the timeless wisdom of Sanatan Dharma. Ask philosophical questions and receive synthesized, authentic answers cited directly from the Bhagavad Gita, Upanishads, Vedas, Mahabharata, Ramayana, and Patanjali Yoga Sutras.",
  keywords: [
    "Sanatan Dharma",
    "Bhagavad Gita",
    "Vedas",
    "Rigveda",
    "Upanishads",
    "Isha Upanishad",
    "Katha Upanishad",
    "Mahabharata",
    "Valmiki Ramayana",
    "Patanjali Yoga Sutras",
    "Hindu Philosophy",
    "Advaita Vedanta",
    "Sanskrit Shlokas",
    "Karma Yoga",
    "Spiritual AI Guide",
    "Vedic Chants",
  ],
  authors: [{ name: "DharmaPragya", url: "https://dharma-pragya.vercel.app" }],
  creator: "DharmaPragya",
  publisher: "DharmaPragya",
  applicationName: "DharmaPragya",
  category: "Education & Spirituality",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "DharmaPragya - Canonical AI Guide to Sanatan Dharma Wisdom",
    description: "Explore the timeless wisdom of Sanatan Dharma with synthesized answers cited directly from the Bhagavad Gita, Vedas, Upanishads, and Epics.",
    url: "https://dharma-pragya.vercel.app",
    siteName: "DharmaPragya",
    locale: "en_US",
    alternateLocale: ["hi_IN"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DharmaPragya - AI Powered Sanatan Dharma Wisdom",
    description: "Synthesized philosophical wisdom cited directly from the Vedas, Upanishads, and Bhagavad Gita.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://dharma-pragya.vercel.app/#website",
      "url": "https://dharma-pragya.vercel.app",
      "name": "DharmaPragya",
      "description": "AI Powered Sanatan Dharma Wisdom Synthesizer and Sacred Scripture Reader",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://dharma-pragya.vercel.app/?mode=ask&q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
      "inLanguage": ["en", "hi", "sa"],
    },
    {
      "@type": "WebApplication",
      "@id": "https://dharma-pragya.vercel.app/#webapp",
      "url": "https://dharma-pragya.vercel.app",
      "name": "DharmaPragya",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "about": [
        { "@type": "Thing", "name": "Sanatan Dharma" },
        { "@type": "Thing", "name": "Bhagavad Gita" },
        { "@type": "Thing", "name": "Upanishads" },
        { "@type": "Thing", "name": "Vedas" },
        { "@type": "Thing", "name": "Patanjali Yoga Sutras" },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cinzel.variable} ${lora.variable} ${plusJakartaSans.variable} ${tiroDevanagari.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('dharmapragya_theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-cream-100 dark:bg-[#141210] text-gray-800 dark:text-[#f5eedc] transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
