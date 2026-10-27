import { describe, expect, it } from "vitest";
import { subjectPresets } from "../data/templates";
import { englishSubjectName, isEnglishCardSubject, subjectNameForLanguage } from "./subject-labels";

describe("English subject labels", () => {
  it.each([
    ["ගණිතය", "Mathematics"],
    ["ඉංග්‍රීසි", "English"],
    ["සිංහල", "Sinhala"],
    ["දෙමළ", "Tamil"],
    ["පරිසරය", "Environmental Studies"],
    ["ආගම", "Religion"],
    ["චිත්‍ර", "Art"]
  ])("translates a legacy Sinhala label %s", (label, expected) => {
    expect(englishSubjectName({ en: label, si: label })).toBe(expected);
  });

  it("uses an English value when the stored English field contains Sinhala", () => {
    expect(englishSubjectName({ en: "සිංහල", si: "Sinhala" })).toBe("Sinhala");
  });

  it("preserves an existing English label", () => {
    expect(englishSubjectName({ en: "Mathematics", si: "ගණිතය" })).toBe("Mathematics");
  });

  it("does not display an unknown Sinhala-only label in English mode", () => {
    expect(englishSubjectName({ en: "අලුත් විෂය", si: "අලුත් විෂය" })).toBe("Custom subject");
  });

  it("prints non-English subjects in Sinhala while keeping English subject labels in English", () => {
    expect(subjectNameForLanguage({ en: "Mathematics", si: "ගණිතය" }, "Sinhala")).toBe("ගණිතය");
    expect(subjectNameForLanguage({ en: "English Workbook", si: "English Workbook" }, "Sinhala")).toBe("English Workbook");
    expect(subjectNameForLanguage({ en: "English", si: "ඉංග්‍රීසි" }, "Sinhala")).toBe("English");
    expect(subjectNameForLanguage({ en: "Mathematics", si: "ගණිතය" }, "English")).toBe("Mathematics");
  });

  it("recognizes English book subjects for English-only card details", () => {
    expect(isEnglishCardSubject("English Pupil Book 1-5")).toBe(true);
    expect(isEnglishCardSubject("English Workbook")).toBe(true);
    expect(isEnglishCardSubject("ගණිතය")).toBe(false);
  });

  it("includes the requested Grade 1-5 writing and book subjects", () => {
    const labels = subjectPresets["1-5"].map(subject => subject.si);
    expect(labels).toEqual(expect.arrayContaining([
      "අසා ලිවීම",
      "රචනා",
      "නිර්මාණාත්මක වැකි ලිවීම",
      "පස් රූල් පොත",
      "English Pupil Book 1-5"
    ]));
  });
});
