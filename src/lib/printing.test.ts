import { describe, expect, it } from "vitest";
import { createSubjectDesign } from "./design";
import { calculateSheetLayout } from "./layout";
import { createPrintSticker, getPrintStickerCount, getPrintSubjectIndex, getPrintSubjects } from "./printing";
import type { StickerTemplate } from "@/types";

const template: StickerTemplate = {
  id: "print-test", name: "Print test", kind: "sticker", widthMm: 90, heightMm: 45,
  background: "#ffffff", borderColor: "#000000", accent: "#000000", borderStyle: "solid",
  radius: 4, layout: "centered", decoration: "", favourite: false, createdAt: 0, updatedAt: 0
};

describe("subject-specific A4 printing", () => {
  const design = createSubjectDesign("Nethmi", {
    name: "Nethmi", grade: "Grade 5", school: "Central School"
  }, ["සිංහල", "Mathematics", "Science"], template, "Sinhala");

  it("shows one subject in the editor while retaining all selected subjects for printing", () => {
    expect(design.texts.find(text => text.field === "subject")?.text).toBe("සිංහල");
    expect(getPrintSubjects(design)).toEqual(["සිංහල", "Mathematics", "Science"]);
  });

  it("uses the complete selected-subject list even when the editor text shows only one subject", () => {
    const editorDesign = {
      ...design,
      texts: design.texts.map(text => text.field === "subject" ? { ...text, text: "සිංහල" } : text)
    };

    expect(getPrintSubjects(editorDesign)).toEqual(["සිංහල", "Mathematics", "Science"]);
    expect(Array.from({ length: 3 }, (_, index) => createPrintSticker(editorDesign, getPrintSubjects(editorDesign)[index])
      .texts.find(text => text.field === "subject")?.text)).toEqual(["සිංහල", "Mathematics", "Science"]);
  });

  it("treats copies as the quantity for each subject", () => {
    const subjects = getPrintSubjects(design);
    expect(getPrintStickerCount(2, subjects)).toBe(6);
    expect(Array.from({ length: 6 }, (_, index) => subjects[getPrintSubjectIndex(index, subjects.length)])).toEqual([
      "සිංහල", "Mathematics", "Science", "සිංහල", "Mathematics", "Science"
    ]);
  });

  it("repeats student details and prints only the assigned subject on each card", () => {
    for (const subject of getPrintSubjects(design)) {
      const card = createPrintSticker(design, subject);
      expect(card.texts.find(text => text.field === "name")?.text).toBe("Nethmi");
      expect(card.texts.find(text => text.field === "grade")?.text).toBe("Grade 5");
      expect(card.texts.find(text => text.field === "school")?.text).toBe("Central School");
      expect(card.texts.find(text => text.field === "subject")?.text).toBe(subject);
    }
  });

  it("uses English name and school only on the English subject card", () => {
    const mixedDesign = createSubjectDesign("කවිඳු පෙරේරා", {
      name: "කවිඳු පෙරේරා", grade: "5 ශ්‍රේණිය", school: "ABC විද්‍යාලය"
    }, ["සිංහල", "English"], template, "Sinhala", {
      name: "Kavindu Perera",
      grade: "Grade 5",
      school: "ABC College"
    });
    const subjects = getPrintSubjects(mixedDesign);
    const sinhalaCard = createPrintSticker(mixedDesign, "සිංහල");
    const englishCard = createPrintSticker(mixedDesign, "English");

    expect(subjects).toEqual(["සිංහල", "English"]);
    expect(mixedDesign.texts.find(text => text.field === "subject")?.text).toBe("English");
    expect(sinhalaCard.texts.find(text => text.field === "name")?.text).toBe("කවිඳු පෙරේරා");
    expect(sinhalaCard.texts.find(text => text.field === "school")?.text).toBe("ABC විද්‍යාලය");
    expect(sinhalaCard.texts.find(text => text.field === "subject")?.text).toBe("සිංහල");
    expect(englishCard.texts.find(text => text.field === "name")?.text).toBe("Kavindu Perera");
    expect(englishCard.texts.find(text => text.field === "school")?.text).toBe("ABC College");
    expect(englishCard.texts.find(text => text.field === "subject")?.text).toBe("English");
    expect(englishCard.texts.find(text => text.field === "grade")?.text).toBe("Grade 5");
  });

  it.each(["English Workbook", "English Book", "English Textbook", "English Pupil Book 1-5"])(
    "uses English name, school, and grade on %s cards only",
    subject => {
      const mixedDesign = createSubjectDesign("කවිඳු පෙරේරා", {
        name: "කවිඳු පෙරේරා", grade: "5 ශ්‍රේණිය", school: "ABC විද්‍යාලය"
      }, ["ගණිතය", subject], template, "Sinhala", {
        name: "Kavindu Perera",
        grade: "Grade 5",
        school: "ABC College"
      });
      const sinhalaCard = createPrintSticker(mixedDesign, "ගණිතය");
      const englishBookCard = createPrintSticker(mixedDesign, subject);

      expect(englishBookCard.texts.find(text => text.field === "name")?.text).toBe("Kavindu Perera");
      expect(englishBookCard.texts.find(text => text.field === "school")?.text).toBe("ABC College");
      expect(englishBookCard.texts.find(text => text.field === "grade")?.text).toBe("Grade 5");
      expect(sinhalaCard.texts.find(text => text.field === "name")?.text).toBe("කවිඳු පෙරේරා");
      expect(sinhalaCard.texts.find(text => text.field === "school")?.text).toBe("ABC විද්‍යාලය");
      expect(sinhalaCard.texts.find(text => text.field === "grade")?.text).toBe("5 ශ්‍රේණිය");
    }
  );

  it("calculates pages from the expanded per-subject copy count", () => {
    const totalStickers = getPrintStickerCount(8, getPrintSubjects(design));
    expect(calculateSheetLayout(design.widthMm, design.heightMm, totalStickers)).toMatchObject({
      perPage: 12,
      pages: 2
    });
  });

  it.each([
    [1, 3],
    [2, 6],
    [4, 12],
    [6, 18],
    [10, 30]
  ])("generates the right number of subject-specific labels for %i copies", (copies, expectedTotal) => {
    const subjects = getPrintSubjects(design);
    expect(getPrintStickerCount(copies, subjects)).toBe(expectedTotal);
    const labels = Array.from({ length: expectedTotal }, (_, index) => subjects[getPrintSubjectIndex(index, subjects.length)]);
    expect(labels.filter(label => label === "සිංහල")).toHaveLength(copies);
    expect(labels.filter(label => label === "Mathematics")).toHaveLength(copies);
    expect(labels.filter(label => label === "Science")).toHaveLength(copies);
  });

  it("keeps name-only designs printable as a single sticker style", () => {
    const nameOnly = createSubjectDesign("Nethmi", {
      name: "Nethmi", grade: "", school: ""
    }, [], template, "English");
    expect(getPrintSubjects(nameOnly)).toEqual([""]);
    expect(getPrintStickerCount(3, getPrintSubjects(nameOnly))).toBe(3);
  });
});
