export type LanguageMode = "English" | "Sinhala" | "Sinhala + English";
export type TextInputMode = "Sinhala Keyboard" | "Singlish to Sinhala" | "English";
export type EnglishFontFamily =
  | "Poppins"
  | "Nunito"
  | "Inter"
  | "Lato"
  | "Montserrat"
  | "Quicksand"
  | "Playfair Display"
  | "Fredoka"
  | "Baloo 2"
  | "Roboto"
  | "Lora"
  | "DM Sans";
export type SinhalaFontFamily = "Noto Sans Sinhala" | "Noto Serif Sinhala" | "Abhaya Libre" | "Gemunu Libre" | "Yaldevi";
export type FontWeight = 400 | 500 | 600 | 700;
export type BorderStyle = "solid" | "dashed" | "dotted";
export type AssetCategory = "Cartoon" | "Flowers" | "Animals" | "Nature" | "School" | "Sports" | "Space" | "Custom";
export type DesignKind = "sticker" | "cover";
export type MeasurementUnit = "in" | "cm";

export interface TextElement {
  id: string;
  field: "name" | "grade" | "subject" | "school" | "custom";
  customLabel?: string;
  text: string;
  visible: boolean;
  fontFamily: EnglishFontFamily | SinhalaFontFamily;
  sinhalaFontFamily?: SinhalaFontFamily;
  fontWeight?: FontWeight;
  fontSize: number;
  height?: number;
  wrap?: boolean;
  color: string;
  bold: boolean;
  align: "left" | "center" | "right";
  x: number;
  y: number;
  width: number;
  rotation: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface DesignImage {
  id: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
}

export interface StickerDesign {
  id: string;
  name: string;
  kind: DesignKind;
  templateId: string;
  layout?: StickerTemplate["layout"];
  language: LanguageMode;
  widthMm: number;
  heightMm: number;
  customDimensionUnit?: MeasurementUnit;
  customStyleTemplateId?: string;
  background: string;
  backgroundAssetId?: string;
  decoration?: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: BorderStyle;
  radius: number;
  innerBorder: boolean;
  showCutline: boolean;
  texts: TextElement[];
  printSubjects?: string[];
  defaultCardName?: string;
  defaultCardGrade?: string;
  defaultCardSchool?: string;
  englishCardName?: string;
  englishCardGrade?: string;
  englishCardSchool?: string;
  images: DesignImage[];
  favourite: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number;
}

export interface StickerTemplate {
  id: string;
  name: string;
  kind: DesignKind;
  widthMm: number;
  heightMm: number;
  customDimensionUnit?: MeasurementUnit;
  customStyleTemplateId?: string;
  background: string;
  backgroundAssetId?: string;
  borderColor: string;
  accent: string;
  borderStyle: BorderStyle;
  radius: number;
  borderWidth?: number;
  innerBorder?: boolean;
  showCutline?: boolean;
  texts?: TextElement[];
  images?: DesignImage[];
  layout: "stack" | "split" | "badge" | "banner" | "centered" | "playful" | "cover";
  decoration: string;
  favourite: boolean;
  userCreated?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ImageAsset {
  id: string;
  name: string;
  category: AssetCategory;
  type: string;
  blob: Blob;
  createdAt: number;
  bundled?: boolean;
}

export interface SubjectPreset {
  gradeBand: string;
  stream?: string;
  subjects: Array<{ en: string; si: string }>;
  starterVersion?: number;
}
