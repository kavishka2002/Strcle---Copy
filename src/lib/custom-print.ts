export type CustomPrintTool =
  | "numbers"
  | "alphabet"
  | "mini-art"
  | "shapes"
  | "rewards"
  | "text-labels"
  | "bulk-builder"
  | "saved";

export type CustomPrintShape = "circle" | "square" | "rounded" | "rectangle" | "triangle" | "star" | "heart" | "image";
import type { EnglishFontFamily, SinhalaFontFamily } from "@/types";

export type CustomPrintFont = EnglishFontFamily | SinhalaFontFamily;
export type CustomPrintFit = "contain" | "cover" | "crop";
export type NumberLabelStyle = "digits" | "english-words" | "sinhala-words";
export type CustomPrintFontTargetMode = "all" | "selected" | "individual";

export interface CustomPrintItem {
  id: string;
  label: string;
  text: string;
  shape: CustomPrintShape;
  widthMm: number;
  heightMm: number;
  copies: number;
  background: string;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  borderStyle: "solid" | "dashed" | "dotted";
  fontSize: number;
  fontFamily: CustomPrintFont;
  bold: boolean;
  align: "left" | "center" | "right";
  rotation?: number;
  artwork?: string;
  assetId?: string;
  fit: CustomPrintFit;
}

export interface CustomPrintDesign {
  id: string;
  name: string;
  tool: CustomPrintTool;
  kind?: "maker" | "order";
  items: CustomPrintItem[];
  printSettings: {
    orientation: "portrait" | "landscape";
    marginMm: number;
    gapMm: number;
    calibration: boolean;
    cutlines: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

export interface CustomPrintPlacement {
  item: CustomPrintItem;
  copyIndex: number;
  page: number;
  xMm: number;
  yMm: number;
}

export interface CustomPrintLayout {
  pages: number;
  total: number;
  usableWidthMm: number;
  usableHeightMm: number;
  placements: CustomPrintPlacement[];
}

const MAX_CUSTOM_PRINT_ITEMS = 5000;
export function updateCustomPrintItems(
  items: CustomPrintItem[],
  selectedIds: string[],
  patch: Partial<CustomPrintItem>
): CustomPrintItem[] {
  const selected = new Set(selectedIds);
  return items.map(item => selected.has(item.id) ? { ...item, ...patch } : item);
}

export function getCustomPrintFontTargetIds(
  items: CustomPrintItem[],
  mode: CustomPrintFontTargetMode,
  selectedIds: string[],
  activeItemId?: string
): string[] {
  const textItems = items.filter(item => item.text);
  if (mode === "all") return textItems.map(item => item.id);
  if (mode === "individual") {
    return activeItemId && textItems.some(item => item.id === activeItemId) ? [activeItemId] : [];
  }
  const selected = new Set(selectedIds);
  const targets = textItems.filter(item => selected.has(item.id));
  if (targets.length) return targets.map(item => item.id);
  return activeItemId && textItems.some(item => item.id === activeItemId) ? [activeItemId] : [];
}

const englishNumberWords = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"
];
const sinhalaNumberWords = [
  "බිංදුව", "එක", "දෙක", "තුන", "හතර", "පහ", "හය", "හත", "අට", "නවය", "දහය",
  "එකොළහ", "දොළහ", "දහතුන", "දහහතර", "පහළොව", "දහසය", "දහහත", "දහඅට", "දහනවය", "විස්ස"
];

export function formatNumberLabel(value: number, style: NumberLabelStyle): string {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError("Number labels must be non-negative whole numbers.");
  }
  if (style === "digits") return String(value);
  const words = style === "english-words" ? englishNumberWords : sinhalaNumberWords;
  const word = words[value];
  if (!word) {
    throw new RangeError(`${style === "english-words" ? "English" : "Sinhala"} number words are available from 0 to 20.`);
  }
  return word;
}

export function createNumberValues(start: number, end: number): number[] {
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) {
    throw new RangeError("Enter a valid whole-number range where the start is not greater than the end.");
  }
  if (end - start + 1 > MAX_CUSTOM_PRINT_ITEMS) throw new RangeError("A single batch can contain at most 5,000 different labels.");
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function parseCustomLabels(value: string): string[] {
  return value.split(/\r?\n/).filter(line => line.trim().length > 0);
}

export function fitCustomPrintFontSize(item: Pick<CustomPrintItem, "text" | "widthMm" | "heightMm" | "fontSize">): number {
  if (!item.text) return item.fontSize;
  const lines = item.text.split(/\r?\n/);
  const longestLine = Math.max(1, ...lines.map(line => Array.from(line).length));
  const horizontalLimit = item.widthMm * 0.88 / (longestLine * 0.62 * 0.3528);
  const estimatedLineCount = lines.reduce((count, line) =>
    count + Math.max(1, Math.ceil(Array.from(line).length / Math.max(1, Math.floor(item.widthMm / (item.fontSize * 0.62 * 0.3528))))), 0);
  const verticalLimit = item.heightMm * 0.84 / (estimatedLineCount * 1.15 * 0.3528);
  return Math.max(4, Math.min(item.fontSize, horizontalLimit, verticalLimit));
}

export function calculateCustomPrintLayout(
  items: CustomPrintItem[],
  options: {
    orientation: "portrait" | "landscape";
    marginMm: number;
    gapMm: number;
    pageWidthMm?: number;
    pageHeightMm?: number;
  }
): CustomPrintLayout {
  const pageWidthMm = options.pageWidthMm ?? (options.orientation === "portrait" ? 210 : 297);
  const pageHeightMm = options.pageHeightMm ?? (options.orientation === "portrait" ? 297 : 210);
  const { marginMm, gapMm } = options;
  const values = [pageWidthMm, pageHeightMm, marginMm, gapMm];
  if (!values.every(Number.isFinite) || pageWidthMm <= 0 || pageHeightMm <= 0 || marginMm < 0 || gapMm < 0) {
    throw new RangeError("Paper size, margins, and spacing must be valid measurements.");
  }
  const usableWidthMm = pageWidthMm - marginMm * 2;
  const usableHeightMm = pageHeightMm - marginMm * 2;
  if (usableWidthMm <= 0 || usableHeightMm <= 0) throw new RangeError("The margins leave no printable paper area.");

  const placements: CustomPrintPlacement[] = [];
  let page = 0;
  let xMm = marginMm;
  let yMm = marginMm;
  let rowHeightMm = 0;

  for (const item of items) {
    if (![item.widthMm, item.heightMm, item.copies].every(Number.isFinite) ||
        item.widthMm <= 0 || item.heightMm <= 0 || !Number.isInteger(item.copies) || item.copies < 1) {
      throw new RangeError(`“${item.label}” needs positive dimensions and a whole-number copy count.`);
    }
    if (item.widthMm > usableWidthMm || item.heightMm > usableHeightMm) {
      throw new RangeError(`“${item.label}” (${item.widthMm} × ${item.heightMm} mm) does not fit in the printable A4 area.`);
    }
    if (placements.length + item.copies > MAX_CUSTOM_PRINT_ITEMS) {
      throw new RangeError("A print job can contain at most 5,000 individual stickers.");
    }

    for (let copyIndex = 0; copyIndex < item.copies; copyIndex += 1) {
      if (xMm + item.widthMm > pageWidthMm - marginMm) {
        xMm = marginMm;
        yMm += rowHeightMm + gapMm;
        rowHeightMm = 0;
      }
      if (yMm + item.heightMm > pageHeightMm - marginMm) {
        page += 1;
        xMm = marginMm;
        yMm = marginMm;
        rowHeightMm = 0;
      }
      placements.push({ item, copyIndex, page, xMm, yMm });
      xMm += item.widthMm + gapMm;
      rowHeightMm = Math.max(rowHeightMm, item.heightMm);
    }
  }

  return {
    pages: placements.length ? page + 1 : 0,
    total: placements.length,
    usableWidthMm,
    usableHeightMm,
    placements
  };
}
