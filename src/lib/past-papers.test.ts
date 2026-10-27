import { describe, expect, it } from "vitest";
import {
  isSafeSourceUrl,
  sanitizePaperFilename,
  samePaperMetadata,
  validatePdfFile
} from "./past-papers";

describe("past paper helpers", () => {
  it("sanitizes PDF filenames and validates PDF signatures", async () => {
    expect(sanitizePaperFilename('Math/2024: "Final".PDF')).toBe("Math-2024- -Final-.pdf");
    const valid = new File(["%PDF-1.7\nbody"], "paper.pdf", { type: "application/pdf" });
    const invalid = new File(["<html>not a PDF</html>"], "paper.pdf", { type: "application/pdf" });
    await expect(validatePdfFile(valid)).resolves.toBeUndefined();
    await expect(validatePdfFile(invalid)).rejects.toThrow("valid PDF signature");
    await expect(validatePdfFile(valid, 3)).rejects.toThrow("50 MB or smaller");
  });

  it("accepts only HTTP(S) source URLs and matches complete paper metadata", () => {
    expect(isSafeSourceUrl("https://doenets.lk/papers")).toBe(true);
    expect(isSafeSourceUrl("javascript:alert(1)")).toBe(false);
    const paper = { examination: "A/L" as const, year: 2023, subject: "Physics", medium: "English" as const, paperKind: "Question Paper" as const };
    expect(samePaperMetadata(paper, { ...paper, subject: " physics " })).toBe(true);
    expect(samePaperMetadata(paper, { ...paper, paperKind: "Marking Scheme" })).toBe(false);
  });
});
