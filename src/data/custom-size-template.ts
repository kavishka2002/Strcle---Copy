import type { DesignImage, StickerTemplate, TextElement } from "@/types";

export const CUSTOM_SIZE_TEMPLATE_ID = "custom-size-sticker";
export const CUSTOM_SIZE_ARTWORK_ID = "custom-size-apple-pencil";

const textStyle = (
  field: TextElement["field"],
  y: number,
  fontSize: number,
  height: number,
  color: string,
  bold: boolean
): TextElement => ({
  id: `${CUSTOM_SIZE_TEMPLATE_ID}-${field}`,
  field,
  text: "",
  visible: true,
  fontFamily: "Inter",
  fontSize,
  height,
  wrap: true,
  color,
  bold,
  align: "center",
  x: 68,
  y,
  width: 58,
  rotation: 0,
  lineHeight: 1.12,
  letterSpacing: 0
});

const customTexts: TextElement[] = [
  textStyle("name", 22, 22, 21, "#163b32", true),
  textStyle("school", 43, 10.5, 18, "#40574c", false),
  textStyle("grade", 63, 10, 15, "#a9692d", true),
  textStyle("subject", 82, 12, 17, "#163b32", true)
];

const customImages: DesignImage[] = [{
  id: `${CUSTOM_SIZE_TEMPLATE_ID}-apple-pencil`,
  assetId: CUSTOM_SIZE_ARTWORK_ID,
  x: 17,
  y: 52,
  width: 29,
  rotation: 0
}];

export const customSizeTemplate: StickerTemplate = {
  id: CUSTOM_SIZE_TEMPLATE_ID,
  name: "Custom Size Sticker",
  kind: "sticker",
  widthMm: 76.2,
  heightMm: 50.8,
  customDimensionUnit: "in",
  background: "#fff9ed",
  borderColor: "#285342",
  accent: "#163b32",
  borderStyle: "solid",
  radius: 8,
  borderWidth: 1.5,
  innerBorder: true,
  showCutline: false,
  layout: "split",
  decoration: "collection-custom-scholar",
  images: customImages,
  texts: customTexts,
  favourite: false,
  createdAt: 0,
  updatedAt: 0
};
