import type { StickerTemplate, TextElement } from "@/types";

export const printableLabelCategories = [
  "Professional",
  "IT & Technology",
  "Simple & Minimal",
  "Decorative & Creative"
] as const;

export type PrintableLabelCategory = (typeof printableLabelCategories)[number];
export const printableLabelGroups = [
  "All Templates", "Full Details", "Name Only", "Subject Only", "Minimal", "Cartoon", "Floral", "Other Designs"
] as const;
export type PrintableLabelGroup = (typeof printableLabelGroups)[number];

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
  mode?: "full" | "name" | "subject";
  group?: Exclude<PrintableLabelGroup, "All Templates">;
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
  { id: "label-creative-layers", name: "Creative Layers", category: "Decorative & Creative", background: "#fff7ed", border: "#de9d73", accent: "#674535", secondary: "#e3a75d", decoration: "collection-label-creative-layers", layout: "badge", radius: 14, borderStyle: "solid", borderWidth: 1, innerBorder: true, nameSize: 22, nameAlign: "center", textX: 50, textWidth: 84 },

  { id: "label-name-pastel", name: "Name Only · Soft Pastel", category: "Decorative & Creative", group: "Name Only", mode: "name", background: "#fff5f7", border: "#db9eb3", accent: "#713d56", secondary: "#d783a2", decoration: "collection-label-soft-pastel", layout: "centered", radius: 12, borderStyle: "solid", borderWidth: 1.1, nameSize: 27, nameAlign: "center", textX: 50, textWidth: 86 },
  { id: "label-name-rainbow", name: "Name Only · Rainbow", category: "Decorative & Creative", group: "Cartoon", mode: "name", background: "#f5fbff", border: "#77a9ca", accent: "#315879", secondary: "#ef9b65", decoration: "collection-rainbow-kids", layout: "playful", radius: 13, borderStyle: "solid", borderWidth: 1.2, nameSize: 28, nameAlign: "center", textX: 50, textWidth: 86 },
  { id: "label-name-floral", name: "Name Only · Botanical", category: "Decorative & Creative", group: "Floral", mode: "name", background: "#f7faef", border: "#94a77b", accent: "#3d5845", secondary: "#85a96e", decoration: "collection-label-botanical-line", layout: "centered", radius: 8, borderStyle: "solid", borderWidth: 1, nameSize: 27, nameAlign: "center", textX: 50, textWidth: 86 },
  { id: "label-name-minimal", name: "Name Only · Clean Border", category: "Simple & Minimal", group: "Minimal", mode: "name", background: "#ffffff", border: "#526c78", accent: "#263d49", secondary: "#7896a3", decoration: "collection-label-modern-outline", layout: "centered", radius: 4, borderStyle: "solid", borderWidth: 1, nameSize: 26, nameAlign: "center", textX: 50, textWidth: 88 },
  { id: "label-name-cartoon", name: "Name Only · Playful Friends", category: "Decorative & Creative", group: "Cartoon", mode: "name", background: "#fff9ec", border: "#e0ab58", accent: "#65461f", secondary: "#e5ad4a", decoration: "collection-art-teddy-friend", layout: "playful", radius: 14, borderStyle: "solid", borderWidth: 1.2, nameSize: 27, nameAlign: "center", textX: 50, textWidth: 84 },
  { id: "label-name-modern", name: "Name Only · Modern Stripe", category: "IT & Technology", group: "Other Designs", mode: "name", background: "#f3f8fc", border: "#497b9b", accent: "#23465e", secondary: "#5aa1b3", decoration: "collection-label-professional-blue", layout: "banner", radius: 5, borderStyle: "solid", borderWidth: 1.1, nameSize: 26, nameAlign: "center", textX: 50, textWidth: 86 },

  { id: "label-subject-minimal", name: "Subject Only · Monochrome", category: "Simple & Minimal", group: "Subject Only", mode: "subject", background: "#ffffff", border: "#333333", accent: "#171717", secondary: "#4c4c4c", decoration: "collection-label-ink-saver", layout: "centered", radius: 1, borderStyle: "solid", borderWidth: .7, nameSize: 27, nameAlign: "center", textX: 50, textWidth: 88 },
  { id: "label-subject-floral", name: "Subject Only · Garden", category: "Decorative & Creative", group: "Subject Only", mode: "subject", background: "#f5f8ef", border: "#8da181", accent: "#3f5744", secondary: "#83a77c", decoration: "collection-floral", layout: "centered", radius: 10, borderStyle: "solid", borderWidth: 1, nameSize: 27, nameAlign: "center", textX: 50, textWidth: 86 },
  { id: "label-subject-school", name: "Subject Only · School Days", category: "Professional", group: "Subject Only", mode: "subject", background: "#fffdf4", border: "#a48d58", accent: "#4c4632", secondary: "#c59b4e", decoration: "collection-label-school-classic", layout: "centered", radius: 4, borderStyle: "solid", borderWidth: 1.2, innerBorder: true, nameSize: 27, nameAlign: "center", textX: 50, textWidth: 86 },
  { id: "label-subject-pastel", name: "Subject Only · Pastel Bloom", category: "Decorative & Creative", group: "Floral", mode: "subject", background: "#fbf5ff", border: "#a591c0", accent: "#59456f", secondary: "#c58ab6", decoration: "collection-label-geometric-bloom", layout: "badge", radius: 13, borderStyle: "solid", borderWidth: 1.1, nameSize: 27, nameAlign: "center", textX: 50, textWidth: 84 },
  { id: "label-subject-modern", name: "Subject Only · Modern", category: "IT & Technology", group: "Subject Only", mode: "subject", background: "#f1f8fb", border: "#337b91", accent: "#183e51", secondary: "#38a8b8", decoration: "collection-label-tech-grid", layout: "split", radius: 6, borderStyle: "solid", borderWidth: 1, nameSize: 26, nameAlign: "center", textX: 50, textWidth: 86 },
  { id: "label-subject-playful", name: "Subject Only · Bright Class", category: "Decorative & Creative", group: "Cartoon", mode: "subject", background: "#fff8eb", border: "#e3a75d", accent: "#704a22", secondary: "#df9a43", decoration: "collection-rainbow-kids", layout: "playful", radius: 12, borderStyle: "solid", borderWidth: 1.2, nameSize: 27, nameAlign: "center", textX: 50, textWidth: 84 },

  { id: "label-school-scout", name: "School Scout", category: "Professional", group: "Full Details", background: "#fffdf3", border: "#a58b56", accent: "#4b482f", secondary: "#c5a15b", decoration: "collection-label-school-classic", layout: "centered", radius: 4, borderStyle: "solid", borderWidth: 1.25, innerBorder: true, nameSize: 23, nameAlign: "center", textX: 50, textWidth: 84 },
  { id: "label-nature-leaf", name: "Nature Leaf", category: "Decorative & Creative", group: "Floral", background: "#f4f8ef", border: "#829b72", accent: "#38533f", secondary: "#78966e", decoration: "collection-label-botanical-line", layout: "stack", radius: 8, borderStyle: "solid", borderWidth: 1, nameSize: 23, nameAlign: "center", textX: 50, textWidth: 84 },
  { id: "label-black-white-academic", name: "Black & White Academic", category: "Simple & Minimal", group: "Minimal", background: "#ffffff", border: "#333333", accent: "#161616", secondary: "#555555", decoration: "collection-label-ink-saver", layout: "centered", radius: 1, borderStyle: "solid", borderWidth: .65, nameSize: 22, nameAlign: "left", textX: 50, textWidth: 86 },
  { id: "label-boys-skater", name: "Skater School", category: "IT & Technology", group: "Cartoon", background: "#f1f7fc", border: "#47799d", accent: "#29475e", secondary: "#5b9ab2", decoration: "collection-art-skater-tiger", layout: "playful", radius: 7, borderStyle: "solid", borderWidth: 1.2, nameSize: 23, nameAlign: "center", textX: 50, textWidth: 84 },
  { id: "label-girls-floral", name: "Floral Garden", category: "Decorative & Creative", group: "Floral", background: "#fff7fa", border: "#d59ab0", accent: "#694455", secondary: "#d888a6", decoration: "collection-floral", layout: "centered", radius: 11, borderStyle: "solid", borderWidth: 1.1, nameSize: 23, nameAlign: "center", textX: 50, textWidth: 84 }
];

function makeText(style: PrintableLabelStyle, field: TextElement["field"]): TextElement {
  const fields: Record<TextElement["field"], { y: number; fontSize: number; height: number; color: string; bold: boolean }> = {
    name: { y: 22, fontSize: style.nameSize, height: 23, color: style.accent, bold: true },
    school: { y: 42, fontSize: 11.5, height: 18, color: style.accent, bold: false },
    grade: { y: 62, fontSize: 10, height: 16, color: style.secondary, bold: true },
    subject: { y: 81, fontSize: 12, height: 18, color: style.accent, bold: true },
    custom: { y: 92, fontSize: 9, height: 14, color: style.accent, bold: false }
  };
  const position = style.mode === "name" || style.mode === "subject"
    ? { ...fields[field], y: 50, fontSize: field === "name" || field === "subject" ? style.nameSize + 4 : fields[field].fontSize, height: 34 }
    : fields[field];
  const primaryField = style.mode === "name" ? "name" : style.mode === "subject" ? "subject" : null;
  return {
    id: `${style.id}-${field}`,
    field,
    text: "",
    visible: primaryField ? field === primaryField : true,
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
  labelMode: style.mode ?? "full",
  images: [],
  texts: ["name", "school", "grade", "subject"].map(field => makeText(style, field as TextElement["field"])),
  favourite: false,
  createdAt: 0,
  updatedAt: 0
}));

export const printableLabelTemplateIds = new Set(printableLabelTemplates.map(template => template.id));
export const printableLabelCategoryById = new Map(styles.map(style => [style.id, style.category]));
export const printableLabelModeById = new Map(styles.map(style => [style.id, style.mode ?? "full"]));
export const printableLabelGroupById = new Map(styles.map(style => [
  style.id,
  style.group ?? (style.category === "Professional" ? "Full Details"
    : style.category === "Simple & Minimal" ? "Minimal"
      : style.category === "Decorative & Creative" ? "Floral"
        : "Other Designs")
]));
