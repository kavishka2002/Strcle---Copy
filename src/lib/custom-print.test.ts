import { describe, expect, it } from "vitest";
import { calculateCustomPrintLayout, createNumberValues, fitCustomPrintFontSize, formatNumberLabel, parseCustomLabels, type CustomPrintItem, updateCustomPrintItems } from "./custom-print";

const label = (overrides: Partial<CustomPrintItem> = {}): CustomPrintItem => ({
  id: "item-1",
  label: "Flower",
  text: "✿",
  shape: "circle",
  widthMm: 20,
  heightMm: 20,
  copies: 1,
  background: "#fff",
  color: "#222",
  outlineColor: "#888",
  outlineWidth: 0.4,
  borderStyle: "solid",
  fontSize: 12,
  fontFamily: "Inter",
  bold: true,
  align: "center",
  artwork: "daisy",
  fit: "contain",
  ...overrides
});

describe("custom print generators and A4 layout", () => {
  it("generates numeric ranges and rejects invalid or excessive values", () => {
    expect(createNumberValues(1, 10)).toHaveLength(10);
    expect(createNumberValues(1, 100)).toEqual(Array.from({ length: 100 }, (_, index) => index + 1));
    expect(createNumberValues(-5, 5)[0]).toBe(-5);
    expect(() => createNumberValues(5, 1)).toThrow(RangeError);
    expect(() => createNumberValues(1, 5001)).toThrow(RangeError);
  });

  it("formats number stickers as digits, English words, or Sinhala words", () => {
    expect(formatNumberLabel(1, "digits")).toBe("1");
    expect(formatNumberLabel(1, "english-words")).toBe("One");
    expect(formatNumberLabel(2, "sinhala-words")).toBe("දෙක");
    expect(formatNumberLabel(10, "sinhala-words")).toBe("දහය");
    expect(formatNumberLabel(20, "sinhala-words")).toBe("විස්ස");
    expect(() => formatNumberLabel(21, "sinhala-words")).toThrow(RangeError);
    expect(() => formatNumberLabel(-1, "english-words")).toThrow(RangeError);
  });

  it("keeps each entered Sinhala or mixed-language line unchanged", () => {
    const labels = parseCustomLabels("  අම්මා ❤️  \r\n\nClass 5\nROOM 5 ");
    expect(labels).toEqual(["  අම්මා ❤️  ", "Class 5", "ROOM 5 "]);
  });

  it("updates only selected item properties and preserves unrelated customization", () => {
    const first = label({ id: "first", background: "#aa0000", text: "A" });
    const second = label({ id: "second", background: "#00aa00", text: "B" });
    const updated = updateCustomPrintItems([first, second], ["first"], { widthMm: 32, fontSize: 28 });

    expect(updated[0]).toMatchObject({ widthMm: 32, fontSize: 28, background: "#aa0000", text: "A" });
    expect(updated[1]).toEqual(second);
  });

  it("changes width and height only for individually selected number stickers", () => {
    const first = label({ id: "first", text: "1", background: "#aa0000" });
    const second = label({ id: "second", text: "2", background: "#00aa00" });
    const updated = updateCustomPrintItems([first, second], ["first"], {
      widthMm: 32, heightMm: 28, shape: "circle"
    });

    expect(updated[0]).toMatchObject({ widthMm: 32, heightMm: 28, shape: "circle", text: "1", background: "#aa0000" });
    expect(updated[1]).toEqual(second);
  });

  it("fits long text to the physical sticker box while keeping a minimum readable size", () => {
    expect(fitCustomPrintFontSize(label({ text: "A", fontSize: 12 }))).toBe(12);
    const longNameSize = fitCustomPrintFontSize(label({
      text: "A very long student and school label that needs several wrapped lines",
      widthMm: 20,
      heightMm: 12,
      fontSize: 24
    }));
    expect(longNameSize).toBeGreaterThanOrEqual(4);
    expect(longNameSize).toBeLessThan(8);
    expect(fitCustomPrintFontSize(label({ text: "නෙත්මි සහ පාසල", widthMm: 20, heightMm: 15, fontSize: 20 }))).toBeLessThan(20);
  });

  it("places 10 flower stickers at their exact requested 20 × 20 mm size", () => {
    const layout = calculateCustomPrintLayout([label({ copies: 10 })], {
      orientation: "portrait", marginMm: 4, gapMm: 2
    });
    expect(layout.total).toBe(10);
    expect(layout.pages).toBe(1);
    expect(layout.placements.every(placement => placement.item.widthMm === 20 && placement.item.heightMm === 20)).toBe(true);
    expect(layout.placements.every(placement => placement.xMm >= 4 && placement.yMm >= 4)).toBe(true);
  });

  it("packs mixed item sizes without overlap and continues across A4 pages", () => {
    const items = [
      label({ id: "flower", copies: 10, widthMm: 20, heightMm: 20 }),
      label({ id: "number", text: "1", artwork: undefined, shape: "rounded", copies: 10, widthMm: 15, heightMm: 15 }),
      label({ id: "circle", text: "", artwork: undefined, copies: 20, widthMm: 10, heightMm: 10 })
    ];
    const layout = calculateCustomPrintLayout(items, { orientation: "landscape", marginMm: 4, gapMm: 2 });
    expect(layout.total).toBe(40);
    expect(layout.pages).toBeGreaterThan(0);
    expect(layout.placements.every(placement =>
      placement.xMm + placement.item.widthMm <= 297 - 4 &&
      placement.yMm + placement.item.heightMm <= 210 - 4
    )).toBe(true);

    for (const page of new Set(layout.placements.map(placement => placement.page))) {
      const pageItems = layout.placements.filter(placement => placement.page === page);
      for (let leftIndex = 0; leftIndex < pageItems.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < pageItems.length; rightIndex += 1) {
          const left = pageItems[leftIndex];
          const right = pageItems[rightIndex];
          const overlap = left.xMm < right.xMm + right.item.widthMm &&
            left.xMm + left.item.widthMm > right.xMm &&
            left.yMm < right.yMm + right.item.heightMm &&
            left.yMm + left.item.heightMm > right.yMm;
          expect(overlap).toBe(false);
        }
      }
    }
  });

  it("warns instead of shrinking an item that exceeds the printable area", () => {
    expect(() => calculateCustomPrintLayout([label({ widthMm: 205 })], {
      orientation: "portrait", marginMm: 4, gapMm: 2
    })).toThrow(/does not fit/);
  });

  it("rejects invalid spacing and excessive total copies", () => {
    expect(() => calculateCustomPrintLayout([], {
      orientation: "portrait", marginMm: -1, gapMm: 2
    })).toThrow(RangeError);
    expect(() => calculateCustomPrintLayout([label({ copies: 5001 })], {
      orientation: "portrait", marginMm: 4, gapMm: 2
    })).toThrow(/at most 5,000/);
  });
});
