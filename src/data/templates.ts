import type { AssetCategory, DesignImage, ImageAsset, StickerTemplate, TextElement } from "@/types";

const now = 0;

interface StarterArtwork {
  id: string;
  name: string;
  file: string;
  category: AssetCategory;
  templateId: string;
  templateName: string;
  background: string;
  border: string;
  accent: string;
  radius: number;
  borderStyle: StickerTemplate["borderStyle"];
  imageWidth: number;
  imageX: number;
}

export const starterArtwork: StarterArtwork[] = [
  { id: "starter-tiger", name: "Tiger illustration", file: "tiger.png", category: "Animals", templateId: "art-tiger", templateName: "Tiger Trail", background: "#fff7e8", border: "#d98216", accent: "#874d0b", radius: 6, borderStyle: "solid", imageWidth: 31, imageX: 16 },
  { id: "starter-rose", name: "Rose illustration", file: "rose.png", category: "Flowers", templateId: "art-rose", templateName: "Rose Garden", background: "#fff0f6", border: "#e84d91", accent: "#a52861", radius: 13, borderStyle: "solid", imageWidth: 29, imageX: 16 },
  { id: "starter-santa", name: "Santa illustration", file: "santa.png", category: "Cartoon", templateId: "art-santa", templateName: "Jolly Santa", background: "#fff3ed", border: "#d34b3e", accent: "#9b302b", radius: 9, borderStyle: "dashed", imageWidth: 29, imageX: 16 },
  { id: "starter-bunny", name: "Bunny illustration", file: "bunny.png", category: "Animals", templateId: "art-bunny", templateName: "Bunny Meadow", background: "#f5f2ff", border: "#9b82c5", accent: "#514879", radius: 14, borderStyle: "solid", imageWidth: 28, imageX: 16 },
  { id: "starter-penguin", name: "Penguin illustration", file: "penguin.png", category: "Animals", templateId: "art-penguin", templateName: "Penguin Pals", background: "#eef8ff", border: "#4d8eaf", accent: "#345b73", radius: 10, borderStyle: "solid", imageWidth: 30, imageX: 16 },
  { id: "starter-fairy", name: "Fairy illustration", file: "fairy.png", category: "Cartoon", templateId: "art-fairy", templateName: "Fairy Wishes", background: "#fff2f8", border: "#d879a9", accent: "#873e70", radius: 15, borderStyle: "dotted", imageWidth: 29, imageX: 16 },
  { id: "starter-mermaid", name: "Mermaid illustration", file: "mermaid.png", category: "Cartoon", templateId: "art-mermaid", templateName: "Ocean Dream", background: "#eef9f8", border: "#42a9a1", accent: "#216e72", radius: 12, borderStyle: "solid", imageWidth: 27, imageX: 16 },
  { id: "starter-princess-pig", name: "Princess pig illustration", file: "princess-pig.png", category: "Cartoon", templateId: "art-princess-pig", templateName: "Princess Pink", background: "#fff2f0", border: "#e87583", accent: "#a43c55", radius: 15, borderStyle: "solid", imageWidth: 29, imageX: 16 },
  { id: "starter-elf", name: "Elf illustration", file: "elf.png", category: "Cartoon", templateId: "art-elf", templateName: "Little Woodland Elf", background: "#f1f7ee", border: "#71935d", accent: "#405e3d", radius: 8, borderStyle: "dashed", imageWidth: 28, imageX: 16 }
];

function artworkTemplate(art: StarterArtwork): StickerTemplate {
  const textLayouts: Record<string, { x: number; width: number; name: number; school: number; grade: number; subject: number }> = {
    "art-tiger": { x: 67, width: 60, name: 23, school: 44, grade: 63, subject: 81 },
    "art-rose": { x: 67, width: 61, name: 25, school: 46, grade: 65, subject: 83 },
    "art-santa": { x: 68, width: 60, name: 22, school: 43, grade: 62, subject: 81 },
    "art-bunny": { x: 67, width: 61, name: 24, school: 45, grade: 64, subject: 82 },
    "art-penguin": { x: 67, width: 60, name: 23, school: 44, grade: 63, subject: 81 },
    "art-fairy": { x: 68, width: 60, name: 25, school: 46, grade: 65, subject: 83 },
    "art-mermaid": { x: 68, width: 61, name: 24, school: 45, grade: 64, subject: 82 },
    "art-princess-pig": { x: 68, width: 60, name: 25, school: 46, grade: 65, subject: 83 },
    "art-elf": { x: 67, width: 60, name: 22, school: 43, grade: 62, subject: 81 }
  };
  const textLayout = textLayouts[art.templateId];
  const textSpecs: Array<{
    field: TextElement["field"];
    y: number;
    fontSize: number;
    height: number;
    bold: boolean;
  }> = [
    { field: "name", y: textLayout.name, fontSize: 25, height: 22, bold: true },
    { field: "school", y: textLayout.school, fontSize: 12, height: 17, bold: false },
    { field: "grade", y: textLayout.grade, fontSize: 11, height: 14, bold: true },
    { field: "subject", y: textLayout.subject, fontSize: 12, height: 17, bold: true }
  ];
  const texts: TextElement[] = textSpecs.map(({ field, y, fontSize, height, bold }) => ({
    id: `${art.templateId}-${field}`,
    field,
    text: "",
    visible: true,
    fontFamily: "Inter",
    fontSize,
    height,
    wrap: true,
    color: art.accent,
    bold,
    align: "center",
    x: textLayout.x,
    y,
    width: textLayout.width,
    rotation: 0,
    lineHeight: 1.12,
    letterSpacing: 0
  }));
  const images: DesignImage[] = [{
    id: `${art.templateId}-artwork`,
    assetId: art.id,
    x: art.imageX,
    y: 52,
    width: art.imageWidth,
    rotation: 0
  }];

  return {
    id: art.templateId,
    name: art.templateName,
    kind: "sticker",
    widthMm: 90,
    heightMm: 45,
    background: art.background,
    borderColor: art.border,
    accent: art.accent,
    borderStyle: art.borderStyle,
    radius: art.radius,
    borderWidth: 1.35,
    innerBorder: true,
    showCutline: false,
    layout: "split",
    decoration: "",
    images,
    texts,
    favourite: ["art-tiger", "art-rose", "art-penguin"].includes(art.templateId),
    createdAt: now,
    updatedAt: now
  };
}

function notebookCoverTemplate(
  art: StarterArtwork,
  options: { id: string; name: string; background: string; border: string; accent: string; decoration: string }
): StickerTemplate {
  const template = artworkTemplate(art);
  template.id = options.id;
  template.name = options.name;
  template.kind = "cover";
  template.widthMm = 202;
  template.heightMm = 289;
  template.background = options.background;
  template.borderColor = options.border;
  template.accent = options.accent;
  template.borderWidth = 1.2;
  template.radius = 1;
  template.innerBorder = true;
  template.decoration = options.decoration;
  template.images = (template.images ?? []).map(image => ({ ...image, x: 50, y: 29, width: 28 }));
  template.texts = (template.texts ?? []).map(text => ({
    ...text,
    x: 50,
    width: 84,
    y: text.field === "name" ? 51 : text.field === "school" ? 62 : text.field === "grade" ? 72 : text.field === "subject" ? 83 : text.y,
    fontSize: text.field === "name" ? 30 : text.field === "subject" ? 22 : 15,
    height: text.field === "name" ? 28 : 20,
    color: options.accent
  }));
  template.texts.push(...([
    { customLabel: "Book title", y: 13, fontSize: 17 },
    { customLabel: "Teacher", y: 90, fontSize: 12 },
    { customLabel: "Year", y: 95, fontSize: 12 },
    { customLabel: "Index number", y: 99, fontSize: 12 }
  ] as const).map(({ customLabel, y, fontSize }) => ({
    id: `${options.id}-${customLabel.toLowerCase().replaceAll(" ", "-")}`,
    field: "custom" as const,
    customLabel,
    text: "",
    visible: false,
    fontFamily: "Inter" as const,
    fontSize,
    height: 6,
    wrap: true,
    color: options.accent,
    bold: customLabel === "Book title",
    align: "center" as const,
    x: 50,
    y,
    width: 84,
    rotation: 0,
    lineHeight: 1.12,
    letterSpacing: 0
  })));
  return template;
}

const notebookCoverTemplates: StickerTemplate[] = [
  notebookCoverTemplate(starterArtwork[1], { id: "cover-rose-garden", name: "Floral Study Garden", background: "#fff8fb", border: "#e84d91", accent: "#8f315f", decoration: "collection-floral" }),
  notebookCoverTemplate(starterArtwork[0], { id: "cover-forest-science", name: "Forest Explorer", background: "#f5f8ee", border: "#66844a", accent: "#405d38", decoration: "collection-nature" }),
  notebookCoverTemplate(starterArtwork[4], { id: "cover-ocean-learning", name: "Ocean Learning", background: "#eff9fb", border: "#418fa8", accent: "#276479", decoration: "collection-ocean" }),
  notebookCoverTemplate(starterArtwork[8], { id: "cover-woodland-reader", name: "Woodland Reader", background: "#f3f6ed", border: "#76935e", accent: "#425d3c", decoration: "collection-storybook" }),
  notebookCoverTemplate(starterArtwork[3], { id: "cover-pastel-dreams", name: "Pastel Imagination", background: "#f8f5ff", border: "#9b82c5", accent: "#514879", decoration: "collection-premium-pastel" }),
  notebookCoverTemplate(starterArtwork[6], { id: "cover-starry-knowledge", name: "Starry Knowledge", background: "#eff5fc", border: "#5c79a5", accent: "#344c75", decoration: "collection-galaxy" })
];

export const starterTemplates: StickerTemplate[] = [
  ...starterArtwork.map(artworkTemplate),
  ...notebookCoverTemplates
];

export function createStarterAsset(artwork: StarterArtwork, blob: Blob): ImageAsset {
  return {
    id: artwork.id,
    name: artwork.name,
    category: artwork.category,
    type: "image/png",
    bundled: true,
    blob,
    createdAt: now
  };
}

export const subjectPresets: Record<string, Array<{ en: string; si: string }>> = {
  "1-5": [
    { en: "Mathematics", si: "ගණිතය" }, { en: "English", si: "ඉංග්‍රීසි" }, { en: "Sinhala", si: "සිංහල" },
    { en: "Tamil", si: "දෙමළ" }, { en: "Environmental Studies", si: "පරිසරය" }, { en: "Religion", si: "ආගම" },
    { en: "Art", si: "චිත්‍ර" }, { en: "Health & Physical Education", si: "සෞඛ්‍ය හා ශාරීරික අධ්‍යාපනය" },
    { en: "Dictation", si: "අසා ලිවීම" }, { en: "Essay Writing", si: "රචනා" },
    { en: "Creative Sentence Writing", si: "නිර්මාණාත්මක වැකි ලිවීම" },
    { en: "Five-Ruled Book", si: "පස් රූල් පොත" },
    { en: "English Workbook", si: "English Workbook" },
    { en: "English Pupil Book 1-5", si: "English Pupil Book 1-5" }
  ],
  "6-11": [
    { en: "Mathematics", si: "ගණිතය" }, { en: "English", si: "ඉංග්‍රීසි" }, { en: "Sinhala", si: "සිංහල" },
    { en: "Tamil", si: "දෙමළ" }, { en: "Science", si: "විද්‍යාව" }, { en: "History", si: "ඉතිහාසය" },
    { en: "Geography", si: "භූගෝල විද්‍යාව" }, { en: "ICT", si: "තොරතුරු හා සන්නිවේදන තාක්ෂණය" },
    { en: "Commerce", si: "වාණිජ්‍යය" }, { en: "Art", si: "චිත්‍ර" }, { en: "Religion", si: "ආගම" }
  ],
  "12-13": [
    { en: "Biology", si: "ජීව විද්‍යාව" }, { en: "Physics", si: "භෞතික විද්‍යාව" }, { en: "Chemistry", si: "රසායන විද්‍යාව" },
    { en: "Combined Mathematics", si: "සංයුක්ත ගණිතය" }, { en: "Economics", si: "ආර්ථික විද්‍යාව" },
    { en: "Accounting", si: "ගිණුම්කරණය" }, { en: "Business Studies", si: "ව්‍යාපාර අධ්‍යයනය" },
    { en: "Information & Communication Technology", si: "තොරතුරු හා සන්නිවේදන තාක්ෂණය" },
    { en: "Engineering Technology", si: "ඉංජිනේරු තාක්ෂණවේදය" }
  ]
};

export const englishBookSubjectOptions = [
  { en: "English Workbook", si: "English Workbook" },
  { en: "English Book", si: "English Book" },
  { en: "English Textbook", si: "English Textbook" }
];
