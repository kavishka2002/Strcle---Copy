import type { StickerTemplate, TextElement } from "@/types";

export const printableLabelCategories = [
  "Professional",
  "IT & Technology",
  "Simple & Minimal",
  "Decorative & Creative"
] as const;

export type PrintableLabelCategory = (typeof printableLabelCategories)[number];

interface PrintableLabelStyle {
  id: string;
  name: string;
  category: PrintableLabelCategory;
  background: string;
  border: string;
  accent: string;
  secondary: string;
  decoration: string;
  layout: StickerTemplate["layout"];
  radius: number;
  borderStyle: StickerTemplate["borderStyle"];
  borderWidth: number;
  innerBorder?: boolean;
  nameSize: number;
  nameAlign: TextElement["align"];
  textX: number;
  textWidth: number;
}

const styles: PrintableLabelStyle[] = [
  { id: "label-professional-blue", name: "Professional Blue", category: "Professional", background: "#f5f9ff", border: "#426b96", accent: "#203f61", secondary: "#7396b7", decoration: "collection-label-professional-blue", layout: "banner", radius: 5, borderStyle: "solid", borderWidth: 1.2, innerBorder: true, nameSize: 23, nameAlign: "left", textX: 50, textWidth: 84 },
  { id: "label-modern-outline", name: "Modern Outline", category: "Professional", background: "#ffffff", border: "#365b73", accent: "#24445b", secondary: "#7fa8ba", decoration: "collection-label-modern-outline", layout: "centered", radius: 8, borderStyle: "solid", borderWidth: 1.1, nameSize: 24, nameAlign: "center", textX: 50, textWidth: 84 },
  { id: "label-executive-stripe", name: "Executive Stripe", category: "Professional", background: "#f8f8f6", border: "#4a5968", accent: "#263746", secondary: "#a3b1bf", decoration: "collection-label-executive-stripe", layout: "split", radius: 3, borderStyle: "solid", borderWidth: 1.3, nameSize: 22, nameAlign: "left", textX: 50, textWidth: 82 },
  { id: "label-staff-identity", name: "Staff Identity", category: "Professional", background: "#f5f7f8", border: "#667d8b", accent: "#344c5d", secondary: "#829ba7", decoration: "collection-label-staff-identity", layout: "badge", radius: 6, borderStyle: "solid", borderWidth: 1, nameSize: 22, nameAlign: "center", textX: 50, textWidth: 84 },
  { id: "label-school-classic", name: "School Classic", category: "Professional", background: "#fffdf7", border: "#897753", accent: "#3e5365", secondary: "#b49a65", decoration: "collection-label-school-classic", layout: "centered", radius: 3, borderStyle: "solid", borderWidth: 1.4, innerBorder: true, nameSize: 23, nameAlign: "center", textX: 50, textWidth: 84 },

  { id: "label-tech-grid", name: "Tech Grid", category: "IT & Technology", background: "#f2f8fb", border: "#337b91", accent: "#183e51", secondary: "#38a8b8", decoration: "collection-label-tech-grid", layout: "split", radius: 5, borderStyle: "solid", borderWidth: 1.1, nameSize: 23, nameAlign: "left", textX: 50, textWidth: 84 },
  { id: "label-circuit-edge", name: "Circuit Edge", category: "IT & Technology", background: "#eff8f5", border: "#2f7c6b", accent: "#1e4c42", secondary: "#56b49d", decoration: "collection-label-circuit-edge", layout: "banner", radius: 7, borderStyle: "solid", borderWidth: 1.1, nameSize: 23, nameAlign: "center", textX: 50, textWidth: 84 },
  { id: "label-digital-wave", name: "Digital Wave", category: "IT & Technology", background: "#f1f5ff", border: "#506fa5", accent: "#2d4269", secondary: "#6f8fe0", decoration: "collection-label-digital-wave", layout: "playful", radius: 10, borderStyle: "solid", borderWidth: 1, nameSize: 23, nameAlign: "center", textX: 50, textWidth: 84 },
  { id: "label-code-minimal", name: "Code Minimal", category: "IT & Technology", background: "#f7f8fa", border: "#647382", accent: "#273440", secondary: "#5f8d9a", decoration: "collection-label-code-minimal", layout: "stack", radius: 2, borderStyle: "dashed", borderWidth: 1, nameSize: 22, nameAlign: "left", textX: 50, textWidth: 82 },
  { id: "label-ai-geometry", name: "AI Geometry", category: "IT & Technology", background: "#f4f2ff", border: "#776da8", accent: "#39345e", secondary: "#8b83d2", decoration: "collection-label-ai-geometry", layout: "badge", radius: 12, borderStyle: "solid", borderWidth: 1, nameSize: 22, nameAlign: "center", textX: 50, textWidth: 82 },

  { id: "label-plain-white", name: "Plain White", category: "Simple & Minimal", background: "#ffffff", border: "#818b92", accent: "#252d32", secondary: "#6f7d85", decoration: "collection-label-plain-white", layout: "centered", radius: 1, borderStyle: "solid", borderWidth: .65, nameSize: 22, nameAlign: "left", textX: 50, textWidth: 86 },
  { id: "label-rounded-classic", name: "Rounded Classic", category: "Simple & Minimal", background: "#ffffff", border: "#8d9aa3", accent: "#34414b", secondary: "#718796", decoration: "collection-label-rounded-classic", layout: "centered", radius: 11, borderStyle: "solid", borderWidth: 1, nameSize: 23, nameAlign: "center", textX: 50, textWidth: 84 },
  { id: "label-double-border", name: "Elegant Double Border", category: "Simple & Minimal", background: "#fffefa", border: "#6e777d", accent: "#28343c", secondary: "#a2a9ad", decoration: "collection-label-double-border", layout: "centered", radius: 2, borderStyle: "solid", borderWidth: 1.4, innerBorder: true, nameSize: 22, nameAlign: "center", textX: 50, textWidth: 82 },
  { id: "label-ink-saver", name: "Minimal Monochrome", category: "Simple & Minimal", background: "#ffffff", border: "#333333", accent: "#171717", secondary: "#4c4c4c", decoration: "collection-label-ink-saver", layout: "stack", radius: 0, borderStyle: "solid", borderWidth: .6, nameSize: 22, nameAlign: "left", textX: 50, textWidth: 86 },
  { id: "label-corner-accent", name: "Corner Accent", category: "Simple & Minimal", background: "#ffffff", border: "#a4adb5", accent: "#334d60", secondary: "#568ba3", decoration: "collection-label-corner-accent", layout: "split", radius: 5, borderStyle: "solid", borderWidth: .8, nameSize: 23, nameAlign: "center", textX: 50, textWidth: 84 },

  { id: "label-soft-pastel", name: "Soft Pastel", category: "Decorative & Creative", background: "#fdf5f4", border: "#d9a3a3", accent: "#634451", secondary: "#d388a2", decoration: "collection-label-soft-pastel", layout: "centered", radius: 12, borderStyle: "dotted", borderWidth: 1.2, nameSize: 23, nameAlign: "center", textX: 50, textWidth: 84 },
  { id: "label-gradient-flow", name: "Gradient Flow", category: "Decorative & Creative", background: "#f0f7ff", border: "#719bc5", accent: "#25476b", secondary: "#7aadd0", decoration: "collection-label-gradient-flow", layout: "banner", radius: 10, borderStyle: "solid", borderWidth: 1, nameSize: 23, nameAlign: "left", textX: 50, textWidth: 84 },
  { id: "label-geometric-bloom", name: "Geometric Bloom", category: "Decorative & Creative", background: "#f5f5ff", border: "#9a8ab8", accent: "#544366", secondary: "#d29bac", decoration: "collection-label-geometric-bloom", layout: "playful", radius: 13, borderStyle: "solid", borderWidth: 1, nameSize: 22, nameAlign: "center", textX: 50, textWidth: 82 },
  { id: "label-botanical-line", name: "Botanical Line", category: "Decorative & Creative", background: "#f5f8ef", border: "#8da181", accent: "#3f5744", secondary: "#83a77c", decoration: "collection-label-botanical-line", layout: "stack", radius: 8, borderStyle: "solid", borderWidth: 1, nameSize: 22, nameAlign: "left", textX: 50, textWidth: 84 },
  { id: "label-creative-layers", name: "Creative Layers", category: "Decorative & Creative", background: "#fff7ed", border: "#de9d73", accent: "#674535", secondary: "#e3a75d", decoration: "collection-label-creative-layers", layout: "badge", radius: 14, borderStyle: "solid", borderWidth: 1, innerBorder: true, nameSize: 22, nameAlign: "center", textX: 50, textWidth: 84 }
];

function makeText(style: PrintableLabelStyle, field: TextElement["field"]): TextElement {
  const fields: Record<TextElement["field"], { y: number; fontSize: number; height: number; color: string; bold: boolean }> = {
    name: { y: 22, fontSize: style.nameSize, height: 23, color: style.accent, bold: true },
    school: { y: 42, fontSize: 11.5, height: 18, color: style.accent, bold: false },
    grade: { y: 62, fontSize: 10, height: 16, color: style.secondary, bold: true },
    subject: { y: 81, fontSize: 12, height: 18, color: style.accent, bold: true },
    custom: { y: 92, fontSize: 9, height: 14, color: style.accent, bold: false }
  };
  const position = fields[field];
  return {
    id: `${style.id}-${field}`,
    field,
    text: "",
    visible: true,
    fontFamily: "Inter",
    ...position,
    wrap: true,
    align: field === "name" ? style.nameAlign : "center",
    x: style.textX,
    width: style.textWidth,
    rotation: 0,
    lineHeight: 1.12,
    letterSpacing: 0
  };
}

export const printableLabelTemplates: StickerTemplate[] = styles.map(style => ({
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
  borderWidth: style.borderWidth,
  innerBorder: style.innerBorder ?? false,
  showCutline: false,
  layout: style.layout,
  decoration: style.decoration,
  images: [],
  texts: ["name", "school", "grade", "subject"].map(field => makeText(style, field as TextElement["field"])),
  favourite: false,
  createdAt: 0,
  updatedAt: 0
}));

export const printableLabelTemplateIds = new Set(printableLabelTemplates.map(template => template.id));
export const printableLabelCategoryById = new Map(styles.map(style => [style.id, style.category]));
