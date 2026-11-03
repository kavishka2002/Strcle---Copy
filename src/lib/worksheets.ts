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
  promptSinhala?: string;
  answerSinhala?: string;
  picture?: string;
  kind?: "trace" | "write" | "match" | "color";
  choices?: string[];
  choicesSinhala?: string[];
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
  sourceTemplateId?: string;
  createdAt: number;
  updatedAt: number;
};

export type WorksheetTemplate = Pick<WorksheetDraft,
  "title" | "category" | "activity" | "language" | "grade" | "difficulty" | "instructions"> & {
    id: string;
    titleSinhala: string;
    description: string;
    descriptionSinhala: string;
    instructionsSinhala: string;
    icon: string;
    contentKey: string;
    exerciseCount: number;
    languages: WorksheetLanguage[];
  };

import { worksheetTemplateDefinitions } from "../data/worksheet-templates";

export const worksheetTemplates = worksheetTemplateDefinitions;

export function getWorksheetTemplate(id: string): WorksheetTemplate | undefined {
  return worksheetTemplates.find(template => template.id === id);
}

export function duplicateWorksheetDraft(draft: WorksheetDraft, id: string, now = Date.now()): WorksheetDraft {
  return {
    ...draft,
    id,
    createdAt: now,
    updatedAt: now,
    exercises: draft.exercises.map(item => ({
      ...item,
      choices: item.choices ? [...item.choices] : undefined,
      choicesSinhala: item.choicesSinhala ? [...item.choicesSinhala] : undefined
    }))
  };
}

export function validateWorksheetDraft(draft: WorksheetDraft): string[] {
  const errors: string[] = [];
  if (!draft.title.trim()) errors.push("Enter a worksheet title.");
  else if (draft.title.length > 120) errors.push("Worksheet title must be 120 characters or fewer.");
  if (!draft.instructions.trim()) errors.push("Enter worksheet instructions.");
  else if (draft.instructions.length > 500) errors.push("Instructions must be 500 characters or fewer.");
  if (!worksheetCategories.includes(draft.category)) errors.push("Choose a valid worksheet category.");
  if (draft.language !== "English" && draft.language !== "Sinhala") errors.push("Choose English or Sinhala.");
  if (draft.orientation !== "portrait" && draft.orientation !== "landscape") errors.push("Choose A4 portrait or landscape.");
  if (!Number.isInteger(draft.grade) || draft.grade < 1 || draft.grade > 5) errors.push("Grade must be from 1 to 5.");
  if (!Number.isFinite(draft.fontSize) || draft.fontSize < 12 || draft.fontSize > 36) errors.push("Font size must be from 12 to 36.");
  if (!Number.isFinite(draft.lineSpacing) || draft.lineSpacing < 1 || draft.lineSpacing > 2.5) errors.push("Line spacing must be from 1 to 2.5.");
  if (!Number.isInteger(draft.startNumber) || !Number.isInteger(draft.endNumber) || draft.startNumber < 1 || draft.endNumber > 100 || draft.startNumber > draft.endNumber) {
    errors.push("Choose a valid number range from 1 to 100.");
  }
  if (!/^#[0-9a-f]{6}$/i.test(draft.textColor) || !/^#[0-9a-f]{6}$/i.test(draft.background) || !/^#[0-9a-f]{6}$/i.test(draft.borderColor)) {
    errors.push("Choose valid worksheet colours.");
  }
  if (!draft.exercises.length || draft.exercises.length > 100) errors.push("A worksheet needs between 1 and 100 questions.");
  else if (draft.exercises.some(item => !item.prompt.trim() || item.prompt.length > 500 || item.answer.length > 500)) {
    errors.push("Every question needs prompt text and must be 500 characters or fewer.");
  }
  if (draft.schoolName.length > 120) errors.push("School name must be 120 characters or fewer.");
  if (!Number.isFinite(draft.createdAt) || !Number.isFinite(draft.updatedAt)) errors.push("Worksheet dates are invalid.");
  return errors;
}

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

function exercise(id: number, prompt: string, answer = "", options: Pick<WorksheetExercise, "picture" | "kind" | "choices" | "choicesSinhala"> = {}): WorksheetExercise {
  return { id: `exercise-${id + 1}`, prompt, answer, ...options };
}

function bilingualExercise(
  id: number,
  prompt: string,
  promptSinhala: string,
  answer = "",
  answerSinhala = answer,
  options: Pick<WorksheetExercise, "picture" | "kind" | "choices" | "choicesSinhala"> = {}
): WorksheetExercise {
  return { id: `exercise-${id + 1}`, prompt, promptSinhala, answer, answerSinhala, ...options };
}

function buildTemplateExercises(template: WorksheetTemplate, count: number): WorksheetExercise[] {
  const vowels = sinhalaAlphabetSections[0].letters;
  const consonants = sinhalaAlphabetSections[1].letters;
  const englishWords = Object.entries(letterWords).map(([letter, value]) => ({ letter, ...value }));
  const shapeNames = shapes.map((english, index) => ({ english, sinhala: sinhalaShapeNames[index], picture: english.toLowerCase() }));
  const siWords = [
    { english: "mango", sinhala: "අඹ", picture: "mango" },
    { english: "flower", sinhala: "මල", picture: "flower" },
    { english: "tree", sinhala: "ගස", picture: "tree" },
    { english: "book", sinhala: "පොත", picture: "book" },
    { english: "sun", sinhala: "හිරු", picture: "sun" },
    { english: "fish", sinhala: "මාළුවා", picture: "fish" },
    { english: "house", sinhala: "ගෙදර", picture: "house" },
    { english: "bird", sinhala: "කුරුල්ලා", picture: "bird" }
  ];
  const siWordLetters = ["අ", "ම", "ග", "ප", "හ", "ම", "ග", "ක"];
  const mathProblems = Array.from({ length: 12 }, (_, index) => {
    const a = index + 2;
    const b = index + 1;
    const operation = template.contentKey === "math-subtract" ? "subtract"
      : template.contentKey === "math-multiply" ? "multiply"
        : template.contentKey === "math-divide" ? "divide" : "add";
    if (operation === "subtract") return { en: `${a + b} − ${b} = _____`, si: `${formatWorksheetNumber(a + b, "Sinhala")} − ${formatWorksheetNumber(b, "Sinhala")} = _____`, answer: a };
    if (operation === "multiply") return { en: `${a} × ${b} = _____`, si: `${formatWorksheetNumber(a, "Sinhala")} × ${formatWorksheetNumber(b, "Sinhala")} = _____`, answer: a * b };
    if (operation === "divide") return { en: `${a * b} ÷ ${a} = _____`, si: `${formatWorksheetNumber(a * b, "Sinhala")} ÷ ${formatWorksheetNumber(a, "Sinhala")} = _____`, answer: b };
    return { en: `${a} + ${b} = _____`, si: `${formatWorksheetNumber(a, "Sinhala")} + ${formatWorksheetNumber(b, "Sinhala")} = _____`, answer: a + b };
  });
  const data: WorksheetExercise[] = [];
  const add = (en: string, si: string, answer = "", answerSi = answer, options: Pick<WorksheetExercise, "picture" | "kind" | "choices" | "choicesSinhala"> = {}) => {
    data.push(bilingualExercise(data.length, en, si, answer, answerSi, options));
  };
  const key = template.contentKey;
  const illustratedPictures = new Set(["cat", "dog", "elephant", "lion", "bird", "butterfly", "flower", "fruit", "apple", "banana", "car", "house", "tree", "nature", "mango", "orange", "leaf", "kite", "cow", "plant", "road", "water"]);
  const wordTranslations: Record<string, string> = {
    Apple: "ඇපල්", Ball: "බෝලය", Banana: "කෙසෙල්", Cat: "බළලා", Daisy: "මල", Dog: "බල්ලා",
    Egg: "බිත්තරය", Elephant: "අලියා", Fish: "මාළුවා", Flower: "මල", Giraffe: "ජිරාෆ්",
    House: "ගෙදර", "Ice cream": "අයිස් ක්‍රීම්", Juice: "යුෂ", Kite: "සරුංගලය", Lion: "සිංහයා", Mango: "අඹ",
    Leaf: "කොළය", Moon: "සඳ", Nest: "කූඩුව", Orange: "දොඩම්", Pencil: "පැන්සල", Queen: "රැජින",
    Rainbow: "දේදුන්න", Sun: "හිරු", Tree: "ගස", Umbrella: "කුඩය", Van: "වෑන් රථය",
    Watermelon: "කොමඩු", Xylophone: "සයිලෆෝනය", "Yo-yo": "යෝ-යෝ", Zebra: "සීබ්‍රා",
    Circle: "වෘත්තය", Square: "චතුරස්‍රය", Triangle: "ත්‍රිකෝණය", Rectangle: "ඍජුකෝණාස්‍රය",
    Star: "තරුව", Oval: "ඕවලාකාරය", Diamond: "දියමන්තිය",
    Red: "රතු", Yellow: "කහ", Green: "කොළ", Blue: "නිල්",
    Cold: "සීතල", Small: "කුඩා", Night: "රාත්‍රිය", Down: "පහළ"
  };
  const pairExercise = (en: string, si: string, answer: string, answerSi: string, picture: string, choices?: string[]) =>
    add(en, si, answer, answerSi, {
      picture: illustratedPictures.has(picture) ? `color-${picture}` : picture,
      kind: "match",
      choices,
      choicesSinhala: choices?.map(choice => wordTranslations[choice] ?? (/^\d+$/.test(choice) ? formatWorksheetNumber(Number(choice), "Sinhala") : choice))
    });

  if (key === "si-vowels" || key === "write-si-vowels") {
    vowels.forEach(letter => add(`${letter}   ${letter}   ______`, `අකුර බලන්න: ${letter}   ______ ලියන්න`, letter, letter, { kind: "trace" }));
  } else if (key === "si-consonants" || key === "write-si-consonants") {
    consonants.slice(0, key === "si-consonants" ? 20 : 16).forEach(letter => add(`${letter}   ${letter}   ______`, `අකුර බලන්න: ${letter}   ______ ලියන්න`, letter, letter, { kind: "trace" }));
  } else if (key === "si-chart") {
    [...vowels, ...consonants].reduce<string[][]>((groups, letter, index) => {
      if (index % 4 === 0) groups.push([]);
      groups[groups.length - 1].push(letter);
      return groups;
    }, []).forEach(group => add(`Read and say: ${group.join("  ")}`, `කියවා ශබ්ද නඟා කියන්න: ${group.join("  ")}`, group.join(" "), group.join(" ")));
  } else if (key === "si-letter-picture") {
    pairExercise("අ  →  ______", "අ අකුරට ගැළපෙන රූපය තෝරන්න", "අඹ", "අඹ", "mango", siWords.map(word => word.sinhala));
  } else if (key === "si-picture-match") {
    siWords.forEach((item, index) => pairExercise(`${siWordLetters[index]}  →  ______`, `${siWordLetters[index]} අකුරට ගැළපෙන රූපය තෝරන්න`, item.sinhala, item.sinhala, item.picture, siWords.map(word => word.sinhala)));
  } else if (key === "si-trace" || key === "si-independent") {
    [...vowels.slice(0, 6), ...consonants.slice(0, 6)].forEach(letter => add(`${letter}   ${letter}   ${letter}`, `අකුර මත ලියා ඉන්පසු තනිව ලියන්න: ${letter}`, letter, letter, { kind: "trace" }));
  } else if (key === "write-dotted") {
    englishLetters.slice(0, 12).forEach(letter => add(`${letter}   ${letter}   ${letter}`, `අකුර මත ලියා ඉන්පසු තනිව ලියන්න: ${letter}`, letter, letter, { kind: "trace" }));
  } else if (key === "si-missing") {
    vowels.slice(0, 12).forEach((letter, index) => add(`${vowels[index]}   _____   ${vowels[index + 2]}`, `${vowels[index]}   _____   ${vowels[index + 2]} අතර නැති අකුර ලියන්න`, vowels[index + 1], vowels[index + 1]));
  } else if (key === "si-identify" || key === "si-circle" || key === "si-test") {
    consonants.slice(0, 12).forEach((letter, index) => {
      const choices = `${consonants[(index + 2) % consonants.length]}   ${letter}   ${consonants[(index + 4) % consonants.length]}`;
      const prompt = key === "si-identify" ? `Find the letter ${letter}:   ${choices}`
        : key === "si-test" ? `Test ${index + 1}: Write the letter after ${consonants[index]}.`
          : `Circle ${letter}:   ${choices}`;
      const promptSi = key === "si-identify" ? `${letter} අකුර සොයන්න:   ${choices}`
        : key === "si-test" ? `ප්‍රශ්නය ${index + 1}: ${consonants[index]} අකුරට පසු අකුර ලියන්න.`
          : `${letter} අකුර වට කරන්න:   ${choices}`;
      const answer = key === "si-test" ? consonants[index + 1] : letter;
      add(prompt, promptSi, answer, answer);
    });
  } else if (key === "si-words" || key === "write-si-words" || key === "match-si-words") {
    siWords.forEach(item => add(`${item.sinhala}   ${item.sinhala}   __________`, `වචනය කියවා පිටපත් කරන්න: ${item.sinhala}   __________`, item.sinhala, item.sinhala, { kind: "trace" }));
  } else if (key === "en-chart" || key === "en-uppercase" || key === "en-lowercase" || key === "write-en-upper" || key === "write-en-lower") {
    for (let index = 0; index < englishLetters.length; index += 2) {
      const first = englishLetters[index];
      const second = englishLetters[index + 1];
      const lower = key.includes("lower") ? "lower" : "upper";
      const letters = lower === "lower" ? `${first.toLowerCase()} ${second.toLowerCase()}` : `${first} ${second}`;
      const prompt = key === "en-chart" ? `Say the letters: ${letters}  ${first.toLowerCase()} ${second.toLowerCase()}` : `${letters}   ${letters}   ______`;
      const siPrompt = key === "en-chart" ? `අකුරු කියවන්න: ${letters}  ${first.toLowerCase()} ${second.toLowerCase()}` : `අකුරු මත ලියා පසුව තනිව ලියන්න: ${letters}   ______`;
      add(prompt, siPrompt, letters, letters, key === "en-chart" ? {} : { kind: "trace" });
    }
  } else if (key === "en-picture-match" || key === "en-sounds") {
    englishWords.slice(0, 8).forEach(item => pairExercise(
      key === "en-sounds" ? `Which picture begins with ${item.letter}?  ______` : `${item.letter}  →  ______`,
      key === "en-sounds" ? `${item.letter} ශබ්දයෙන් ආරම්භ වන රූපය තෝරන්න` : `${item.letter} අකුරට ගැළපෙන රූපය තෝරන්න`,
      item.word, item.word, item.picture, englishWords.slice(0, 8).map(word => word.word)
    ));
  } else if (key === "en-missing" || key === "en-write-missing" || key === "en-order" || key === "en-circle" || key === "en-test") {
    englishLetters.slice(0, 16).forEach((letter, index) => {
      const prev = englishLetters[index];
      const next = englishLetters[index + 2];
      const middle = englishLetters[index + 1];
      const prompt = key === "en-order" ? `Put in order: ${next}, ${prev}, ${middle}`
        : key === "en-circle" ? `Circle ${middle}:   ${prev}   ${middle}   ${next}`
          : key === "en-test" ? `Test ${index + 1}: Write the letter after ${prev}.`
            : `${prev}   _____   ${next}`;
      const siPrompt = key === "en-order" ? `${prev}, ${middle}, ${next} අනුපිළිවෙළට ලියන්න`
        : key === "en-circle" ? `${middle} අකුර වට කරන්න:   ${prev}   ${middle}   ${next}`
          : key === "en-test" ? `ප්‍රශ්නය ${index + 1}: ${prev} අකුරට පසු අකුර ලියන්න.`
            : `${prev} සහ ${next} අතර නැති අකුර ලියන්න`;
      add(prompt, siPrompt, middle, middle);
    });
  } else if (key.startsWith("num-")) {
    const limits: Record<string, number> = { "num-1-10": 10, "num-1-20": 20, "num-1-50": 50, "num-1-100": 100, "num-sinhala": 20 };
    const limit = limits[key] ?? 20;
    const step = Math.ceil(limit / 10);
    for (let start = 1; start <= limit; start += step) {
      const sequence = Array.from({ length: Math.min(step, limit - start + 1) }, (_, index) => start + index);
      const shown = sequence.map(value => formatWorksheetNumber(value, key === "num-sinhala" ? "Sinhala" : "English"));
      if (key === "num-missing" || key === "num-before-after") {
        const centre = Math.min(start + 1, limit - 1);
        const promptEn = key === "num-missing" ? `${centre - 1}   _____   ${centre + 1}` : `Before ${centre}: _____     After ${centre}: _____`;
        const promptSi = key === "num-missing"
          ? `${formatWorksheetNumber(centre - 1, "Sinhala")}   _____   ${formatWorksheetNumber(centre + 1, "Sinhala")}`
          : `${formatWorksheetNumber(centre, "Sinhala")}ට පෙර: _____   පසු: _____`;
        const answer = key === "num-before-after" ? `${centre - 1} , ${centre + 1}` : String(centre);
        add(promptEn, promptSi, answer, `${formatWorksheetNumber(centre - 1, "Sinhala")} , ${formatWorksheetNumber(centre + 1, "Sinhala")}`);
      } else if (key === "num-count") {
        const amount = data.length + 1;
        add(`Count the objects and write the number.`, `වස්තු ගණන් කර අංකය ලියන්න.`, String(amount), formatWorksheetNumber(amount, "Sinhala"), { picture: `count-${amount}`, kind: "write" });
      } else if (key === "num-compare" || key === "num-test") {
        const first = start;
        const second = Math.min(limit, start + 2);
        if (key === "num-test") add(`Circle number ${first}:   ${Math.max(1, first - 1)}   ${first}   ${Math.min(limit, first + 1)}`, `අංක ${formatWorksheetNumber(first, "Sinhala")} වට කරන්න:   ${formatWorksheetNumber(Math.max(1, first - 1), "Sinhala")}   ${formatWorksheetNumber(first, "Sinhala")}   ${formatWorksheetNumber(Math.min(limit, first + 1), "Sinhala")}`, String(first), formatWorksheetNumber(first, "Sinhala"));
        else add(`${first}   _____   ${second}`, `${formatWorksheetNumber(first, "Sinhala")}   _____   ${formatWorksheetNumber(second, "Sinhala")} සසඳන්න`, first > second ? ">" : first < second ? "<" : "=", first > second ? ">" : first < second ? "<" : "=");
      } else if (key === "num-words") {
        const value = Math.min(data.length + 1, 10);
        const words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
        add(`${value}  →  ____________________`, `${formatWorksheetNumber(value, "Sinhala")}  →  ඉංග්‍රීසි අංක නාමය ලියන්න`, words[value - 1], sinhalaNumberWords[value]);
      } else {
        const sequenceText = shown.join("   ");
        const prompt = key === "num-sinhala"
          ? `${sequenceText}   (${sinhalaNumberWords[sequence.at(-1) ?? 0] ?? ""})`
          : key === "num-1-10" ? `${sequenceText}   ${sequenceText}`
            : `${sequenceText}   →   ${sequence.at(-1) ?? ""}`;
        add(prompt, `අංක කියවන්න සහ ලියන්න: ${sequenceText}`, sequence.at(-1)?.toString() ?? "", sequence.at(-1) ? formatWorksheetNumber(sequence.at(-1)!, "Sinhala") : "", { kind: key.includes("trace") || key.includes("sinhala") || key === "num-1-10" ? "trace" : "write" });
      }
    }
  } else if (key.startsWith("math-") || key.startsWith("grade") && key.endsWith("-math")) {
    if (key === "math-pattern") {
      for (let index = 0; index < 10; index++) {
        const start = index + 1;
        add(`${start}, ${start + 2}, ${start + 4}, _____`, `${formatWorksheetNumber(start, "Sinhala")}, ${formatWorksheetNumber(start + 2, "Sinhala")}, ${formatWorksheetNumber(start + 4, "Sinhala")}, _____`, String(start + 6), formatWorksheetNumber(start + 6, "Sinhala"));
      }
    } else if (key === "math-picture-count") {
      for (let index = 1; index <= 10; index++) add("Count the apples. How many?", "ඇපල් ගණන් කරමු. කීයක් තිබේද?", String(index), formatWorksheetNumber(index, "Sinhala"), { picture: `count-${index}`, kind: "write" });
    } else if (key === "math-word") {
      for (let index = 1; index <= 10; index++) add(`${index + 1} apples are on a plate. ${index} more are added. How many now?`, `තැටියේ ඇපල් ${formatWorksheetNumber(index + 1, "Sinhala")}ක් ඇත. තව ${formatWorksheetNumber(index, "Sinhala")}ක් දැමුවොත් දැන් කීයක්ද?`, String(index * 2 + 1), formatWorksheetNumber(index * 2 + 1, "Sinhala"), { picture: "apple", kind: "write" });
    } else if (key === "math-compare") {
      for (let index = 1; index <= 10; index++) add(`${index + 4}   _____   ${index + 2}`, `${formatWorksheetNumber(index + 4, "Sinhala")}   _____   ${formatWorksheetNumber(index + 2, "Sinhala")} සසඳන්න`, ">", ">");
    } else if (key === "math-equation") {
      for (let index = 1; index <= 10; index++) add(`${index + 2} + _____ = ${index + 8}`, `${formatWorksheetNumber(index + 2, "Sinhala")} + _____ = ${formatWorksheetNumber(index + 8, "Sinhala")}`, "6", "෬");
    } else if (key === "math-mental") {
      for (let index = 1; index <= 10; index++) add(`${index * 2} + ${index} = _____`, `${formatWorksheetNumber(index * 2, "Sinhala")} + ${formatWorksheetNumber(index, "Sinhala")} = _____`, String(index * 3), formatWorksheetNumber(index * 3, "Sinhala"));
    } else if (key === "math-measure") {
      shapeNames.forEach(shape => add(`Name this shape: ${shape.english}`, `මෙම හැඩයේ නම ලියන්න: ${shape.sinhala}`, shape.english, shape.sinhala, { picture: shape.picture, kind: "write" }));
    } else if (key === "grade1-math" || key === "grade2-math" || key === "grade3-math" || key === "grade45-math") {
      const grade = Number(key.replace("grade", "").replace("-math", "").replace("45", "4"));
      if (grade === 1) {
        for (let index = 1; index <= 10; index++) add(`${index} + 1 = _____`, `${formatWorksheetNumber(index, "Sinhala")} + 1 = _____`, String(index + 1), formatWorksheetNumber(index + 1, "Sinhala"));
      } else if (grade === 2) {
        for (let index = 1; index <= 10; index++) add(`${index + 5} − ${index} = _____`, `${formatWorksheetNumber(index + 5, "Sinhala")} − ${formatWorksheetNumber(index, "Sinhala")} = _____`, "5", "෫");
      } else if (grade === 3) {
        for (let index = 2; index <= 11; index++) add(`${index} × 3 = _____`, `${formatWorksheetNumber(index, "Sinhala")} × 3 = _____`, String(index * 3), formatWorksheetNumber(index * 3, "Sinhala"));
      } else {
        for (let index = 2; index <= 11; index++) add(`${index * 4} ÷ 4 = _____`, `${formatWorksheetNumber(index * 4, "Sinhala")} ÷ 4 = _____`, String(index), formatWorksheetNumber(index, "Sinhala"));
      }
    } else {
      mathProblems.forEach(problem => add(problem.en, problem.si, String(problem.answer), formatWorksheetNumber(problem.answer, "Sinhala")));
    }
  } else if (key.startsWith("color-")) {
    const pictureKey = key.replace("color-", "");
    const picture = pictureKey === "animals" ? "cat"
      : pictureKey === "vehicles" ? "car"
        : pictureKey === "birds" ? "bird"
          : pictureKey === "flowers" ? "flower"
            : pictureKey === "fruits" ? "fruit" : pictureKey;
    const label = pictureKey.replace(/-/g, " ");
    const sinhalaLabels: Record<string, string> = {
      animals: "සතුන්", cat: "බළලා", dog: "බල්ලා", elephant: "අලියා", lion: "සිංහයා", birds: "කුරුල්ලෝ",
      butterfly: "සමනලයා", flowers: "මල", fruits: "පලතුරු", apple: "ඇපල්", banana: "කෙසෙල්",
      car: "මෝටර් රථය", house: "නිවස", tree: "ගස", nature: "පරිසරය"
    };
    add(`Colour the ${label}. Add a name for your picture.`, `${sinhalaLabels[pictureKey] ?? "රූපය"} වර්ණ කර එයට නමක් දෙන්න.`, "", "", { picture: `color-${picture}`, kind: "color" });
  } else if (key.startsWith("shape-")) {
    const shapeList = key === "shape-circle-square" ? shapeNames.slice(0, 2)
      : key === "shape-triangle-rectangle" ? shapeNames.slice(2, 4)
        : shapeNames;
    if (key === "shape-color") shapeList.forEach(shape => add(`Colour the ${shape.english}.`, `${shape.sinhala} වර්ණ කරන්න.`, shape.english, shape.sinhala, { picture: shape.picture, kind: "color" }));
    else shapeList.forEach(shape => {
      const prompt = key === "shape-chart" ? `Read the shape name: ${shape.english}`
        : key === "shape-circle-square" ? `Circle the ${shape.english} among the pictures.`
          : key === "shape-triangle-rectangle" ? `Find the ${shape.english}.`
            : key === "shape-match" ? `Match this shape to its name: ${shape.english}`
              : key === "shape-identify" ? `Name this shape: ${shape.english}`
                : key === "shape-trace" ? `Trace the ${shape.english}.`
                  : key === "shape-around" ? `Find a ${shape.english} around you.`
                    : key === "shape-names" ? `Write the Sinhala name of ${shape.english}.`
                      : `Revision: draw or name the ${shape.english}.`;
      const promptSi = key === "shape-chart" ? `හැඩයේ නම කියවන්න: ${shape.sinhala}`
        : key === "shape-circle-square" ? `රූප අතරින් ${shape.sinhala} වට කරන්න.`
          : key === "shape-triangle-rectangle" ? `${shape.sinhala} සොයන්න.`
            : key === "shape-match" ? `මෙම හැඩය එහි නමට ගළපන්න: ${shape.sinhala}`
              : key === "shape-identify" ? `මෙම හැඩයේ නම ලියන්න: ${shape.sinhala}`
                : key === "shape-trace" ? `${shape.sinhala} අඳින්න.`
                  : key === "shape-around" ? `ඔබ වටා ඇති ${shape.sinhala} හැඩයේ දෙයක් සොයන්න.`
                    : key === "shape-names" ? `${shape.english} හැඩයේ සිංහල නම ලියන්න.`
                      : `පුනරීක්ෂණය: ${shape.sinhala} අඳින්න හෝ නම් කරන්න.`;
      pairExercise(prompt, promptSi, shape.english, shape.sinhala, shape.picture, shapeNames.map(item => item.english));
    });
  } else if (key.startsWith("write-")) {
    const wordSet = key.includes("si") ? siWords.map(item => ({ en: item.english, si: item.sinhala })) : [
      { en: "apple", si: "ඇපල්" }, { en: "book", si: "පොත" }, { en: "friend", si: "මිතුරා" }, { en: "school", si: "පාසල" },
      { en: "flower", si: "මල" }, { en: "sunshine", si: "හිරු එළිය" }, { en: "kindness", si: "කරුණාව" }, { en: "rainbow", si: "දේදුන්න" }
    ];
    if (key === "write-sentences") {
      [
        ["I read a good book.", "මම හොඳ පොතක් කියවමි."],
        ["The sun is bright.", "හිරු එළිය දීප්තිමත්ය."],
        ["I help my friends.", "මම මගේ මිතුරන්ට උදව් කරමි."],
        ["We care for nature.", "අපි පරිසරය රැක ගනිමු."]
      ].forEach(([en, si]) => add(`${en}   ____________________`, `${si}   ____________________`, en, si, { kind: "trace" }));
    } else if (key === "write-ruled") {
      ["My name is __________________.", "I like to learn.", "This is my favourite thing."].forEach((en, index) => {
        const si = ["මගේ නම __________________.", "මම ඉගෙනීමට කැමතියි.", "මෙය මා කැමතිම දෙයයි."][index];
        add(en, si, "", "", { kind: "write" });
      });
    } else if (key === "write-free") {
      for (let index = 0; index < 8; index++) add(`Write your own word or sentence ${index + 1}.`, `ඔබ කැමති වචනයක් හෝ වාක්‍යයක් ලියන්න ${index + 1}.`, "", "", { kind: "write" });
    } else wordSet.forEach(word => add(`${word.en}   ${word.en}   __________________`, `${word.si}   ${word.si}   __________________`, word.en, word.si, { kind: "trace" }));
  } else if (key.startsWith("match-")) {
    const sets: Record<string, Array<{ en: string; si: string; pic: string }>> = {
      "match-animals": [{ en: "Cat", si: "බළලා", pic: "cat" }, { en: "Dog", si: "බල්ලා", pic: "dog" }, { en: "Elephant", si: "අලියා", pic: "elephant" }, { en: "Lion", si: "සිංහයා", pic: "lion" }],
      "match-fruits": [{ en: "Apple", si: "ඇපල්", pic: "apple" }, { en: "Banana", si: "කෙසෙල්", pic: "banana" }, { en: "Mango", si: "අඹ", pic: "mango" }, { en: "Orange", si: "දොඩම්", pic: "orange" }],
      "match-letters": englishWords.slice(0, 8).map(item => ({ en: item.letter, si: item.letter, pic: item.picture })),
      "match-numbers": Array.from({ length: 8 }, (_, index) => ({ en: String(index + 1), si: formatWorksheetNumber(index + 1, "Sinhala"), pic: `count-${index + 1}` })),
      "match-shapes": shapeNames.map(item => ({ en: item.english, si: item.sinhala, pic: item.picture })),
      "match-colours": [{ en: "Red", si: "රතු", pic: "apple" }, { en: "Yellow", si: "කහ", pic: "banana" }, { en: "Green", si: "කොළ", pic: "leaf" }, { en: "Blue", si: "නිල්", pic: "bird" }],
      "match-opposites": [{ en: "Hot → ____", si: "උණුසුම් → ____", pic: "sun" }, { en: "Big → ____", si: "විශාල → ____", pic: "elephant" }, { en: "Day → ____", si: "දහවල → ____", pic: "sun" }, { en: "Up → ____", si: "ඉහළ → ____", pic: "kite" }],
      "match-si-words": siWords.map(item => ({ en: item.english, si: item.sinhala, pic: item.picture })),
      "match-en-words": siWords.map(item => ({ en: item.english, si: item.sinhala, pic: item.picture })),
      "match-revision": [...shapeNames.slice(0, 3).map(item => ({ en: item.english, si: item.sinhala, pic: item.picture })), ...siWords.slice(0, 4).map(item => ({ en: item.english, si: item.sinhala, pic: item.picture }))]
    };
    const pairs = sets[key] ?? matchPairs.map(item => ({ en: item.word, si: item.sinhala, pic: item.picture }));
    if (key === "match-opposites") {
      const opposites = [
        { en: "Hot → ____", si: "උණුසුම් → ____", answer: "Cold", answerSi: "සීතල", pic: "sun" },
        { en: "Big → ____", si: "විශාල → ____", answer: "Small", answerSi: "කුඩා", pic: "elephant" },
        { en: "Day → ____", si: "දහවල → ____", answer: "Night", answerSi: "රාත්‍රිය", pic: "sun" },
        { en: "Up → ____", si: "ඉහළ → ____", answer: "Down", answerSi: "පහළ", pic: "kite" }
      ];
      opposites.forEach(item => pairExercise(item.en, item.si, item.answer, item.answerSi, item.pic, opposites.map(pair => pair.answer)));
    } else pairs.forEach(item => pairExercise(`${item.en}  →  ______`, `${item.si}  →  ______`, item.en, item.si, item.pic, pairs.map(pair => pair.en)));
  } else if (key.startsWith("grade") && (key.endsWith("-si") || key.endsWith("-en") || key.endsWith("-env"))) {
    if (key.endsWith("-si")) {
      const activities: Record<number, Array<{ en: string; si: string; answer: string }>> = {
        1: [
          { en: "Copy the word: මල", si: "වචනය පිටපත් කරන්න: මල", answer: "මල" },
          { en: "Copy the word: ගස", si: "වචනය පිටපත් කරන්න: ගස", answer: "ගස" },
          { en: "Write the first letter of පොත.", si: "පොත යන වචනයේ මුල් අකුර ලියන්න.", answer: "ප" },
          { en: "Complete: අ, ආ, ___", si: "පුරවන්න: අ, ආ, ___", answer: "ඇ" },
          { en: "Copy the word: අම්මා", si: "වචනය පිටපත් කරන්න: අම්මා", answer: "අම්මා" },
          { en: "Write the first letter of හිරු.", si: "හිරු යන වචනයේ මුල් අකුර ලියන්න.", answer: "හ" },
          { en: "Copy the word: පාසල", si: "වචනය පිටපත් කරන්න: පාසල", answer: "පාසල" },
          { en: "Complete: ක, ___, ග", si: "පුරවන්න: ක, ___, ග", answer: "ඛ" }
        ],
        2: [
          { en: "Complete the word: පා_ල", si: "වචනය සම්පූර්ණ කරන්න: පා_ල", answer: "ස" },
          { en: "Complete the word: මිතු_ා", si: "වචනය සම්පූර්ණ කරන්න: මිතු_ා", answer: "ර" },
          { en: "Write the plural of ගස.", si: "ගස යන වචනයේ බහුවචනය ලියන්න.", answer: "ගස්" },
          { en: "Put in order: පොත, මල, ගස", si: "පොත, මල, ගස වචන අකාරාදී පිළිවෙළට ලියන්න.", answer: "ගස, පොත, මල" },
          { en: "Complete: මම පොතක් _____.", si: "පුරවන්න: මම පොතක් _____.", answer: "කියවමි" },
          { en: "Choose the action word: දුවයි / මල", si: "ක්‍රියා පදය තෝරන්න: දුවයි / මල", answer: "දුවයි" },
          { en: "Write a word that rhymes with මල.", si: "මල සමඟ ගැළපෙන තවත් වචනයක් ලියන්න.", answer: "කළ" },
          { en: "Complete: ඉ, ඊ, ___", si: "පුරවන්න: ඉ, ඊ, ___", answer: "උ" }
        ],
        3: [
          { en: "Find the naming word: The girl reads a book.", si: "නාම පදය සොයන්න: දැරිය පොතක් කියවයි.", answer: "දැරිය / පොත" },
          { en: "Find the action word: කුරුල්ලා පියාඹයි.", si: "ක්‍රියා පදය සොයන්න: කුරුල්ලා පියාඹයි.", answer: "පියාඹයි" },
          { en: "Make a sentence with පාසල.", si: "පාසල යන වචනයෙන් වාක්‍යයක් සාදන්න.", answer: "මම පාසලට යමි." },
          { en: "Write the opposite of රෑ.", si: "රෑ යන වචනයේ විරුද්ධ පදය ලියන්න.", answer: "දවල්" },
          { en: "Add the correct ending: ගස + වල = ____", si: "නිවැරදි අග කොටස එක් කරන්න: ගස + වල = ____", answer: "ගස්වල" },
          { en: "Write the plural of මල.", si: "මල යන වචනයේ බහුවචනය ලියන්න.", answer: "මල්" },
          { en: "Finish the sentence: අපි පරිසරය _____.", si: "වාක්‍යය සම්පූර්ණ කරන්න: අපි පරිසරය _____.", answer: "රකිමු" },
          { en: "Write a describing word for මල.", si: "මල විස්තර කරන පදයක් ලියන්න.", answer: "ලස්සන" }
        ],
        4: [
          { en: "Write a synonym for ලොකු.", si: "ලොකු යන වචනයට සමාන පදයක් ලියන්න.", answer: "විශාල" },
          { en: "Write the opposite of පිරිසිදු.", si: "පිරිසිදු යන වචනයේ විරුද්ධ පදය ලියන්න.", answer: "අපිරිසිදු" },
          { en: "Find the verb: ළමයි උයනේ සෙල්ලම් කරති.", si: "ක්‍රියා පදය සොයන්න: ළමයි උයනේ සෙල්ලම් කරති.", answer: "සෙල්ලම් කරති" },
          { en: "Rewrite as a question: ඔයා පොත කියවනවා.", si: "ප්‍රශ්නයක් ලෙස ලියන්න: ඔයා පොත කියවනවා.", answer: "ඔයා පොත කියවනවාද?" },
          { en: "Complete with a suitable adjective: _____ ගසක්", si: "ගැළපෙන විශේෂණ පදයක් යොදා පුරවන්න: _____ ගසක්", answer: "උස" },
          { en: "Join the ideas: වැස්ස වැටුණා. අපි ගෙදර සිටියා.", si: "වාක්‍ය දෙක සම්බන්ධ කරන්න: වැස්ස වැටුණා. අපි ගෙදර සිටියා.", answer: "වැස්ස වැටුණු නිසා අපි ගෙදර සිටියා." },
          { en: "Write the plural of පොත.", si: "පොත යන වචනයේ බහුවචනය ලියන්න.", answer: "පොත්" },
          { en: "Add the correct punctuation: ඔබ කොහේද යන්නේ", si: "සුදුසු විරාම ලකුණ යොදන්න: ඔබ කොහේද යන්නේ", answer: "ඔබ කොහේද යන්නේ?" }
        ],
        5: [
          { en: "Read: නදී ගසක් සිටුවා දිනපතා වතුර දැමුවා. ගස හොඳින් වැඩුණා. Why did the tree grow well?", si: "කියවන්න: නදී ගසක් සිටුවා දිනපතා වතුර දැමුවා. ගස හොඳින් වැඩුණා. ගස හොඳින් වැඩුණේ ඇයි?", answer: "It was watered every day." },
          { en: "From the passage, write one thing Nadi did.", si: "ඡේදය අනුව නදී කළ එක් දෙයක් ලියන්න.", answer: "She planted a tree / watered it." },
          { en: "Write a synonym for සතුට.", si: "සතුට යන වචනයට සමාන පදයක් ලියන්න.", answer: "ප්‍රීතිය" },
          { en: "Write the opposite of ආරම්භය.", si: "ආරම්භය යන වචනයේ විරුද්ධ පදය ලියන්න.", answer: "අවසානය" },
          { en: "Change to past tense: මම පොත කියවමි.", si: "අතීත කාලයට හරවන්න: මම පොත කියවමි.", answer: "මම පොත කියවූවෙමි." },
          { en: "Write a question about caring for trees.", si: "ගස් රැකීම ගැන ප්‍රශ්නයක් ලියන්න.", answer: "අපි ගස් රැකගන්නේ කෙසේද?" },
          { en: "Identify the subject: ගොවියා කුඹුරේ වැඩ කරයි.", si: "කර්තෘ පදය සොයන්න: ගොවියා කුඹුරේ වැඩ කරයි.", answer: "ගොවියා" },
          { en: "Rewrite with punctuation: අපි පරිසරය රැකගනිමු", si: "විරාම ලකුණු යොදා ලියන්න: අපි පරිසරය රැකගනිමු", answer: "අපි පරිසරය රැකගනිමු." }
        ]
      };
      activities[template.grade].forEach(item => add(item.en, item.si, item.answer, item.answer, { kind: "write" }));
    } else if (key.endsWith("-en")) {
      const lessons: Record<number, Array<[string, string, string]>> = {
        1: [["Copy the word: cat", "වචනය පිටපත් කරන්න: cat", "cat"], ["Write the first letter of sun.", "sun යන වචනයේ මුල් අකුර ලියන්න.", "s"], ["Complete: A, B, __", "පුරවන්න: A, B, __", "C"], ["Match: b _ _", "ගළපන්න: b _ _", "ball"], ["Copy the word: dog", "වචනය පිටපත් කරන්න: dog", "dog"], ["Circle the vowel in cat.", "cat වචනයේ ස්වර අකුර වට කරන්න.", "a"], ["Complete: c, __, e", "පුරවන්න: c, __, e", "d"], ["Write a word that starts with m.", "m අකුරෙන් ආරම්භ වන වචනයක් ලියන්න.", "moon"]],
        2: [["Add the missing letter: sch_ol", "නැති අකුර එක් කරන්න: sch_ol", "o"], ["Write the plural of book.", "book යන වචනයේ බහුවචනය ලියන්න.", "books"], ["Choose the action word: run / apple", "ක්‍රියා පදය තෝරන්න: run / apple", "run"], ["Complete: I ___ a book.", "පුරවන්න: I ___ a book.", "read"], ["Put in alphabet order: dog, apple, cat", "අකාරාදී පිළිවෙළට සකසන්න: dog, apple, cat", "apple, cat, dog"], ["Write the opposite of hot.", "hot යන වචනයේ විරුද්ධ පදය ලියන්න.", "cold"], ["Add a describing word: a ___ flower", "විස්තර කරන පදයක් එක් කරන්න: a ___ flower", "pretty"], ["Complete: yesterday I ___ (play).", "පුරවන්න: yesterday I ___ (play).", "played"]],
        3: [["Write the past tense of walk.", "walk යන ක්‍රියා පදයේ අතීත කාලය ලියන්න.", "walked"], ["Make the plural of child.", "child යන වචනයේ බහුවචනය ලියන්න.", "children"], ["Find the adjective: The bright sun shines.", "විශේෂණ පදය සොයන්න: The bright sun shines.", "bright"], ["Complete: She ___ to school every day.", "පුරවන්න: She ___ to school every day.", "walks"], ["Join with and: I read. I write.", "and යොදා වාක්‍ය දෙක සම්බන්ධ කරන්න.", "I read and write."], ["Write a synonym for happy.", "happy යන වචනයට සමාන පදයක් ලියන්න.", "glad"], ["Put these words in order: plays / dog / the", "වචන අනුපිළිවෙළට සකසන්න: plays / dog / the", "The dog plays."], ["Add punctuation: where is my pencil", "විරාම ලකුණු යොදන්න: where is my pencil", "Where is my pencil?"]],
        4: [["Change to past tense: They visit the museum.", "අතීත කාලයට හරවන්න: They visit the museum.", "They visited the museum."], ["Write the opposite of careful.", "careful යන වචනයේ විරුද්ධ පදය ලියන්න.", "careless"], ["Choose the pronoun: Nimal and I / book", "සර්වනාමය තෝරන්න: Nimal and I / book", "I"], ["Complete: If it rains, we ___ indoors.", "පුරවන්න: If it rains, we ___ indoors.", "will stay"], ["Write a synonym for begin.", "begin යන වචනයට සමාන පදයක් ලියන්න.", "start"], ["Add a question mark: What time is it", "ප්‍රශ්නාර්ථ ලකුණ යොදන්න: What time is it", "What time is it?"], ["Make a sentence with because.", "because යොදා වාක්‍යයක් ලියන්න.", "I stayed inside because it rained."], ["Write the comparative of tall.", "tall යන වචනයේ comparative පදය ලියන්න.", "taller"]],
        5: [["Read: A seed needs soil, water and sunlight to grow. Name two things it needs.", "කියවන්න: A seed needs soil, water and sunlight to grow. අවශ්‍ය දේ දෙකක් ලියන්න.", "Water and sunlight"], ["From the passage, what needs these things?", "ඡේදය අනුව මේ දේවල් අවශ්‍ය වන්නේ කුමකටද?", "A seed"], ["Change to reported speech: She said, “I am ready.”", "වාර්තා කළ කථනයට හරවන්න: She said, “I am ready.”", "She said that she was ready."], ["Write the past tense of choose.", "choose යන වචනයේ අතීත කාලය ලියන්න.", "chose"], ["Write an antonym for ancient.", "ancient යන වචනයේ විරුද්ධ පදය ලියන්න.", "modern"], ["Correct the sentence: he dont like rain", "වාක්‍යය නිවැරදි කරන්න: he dont like rain", "He doesn't like rain."], ["Write a sentence using although.", "although යොදා වාක්‍යයක් ලියන්න.", "Although it rained, we played inside."], ["Write the plural of leaf.", "leaf යන වචනයේ බහුවචනය ලියන්න.", "leaves"]]
      };
      lessons[template.grade].forEach(([en, si, answer]) => add(en, si, answer, answer, { kind: "write" }));
    } else {
      const environmentByGrade: Record<number, Array<{ en: string; si: string; answer: string; answerSi: string; picture: string }>> = {
        1: [
          { en: "Name one part of a plant.", si: "ශාකයක කොටසක් නම් කරන්න.", answer: "Root / leaf", answerSi: "මුල / කොළ", picture: "plant" },
          { en: "Which animal gives us milk?", si: "අපට කිරි ලබාදෙන සතා කුමක්ද?", answer: "Cow", answerSi: "එළදෙන", picture: "cow" },
          { en: "What do plants need to grow?", si: "ශාක වර්ධනයට අවශ්‍ය දේ මොනවාද?", answer: "Water and sunlight", answerSi: "ජලය සහ හිරු එළිය", picture: "sun" },
          { en: "Name an animal that lives in a home.", si: "නිවසක ජීවත් වන සතෙකු නම් කරන්න.", answer: "Cat / dog", answerSi: "බළලා / බල්ලා", picture: "cat" },
          { en: "Which body part helps us see?", si: "අපට දැකීමට උපකාරී වන ශරීර අවයවය කුමක්ද?", answer: "Eyes", answerSi: "ඇස්", picture: "nature" },
          { en: "Name a source of light.", si: "ආලෝක ප්‍රභවයක් නම් කරන්න.", answer: "Sun / lamp", answerSi: "හිරු / පහන", picture: "sun" }
        ],
        2: [
          { en: "Which habitat is home to a fish?", si: "මාළුවෙකුගේ වාසස්ථානය කුමක්ද?", answer: "Water", answerSi: "ජලය", picture: "water" },
          { en: "What grows from a seed?", si: "බීජයකින් වර්ධනය වන්නේ කුමක්ද?", answer: "A plant", answerSi: "ශාකයක්", picture: "plant" },
          { en: "Name one way to keep the classroom clean.", si: "පන්ති කාමරය පිරිසිදුව තබන ක්‍රමයක් කියන්න.", answer: "Use a bin", answerSi: "කුණු බඳුන භාවිතා කරන්න", picture: "nature" },
          { en: "Which food group helps build strong bones?", si: "ශක්තිමත් අස්ථි සඳහා උපකාරී වන ආහාරයක් නම් කරන්න.", answer: "Milk / dairy", answerSi: "කිරි / කිරි ආහාර", picture: "cow" },
          { en: "Name one safe road-crossing rule.", si: "පාර මාරුවීමේ ආරක්ෂිත නීතියක් කියන්න.", answer: "Use a crossing", answerSi: "මාරුවන ස්ථානයක් භාවිතා කරන්න", picture: "road" },
          { en: "What can we do with paper to reduce waste?", si: "කඩදාසි අපද්‍රව්‍ය අඩු කිරීමට කළ හැක්කේ කුමක්ද?", answer: "Reuse or recycle it", answerSi: "නැවත භාවිතා කිරීම හෝ ප්‍රතිචක්‍රීකරණය", picture: "nature" }
        ],
        3: [
          { en: "Name the process by which water vapour cools into drops.", si: "ජල වාෂ්ප සිසිල් වී බිංදු බවට පත්වන ක්‍රියාවලිය නම් කරන්න.", answer: "Condensation", answerSi: "ඝනීභවනය", picture: "water" },
          { en: "Name one animal that eats only plants.", si: "ශාක පමණක් ආහාරයට ගන්නා සතෙකු නම් කරන්න.", answer: "Cow / elephant", answerSi: "එළදෙන / අලියා", picture: "elephant" },
          { en: "What is the main source of energy for Earth?", si: "පෘථිවියේ ප්‍රධාන ශක්ති ප්‍රභවය කුමක්ද?", answer: "The Sun", answerSi: "හිරු", picture: "sun" },
          { en: "Name one way seeds can travel.", si: "බීජ පැතිරෙන එක් ක්‍රමයක් කියන්න.", answer: "Wind / water / animals", answerSi: "සුළඟ / ජලය / සතුන්", picture: "tree" },
          { en: "Which material can be attracted by a magnet: iron or paper?", si: "චුම්බකයකට ආකර්ෂණය වන්නේ යකඩද කඩදාසිද?", answer: "Iron", answerSi: "යකඩ", picture: "nature" },
          { en: "Give one example of a natural resource.", si: "ස්වාභාවික සම්පතකට උදාහරණයක් දෙන්න.", answer: "Water / soil / trees", answerSi: "ජලය / පස / ගස්", picture: "tree" }
        ],
        4: [
          { en: "Name one effect of air pollution.", si: "වායු දූෂණයේ එක් බලපෑමක් නම් කරන්න.", answer: "Breathing problems", answerSi: "ශ්වසන ගැටලු", picture: "nature" },
          { en: "Which energy source is renewable: sunlight or coal?", si: "නැවත ලබාගත හැකි ශක්ති ප්‍රභවය කුමක්ද: හිරු එළියද ගල් අඟුරුද?", answer: "Sunlight", answerSi: "හිරු එළිය", picture: "sun" },
          { en: "How can a household save water?", si: "නිවසක ජලය ඉතිරි කළ හැක්කේ කෙසේද?", answer: "Close taps / repair leaks", answerSi: "කරාම වසන්න / කාන්දුවීම් පිළිසකර කරන්න", picture: "water" },
          { en: "Name one cause of soil erosion.", si: "පස සෝදා යාමට එක් හේතුවක් නම් කරන්න.", answer: "Removing trees", answerSi: "ගස් ඉවත් කිරීම", picture: "tree" },
          { en: "What should we do with separated recyclable waste?", si: "වෙන් කළ හැකි ප්‍රතිචක්‍රීකරණ අපද්‍රව්‍යවලට කළ යුත්තේ කුමක්ද?", answer: "Recycle it", answerSi: "ප්‍රතිචක්‍රීකරණය කරන්න", picture: "nature" },
          { en: "Name one living thing in a pond habitat.", si: "පොකුණක වාසස්ථානයේ ජීවියෙකු නම් කරන්න.", answer: "Fish / frog / plant", answerSi: "මාළුවා / ගෙම්බා / ශාකය", picture: "water" }
        ],
        5: [
          { en: "Why are forests important for biodiversity?", si: "ජෛව විවිධත්වයට වනාන්තර වැදගත් වන්නේ ඇයි?", answer: "They provide habitats for many species.", answerSi: "ඒවා බොහෝ ජීවීන්ට වාසස්ථාන සපයයි.", picture: "tree" },
          { en: "Name one action that helps protect local wildlife.", si: "දේශීය වන සතුන් ආරක්ෂා කිරීමට උපකාරී ක්‍රියාවක් කියන්න.", answer: "Protect habitats / avoid littering", answerSi: "වාසස්ථාන රකින්න / කසළ නොදමන්න", picture: "bird" },
          { en: "What is one difference between weather and climate?", si: "කාලගුණය සහ දේශගුණය අතර එක් වෙනසක් ලියන්න.", answer: "Weather is short-term; climate is long-term.", answerSi: "කාලගුණය කෙටි කාලීනයි; දේශගුණය දිගු කාලීනයි.", picture: "nature" },
          { en: "Give one example of a food chain.", si: "ආහාර දාමයකට එක් උදාහරණයක් දෙන්න.", answer: "Grass → grasshopper → bird", answerSi: "තණකොළ → පළඟැටියා → කුරුල්ලා", picture: "bird" },
          { en: "Explain one benefit of composting.", si: "කොම්පෝස්ට් සෑදීමේ එක් වාසියක් පැහැදිලි කරන්න.", answer: "It returns nutrients to soil.", answerSi: "එය පසට පෝෂක නැවත ලබා දෙයි.", picture: "plant" },
          { en: "Name one responsible way to use electricity.", si: "විදුලිය වගකීමෙන් භාවිතා කරන එක් ක්‍රමයක් කියන්න.", answer: "Switch off unused lights.", answerSi: "භාවිතා නොකරන විදුලි පහන් නිවන්න.", picture: "sun" }
        ]
      };
      environmentByGrade[template.grade].forEach(item => add(item.en, item.si, item.answer, item.answerSi, { picture: illustratedPictures.has(item.picture) ? `color-${item.picture}` : item.picture, kind: "write" }));
    }
  }

  if (!data.length) return generateWorksheetExercises({
    category: template.category, activity: template.activity, language: template.language, grade: template.grade,
    difficulty: template.difficulty, startNumber: 1, endNumber: 20, selectedLetters: "", shuffleMatches: false,
    letterCase: "uppercase", coloringCategory: "Animals"
  }, count);
  return Array.from({ length: count }, (_, index) => ({ ...data[index % data.length], id: `exercise-${index + 1}` }));
}

export function generateWorksheetExercises(
  draft: Pick<WorksheetDraft, "category" | "activity" | "language" | "grade" | "difficulty" | "startNumber" | "endNumber" | "selectedLetters" | "shuffleMatches" | "letterCase" | "coloringCategory"> & Partial<Pick<WorksheetDraft, "sourceTemplateId">>,
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
  const sourceTemplate = draft.sourceTemplateId ? getWorksheetTemplate(draft.sourceTemplateId) : undefined;
  if (sourceTemplate) return buildTemplateExercises(sourceTemplate, targetCount);

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
