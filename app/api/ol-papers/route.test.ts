import { describe, expect, it } from "vitest";
import manifest from "../../../src/data/ol-papers-manifest.json";
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
});
