import type { Metadata } from "next";
import { Cinzel, Lora, Plus_Jakarta_Sans } from "next/font/google";
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
      className={`${cinzel.variable} ${lora.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
