import { describe, expect, it } from "vitest";
import { sinhalaAlphabetSections } from "./sinhala-alphabet";

describe("Sinhala alphabet picker data", () => {
  it("keeps the vowel, consonant, and ක vowel-sign examples in the requested order", () => {
    expect(sinhalaAlphabetSections.map(section => section.id)).toEqual(["vowels", "consonants", "combinations"]);
    expect(sinhalaAlphabetSections[0].letters).toEqual(["අ", "ආ", "ඇ", "ඈ", "ඉ", "ඊ", "උ", "ඌ", "ඍ", "ඎ", "ඏ", "ඐ", "එ", "ඒ", "ඓ", "ඔ", "ඕ", "ඖ"]);
    expect(sinhalaAlphabetSections[1].letters).toEqual(["ක", "ඛ", "ග", "ඝ", "ඞ", "ඟ", "ච", "ඡ", "ජ", "ඣ", "ඤ", "ඥ", "ඦ", "ට", "ඨ", "ඩ", "ඪ", "ණ", "ඬ", "ත", "ථ", "ද", "ධ", "න", "ඳ", "ප", "ඵ", "බ", "භ", "ම", "ඹ", "ය", "ර", "ල", "ව", "ශ", "ෂ", "ස", "හ", "ළ", "ෆ"]);
    expect(sinhalaAlphabetSections[2].letters).toEqual(["ක", "කා", "කැ", "කෑ", "කි", "කී", "කු", "කූ", "කෘ", "කෙ", "කේ", "කෛ", "කො", "කෝ", "කෞ", "ක්"]);
  });

  it("provides unique selectable strings within each section", () => {
    for (const section of sinhalaAlphabetSections) {
      expect(new Set(section.letters).size).toBe(section.letters.length);
      expect(section.letters.every(letter => letter.length > 0)).toBe(true);
    }
  });
});
