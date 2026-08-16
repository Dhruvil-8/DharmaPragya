import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{
    source: string;
    chapter: string;
    verse: string;
  }>;
}

export default async function DynamicEmbedVersePage({ params }: Props) {
  const { source, chapter, verse } = await params;
  
  let sourceName = decodeURIComponent(source);
  if (sourceName.toLowerCase() === 'gita' || sourceName.toLowerCase() === 'bhagavad-gita') {
    sourceName = 'Bhagavad Gita';
  }

  redirect(`/embed?source=${encodeURIComponent(sourceName)}&chapter=${chapter}&verse=${verse}`);
}
