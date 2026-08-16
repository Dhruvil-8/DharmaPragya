import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Share2, Copy, Check, Code, Sun, Moon } from 'lucide-react';
import { generateVerseCard, downloadImage, shareImageFile } from '../lib/cardGenerator';

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

export default function ShareCardModal({ isOpen, onClose, verseDetails }: ShareCardModalProps) {
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [cardTheme, setCardTheme] = useState<'day' | 'night'>('day');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'embed'>('image');

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && verseDetails) {
      setIsGenerating(true);
      generateVerseCard({
        sourceName: verseDetails.sourceName,
        chapterNumber: verseDetails.chapterNumber,
        verseNumber: verseDetails.verseNumber,
        sanskritText: verseDetails.sanskritText,
        transliteration: verseDetails.transliteration,
        translationText: verseDetails.translationText,
        theme: cardTheme,
      })
        .then((url) => {
          setCardImage(url);
          setIsGenerating(false);
        })
        .catch((err) => {
          console.error('Failed to generate card', err);
          setIsGenerating(false);
        });
    }
  }, [isOpen, verseDetails, cardTheme]);

  if (!isOpen || !verseDetails) return null;

  const handleDownload = () => {
    if (!cardImage) return;
    const filename = `${verseDetails.sourceName.replace(/\s+/g, '_')}_Ch${verseDetails.chapterNumber}_V${verseDetails.verseNumber}.png`;
    downloadImage(cardImage, filename);
  };

  const handleShare = async () => {
    if (!cardImage) return;
    const title = `${verseDetails.sourceName} — Ch. ${verseDetails.chapterNumber}, Verse ${verseDetails.verseNumber}`;
    const text = `"${verseDetails.translationText}" — Explore more on DharmaPragya`;
    const shared = await shareImageFile(cardImage, title, text);
    if (!shared) {
      handleDownload();
    }
  };

  const embedCode = `<iframe src="https://dharma-pragya.vercel.app/?mode=read&source=${encodeURIComponent(verseDetails.sourceName)}&chapter=${verseDetails.chapterNumber}&verse=${verseDetails.verseNumber}" width="100%" height="450" frameborder="0" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"></iframe>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-cream-100 dark:bg-[#1a1613] rounded-3xl border border-cream-400 dark:border-[#3a3229] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-cream-300 to-cream-200 dark:from-[#221c17] dark:to-[#1a1613] border-b border-cream-400 dark:border-[#2d261e] flex items-center justify-between">
          <div>
            <h3 className="font-cinzel font-bold text-base text-saffron-800 dark:text-saffron-200">
              Share Scripture Card
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {verseDetails.sourceName} &bull; Ch. {verseDetails.chapterNumber}, Verse {verseDetails.verseNumber}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-500 hover:text-saffron-700 dark:hover:text-saffron-300 hover:bg-cream-400/40 dark:hover:bg-[#2e2720] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Image Card vs Embed Widget */}
        <div className="flex border-b border-cream-300 dark:border-[#2d261e] bg-cream-200/50 dark:bg-[#161310] px-6 pt-2">
          <button
            onClick={() => setActiveTab('image')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'border-saffron-600 text-saffron-700 dark:text-saffron-300'
                : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
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
                ? 'border-saffron-600 text-saffron-700 dark:text-saffron-300'
                : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
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
              {/* Card Theme Picker */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400 font-semibold">Card Palette:</span>
                <div className="flex bg-cream-300 dark:bg-[#25201b] p-1 rounded-xl border border-cream-400 dark:border-[#3a3229]">
                  <button
                    onClick={() => setCardTheme('day')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      cardTheme === 'day'
                        ? 'bg-white dark:bg-[#1a1613] text-saffron-700 shadow-xs'
                        : 'text-stone-500 hover:text-saffron-600'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Surya (Parchment)</span>
                  </button>
                  <button
                    onClick={() => setCardTheme('night')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      cardTheme === 'night'
                        ? 'bg-[#141210] text-amber-400 shadow-xs'
                        : 'text-stone-500 hover:text-saffron-600'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Chandra (Basalt)</span>
                  </button>
                </div>
              </div>

              {/* Card Preview */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-cream-400 dark:border-[#3a3229] shadow-md bg-stone-900 flex items-center justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-2 text-saffron-400 text-xs">
                    <div className="w-6 h-6 border-2 border-saffron-400 border-t-transparent rounded-full animate-spin" />
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
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!cardImage}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-cream-300 dark:bg-[#25201b] hover:bg-cream-400 dark:hover:bg-[#2e2720] text-saffron-800 dark:text-saffron-200 border border-cream-400 dark:border-[#3a3229] transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={handleShare}
                  disabled={!cardImage}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-saffron-600 to-terracotta-700 hover:from-saffron-500 hover:to-terracotta-600 text-white transition-all cursor-pointer shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Shloka</span>
                </button>
              </div>
            </>
          ) : (
            /* Embed Widget Option */
            <div className="space-y-4">
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                Embed this exact verse card onto your blog, temple website, or personal study notes.
              </p>

              <div className="relative">
                <textarea
                  readOnly
                  value={embedCode}
                  rows={4}
                  className="w-full p-3 font-mono text-[11px] bg-stone-900 text-stone-200 rounded-xl border border-stone-700 focus:outline-none"
                />
                <button
                  onClick={copyEmbed}
                  className="absolute right-2.5 bottom-3 flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-saffron-600 hover:bg-saffron-500 text-white cursor-pointer transition-all shadow-xs"
                >
                  {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmbed ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="p-3 bg-cream-200/60 dark:bg-[#161310] rounded-xl border border-cream-400 dark:border-[#2d261e] text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
                <span className="font-bold text-saffron-700 dark:text-saffron-300 block">Direct URL Link:</span>
                <span className="break-all font-mono select-all text-[10px]">
                  {`https://dharma-pragya.vercel.app/?mode=read&source=${encodeURIComponent(verseDetails.sourceName)}&chapter=${verseDetails.chapterNumber}&verse=${verseDetails.verseNumber}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
