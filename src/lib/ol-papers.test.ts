import { describe, expect, it } from "vitest";
import manifest from "../data/ol-papers-manifest.json";
import { createDriveOlPaper, createOlPaper, createScholarshipPaper } from "./ol-papers";

describe("O/L paper manifest", () => {
  it("contains the complete verified 2015–2025 Drive catalog", () => {
    const records = manifest.papers;
    const expectedYearCounts: Record<number, number> = {
      2015: 34,
      2016: 41,
      2017: 49,
      2018: 34,
      2019: 28,
      2020: 33,
      2021: 37,
      2022: 28,
      2023: 29,
      2024: 30,
      2025: 14
    };

    expect(manifest.version).toBe(1);
    expect(manifest.yearRange).toEqual([2015, 2025]);
    expect(records).toHaveLength(357);
    expect(Object.fromEntries(
      Object.entries(expectedYearCounts).map(([year]) => [
        year,
        records.filter(record => record.year === Number(year)).length
      ])
    )).toEqual(expectedYearCounts);
    expect(new Set(records.map(record => record.id)).size).toBe(records.length);
    expect(new Set(records.map(record => record.driveFileId)).size).toBe(records.length);
    expect(new Set(records.map(record => record.originalFileName)).size).toBe(records.length);

    for (const record of records) {
      expect(record.id).toBe(`ol-${record.driveFileId}`);
      expect(record.year).toBeGreaterThanOrEqual(2015);
      expect(record.year).toBeLessThanOrEqual(2025);
      expect(record.folderName).toBe(`${record.year} ol`);
      expect(record.originalFileName).toMatch(/\.pdf$/i);
      expect(record.driveFileId).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(record.fileType).toBe("application/pdf");
      expect(record.subject).not.toBe("");
      expect(record.displayName).not.toBe("");
      expect(record.language).toMatch(/^(Sinhala|English|Tamil)$/);
    }
  });

  it("contains every PDF listed in the 2025 Drive folder", () => {
    const expectedFiles = [
      ["2025-ol-appreciation-of-sinhala-literary-texts-sinhala.pdf", "1FEroqbMwGAOXXyvEo1hd0XxJZv6mk0v7"],
      ["2025-ol-art-sinhala.pdf", "1YnvdUVCVKU6viylTgCoxhKIgkZoqPdKB"],
      ["2025-ol-buddhism-sinhala.pdf", "1zJrd6DStOYVHwYgUO-Uvl8H_VTQJqI00"],
      ["2025-ol-civic-education-sinhala.pdf", "1SfFA9h0W2oqbzuvIGsws9RFW3ZlTpD31"],
      ["2025-ol-dancing-oriental-sinhala.pdf", "1dwSxehxsq9rbuxSkNV6aJLG2iYO8AuVO"],
      ["2025-ol-english-english.pdf", "11mNwaudIm26v_vuJf0fUegWyw8H3QfSU"],
      ["2025-ol-geography-sinhala.pdf", "11Gmm8VAUQwP0sOyph7y-WRurIGd6-9yJ"],
      ["2025-ol-history-sinhala.pdf", "146xoL-lfUqCfLjUtqwbMRA5frAddXivN"],
      ["2025-ol-information-communication-technology-sinhala.pdf", "1aWRuJbG1rFHIs7XkQFN2nVYzQDgPQvBs"],
      ["2025-ol-mathematics-sinhala.pdf", "1IimDP9aVclTQ47LjwBYH1daVfojAYZ5t"],
      ["2025-ol-music-western-sinhala.pdf", "1LJ20wrHrKXVZA0QYUJfI9yZ0zlOYwCD5"],
      ["2025-ol-science-sinhala.pdf", "1H7DS0_o7ko_2rD7JOKPYgtHHWm5qDErj"],
      ["2025-ol-sinhala-sinhala.pdf", "13CF27u7o2EWdwwzO16K-Gi980RMBCMs2"],
      ["2025-ol-tamil-language-literature-tamil.pdf", "1zGfw4vJMOvUoBq9fP___HHFRiyeylSeo"]
    ];
    const actualFiles = manifest.papers
      .filter(record => record.year === 2025)
      .map(record => [record.originalFileName, record.driveFileId]);

    expect(actualFiles).toEqual(expectedFiles);
  });

  it("maps Drive metadata to the existing paper interface and direct-download URL", () => {
    const paper = createDriveOlPaper(manifest.papers[0]);
    const url = new URL(paper.url);

    expect(paper).toMatchObject({
      id: manifest.papers[0].id,
      exam: "O/L",
      year: manifest.papers[0].year,
      subject: manifest.papers[0].subject,
      medium: `${manifest.papers[0].language} medium`,
      fileName: manifest.papers[0].originalFileName,
      driveFileId: manifest.papers[0].driveFileId,
      fileType: "application/pdf"
    });
    expect(url.origin + url.pathname).toBe("https://drive.google.com/uc");
    expect(url.searchParams.get("export")).toBe("download");
    expect(url.searchParams.get("id")).toBe(manifest.papers[0].driveFileId);
  });
});

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
