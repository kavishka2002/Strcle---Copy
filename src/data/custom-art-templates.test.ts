import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { customArtworkAssets, customArtworkTemplateIds, customArtworkTemplates } from "./custom-art-templates";
import { newDesignTemplates } from "./new-templates";
import { starterTemplates } from "./templates";
import { calculateSheetLayout } from "../lib/layout";
import { createDesign, createSubjectDesign } from "../lib/design";
import { getPrintSubjects } from "../lib/printing";

describe("supplied artwork design collection", () => {
  it("adds unique templates without reusing any existing template IDs", () => {
    const existingIds = new Set([...starterTemplates, ...newDesignTemplates].map(template => template.id));
    const newIds = customArtworkTemplates.map(template => template.id);

    expect(customArtworkTemplates).toHaveLength(40);
    expect(new Set(newIds).size).toBe(newIds.length);
    expect(newIds.every(id => !existingIds.has(id))).toBe(true);
    expect(customArtworkTemplateIds.size).toBe(customArtworkTemplates.length);
  });

  it("uses distinct palettes, decorative details, layouts, and original supplied artwork", () => {
    const registeredAssets = new Map(customArtworkAssets.map(asset => [asset.id, asset]));

    expect(new Set(customArtworkTemplates.map(template => template.background)).size).toBe(customArtworkTemplates.length);
    expect(new Set(customArtworkTemplates.map(template => template.decoration)).size).toBe(customArtworkTemplates.length);
    for (const template of customArtworkTemplates) {
      expect(template.images).toHaveLength(1);
      const image = template.images?.[0];
      const artwork = image && registeredAssets.get(image.assetId);
      expect(artwork, `Missing asset registration for ${template.name}`).toBeDefined();
      expect(existsSync(join(process.cwd(), "public", artwork!.folder ?? "custom-art", artwork!.file))).toBe(true);
      expect(image!.width).toBeGreaterThan(0);
      expect(image!.rotation).toBe(0);
    }
  });

  it("rotates through the available Sinhala font styles across the character designs", () => {
    const sinhalaFontFamilies = new Set(
      customArtworkTemplates.flatMap(template => template.texts?.map(text => text.sinhalaFontFamily) ?? [])
    );

    expect(sinhalaFontFamilies).toEqual(new Set([
      "Abhaya Libre",
      "Gemunu Libre",
      "Noto Serif Sinhala",
      "Yaldevi",
      "Noto Sans Sinhala"
    ]));
    expect(customArtworkTemplates.every(template => {
      const textFields = template.texts ?? [];
      return textFields.length === 4 && textFields.every(text => text.sinhalaFontFamily === textFields[0]?.sinhalaFontFamily);
    })).toBe(true);
  });

  it("uses the supplied child-friendly characters with playful lettering", () => {
    const suppliedTemplateIds = new Set([
      "new-art-fairy-sparkle-garden",
      "new-art-crown-wing-fairy",
      "new-art-rainbow-mane-unicorn",
      "new-art-sweetheart-unicorn",
      "new-art-skater-tiger",
      "new-art-bestie-bear-hugs",
      "new-art-rainbow-parrot-pal",
      "new-art-sunny-chick-buddy",
      "new-art-bluebird-giggles",
      "new-art-star-wand-fairy"
    ]);
    const suppliedTemplates = customArtworkTemplates.filter(template => suppliedTemplateIds.has(template.id));

    expect(suppliedTemplates).toHaveLength(10);
    expect(suppliedTemplates.every(template =>
      template.texts?.every(text => text.fontFamily === "Fredoka" || text.fontFamily === "Baloo 2")
    )).toBe(true);
  });

  it("keeps the standard editable text fields readable with Sinhala and mixed-language content", () => {
    for (const template of customArtworkTemplates) {
      const name = "අමායා Perera";
      const school = "මහනුවර Central College";
      const design = createDesign("Amaya", {
        name, grade: "Grade 5", subject: "ගණිතය · Mathematics", school
      }, template, "Sinhala + English");
      const fields = new Map(design.texts.map(text => [text.field, text]));

      expect(design.images[0].assetId).toBe(template.images?.[0].assetId);
      expect(fields.get("name")?.text).toBe(name);
      expect(fields.get("school")?.text).toBe(school);
      expect(fields.get("grade")?.text).toBe("Grade 5");
      expect(fields.get("subject")?.text).toBe("ගණිතය · Mathematics");
      expect(fields.get("name")!.fontSize).toBeGreaterThan(fields.get("school")!.fontSize);
      expect(fields.get("school")!.fontSize).toBeGreaterThanOrEqual(11);
      expect(fields.get("school")!.wrap).toBe(true);
    }
  });

  it("keeps each artwork template compatible with separate subject cards and A4 pagination", () => {
    for (const template of customArtworkTemplates) {
      const design = createSubjectDesign("Amaya", {
        name: "අමායා Perera", grade: "Grade 5", school: "Central College"
      }, ["Mathematics", "Science"], template, "Sinhala + English");
      const sheet = calculateSheetLayout(design.widthMm, design.heightMm, 6);

      expect(getPrintSubjects(design)).toEqual(["Mathematics", "Science"]);
      expect(design.widthMm).toBe(template.widthMm);
      expect(design.heightMm).toBe(template.heightMm);
      expect(sheet.pages).toBeGreaterThan(0);
      expect(sheet.perPage).toBeGreaterThan(0);
    }
  });

  it("adds the supplied creative character as a round, printable sticker", () => {
    const template = customArtworkTemplates.find(item => item.id === "new-art-creative-circle-boy");
    expect(template).toBeDefined();
    expect(template!.widthMm).toBe(template!.heightMm);
    expect(template!.radius).toBeGreaterThan(100);
    expect(template!.decoration).toBe("collection-art-creative-circle");
    expect(template!.images?.[0].assetId).toBe("custom-art-creative-circle-boy");
    expect(existsSync(join(process.cwd(), "public", "custom-art", "creative-circle-boy.png"))).toBe(true);
  });

  it("registers the new supplied artwork as editable, printable designs", () => {
    const suppliedTemplateIds = [
      "new-art-school-walk-buddies",
      "new-art-dolphin-study-buddy",
      "new-art-sunshine-student",
      "new-art-bookish-student",
      "new-art-turtle-study-buddy",
      "new-art-panda-study-buddy",
      "new-art-kindness-angel",
      "new-art-teddy-friend",
      "new-art-school-friends-trio",
      "new-art-young-scholar",
      "new-art-midnight-cat",
      "new-art-storybook-girl",
      "new-art-winter-snowpal",
      "new-art-enchanted-garden-frame",
      "new-art-bright-bird-parade",
      "new-art-adventure-study-pals",
      "new-art-fairy-sparkle-garden",
      "new-art-crown-wing-fairy",
      "new-art-rainbow-mane-unicorn",
      "new-art-sweetheart-unicorn",
      "new-art-skater-tiger",
      "new-art-bestie-bear-hugs",
      "new-art-rainbow-parrot-pal",
      "new-art-sunny-chick-buddy",
      "new-art-bluebird-giggles",
      "new-art-star-wand-fairy"
    ];

    for (const id of suppliedTemplateIds) {
      const template = customArtworkTemplates.find(item => item.id === id);
      expect(template, `Missing template ${id}`).toBeDefined();
      expect(template!.images).toHaveLength(1);
      expect(template!.decoration).toMatch(/^collection-art-/);
      expect(template!.texts?.map(text => text.field)).toEqual(["name", "school", "grade", "subject"]);
    }
  });
});
