import type { LanguageMode } from "@/types";

export function formatGradeForLanguage(value: string, language: LanguageMode): string {
  const number = /(?:grade\s*)?(\d{1,2})/i.exec(value)?.[1];
  if (!number) return value;
  const grade = Number(number);
  if (grade < 1 || grade > 13) return value;
  if (language === "Sinhala") return `${grade} ශ්‍රේණිය`;
  if (language === "Sinhala + English") return `Grade ${grade} / ${grade} ශ්‍රේණිය`;
  return `Grade ${grade}`;
}

export function formatGradeForCard(value: string, language: LanguageMode, englishSubject: boolean): string {
  if (!englishSubject) return formatGradeForLanguage(value, language);
  const number = /\d{1,2}/.exec(value)?.[0];
  if (number && Number(number) >= 1 && Number(number) <= 13) return `Grade ${Number(number)}`;
  return /[\u0D80-\u0DFF]/.test(value) ? "" : value.trim();
}

export type GradeClassFormat = "grade-class" | "compact" | "class-label";

export function formatGradeAndClass(
  grade: string,
  classDivision: string,
  language: LanguageMode,
  englishSubject: boolean,
  format: GradeClassFormat = "grade-class"
): string {
  const formattedGrade = formatGradeForCard(grade, language, englishSubject);
  const division = classDivision.trim();
  if (!division) return formattedGrade;
  if (!formattedGrade) return division;
  if (format === "compact") {
    const number = /\d{1,2}/.exec(formattedGrade)?.[0];
    return number && Number(number) >= 1 && Number(number) <= 13
      ? `${Number(number)}-${division}`
      : `${formattedGrade}-${division}`;
  }
  if (format === "class-label") return `${formattedGrade} · Class ${division}`;
  const number = /\d{1,2}/.exec(formattedGrade)?.[0];
  const gradeText = (englishSubject || language === "English") && number && Number(number) >= 1 && Number(number) <= 13
    ? `Grade ${number.padStart(2, "0")}`
    : formattedGrade;
  return `${gradeText} - ${division}`;
}
