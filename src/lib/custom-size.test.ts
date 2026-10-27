import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { customSizeTemplate, CUSTOM_SIZE_ARTWORK_ID, CUSTOM_SIZE_TEMPLATE_ID } from "../data/custom-size-template";
import { starterTemplates } from "../data/templates";
import { createDesign, templateFromDesign } from "./design";
import { calculateSheetLayout } from "./layout";
import { isSupportedCustomSize, measurementToMillimeters, millimetersToMeasurement } from "./custom-size";

describe("custom sticker dimensions", () => {
  it.each([
    [3, "in", 76.2],
    [2, "in", 50.8],
    [5, "cm", 50],
    [7.5, "cm", 75]
  ] as const)("converts %s %s accurately to millimeters", (value, unit, expectedMm) => {
    expect(measurementToMillimeters(value, unit)).toBeCloseTo(expectedMm);
  });

  it("preserves physical dimensions when switching units", () => {
    const widthMm = measurementToMillimeters(3, "in");
    const centimeters = millimetersToMeasurement(widthMm, "cm");
    expect(centimeters).toBeCloseTo(7.62);
    expect(measurementToMillimeters(centimeters, "cm")).toBeCloseTo(widthMm);
  });

  it.each([
    [50.8, 25.4],
    [76.2, 50.8],
    [50, 30],
    [75, 50]
  ])("supports A4 pagination at exact size for %i × %i mm", (widthMm, heightMm) => {
    const layout = calculateSheetLayout(widthMm, heightMm, 15);
    expect(layout.perPage).toBeGreaterThan(0);
    expect(layout.pages).toBe(Math.ceil(15 / layout.perPage));
    expect(layout.columns * widthMm + (layout.columns - 1) * 2.5).toBeLessThanOrEqual(layout.usableWidth);
    expect(layout.rows * heightMm + (layout.rows - 1) * 2.5).toBeLessThanOrEqual(layout.usableHeight);
  });

  it("rejects dimensions outside the supported physical limits", () => {
    expect(isSupportedCustomSize(76.2, 50.8)).toBe(true);
    expect(isSupportedCustomSize(19.9, 50)).toBe(false);
    expect(isSupportedCustomSize(100, 281)).toBe(false);
    expect(isSupportedCustomSize(Number.NaN, 50)).toBe(false);
  });

  it("keeps the custom sticker separate and persists its physical unit through design templates", () => {
    expect(CUSTOM_SIZE_TEMPLATE_ID).not.toBe(starterTemplates[0].id);
    const design = createDesign("Amaya", {
      name: "Amaya", grade: "Grade 5", school: "Central School", subject: "Mathematics"
    }, customSizeTemplate, "English");
    design.widthMm = measurementToMillimeters(7.5, "cm");
    design.heightMm = measurementToMillimeters(5, "cm");
    design.customDimensionUnit = "cm";

    expect(design.templateId).toBe(CUSTOM_SIZE_TEMPLATE_ID);
    expect(design.widthMm).toBe(75);
    expect(design.heightMm).toBe(50);
    expect(templateFromDesign(design, "Saved custom size").customDimensionUnit).toBe("cm");
  });

  it("uses its own school-themed artwork, palette, decoration, and text layout", () => {
    const design = createDesign("Amaya", {
      name: "Amaya", grade: "Grade 5", school: "Central School", subject: "Mathematics"
    }, customSizeTemplate, "English");
    const fields = new Map(design.texts.map(text => [text.field, text]));

    expect(customSizeTemplate.decoration).toBe("collection-custom-scholar");
    expect(customSizeTemplate.background).toBe("#fff9ed");
    expect(customSizeTemplate.accent).toBe("#163b32");
    expect(design.images).toHaveLength(1);
    expect(design.images[0].assetId).toBe(CUSTOM_SIZE_ARTWORK_ID);
    expect(existsSync(join(process.cwd(), "public", "starter-art", "custom-size-apple-pencil.png"))).toBe(true);
    expect(fields.get("name")?.color).toBe("#163b32");
    expect(fields.get("school")?.color).toBe("#40574c");
    expect(fields.get("grade")?.color).toBe("#a9692d");
    expect(fields.get("subject")?.color).toBe("#163b32");
    expect(fields.get("name")?.x).toBe(68);
    expect(fields.get("name")?.y).toBe(22);
    expect(fields.get("subject")?.y).toBe(82);
  });
});
