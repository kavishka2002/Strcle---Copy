import { describe, expect, it } from "vitest";
import { createOlPaper, createScholarshipPaper } from "./ol-papers";

describe("createOlPaper", () => {
  it("normalizes duplicate subject and syllabus details while retaining the original PDF path", () => {
    expect(createOlPaper(
      "2017 ol",
      "2017-ol-appreciation-of-sinhala-literary-texts-new-syllabus-sinhala-new-syllabus (1).pdf"
    )).toEqual({
      id: "2017-2017-ol-appreciation-of-sinhala-literary-texts-new-syllabus-sinhala-new-syllabus (1).pdf",
      exam: "O/L",
      year: 2017,
      subject: "Appreciation of Sinhala Literary Texts",
      medium: "Sinhala medium",
      syllabus: "New syllabus",
      fileName: "2017-ol-appreciation-of-sinhala-literary-texts-new-syllabus-sinhala-new-syllabus (1).pdf",
      url: "/papers/2017%20ol/2017-ol-appreciation-of-sinhala-literary-texts-new-syllabus-sinhala-new-syllabus%20(1).pdf"
    });
  });

  it("uses a readable title for subjects without an explicit alias", () => {
    expect(createOlPaper("2024 ol", "2024-ol-geography-sinhala.pdf")?.subject).toBe("Geography");
  });

  it("ignores scholarship folders, non-PDF files, and unsupported years", () => {
    expect(createOlPaper("scolarship paper", "2017-grade-5-scholarship-examination-sinhala.pdf")).toBeNull();
    expect(createOlPaper("2024 ol", "notes.txt")).toBeNull();
    expect(createOlPaper("2026 ol", "2026-ol-science-sinhala.pdf")).toBeNull();
  });

  it("creates a Grade 5 Scholarship paper entry with its local PDF path", () => {
    expect(createScholarshipPaper(
      "scolarship paper",
      "2025-grade-5-scholarship-examination-sinhala.pdf"
    )).toEqual({
      id: "2025-2025-grade-5-scholarship-examination-sinhala.pdf",
      exam: "Grade 5 Scholarship",
      year: 2025,
      subject: "Grade 5 Scholarship",
      medium: "Sinhala medium",
      syllabus: null,
      fileName: "2025-grade-5-scholarship-examination-sinhala.pdf",
      url: "/papers/scolarship%20paper/2025-grade-5-scholarship-examination-sinhala.pdf"
    });
  });

  it("ignores scholarship PDFs with an invalid filename or folder", () => {
    expect(createScholarshipPaper("other papers", "2025-grade-5-scholarship-examination-sinhala.pdf")).toBeNull();
    expect(createScholarshipPaper("scolarship paper", "scholarship-notes.pdf")).toBeNull();
  });
});
