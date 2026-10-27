import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { starterArtwork, starterTemplates } from "./templates";
import { newDesignTemplates, newDesignTemplateIds } from "./new-templates";
import { createDesign } from "../lib/design";

describe("separate new design collection", () => {
  it("adds at least ten unique options without reusing existing template IDs", () => {
    const originalIds = new Set(starterTemplates.map(template => template.id));
    const newIds = newDesignTemplates.map(template => template.id);

    expect(newDesignTemplates.length).toBeGreaterThanOrEqual(10);
    expect(new Set(newIds).size).toBe(newIds.length);
    expect(newIds.every(id => !originalIds.has(id))).toBe(true);
    expect(newDesignTemplateIds.size).toBe(newDesignTemplates.length);
    expect(starterTemplates.map(template => template.id)).toEqual([...originalIds]);
  });

  it("uses distinct visual palettes, decoration styles, and layout configurations", () => {
    expect(new Set(newDesignTemplates.map(template => template.background)).size).toBeGreaterThanOrEqual(9);
    expect(new Set(newDesignTemplates.map(template => template.decoration)).size).toBe(newDesignTemplates.length);
    expect(new Set(newDesignTemplates.map(template => template.layout)).size).toBeGreaterThanOrEqual(3);
    expect(newDesignTemplates.every(template => template.decoration.startsWith("collection-"))).toBe(true);
  });

  it("references existing bundled PNG artwork without changing its source files", () => {
    const artworkById = new Map(starterArtwork.map(artwork => [artwork.id, artwork]));
    const usedAssetIds = new Set(newDesignTemplates.flatMap(template => template.images?.map(image => image.assetId) ?? []));

    expect(usedAssetIds.size).toBe(starterArtwork.length);
    for (const assetId of usedAssetIds) {
      const artwork = artworkById.get(assetId);
      expect(artwork, `asset ${assetId}`).toBeDefined();
      expect(existsSync(join(process.cwd(), "public", "starter-art", artwork!.file))).toBe(true);
    }
  });

  it("creates editable student, school, grade, and subject fields for each new design", () => {
    for (const template of newDesignTemplates) {
      const design = createDesign("Amaya", {
        name: "අමායා Perera",
        grade: "Grade 5",
        subject: "ගණිතය / Mathematics",
        school: "Central College"
      }, template, "Sinhala + English");
      const fields = new Map(design.texts.map(text => [text.field, text]));

      expect(design.decoration).toBe(template.decoration);
      expect(fields.get("name")?.text).toBe("අමායා Perera");
      expect(fields.get("school")?.text).toBe("Central College");
      expect(fields.get("grade")?.text).toBe("Grade 5");
      expect(fields.get("subject")?.text).toBe("ගණිතය / Mathematics");
      expect(fields.get("name")!.fontSize).toBeGreaterThan(fields.get("school")!.fontSize);
      expect(fields.get("school")!.fontSize).toBeGreaterThanOrEqual(11);
    }
  });
});
