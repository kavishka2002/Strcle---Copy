import { describe, expect, it } from "vitest";
import manifest from "../../../src/data/grade-papers-manifest.json";
import { GET } from "./route";

describe("GET /api/grade-papers", () => {
  it("serves all Grade 6–9 Drive papers from the verified manifest", async () => {
    const response = await GET();
    const body = await response.json() as { papers: Array<{ id: string; grade: number; driveFileId: string; url: string; availability: string }> };

    expect(response.status).toBe(200);
    expect(body.papers).toHaveLength(80);
    expect(Object.fromEntries([6, 7, 8, 9].map(grade => [
      grade,
      body.papers.filter(paper => paper.grade === grade).length
    ]))).toEqual({ 6: 18, 7: 18, 8: 22, 9: 22 });
    expect(body.papers.map(paper => paper.id)).toEqual(manifest.papers.map(paper => paper.id));
    expect(body.papers.every(paper => paper.url.includes(`id=${paper.driveFileId}`))).toBe(true);
    expect(body.papers.find(paper => paper.availability === "incomplete")?.grade).toBe(7);
  });
});
