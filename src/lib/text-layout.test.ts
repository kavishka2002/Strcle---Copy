import { describe, expect, it } from "vitest";
import { getDisplayText, getFittedFontSize } from "./text-layout";
import type { TextElement } from "@/types";

const text: TextElement = {
  id: "name",
  field: "name",
  text: "Amaya Perera",
  visible: true,
  fontFamily: "Inter",
  fontSize: 25,
  height: 22,
  wrap: true,
  color: "#333333",
  bold: true,
  align: "center",
  x: 50,
  y: 25,
  width: 80,
  rotation: 0,
  lineHeight: 1.12,
  letterSpacing: 0
};

describe("sticker text fitting", () => {
  it("keeps short student names at their selected size", () => {
    expect(getFittedFontSize(text, 90, 45)).toEqual({ fontSize: 25, fits: true });
  });

  it("reduces size to fit long names and school names within their boxes", () => {
    const longName = { ...text, text: "Alexandria Sandaruwan Jayawardena" };
    const longSchool = { ...text, field: "school" as const, text: "Ananda Balika Vidyalaya International School" };
    expect(getFittedFontSize(longName, 90, 45).fontSize).toBeLessThan(text.fontSize);
    expect(getFittedFontSize(longName, 90, 45).fits).toBe(true);
    expect(getFittedFontSize(longSchool, 90, 45).fits).toBe(true);
  });

  it("uses the Sinhala glyph width estimate and supports non-wrapping text", () => {
    const sinhala = { ...text, text: "මහින්ද රාජපක්ෂ විද්‍යාලය" };
    const oneLine = { ...sinhala, wrap: false };
    expect(getFittedFontSize(sinhala, 90, 45).fits).toBe(true);
    expect(getFittedFontSize(oneLine, 90, 45).fontSize).toBeLessThan(text.fontSize);
  });

  it("flags unusually long text that cannot fit even at the minimum size", () => {
    const tooLong = { ...text, text: "Student Name ".repeat(80), wrap: false, height: 5, width: 10 };
    expect(getFittedFontSize(tooLong, 90, 45).fits).toBe(false);
  });

  it("includes a custom field's label in its visible sticker text", () => {
    expect(getDisplayText({ ...text, field: "custom", customLabel: "Student ID", text: "A-104" }))
      .toBe("Student ID: A-104");
  });
});
