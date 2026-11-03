import { sinhalaAlphabetSections } from "../data/sinhala-alphabet";

export const worksheetCategories = [
  "Sinhala Alphabet Worksheets",
  "English Alphabet Worksheets",
  "Numbers 1–100",
  "Mathematics Worksheets",
  "Colouring Pages",
  "Shapes & Pictures",
  "Handwriting Practice",
  "Matching Activities",
  "Grade 1–5 Activity Sheets"
] as const;

export type WorksheetCategory = (typeof worksheetCategories)[number];
export type WorksheetLanguage = "English" | "Sinhala";
export type WorksheetDifficulty = "Easy" | "Medium" | "Advanced";
export type WorksheetOrientation = "portrait" | "landscape";
export type WorksheetLetterCase = "uppercase" | "lowercase" | "both";
export type WorksheetColoringCategory = "Animals" | "Birds" | "Flowers" | "Fruits" | "Vegetables" | "Vehicles" | "Nature" | "Original illustrations" | "Educational objects";
export type WorksheetActivity =
  | "Trace letters" | "Identify letters" | "Letter pictures"
  | "Trace numbers" | "Number recognition" | "Counting" | "Missing numbers" | "Before and after"
  | "Addition" | "Subtraction" | "Multiplication" | "Division" | "Compare numbers" | "Fractions" | "Word problems" | "Number patterns"
  | "Colouring" | "Shape tracing" | "Find the shape" | "Match shapes" | "Identify picture"
  | "Words" | "Sentences" | "Writing lines"
  | "Match letters and pictures" | "Match numbers and quantities" | "Match shapes and names" | "Match words and pictures"
  | "Grade activity";

export type WorksheetExercise = {
  id: string;
  prompt: string;
  answer: string;
  picture?: string;
  kind?: "trace" | "write" | "match" | "color";
};

export type WorksheetDraft = {
  id: string;
  title: string;
  category: WorksheetCategory;
  activity: WorksheetActivity;
  language: WorksheetLanguage;
  grade: number;
  difficulty: WorksheetDifficulty;
  orientation: WorksheetOrientation;
  fontFamily: string;
  borderStyle: "solid" | "dashed" | "dotted";
  letterCase: WorksheetLetterCase;
  coloringCategory: WorksheetColoringCategory;
  fontSize: number;
  lineSpacing: number;
  textColor: string;
  background: string;
  borderColor: string;
  schoolName: string;
  studentName: boolean;
  gradeDate: boolean;
  instructions: string;
  includeAnswerKey: boolean;
  startNumber: number;
  endNumber: number;
  selectedLetters: string;
  shuffleMatches: boolean;
  exercises: WorksheetExercise[];
  createdAt: number;
  updatedAt: number;
};

export type WorksheetTemplate = Pick<WorksheetDraft,
  "title" | "category" | "activity" | "language" | "grade" | "difficulty" | "instructions"> & {
    id: string;
    description: string;
    icon: string;
  };

export const worksheetTemplates: WorksheetTemplate[] = [
  { id: "si-vowels", title: "Sinhala vowels", category: "Sinhala Alphabet Worksheets", activity: "Trace letters", language: "Sinhala", grade: 1, difficulty: "Easy", instructions: "Trace each letter, then write it on the line.", description: "Trace the Sinhala vowel set.", icon: "අ" },
  { id: "en-uppercase", title: "Big A–Z letters", category: "English Alphabet Worksheets", activity: "Trace letters", language: "English", grade: 1, difficulty: "Easy", instructions: "Say each letter, trace it, and try it yourself.", description: "Uppercase alphabet tracing.", icon: "Aa" },
  { id: "number-trace", title: "Number tracing 1–20", category: "Numbers 1–100", activity: "Trace numbers", language: "English", grade: 1, difficulty: "Easy", instructions: "Trace each number and count aloud.", description: "Practise number formation.", icon: "123" },
  { id: "addition-easy", title: "Friendly addition", category: "Mathematics Worksheets", activity: "Addition", language: "English", grade: 1, difficulty: "Easy", instructions: "Work out each sum. Show your thinking.", description: "Addition practice with small numbers.", icon: "+" },
  { id: "shape-search", title: "Shape detective", category: "Shapes & Pictures", activity: "Find the shape", language: "English", grade: 1, difficulty: "Easy", instructions: "Circle each shape that matches the name.", description: "Spot and name basic shapes.", icon: "△" },
  { id: "animal-colouring", title: "Garden friends", category: "Colouring Pages", activity: "Colouring", language: "English", grade: 1, difficulty: "Easy", instructions: "Colour the picture using your favourite colours.", description: "Original print-friendly outline pictures.", icon: "♡" },
  { id: "writing-lines", title: "My first words", category: "Handwriting Practice", activity: "Words", language: "English", grade: 2, difficulty: "Easy", instructions: "Trace the word, then write it neatly.", description: "Copy simple everyday words.", icon: "✎" },
  { id: "picture-match", title: "Picture pairs", category: "Matching Activities", activity: "Match words and pictures", language: "English", grade: 2, difficulty: "Easy", instructions: "Draw a line from each word to its picture.", description: "Match words with familiar objects.", icon: "↔" },
  { id: "grade-three", title: "Grade 3 number patterns", category: "Grade 1–5 Activity Sheets", activity: "Grade activity", language: "English", grade: 3, difficulty: "Medium", instructions: "Find the rule and complete each pattern.", description: "Editable primary activity starter.", icon: "3" },
  { id: "sinhala-numbers", title: "සිංහල ඉලක්කම් 1–20", category: "Numbers 1–100", activity: "Trace numbers", language: "Sinhala", grade: 1, difficulty: "Easy", instructions: "අංකය හඳුනාගෙන ලියන්න.", description: "Practise Sinhala numeral forms.", icon: "෧෨෩" },
  { id: "grade-two-addition", title: "Grade 2 maths practice", category: "Grade 1–5 Activity Sheets", activity: "Grade activity", language: "English", grade: 2, difficulty: "Easy", instructions: "Solve each problem carefully.", description: "Addition and subtraction practice.", icon: "2" },
  { id: "grade-four-maths", title: "Grade 4 problem solving", category: "Grade 1–5 Activity Sheets", activity: "Grade activity", language: "English", grade: 4, difficulty: "Medium", instructions: "Read each question, then show your working.", description: "Multiplication and word problems.", icon: "4" },
  { id: "grade-five-challenge", title: "Grade 5 challenge", category: "Grade 1–5 Activity Sheets", activity: "Grade activity", language: "English", grade: 5, difficulty: "Advanced", instructions: "Read each question and check your answer.", description: "Primary-level challenge questions.", icon: "5" }
];

export const sinhalaNumerals = ["෦", "෧", "෨", "෩", "෪", "෫", "෬", "෭", "෮", "෯"];

export function formatWorksheetNumber(value: number, language: WorksheetLanguage): string {
  if (!Number.isSafeInteger(value)) throw new RangeError("Worksheet numbers must be whole numbers.");
  return language === "Sinhala"
    ? String(value).replace(/\d/g, digit => sinhalaNumerals[Number(digit)])
    : String(value);
}

const englishLetters = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
const sinhalaLetters = [...sinhalaAlphabetSections[0].letters, ...sinhalaAlphabetSections[1].letters];
const letterWords: Record<string, { word: string; picture: string }> = {
  A: { word: "Apple", picture: "apple" }, B: { word: "Ball", picture: "ball" }, C: { word: "Cat", picture: "cat" },
  D: { word: "Daisy", picture: "flower" }, E: { word: "Egg", picture: "egg" }, F: { word: "Fish", picture: "fish" },
  G: { word: "Giraffe", picture: "animal" }, H: { word: "House", picture: "house" }, I: { word: "Ice cream", picture: "icecream" },
  J: { word: "Juice", picture: "cup" }, K: { word: "Kite", picture: "kite" }, L: { word: "Leaf", picture: "leaf" },
  M: { word: "Moon", picture: "moon" }, N: { word: "Nest", picture: "nest" }, O: { word: "Orange", picture: "orange" },
  P: { word: "Pencil", picture: "pencil" }, Q: { word: "Queen", picture: "crown" }, R: { word: "Rainbow", picture: "rainbow" },
  S: { word: "Sun", picture: "sun" }, T: { word: "Tree", picture: "tree" }, U: { word: "Umbrella", picture: "umbrella" },
  V: { word: "Van", picture: "vehicle" }, W: { word: "Watermelon", picture: "fruit" }, X: { word: "Xylophone", picture: "xylophone" },
  Y: { word: "Yo-yo", picture: "ball" }, Z: { word: "Zebra", picture: "animal" }
};
const matchPairs = [
  { word: "Apple", sinhala: "ඇපල්", picture: "apple" }, { word: "Cat", sinhala: "බළලා", picture: "cat" },
  { word: "Sun", sinhala: "හිරු", picture: "sun" }, { word: "Flower", sinhala: "මල", picture: "flower" },
  { word: "Fish", sinhala: "මාළුවා", picture: "fish" }, { word: "Ball", sinhala: "බෝලය", picture: "ball" },
  { word: "Leaf", sinhala: "කොළය", picture: "leaf" }, { word: "House", sinhala: "ගෙදර", picture: "house" }
];
const shapes = ["Circle", "Square", "Triangle", "Rectangle", "Star", "Oval", "Diamond"];
const sinhalaShapeNames = ["වෘත්තය", "චතුරස්‍රය", "ත්‍රිකෝණය", "ඍජුකෝණාස්‍රය", "තරුව", "ඕවලාකාරය", "දියමන්තිය"];
const sinhalaNumberWords = ["", "එක", "දෙක", "තුන", "හතර", "පහ", "හය", "හත", "අට", "නවය", "දහය", "එකොළහ", "දොළහ", "දහතුන", "දහහතර", "පහළොව", "දහසය", "දහහත", "දහඅට", "දහනවය", "විස්ස"];

function exercise(id: number, prompt: string, answer = "", options: Pick<WorksheetExercise, "picture" | "kind"> = {}): WorksheetExercise {
  return { id: `exercise-${id + 1}`, prompt, answer, ...options };
}

export function generateWorksheetExercises(
  draft: Pick<WorksheetDraft, "category" | "activity" | "language" | "grade" | "difficulty" | "startNumber" | "endNumber" | "selectedLetters" | "shuffleMatches" | "letterCase" | "coloringCategory">,
  count: number
): WorksheetExercise[] {
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new RangeError("Choose between 1 and 100 exercises.");
  if (!Number.isInteger(draft.grade) || draft.grade < 1 || draft.grade > 5) throw new RangeError("Grade must be from 1 to 5.");
  if (!Number.isInteger(draft.startNumber) || !Number.isInteger(draft.endNumber) || draft.startNumber < 1 || draft.endNumber > 100 || draft.startNumber > draft.endNumber) {
    throw new RangeError("Choose a valid number range from 1 to 100.");
  }
  const isSi = draft.language === "Sinhala";
  const number = (value: number) => formatWorksheetNumber(value, draft.language);
  const chosenLetters = draft.selectedLetters.trim()
    ? Array.from(new Set(Array.from(draft.selectedLetters.replace(/[\s,،]+/gu, ""))))
    : draft.category === "Sinhala Alphabet Worksheets" || isSi
      ? sinhalaLetters
      : englishLetters;
  const letterList = draft.category === "English Alphabet Worksheets" && !isSi
    ? draft.letterCase === "both"
      ? chosenLetters.flatMap(letter => [letter.toUpperCase(), letter.toLowerCase()])
      : chosenLetters.map(letter => draft.letterCase === "lowercase" ? letter.toLowerCase() : letter.toUpperCase())
    : chosenLetters;
  const difficultyScale = draft.difficulty === "Easy" ? (draft.grade === 5 ? 20 : draft.grade >= 4 ? 10 : 5) : draft.difficulty === "Medium" ? 20 : 100;
  const targetCount = Math.min(count, 100);

  if (draft.activity === "Trace letters" || draft.activity === "Identify letters" || draft.activity === "Letter pictures") {
    return Array.from({ length: targetCount }, (_, index) => {
      const letter = letterList[index % letterList.length];
      const word = letterWords[letter.toUpperCase()];
      if (draft.activity === "Letter pictures") {
        return exercise(index, `${letter}  ${word?.word ?? ""}`, word?.word ?? "", { picture: word?.picture ?? "flower", kind: "match" });
      }
      if (draft.activity === "Identify letters") {
        return exercise(index, `${letter}    ${letter.toLowerCase()}    ${chosenLetters[(index + 1) % chosenLetters.length]}`, letter, { kind: "write" });
      }
      return exercise(index, `${letter}   ${letter}   ${letter}`, letter, { kind: "trace" });
    });
  }

  if (draft.activity === "Trace numbers" || draft.activity === "Number recognition" || draft.activity === "Counting" || draft.activity === "Missing numbers" || draft.activity === "Before and after") {
    const span = draft.endNumber - draft.startNumber + 1;
    if ((draft.activity === "Missing numbers" || draft.activity === "Before and after") && span < 3) {
      throw new RangeError(`${draft.activity} needs a number range containing at least three values.`);
    }
    return Array.from({ length: targetCount }, (_, index) => {
      const value = draft.startNumber + (index % span);
      if (draft.activity === "Missing numbers") {
        const missingStart = draft.endNumber - draft.startNumber >= 2
          ? draft.startNumber + (index % (draft.endNumber - draft.startNumber - 1))
          : draft.startNumber;
        return exercise(index, `${number(missingStart)}   _____   ${number(Math.min(missingStart + 2, draft.endNumber))}`, number(missingStart + 1));
      }
      if (draft.activity === "Before and after") {
        const centre = draft.startNumber + 1 + (index % (span - 2));
        return exercise(index, `_____   ${number(centre)}   _____`, `${number(centre - 1)} , ${number(centre + 1)}`);
      }
      if (draft.activity === "Counting") return exercise(index, "Count the objects:", number(index % 8 + 1), { picture: `count-${index % 8 + 1}` });
      if (draft.activity === "Number recognition") return exercise(index, `Circle ${number(value)}:   ${number(value)}   ${number(Math.min(value + 1, draft.endNumber))}   ${number(Math.max(draft.startNumber, value - 1))}`, number(value));
      return exercise(index, `${number(value)}   ${number(value)}   ${number(value)}`, number(value), { kind: "trace" });
    });
  }

  if (["Addition", "Subtraction", "Multiplication", "Division", "Compare numbers", "Fractions", "Word problems", "Number patterns", "Grade activity"].includes(draft.activity)) {
    return Array.from({ length: targetCount }, (_, index) => {
      const a = 1 + (index * 7) % difficultyScale;
      const b = 1 + (index * 3 + draft.grade) % difficultyScale;
      const operation = draft.activity === "Grade activity"
        ? (draft.grade <= 1 ? "Addition" : draft.grade === 2 ? index % 2 ? "Subtraction" : "Addition" : draft.grade === 3 ? index % 2 ? "Number patterns" : "Multiplication" : draft.grade === 4 ? index % 2 ? "Word problems" : "Multiplication" : index % 3 === 0 ? "Fractions" : index % 2 ? "Division" : "Word problems")
        : draft.activity;
      if (operation === "Subtraction") return exercise(index, `${number(a + b)} − ${number(b)} = _____`, number(a));
      if (operation === "Multiplication") return exercise(index, `${number(a)} × ${number(b)} = _____`, number(a * b));
      if (operation === "Division") {
        const divisor = 1 + index % Math.max(2, Math.min(9, difficultyScale));
        const quotient = 1 + index % 10;
        return exercise(index, `${number(divisor * quotient)} ÷ ${number(divisor)} = _____`, number(quotient));
      }
      if (operation === "Compare numbers") {
        const left = a + index;
        const right = b + index;
        return exercise(index, `${number(left)}  _____  ${number(right)}`, left > right ? ">" : left < right ? "<" : "=");
      }
      if (operation === "Fractions") return exercise(index, `Shade one part: 1 / ${number(2 + index % 4)}`, `1/${2 + index % 4}`, { picture: "fraction", kind: "color" });
      if (operation === "Word problems") return exercise(index, `${number(a)} apples + ${number(b)} apples. How many apples?`, number(a + b), { picture: "apple" });
      if (operation === "Number patterns") return exercise(index, `${number(a)}  ${number(a + 2)}  ${number(a + 4)}  _____`, number(a + 6));
      return exercise(index, `${number(a)} + ${number(b)} = _____`, number(a + b));
    });
  }

  if (draft.activity === "Shape tracing" || draft.activity === "Find the shape" || draft.activity === "Match shapes") {
    return Array.from({ length: targetCount }, (_, index) => {
      const shapeIndex = index % shapes.length;
      const label = isSi ? sinhalaShapeNames[shapeIndex] : shapes[shapeIndex];
      const prompt = draft.activity === "Shape tracing" ? `Trace the ${label}` : draft.activity === "Find the shape" ? `Find the ${label}:  ${shapes.slice((index + 1) % shapes.length, (index + 1) % shapes.length + 3).join("   ")}` : `Match ${label} to an object`;
      return exercise(index, prompt, label, { picture: shapes[shapeIndex].toLowerCase(), kind: draft.activity === "Shape tracing" ? "trace" : "match" });
    });
  }

  if (draft.activity === "Identify picture") {
    const pictures = [
      { en: "Apple", si: "ඇපල්", picture: "apple" }, { en: "Bird", si: "කුරුල්ලා", picture: "bird" },
      { en: "Flower", si: "මල", picture: "flower" }, { en: "House", si: "ගෙදර", picture: "house" },
      { en: "Tree", si: "ගස", picture: "tree" }, { en: "Car", si: "මෝටර් රථය", picture: "vehicle" }
    ];
    return Array.from({ length: targetCount }, (_, index) => {
      const item = pictures[index % pictures.length];
      return exercise(index, isSi ? "මෙය කුමක්ද?" : "What is this picture?", isSi ? item.si : item.en, { picture: item.picture, kind: "write" });
    });
  }

  if (draft.activity === "Colouring") {
    const pictures: Record<WorksheetColoringCategory, string[]> = {
      Animals: ["animal", "cat", "fish"], Birds: ["bird"], Flowers: ["flower"],
      Fruits: ["fruit", "apple"], Vegetables: ["carrot", "leaf", "carrot"], Vehicles: ["vehicle"],
      Nature: ["tree", "leaf", "sun"], "Original illustrations": ["animal", "bird", "flower", "fruit"],
      "Educational objects": ["pencil", "house", "book"]
    };
    const categoryPictures = pictures[draft.coloringCategory];
    return Array.from({ length: targetCount }, (_, index) => exercise(index, `Colour the ${draft.coloringCategory.toLowerCase()} picture.`, "", { picture: categoryPictures[index % categoryPictures.length], kind: "color" }));
  }

  if (draft.activity === "Match letters and pictures" || draft.activity === "Match words and pictures" || draft.activity === "Match numbers and quantities" || draft.activity === "Match shapes and names") {
    const pairs: Array<{ word: string; sinhala: string; picture: string }> = draft.activity === "Match shapes and names"
      ? shapes.map((word, index) => ({ word, sinhala: sinhalaShapeNames[index], picture: word.toLowerCase() }))
      : draft.activity === "Match numbers and quantities"
        ? Array.from({ length: 8 }, (_, index) => ({ word: String(index + 1), sinhala: number(index + 1), picture: `count-${index + 1}` }))
        : draft.activity === "Match letters and pictures"
          ? englishLetters.slice(0, 8).map(letter => ({ word: letter, sinhala: letter, picture: letterWords[letter].picture }))
          : matchPairs;
    const rightColumn = draft.shuffleMatches ? [...pairs].reverse() : pairs;
    return Array.from({ length: targetCount }, (_, index) => {
      const pair = pairs[index % pairs.length];
      return exercise(index, `${isSi ? pair.sinhala : pair.word}   →`, isSi ? pair.sinhala : pair.word, { picture: rightColumn[index % rightColumn.length]?.picture ?? pair.picture, kind: "match" });
    });
  }

  if (draft.activity === "Words" || draft.activity === "Sentences" || draft.activity === "Writing lines") {
    const words = isSi ? ["අම්මා", "තාත්තා", "මල", "ගස", "පාසල", "පොත", "හිරු", "මිතුරා"] : ["apple", "book", "flower", "friend", "school", "sunshine", "kindness", "rainbow"];
    return Array.from({ length: targetCount }, (_, index) => {
      const word = words[index % words.length];
      const text = draft.activity === "Sentences" ? isSi ? "මම පාසලට යමි." : "I love to learn new things." : word;
      return exercise(index, `${text}   ${text}`, text, { kind: "trace" });
    });
  }

  return Array.from({ length: targetCount }, (_, index) => exercise(index, `${number(index + 1)}. Write your answer here.`, "", { kind: "write" }));
}
