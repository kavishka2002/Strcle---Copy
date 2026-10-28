export interface NoticeFitField {
  label: string;
  value: string;
  wide: boolean;
}

export interface NoticeFitOptions {
  pageWidthMm: number;
  pageHeightMm: number;
  orientation: "portrait" | "landscape";
  heading: string;
  fields: NoticeFitField[];
  headingFontSizePt: number;
  bodyFontSizePt: number;
  hasPhoto: boolean;
  hasTranslation: boolean;
  hasFooter: boolean;
}

function estimateLines(text: string, charactersPerLine: number): number {
  return text.split("\n").reduce((total, line) => (
    total + Math.max(1, Math.ceil(line.length / charactersPerLine))
  ), 0);
}

export function calculateNoticeFitScale(options: NoticeFitOptions): number {
  const {
    pageWidthMm, pageHeightMm, orientation, heading, fields, headingFontSizePt,
    bodyFontSizePt, hasPhoto, hasTranslation, hasFooter
  } = options;
  const headingSizeMm = headingFontSizePt * 0.3528;
  const bodySizeMm = bodyFontSizePt * 0.3528;
  const paddingMm = pageWidthMm * (orientation === "landscape" ? 0.12 : 0.16);
  const headingLines = estimateLines(heading, Math.max(8, pageWidthMm * 0.78 / (headingSizeMm * 0.52)));
  const headingHeightMm = 5 + headingLines * headingSizeMm * 1.32 + (hasTranslation ? 7 : 0);
  const rows: number[] = [];
  let currentRow = 0;
  let columnsInRow = 0;

  for (const field of fields) {
    const textWidthMm = pageWidthMm * (field.wide ? 0.82 : 0.37);
    const charactersPerLine = Math.max(10, textWidthMm / (bodySizeMm * 0.52));
    const labelLines = estimateLines(field.label, Math.max(12, textWidthMm / 2.2));
    const valueLines = estimateLines(field.value, charactersPerLine);
    const fieldHeightMm = labelLines * 4.5 + valueLines * bodySizeMm * 1.5 + 2;

    if (field.wide) {
      if (columnsInRow) {
        rows.push(currentRow);
        currentRow = 0;
        columnsInRow = 0;
      }
      rows.push(fieldHeightMm);
    } else {
      currentRow = Math.max(currentRow, fieldHeightMm);
      columnsInRow += 1;
      if (columnsInRow === 2) {
        rows.push(currentRow);
        currentRow = 0;
        columnsInRow = 0;
      }
    }
  }
  if (columnsInRow) rows.push(currentRow);

  const fieldsHeightMm = rows.reduce((total, height) => total + height, 0) + Math.max(0, rows.length - 1) * 6;
  const photoHeightMm = hasPhoto ? pageHeightMm * (orientation === "landscape" ? 0.18 : 0.24) + 6 : 0;
  const fixedHeightMm = paddingMm + photoHeightMm + (hasFooter ? 11 : 0) + 8;
  const flexibleHeightMm = Math.max(1, pageHeightMm - fixedHeightMm);
  const contentHeightMm = headingHeightMm + fieldsHeightMm + pageWidthMm * 0.09 + 4;

  return Math.min(1, Math.max(0.48, flexibleHeightMm / contentHeightMm));
}
