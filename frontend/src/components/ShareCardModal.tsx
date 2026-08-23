'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Share2, Copy, Check, Code, ExternalLink, Link2 } from 'lucide-react';
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'link' | 'embed'>('image');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dharmapragya.vercel.app';
  const directVerseUrl = verseDetails
    ? `${origin}/?mode=read&source=${encodeURIComponent(verseDetails.sourceName)}&chapter=${verseDetails.chapterNumber}&verse=${verseDetails.verseNumber}`
    : '';

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
      directUrl: directVerseUrl,
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
  }, [isOpen, verseDetails, directVerseUrl]);

  if (!isOpen || !verseDetails) return null;

  const embedCode = `<iframe src="${origin}/?mode=read&source=${encodeURIComponent(verseDetails.sourceName)}&chapter=${verseDetails.chapterNumber}&verse=${verseDetails.verseNumber}" width="100%" height="320" frameborder="0" style="border-radius:16px; overflow:hidden;"></iframe>`;

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
    if (!cardImage || typeof navigator === 'undefined' || !navigator.share) return;
    try {
      const blob = await (await fetch(cardImage)).blob();
      const file = new File([blob], 'dharmapragya_shloka.png', { type: 'image/png' });
      await navigator.share({
        title: `${verseDetails.sourceName} Ch. ${verseDetails.chapterNumber}, V. ${verseDetails.verseNumber}`,
        text: `"${verseDetails.translationText}"\n\nRead full verse & commentary on DharmaPragya:\n${directVerseUrl}`,
        url: directVerseUrl,
        files: [file],
      });
    } catch (e) {
      console.warn('Native share cancelled or failed:', e);
    }
  };

  const handleCopyLink = () => {
    if (!directVerseUrl) return;
    navigator.clipboard.writeText(directVerseUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
        className="fixed inset-0 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-lg bg-cream-100 dark:bg-[#0d121d] rounded-3xl border border-cream-400 dark:border-amber-500/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in transition-colors"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-cream-300 to-cream-200 dark:from-[#111827] dark:to-[#0d121d] border-b border-cream-400 dark:border-amber-500/20 flex items-center justify-between">
          <div>
            <h3 className="font-cinzel font-bold text-base text-saffron-800 dark:text-amber-300">
              Share Scripture Card & Link
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-slate-400">
              {verseDetails.sourceName} &bull; Ch. {verseDetails.chapterNumber}, Verse {verseDetails.verseNumber}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-500 dark:text-slate-400 hover:text-saffron-700 dark:hover:text-amber-300 hover:bg-cream-400/40 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Image Card vs Direct Link vs Embed Widget */}
        <div className="flex border-b border-cream-300 dark:border-amber-500/20 bg-cream-200/50 dark:bg-slate-900/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('image')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'border-saffron-600 dark:border-amber-500 text-saffron-700 dark:text-amber-300'
                : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              Social Image
            </span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'link'
                ? 'border-saffron-600 dark:border-amber-500 text-saffron-700 dark:text-amber-300'
                : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Direct Link
            </span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'embed'
                ? 'border-saffron-600 dark:border-amber-500 text-saffron-700 dark:text-amber-300'
                : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              Embed
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-4">
          {activeTab === 'image' ? (
            <>
              {/* Card Preview */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-cream-400 dark:border-amber-500/20 shadow-md bg-cream-200 dark:bg-slate-900 flex items-center justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-2 text-saffron-700 dark:text-amber-300 text-xs">
                    <div className="w-6 h-6 border-2 border-saffron-500 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span>Rendering Sanskrit Typography & Link...</span>
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

              {/* Direct Redirect Link Pill Under Preview */}
              <div className="p-2.5 bg-cream-200/70 dark:bg-slate-900/80 rounded-xl border border-cream-300 dark:border-amber-500/20 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 overflow-hidden text-stone-600 dark:text-slate-300">
                  <Link2 className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate text-[11px] font-mono">{directVerseUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-saffron-50 dark:hover:bg-slate-700 text-saffron-800 dark:text-amber-300 border border-cream-400 dark:border-amber-500/20 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleDownload}
                  disabled={!cardImage || isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-saffron-500 to-terracotta-500 dark:from-amber-500 dark:to-saffron-600 text-white font-bold text-xs shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleShareNative}
                    disabled={!cardImage || isGenerating}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cream-300 dark:bg-slate-800 hover:bg-cream-400/60 dark:hover:bg-slate-700 text-saffron-800 dark:text-amber-300 border border-cream-400 dark:border-amber-500/20 font-bold text-xs disabled:opacity-50 cursor-pointer transition-all"
                    title="Share via WhatsApp, Twitter, etc."
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share with Link</span>
                  </button>
                )}
              </div>
            </>
          ) : activeTab === 'link' ? (
            <div className="space-y-4">
              <div className="p-4 bg-cream-200/50 dark:bg-slate-900/60 rounded-2xl border border-cream-300 dark:border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold font-cinzel text-saffron-900 dark:text-amber-300">
                  Direct Verse Deep-Link
                </h4>
                <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
                  Anyone who clicks this link will be instantly redirected directly to this exact scripture verse, complete with Sanskrit text, transliteration, audio chant, and authentic commentaries.
                </p>
              </div>

              <div className="relative p-3 bg-white dark:bg-slate-900 rounded-xl font-mono text-xs text-stone-800 dark:text-slate-200 break-all border border-cream-400 dark:border-amber-500/20 shadow-inner flex items-center justify-between gap-2">
                <span className="select-all">{directVerseUrl}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-saffron-500 to-terracotta-500 dark:from-amber-500 dark:to-saffron-600 text-white font-bold text-xs shadow-md hover:shadow-lg cursor-pointer transition-all"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Direct Link'}</span>
                </button>

                <a
                  href={directVerseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cream-300 dark:bg-slate-800 hover:bg-cream-400/60 dark:hover:bg-slate-700 text-saffron-800 dark:text-amber-300 border border-cream-400 dark:border-amber-500/20 font-bold text-xs cursor-pointer transition-all"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-sans">
                Paste this snippet into your HTML, WordPress, Ghost blog, or website to embed this interactive scripture card directly:
              </p>

              <div className="relative p-3 bg-stone-900 rounded-xl font-mono text-[11px] text-saffron-300 dark:text-amber-300 break-all border border-stone-700 dark:border-amber-500/30">
                <code>{embedCode}</code>
              </div>

              <button
                onClick={handleCopyEmbed}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-saffron-500 to-terracotta-500 dark:from-amber-500 dark:to-saffron-600 text-white font-bold text-xs shadow-md hover:shadow-lg cursor-pointer transition-all"
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
