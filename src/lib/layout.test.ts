import { describe, expect, it } from "vitest";
import { calculateSheetLayout } from "./layout";

describe("calculateSheetLayout", () => {
  it("calculates a medium sticker grid on A4", () => {
    expect(calculateSheetLayout(90, 45, 12)).toMatchObject({ columns: 2, rows: 6, perPage: 12, pages: 1 });
  });

  it("keeps actual sizes and calculates multi-page copies", () => {
    expect(calculateSheetLayout(70, 35, 23)).toMatchObject({ columns: 2, rows: 7, perPage: 14, pages: 2 });
  });

  it("rejects stickers that cannot fit on the sheet", () => {
    expect(() => calculateSheetLayout(203, 200, 1)).toThrow(/does not fit/);
  });

  it("rejects invalid measurement values", () => {
    expect(() => calculateSheetLayout(0, 35, 1)).toThrow(/must be valid/);
    expect(() => calculateSheetLayout(70, 35, 1.5)).toThrow(/must be valid/);
  });

  it("supports A4 landscape without scaling sticker dimensions", () => {
    expect(calculateSheetLayout(90, 45, 12, 4, 2.5, 2.5, 297, 210)).toMatchObject({ columns: 3, rows: 4, perPage: 12, pages: 1 });
  });

  it.each([
    [1, 1],
    [2, 1],
    [4, 1],
    [6, 1],
    [8, 1],
    [10, 1],
    [12, 1],
    [20, 2]
  ])("places %i medium stickers across %i A4 page(s)", (stickers, pages) => {
    expect(calculateSheetLayout(90, 45, stickers)).toMatchObject({
      perPage: 12,
      pages
    });
  });

  it("keeps sticker edges inside the safe A4 margin and spacing", () => {
    const layout = calculateSheetLayout(90, 45, 12);
    const usedWidth = layout.columns * 90 + (layout.columns - 1) * 2.5;
    const usedHeight = layout.rows * 45 + (layout.rows - 1) * 2.5;
    expect(usedWidth).toBeLessThanOrEqual(layout.usableWidth);
    expect(usedHeight).toBeLessThanOrEqual(layout.usableHeight);
    expect(layout.usableWidth).toBe(202);
    expect(layout.usableHeight).toBe(289);
  });
});
