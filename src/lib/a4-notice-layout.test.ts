import { describe, expect, it } from "vitest";
import { calculateNoticeFitScale } from "./a4-notice-layout";

const baseNotice = {
  pageWidthMm: 210,
  pageHeightMm: 297,
  orientation: "portrait" as const,
  heading: "House for Sale",
  fields: [
    { label: "Location", value: "Town centre", wide: false },
    { label: "Bedrooms", value: "3", wide: false },
    { label: "Details", value: "Well maintained house with convenient road access.", wide: true },
    { label: "Telephone number", value: "077 123 4567", wide: true }
  ],
  headingFontSizePt: 44,
  bodyFontSizePt: 18,
  hasPhoto: false,
  hasTranslation: false,
  hasFooter: true
};

describe("A4 notice content fitting", () => {
  it("keeps ordinary portrait and landscape notices at their chosen font sizes", () => {
    const portrait = calculateNoticeFitScale(baseNotice);
    const landscape = calculateNoticeFitScale({
      ...baseNotice,
      pageWidthMm: 297,
      pageHeightMm: 210,
      orientation: "landscape"
    });

    expect(portrait).toBe(1);
    expect(landscape).toBeGreaterThan(0.48);
    expect(landscape).toBeLessThanOrEqual(1);
  });

  it("reduces text sizing for long content and a photo in both orientations", () => {
    const denseFields = Array.from({ length: 7 }, (_, index) => ({
      label: `Details ${index + 1}`,
      value: "A long description with additional information, access details, facilities and contact instructions. ".repeat(2),
      wide: true
    }));
    const portrait = calculateNoticeFitScale({
      ...baseNotice,
      fields: denseFields,
      hasPhoto: true
    });
    const landscape = calculateNoticeFitScale({
      ...baseNotice,
      pageWidthMm: 297,
      pageHeightMm: 210,
      orientation: "landscape",
      fields: denseFields,
      hasPhoto: true
    });

    expect(portrait).toBeLessThan(1);
    expect(landscape).toBeLessThan(1);
    expect(portrait).toBeGreaterThanOrEqual(0.48);
    expect(landscape).toBeGreaterThanOrEqual(0.48);
  });
});
