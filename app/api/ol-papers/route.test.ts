import { describe, expect, it } from "vitest";
import manifest from "../../../src/data/ol-papers-manifest.json";
import scholarshipManifest from "../../../src/data/scholarship-papers-manifest.json";
import { GET } from "./route";

describe("GET /api/ol-papers", () => {
  it("serves every manifest paper without requiring bundled O/L PDFs", async () => {
    const response = await GET();
    const body = await response.json() as { papers: Array<{ id: string; exam: string; driveFileId?: string }> };
    const olPapers = body.papers.filter(paper => paper.exam === "O/L");

    expect(response.status).toBe(200);
    expect(olPapers).toHaveLength(manifest.papers.length);
    expect(new Set(olPapers.map(paper => paper.id))).toEqual(new Set(manifest.papers.map(paper => paper.id)));
    expect(olPapers.every(paper => Boolean(paper.driveFileId))).toBe(true);
  });

  it("serves every scholarship paper from the shared Drive folder", async () => {
    const response = await GET();
    const body = await response.json() as {
      papers: Array<{ id: string; exam: string; year: number; medium: string; driveFileId?: string }>;
    };
    const scholarshipPapers = body.papers.filter(paper => paper.exam === "Grade 5 Scholarship");

    expect(response.status).toBe(200);
    expect(scholarshipPapers).toHaveLength(scholarshipManifest.papers.length);
    expect(scholarshipPapers.map(paper => paper.year)).toEqual([
      2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017
    ]);
    expect(scholarshipPapers.every(paper => paper.medium === "Sinhala medium" && Boolean(paper.driveFileId)))
      .toBe(true);
    expect(new Set(scholarshipPapers.map(paper => paper.id)).size).toBe(scholarshipPapers.length);
  });
});
