export type CvSectionId = "summary" | "experience" | "education" | "projects" | "skills" | "certifications" | "training" | "publications" | "volunteer" | "awards" | "references";
export type CvTextWeight = 400 | 500 | 600 | 700;

export interface CvTextStyle {
  fontFamily?: string;
  fontSizePt?: number;
  fontWeight?: CvTextWeight;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  lineHeight?: number;
  letterSpacingPt?: number;
  widthPercent?: number;
  marginTopPt?: number;
  marginBottomPt?: number;
  paddingPt?: number;
  indentPt?: number;
  wrap?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  borderWidthPt?: number;
  borderRadiusPt?: number;
}

export interface CvCustomBlock {
  id: string;
  title: string;
  body: string;
}

export interface CvHeaderLayout {
  nameWidthPercent: number;
  titleGapPt: number;
  photoVisible: boolean;
  photoSide: "left" | "right" | "top";
  photoWidthMm: number;
  photoHeightMm: number;
  photoGapMm: number;
  photoObjectPosition: "center" | "top" | "bottom" | "left" | "right";
  nameFitToOneLine: boolean;
}

export interface CvPersonalDetails {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  alternativePhone: string;
  address: string;
  cityCountry: string;
  dateOfBirth: string;
  nic: string;
  gender: string;
  nationality: string;
  maritalStatus: string;
  summary: string;
  linkedIn: string;
  github: string;
  portfolio: string;
}

export type CvPersonalField = Exclude<keyof CvPersonalDetails, "fullName">;

export interface CvEducation {
  id: string;
  qualification: string;
  institution: string;
  startYear: string;
  endYear: string;
  grade: string;
  description: string;
}

export interface CvExamResult {
  id: string;
  subject: string;
  result: string;
}

export interface CvExperience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  details: string;
}

export interface CvProject {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
  githubUrl: string;
}

export interface CvEntry {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
}

export interface CvDraft {
  id: "current";
  personal: CvPersonalDetails;
  visiblePersonalFields: Partial<Record<CvPersonalField, boolean>>;
  declarationEnabled: boolean;
  declarationText: string;
  declarationDate: string;
  declarationPlace: string;
  signature?: Blob;
  education: CvEducation[];
  olResults: CvExamResult[];
  alResults: CvExamResult[];
  olExamYear: string;
  olIndexNumber: string;
  alExamYear: string;
  alIndexNumber: string;
  experience: CvExperience[];
  projects: CvProject[];
  technicalSkills: string[];
  softSkills: string[];
  languages: string[];
  skillIds: Record<"technicalSkills" | "softSkills" | "languages", string[]>;
  certifications: CvEntry[];
  training: CvEntry[];
  publications: CvEntry[];
  volunteer: CvEntry[];
  awards: CvEntry[];
  references: CvEntry[];
  customBlocks: CvCustomBlock[];
  sectionTitles: Partial<Record<CvSectionId, string>>;
  textStyles: Record<string, CvTextStyle>;
  headerLayout: CvHeaderLayout;
  enabledSections: CvSectionId[];
  sectionOrder: CvSectionId[];
  templateId: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  photoStyle: "circle" | "square";
  photo?: Blob;
}

export interface SavedCv {
  id: string;
  type: "cv";
  name: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  draft: CvDraft;
}

export function getRecentSavedCvs(projects: readonly SavedCv[], limit = 10): SavedCv[] {
  return [...projects]
    .sort((left, right) => right.createdAt - left.createdAt || right.updatedAt - left.updatedAt)
    .slice(0, Math.max(0, Math.floor(limit)));
}

export function calculateCvPrintScale(contentHeightMm: number, pageHeightMm = 297, safetyMarginMm = 2): number | null {
  if (![contentHeightMm, pageHeightMm, safetyMarginMm].every(Number.isFinite)
    || contentHeightMm <= 0 || pageHeightMm <= 0 || safetyMarginMm < 0 || safetyMarginMm >= pageHeightMm) {
    return null;
  }
  const scale = Math.min(1, (pageHeightMm - safetyMarginMm) / contentHeightMm);
  return scale >= 0.78 ? scale : null;
}

export const cvSectionLabels: Record<CvSectionId, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
  training: "Professional Training",
  publications: "Research & Publications",
  volunteer: "Volunteer Experience",
  awards: "Awards & Achievements",
  references: "References"
};

export function validateCvPersonalDetails(personal: CvPersonalDetails): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!personal.fullName.trim()) errors.fullName = "Please enter your full name.";
  if (personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) errors.email = "Enter a valid email address.";
  for (const key of ["phone", "alternativePhone"] as const) {
    const value = personal[key];
    if (value && (!/^[+()\d\s./x-]+$/i.test(value) || value.replace(/\D/g, "").length < 7 || value.replace(/\D/g, "").length > 20)) {
      errors[key] = "Enter a valid phone number.";
    }
  }
  if (personal.nic && !/^[A-Za-z0-9][A-Za-z0-9/-]{4,19}$/.test(personal.nic)) {
    errors.nic = "Use 5–20 letters, numbers, slashes, or hyphens.";
  }
  return errors;
}

export const emptyCvDraft = (): CvDraft => ({
  id: "current",
  personal: {
    fullName: "", title: "", email: "", phone: "", alternativePhone: "", address: "", cityCountry: "",
    dateOfBirth: "", nic: "", gender: "", nationality: "", maritalStatus: "", summary: "", linkedIn: "", github: "", portfolio: ""
  },
  visiblePersonalFields: {
    title: true, email: true, phone: true, alternativePhone: true, address: true, cityCountry: true,
    dateOfBirth: true, nic: true, gender: true, nationality: true, maritalStatus: true,
    summary: true, linkedIn: true, github: true, portfolio: true
  },
  declarationEnabled: false,
  declarationText: "I hereby declare that the information provided above is true and correct to the best of my knowledge.",
  declarationDate: "",
  declarationPlace: "",
  education: [],
  olResults: [],
  alResults: [],
  olExamYear: "",
  olIndexNumber: "",
  alExamYear: "",
  alIndexNumber: "",
  experience: [],
  projects: [],
  technicalSkills: [],
  softSkills: [],
  languages: [],
  skillIds: { technicalSkills: [], softSkills: [], languages: [] },
  certifications: [],
  training: [],
  publications: [],
  volunteer: [],
  awards: [],
  references: [],
  customBlocks: [],
  sectionTitles: {},
  textStyles: {},
  headerLayout: {
    nameWidthPercent: 100,
    titleGapPt: 5,
    photoVisible: true,
    photoSide: "left",
    photoWidthMm: 28,
    photoHeightMm: 32,
    photoGapMm: 7,
    photoObjectPosition: "center",
    nameFitToOneLine: false
  },
  enabledSections: ["summary", "experience", "education", "projects", "skills"],
  sectionOrder: ["summary", "experience", "education", "projects", "skills", "certifications", "training", "publications", "volunteer", "awards", "references"],
  templateId: "modern-navy",
  accentColor: "#397b68",
  fontFamily: "Inter",
  fontSize: 10,
  photoStyle: "circle"
});
