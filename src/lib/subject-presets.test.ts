import { describe, expect, it } from "vitest";
import { subjectPresets } from "../data/templates";
import { addMissingStarterSubjects } from "./subject-presets";

describe("subject preset updates", () => {
  it("adds new Grade 1-5 starter subjects to a saved preset without removing user entries", () => {
    const saved = [
      { en: "Mathematics", si: "ගණිතය" },
      { en: "My Custom Subject", si: "මගේ විෂය" }
    ];

    const result = addMissingStarterSubjects(saved, subjectPresets["1-5"]);

    expect(result).toEqual(expect.arrayContaining([
      ...saved,
      { en: "Dictation", si: "අසා ලිවීම" },
      { en: "Essay Writing", si: "රචනා" },
      { en: "Creative Sentence Writing", si: "නිර්මාණාත්මක වැකි ලිවීම" },
      { en: "Five-Ruled Book", si: "පස් රූල් පොත" },
      { en: "English Workbook", si: "English Workbook" },
      { en: "English Pupil Book 1-5", si: "English Pupil Book 1-5" }
    ]));
  });

  it("does not duplicate a subject already saved under its Sinhala name", () => {
    const saved = [{ en: "User's Dictation", si: "අසා ලිවීම" }];
    const result = addMissingStarterSubjects(saved, [
      { en: "Dictation", si: "අසා ලිවීම" },
      { en: "Essay Writing", si: "රචනා" }
    ]);

    expect(result).toEqual([
      saved[0],
      { en: "Essay Writing", si: "රචනා" }
    ]);
  });
});
