import { describe, expect, it } from "vitest";
import { formatGradeAndClass, formatGradeForCard, formatGradeForLanguage } from "./grade";

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

  it("supports grade and class formats in English and Sinhala", () => {
    expect(formatGradeAndClass("5", "A", "English", false)).toBe("Grade 05 - A");
    expect(formatGradeAndClass("Grade 5", "12 Science", "English", true, "class-label")).toBe("Grade 5 · Class 12 Science");
    expect(formatGradeAndClass("5", "B", "Sinhala", false, "compact")).toBe("5-B");
    expect(formatGradeAndClass("5", "", "English", false)).toBe("Grade 5");
  });
});
