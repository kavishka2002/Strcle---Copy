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
