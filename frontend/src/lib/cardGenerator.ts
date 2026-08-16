export interface CardExportOptions {
  sourceName: string;
  chapterNumber: number;
  verseNumber: number;
  sanskritText: string;
  transliteration?: string;
  translationText: string;
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

  // 1. Background Gradient (Original Warm Cream)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#fdfbf7');
  bgGrad.addColorStop(0.5, '#faf5eb');
  bgGrad.addColorStop(1, '#f5eedc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Radial Sun Glow
  const radialGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 500);
  radialGlow.addColorStop(0, 'rgba(251, 191, 36, 0.15)');
  radialGlow.addColorStop(1, 'rgba(253, 251, 247, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Classical Ornate Border
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  // Inner thin border
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.2)';
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

  // 5. Sanskrit Text (Devanagari) - Deep high-contrast dark with generous sizing
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1c1917';
  ctx.font = 'bold 42px "Tiro Devanagari Sanskrit", "Martel", "Noto Serif Devanagari", serif';
  
  const sanskritLines = options.sanskritText.split('\n');
  let currentY = 245;
  for (const sLine of sanskritLines) {
    if (sLine.trim()) {
      ctx.fillText(sLine.trim(), width / 2, currentY);
      currentY += 62;
    }
  }

  // 6. Transliteration (Crisp readable dark stone-800)
  if (options.transliteration) {
    currentY += 15;
    ctx.font = 'italic 500 24px "Lora", serif';
    ctx.fillStyle = '#292524';
    currentY = wrapText(ctx, options.transliteration, width / 2, currentY, 950, 36, 3);
  }

  // 7. Divider before translation
  currentY += 25;
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, currentY);
  ctx.lineTo(width / 2 + 120, currentY);
  ctx.stroke();

  // 8. English Translation - High contrast bold dark text
  currentY += 55;
  ctx.font = '500 30px "Lora", serif';
  ctx.fillStyle = '#1c1917';
  const quotedTranslation = `"${options.translationText}"`;
  currentY = wrapText(ctx, quotedTranslation, width / 2, currentY, 980, 46, 5);

  // 9. Footer Brand Seal / Watermark
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px "Cinzel", serif, sans-serif';
  ctx.fillStyle = '#5c270a';
  ctx.fillText('DHARMAPRAGYA', width / 2, height - 95);

  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#78350f';
  ctx.fillText('Universal Wisdom of Sanatan Dharma', width / 2, height - 70);

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
