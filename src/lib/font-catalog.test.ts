import { describe, expect, it } from "vitest";
import { englishFonts, fontCategories, fontPreviewText, normalizeFontSelection, resolvedFontWeight, sinhalaFonts, textFontStack } from "./font-catalog";

describe("local font catalog", () => {
  it("offers the requested English and Sinhala families across the listed categories", () => {
    expect(englishFonts.map(font => font.family)).toHaveLength(12);
    expect(sinhalaFonts.map(font => font.family)).toEqual(["Noto Sans Sinhala", "Noto Serif Sinhala", "Abhaya Libre", "Gemunu Libre", "Yaldevi"]);
    expect(new Set(englishFonts.map(font => font.category))).toEqual(new Set(fontCategories));
    expect(fontPreviewText.sinhala).toContain("ශ්‍රී ලංකාව");
    expect(fontPreviewText.sinhala).toContain("ක්‍රියාකාරකම්");
  });

  it("uses a Sinhala-capable fallback and preserves the old bold-field default", () => {
    expect(textFontStack("Poppins", "Abhaya Libre")).toBe('"Poppins", "Abhaya Libre", "Noto Sans Sinhala", sans-serif');
    expect(normalizeFontSelection("Noto Sans Sinhala")).toEqual({ english: "Inter", sinhala: "Noto Sans Sinhala" });
    expect(resolvedFontWeight({ bold: true })).toBe(700);
    expect(resolvedFontWeight({ bold: false, fontWeight: 500 })).toBe(500);
  });
});
