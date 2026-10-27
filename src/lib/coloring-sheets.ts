export type ColoringCategory =
  | "Animals"
  | "Birds"
  | "Flowers"
  | "Fruits"
  | "Vehicles"
  | "Food & plants"
  | "Letters & numbers"
  | "Sports"
  | "Cartoons & characters"
  | "Nature"
  | "People & places"
  | "Other";

export type ColoringSheet = {
  id: string;
  sinhalaName: string;
  englishName: string;
  keywords: string[];
  category: ColoringCategory;
  url: string;
  sizeBytes: number;
  mediaType: "pdf" | "image";
  grade: number | null;
  titleOrder: number | null;
  titleSinhala: string | null;
  titleTransliteration: string | null;
};

const gradeTitles: Record<number, Record<number, { sinhala: string; transliteration: string }>> = {
  1: {
    1: { sinhala: "පාසල අවට", transliteration: "pasala awata" },
    2: { sinhala: "අප අවට නිවාස", transliteration: "apa awata niwasa" },
    3: { sinhala: "වත්තට එන සතුන්", transliteration: "waththata ena sathun" },
    4: { sinhala: "අප අවට ජලය", transliteration: "apa awata jalaya" },
    5: { sinhala: "අලුත් අවුරුද්ද", transliteration: "aluth aurudda" },
    6: { sinhala: "අහස", transliteration: "ahasa" },
    7: { sinhala: "අපි කන කෑම", transliteration: "api kana kama" },
    8: { sinhala: "අපට තොරතුරු ලැබෙන විදිය", transliteration: "apata thorathuru labena widiya" },
    9: { sinhala: "අප අවට පරිසරයේ සිදුවන වෙනස්කම්", transliteration: "apa awata parisaraye siduwana wenas kam" },
    10: { sinhala: "අපේ යහ පැවැත්ම", transliteration: "ape yaha pawathma" },
    11: { sinhala: "අපට ඕනෑ දේ ලැබෙන හැටි", transliteration: "apata one de labena hati" },
    12: { sinhala: "ගමන් බිමන්", transliteration: "gaman biman" },
    13: { sinhala: "ආලෝකය", transliteration: "alokaya" },
    14: { sinhala: "වැඩ කරන අය සහ උපකරණ", transliteration: "wada karana aya saha upakarana" },
    15: { sinhala: "පරිසරයේ වෙනස් තැන්", transliteration: "parisaraye wens than" },
    16: { sinhala: "අපේ උදව් ඕනෑ අය", transliteration: "ape udau ona aya" }
  },
  2: {
    1: { sinhala: "පාසල - අපේ පාසලේ ස්ථාන", transliteration: "pasala ape pasale sthana" },
    2: { sinhala: "නිවස - අපේ ගෙදර", transliteration: "niwasa ape gedara" },
    3: { sinhala: "වත්තට එන සතුන්", transliteration: "waththata ena sathun" },
    4: { sinhala: "ජලය සහ දෛනික ජීවිතය", transliteration: "jalaya saha dainika jeevithaya" },
    5: { sinhala: "අවුරුදු කාලය", transliteration: "awurudu kalaya" },
    6: { sinhala: "අපට පෙනෙන අහස", transliteration: "apata penena ahasa" },
    7: { sinhala: "අප කන බොන දේ", transliteration: "apa kana bona de" },
    8: { sinhala: "අපට තොරතුරු ලැබෙන ආකාරය", transliteration: "apata thorathuru labena akaraya" },
    9: { sinhala: "පරිසරයේ සිදුවන වෙනස්කම්", transliteration: "parisaraye siduwana wenas kam" },
    11: { sinhala: "අපට ඕනෑ දේ ලැබෙන හැටි", transliteration: "apata one de labena hati" },
    12: { sinhala: "ගමන් බිමන්", transliteration: "gaman biman" },
    14: { sinhala: "මිනිසුන් වැඩ කරන තැන්", transliteration: "minisun wada karana than" },
    15: { sinhala: "අපේ උදව් ඕනෑ අය", transliteration: "ape udau ona aya" }
  },
  3: {
    1: { sinhala: "පාසල - අපේ පාසල් ජීවිතය", transliteration: "pasala ape pasal jeevithaya" },
    2: { sinhala: "අපි ලංකා වැසියෝ", transliteration: "api lanka wasiyo" },
    3: { sinhala: "පැළෑටි හා ගස්වැල්", transliteration: "palati ha gaswal" },
    4: { sinhala: "අප අවට සතුන්", transliteration: "apa awata sathun" },
    5: { sinhala: "අප භාවිත කරන දේ", transliteration: "apa bhawitha karana de" },
    6: { sinhala: "අප කන බොන දේ", transliteration: "apa kana bona de" },
    7: { sinhala: "ආරක්ෂාව හා පරිස්සම", transliteration: "arakshawa ha parissama" },
    8: { sinhala: "ජලය", transliteration: "jalaya" },
    9: { sinhala: "ගමනාගමනය", transliteration: "gamanagamanaya" },
    10: { sinhala: "ගෙවත්තේ ඇති දේ", transliteration: "gewaththe athi de" },
    11: { sinhala: "වැඩ පහසු කරන උපකරණ", transliteration: "wada pahasu karana upakarana" },
    13: { sinhala: "පොළව හා ජලය", transliteration: "polawa ha jalaya" },
    15: { sinhala: "මිනිසා හා පරිසරය", transliteration: "minisa ha parisaraya" },
    16: { sinhala: "අපේ ඓතිහාසික ස්ථාන", transliteration: "ape aithihasika sthana" }
  },
  4: {
    1: { sinhala: "ශරීර සුවතාවය", transliteration: "shareera suwathawaya" },
    2: { sinhala: "අපි ශ්‍රී ලාංකිකයෝ", transliteration: "api sri lankikayo" },
    3: { sinhala: "පැළෑටි හා ගස්වැල්", transliteration: "palati ha gaswal" },
    4: { sinhala: "අප අවට සතුන්", transliteration: "apa awata sathun" },
    5: { sinhala: "අප පරිහරණය කරන දේ", transliteration: "apa pariharanaya karana de" },
    6: { sinhala: "අපේ ආහාර", transliteration: "ape ahara" },
    7: { sinhala: "ආරක්ෂාව හා පරිස්සම", transliteration: "arakshawa ha parissama" },
    8: { sinhala: "ජලය", transliteration: "jalaya" },
    9: { sinhala: "ගමනාගමනය", transliteration: "gamanagamanaya" },
    11: { sinhala: "වැඩ පහසු කරන උපකරණ", transliteration: "wada pahasu karana upakarana" },
    12: { sinhala: "මිනිස් හැකියාව හා අවශ්‍යතා", transliteration: "minis hakiyawa ha awashyatha" },
    13: { sinhala: "පොළව හා අහස", transliteration: "polawa ha ahasa" },
    15: { sinhala: "මිනිසා හා තොරතුරු", transliteration: "minisa ha thorathuru" },
    16: { sinhala: "අපේ අතීත විත්ති", transliteration: "ape atheetha viththi" }
  }
};

const categoryRules: Array<{ category: ColoringCategory; names: string[]; terms: string[] }> = [
  { category: "Flowers", names: ["Flowers", "මල්"], terms: ["මල්", "මල", "පැලෑටි", "flower", "blossom"] },
  { category: "Animals", names: ["Animals", "සතුන්"], terms: ["සතුන්", "සත්ව", "සතෙකු", "බල්ලා", "බල්ල", "බළලා", "බළල", "සිවුපා", "animals", "animal", "dog", "dogs", "puppy", "cat", "cats", "pet"] },
  { category: "Birds", names: ["Birds", "කුරුල්ලන්"], terms: ["කුරුල්ල", "කුරුළු", "පක්ෂී", "bird", "birds"] },
  { category: "Fruits", names: ["Fruits", "පලතුරු"], terms: ["පලතුරු", "පළතුරු", "fruit", "fruits"] },
  { category: "Vehicles", names: ["Vehicles", "වාහන"], terms: ["වාහන", "ගමනාගමන", "යාන", "ප්‍රවාහන", "ප්_රවාහන", "vehicle", "vehicles", "transport", "car", "cars", "bus", "train", "plane"] },
  { category: "Food & plants", names: ["Food & plants", "ආහාර සහ ශාක"], terms: ["ආහාර", "එළව", "එලව", "බෝග", "කුළුබඩු", "food", "foods", "vegetable", "vegetables", "plant", "plants", "crop"] },
  { category: "Letters & numbers", names: ["Letters & numbers", "අකුරු සහ ඉලක්කම්"], terms: ["අකුරු", "හෝඩිය", "ඉලක්කම්", "letters", "alphabet", "numbers", "numerals"] },
  { category: "Sports", names: ["Sports", "ක්‍රීඩා"], terms: ["ක්_රීඩා", "ක්‍රීඩා", "ක්_රීඩක", "sports", "sport", "player", "players"] },
  { category: "Cartoons & characters", names: ["Cartoons & characters", "කාටූන් සහ චරිත"], terms: ["කාටූන්", "cartoon", "cartoons", "character", "characters"] },
  { category: "People & places", names: ["People & places", "මිනිසුන් සහ ස්ථාන"], terms: ["පවුල", "පුද්ගල", "පාසල", "පාසල්", "නිවස", "ස්ථාන", "ස්තාන", "people", "family", "school", "home", "places"] },
  { category: "Nature", names: ["Nature", "සොබාදහම"], terms: ["ශාක", "ගස", "ගස්", "පරිසර", "අහස", "ගංගා", "කදු", "කඳු", "nature", "tree", "trees", "environment", "landscape"] }
];

const querySynonyms: Record<string, string[]> = {
  flower: ["flowers", "blossom", "මල්", "මල"],
  flowers: ["flower", "blossom", "මල්", "මල"],
  මල: ["මල්", "flower", "flowers"],
  මල්: ["මල", "flower", "flowers"],
  dog: ["dogs", "puppy", "animal", "animals", "බල්ලා", "බල්ලෝ", "සතුන්"],
  dogs: ["dog", "puppy", "animal", "animals", "බල්ලා", "බල්ලෝ", "සතුන්"],
  බල්ලා: ["බල්ලෝ", "dog", "dogs", "animal", "animals", "සතුන්"],
  බල්ලෝ: ["බල්ලා", "dog", "dogs", "animal", "animals", "සතුන්"],
  cat: ["cats", "animal", "animals", "බළලා", "සතුන්"],
  cats: ["cat", "animal", "animals", "බළලා", "සතුන්"],
  bird: ["birds", "කුරුල්ලෝ", "කුරුල්ලන්"],
  birds: ["bird", "කුරුල්ලෝ", "කුරුල්ලන්"],
  fruit: ["fruits", "පලතුරු", "පළතුරු"],
  fruits: ["fruit", "පලතුරු", "පළතුරු"],
  vehicle: ["vehicles", "transport", "වාහන"],
  vehicles: ["vehicle", "transport", "වාහන"],
  transport: ["vehicle", "vehicles", "වාහන", "ගමනාගමනය"],
  animals: ["animal", "dog", "dogs", "cat", "cats", "සතුන්", "සත්ව"],
  animal: ["animals", "dog", "dogs", "cat", "cats", "සතුන්", "සත්ව"]
};

const metadataOverrides: Record<string, { englishName: string; keywords?: string[] }> = {
  "මල්.pdf": { englishName: "Flowers", keywords: ["flower", "flowers", "blossom", "මල"] },
  "මල් වර්ග.pdf": { englishName: "Types of flowers", keywords: ["flower", "flowers", "blossom", "මල"] },
  "මල් වර්ගයන්.pdf": { englishName: "Types of flowers", keywords: ["flower", "flowers", "blossom", "මල"] },
  "අවුරුද්දට වරක් පිපින මල්.pdf": { englishName: "Flowers that bloom once a year", keywords: ["flower", "flowers", "blossom", "මල"] },
  "විවිධ සතුන්.pdf": { englishName: "Different animals", keywords: ["animal", "animals", "dog", "dogs", "cat", "cats", "සතෙකු"] },
  "පළතුරු.pdf": { englishName: "Fruits", keywords: ["fruit", "fruits", "පලතුරු"] },
  "පළතුරු වර්ග.pdf": { englishName: "Types of fruits", keywords: ["fruit", "fruits", "පලතුරු"] },
  "එළවළු.pdf": { englishName: "Vegetables", keywords: ["vegetable", "vegetables", "එළවලු"] },
  "එළවලු.pdf": { englishName: "Vegetables", keywords: ["vegetable", "vegetables", "එළවළු"] },
  "ලෝකයේ විවිධ වාහන.pdf": { englishName: "Different vehicles around the world", keywords: ["vehicle", "vehicles", "transport", "car", "bus", "train", "plane"] }
};

function searchable(value: string): string {
  return value
    .normalize("NFC")
    .toLocaleLowerCase()
    .replace(/[_\u200b-\u200f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function createColoringSheet(filePath: string, url: string, sizeBytes: number): ColoringSheet {
  const filename = filePath.split("/").at(-1) ?? filePath;
  const sinhalaName = filename.replace(/\.(pdf|png|jpe?g|webp)$/i, "").replace(/_/g, "\u200d").trim();
  const normalizedName = searchable(sinhalaName);
  const rule = categoryRules.find(candidate => candidate.terms.some(term => normalizedName.includes(searchable(term))));
  const category = rule?.category ?? "Other";
  const override = metadataOverrides[filename];
  const englishName = override?.englishName ?? rule?.names[0] ?? "Learning sheet";
  const keywords = [...new Set([sinhalaName, englishName, ...(rule?.terms ?? []), ...(override?.keywords ?? [])])];
  return { id: filePath, sinhalaName, englishName, keywords, category, url, sizeBytes, mediaType: /\.pdf$/i.test(filename) ? "pdf" : "image", grade: null, titleOrder: null, titleSinhala: null, titleTransliteration: null };
}

export function createGradeColoringSheet(filePath: string, url: string, sizeBytes: number): ColoringSheet {
  const sheet = createColoringSheet(filePath, url, sizeBytes);
  const match = filePath.match(/^Grade (\d+)\/Title (\d+) ([^/]+)\//i);
  if (!match) return sheet;

  const grade = Number(match[1]);
  const titleOrder = Number(match[2]);
  const title = gradeTitles[grade]?.[titleOrder];
  const titleTransliteration = title?.transliteration ?? match[3].replace(/^Title\s+\d+\s*/i, "").trim();
  const titleSinhala = title?.sinhala ?? titleTransliteration;
  const filename = filePath.split("/").at(-1)?.replace(/\.(png|jpe?g|webp|pdf)$/i, "") ?? sheet.sinhalaName;
  const englishName = filename.replace(/[-_]+/g, " ").replace(/\b[a-z]/g, character => character.toLocaleUpperCase("en-US"));
  return {
    ...sheet,
    grade,
    titleOrder,
    titleSinhala,
    titleTransliteration,
    englishName,
    keywords: [...new Set([...sheet.keywords, filePath, titleSinhala, titleTransliteration, filename, englishName])]
  };
}

export function normalizeColoringQuery(query: string): string {
  return searchable(query);
}

function queryTerms(query: string): string[] {
  const normalized = searchable(query);
  if (!normalized) return [];
  const tokens = normalized.split(" ");
  const expanded = tokens.flatMap(token => [token, ...(querySynonyms[token] ?? [])]);
  const categoryRule = categoryRules.find(rule => rule.terms.some(term => searchable(term) === normalized));
  if (categoryRule) expanded.push(...categoryRule.terms);
  return [...new Set(expanded.map(searchable).filter(Boolean))];
}

export function searchColoringSheets(sheets: ColoringSheet[], query: string, category?: ColoringCategory | "All"): ColoringSheet[] {
  const normalizedQuery = searchable(query);
  const terms = queryTerms(query);
  return sheets
    .filter(sheet => category === undefined || category === "All" || sheet.category === category)
    .map(sheet => {
      const title = searchable(`${sheet.sinhalaName} ${sheet.englishName}`);
      const keywords = searchable(sheet.keywords.join(" "));
      let score = 0;
      if (normalizedQuery && title === normalizedQuery) score = 100;
      else if (normalizedQuery && title.startsWith(normalizedQuery)) score = 80;
      else if (normalizedQuery && title.includes(normalizedQuery)) score = 60;
      else if (terms.some(term => title.includes(term))) score = 45;
      else if (terms.some(term => keywords.includes(term))) score = 35;
      else if (terms.some(term => categoryRules.some(rule => rule.names.some(name => searchable(name) === term) && rule.category === sheet.category))) score = 25;
      return { sheet, score };
    })
    .filter(result => !normalizedQuery || result.score > 0)
    .sort((left, right) => right.score - left.score || left.sheet.sinhalaName.localeCompare(right.sheet.sinhalaName, "si"))
    .map(result => result.sheet);
}

export function sortColoringSheets(sheets: ColoringSheet[], order: "curriculum" | "name"): ColoringSheet[] {
  return [...sheets].sort((left, right) => {
    if (order === "name") return left.sinhalaName.localeCompare(right.sinhalaName, "si");
    const gradeDifference = (left.grade ?? Number.MAX_SAFE_INTEGER) - (right.grade ?? Number.MAX_SAFE_INTEGER);
    if (gradeDifference) return gradeDifference;
    const titleDifference = (left.titleOrder ?? Number.MAX_SAFE_INTEGER) - (right.titleOrder ?? Number.MAX_SAFE_INTEGER);
    return titleDifference || left.sinhalaName.localeCompare(right.sinhalaName, "si");
  });
}

export const coloringCategories: Array<ColoringCategory | "All"> = [
  "All", "Animals", "Birds", "Flowers", "Fruits", "Vehicles", "Food & plants",
  "Letters & numbers", "Sports", "Cartoons & characters", "Nature", "People & places", "Other"
];
