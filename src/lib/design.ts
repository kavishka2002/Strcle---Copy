import type { LanguageMode, StickerDesign, StickerTemplate, TextElement } from "@/types";
import { isEnglishCardSubject } from "./subject-labels";

export function createDesign(
  name: string,
  values: { name: string; grade: string; subject: string; school: string },
  template: StickerTemplate,
  language: LanguageMode
): StickerDesign {
  const now = Date.now();
  const positions: Record<StickerTemplate["layout"], Record<"name" | "school" | "grade" | "subject", [number, number, number]>> = {
    centered: { name: [50, 25, 84], school: [50, 45, 84], grade: [50, 64, 76], subject: [50, 82, 84] },
    stack: { name: [50, 22, 82], school: [50, 42, 82], grade: [50, 61, 76], subject: [50, 80, 84] },
    split: { name: [66, 24, 62], school: [66, 45, 62], grade: [39, 66, 43], subject: [75, 66, 44] },
    badge: { name: [50, 25, 72], school: [50, 46, 80], grade: [50, 65, 70], subject: [50, 83, 82] },
    banner: { name: [50, 26, 84], school: [50, 46, 84], grade: [50, 65, 76], subject: [50, 83, 84] },
    playful: { name: [50, 24, 82], school: [50, 44, 82], grade: [50, 63, 76], subject: [50, 81, 82] },
    cover: { name: [50, 24, 88], school: [50, 44, 88], grade: [50, 63, 82], subject: [50, 82, 88] }
  };
  const positionsForTemplate = positions[template.layout];
  const fields: Array<Omit<TextElement, "text"> & { value: string }> = [
    { id: crypto.randomUUID(), field: "name", value: values.name.trim(), visible: true, fontFamily: "Inter", fontSize: 25, height: 22, wrap: true, color: template.accent, bold: true, align: "center", x: positionsForTemplate.name[0], y: positionsForTemplate.name[1], width: positionsForTemplate.name[2], rotation: template.layout === "playful" ? -2 : 0, lineHeight: 1.12, letterSpacing: 0 },
    { id: crypto.randomUUID(), field: "school", value: values.school.trim(), visible: !!values.school.trim(), fontFamily: "Inter", fontSize: 12, height: 17, wrap: true, color: template.accent, bold: false, align: "center", x: positionsForTemplate.school[0], y: positionsForTemplate.school[1], width: positionsForTemplate.school[2], rotation: 0, lineHeight: 1.14, letterSpacing: 0 },
    { id: crypto.randomUUID(), field: "grade", value: values.grade, visible: !!values.grade, fontFamily: "Inter", fontSize: 11, height: 14, wrap: true, color: template.accent, bold: true, align: template.layout === "split" ? "left" : "center", x: positionsForTemplate.grade[0], y: positionsForTemplate.grade[1], width: positionsForTemplate.grade[2], rotation: 0, lineHeight: 1.12, letterSpacing: 0 },
    { id: crypto.randomUUID(), field: "subject", value: values.subject.trim(), visible: !!values.subject.trim(), fontFamily: "Inter", fontSize: 12, height: 17, wrap: true, color: template.accent, bold: true, align: template.layout === "split" ? "right" : "center", x: positionsForTemplate.subject[0], y: positionsForTemplate.subject[1], width: positionsForTemplate.subject[2], rotation: 0, lineHeight: 1.12, letterSpacing: 0 }
  ];
  const defaultTexts = fields.map(({ value, ...field }) => ({ ...field, text: value }));
  const texts = defaultTexts.map(field => {
    const saved = template.texts?.find(item => item.field === field.field);
    return saved ? { ...field, ...saved, id: field.id, text: field.text, visible: field.visible } : field;
  });
  const customTexts = (template.texts ?? [])
    .filter(text => text.field === "custom")
    .map(text => ({ ...text, id: crypto.randomUUID(), text: "", visible: true }));
  return {
    id: crypto.randomUUID(), name: name.trim() || values.name.trim() || "My sticker", kind: template.kind,
    templateId: template.id, layout: template.layout, language, widthMm: template.widthMm, heightMm: template.heightMm,
    ...(template.customDimensionUnit ? { customDimensionUnit: template.customDimensionUnit } : {}),
    ...(template.customStyleTemplateId ? { customStyleTemplateId: template.customStyleTemplateId } : {}),
    background: template.background, backgroundAssetId: template.backgroundAssetId, decoration: template.decoration, borderColor: template.borderColor, borderWidth: template.borderWidth ?? 1.4,
    borderStyle: template.borderStyle, radius: template.radius, innerBorder: template.innerBorder ?? false, showCutline: template.showCutline ?? false,
    texts: [...texts, ...customTexts], images: template.images?.map(image => ({ ...image, id: crypto.randomUUID() })) ?? [], favourite: false, createdAt: now, updatedAt: now, lastUsedAt: now
  };
}

export function createSubjectDesign(
  name: string,
  values: { name: string; grade: string; school: string },
  subjects: string[],
  template: StickerTemplate,
  language: LanguageMode,
  englishCardDetails?: { name: string; school: string; grade: string }
): StickerDesign {
  const selectedSubjects = subjects.map(item => item.trim()).filter(Boolean);
  const subject = (englishCardDetails ? selectedSubjects.find(isEnglishCardSubject) : undefined)
    ?? selectedSubjects[0]
    ?? "";
  const isEnglishPreview = isEnglishCardSubject(subject);
  const design = createDesign(name, {
    ...values,
    name: isEnglishPreview ? englishCardDetails?.name ?? values.name : values.name,
    grade: isEnglishPreview ? englishCardDetails?.grade ?? values.grade : values.grade,
    school: isEnglishPreview ? englishCardDetails?.school ?? values.school : values.school,
    subject
  }, template, language);
  design.printSubjects = selectedSubjects;
  if (selectedSubjects.some(isEnglishCardSubject) && englishCardDetails) {
    design.defaultCardName = values.name;
    design.defaultCardGrade = values.grade;
    design.defaultCardSchool = values.school;
    design.englishCardName = englishCardDetails.name;
    design.englishCardGrade = englishCardDetails.grade;
    design.englishCardSchool = englishCardDetails.school;
  }
  return design;
}

export function templateFromDesign(design: StickerDesign, name: string): StickerTemplate {
  return {
    id: crypto.randomUUID(), name, kind: design.kind, widthMm: design.widthMm, heightMm: design.heightMm,
    ...(design.customDimensionUnit ? { customDimensionUnit: design.customDimensionUnit } : {}),
    ...(design.customStyleTemplateId ? { customStyleTemplateId: design.customStyleTemplateId } : {}),
    background: design.background, backgroundAssetId: design.backgroundAssetId, borderColor: design.borderColor, accent: design.texts[0]?.color ?? "#35465d",
    borderStyle: design.borderStyle, radius: design.radius, borderWidth: design.borderWidth, innerBorder: design.innerBorder,
    showCutline: design.showCutline, layout: design.layout ?? "centered", decoration: design.decoration ?? "✦",
    texts: design.texts.map(text => ({ ...text, text: "" })),
    images: design.images.map(image => ({ ...image })),
    favourite: false, userCreated: true, createdAt: Date.now(), updatedAt: Date.now()
  };
}
