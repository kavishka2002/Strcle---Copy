import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { starterArtwork, starterTemplates } from "./templates";
import { createSubjectDesign } from "../lib/design";
import { calculateSheetLayout } from "../lib/layout";

describe("illustration-based starter templates", () => {
  it("uses a real bundled PNG for every artwork template", () => {
    const stickerTemplates = starterTemplates.filter(template => template.kind === "sticker");

    expect(stickerTemplates).toHaveLength(starterArtwork.length);
    for (const artwork of starterArtwork) {
      const template = stickerTemplates.find(item => item.id === artwork.templateId);
      expect(template, `${artwork.templateName} template`).toBeDefined();
      expect(existsSync(join(process.cwd(), "public", "starter-art", artwork.file))).toBe(true);
      expect(template?.images).toHaveLength(1);
      expect(template?.images?.[0]).toMatchObject({
        assetId: artwork.id,
        width: expect.any(Number),
        rotation: 0
      });
      expect(template?.texts?.map(text => text.field)).toEqual(["name", "school", "grade", "subject"]);
      expect(template?.texts?.find(text => text.field === "name")?.fontSize).toBeGreaterThan(
        template?.texts?.find(text => text.field === "school")?.fontSize ?? 0
      );
      expect(template?.texts?.find(text => text.field === "school")?.fontSize).toBeGreaterThanOrEqual(12);
      expect(template?.texts?.every(text => text.wrap && (text.height ?? 0) > 0)).toBe(true);
    }
  });

  it("provides full-page notebook cover designs sized for one A4 cover per page", () => {
    const cover = starterTemplates.find(template => template.id === "cover-rose-garden");
    const covers = starterTemplates.filter(template => template.kind === "cover");

    expect(cover).toMatchObject({
      kind: "cover",
      widthMm: 202,
      heightMm: 289,
      images: [{ assetId: "starter-rose" }]
    });
    expect(covers).toHaveLength(6);
    expect(new Set(covers.map(template => template.decoration)).size).toBe(6);
    expect(covers.every(template => template.texts?.some(text => text.customLabel === "Book title"))).toBe(true);

    const design = createSubjectDesign(
      "Kavindu Perera",
      { name: "Kavindu Perera", grade: "Grade 8", school: "Example School" },
      ["Mathematics", "Science", "English", "Sinhala", "History", "ICT"],
      cover!,
      "English"
    );
    const layout = calculateSheetLayout(design.widthMm, design.heightMm, 6);
    expect(design.printSubjects).toHaveLength(6);
    expect(layout).toMatchObject({ columns: 1, rows: 1, perPage: 1, pages: 6 });
  });

  it("does not expose the superseded built-in template collection", () => {
    expect(starterTemplates.map(template => template.id)).not.toContain("black-ink");
    expect(starterTemplates.map(template => template.id)).not.toContain("rainbow");
    expect(starterTemplates.map(template => template.id)).not.toContain("dino");
  });
});
