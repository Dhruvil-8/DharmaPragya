'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Share2, Copy, Check, Code } from 'lucide-react';
import { generateVerseCard } from '../lib/cardGenerator';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseDetails: {
    sourceName: string;
    chapterNumber: number;
    verseNumber: number;
    sanskritText: string;
    transliteration?: string;
    translationText: string;
  } | null;
}

export default function ShareCardModal({
  isOpen,
  onClose,
  verseDetails,
}: ShareCardModalProps) {
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'embed'>('image');

  useEffect(() => {
    if (!isOpen || !verseDetails) return;

    let isMounted = true;
    setIsGenerating(true);

    generateVerseCard({
      sourceName: verseDetails.sourceName,
      chapterNumber: verseDetails.chapterNumber,
      verseNumber: verseDetails.verseNumber,
      sanskritText: verseDetails.sanskritText,
      transliteration: verseDetails.transliteration,
      translationText: verseDetails.translationText,
    })
      .then((dataUrl) => {
        if (isMounted) {
          setCardImage(dataUrl);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate card:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, verseDetails]);

  if (!isOpen || !verseDetails) return null;

  const embedCode = `<iframe src="https://dharma-pragya.vercel.app/embed/verse/${verseDetails.sourceName.toLowerCase().replace(/\s+/g, '-')}/${verseDetails.chapterNumber}/${verseDetails.verseNumber}" width="100%" height="280" frameborder="0" style="border-radius:16px; overflow:hidden;"></iframe>`;

  const handleDownload = () => {
    if (!cardImage) return;
    const a = document.createElement('a');
    a.href = cardImage;
    a.download = `DharmaPragya_${verseDetails.sourceName.replace(/\s+/g, '_')}_Ch${verseDetails.chapterNumber}_V${verseDetails.verseNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareNative = async () => {
    if (!cardImage || !navigator.share) return;
    try {
      const blob = await (await fetch(cardImage)).blob();
      const file = new File([blob], 'dharmapragya_shloka.png', { type: 'image/png' });
      await navigator.share({
        title: `${verseDetails.sourceName} Ch. ${verseDetails.chapterNumber}, V. ${verseDetails.verseNumber}`,
        text: `"${verseDetails.translationText}" — DharmaPragya`,
        files: [file],
      });
    } catch (e) {
      console.error('Share failed', e);
    }
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-lg bg-cream-100 rounded-3xl border border-cream-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-cream-300 to-cream-200 border-b border-cream-400 flex items-center justify-between">
          <div>
            <h3 className="font-cinzel font-bold text-base text-saffron-800">
              Share Scripture Card
            </h3>
            <p className="text-[11px] text-stone-500">
              {verseDetails.sourceName} &bull; Ch. {verseDetails.chapterNumber}, Verse {verseDetails.verseNumber}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-500 hover:text-saffron-700 hover:bg-cream-400/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Image Card vs Embed Widget */}
        <div className="flex border-b border-cream-300 bg-cream-200/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('image')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'border-saffron-600 text-saffron-700'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              Social Image Card
            </span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'embed'
                ? 'border-saffron-600 text-saffron-700'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              Embed on Website / Blog
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-4">
          {activeTab === 'image' ? (
            <>
              {/* Card Preview */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-cream-400 shadow-md bg-cream-200 flex items-center justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-2 text-saffron-700 text-xs">
                    <div className="w-6 h-6 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin" />
                    <span>Rendering Sanskrit Typography...</span>
                  </div>
                ) : cardImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cardImage}
                    alt="Scripture Card Preview"
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!cardImage || isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-saffron-500 to-terracotta-500 text-white font-bold text-xs shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Res PNG</span>
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleShareNative}
                    disabled={!cardImage || isGenerating}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cream-300 hover:bg-cream-400/60 text-saffron-800 border border-cream-400 font-bold text-xs disabled:opacity-50 cursor-pointer transition-all"
                    title="Share via Apps"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Paste this snippet into your HTML, WordPress, Ghost blog, or website to embed this interactive scripture card directly:
              </p>

              <div className="relative p-3 bg-stone-900 rounded-xl font-mono text-[11px] text-saffron-300 break-all border border-stone-700">
                <code>{embedCode}</code>
              </div>

              <button
                onClick={handleCopyEmbed}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-saffron-500 to-terracotta-500 text-white font-bold text-xs shadow-md hover:shadow-lg cursor-pointer transition-all"
              >
                {copiedSnippet ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSnippet ? 'Copied to Clipboard!' : 'Copy Embed HTML'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
