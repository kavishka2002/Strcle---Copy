import { describe, expect, it } from "vitest";
import { printableLabelCategories, printableLabelCategoryById, printableLabelTemplateIds, printableLabelTemplates } from "./printable-label-templates";
import { starterTemplates } from "./templates";
import { newDesignTemplates } from "./new-templates";
import { customArtworkTemplates } from "./custom-art-templates";
import { createDesign } from "../lib/design";
import { calculateSheetLayout } from "../lib/layout";

describe("offline vector printable label templates", () => {
  it("provides five distinct sticker designs in each requested category", () => {
    expect(printableLabelTemplates).toHaveLength(20);
    expect(printableLabelCategories).toHaveLength(4);
    for (const category of printableLabelCategories) {
      expect([...printableLabelCategoryById.values()].filter(value => value === category)).toHaveLength(5);
    }
    const existingIds = new Set([...starterTemplates, ...newDesignTemplates, ...customArtworkTemplates].map(template => template.id));
    expect(new Set(printableLabelTemplateIds).size).toBe(20);
    expect([...printableLabelTemplateIds].every(id => !existingIds.has(id))).toBe(true);
  });

  it("uses only vector decorations and editable text on print-sized cards", () => {
    const decorations = new Set<string>();
    for (const template of printableLabelTemplates) {
      expect(template.kind).toBe("sticker");
      expect(template.widthMm).toBe(90);
      expect(template.heightMm).toBe(45);
      expect(template.images).toEqual([]);
      expect(template.decoration).toMatch(/^collection-label-/);
      decorations.add(template.decoration);
      expect(template.texts?.map(text => text.field)).toEqual(["name", "school", "grade", "subject"]);
      expect(template.texts?.every(text => text.wrap && text.height && text.width > 0)).toBe(true);
      const design = createDesign("Amaya", {
        name: "අමායා Perera",
        school: "මහනුවර Central College",
        grade: "5 ශ්‍රේණිය",
        subject: "ගණිතය · Mathematics"
      }, template, "Sinhala + English");
      expect(design.images).toEqual([]);
      expect(design.texts.find(text => text.field === "name")?.text).toBe("අමායා Perera");
      const sheet = calculateSheetLayout(design.widthMm, design.heightMm, 12);
      expect(sheet.pages).toBeGreaterThan(0);
      expect(sheet.perPage).toBeGreaterThan(0);
    }
    expect(decorations.size).toBe(20);
  });
});
