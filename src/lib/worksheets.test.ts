import { describe, expect, it } from "vitest";
import { formatWorksheetNumber, generateWorksheetExercises, worksheetCategories, worksheetTemplates } from "./worksheets";

const draft = (overrides: Partial<Parameters<typeof generateWorksheetExercises>[0]> = {}) => ({
  category: "Mathematics Worksheets" as const,
  activity: "Addition" as const,
  language: "English" as const,
  grade: 1,
  difficulty: "Easy" as const,
  startNumber: 1,
  endNumber: 20,
  selectedLetters: "",
  shuffleMatches: false,
  letterCase: "uppercase" as const,
  coloringCategory: "Animals" as const,
  ...overrides
});

describe("offline worksheet content", () => {
  it("defines starter templates for every learning category", () => {
    expect(new Set(worksheetTemplates.map(template => template.category))).toEqual(new Set(worksheetCategories));
  });

  it("generates content from every built-in starter template", () => {
    for (const template of worksheetTemplates) {
      expect(generateWorksheetExercises({
        ...template,
        startNumber: 1,
        endNumber: 100,
        selectedLetters: "",
        shuffleMatches: true,
        letterCase: "uppercase",
        coloringCategory: "Animals"
      }, 5)).toHaveLength(5);
    }
  });

  it("uses Sinhala numerals while preserving the number's value", () => {
    expect(formatWorksheetNumber(123, "Sinhala")).toBe("෧෨෩");
    expect(formatWorksheetNumber(123, "English")).toBe("123");
    expect(() => formatWorksheetNumber(1.5, "Sinhala")).toThrow(RangeError);
  });

  it("generates arithmetic questions with correct, non-negative answers", () => {
    for (const activity of ["Addition", "Subtraction", "Multiplication", "Division"] as const) {
      const exercises = generateWorksheetExercises(draft({ activity, difficulty: "Medium" }), 20);
      expect(exercises).toHaveLength(20);
      for (const item of exercises) {
        expect(item.answer).toMatch(/^\d+$/);
        const values = item.prompt.match(/\d+/g)?.map(Number) ?? [];
        const answer = Number(item.answer);
        if (activity === "Addition") expect(answer).toBe(values[0] + values[1]);
        if (activity === "Subtraction") expect(answer).toBe(values[0] - values[1]);
        if (activity === "Multiplication") expect(answer).toBe(values[0] * values[1]);
        if (activity === "Division") expect(answer).toBe(values[0] / values[1]);
      }
    }
  });

  it("supports Sinhala letters, English picture words, and number ranges", () => {
    const sinhala = generateWorksheetExercises(draft({
      category: "Sinhala Alphabet Worksheets", activity: "Trace letters", language: "Sinhala"
    }), 5);
    expect(sinhala[0].prompt).toContain("අ");

    const pictures = generateWorksheetExercises(draft({
      category: "English Alphabet Worksheets", activity: "Letter pictures"
    }), 3);
    expect(pictures.map(item => item.answer)).toEqual(["Apple", "Ball", "Cat"]);

    const numbers = generateWorksheetExercises(draft({
      category: "Numbers 1–100", activity: "Trace numbers", startNumber: 41, endNumber: 50
    }), 10);
    expect(numbers.map(item => item.answer)).toEqual(Array.from({ length: 10 }, (_, index) => String(index + 41)));
  });

  it("supports lower-case, selected, and complete English letter sets", () => {
    const lowercase = generateWorksheetExercises(draft({
      category: "English Alphabet Worksheets", activity: "Trace letters", letterCase: "lowercase"
    }), 26);
    expect(lowercase[0].prompt).toContain("a");
    expect(lowercase[25].prompt).toContain("z");
    const selected = generateWorksheetExercises(draft({
      category: "English Alphabet Worksheets", activity: "Trace letters", selectedLetters: "A, C, E"
    }), 3);
    expect(selected.map(item => item.answer)).toEqual(["A", "C", "E"]);
  });

  it("keeps missing-number and before/after answers inside the chosen range", () => {
    const missing = generateWorksheetExercises(draft({
      category: "Numbers 1–100", activity: "Missing numbers", startNumber: 98, endNumber: 100
    }), 3);
    expect(missing.map(item => item.answer)).toEqual(["99", "99", "99"]);
    const neighbors = generateWorksheetExercises(draft({
      category: "Numbers 1–100", activity: "Before and after", startNumber: 1, endNumber: 3
    }), 2);
    expect(neighbors.map(item => item.answer)).toEqual(["1 , 3", "1 , 3"]);
    expect(() => generateWorksheetExercises(draft({
      category: "Numbers 1–100", activity: "Missing numbers", startNumber: 4, endNumber: 5
    }), 1)).toThrow(RangeError);
  });

  it("creates original category-specific coloring and Sinhala word-matching content", () => {
    const coloring = generateWorksheetExercises(draft({
      category: "Colouring Pages", activity: "Colouring", coloringCategory: "Birds"
    }), 2);
    expect(coloring.every(item => item.picture === "bird" && item.kind === "color")).toBe(true);
    const matching = generateWorksheetExercises(draft({
      category: "Matching Activities", activity: "Match words and pictures", language: "Sinhala"
    }), 2);
    expect(matching[0].prompt).toContain("ඇපල්");
  });

  it("generates more challenging Grade 5 activities and valid answer keys", () => {
    const exercises = generateWorksheetExercises(draft({
      category: "Grade 1–5 Activity Sheets", activity: "Grade activity", grade: 5, difficulty: "Advanced"
    }), 12);
    expect(exercises.some(item => item.prompt.includes("÷"))).toBe(true);
    expect(exercises.some(item => item.prompt.includes("/"))).toBe(true);
    expect(exercises.every(item => item.answer.length > 0)).toBe(true);
  });

  it("rejects invalid counts, grades, and number ranges", () => {
    expect(() => generateWorksheetExercises(draft(), 0)).toThrow(RangeError);
    expect(() => generateWorksheetExercises(draft({ grade: 6 }), 1)).toThrow(RangeError);
    expect(() => generateWorksheetExercises(draft({ startNumber: 50, endNumber: 10 }), 1)).toThrow(RangeError);
  });
});
