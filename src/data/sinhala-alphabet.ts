export const sinhalaAlphabetSections = [
  {
    id: "vowels",
    label: "ස්වර",
    description: "Vowels",
    letters: ["අ", "ආ", "ඇ", "ඈ", "ඉ", "ඊ", "උ", "ඌ", "ඍ", "ඎ", "ඏ", "ඐ", "එ", "ඒ", "ඓ", "ඔ", "ඕ", "ඖ"]
  },
  {
    id: "consonants",
    label: "ව්‍යංජන",
    description: "Consonants",
    letters: ["ක", "ඛ", "ග", "ඝ", "ඞ", "ඟ", "ච", "ඡ", "ජ", "ඣ", "ඤ", "ඥ", "ඦ", "ට", "ඨ", "ඩ", "ඪ", "ණ", "ඬ", "ත", "ථ", "ද", "ධ", "න", "ඳ", "ප", "ඵ", "බ", "භ", "ම", "ඹ", "ය", "ර", "ල", "ව", "ශ", "ෂ", "ස", "හ", "ළ", "ෆ"]
  },
  {
    id: "combinations",
    label: "පිලි සහ අකුරු සංයෝජන",
    description: "Vowel signs with ක",
    letters: ["ක", "කා", "කැ", "කෑ", "කි", "කී", "කු", "කූ", "කෘ", "කෙ", "කේ", "කෛ", "කො", "කෝ", "කෞ", "ක්"]
  }
] as const;

export type SinhalaAlphabetSectionId = (typeof sinhalaAlphabetSections)[number]["id"];
