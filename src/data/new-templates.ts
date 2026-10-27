import type { DesignImage, StickerTemplate, TextElement } from "@/types";

const now = 0;

interface NewTemplateStyle {
  id: string;
  name: string;
  background: string;
  border: string;
  accent: string;
  secondary: string;
  decoration: string;
  layout: StickerTemplate["layout"];
  radius: number;
  borderStyle: StickerTemplate["borderStyle"];
  borderWidth?: number;
  innerBorder?: boolean;
  image?: { assetId: string; x: number; y: number; width: number };
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

const designs: NewTemplateStyle[] = [
  {
    id: "new-premium-pastel", name: "Premium Pastel", background: "#f7f4ff", border: "#b8a7d8",
    accent: "#554b72", secondary: "#d58cb9", decoration: "collection-premium-pastel", layout: "split",
    radius: 13, borderStyle: "solid", image: { assetId: "starter-fairy", x: 15, y: 53, width: 27 },
    text: { x: 68, width: 58, align: "center", nameY: 23, schoolY: 44, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "new-rainbow-kids", name: "Rainbow Kids", background: "#fff9e9", border: "#f1a851",
    accent: "#314a70", secondary: "#ed7691", decoration: "collection-rainbow-kids", layout: "playful",
    radius: 14, borderStyle: "solid", image: { assetId: "starter-tiger", x: 15, y: 53, width: 27 },
    text: { x: 68, width: 58, align: "center", nameY: 23, schoolY: 44, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "new-cute-cartoon", name: "Storybook Santa", background: "#fff7f0", border: "#d85a4f",
    accent: "#813b36", secondary: "#e4a348", decoration: "collection-storybook", layout: "split",
    radius: 9, borderStyle: "dashed", image: { assetId: "starter-santa", x: 15, y: 53, width: 27 },
    text: { x: 68, width: 58, align: "center", nameY: 22, schoolY: 43, gradeY: 63, subjectY: 82, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "new-minimal-modern", name: "Minimal Modern", background: "#ffffff", border: "#243f52",
    accent: "#243f52", secondary: "#58a99b", decoration: "collection-minimal", layout: "centered",
    radius: 3, borderStyle: "solid",
    text: { x: 50, width: 84, align: "left", nameY: 22, schoolY: 43, gradeY: 64, subjectY: 83, nameSize: 24, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "new-floral-garden", name: "Floral Garden", background: "#fff5f6", border: "#dc8a9f",
    accent: "#75485d", secondary: "#789677", decoration: "collection-floral", layout: "split",
    radius: 15, borderStyle: "solid", image: { assetId: "starter-rose", x: 15, y: 53, width: 27 },
    text: { x: 68, width: 58, align: "center", nameY: 23, schoolY: 44, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "new-space-galaxy", name: "Space & Galaxy", background: "#17264c", border: "#5ed3e6",
    accent: "#fff9dc", secondary: "#75c8ef", decoration: "collection-galaxy", layout: "split",
    radius: 11, borderStyle: "solid", image: { assetId: "starter-penguin", x: 15, y: 53, width: 25 },
    text: { x: 68, width: 58, align: "center", nameY: 23, schoolY: 44, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "new-nature-green", name: "Nature & Green", background: "#f1f7e9", border: "#65916b",
    accent: "#355842", secondary: "#8caa67", decoration: "collection-nature", layout: "split",
    radius: 10, borderStyle: "solid", image: { assetId: "starter-elf", x: 15, y: 53, width: 26 },
    text: { x: 68, width: 58, align: "center", nameY: 23, schoolY: 44, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "new-bold-blocks", name: "Bold Colour Blocks", background: "#fff4e8", border: "#e66e59",
    accent: "#243b5c", secondary: "#188d88", decoration: "collection-blocks", layout: "split",
    radius: 5, borderStyle: "solid", image: { assetId: "starter-princess-pig", x: 15, y: 53, width: 26 },
    text: { x: 68, width: 58, align: "center", nameY: 23, schoolY: 44, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "new-school-classic", name: "Elegant School Classic", background: "#fbf6e9", border: "#8b6c44",
    accent: "#243a5a", secondary: "#ad8548", decoration: "collection-classic", layout: "centered",
    radius: 4, borderStyle: "solid",
    text: { x: 50, width: 82, align: "center", nameY: 22, schoolY: 43, gradeY: 64, subjectY: 83, nameSize: 24, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "new-plain-name-label", name: "Plain Name Label", background: "#ffffff", border: "#262626",
    accent: "#242424", secondary: "#555555", decoration: "collection-plain-outline", layout: "centered",
    radius: 5, borderWidth: 1.15, innerBorder: true, borderStyle: "solid",
    text: { x: 50, width: 86, align: "center", nameY: 24, schoolY: 45, gradeY: 64, subjectY: 82, nameSize: 24, schoolSize: 11, gradeSize: 10, subjectSize: 11 }
  },
  {
    id: "new-bold-black-frame", name: "Bold Black Frame", background: "#292929", border: "#292929",
    accent: "#191919", secondary: "#444444", decoration: "collection-plain-white-inset", layout: "centered",
    radius: 5, borderWidth: 1, borderStyle: "solid",
    text: { x: 50, width: 78, align: "center", nameY: 34, schoolY: 52, gradeY: 66, subjectY: 80, nameSize: 24, schoolSize: 11, gradeSize: 10, subjectSize: 11 }
  },
  {
    id: "new-soft-grey-frame", name: "Soft Grey Frame", background: "#737373", border: "#737373",
    accent: "#292929", secondary: "#454545", decoration: "collection-grey-white-inset", layout: "centered",
    radius: 5, borderWidth: 1, borderStyle: "solid",
    text: { x: 50, width: 72, align: "center", nameY: 31, schoolY: 49, gradeY: 64, subjectY: 79, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 11 }
  },
  {
    id: "new-cute-animals", name: "Cute Animals", background: "#f0f8ff", border: "#78a8bd",
    accent: "#3a536c", secondary: "#e9ad52", decoration: "collection-paws", layout: "split",
    radius: 14, borderStyle: "solid", image: { assetId: "starter-bunny", x: 15, y: 53, width: 27 },
    text: { x: 68, width: 58, align: "center", nameY: 23, schoolY: 44, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  },
  {
    id: "new-ocean-dream", name: "Mermaid Lagoon", background: "#eaf9fa", border: "#53aaa8",
    accent: "#285d6b", secondary: "#e587a8", decoration: "collection-ocean", layout: "split",
    radius: 13, borderStyle: "solid", image: { assetId: "starter-mermaid", x: 15, y: 53, width: 25 },
    text: { x: 68, width: 58, align: "center", nameY: 23, schoolY: 44, gradeY: 64, subjectY: 83, nameSize: 23, schoolSize: 11, gradeSize: 10, subjectSize: 12 }
  }
];

function makeText(style: NewTemplateStyle, field: TextElement["field"]): TextElement {
  const { text, accent } = style;
  const positions = {
    name: [text.nameY, text.nameSize, 22, accent, true],
    school: [text.schoolY, text.schoolSize, 17, accent, false],
    grade: [text.gradeY, text.gradeSize, 14, style.secondary, true],
    subject: [text.subjectY, text.subjectSize, 17, accent, true]
  } as const;
  const [y, fontSize, height, color, bold] = positions[field as keyof typeof positions];

  return {
    id: `${style.id}-${field}`,
    field,
    text: "",
    visible: true,
    fontFamily: "Inter",
    fontSize,
    height,
    wrap: true,
    color,
    bold,
    align: field === "name" ? text.align : "center",
    x: text.x,
    y,
    width: text.width,
    rotation: 0,
    lineHeight: 1.12,
    letterSpacing: field === "name" && style.id === "new-school-classic" ? 0.35 : 0
  };
}

export const newDesignTemplates: StickerTemplate[] = designs.map(style => {
  const images: DesignImage[] = style.image ? [{
    id: `${style.id}-art`,
    assetId: style.image.assetId,
    x: style.image.x,
    y: style.image.y,
    width: style.image.width,
    rotation: 0
  }] : [];
  return {
    id: style.id,
    name: style.name,
    kind: "sticker",
    widthMm: 90,
    heightMm: 45,
    background: style.background,
    borderColor: style.border,
    accent: style.accent,
    borderStyle: style.borderStyle,
    radius: style.radius,
    borderWidth: style.borderWidth ?? (style.id === "new-school-classic" ? 1.8 : 1.4),
    innerBorder: style.innerBorder ?? ["new-premium-pastel", "new-school-classic", "new-floral-garden"].includes(style.id),
    showCutline: false,
    layout: style.layout,
    decoration: style.decoration,
    images,
    texts: [
      makeText(style, "name"),
      makeText(style, "school"),
      makeText(style, "grade"),
      makeText(style, "subject")
    ],
    favourite: ["new-premium-pastel", "new-rainbow-kids", "new-minimal-modern"].includes(style.id),
    createdAt: now,
    updatedAt: now
  };
});

export const newDesignTemplateIds = new Set(newDesignTemplates.map(template => template.id));
