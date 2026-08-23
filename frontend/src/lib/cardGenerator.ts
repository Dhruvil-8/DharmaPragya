import { formatSanskritVerseLines } from './sanskritUtils';

export interface CardExportOptions {
  sourceName: string;
  chapterNumber: number;
  verseNumber: number;
  sanskritText: string;
  transliteration?: string;
  translationText: string;
  directUrl?: string;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 6
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      linesCount++;
      if (linesCount >= maxLines) {
        line = '...';
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

export async function generateVerseCard(options: CardExportOptions): Promise<string> {
  const width = 1200;
  const height = 1200; // Square format optimal for social sharing
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // 1. Background Gradient (Warm Sacred Cream)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#fdfbf7');
  bgGrad.addColorStop(0.5, '#faf5eb');
  bgGrad.addColorStop(1, '#f5eedc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Radial Sun Glow
  const radialGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 520);
  radialGlow.addColorStop(0, 'rgba(251, 191, 36, 0.18)');
  radialGlow.addColorStop(1, 'rgba(253, 251, 247, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Classical Ornate Border
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  // Inner thin border
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(62, 62, width - 124, height - 124);

  // Corner decorative flourishes
  const cornerSize = 24;
  ctx.fillStyle = '#d97706';
  // Top-left
  ctx.fillRect(46, 46, cornerSize, 4);
  ctx.fillRect(46, 46, 4, cornerSize);
  // Top-right
  ctx.fillRect(width - 50 - cornerSize + 4, 46, cornerSize, 4);
  ctx.fillRect(width - 50, 46, 4, cornerSize);
  // Bottom-left
  ctx.fillRect(46, height - 50, cornerSize, 4);
  ctx.fillRect(46, height - 50 - cornerSize + 4, 4, cornerSize);
  // Bottom-right
  ctx.fillRect(width - 50 - cornerSize + 4, height - 50, cornerSize, 4);
  ctx.fillRect(width - 50, height - 50 - cornerSize + 4, 4, cornerSize);

  // 4. Header Badge: Scripture Source & Coordinate
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5c270a';
  ctx.font = 'bold 24px "Cinzel", serif, sans-serif';
  ctx.letterSpacing = '3px';
  const headerText = `${options.sourceName.toUpperCase()} • CHAPTER ${options.chapterNumber}, VERSE ${options.verseNumber}`;
  ctx.fillText(headerText, width / 2, 130);

  // Header dividing line
  const lineGrad = ctx.createLinearGradient(width / 2 - 180, 0, width / 2 + 180, 0);
  lineGrad.addColorStop(0, 'rgba(180, 83, 9, 0)');
  lineGrad.addColorStop(0.5, '#b45309');
  lineGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 180, 155);
  ctx.lineTo(width / 2 + 180, 155);
  ctx.stroke();

  // 5. Intelligent Sanskrit Meter Segmentation by Danda
  const sanskritLines = formatSanskritVerseLines(options.sanskritText);
  const totalSanskritChars = options.sanskritText.length;
  const isLargeVerse = totalSanskritChars > 110 || sanskritLines.length > 2;

  // Dynamic Typography Scaling
  const skFontSize = isLargeVerse ? 34 : 40;
  const skLineHeight = isLargeVerse ? 52 : 62;
  const maxContentWidth = 1020;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#1c1917';
  ctx.font = `bold ${skFontSize}px "Tiro Devanagari Sanskrit", "Martel", "Noto Serif Devanagari", "Devanagari MT", serif`;

  let currentY = isLargeVerse ? 225 : 245;

  for (const rawLine of sanskritLines) {
    const trimmedLine = rawLine.trim();
    if (!trimmedLine) continue;

    // Check if line width exceeds canvas bounds and wrap if needed
    const metrics = ctx.measureText(trimmedLine);
    if (metrics.width <= maxContentWidth) {
      ctx.fillText(trimmedLine, width / 2, currentY);
      currentY += skLineHeight;
    } else {
      // Wrap long hemistich
      const words = trimmedLine.split(' ');
      let subLine = '';
      for (let n = 0; n < words.length; n++) {
        const testSub = subLine ? subLine + ' ' + words[n] : words[n];
        if (ctx.measureText(testSub).width > maxContentWidth && n > 0) {
          ctx.fillText(subLine, width / 2, currentY);
          subLine = words[n];
          currentY += skLineHeight;
        } else {
          subLine = testSub;
        }
      }
      if (subLine) {
        ctx.fillText(subLine, width / 2, currentY);
        currentY += skLineHeight;
      }
    }
  }

  // 6. Transliteration (IAST)
  if (options.transliteration) {
    currentY += 12;
    ctx.font = isLargeVerse ? 'italic 500 21px "Lora", serif' : 'italic 500 24px "Lora", serif';
    ctx.fillStyle = '#292524';
    const transLineHeight = isLargeVerse ? 32 : 36;
    currentY = wrapText(ctx, options.transliteration, width / 2, currentY, 960, transLineHeight, 3);
  }

  // 7. Divider before translation
  currentY += 18;
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, currentY);
  ctx.lineTo(width / 2 + 120, currentY);
  ctx.stroke();

  // 8. Translation - Dynamic scaling to fit canvas perfectly
  currentY += isLargeVerse ? 42 : 50;
  const transFontSize = isLargeVerse ? 25 : 29;
  const transLineHeight = isLargeVerse ? 38 : 44;
  ctx.font = `500 ${transFontSize}px "Lora", serif`;
  ctx.fillStyle = '#1c1917';
  const quotedTranslation = `"${options.translationText}"`;
  currentY = wrapText(ctx, quotedTranslation, width / 2, currentY, 980, transLineHeight, isLargeVerse ? 6 : 5);

  // 9. Footer Brand Seal & Direct URL Link Badge
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px "Cinzel", serif, sans-serif';
  ctx.fillStyle = '#5c270a';
  ctx.fillText('DHARMAPRAGYA', width / 2, height - 105);

  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#78350f';
  ctx.fillText('Universal Wisdom of Sanatan Dharma', width / 2, height - 80);

  // Direct redirection URL badge
  const displayUrl = options.directUrl 
    ? options.directUrl.replace(/^https?:\/\//, '')
    : `dharmapragya.app • Read Ch. ${options.chapterNumber}, V. ${options.verseNumber}`;
  
  ctx.font = 'bold 13px "Courier New", monospace, sans-serif';
  ctx.fillStyle = '#b45309';
  ctx.fillText(`🔗 ${displayUrl}`, width / 2, height - 58);

  return canvas.toDataURL('image/png');
}

export function downloadImage(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function shareImageFile(dataUrl: string, title: string, text: string, url?: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'shloka.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text,
        url,
        files: [file],
      });
      return true;
    }
  } catch (e) {
    console.warn('Native share failed, falling back to download', e);
  }
  return false;
}
