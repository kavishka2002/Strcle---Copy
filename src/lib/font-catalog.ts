import type { EnglishFontFamily, FontWeight, SinhalaFontFamily, TextElement } from "@/types";

export const englishFonts: Array<{
  family: EnglishFontFamily;
  category: string;
}> = [
  { family: "Fredoka", category: "Cute and playful" },
  { family: "Baloo 2", category: "Cute and playful" },
  { family: "Poppins", category: "Modern and professional" },
  { family: "Inter", category: "Modern and professional" },
  { family: "Lato", category: "Modern and professional" },
  { family: "Montserrat", category: "Bold headings" },
  { family: "Roboto", category: "Simple and readable" },
  { family: "Nunito", category: "Rounded and friendly" },
  { family: "Quicksand", category: "Rounded and friendly" },
  { family: "Playfair Display", category: "Elegant" },
  { family: "Lora", category: "Elegant" },
  { family: "DM Sans", category: "Modern and professional" }
];

export const sinhalaFonts: Array<{
  family: SinhalaFontFamily;
  category: string;
}> = [
  { family: "Noto Sans Sinhala", category: "Simple and readable" },
  { family: "Noto Serif Sinhala", category: "Elegant" },
  { family: "Abhaya Libre", category: "Elegant" },
  { family: "Gemunu Libre", category: "Cute and playful" },
  { family: "Yaldevi", category: "Modern and professional" }
];

export const fontCategories = [
  "Cute and playful",
  "Modern and professional",
  "Rounded and friendly",
  "Elegant",
  "Bold headings",
  "Simple and readable"
];

export const fontPreviewText = {
  english: "Amaya Perera · Grade 4",
  sinhala: "සිංහල · ශ්‍රී ලංකාව · ක්‍රියාකාරකම්"
};

function isSinhalaFontFamily(value: string): value is SinhalaFontFamily {
  return sinhalaFonts.some(font => font.family === value);
}

export function normalizeFontSelection(
  english: EnglishFontFamily | SinhalaFontFamily,
  sinhala?: SinhalaFontFamily
): { english: EnglishFontFamily; sinhala: SinhalaFontFamily } {
  if (isSinhalaFontFamily(english)) {
    return { english: "Inter", sinhala: sinhala ?? english };
  }
  return { english, sinhala: sinhala ?? "Noto Sans Sinhala" };
}

export function textFontStack(
  english: EnglishFontFamily | SinhalaFontFamily,
  sinhala: SinhalaFontFamily = "Noto Sans Sinhala"
): string {
  const normalized = normalizeFontSelection(english, sinhala);
  return `"${normalized.english}", "${normalized.sinhala}", "Noto Sans Sinhala", sans-serif`;
}

export function resolvedFontWeight(text: Pick<TextElement, "fontWeight" | "bold">): FontWeight {
  return text.fontWeight ?? (text.bold ? 700 : 400);
}
