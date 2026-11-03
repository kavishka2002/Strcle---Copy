import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  duplicateWorksheetDraft, formatWorksheetNumber, generateWorksheetExercises, validateWorksheetDraft,
  worksheetCategories, worksheetTemplates, type WorksheetDraft
} from "./worksheets";

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

  it("meets the minimum ready-to-use template count in every category", () => {
    const minimums = [12, 10, 12, 15, 15, 10, 10, 10, 15];
    worksheetCategories.forEach((category, index) => {
      expect(worksheetTemplates.filter(template => template.category === category).length).toBeGreaterThanOrEqual(minimums[index]);
    });
  });

  it("gives every default template real bilingual exercises and both language options", () => {
    for (const template of worksheetTemplates) {
      const exercises = generateWorksheetExercises({
        ...template,
        sourceTemplateId: template.id,
        startNumber: 1,
        endNumber: 100,
        selectedLetters: "",
        shuffleMatches: false,
        letterCase: "uppercase",
        coloringCategory: "Animals"
      }, Math.min(template.exerciseCount, 12));
      expect(exercises.length).toBe(Math.min(template.exerciseCount, 12));
      expect(exercises.every(item => item.prompt.trim() && item.promptSinhala?.trim())).toBe(true);
      expect(new Set(exercises.map(item => `${item.prompt}|${item.answer}|${item.picture ?? ""}`)).size, template.id).toBe(exercises.length);
      expect(template.languages).toEqual(["English", "Sinhala"]);
      if (template.category === "Colouring Pages") {
        expect(exercises[0].kind).toBe("color");
        expect(exercises[0].picture).toMatch(/^color-/);
      }
    }
  });

  it("uses a bundled black-and-white SVG for each ready-to-print colouring page", () => {
    const sprite = readFileSync(resolve(process.cwd(), "public/worksheets/coloring-library.svg"), "utf8");
    const templates = worksheetTemplates.filter(template => template.category === "Colouring Pages");
    expect(templates).toHaveLength(15);
    for (const template of templates) {
      const [item] = generateWorksheetExercises({
        ...template,
        sourceTemplateId: template.id,
        startNumber: 1,
        endNumber: 10,
        selectedLetters: "",
        shuffleMatches: false,
        letterCase: "uppercase",
        coloringCategory: "Animals"
      }, 1);
      expect(item.kind).toBe("color");
      expect(sprite).toContain(`<symbol id="${item.picture?.replace("color-", "")}"`);
    }
  });

  it("deep-copies customized exercise data so edits cannot touch a saved original", () => {
    const defaultTemplate = worksheetTemplates.find(template => template.id === "si-vowels");
    const original: WorksheetDraft = {
      id: "original", title: "Original", category: worksheetCategories[0], activity: "Trace letters",
      language: "Sinhala", grade: 1, difficulty: "Easy", orientation: "portrait", fontFamily: "Noto Sans Sinhala",
      borderStyle: "solid", letterCase: "uppercase", coloringCategory: "Animals", fontSize: 20, lineSpacing: 1.6,
      textColor: "#26394a", background: "#ffffff", borderColor: "#77a98f", schoolName: "", studentName: true,
      gradeDate: true, instructions: "Write.", includeAnswerKey: false, startNumber: 1, endNumber: 10,
      selectedLetters: "", shuffleMatches: false,
      exercises: [{
        id: "q1", prompt: "A", promptSinhala: "අ", answer: "A", answerSinhala: "අ",
        choices: ["A", "B"], choicesSinhala: ["අ", "බ"]
      }],
      createdAt: 1, updatedAt: 1
    };
    const copy = duplicateWorksheetDraft(original, "custom", 2);
    copy.exercises[0].promptSinhala = "ආ";
    copy.exercises[0].choices?.push("C");
    copy.exercises[0].choicesSinhala?.push("ඇ");
    expect(copy.id).toBe("custom");
    expect(original.exercises[0].promptSinhala).toBe("අ");
    expect(original.exercises[0].choices).toEqual(["A", "B"]);
    expect(original.exercises[0].choicesSinhala).toEqual(["අ", "බ"]);
    expect(defaultTemplate?.title).toBe("Sinhala vowels practice");
  });

  it("provides localized matching choices and answer values present in the choice list", () => {
    const makeExercises = (id: string) => {
      const template = worksheetTemplates.find(item => item.id === id);
      if (!template) throw new Error(`Missing worksheet template: ${id}`);
      return generateWorksheetExercises({
        ...template,
        sourceTemplateId: template.id,
        startNumber: 1,
        endNumber: 100,
        selectedLetters: "",
        shuffleMatches: false,
        letterCase: "uppercase",
        coloringCategory: "Animals"
      }, template.exerciseCount);
    };

    const alphabetMatches = makeExercises("en-picture-match");
    expect(alphabetMatches.every(item => item.choices?.includes(item.answer))).toBe(true);

    const fruitMatches = makeExercises("match-fruits");
    expect(fruitMatches.every(item => item.choicesSinhala?.length === item.choices?.length)).toBe(true);
    expect(fruitMatches[0].choicesSinhala).toContain("ඇපල්");
  });

  it("rejects incomplete or invalid saved worksheet drafts", () => {
    const invalid = {
      id: "invalid", title: " ", category: worksheetCategories[0], activity: "Trace letters" as const,
      language: "English" as const, grade: 9, difficulty: "Easy" as const, orientation: "portrait" as const,
      fontFamily: "Nunito", borderStyle: "solid" as const, letterCase: "uppercase" as const,
      coloringCategory: "Animals" as const, fontSize: 50, lineSpacing: 0, textColor: "red",
      background: "#ffffff", borderColor: "#ffffff", schoolName: "", studentName: true, gradeDate: true,
      instructions: "", includeAnswerKey: false, startNumber: 1, endNumber: 10, selectedLetters: "",
      shuffleMatches: false, exercises: [], createdAt: 1, updatedAt: 1
    };
    expect(validateWorksheetDraft(invalid)).toHaveLength(7);
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
