import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { initializeSinglish, transliterateSinglish, updateLiveTransliterationDraft } from "./sinhala";

await initializeSinglish(await readFile(resolve("node_modules/singlish-sinhala/singlish_core_bg.wasm")));

describe("Singlish to Sinhala typing", () => {
  it("converts common vowels and consonants including amma", () => {
    expect(transliterateSinglish("amma")).toBe("අම්මා");
    expect(transliterateSinglish("nethmi")).toBe("නෙත්මි");
    expect(transliterateSinglish("ayubowan")).toBe("ආයුබෝවන්");
    expect(transliterateSinglish("singhala")).toBe("සිංහල");
    expect(transliterateSinglish("kohomada oya?")).toBe("කොහොමද ඔය?");
  });

  it("keeps spaces, punctuation, digits, and existing Sinhala characters", () => {
    const input = "amma, 3! අම්මා";
    expect(transliterateSinglish(input)).toBe("අම්මා, 3! අම්මා");
  });

  it("uses capital letters to type retroflex Sinhala consonants", () => {
    expect(transliterateSinglish("Ta Da Na La Sha")).toBe("ට ඩ ණ ළ ෂ");
    expect(transliterateSinglish("Tata")).toBe("ටත");
  });

  it("renders common conjunct spellings with Sinhala joiners", () => {
    expect(transliterateSinglish("sri")).toBe("ශ්‍රී");
    expect(transliterateSinglish("kriya")).toBe("ක්‍රිය");
    expect(transliterateSinglish("kriyaakaarakam")).toBe("ක්‍රියාකාරකම්");
    expect(transliterateSinglish("ksha")).toBe("ක්‍ෂ");
    expect(transliterateSinglish("jnya")).toBe("ඥ");
  });

  it.each([
    ["amma", "අම්මා"],
    ["nethmi", "නෙත්මි"],
    ["pansala", "පන්සල"],
    ["singhala", "සිංහල"]
  ])("converts %s live while retaining its raw typing draft", (word, expected) => {
    let draft = { rawValue: "", displayedValue: "" };
    for (const character of word) {
      const result = updateLiveTransliterationDraft(draft, draft.displayedValue + character, draft.displayedValue.length + 1);
      draft = result.draft;
      expect(result.caret).toBe(draft.displayedValue.length);
    }
    expect(draft.rawValue).toBe(word);
    expect(draft.displayedValue).toBe(expected);
  });

  it("keeps the caret at the edited position when inserting into a converted word", () => {
    let draft = { rawValue: "amma", displayedValue: "අම්මා" };
    let result = updateLiveTransliterationDraft(draft, "අම්xමා", 4);
    draft = result.draft;
    expect(draft.displayedValue).toBe("අම්xමා");
    expect(draft.rawValue).toBe("අම්xමා");
    expect(result.caret).toBe(4);
    result = updateLiveTransliterationDraft(draft, "අම්xමා!", 7);
    expect(result.draft.rawValue).toContain("!");
    expect(result.caret).toBe(result.draft.displayedValue.length);
  });

  it.each([
    "සිංහල",
    "ශ්‍රී ලංකාව",
    "විද්‍යාව",
    "ගණිතය",
    "ක්‍රියාකාරකම්"
  ])("leaves direct Sinhala and mixed Unicode input intact: %s", input => {
    expect(updateLiveTransliterationDraft({ rawValue: input, displayedValue: input }, input, input.length).draft.displayedValue).toBe(input);
  });
});
