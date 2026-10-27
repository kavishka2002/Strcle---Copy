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
  address: string;
  cityCountry: string;
  summary: string;
  linkedIn: string;
  github: string;
  portfolio: string;
}

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

export const emptyCvDraft = (): CvDraft => ({
  id: "current",
  personal: { fullName: "", title: "", email: "", phone: "", address: "", cityCountry: "", summary: "", linkedIn: "", github: "", portfolio: "" },
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
