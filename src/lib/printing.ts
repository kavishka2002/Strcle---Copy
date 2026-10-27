import type { StickerDesign } from "@/types";
import { isEnglishCardSubject } from "./subject-labels";

export function getPrintSubjects(design: StickerDesign): string[] {
  const selectedSubjects = design.printSubjects?.map(subject => subject.trim()).filter(Boolean) ?? [];
  if (selectedSubjects.length) return selectedSubjects;

  const subjectText = design.texts.find(text => text.field === "subject")?.text.trim() ?? "";
  if (!subjectText) return [""];
  return subjectText.split(/\s+•\s+/).map(subject => subject.trim()).filter(Boolean);
}

export function getPrintStickerCount(copiesPerSubject: number, subjects: string[]): number {
  if (!Number.isInteger(copiesPerSubject) || copiesPerSubject < 1 || subjects.length < 1) {
    throw new RangeError("Copies per subject and the subject list must not be empty.");
  }
  return copiesPerSubject * subjects.length;
}

export function createPrintSticker(design: StickerDesign, subject: string): StickerDesign {
  const englishSubject = isEnglishCardSubject(subject);
  const name = englishSubject ? design.englishCardName : design.defaultCardName;
  const grade = englishSubject ? design.englishCardGrade : design.defaultCardGrade;
  const school = englishSubject ? design.englishCardSchool : design.defaultCardSchool;
  return {
    ...design,
    texts: design.texts.map(text => text.field === "subject"
      ? {
        ...text,
        text: subject,
        visible: Boolean(subject),
        fontSize: design.printSubjects?.length ? Math.max(text.fontSize, subject.length > 25 ? 9 : 12) : text.fontSize
      }
      : text.field === "name" && name !== undefined
        ? { ...text, text: name, visible: Boolean(name.trim()) }
        : text.field === "grade" && grade !== undefined
          ? { ...text, text: grade, visible: Boolean(grade.trim()) }
        : text.field === "school" && school !== undefined
          ? { ...text, text: school, visible: Boolean(school.trim()) }
      : text),
    printSubjects: undefined
  };
}

export function getPrintSubjectIndex(stickerIndex: number, subjectCount: number): number {
  if (!Number.isInteger(stickerIndex) || stickerIndex < 0 || !Number.isInteger(subjectCount) || subjectCount < 1) {
    throw new RangeError("Sticker index and subject count must be valid positive values.");
  }
  return stickerIndex % subjectCount;
}
