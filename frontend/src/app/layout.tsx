import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dharma-pragya.vercel.app"),
  alternates: {
    canonical: "/",
  },
  title: "DharmaPragya - AI Powered Sanatan Dharma Wisdom",
  description: "Explore the profound wisdom of Sanatan Dharma. Ask philosophical questions and get synthesized answers with direct citations from the Bhagavad Gita, Vedas, Upanishads, Mahabharata, and Ramayana.",
  keywords: "Sanatan Dharma, Bhagavad Gita, Rigveda, Upanishads, Mahabharata, Valmiki Ramayana, Patanjali Yoga Sutras, Hindu philosophy, Spirituality",
  openGraph: {
    title: "DharmaPragya - AI Powered Sanatan Dharma Wisdom",
    description: "Explore the profound wisdom of Sanatan Dharma with an AI guide that cites the Vedas, Upanishads, and Epics.",
    url: "https://dharma-pragya.vercel.app",
    siteName: "DharmaPragya",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DharmaPragya",
    description: "Explore the profound wisdom of Sanatan Dharma with AI.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
