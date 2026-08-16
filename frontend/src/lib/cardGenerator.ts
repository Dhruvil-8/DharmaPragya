export interface CardExportOptions {
  sourceName: string;
  chapterNumber: number;
  verseNumber: number;
  sanskritText: string;
  transliteration?: string;
  translationText: string;
  theme?: 'day' | 'night';
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
  const height = 1200; // Square format optimal for WhatsApp & Instagram
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const isNight = options.theme === 'night';

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  if (isNight) {
    bgGrad.addColorStop(0, '#141210');
    bgGrad.addColorStop(0.5, '#1a1613');
    bgGrad.addColorStop(1, '#241e18');
  } else {
    bgGrad.addColorStop(0, '#fdfbf7');
    bgGrad.addColorStop(0.5, '#faf5eb');
    bgGrad.addColorStop(1, '#f5eedc');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Radial Sun Glow
  const radialGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 500);
  if (isNight) {
    radialGlow.addColorStop(0, 'rgba(217, 119, 6, 0.12)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    radialGlow.addColorStop(0, 'rgba(251, 191, 36, 0.15)');
    radialGlow.addColorStop(1, 'rgba(253, 251, 247, 0)');
  }
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Classical Ornate Border
  ctx.strokeStyle = isNight ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  // Inner thin border
  ctx.strokeStyle = isNight ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(62, 62, width - 124, height - 124);

  // Corner decorative flourishes
  const cornerSize = 24;
  ctx.fillStyle = isNight ? '#f59e0b' : '#d97706';
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
  ctx.fillStyle = isNight ? '#f59e0b' : '#b45309';
  ctx.font = 'bold 22px "Cinzel", serif, sans-serif';
  ctx.letterSpacing = '4px';
  const headerText = `${options.sourceName.toUpperCase()} — CHAPTER ${options.chapterNumber}, VERSE ${options.verseNumber}`;
  ctx.fillText(headerText, width / 2, 130);

  // Header dividing line
  const lineGrad = ctx.createLinearGradient(width / 2 - 150, 0, width / 2 + 150, 0);
  lineGrad.addColorStop(0, 'rgba(217, 119, 6, 0)');
  lineGrad.addColorStop(0.5, isNight ? '#f59e0b' : '#d97706');
  lineGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 150, 155);
  ctx.lineTo(width / 2 + 150, 155);
  ctx.stroke();

  // 5. Sanskrit Text (Devanagari)
  ctx.textAlign = 'center';
  ctx.fillStyle = isNight ? '#fef3c7' : '#2d261e';
  ctx.font = 'bold 36px "Tiro Devanagari Sanskrit", "Martel", "Noto Serif Devanagari", serif';
  
  const sanskritLines = options.sanskritText.split('\n');
  let currentY = 240;
  for (const sLine of sanskritLines) {
    if (sLine.trim()) {
      ctx.fillText(sLine.trim(), width / 2, currentY);
      currentY += 56;
    }
  }

  // 6. Transliteration
  if (options.transliteration) {
    currentY += 20;
    ctx.font = 'italic 22px "Lora", serif';
    ctx.fillStyle = isNight ? '#d1c7b7' : '#78716c';
    currentY = wrapText(ctx, options.transliteration, width / 2, currentY, 900, 34, 3);
  }

  // 7. Divider before translation
  currentY += 30;
  ctx.strokeStyle = isNight ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 100, currentY);
  ctx.lineTo(width / 2 + 100, currentY);
  ctx.stroke();

  // 8. English Translation
  currentY += 60;
  ctx.font = '28px "Lora", serif';
  ctx.fillStyle = isNight ? '#f5eedc' : '#44403c';
  const quotedTranslation = `"${options.translationText}"`;
  currentY = wrapText(ctx, quotedTranslation, width / 2, currentY, 950, 44, 5);

  // 9. Footer Brand Seal / Watermark
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px "Cinzel", serif, sans-serif';
  ctx.fillStyle = isNight ? '#d97706' : '#9a3412';
  ctx.fillText('DHARMAPRAGYA', width / 2, height - 100);

  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = isNight ? 'rgba(245, 238, 220, 0.5)' : 'rgba(120, 53, 15, 0.6)';
  ctx.fillText('Universal Wisdom of Sanatan Dharma', width / 2, height - 76);

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

export async function shareImageFile(dataUrl: string, title: string, text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'shloka.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return true;
    }
  } catch (e) {
    console.warn('Native share failed, falling back to download', e);
  }
  return false;
}
