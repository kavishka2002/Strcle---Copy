import { describe, expect, it } from "vitest";
import {
  englishHodiyaLetters,
  englishHodiyaNumerals,
  getSelectedHodiyaGroups,
  getHodiyaPrintLayout,
  getSinhalaHodiyaGroups,
  hodiyaLetterSelectionKey,
  hodiyaLetterStyleKey,
  sinhalaHodiyaNumerals,
  sinhalaHodiyaSections,
  splitHodiyaLetters
} from "./sinhala-hodiya";

describe("Sinhala Hodiya worksheet content", () => {
  it("keeps the requested vowels and extensions in their educational order", () => {
    expect(sinhalaHodiyaSections[0].letters).toEqual(["අ", "ආ", "ඇ", "ඈ", "ඉ", "ඊ", "උ", "ඌ", "ඍ", "ඎ", "ඏ", "ඐ", "එ", "ඒ", "ඓ", "ඔ", "ඕ", "ඖ", "අං", "අඃ"]);
  });

  it("keeps the requested consonants in order and includes the combination examples", () => {
    expect(sinhalaHodiyaSections[1].letters).toEqual(["ක", "ඛ", "ග", "ඝ", "ඞ", "ඟ", "ච", "ඡ", "ජ", "ඣ", "ඤ", "ඥ", "ඦ", "ට", "ඨ", "ඩ", "ඪ", "ණ", "ඬ", "ත", "ථ", "ද", "ධ", "න", "ඳ", "ප", "ඵ", "බ", "භ", "ම", "ඹ", "ය", "ර", "ල", "ව", "ශ", "ෂ", "ස", "හ", "ළ", "ෆ"]);
    expect(sinhalaHodiyaSections[2].letters).toEqual(["ක", "කා", "කැ", "කෑ", "කි", "කී", "කු", "කූ", "කෘ", "කෙ", "කේ", "කෛ", "කො", "කෝ", "කෞ", "ක්"]);
  });

  it("provides Sinhala digits, English characters, and configurable worksheet chunks", () => {
    expect(sinhalaHodiyaNumerals).toHaveLength(10);
    expect(englishHodiyaLetters).toHaveLength(52);
    expect(englishHodiyaLetters[0]).toBe("A");
    expect(englishHodiyaLetters[25]).toBe("Z");
    expect(englishHodiyaLetters[26]).toBe("a");
    expect(englishHodiyaLetters[51]).toBe("z");
    expect(englishHodiyaNumerals).toEqual(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    expect(splitHodiyaLetters(["අ", "ආ", "ඇ", "ඈ", "ඉ"], 2, 2)).toEqual([["අ", "ආ", "ඇ", "ඈ"], ["ඉ"]]);
    expect(splitHodiyaLetters(["අ"], 0, 0)).toEqual([["අ"]]);
  });

  it("keeps print selections distinct by group and includes only selected letters", () => {
    const groups = [
      { id: "vowels", title: "Vowels", letters: ["අ", "ආ"] },
      { id: "combinations", title: "Combinations", letters: ["අ", "කා"] }
    ];
    const selected = new Set([
      hodiyaLetterSelectionKey("vowels", 1),
      hodiyaLetterSelectionKey("combinations", 0)
    ]);

    expect(getSelectedHodiyaGroups(groups, selected)).toEqual([
      { id: "vowels", title: "Vowels", letters: ["ආ"] },
      { id: "combinations", title: "Combinations", letters: ["අ"] }
    ]);
    expect(getSelectedHodiyaGroups(groups, new Set())).toEqual([]);
  });

  it("provides only the full Sinhala Hodiya sections for the full-Hodiya print option", () => {
    expect(getSinhalaHodiyaGroups().map(group => group.id)).toEqual(["vowels", "consonants", "combinations"]);
    expect(getSinhalaHodiyaGroups().flatMap(group => group.letters)).toHaveLength(77);
    expect(getSinhalaHodiyaGroups().every(group => group.sinhala)).toBe(true);
  });

  it("keeps the same character's styles independent in different worksheet groups", () => {
    expect(hodiyaLetterStyleKey("vowels", "අ")).not.toBe(hodiyaLetterStyleKey("combinations", "අ"));
  });

  it("reduces print rows and columns to keep large letters inside the A4 page", () => {
    const regular = getHodiyaPrintLayout(32, 14, 8, 6, 8, 2);
    const large = getHodiyaPrintLayout(72, 14, 20, 6, 8, 2);

    expect(regular.columns).toBe(8);
    expect(large.columns).toBeLessThan(regular.columns);
    expect(large.rows).toBeLessThan(regular.rows);
    expect(large.tileSize).toBeGreaterThan(regular.tileSize);
    expect(large.columns * large.tileSize + (large.columns - 1) * 20).toBeLessThanOrEqual(190);
    expect(large.rows * large.tileSize + (large.rows - 1) * 20).toBeLessThanOrEqual(245);
  });
});
