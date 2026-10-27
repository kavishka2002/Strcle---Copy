import type { TextElement } from "@/types";

const MIN_FONT_SIZE = 5;
const PX_PER_MM = 96 / 25.4;

function glyphWidth(character: string): number {
  if (/\s/.test(character)) return 0.3;
  if (/[\u0d80-\u0dff]/.test(character)) return 0.82;
  return 0.56;
}

function lineWidths(text: string, fontSize: number, letterSpacing: number, maxWidth: number): number[] {
  const lines = [0];
  const words = text.trim().split(/\s+/).filter(Boolean);
  const spacing = letterSpacing / fontSize;

  for (const word of words) {
    const spaceWidth = fontSize * (0.3 + spacing);
    const lastLineIndex = lines.length - 1;
    if (lines[lastLineIndex] > 0) {
      if (lines[lastLineIndex] + spaceWidth > maxWidth) lines.push(0);
      else lines[lines.length - 1] += spaceWidth;
    }
    for (const character of [...word]) {
      const characterWidth = fontSize * (glyphWidth(character) + spacing);
      const currentLineIndex = lines.length - 1;
      if (lines[currentLineIndex] > 0 && lines[currentLineIndex] + characterWidth > maxWidth) lines.push(0);
      lines[lines.length - 1] += characterWidth;
      if (lines[lines.length - 1] > maxWidth) {
        return lines;
      }
    }
  }

  return lines;
}

export function getDisplayText(text: TextElement): string {
  return text.field === "custom" && text.customLabel?.trim()
    ? `${text.customLabel.trim()}: ${text.text}`
    : text.text;
}

export function getFittedFontSize(
  text: TextElement,
  stickerWidthMm: number,
  stickerHeightMm: number
): { fontSize: number; fits: boolean } {
  const content = getDisplayText(text);
  const widthMm = stickerWidthMm * text.width / 100;
  const heightMm = stickerHeightMm * (text.height ?? 20) / 100;
  const availableWidth = widthMm * PX_PER_MM;
  const availableHeight = heightMm * PX_PER_MM;
  const maxFontSize = Math.max(MIN_FONT_SIZE, text.fontSize);
  const minFontSize = Math.min(MIN_FONT_SIZE, maxFontSize);

  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 0.5) {
    const widths = text.wrap === false
      ? [[...content].reduce((width, character) => width + (glyphWidth(character) * fontSize) + text.letterSpacing, 0)]
      : lineWidths(content, fontSize, text.letterSpacing, availableWidth);
    const lines = text.wrap === false ? 1 : widths.length;
    if (widths.every(width => width <= availableWidth) && lines * fontSize * text.lineHeight <= availableHeight) {
      return { fontSize, fits: true };
    }
  }

  return { fontSize: minFontSize, fits: false };
}
