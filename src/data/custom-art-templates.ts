import type { AssetCategory, DesignImage, EnglishFontFamily, SinhalaFontFamily, StickerTemplate, TextElement } from "@/types";
import { CUSTOM_SIZE_ARTWORK_ID } from "./custom-size-template";

export interface CustomArtworkAsset {
  id: string;
  name: string;
  file: string;
  category: AssetCategory;
  folder?: "custom-art" | "starter-art";
}

interface CustomArtworkDesign extends CustomArtworkAsset {
  templateId: string;
  templateName: string;
  background: string;
  border: string;
  accent: string;
  secondary: string;
  decoration: string;
  fontFamily?: EnglishFontFamily;
  layout: StickerTemplate["layout"];
  radius: number;
  widthMm?: number;
  heightMm?: number;
  borderStyle: StickerTemplate["borderStyle"];
  image: { x: number; y: number; width: number };
  text: {
    x: number;
    width: number;
    align: TextElement["align"];
    nameY: number;
    schoolY: number;
    gradeY: number;
    subjectY: number;
    nameSize: number;
    schoolSize: number;
    gradeSize: number;
    subjectSize: number;
  };
}

export const customArtworkAssets: CustomArtworkAsset[] = [
  { id: "custom-art-creative-circle-boy", name: "Creative Circle Boy", file: "creative-circle-boy.png", category: "Cartoon" },
  { id: "custom-art-school-walk-buddies", name: "School Walk Buddies", file: "school-walk-buddies.png", category: "School" },
  { id: "custom-art-dolphin-study-buddy", name: "Dolphin Study Buddy", file: "dolphin-study-buddy.png", category: "Animals" },
  { id: "custom-art-sunshine-student", name: "Sunshine Student", file: "sunshine-student.png", category: "Cartoon" },
  { id: "custom-art-bookish-student", name: "Bookish Student", file: "bookish-student.png", category: "School" },
  { id: "custom-art-turtle-study-buddy", name: "Turtle Study Buddy", file: "turtle-study-buddy.png", category: "Animals" },
  { id: "custom-art-panda-study-buddy", name: "Panda Study Buddy", file: "panda-study-buddy.png", category: "Animals" },
  { id: "custom-art-kindness-angel", name: "Kindness Angel", file: "kindness-angel.png", category: "Cartoon" },
  { id: "custom-art-teddy-friend", name: "Teddy Friend", file: "teddy-friend.png", category: "Cartoon" },
  { id: "custom-art-school-friends-trio", name: "School Friends Trio", file: "school-friends-trio.png", category: "School" },
  { id: "custom-art-young-scholar", name: "Young Scholar", file: "young-scholar.png", category: "School" },
  { id: "custom-art-midnight-cat", name: "Midnight Cat", file: "midnight-cat.png", category: "Animals" },
  { id: "custom-art-storybook-girl", name: "Storybook Girl", file: "storybook-girl.png", category: "Cartoon" },
  { id: "custom-art-winter-snowpal", name: "Winter Snowpal", file: "winter-snowpal.png", category: "Cartoon" },
  { id: "custom-art-lion", name: "Little Lion", file: "lion.png", category: "Animals" },
  { id: "custom-art-honey-bee", name: "Honey Bee", file: "honey-bee.png", category: "Nature" },
  { id: "custom-art-penguin", name: "Penguin", file: "penguin.png", category: "Animals" },
  { id: "custom-art-blue-bee", name: "Blue Bee", file: "blue-bee.png", category: "Nature" },
  { id: "custom-art-unicorn", name: "Unicorn", file: "unicorn.png", category: "Cartoon" },
  { id: "custom-art-bunny", name: "Storybook Bunny", file: "storybook-bunny.png", category: "Animals" },
  { id: "custom-art-monster", name: "Turquoise Monster", file: "turquoise-monster.png", category: "Cartoon" },
  { id: "custom-art-lamb", name: "Little Lamb", file: "little-lamb.png", category: "Animals" },
  { id: "custom-art-schoolgirl", name: "Schoolgirl", file: "schoolgirl.png", category: "Cartoon" },
  { id: "custom-art-birds", name: "Garden Birds", file: "garden-birds.png", category: "Nature" },
  { id: "custom-art-reading-student", name: "Reading Student", file: "reading-student.png", category: "School" },
  { id: "custom-art-duck", name: "Sailor Duck", file: "sailor-duck.png", category: "Animals" },
  { id: "custom-art-fairy-vibrant-wings", name: "Fairy Sparkle Garden", file: "fairy-vibrant-wings.png", category: "Cartoon" },
  { id: "custom-art-fairy-crown-wings", name: "Crown Wing Fairy", file: "fairy-crown-wings.png", category: "Cartoon" },
  { id: "custom-art-unicorn-rainbow-mane", name: "Rainbow Mane Unicorn", file: "unicorn-rainbow-mane.png", category: "Cartoon" },
  { id: "custom-art-unicorn-kawaii", name: "Sweetheart Unicorn", file: "unicorn-kawaii.png", category: "Cartoon" },
  { id: "custom-art-tiger-skateboard", name: "Skater Tiger", file: "tiger-skateboard.png", category: "Animals" },
  { id: "custom-art-bear-besties", name: "Bestie Bear Hugs", file: "bear-besties.png", category: "Animals" },
  { id: "custom-art-parrot-rainbow", name: "Rainbow Parrot Pal", file: "parrot-rainbow.png", category: "Nature" },
  { id: "custom-art-chick-sunshine", name: "Sunny Chick Buddy", file: "chick-sunshine.png", category: "Animals" },
  { id: "custom-art-bluebird-buddy", name: "Bluebird Giggles", file: "bluebird-buddy.png", category: "Animals" },
  { id: "custom-art-fairy-star-wand", name: "Star Wand Fairy", file: "fairy-star-wand.png", category: "Cartoon" },
  { id: CUSTOM_SIZE_ARTWORK_ID, name: "Apple & pencil", file: "custom-size-apple-pencil.png", category: "School", folder: "starter-art" }
];

const designs: CustomArtworkDesign[] = [
  {
    id: "custom-art-creative-circle-boy", name: "Creative Circle Boy", file: "creative-circle-boy.png", category: "Cartoon",
    templateId: "new-art-creative-circle-boy", templateName: "Creative Circle Buddy",
    background: "#fff8ee", border: "#ed9a3d", accent: "#8c461f", secondary: "#f2b84b",
    decoration: "collection-art-creative-circle", layout: "centered", radius: 136, widthMm: 72, heightMm: 72,
    borderStyle: "solid",
    image: { x: 50, y: 54, width: 44 },
    text: { x: 50, width: 72, align: "center", nameY: 14, schoolY: 28, gradeY: 78, subjectY: 88, nameSize: 21, schoolSize: 11.5, gradeSize: 10, subjectSize: 11 }
  },
  {
    id: "custom-art-lion", name: "Little Lion", file: "lion.png", category: "Animals",
    templateId: "new-art-lion-sunshine", templateName: "Lion’s Sunshine Club",
    background: "#fff5dc", border: "#dca94d", accent: "#593d2c", secondary: "#e6ad4e",
    decoration: "collection-art-lion", layout: "badge", radius: 12, borderStyle: "solid",
    image: { x: 16, y: 50, width: 22 },
    text: { x: 66, width: 62, align: "center", nameY: 22, schoolY: 43, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11.5, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-honey-bee", name: "Honey Bee", file: "honey-bee.png", category: "Nature",
    templateId: "new-art-honey-bee", templateName: "Golden Hive",
    background: "#fff8e7", border: "#d99d32", accent: "#513e23", secondary: "#e8b943",
    decoration: "collection-art-honey", layout: "banner", radius: 8, borderStyle: "dashed",
    image: { x: 86, y: 50, width: 18 },
    text: { x: 45, width: 66, align: "left", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-penguin", name: "Penguin", file: "penguin.png", category: "Animals",
    templateId: "new-art-penguin", templateName: "Arctic Study Buddy",
    background: "#eff8fc", border: "#6da8bd", accent: "#244d64", secondary: "#69b9c8",
    decoration: "collection-art-penguin", layout: "split", radius: 15, borderStyle: "solid",
    image: { x: 16, y: 50, width: 21 },
    text: { x: 66, width: 62, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 23, schoolSize: 11.5, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-blue-bee", name: "Blue Bee", file: "blue-bee.png", category: "Nature",
    templateId: "new-art-blue-bee", templateName: "Bluebell Bee Garden",
    background: "#eff9f5", border: "#70aa93", accent: "#285847", secondary: "#e1a64d",
    decoration: "collection-art-blue-bee", layout: "playful", radius: 17, borderStyle: "solid",
    image: { x: 84, y: 51, width: 21 },
    text: { x: 43, width: 66, align: "left", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11.5, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-unicorn", name: "Unicorn", file: "unicorn.png", category: "Cartoon",
    templateId: "new-art-unicorn", templateName: "Moonbeam Unicorn",
    background: "#f8f1ff", border: "#b495d2", accent: "#583f75", secondary: "#d493ba",
    decoration: "collection-art-unicorn", layout: "split", radius: 16, borderStyle: "solid",
    image: { x: 16, y: 50, width: 22 },
    text: { x: 66, width: 62, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 23, schoolSize: 11.5, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-bunny", name: "Storybook Bunny", file: "storybook-bunny.png", category: "Animals",
    templateId: "new-art-bunny", templateName: "Clover Patch Bunny",
    background: "#fff6f1", border: "#d5979a", accent: "#69464b", secondary: "#89a878",
    decoration: "collection-art-bunny", layout: "centered", radius: 14, borderStyle: "solid",
    image: { x: 16, y: 50, width: 19 },
    text: { x: 67, width: 61, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-monster", name: "Turquoise Monster", file: "turquoise-monster.png", category: "Cartoon",
    templateId: "new-art-turquoise-monster", templateName: "Happy Little Monster",
    background: "#eaf9f5", border: "#58a99c", accent: "#245a53", secondary: "#ee8c75",
    decoration: "collection-art-monster", layout: "playful", radius: 13, borderStyle: "dotted",
    image: { x: 16, y: 50, width: 22 },
    text: { x: 67, width: 61, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11.5, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-lamb", name: "Little Lamb", file: "little-lamb.png", category: "Animals",
    templateId: "new-art-little-lamb", templateName: "Meadow Morning",
    background: "#fff9ec", border: "#a5ac75", accent: "#4b6144", secondary: "#d8a45e",
    decoration: "collection-art-lamb", layout: "stack", radius: 11, borderStyle: "solid",
    image: { x: 84, y: 50, width: 20 },
    text: { x: 43, width: 66, align: "left", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-schoolgirl", name: "Schoolgirl", file: "schoolgirl.png", category: "Cartoon",
    templateId: "new-art-schoolgirl", templateName: "Rosy Daydream",
    background: "#fff1f5", border: "#d985a0", accent: "#663f57", secondary: "#d98ca6",
    decoration: "collection-art-schoolgirl", layout: "split", radius: 15, borderStyle: "solid",
    image: { x: 16, y: 50, width: 19 },
    text: { x: 67, width: 61, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11.5, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-birds", name: "Garden Birds", file: "garden-birds.png", category: "Nature",
    templateId: "new-art-garden-birds", templateName: "Birdsong Garden",
    background: "#f3f7e9", border: "#879c67", accent: "#405841", secondary: "#b67c69",
    decoration: "collection-art-birds", layout: "centered", radius: 5, borderStyle: "solid",
    image: { x: 16, y: 50, width: 21 },
    text: { x: 67, width: 61, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-reading-student", name: "Reading Student", file: "reading-student.png", category: "School",
    templateId: "new-art-reading-student", templateName: "Little Bookworm",
    background: "#f8f4ea", border: "#a47b54", accent: "#4c4034", secondary: "#668b83",
    decoration: "collection-art-reading", layout: "banner", radius: 7, borderStyle: "solid",
    image: { x: 84, y: 51, width: 18 },
    text: { x: 43, width: 66, align: "left", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-duck", name: "Sailor Duck", file: "sailor-duck.png", category: "Animals",
    templateId: "new-art-sailor-duck", templateName: "Sailor Duck’s Study",
    background: "#edf8ff", border: "#619bb8", accent: "#284e69", secondary: "#e39c54",
    decoration: "collection-art-duck", layout: "playful", radius: 15, borderStyle: "solid",
    image: { x: 16, y: 50, width: 19 },
    text: { x: 67, width: 61, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11.5, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-size-apple-pencil", name: "Apple & pencil", file: "custom-size-apple-pencil.png", category: "School",
    templateId: "new-art-apple-pencil", templateName: "Scholar’s Apple",
    background: "#fff9ed", border: "#285342", accent: "#163b32", secondary: "#a9692d",
    decoration: "collection-art-apple", layout: "split", radius: 8, borderStyle: "solid",
    image: { x: 18, y: 52, width: 28 },
    text: { x: 68, width: 58, align: "center", nameY: 22, schoolY: 43, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11.5, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-school-walk-buddies", name: "School Walk Buddies", file: "school-walk-buddies.png", category: "School",
    templateId: "new-art-school-walk-buddies", templateName: "School Walk Buddies",
    background: "#fff8e8", border: "#e4a342", accent: "#55432a", secondary: "#73a9c5",
    decoration: "collection-art-school-walk", layout: "banner", radius: 8, borderStyle: "dashed",
    image: { x: 84, y: 51, width: 23 },
    text: { x: 43, width: 66, align: "left", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-dolphin-study-buddy", name: "Dolphin Study Buddy", file: "dolphin-study-buddy.png", category: "Animals",
    templateId: "new-art-dolphin-study-buddy", templateName: "Dolphin Study Splash",
    background: "#eaf7fc", border: "#5eabc1", accent: "#214d68", secondary: "#62b9cc",
    decoration: "collection-art-dolphin", layout: "split", radius: 16, borderStyle: "solid",
    image: { x: 16, y: 50, width: 22 },
    text: { x: 67, width: 61, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-sunshine-student", name: "Sunshine Student", file: "sunshine-student.png", category: "Cartoon",
    templateId: "new-art-sunshine-student", templateName: "Sunny Smiles",
    background: "#fff5df", border: "#e7a953", accent: "#67432c", secondary: "#e4bf56",
    decoration: "collection-art-sunshine-student", layout: "playful", radius: 18, borderStyle: "solid",
    image: { x: 84, y: 50, width: 18 },
    text: { x: 43, width: 66, align: "left", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-bookish-student", name: "Bookish Student", file: "bookish-student.png", category: "School",
    templateId: "new-art-bookish-student", templateName: "Little Scholar",
    background: "#f4f2e9", border: "#928364", accent: "#3f453d", secondary: "#b28758",
    decoration: "collection-art-bookish-student", layout: "badge", radius: 10, borderStyle: "solid",
    image: { x: 16, y: 50, width: 20 },
    text: { x: 67, width: 61, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-turtle-study-buddy", name: "Turtle Study Buddy", file: "turtle-study-buddy.png", category: "Animals",
    templateId: "new-art-turtle-study-buddy", templateName: "Turtle’s Study Garden",
    background: "#eef8e9", border: "#7ea477", accent: "#35553c", secondary: "#d2a453",
    decoration: "collection-art-turtle-study", layout: "stack", radius: 13, borderStyle: "solid",
    image: { x: 84, y: 50, width: 20 },
    text: { x: 43, width: 66, align: "left", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-panda-study-buddy", name: "Panda Study Buddy", file: "panda-study-buddy.png", category: "Animals",
    templateId: "new-art-panda-study-buddy", templateName: "Panda Pals",
    background: "#f4f6f3", border: "#7e9a8a", accent: "#35453e", secondary: "#79a778",
    decoration: "collection-art-panda-study", layout: "centered", radius: 15, borderStyle: "dotted",
    image: { x: 16, y: 50, width: 20 },
    text: { x: 67, width: 61, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-kindness-angel", name: "Kindness Angel", file: "kindness-angel.png", category: "Cartoon",
    templateId: "new-art-kindness-angel", templateName: "Kindness Angel",
    background: "#fbf1fa", border: "#c79bbd", accent: "#684c6a", secondary: "#e3b96d",
    decoration: "collection-art-kindness-angel", layout: "split", radius: 16, borderStyle: "solid",
    image: { x: 84, y: 50, width: 17 },
    text: { x: 43, width: 66, align: "left", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-teddy-friend", name: "Teddy Friend", file: "teddy-friend.png", category: "Cartoon",
    templateId: "new-art-teddy-friend", templateName: "Teddy’s Cozy Corner",
    background: "#fff2e9", border: "#d29875", accent: "#604331", secondary: "#bc7956",
    decoration: "collection-art-teddy-friend", layout: "badge", radius: 12, borderStyle: "solid",
    image: { x: 16, y: 50, width: 20 },
    text: { x: 67, width: 61, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-school-friends-trio", name: "School Friends Trio", file: "school-friends-trio.png", category: "School",
    templateId: "new-art-school-friends-trio", templateName: "School Friends Trio",
    background: "#eef5ff", border: "#829bc7", accent: "#38496b", secondary: "#e19c62",
    decoration: "collection-art-school-friends", layout: "banner", radius: 9, borderStyle: "solid",
    image: { x: 84, y: 50, width: 24 },
    text: { x: 43, width: 66, align: "left", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-young-scholar", name: "Young Scholar", file: "young-scholar.png", category: "School",
    templateId: "new-art-young-scholar", templateName: "Young Scholar",
    background: "#f0f7f4", border: "#77a99b", accent: "#315c52", secondary: "#d4a657",
    decoration: "collection-art-young-scholar", layout: "split", radius: 14, borderStyle: "solid",
    image: { x: 16, y: 50, width: 19 },
    text: { x: 67, width: 61, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-midnight-cat", name: "Midnight Cat", file: "midnight-cat.png", category: "Animals",
    templateId: "new-art-midnight-cat", templateName: "Midnight Cat",
    background: "#f2effb", border: "#9381b6", accent: "#493f62", secondary: "#d8b96f",
    decoration: "collection-art-midnight-cat", layout: "playful", radius: 16, borderStyle: "dotted",
    image: { x: 84, y: 50, width: 20 },
    text: { x: 43, width: 66, align: "left", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-storybook-girl", name: "Storybook Girl", file: "storybook-girl.png", category: "Cartoon",
    templateId: "new-art-storybook-girl", templateName: "Storybook Girl",
    background: "#fff0f3", border: "#d88da1", accent: "#674252", secondary: "#8fa77b",
    decoration: "collection-art-storybook-girl", layout: "centered", radius: 14, borderStyle: "solid",
    image: { x: 16, y: 50, width: 20 },
    text: { x: 67, width: 61, align: "center", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-winter-snowpal", name: "Winter Snowpal", file: "winter-snowpal.png", category: "Cartoon",
    templateId: "new-art-winter-snowpal", templateName: "Winter Snowpal",
    background: "#eff8ff", border: "#83b4d0", accent: "#35556d", secondary: "#78aeca",
    decoration: "collection-art-winter-snowpal", layout: "stack", radius: 15, borderStyle: "solid",
    image: { x: 84, y: 50, width: 19 },
    text: { x: 43, width: 66, align: "left", nameY: 21, schoolY: 42, gradeY: 63, subjectY: 82, nameSize: 22, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-storybook-girl", name: "Storybook Girl", file: "storybook-girl.png", category: "Cartoon",
    templateId: "new-art-enchanted-garden-frame", templateName: "Enchanted Garden Frame",
    background: "#fffaf0", border: "#d8769a", accent: "#603e50", secondary: "#75a66b",
    decoration: "collection-art-enchanted-frame", layout: "split", radius: 9, borderStyle: "solid",
    image: { x: 17, y: 51, width: 22 },
    text: { x: 68, width: 57, align: "center", nameY: 22, schoolY: 43, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-birds", name: "Garden Birds", file: "garden-birds.png", category: "Nature",
    templateId: "new-art-bright-bird-parade", templateName: "Bright Bird Parade",
    background: "#fff9e8", border: "#76a84f", accent: "#344d38", secondary: "#e2a33a",
    decoration: "collection-art-bright-birds", layout: "split", radius: 5, borderStyle: "solid",
    image: { x: 83, y: 51, width: 22 },
    text: { x: 42, width: 63, align: "left", nameY: 22, schoolY: 43, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-school-friends-trio", name: "School Friends Trio", file: "school-friends-trio.png", category: "School",
    templateId: "new-art-adventure-study-pals", templateName: "Adventure Study Pals",
    background: "#fff8e9", border: "#e0a52e", accent: "#30465f", secondary: "#e86d44",
    decoration: "collection-art-adventure-pals", layout: "playful", radius: 8, borderStyle: "solid",
    image: { x: 17, y: 51, width: 22 },
    text: { x: 68, width: 57, align: "center", nameY: 22, schoolY: 43, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "custom-art-fairy-vibrant-wings", name: "Fairy Sparkle Garden", file: "fairy-vibrant-wings.png", category: "Cartoon",
    templateId: "new-art-fairy-sparkle-garden", templateName: "Fairy Sparkle Garden",
    background: "#fff1fb", border: "#c052a2", accent: "#683568", secondary: "#f2a5d7",
    decoration: "collection-art-fairy-sparkle", fontFamily: "Fredoka", layout: "playful", radius: 17, borderStyle: "solid",
    image: { x: 83, y: 50, width: 28 },
    text: { x: 36, width: 60, align: "center", nameY: 20, schoolY: 41, gradeY: 62, subjectY: 81, nameSize: 24, schoolSize: 11.5, gradeSize: 10.5, subjectSize: 12 }
  },
  {
    id: "custom-art-fairy-crown-wings", name: "Crown Wing Fairy", file: "fairy-crown-wings.png", category: "Cartoon",
    templateId: "new-art-crown-wing-fairy", templateName: "Crown Wing Fairy",
    background: "#f0f8ff", border: "#79b8df", accent: "#365879", secondary: "#e7a7d3",
    decoration: "collection-art-fairy-crown", fontFamily: "Baloo 2", layout: "split", radius: 12, borderStyle: "solid",
    image: { x: 17, y: 50, width: 27 },
    text: { x: 64, width: 60, align: "center", nameY: 20, schoolY: 41, gradeY: 62, subjectY: 81, nameSize: 24, schoolSize: 11.5, gradeSize: 10.5, subjectSize: 12 }
  },
  {
    id: "custom-art-unicorn-rainbow-mane", name: "Rainbow Mane Unicorn", file: "unicorn-rainbow-mane.png", category: "Cartoon",
    templateId: "new-art-rainbow-mane-unicorn", templateName: "Rainbow Mane Unicorn",
    background: "#effcff", border: "#47b9c5", accent: "#286375", secondary: "#ef9db6",
    decoration: "collection-art-unicorn-rainbow", fontFamily: "Fredoka", layout: "split", radius: 20, borderStyle: "solid",
    image: { x: 83, y: 50, width: 28 },
    text: { x: 36, width: 60, align: "center", nameY: 20, schoolY: 41, gradeY: 62, subjectY: 81, nameSize: 24, schoolSize: 11.5, gradeSize: 10.5, subjectSize: 12 }
  },
  {
    id: "custom-art-unicorn-kawaii", name: "Sweetheart Unicorn", file: "unicorn-kawaii.png", category: "Cartoon",
    templateId: "new-art-sweetheart-unicorn", templateName: "Sweetheart Unicorn",
    background: "#fff2f5", border: "#e77aa4", accent: "#7b3c69", secondary: "#8ccfd2",
    decoration: "collection-art-unicorn-heart", fontFamily: "Baloo 2", layout: "playful", radius: 15, borderStyle: "dashed",
    image: { x: 17, y: 50, width: 27 },
    text: { x: 64, width: 60, align: "center", nameY: 20, schoolY: 41, gradeY: 62, subjectY: 81, nameSize: 24, schoolSize: 11.5, gradeSize: 10.5, subjectSize: 12 }
  },
  {
    id: "custom-art-tiger-skateboard", name: "Skater Tiger", file: "tiger-skateboard.png", category: "Animals",
    templateId: "new-art-skater-tiger", templateName: "Skater Tiger",
    background: "#f2fcf8", border: "#25a99b", accent: "#26486b", secondary: "#ff9b3e",
    decoration: "collection-art-skater-tiger", fontFamily: "Fredoka", layout: "banner", radius: 9, borderStyle: "solid",
    image: { x: 83, y: 50, width: 29 },
    text: { x: 36, width: 60, align: "center", nameY: 20, schoolY: 41, gradeY: 62, subjectY: 81, nameSize: 24, schoolSize: 11.5, gradeSize: 10.5, subjectSize: 12 }
  },
  {
    id: "custom-art-bear-besties", name: "Bestie Bear Hugs", file: "bear-besties.png", category: "Animals",
    templateId: "new-art-bestie-bear-hugs", templateName: "Bestie Bear Hugs",
    background: "#fff4f0", border: "#d88679", accent: "#744a55", secondary: "#e9a3b2",
    decoration: "collection-art-bear-hugs", fontFamily: "Baloo 2", layout: "split", radius: 18, borderStyle: "solid",
    image: { x: 17, y: 50, width: 27 },
    text: { x: 64, width: 60, align: "center", nameY: 20, schoolY: 41, gradeY: 62, subjectY: 81, nameSize: 24, schoolSize: 11.5, gradeSize: 10.5, subjectSize: 12 }
  },
  {
    id: "custom-art-parrot-rainbow", name: "Rainbow Parrot Pal", file: "parrot-rainbow.png", category: "Nature",
    templateId: "new-art-rainbow-parrot-pal", templateName: "Rainbow Parrot Pal",
    background: "#f2fff3", border: "#53aa78", accent: "#35674d", secondary: "#e6a93c",
    decoration: "collection-art-parrot-party", fontFamily: "Fredoka", layout: "playful", radius: 14, borderStyle: "solid",
    image: { x: 83, y: 50, width: 28 },
    text: { x: 36, width: 60, align: "center", nameY: 20, schoolY: 41, gradeY: 62, subjectY: 81, nameSize: 24, schoolSize: 11.5, gradeSize: 10.5, subjectSize: 12 }
  },
  {
    id: "custom-art-chick-sunshine", name: "Sunny Chick Buddy", file: "chick-sunshine.png", category: "Animals",
    templateId: "new-art-sunny-chick-buddy", templateName: "Sunny Chick Buddy",
    background: "#fff9e5", border: "#e6b43b", accent: "#745523", secondary: "#f28c53",
    decoration: "collection-art-sunny-chick", fontFamily: "Baloo 2", layout: "split", radius: 13, borderStyle: "solid",
    image: { x: 17, y: 50, width: 27 },
    text: { x: 64, width: 60, align: "center", nameY: 20, schoolY: 41, gradeY: 62, subjectY: 81, nameSize: 24, schoolSize: 11.5, gradeSize: 10.5, subjectSize: 12 }
  },
  {
    id: "custom-art-bluebird-buddy", name: "Bluebird Giggles", file: "bluebird-buddy.png", category: "Animals",
    templateId: "new-art-bluebird-giggles", templateName: "Bluebird Giggles",
    background: "#eefaff", border: "#4a9ed1", accent: "#355a83", secondary: "#f0a947",
    decoration: "collection-art-bluebird-giggles", fontFamily: "Fredoka", layout: "banner", radius: 11, borderStyle: "solid",
    image: { x: 83, y: 50, width: 28 },
    text: { x: 36, width: 60, align: "center", nameY: 20, schoolY: 41, gradeY: 62, subjectY: 81, nameSize: 24, schoolSize: 11.5, gradeSize: 10.5, subjectSize: 12 }
  },
  {
    id: "custom-art-fairy-star-wand", name: "Star Wand Fairy", file: "fairy-star-wand.png", category: "Cartoon",
    templateId: "new-art-star-wand-fairy", templateName: "Star Wand Fairy",
    background: "#f5f1ff", border: "#9380db", accent: "#51447e", secondary: "#edba55",
    decoration: "collection-art-fairy-star", fontFamily: "Baloo 2", layout: "split", radius: 16, borderStyle: "solid",
    image: { x: 17, y: 50, width: 27 },
    text: { x: 64, width: 60, align: "center", nameY: 20, schoolY: 41, gradeY: 62, subjectY: 81, nameSize: 24, schoolSize: 11.5, gradeSize: 10.5, subjectSize: 12 }
  }
];

function makeText(style: CustomArtworkDesign, field: Exclude<TextElement["field"], "custom">, sinhalaFontFamily: SinhalaFontFamily): TextElement {
  const { text } = style;
  const fields = {
    name: { y: text.nameY, fontSize: text.nameSize, height: 22, color: style.accent, bold: true },
    school: { y: text.schoolY, fontSize: text.schoolSize, height: 18, color: style.accent, bold: false },
    grade: { y: text.gradeY, fontSize: text.gradeSize, height: 15, color: style.secondary, bold: true },
    subject: { y: text.subjectY, fontSize: text.subjectSize, height: 17, color: style.accent, bold: true }
  } satisfies Record<Exclude<TextElement["field"], "custom">, Omit<TextElement, "id" | "field" | "text" | "visible" | "fontFamily" | "wrap" | "align" | "x" | "width" | "rotation" | "lineHeight" | "letterSpacing"> & { y: number }>;
  const fieldStyle = fields[field];
  return {
    id: `${style.templateId}-${field}`,
    field,
    text: "",
    visible: true,
    fontFamily: style.fontFamily ?? "Inter",
    sinhalaFontFamily,
    ...fieldStyle,
    wrap: true,
    align: field === "name" ? text.align : "center",
    x: text.x,
    width: text.width,
    rotation: 0,
    lineHeight: 1.12,
    letterSpacing: 0
  };
}

const sinhalaFontFamilies: SinhalaFontFamily[] = [
  "Abhaya Libre",
  "Gemunu Libre",
  "Noto Serif Sinhala",
  "Yaldevi",
  "Noto Sans Sinhala"
];

export const customArtworkTemplates: StickerTemplate[] = designs.map((style, index) => {
  const sinhalaFontFamily = sinhalaFontFamilies[index % sinhalaFontFamilies.length];
  const image: DesignImage = {
    id: `${style.templateId}-art`,
    assetId: style.id,
    ...style.image,
    rotation: 0
  };
  return {
    id: style.templateId,
    name: style.templateName,
    kind: "sticker",
    widthMm: style.widthMm ?? 90,
    heightMm: style.heightMm ?? 45,
    background: style.background,
    borderColor: style.border,
    accent: style.accent,
    borderStyle: style.borderStyle,
    radius: style.radius,
    borderWidth: style.templateId === "new-art-apple-pencil" ? 1.6 : 1.4,
    innerBorder: ["new-art-creative-circle-boy", "new-art-lion-sunshine", "new-art-garden-birds", "new-art-apple-pencil", "new-art-enchanted-garden-frame", "new-art-bright-bird-parade", "new-art-adventure-study-pals"].includes(style.templateId),
    showCutline: false,
    layout: style.layout,
    decoration: style.decoration,
    images: [image],
    texts: [
      makeText(style, "name", sinhalaFontFamily),
      makeText(style, "school", sinhalaFontFamily),
      makeText(style, "grade", sinhalaFontFamily),
      makeText(style, "subject", sinhalaFontFamily)
    ],
    favourite: false,
    createdAt: 0,
    updatedAt: 0
  };
});

export const customArtworkTemplateIds = new Set(customArtworkTemplates.map(template => template.id));
