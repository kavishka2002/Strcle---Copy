import { describe, expect, it } from "vitest";
import { formatGradeForCard, formatGradeForLanguage } from "./grade";

describe("localized grade labels", () => {
  it("shows the Sinhala grade name when Sinhala is selected", () => {
    expect(formatGradeForLanguage("Grade 5", "Sinhala")).toBe("5 ශ්‍රේණිය");
    expect(formatGradeForLanguage("6", "Sinhala")).toBe("6 ශ්‍රේණිය");
  });

  it("preserves English and bilingual grade labels", () => {
    expect(formatGradeForLanguage("Grade 5", "English")).toBe("Grade 5");
    expect(formatGradeForLanguage("Grade 5", "Sinhala + English")).toBe("Grade 5 / 5 ශ්‍රේණිය");
  });

  it("does not rewrite unrecognized values", () => {
    expect(formatGradeForLanguage("Kindergarten", "Sinhala")).toBe("Kindergarten");
    expect(formatGradeForLanguage("Grade 14", "Sinhala")).toBe("Grade 14");
  });

  it("always shows English grades on English subject cards", () => {
    expect(formatGradeForCard("3 ශ්‍රේණිය", "Sinhala", true)).toBe("Grade 3");
    expect(formatGradeForCard("Grade 5", "Sinhala + English", true)).toBe("Grade 5");
    expect(formatGradeForCard("3 ශ්‍රේණිය", "Sinhala", false)).toBe("3 ශ්‍රේණිය");
  });
});
