import path from "node:path";
import { describe, expect, it } from "vitest";
import { shouldCopyPublicAsset } from "./public-asset-copy.mjs";

const publicDirectory = path.resolve("public");

describe("desktop public asset selection", () => {
  it("omits only PDFs under year-wise O/L paper folders", () => {
    expect(shouldCopyPublicAsset(
      publicDirectory,
      path.join(publicDirectory, "papers", "2015 ol", "2015-ol-science-sinhala.pdf")
    )).toBe(false);
    expect(shouldCopyPublicAsset(
      publicDirectory,
      path.join(publicDirectory, "papers", "2024 ol", "notes.txt")
    )).toBe(true);
    expect(shouldCopyPublicAsset(
      publicDirectory,
      path.join(publicDirectory, "papers", "scolarship paper", "2024-grade-5-scholarship-examination-sinhala.pdf")
    )).toBe(true);
    expect(shouldCopyPublicAsset(
      publicDirectory,
      path.join(publicDirectory, "reference", "curriculum.pdf")
    )).toBe(true);
  });
});
