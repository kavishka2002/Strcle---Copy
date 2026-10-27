export interface SheetLayout {
  columns: number;
  rows: number;
  perPage: number;
  pages: number;
  usableWidth: number;
  usableHeight: number;
}

export function calculateSheetLayout(
  widthMm: number,
  heightMm: number,
  copies: number,
  marginMm = 4,
  gapXmm = 2.5,
  gapYmm = 2.5,
  pageWidthMm = 210,
  pageHeightMm = 297
): SheetLayout {
  if (![widthMm, heightMm, copies, marginMm, gapXmm, gapYmm, pageWidthMm, pageHeightMm].every(Number.isFinite) ||
      widthMm <= 0 || heightMm <= 0 || copies < 1 || !Number.isInteger(copies) || marginMm < 0 || gapXmm < 0 || gapYmm < 0 || pageWidthMm <= 0 || pageHeightMm <= 0) {
    throw new RangeError("Sticker dimensions, copies, margins, and gaps must be valid positive measurements.");
  }
  const usableWidth = pageWidthMm - marginMm * 2;
  const usableHeight = pageHeightMm - marginMm * 2;
  const columns = Math.max(0, Math.floor((usableWidth + gapXmm) / (widthMm + gapXmm)));
  const rows = Math.max(0, Math.floor((usableHeight + gapYmm) / (heightMm + gapYmm)));
  const perPage = columns * rows;
  if (!perPage) throw new RangeError("The sticker does not fit on an A4 page with these margins.");
  return { columns, rows, perPage, pages: Math.ceil(copies / perPage), usableWidth, usableHeight };
}
