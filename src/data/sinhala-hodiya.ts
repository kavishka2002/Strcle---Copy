export interface SinhalaHodiyaSection {
  id: string;
  title: string;
  description: string;
  letters: string[];
}

export const sinhalaHodiyaSections: SinhalaHodiyaSection[] = [
  {
    id: "vowels",
    title: "ස්වර අකුරු",
    description: "Sinhala vowels",
    letters: ["අ", "ආ", "ඇ", "ඈ", "ඉ", "ඊ", "උ", "ඌ", "ඍ", "ඎ", "ඏ", "ඐ", "එ", "ඒ", "ඓ", "ඔ", "ඕ", "ඖ", "අං", "අඃ"]
  },
  {
    id: "consonants",
    title: "ව්‍යංජන අකුරු",
    description: "Sinhala consonants",
    letters: ["ක", "ඛ", "ග", "ඝ", "ඞ", "ඟ", "ච", "ඡ", "ජ", "ඣ", "ඤ", "ඥ", "ඦ", "ට", "ඨ", "ඩ", "ඪ", "ණ", "ඬ", "ත", "ථ", "ද", "ධ", "න", "ඳ", "ප", "ඵ", "බ", "භ", "ම", "ඹ", "ය", "ර", "ල", "ව", "ශ", "ෂ", "ස", "හ", "ළ", "ෆ"]
  },
  {
    id: "combinations",
    title: "පිලි සහ අකුරු සංයෝජන",
    description: "Vowel signs with ක",
    letters: ["ක", "කා", "කැ", "කෑ", "කි", "කී", "කු", "කූ", "කෘ", "කෙ", "කේ", "කෛ", "කො", "කෝ", "කෞ", "ක්"]
  }
];

export const sinhalaHodiyaNumerals = ["෦", "෧", "෨", "෩", "෪", "෫", "෬", "෭", "෮", "෯"];
export const englishHodiyaLetters = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))
  .concat(Array.from({ length: 26 }, (_, index) => String.fromCharCode(97 + index)));
export const englishHodiyaNumerals = Array.from({ length: 10 }, (_, index) => String(index));

export function getSinhalaHodiyaGroups() {
  return sinhalaHodiyaSections.map(section => ({ ...section, sinhala: true }));
}

export function hodiyaLetterSelectionKey(groupId: string, index: number): string {
  return `${groupId}:${index}`;
}

export function hodiyaLetterStyleKey(groupId: string, letter: string): string {
  return `${groupId}:${letter}`;
}

export function getHodiyaPrintLayout(
  fontSize: number,
  tileSize: number,
  spacing: number,
  preferredRows: number,
  preferredColumns: number,
  longestLetter: number
): { tileSize: number; rows: number; columns: number } {
  const fontSizeMm = fontSize * 0.264583;
  const printableTileSize = Math.max(
    tileSize,
    fontSizeMm * 1.45 + 2,
    fontSizeMm * Math.max(1, longestLetter) * 0.75 + 2
  );
  const columns = Math.max(1, Math.min(
    preferredColumns,
    Math.floor((190 + spacing) / (printableTileSize + spacing))
  ));
  const rows = Math.max(1, Math.min(
    preferredRows,
    Math.floor((245 + spacing) / (printableTileSize + spacing))
  ));

  return { tileSize: printableTileSize, rows, columns };
}

export function getSelectedHodiyaGroups<T extends { id: string; letters: string[] }>(
  groups: T[],
  selection: ReadonlySet<string>
): T[] {
  return groups.flatMap(group => {
    const letters = group.letters.filter((_, index) => selection.has(hodiyaLetterSelectionKey(group.id, index)));
    return letters.length > 0 ? [{ ...group, letters }] : [];
  });
}

export function splitHodiyaLetters(letters: string[], rows: number, columns: number): string[][] {
  const pageCapacity = Math.max(1, Math.floor(rows) * Math.floor(columns));
  const pages: string[][] = [];
  for (let offset = 0; offset < letters.length; offset += pageCapacity) {
    pages.push(letters.slice(offset, offset + pageCapacity));
  }
  return pages;
}
