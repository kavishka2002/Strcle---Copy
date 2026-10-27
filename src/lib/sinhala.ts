import init, { candidates, transliterate } from "singlish-sinhala";
import type { InitInput } from "singlish-sinhala";

let initialization: Promise<void> | undefined;

export function initializeSinglish(input?: InitInput): Promise<void> {
  if (!initialization) {
    initialization = init({ module_or_path: input ?? "/singlish_core_bg.wasm" })
      .then(() => undefined)
      .catch(error => {
        initialization = undefined;
        throw new Error("Could not initialize the local Sinhala typing engine.", { cause: error });
      });
  }
  return initialization;
}

export function transliterateSinglish(value: string): string {
  return value.replace(/[A-Za-z]+/g, word => {
    const lower = word.toLowerCase();
    if (lower === "jnya") return "ඥ";

    const preferredConsonants = Array.from(word.matchAll(/Sh|T|D|N|L/g), match => {
      switch (match[0]) {
        case "Sh": return "ෂ";
        case "T": return "ට";
        case "D": return "ඩ";
        case "N": return "ණ";
        default: return "ළ";
      }
    });
    const alternatives = candidates(word);
    const preferredCandidate = alternatives.find(candidate =>
      preferredConsonants.every(consonant => candidate.includes(consonant))
    );
    const conjunctCandidate = lower.includes("ksh")
      ? alternatives.find(candidate => candidate.includes("ක්ෂ"))
      : undefined;
    const converted = preferredCandidate ?? conjunctCandidate ?? transliterate(word);
    return converted
      .replace(/ක්ශ/g, "ක්‍ෂ")
      .replace(/([\u0D9A-\u0DC6])\u0DCA([රය])/g, "$1\u0DCA\u200D$2");
  });
}

export interface TransliterationDraft {
  rawValue: string;
  displayedValue: string;
}

function displayOffsetToRawOffset(rawValue: string, displayedValue: string, displayOffset: number): number {
  if (displayOffset <= 0) return 0;
  if (displayOffset >= displayedValue.length) return rawValue.length;
  const rawCharacters = Array.from(rawValue);
  const rawCharacterIndex = Math.round((displayOffset / displayedValue.length) * rawCharacters.length);
  return rawCharacters.slice(0, rawCharacterIndex).join("").length;
}

export function updateLiveTransliterationDraft(
  draft: TransliterationDraft,
  nextDisplayedValue: string,
  selectionStart: number
): { draft: TransliterationDraft; caret: number } {
  let prefixLength = 0;
  while (
    prefixLength < draft.displayedValue.length
    && prefixLength < nextDisplayedValue.length
    && draft.displayedValue[prefixLength] === nextDisplayedValue[prefixLength]
  ) prefixLength++;
  while (
    prefixLength > 0
    && ((draft.displayedValue.charCodeAt(prefixLength - 1) >= 0xd800 && draft.displayedValue.charCodeAt(prefixLength - 1) <= 0xdbff)
      || (nextDisplayedValue.charCodeAt(prefixLength - 1) >= 0xd800 && nextDisplayedValue.charCodeAt(prefixLength - 1) <= 0xdbff))
  ) prefixLength--;

  let suffixLength = 0;
  while (
    suffixLength < draft.displayedValue.length - prefixLength
    && suffixLength < nextDisplayedValue.length - prefixLength
    && draft.displayedValue[draft.displayedValue.length - suffixLength - 1] === nextDisplayedValue[nextDisplayedValue.length - suffixLength - 1]
  ) suffixLength++;

  const rawStart = displayOffsetToRawOffset(draft.rawValue, draft.displayedValue, prefixLength);
  const rawEnd = displayOffsetToRawOffset(
    draft.rawValue,
    draft.displayedValue,
    draft.displayedValue.length - suffixLength
  );
  const inserted = nextDisplayedValue.slice(prefixLength, nextDisplayedValue.length - suffixLength);
  if (prefixLength < draft.displayedValue.length) {
    const convertedInsertion = inserted ? transliterateSinglish(inserted) : "";
    const displayedValue = draft.displayedValue.slice(0, prefixLength)
      + convertedInsertion
      + draft.displayedValue.slice(draft.displayedValue.length - suffixLength);
    const caret = prefixLength + convertedInsertion.length;
    return {
      draft: { rawValue: displayedValue, displayedValue },
      caret: Math.min(caret, displayedValue.length)
    };
  }
  const rawValue = draft.rawValue.slice(0, rawStart) + inserted + draft.rawValue.slice(rawEnd);
  const rawCaret = Math.min(rawValue.length, rawStart + Math.max(0, selectionStart - prefixLength));
  const displayedValue = transliterateSinglish(rawValue);
  const rawCharacterIndex = Array.from(rawValue.slice(0, rawCaret)).length;
  const displayedCharacterIndex = rawValue.length === 0
    ? 0
    : Math.round((rawCharacterIndex / Array.from(rawValue).length) * Array.from(displayedValue).length);
  const caret = rawCaret === rawValue.length
    ? displayedValue.length
    : Array.from(displayedValue).slice(0, displayedCharacterIndex).join("").length;
  return { draft: { rawValue, displayedValue }, caret: Math.min(caret, displayedValue.length) };
}
