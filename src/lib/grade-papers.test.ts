import { describe, expect, it } from "vitest";
import manifest from "../data/grade-papers-manifest.json";
import olManifest from "../data/ol-papers-manifest.json";
import { createDriveGradePaper } from "./grade-papers";

describe("Grade 6–9 paper manifest", () => {
  it("contains every catalogued PDF from the four Drive grade folders", () => {
    const expectedCounts: Record<number, number> = { 6: 18, 7: 18, 8: 22, 9: 22 };

    expect(manifest.version).toBe(1);
    expect(manifest.gradeFolders.map(folder => folder.grade)).toEqual([6, 7, 8, 9]);
    expect(manifest.papers).toHaveLength(80);
    expect(Object.fromEntries(
      Object.entries(expectedCounts).map(([grade]) => [
        grade,
        manifest.papers.filter(paper => paper.grade === Number(grade)).length
      ])
    )).toEqual(expectedCounts);
    expect(new Set(manifest.papers.map(paper => paper.id)).size).toBe(80);
    expect(new Set(manifest.papers.map(paper => paper.driveFileId)).size).toBe(80);
    expect(new Set(manifest.papers.map(paper => paper.originalFileName)).size).toBe(80);
    expect(manifest.papers.some(paper => olManifest.papers.some(olPaper => olPaper.driveFileId === paper.driveFileId))).toBe(false);

    for (const paper of manifest.papers) {
      expect(paper.id).toBe(`grade-${paper.grade}-${paper.driveFileId}`);
      expect([6, 7, 8, 9]).toContain(paper.grade);
      expect(paper.folderName).toBe(`Grade 0${paper.grade}`);
      expect(paper.folderId).toBe(manifest.gradeFolders.find(folder => folder.grade === paper.grade)?.driveFolderId);
      expect(paper.originalFileName).toMatch(/\.pdf$/i);
      expect(paper.driveFileId).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(paper.fileType).toBe("application/pdf");
      expect(paper.subject).not.toBe("");
      expect(paper.displayName).not.toBe("");
    }
  });

  it("marks the Drive file with only a PDF header as incomplete", () => {
    const incompletePapers = manifest.papers.filter(paper => paper.availability === "incomplete");
    expect(incompletePapers.map(paper => paper.originalFileName)).toEqual(["Cathelic Paper G7.pdf"]);
  });

  it("rejects unknown availability states rather than treating them as downloadable", () => {
    expect(() => createDriveGradePaper({
      ...manifest.papers[0],
      availability: "unknown"
    })).toThrow("Unknown grade paper availability status");
  });

  it("creates a direct-download URL for an available grade paper", () => {
    const record = manifest.papers.find(paper => paper.grade === 8)!;
    const paper = createDriveGradePaper(record);
    const url = new URL(paper.url);

    expect(paper).toMatchObject({
      id: record.id,
      grade: record.grade,
      subject: record.subject,
      originalFileName: record.originalFileName,
      driveFileId: record.driveFileId,
      fileType: "application/pdf",
      availability: "available"
    });
    expect(url.origin + url.pathname).toBe("https://drive.google.com/uc");
    expect(url.searchParams.get("export")).toBe("download");
    expect(url.searchParams.get("id")).toBe(record.driveFileId);
  });
});
