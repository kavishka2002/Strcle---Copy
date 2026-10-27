"use client";

import {
  Award, ArrowDown, ArrowUp, BookOpen, BriefcaseBusiness, Check, Code2, ContactRound, Download, Eye,
  FilePlus2, FileText, FolderKanban, GraduationCap, HeartHandshake, ImagePlus, Link2, Plus, Printer,
  RotateCcw, Search, Trash2, UserRound, UsersRound, X
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { AppToast } from "@/components/app-toast";
import { useAppDialog } from "@/components/app-dialog";
import { printCurrentPage } from "@/lib/print-page";
import { LocalizedUi } from "@/components/app-language";
import { db } from "@/lib/database";
import {
  cvSectionLabels, emptyCvDraft,
  type CvDraft, type CvEducation, type CvEntry, type CvExamResult, type CvExperience, type CvPersonalDetails, type CvProject, type CvSectionId, type CvTextStyle
} from "@/lib/cv";

const templateCategories = ["All Templates", "Students & Graduates", "IT & Technology", "Healthcare", "Corporate", "Academic & Research", "Creative", "ATS-Friendly"] as const;
type TemplateCategory = typeof templateCategories[number];
const templates: Array<{ id: string; name: string; detail: string; category: Exclude<TemplateCategory, "All Templates">; career: string; layout: string; photo: boolean; ats: boolean }> = [
  { id: "modern-navy", name: "Modern Navy Professional", detail: "Premium navy sidebar, timeline details and a clear career profile.", category: "IT & Technology", career: "IT & professional roles", layout: "Navy two-column", photo: true, ats: false },
  { id: "minimal-professional", name: "Minimal Professional", detail: "Clean single-column structure with restrained navy accents.", category: "ATS-Friendly", career: "Online applications", layout: "Single column", photo: false, ats: true },
  { id: "modern-developer", name: "Modern Developer", detail: "Technical profile, compact skill tags and project links.", category: "IT & Technology", career: "Software & engineering", layout: "Developer sidebar", photo: true, ats: true },
  { id: "elegant-corporate", name: "Elegant Corporate", detail: "Refined typography and structured corporate experience.", category: "Corporate", career: "Office & management", layout: "Corporate single column", photo: true, ats: true },
  { id: "modern-sidebar", name: "Modern Sidebar", detail: "Flexible accent sidebar with an uncluttered career story.", category: "Corporate", career: "Business & professional roles", layout: "Accent sidebar", photo: true, ats: false },
  { id: "premium-minimalist", name: "Premium Minimalist", detail: "Elegant monochrome, silver rules and readable spacing.", category: "Corporate", career: "Experienced professionals", layout: "Editorial single column", photo: true, ats: true },
  { id: "modern", name: "Modern Professional", detail: "Balanced, clear and versatile.", category: "Corporate", career: "All careers", layout: "Single column", photo: true, ats: false },
  { id: "classic", name: "Corporate Classic", detail: "Formal navy and traditional headings.", category: "Corporate", career: "Business & management", layout: "Single column", photo: true, ats: true },
  { id: "developer", name: "IT & Software Developer", detail: "Technical links and skills-forward layout.", category: "IT & Technology", career: "Software & engineering", layout: "Sidebar", photo: true, ats: false },
  { id: "academic", name: "Academic & Research", detail: "Education and research emphasis.", category: "Academic & Research", career: "Research & education", layout: "Single column", photo: true, ats: true },
  { id: "minimal", name: "Elegant Minimal", detail: "Quiet monochrome with generous space.", category: "Corporate", career: "All careers", layout: "Single column", photo: true, ats: true },
  { id: "creative", name: "Creative Professional", detail: "Colourful sidebar and photo placement.", category: "Creative", career: "Design & media", layout: "Colour sidebar", photo: true, ats: false },
  { id: "ats", name: "ATS-Friendly Professional", detail: "A clean, single-column structure for online applications.", category: "ATS-Friendly", career: "Online applications", layout: "Single column", photo: false, ats: true },
  { id: "two-column", name: "Two-Column Modern", detail: "Main career story paired with a compact skills sidebar.", category: "Corporate", career: "Experienced professionals", layout: "Two columns", photo: true, ats: false },
  { id: "executive", name: "Executive Leadership", detail: "Leadership profile with a prominent achievement-led header.", category: "Corporate", career: "Senior leaders", layout: "Executive two-column", photo: true, ats: false },
  { id: "graduate", name: "Fresh Graduate", detail: "Education, projects and achievements take the lead.", category: "Students & Graduates", career: "Students & graduates", layout: "Education-first", photo: true, ats: true },
  { id: "internship", name: "Internship Application", detail: "Compact objective, academic projects and skills.", category: "Students & Graduates", career: "Internships & traineeships", layout: "Compact single column", photo: false, ats: true },
  { id: "healthcare", name: "Healthcare Professional", detail: "Trustworthy clinical and healthcare experience layout.", category: "Healthcare", career: "Healthcare & health IT", layout: "Clinical sidebar", photo: true, ats: false },
  { id: "data-analyst", name: "Data Analyst", detail: "Tools, measurable outcomes and project links up front.", category: "IT & Technology", career: "Analytics & business intelligence", layout: "Analytical two-column", photo: false, ats: true },
  { id: "software-engineer", name: "Software Engineer", detail: "Recruiter-friendly technical profile and project details.", category: "IT & Technology", career: "Software engineering", layout: "Technical single column", photo: false, ats: true },
  { id: "researcher", name: "Academic Researcher", detail: "A spacious, publication-oriented multi-page academic CV.", category: "Academic & Research", career: "Researchers & academics", layout: "Academic long-form", photo: false, ats: true },
  { id: "elegant-sidebar", name: "Elegant Sidebar", detail: "A refined information rail with a flexible main column.", category: "Corporate", career: "Business & professional roles", layout: "Sidebar", photo: true, ats: false },
  { id: "monochrome", name: "Minimalist Black & White", detail: "Ink-saving monochrome with clear typographic hierarchy.", category: "ATS-Friendly", career: "Print & online applications", layout: "Single column", photo: false, ats: true },
  { id: "portfolio", name: "Creative Portfolio", detail: "Selected work, portfolio links and a confident visual profile.", category: "Creative", career: "Design, UI/UX & multimedia", layout: "Portfolio two-column", photo: true, ats: false }
];
const gridTemplateIds = new Set(["developer", "creative", "two-column", "executive", "healthcare", "data-analyst", "elegant-sidebar", "portfolio", "modern-navy", "modern-developer", "modern-sidebar"]);
const sinhalaTemplateSearchTerms: Record<string, string> = {
  "modern-navy": "නවීන නිල් පැති තීරුව වෘත්තීය තාක්ෂණය",
  "minimal-professional": "සරල වෘත්තීය ATS රැකියා අයදුම්පත්",
  "modern-developer": "නවීන සංවර්ධක මෘදුකාංග තාක්ෂණය",
  "elegant-corporate": "අලංකාර ආයතනික කළමනාකරණය",
  "modern-sidebar": "නවීන පැති තීරුව ව්‍යාපාරික වෘත්තීය",
  "premium-minimalist": "ප්‍රිමියම් අවම කළු සුදු වෘත්තීය",
  modern: "නවීන වෘත්තීය ආයතනික සියලු වෘත්තීන්",
  classic: "සම්භාව්‍ය ආයතනික ව්‍යාපාර කළමනාකරණය",
  developer: "තොරතුරු තාක්ෂණ මෘදුකාංග සංවර්ධක",
  academic: "ශාස්ත්‍රීය සහ පර්යේෂණ අධ්‍යාපනය",
  minimal: "සරල සහ අලංකාර ආයතනික",
  creative: "නිර්මාණශීලී වෘත්තීය සැලසුම් සහ මාධ්‍ය",
  ats: "ATS පද්ධති සඳහා වෘත්තීය මාර්ගගත අයදුම්පත්",
  "two-column": "නවීන තීරු දෙක පළපුරුදු වෘත්තිකයන්",
  executive: "විධායක නායකත්වය ජ්‍යෙෂ්ඨ නායකයන්",
  graduate: "නව උපාධිධාරී සිසුන් සහ උපාධිධාරීන්",
  internship: "පුහුණු රැකියා අයදුම්පත ආධුනික රැකියා",
  healthcare: "සෞඛ්‍ය සේවා වෘත්තික සෞඛ්‍ය තාක්ෂණය",
  "data-analyst": "දත්ත විශ්ලේෂක දත්ත විශ්ලේෂණ ව්‍යාපාර බුද්ධි",
  "software-engineer": "මෘදුකාංග ඉංජිනේරු",
  researcher: "ශාස්ත්‍රීය පර්යේෂක පර්යේෂකයන් ශාස්ත්‍රඥයන්",
  "elegant-sidebar": "අලංකාර පැති තීරුව ව්‍යාපාරික වෘත්තීය",
  monochrome: "සරල කළු සහ සුදු ඒකවර්ණ මුද්‍රිත",
  portfolio: "නිර්මාණශීලී කාර්ය එකතුව සැලසුම් UI UX බහුමාධ්‍ය"
};
const templateSectionPriority: Partial<Record<string, CvSectionId[]>> = {
  graduate: ["education", "projects", "skills", "awards", "volunteer", "summary", "experience"],
  internship: ["summary", "education", "projects", "skills", "awards", "experience"],
  healthcare: ["education", "certifications", "training", "experience", "skills", "summary"],
  "data-analyst": ["projects", "skills", "experience", "education", "certifications", "summary"],
  "software-engineer": ["skills", "projects", "experience", "education", "certifications", "summary"],
  executive: ["experience", "awards", "summary", "education", "skills"],
  researcher: ["summary", "education", "publications", "projects", "training", "awards", "experience"]
};

const defaultOrder = Object.keys(cvSectionLabels) as CvSectionId[];
const palettes = ["#397b68", "#24466e", "#6b5b95", "#bb6a54", "#326f8e", "#242b36"];
const uid = () => crypto.randomUUID();
const clean = (value: string) => value.trim();
const cvFontFamilies = ["Inter", "Poppins", "Lato", "Nunito", "Roboto", "Noto Sans Sinhala", "Noto Serif Sinhala"];
const examSubjectGroups: Record<"olResults" | "alResults", Array<{ label: string; subjects: string[] }>> = {
  olResults: [
    { label: "Religion", subjects: ["Buddhism", "Catholicism", "Christianity", "Hinduism", "Islam"] },
    { label: "Languages", subjects: ["Sinhala Language", "Tamil Language", "English", "Sinhala Literature", "Tamil Literature", "English Literature"] },
    { label: "Core subjects", subjects: ["Mathematics", "Science", "History"] },
    { label: "Other subjects", subjects: ["Geography", "Civic Education", "Business & Accounting Studies", "Entrepreneurship Studies", "Information & Communication Technology (ICT)", "Agriculture & Food Technology", "Health & Physical Education", "Art", "Dancing", "Music", "Drama & Theatre", "Home Economics", "Design & Technology"] }
  ],
  alResults: [
    { label: "Biological Science", subjects: ["Biology", "Chemistry", "Physics", "Agricultural Science"] },
    { label: "Physical Science / Mathematics", subjects: ["Combined Mathematics", "Physics", "Chemistry", "Information & Communication Technology (ICT)"] },
    { label: "Commerce", subjects: ["Accounting", "Business Studies", "Economics", "Business Statistics"] },
    { label: "Arts", subjects: ["Sinhala", "Tamil", "English", "Buddhist Civilization", "Hindu Civilization", "Islamic Civilization", "Christian Civilization", "Geography", "Political Science", "Logic & Scientific Method", "History", "Communication & Media Studies", "Home Economics", "Art", "Dancing", "Music", "Drama & Theatre"] },
    { label: "Technology", subjects: ["Science for Technology", "Engineering Technology", "Bio Systems Technology", "Information & Communication Technology (ICT)", "Agricultural Science"] },
    { label: "Other", subjects: ["General English", "Common General Test"] }
  ]
};
const customExamSubject = "__other__";

function ExamSubjectField({ collection, id, subject, onChange }: {
  collection: "olResults" | "alResults";
  id: string;
  subject: string;
  onChange: (value: string) => void;
}) {
  const subjects = examSubjectGroups[collection].flatMap(group => group.subjects);
  const [custom, setCustom] = useState(() => Boolean(subject) && !subjects.includes(subject));
  const value = custom ? customExamSubject : subject;
  return <div className="cv-field">
    <label htmlFor={`${collection}-${id}-subject`}>Subject</label>
    <select
      id={`${collection}-${id}-subject`}
      className="cv-input"
      value={value}
      onChange={event => {
        if (event.target.value === customExamSubject) {
          setCustom(true);
          if (!custom) onChange("");
          return;
        }
        setCustom(false);
        onChange(event.target.value);
      }}
    >
      <option value="">Select a subject</option>
      {examSubjectGroups[collection].map(group => <optgroup label={group.label} key={group.label}>
        {group.subjects.map(option => <option value={option} key={option}>{option}</option>)}
      </optgroup>)}
      <option value={customExamSubject}>Other (enter a subject)</option>
    </select>
    {custom && <input
      className="cv-input"
      aria-label="Enter a custom subject"
      value={subject}
      onChange={event => onChange(event.target.value)}
      placeholder="Type the subject name"
    />}
  </div>;
}

function textCss(style?: CvTextStyle): React.CSSProperties {
  return {
    ...(style?.fontFamily ? { fontFamily: `"${style.fontFamily}", "Noto Sans Sinhala", sans-serif` } : {}),
    ...(style?.fontSizePt ? { fontSize: `${style.fontSizePt}pt` } : {}),
    ...(style?.fontWeight ? { fontWeight: style.fontWeight } : {}),
    ...(style?.italic ? { fontStyle: "italic" } : {}),
    ...(style?.underline ? { textDecoration: "underline" } : {}),
    ...(style?.color ? { color: style.color } : {}),
    ...(style?.align ? { textAlign: style.align } : {}),
    ...(style?.lineHeight ? { lineHeight: style.lineHeight } : {}),
    ...(style?.letterSpacingPt !== undefined ? { letterSpacing: `${style.letterSpacingPt}pt` } : {}),
    ...(style?.widthPercent ? { width: `${style.widthPercent}%` } : {}),
    ...(style?.marginTopPt !== undefined ? { marginTop: `${style.marginTopPt}pt` } : {}),
    ...(style?.marginBottomPt !== undefined ? { marginBottom: `${style.marginBottomPt}pt` } : {}),
    ...(style?.paddingPt !== undefined ? { padding: `${style.paddingPt}pt` } : {}),
    ...(style?.indentPt !== undefined ? { textIndent: `${style.indentPt}pt` } : {}),
    ...(style?.backgroundColor ? { backgroundColor: style.backgroundColor } : {}),
    ...(style?.borderColor && style.borderWidthPt ? { border: `${style.borderWidthPt}pt solid ${style.borderColor}` } : {}),
    ...(style?.borderRadiusPt ? { borderRadius: `${style.borderRadiusPt}pt` } : {}),
    ...(style?.wrap === false ? { whiteSpace: "nowrap" } : { overflowWrap: "break-word", wordBreak: "normal" })
  };
}

function CvEditableText({ id, label, value, style, extraStyle, icon, selected, onSelect, as = "span", block = false }: {
  id: string; label: string; value: string; style?: CvTextStyle; selected: boolean;
  extraStyle?: React.CSSProperties; icon?: ReactNode; onSelect: (id: string, label: string) => void;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "b" | "div"; block?: boolean;
}) {
  const Tag = as;
  return <Tag
    className={`cv-editable-text ${block ? "cv-editable-block" : ""} ${selected ? "is-selected" : ""}`}
    data-cv-text-id={id}
    title="Select to edit text and style"
    role="button"
    tabIndex={0}
    aria-label={label}
    onClick={() => onSelect(id, label)}
    onKeyDown={event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(id, label);
      }
    }}
    style={{ ...textCss(style), ...extraStyle }}
  >{icon}{value}</Tag>;
}

function hasEducation(item: CvEducation): boolean {
  return Boolean(item.qualification || item.institution || item.startYear || item.endYear || item.grade || item.description);
}
function hasExperience(item: CvExperience): boolean {
  return Boolean(item.title || item.company || item.startDate || item.endDate || item.details);
}
function hasProject(item: CvProject): boolean {
  return Boolean(item.name || item.description || item.technologies || item.url || item.githubUrl);
}
function hasEntry(item: CvEntry): boolean {
  return Boolean(item.title || item.organization || item.date || item.description);
}

function Field({ label, value, onChange, placeholder, type = "text", required = false, error, multiline = false }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string;
  type?: string; required?: boolean; error?: string; multiline?: boolean;
}) {
  const common = {
    className: "cv-input",
    value: value ?? "",
    placeholder,
    "aria-invalid": Boolean(error),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value)
  };
  return <label className="cv-field"><span>{label}{required && <b className="cv-required"> *</b>}</span>
    {multiline ? <textarea {...common} rows={4}/> : <input {...common} type={type}/>}
    {error && <small className="cv-field-error" role="alert">{error}</small>}
  </label>;
}

function SectionPanel({ title, description, icon, children }: { title: string; description?: string; icon: ReactNode; children: ReactNode }) {
  return <section className="cv-form-panel"><div className="cv-panel-title"><span className="cv-panel-icon">{icon}</span><div><h2>{title}</h2>{description && <p>{description}</p>}</div></div>{children}</section>;
}

function CvDocument({ draft, photoUrl, selectedTextId, onSelectText }: {
  draft: CvDraft; photoUrl: string | null; selectedTextId: string | null; onSelectText: (id: string, label: string) => void;
}) {
  const { personal } = draft;
  const template = templates.find(item => item.id === draft.templateId) ?? templates[0];
  const showSection = (id: CvSectionId) => draft.enabledSections.includes(id);
  const entries = (id: "certifications" | "training" | "publications" | "volunteer" | "awards" | "references") => draft[id].filter(hasEntry);
  const text = (id: string, label: string, value: string, as: "span" | "h1" | "h2" | "h3" | "p" | "b" | "div" = "span", block = false, extraStyle?: React.CSSProperties, icon?: ReactNode) =>
    <CvEditableText id={id} label={label} value={value} as={as} block={block} selected={selectedTextId === id} onSelect={onSelectText} style={draft.textStyles[id]} extraStyle={extraStyle} icon={icon}/>;
  const photo = template.photo && draft.headerLayout.photoVisible && photoUrl
    ? <Image
      className={`cv-profile-photo ${draft.photoStyle}`}
      src={photoUrl}
      alt="Profile"
      width={Math.round((draft.photoStyle === "circle" ? Math.min(draft.headerLayout.photoWidthMm, draft.headerLayout.photoHeightMm) : draft.headerLayout.photoWidthMm) * 4)}
      height={Math.round((draft.photoStyle === "circle" ? Math.min(draft.headerLayout.photoWidthMm, draft.headerLayout.photoHeightMm) : draft.headerLayout.photoHeightMm) * 4)}
      unoptimized
      style={{ width: `${draft.photoStyle === "circle" ? Math.min(draft.headerLayout.photoWidthMm, draft.headerLayout.photoHeightMm) : draft.headerLayout.photoWidthMm}mm`, height: `${draft.photoStyle === "circle" ? Math.min(draft.headerLayout.photoWidthMm, draft.headerLayout.photoHeightMm) : draft.headerLayout.photoHeightMm}mm`, objectFit: "cover", objectPosition: draft.headerLayout.photoObjectPosition }}
    />
    : null;
  const hasContent = (id: CvSectionId) => {
    if (!showSection(id)) return false;
    switch (id) {
      case "summary": return Boolean(clean(personal.summary));
      case "education": return draft.education.some(hasEducation);
      case "experience": return draft.experience.some(hasExperience);
      case "projects": return draft.projects.some(hasProject);
      case "skills": return Boolean(draft.technicalSkills.length || draft.softSkills.length || draft.languages.length);
      default: return entries(id).length > 0;
    }
  };
  const section = (id: CvSectionId) => {
    if (!hasContent(id)) return null;
    const title = draft.sectionTitles[id] ?? cvSectionLabels[id];
    const SectionIcon = id === "experience" ? BriefcaseBusiness
      : id === "education" ? GraduationCap
        : id === "projects" ? FolderKanban
          : id === "skills" ? Code2
            : id === "publications" ? BookOpen
              : id === "volunteer" ? HeartHandshake
                : id === "references" ? UsersRound
                  : id === "certifications" || id === "training" || id === "awards" ? Award
                    : FileText;
    return <section className={`cv-document-section cv-document-${id}`} key={id}>
      {text(`section:${id}:title`, `${title} heading`, title, "h2", true, undefined, <SectionIcon aria-hidden="true" size={12}/>)}
      {id === "summary" && <p className="cv-document-paragraph">{text("personal.summary", "Professional summary", personal.summary, "span", true)}</p>}
      {id === "education" && <div className="cv-item-list">{draft.education.filter(hasEducation).map(item => <article className="cv-document-item" key={item.id}>
        <div className="cv-item-heading">{text(`education:${item.id}:qualification`, "Education qualification", item.qualification, "b")}<span>{text(`education:${item.id}:startYear`, "Education start year", item.startYear)}{item.startYear && item.endYear ? " – " : ""}{text(`education:${item.id}:endYear`, "Education end year", item.endYear === "present" ? "Present" : item.endYear)}</span></div>
        {item.institution && <div className="cv-item-subtitle">{text(`education:${item.id}:institution`, "Institution", item.institution, "span", true)}</div>}
        {item.grade && <div className="cv-item-meta">{text(`education:${item.id}:grade`, "Grade or GPA", item.grade)}</div>}
        {item.description && <p className="cv-document-paragraph">{text(`education:${item.id}:description`, "Education description", item.description, "span", true)}</p>}
      </article>)}
      {(["olResults", "alResults"] as const).map((collection, index) => {
        const results = draft[collection].filter(item => item.subject.trim() || item.result.trim());
        if (!results.length) return null;
        const year = index === 0 ? draft.olExamYear : draft.alExamYear;
        const indexNumber = index === 0 ? draft.olIndexNumber : draft.alIndexNumber;
        return <div className="cv-exam-results" key={collection}>
          <h3>{index === 0 ? "G.C.E. O/L Results" : "G.C.E. A/L Results"}</h3>
          {(year || indexNumber) && <p className="cv-exam-meta">{year && <span>{year}</span>}{indexNumber && <span>Index No. {indexNumber}</span>}</p>}
          <div className="cv-exam-result-list">{results.map(item => <div className="cv-exam-result" key={item.id}>
            <span>{text(`exam:${collection}:${item.id}:subject`, "Exam subject", item.subject, "span", true)}</span>
            <b>{text(`exam:${collection}:${item.id}:result`, "Exam result", item.result, "span", true)}</b>
          </div>)}</div>
        </div>;
      })}</div>}
      {id === "experience" && <div className="cv-item-list">{draft.experience.filter(hasExperience).map(item => <article className="cv-document-item" key={item.id}>
        <div className="cv-item-heading">{text(`experience:${item.id}:title`, "Job title", item.title, "b")}<span>{text(`experience:${item.id}:startDate`, "Experience start date", item.startDate)}{(item.startDate && (item.current || item.endDate)) ? " – " : ""}{text(`experience:${item.id}:endDate`, "Experience end date", item.current ? "Present" : item.endDate)}</span></div>
        {item.company && <div className="cv-item-subtitle">{text(`experience:${item.id}:company`, "Company", item.company, "span", true)}</div>}
        {item.details && <p className="cv-document-paragraph">{text(`experience:${item.id}:details`, "Responsibilities and achievements", item.details, "span", true)}</p>}
      </article>)}</div>}
      {id === "projects" && <div className="cv-item-list">{draft.projects.filter(hasProject).map(item => <article className="cv-document-item" key={item.id}>
        <div className="cv-item-heading">{text(`project:${item.id}:name`, "Project name", item.name, "b")}</div>
        {item.description && <p className="cv-document-paragraph">{text(`project:${item.id}:description`, "Project description", item.description, "span", true)}</p>}
        {item.technologies && <div className="cv-item-meta"><b>Technologies:</b> {text(`project:${item.id}:technologies`, "Project technologies", item.technologies)}</div>}
        {item.url && <div className="cv-item-links">{text(`project:${item.id}:url`, "Project URL", item.url)}</div>}
        {item.githubUrl && <div className="cv-item-links">{text(`project:${item.id}:githubUrl`, "GitHub URL", item.githubUrl)}</div>}
      </article>)}</div>}
      {id === "skills" && <div className="cv-skill-groups">
        {draft.technicalSkills.length > 0 && <SkillLine title="Technical" collection="technicalSkills" skills={draft.technicalSkills} ids={draft.skillIds.technicalSkills} text={text}/>}
        {draft.softSkills.length > 0 && <SkillLine title="Soft skills" collection="softSkills" skills={draft.softSkills} ids={draft.skillIds.softSkills} text={text}/>}
        {draft.languages.length > 0 && <SkillLine title="Languages" collection="languages" skills={draft.languages} ids={draft.skillIds.languages} text={text}/>}
      </div>}
      {["certifications", "training", "publications", "volunteer", "awards", "references"].includes(id)
        && <div className="cv-item-list">{entries(id as "certifications" | "training" | "publications" | "volunteer" | "awards" | "references").map(item => <article className="cv-document-item" key={item.id}>
          <div className="cv-item-heading">{text(`entry:${id}:${item.id}:title`, `${title} title`, item.title, "b")}{text(`entry:${id}:${item.id}:date`, `${title} date`, item.date)}</div>
          {item.organization && <div className="cv-item-subtitle">{text(`entry:${id}:${item.id}:organization`, `${title} organization`, item.organization, "span", true)}</div>}
          {item.description && <p className="cv-document-paragraph">{text(`entry:${id}:${item.id}:description`, `${title} details`, item.description, "span", true)}</p>}
        </article>)}</div>}
    </section>;
  };
  const orderedSections = draft.sectionOrder.filter((id, index, list) => defaultOrder.includes(id) && list.indexOf(id) === index).concat(defaultOrder.filter(id => !draft.sectionOrder.includes(id)));
  const preferredSections = templateSectionPriority[draft.templateId];
  const documentSectionOrder = preferredSections && orderedSections.every((id, index) => id === defaultOrder[index])
    ? [...orderedSections].sort((left, right) => {
      const leftIndex = preferredSections.indexOf(left);
      const rightIndex = preferredSections.indexOf(right);
      return (leftIndex < 0 ? preferredSections.length : leftIndex) - (rightIndex < 0 ? preferredSections.length : rightIndex);
    })
    : orderedSections;
  const sidebarSectionIds: CvSectionId[] = gridTemplateIds.has(draft.templateId) ? ["skills"] : [];
  const sidebarSections = documentSectionOrder.filter(id => sidebarSectionIds.includes(id)).map(section);
  const mainSections = documentSectionOrder.filter(id => !sidebarSectionIds.includes(id)).map(section);
  const customSections = draft.customBlocks.filter(block => block.title.trim() || block.body.trim()).map(block => <section className="cv-document-section cv-document-custom" key={block.id}>
    {text(`custom:${block.id}:title`, "Custom section heading", block.title, "h2", true)}
    {text(`custom:${block.id}:body`, "Custom text block", block.body, "p", true)}
  </section>);
  const contacts = [
    personal.email && ["Email", personal.email, "email"],
    personal.phone && ["Phone", personal.phone, "phone"],
    personal.address && ["Address", personal.address, "address"],
    personal.cityCountry && ["Location", personal.cityCountry, "cityCountry"]
  ].filter((item): item is [string, string, string] => Boolean(item?.[0] && item[1]));
  const social = [[personal.linkedIn, "LinkedIn", "linkedIn"], [personal.github, "GitHub", "github"], [personal.portfolio, "Portfolio", "portfolio"]].filter((item): item is [string, string, string] => Boolean(item[0]));
  const nameStyle = draft.textStyles["personal.fullName"];
  const nameBaseSize = nameStyle?.fontSizePt ?? (gridTemplateIds.has(draft.templateId) ? 22 : 25);
  const [fitName, setFitName] = useState<{ size: number; wrap: boolean } | null>(null);
  const headerCopyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!draft.headerLayout.nameFitToOneLine) {
      setFitName(null);
      return;
    }
    let active = true;
    const measure = () => {
      const container = headerCopyRef.current;
      const nameElement = container?.querySelector<HTMLElement>('[data-cv-text-id="personal.fullName"]');
      if (!container || !nameElement) return;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;
      const family = nameStyle?.fontFamily ?? draft.fontFamily;
      const weight = nameStyle?.fontWeight ?? 700;
      const availableWidth = Math.max(1, container.clientWidth * (nameStyle?.widthPercent ?? draft.headerLayout.nameWidthPercent) / 100);
      const basePx = nameBaseSize * 4 / 3;
      context.font = `${weight} ${basePx}px "${family}", "Noto Sans Sinhala", sans-serif`;
      const actualWidth = context.measureText(personal.fullName || "Your Name").width;
      const minimumSize = Math.min(nameBaseSize, 10);
      const size = actualWidth <= availableWidth ? nameBaseSize : Math.max(minimumSize, nameBaseSize * availableWidth / actualWidth);
      if (active) setFitName({ size, wrap: size <= minimumSize && actualWidth > availableWidth });
    };
    void document.fonts.load(`700 ${nameBaseSize * 4 / 3}px "${nameStyle?.fontFamily ?? draft.fontFamily}"`).then(() => requestAnimationFrame(measure));
    return () => { active = false; };
  }, [draft.fontFamily, draft.headerLayout.nameFitToOneLine, draft.headerLayout.nameWidthPercent, nameBaseSize, nameStyle?.fontFamily, nameStyle?.fontWeight, nameStyle?.widthPercent, personal.fullName]);

  const nameCss = {
    ...textCss(nameStyle),
    width: `${nameStyle?.widthPercent ?? draft.headerLayout.nameWidthPercent}%`,
    marginBottom: `${draft.headerLayout.titleGapPt}pt`,
    ...(draft.headerLayout.nameFitToOneLine && fitName
      ? { whiteSpace: fitName.wrap ? "normal" as const : "nowrap" as const, fontSize: `${fitName.size}pt` }
      : { whiteSpace: nameStyle?.wrap === false ? "nowrap" as const : "normal" as const })
  };

  return <article className={`cv-page cv-template-${draft.templateId}`} style={{ "--cv-accent": draft.accentColor, "--cv-font": `"${draft.fontFamily}", "Noto Sans Sinhala", sans-serif`, "--cv-font-size": `${draft.fontSize}pt` } as React.CSSProperties}>
    {gridTemplateIds.has(draft.templateId) ? <div className="cv-document-grid">
      <aside className="cv-document-sidebar">
        {draft.headerLayout.photoSide === "left" && photo}
        {contacts.length > 0 && <section className="cv-side-block"><h2><ContactRound aria-hidden="true" size={12}/> Contact</h2>{contacts.map(([label, value, key]) => <p key={label}><b>{label}</b>{text(`personal.${key}`, label, value, "span", true)}</p>)}</section>}
        {social.length > 0 && <section className="cv-side-block"><h2><Link2 aria-hidden="true" size={12}/> Links</h2>{social.map(([url, label, key]) => <p key={label}><b>{label}</b>{text(`personal.${key}`, `${label} link`, url, "span", true)}</p>)}</section>}
        {sidebarSections}
      </aside>
      <div className="cv-document-main">
        <header className={`cv-document-header cv-custom-header photo-${draft.headerLayout.photoSide}`} style={{ gap: `${draft.headerLayout.photoGapMm}mm`, flexDirection: draft.headerLayout.photoSide === "top" ? "column" : "row" }}>
          {draft.headerLayout.photoSide === "top" && photo}
          <div className="cv-header-copy" ref={headerCopyRef}>
            {text("personal.fullName", "Full name", personal.fullName || "Your Name", "h1", true, nameCss)}
            {personal.title && text("personal.title", "Professional title", personal.title, "p", true)}
          </div>
          {draft.headerLayout.photoSide === "right" && photo}
        </header>
        {["developer", "software-engineer", "data-analyst"].includes(draft.templateId) && <span className="cv-template-label">PROFILE</span>}
        {mainSections}{customSections}
      </div>
    </div> : <>
      <header className={`cv-document-header cv-custom-header photo-${draft.headerLayout.photoSide}`} style={{ gap: `${draft.headerLayout.photoGapMm}mm` }}>
        {draft.headerLayout.photoSide === "top" && photo}
        {draft.headerLayout.photoSide === "left" && photo}
        <div className="cv-header-copy" ref={headerCopyRef}>
          {text("personal.fullName", "Full name", personal.fullName || "Your Name", "h1", true, nameCss)}
          {personal.title && text("personal.title", "Professional title", personal.title, "p", true)}
          {contacts.length > 0 && <div className="cv-contact-line">{contacts.map(([label, value, key]) => <span key={label}><b>{label}: </b>{text(`personal.${key}`, label, value)}</span>)}</div>}
          {social.length > 0 && <div className="cv-contact-line cv-social-line">{social.map(([url, label, key]) => <span key={label}><b>{label}: </b>{text(`personal.${key}`, `${label} link`, url)}</span>)}</div>}
        </div>
        {draft.headerLayout.photoSide === "right" && photo}
      </header>
      <div className="cv-document-body">{documentSectionOrder.map(section)}{customSections}</div>
    </>}
    <footer className="cv-document-footer">{personal.cityCountry && <span>{personal.cityCountry}</span>}</footer>
  </article>;
}

function SkillLine({ title, collection, skills, ids, text }: {
  title: string; collection: "technicalSkills" | "softSkills" | "languages"; skills: string[]; ids: string[];
  text: (id: string, label: string, value: string, as?: "span" | "h1" | "h2" | "h3" | "p" | "b" | "div", block?: boolean) => ReactNode;
}) {
  return <p className="cv-skill-line"><b>{title}:</b> {skills.map((skill, index) => <span key={`${collection}-${index}`}>
    {index > 0 && " · "}{text(`skill:${collection}:${ids[index]}`, `${title} skill`, skill)}
  </span>)}</p>;
}

const personalTextKeys: readonly (keyof CvPersonalDetails)[] = [
  "fullName", "title", "email", "phone", "address", "cityCountry", "summary", "linkedIn", "github", "portfolio"
];
const entryCollections = ["certifications", "training", "publications", "volunteer", "awards", "references"] as const;
type EntryCollection = (typeof entryCollections)[number];

function selectedTextValue(draft: CvDraft, id: string): string {
  const parts = id.split(":");
  if (parts[0] === "personal" && personalTextKeys.includes(parts[1] as keyof CvPersonalDetails)) {
    return draft.personal[parts[1] as keyof CvPersonalDetails];
  }
  if (parts[0] === "section") return draft.sectionTitles[parts[1] as CvSectionId] ?? cvSectionLabels[parts[1] as CvSectionId] ?? "";
  if (parts[0] === "education") {
    const item = draft.education.find(record => record.id === parts[1]);
    const key = parts[2] as keyof CvEducation;
    return item && typeof item[key] === "string" ? item[key] : "";
  }
  if (parts[0] === "experience") {
    const item = draft.experience.find(record => record.id === parts[1]);
    const key = parts[2] as keyof CvExperience;
    return item && typeof item[key] === "string" ? item[key] : "";
  }
  if (parts[0] === "project") {
    const item = draft.projects.find(record => record.id === parts[1]);
    const key = parts[2] as keyof CvProject;
    return item && typeof item[key] === "string" ? item[key] : "";
  }
  if (parts[0] === "entry" && entryCollections.includes(parts[1] as EntryCollection)) {
    const item = draft[parts[1] as EntryCollection].find(record => record.id === parts[2]);
    const key = parts[3] as keyof CvEntry;
    return item && typeof item[key] === "string" ? item[key] : "";
  }
  if (parts[0] === "skill") {
    const collection = parts[1] as "technicalSkills" | "softSkills" | "languages";
    const index = draft.skillIds[collection]?.indexOf(parts[2]) ?? -1;
    return index >= 0 ? draft[collection]?.[index] ?? "" : "";
  }
  if (parts[0] === "custom") {
    const item = draft.customBlocks.find(block => block.id === parts[1]);
    return item && (parts[2] === "title" || parts[2] === "body") ? item[parts[2]] : "";
  }
  return "";
}

function defaultTextSize(draft: CvDraft, id: string): number {
  if (id === "personal.fullName") return gridTemplateIds.has(draft.templateId) ? 22 : 25;
  if (id === "personal.title") return 13;
  if (id.startsWith("section:") || id.startsWith("custom:") && id.endsWith(":title")) return 10.5;
  if (id.startsWith("project:") || id.startsWith("education:") || id.startsWith("experience:") || id.startsWith("entry:")) return 9.5;
  return draft.fontSize;
}

function defaultTextWeight(id: string): CvTextStyle["fontWeight"] {
  return id === "personal.fullName" || id.startsWith("section:") || id.startsWith("custom:") && id.endsWith(":title") ? 700 : 400;
}

export function CvBuilder() {
  const { confirm, host: dialogHost } = useAppDialog();
  const [draft, setDraft] = useState<CvDraft>(emptyCvDraft);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [validation, setValidation] = useState<Record<string, string>>({});
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>("All Templates");
  const [templateSearch, setTemplateSearch] = useState("");
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedTextLabel, setSelectedTextLabel] = useState("");
  const [styleMode, setStyleMode] = useState<"basic" | "advanced">("basic");
  const photoInput = useRef<HTMLInputElement>(null);
  const skillInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [skillDrafts, setSkillDrafts] = useState<Record<string, string>>({ technicalSkills: "", softSkills: "", languages: "" });
  const fontFamilies = [...new Set([draft.fontFamily, ...Object.values(draft.textStyles).map(style => style.fontFamily).filter((family): family is string => Boolean(family))])];
  const fontKey = fontFamilies.join("|");
  const [loadedFontKey, setLoadedFontKey] = useState("");
  const fontReady = loadedFontKey === fontKey;
  const filteredTemplates = useMemo(() => {
    const query = templateSearch.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    return templates.filter(template =>
      (templateCategory === "All Templates" || template.category === templateCategory)
      && (!query || [template.name, template.detail, template.category, template.career, template.layout, sinhalaTemplateSearchTerms[template.id] ?? ""].some(value => value.toLocaleLowerCase().includes(query)))
    );
  }, [templateCategory, templateSearch]);

  useEffect(() => {
    let active = true;
    void db.getCvDraft().then(saved => {
      if (!active) return;
      if (saved) {
        const baseline = emptyCvDraft();
        setDraft({
          ...baseline,
          ...saved,
          personal: { ...baseline.personal, ...saved.personal },
          olResults: saved.olResults ?? baseline.olResults,
          alResults: saved.alResults ?? baseline.alResults,
          olExamYear: saved.olExamYear ?? baseline.olExamYear,
          olIndexNumber: saved.olIndexNumber ?? baseline.olIndexNumber,
          alExamYear: saved.alExamYear ?? baseline.alExamYear,
          alIndexNumber: saved.alIndexNumber ?? baseline.alIndexNumber,
          customBlocks: saved.customBlocks ?? baseline.customBlocks,
          skillIds: {
            technicalSkills: saved.skillIds?.technicalSkills?.length === saved.technicalSkills?.length ? saved.skillIds.technicalSkills : (saved.technicalSkills ?? []).map(() => uid()),
            softSkills: saved.skillIds?.softSkills?.length === saved.softSkills?.length ? saved.skillIds.softSkills : (saved.softSkills ?? []).map(() => uid()),
            languages: saved.skillIds?.languages?.length === saved.languages?.length ? saved.skillIds.languages : (saved.languages ?? []).map(() => uid())
          },
          sectionTitles: saved.sectionTitles ?? baseline.sectionTitles,
          textStyles: saved.textStyles ?? baseline.textStyles,
          headerLayout: { ...baseline.headerLayout, ...saved.headerLayout },
          enabledSections: saved.enabledSections ?? baseline.enabledSections,
          sectionOrder: saved.sectionOrder ?? baseline.sectionOrder
        });
      }
      setReady(true);
    }).catch(cause => {
      if (!active) return;
      setError(cause instanceof Error ? cause.message : "Could not load your saved CV draft.");
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timeout = window.setTimeout(() => {
      setSaving(true);
      void db.putCvDraft(draft).then(() => setSaving(false)).catch(cause => {
        setSaving(false);
        setError(cause instanceof Error ? cause.message : "Could not save your CV draft locally.");
      });
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [draft, ready]);

  const photoUrl = useMemo(() => draft.photo ? URL.createObjectURL(draft.photo) : null, [draft.photo]);
  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  useEffect(() => {
    let active = true;
    void Promise.all([
      ...fontKey.split("|").filter(Boolean).map(family => document.fonts.load(`400 14px "${family}"`)),
      document.fonts.load('400 14px "Noto Sans Sinhala"')
    ]).then(() => { if (active) setLoadedFontKey(fontKey); }).catch(cause => {
      console.error("Could not load CV fonts.", cause);
      if (active) setLoadedFontKey(fontKey);
    });
    return () => { active = false; };
  }, [fontKey]);

  const updatePersonal = (key: keyof CvDraft["personal"], value: string) => setDraft(previous => ({ ...previous, personal: { ...previous.personal, [key]: value } }));
  const updateRecord = <T extends { id: string }, K extends keyof T>(collection: keyof Pick<CvDraft, "education" | "olResults" | "alResults" | "experience" | "projects" | "certifications" | "training" | "publications" | "volunteer" | "awards" | "references">, id: string, key: K, value: T[K]) => {
    setDraft(previous => ({
      ...previous,
      [collection]: previous[collection].map(item => item.id === id ? { ...item, [key]: value } : item)
    }));
  };
  const updateText = (id: string, value: string) => {
    const parts = id.split(":");
    if (parts[0] === "personal" && personalTextKeys.includes(parts[1] as keyof CvDraft["personal"])) {
      updatePersonal(parts[1] as keyof CvDraft["personal"], value);
    } else if (parts[0] === "section" && parts[2] === "title") {
      const sectionId = parts[1] as CvSectionId;
      if (defaultOrder.includes(sectionId)) setDraft(previous => ({ ...previous, sectionTitles: { ...previous.sectionTitles, [sectionId]: value } }));
    } else if (parts[0] === "education") {
      const fields: readonly (keyof CvEducation)[] = ["qualification", "institution", "startYear", "endYear", "grade", "description"];
      const key = parts[2] as keyof CvEducation;
      if (fields.includes(key)) updateRecord<CvEducation, keyof CvEducation>("education", parts[1], key, value);
    } else if (parts[0] === "exam" && (parts[1] === "olResults" || parts[1] === "alResults")) {
      const fields: readonly (keyof CvExamResult)[] = ["subject", "result"];
      const key = parts[3] as keyof CvExamResult;
      if (fields.includes(key)) updateRecord<CvExamResult, keyof CvExamResult>(parts[1], parts[2], key, value);
    } else if (parts[0] === "experience") {
      const fields: readonly (keyof CvExperience)[] = ["title", "company", "startDate", "endDate", "details"];
      const key = parts[2] as keyof CvExperience;
      if (fields.includes(key)) updateRecord<CvExperience, keyof CvExperience>("experience", parts[1], key, value);
    } else if (parts[0] === "project") {
      const fields: readonly (keyof CvProject)[] = ["name", "description", "technologies", "url", "githubUrl"];
      const key = parts[2] as keyof CvProject;
      if (fields.includes(key)) updateRecord<CvProject, keyof CvProject>("projects", parts[1], key, value);
    } else if (parts[0] === "entry" && entryCollections.includes(parts[1] as EntryCollection)) {
      const fields: readonly (keyof CvEntry)[] = ["title", "organization", "date", "description"];
      const key = parts[3] as keyof CvEntry;
      if (fields.includes(key)) updateRecord<CvEntry, keyof CvEntry>(parts[1] as EntryCollection, parts[2], key, value);
    } else if (parts[0] === "skill" && ["technicalSkills", "softSkills", "languages"].includes(parts[1])) {
      const collection = parts[1] as "technicalSkills" | "softSkills" | "languages";
      setDraft(previous => {
        const index = previous.skillIds[collection].indexOf(parts[2]);
        if (index < 0) return previous;
        return { ...previous, [collection]: previous[collection].map((skill, itemIndex) => itemIndex === index ? value : skill) };
      });
    } else if (parts[0] === "custom") {
      const field = parts[2];
      if (field === "title" || field === "body") {
        setDraft(previous => ({ ...previous, customBlocks: previous.customBlocks.map(block => block.id === parts[1] ? { ...block, [field]: value } : block) }));
      }
    }
  };
  const updateTextStyle = <K extends keyof CvTextStyle>(key: K, value: CvTextStyle[K]) => {
    if (!selectedTextId) return;
    setDraft(previous => ({ ...previous, textStyles: { ...previous.textStyles, [selectedTextId]: { ...previous.textStyles[selectedTextId], [key]: value } } }));
  };
  const removeRecord = (collection: "education" | "olResults" | "alResults" | "experience" | "projects" | "certifications" | "training" | "publications" | "volunteer" | "awards" | "references", id: string) => {
    setDraft(previous => ({ ...previous, [collection]: previous[collection].filter(item => item.id !== id) }));
    if (selectedTextId?.startsWith(`${collection === "projects" ? "project" : collection === "education" || collection === "experience" ? collection : collection === "olResults" || collection === "alResults" ? `exam:${collection}` : `entry:${collection}`}:${id}:`)) setSelectedTextId(null);
  };
  const addSkill = (collection: "technicalSkills" | "softSkills" | "languages", event?: FormEvent) => {
    event?.preventDefault();
    const value = clean(skillDrafts[collection] ?? "");
    if (!value) return;
    setDraft(previous => previous[collection].includes(value) ? previous : {
      ...previous,
      [collection]: [...previous[collection], value],
      skillIds: { ...previous.skillIds, [collection]: [...previous.skillIds[collection], uid()] }
    });
    setSkillDrafts(previous => ({ ...previous, [collection]: "" }));
    skillInputRefs.current[collection]?.focus();
  };
  const removeSkill = (collection: "technicalSkills" | "softSkills" | "languages", skill: string) => setDraft(previous => {
    const index = previous[collection].indexOf(skill);
    if (index < 0) return previous;
    const skillId = previous.skillIds[collection][index];
    if (selectedTextId === `skill:${collection}:${skillId}`) setSelectedTextId(null);
    return {
      ...previous,
      [collection]: previous[collection].filter((_, itemIndex) => itemIndex !== index),
      skillIds: { ...previous.skillIds, [collection]: previous.skillIds[collection].filter((_, itemIndex) => itemIndex !== index) }
    };
  });
  const onPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Photo must be 8 MB or smaller.");
      return;
    }
    setDraft(previous => ({ ...previous, photo: file }));
    setError("");
  };
  const validate = () => {
    const next: Record<string, string> = {};
    if (!clean(draft.personal.fullName)) next.fullName = "Please enter your full name.";
    if (draft.personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.personal.email)) next.email = "Enter a valid email address.";
    if (draft.personal.phone && !/^[+()\d\s.-]{7,25}$/.test(draft.personal.phone)) next.phone = "Enter a valid phone number.";
    setValidation(next);
    return Object.keys(next).length === 0;
  };
  const preparePrint = async () => {
    if (!validate()) {
      setMobileTab("form");
      setError("Please correct the highlighted fields before creating your CV.");
      return;
    }
    try {
      await document.fonts.ready;
      if (photoUrl) {
        const image = document.querySelector<HTMLImageElement>(".cv-print-root .cv-profile-photo");
        await image?.decode();
      }
      document.documentElement.classList.add("cv-print-mode");
      const result = await printCurrentPage();
      if (result.status === "browser") setNotice("Select your printer in the print dialog and choose Print.");
      else if (result.status === "previewed") setNotice("Print preview opened. Choose your printer and select Print.");
      else if (result.status === "printed") setNotice(`Print job sent to ${result.printerName}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not prepare the CV for print or PDF.");
    } finally {
      window.setTimeout(() => document.documentElement.classList.remove("cv-print-mode"), 500);
    }
  };
  const startNew = async () => {
    if (!await confirm("Start a new CV", "Clear the saved CV and start a new one? This cannot be undone.")) return;
    try {
      await db.deleteCvDraft();
      setDraft(emptyCvDraft());
      setValidation({});
      setSelectedTextId(null);
      setSelectedTextLabel("");
      setError("");
      setNotice("A new CV draft is ready.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not clear the saved CV draft.");
    }
  };
  const moveSection = (id: CvSectionId, direction: -1 | 1) => {
    setDraft(previous => {
      const current = [...previous.sectionOrder];
      const index = current.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return previous;
      [current[index], current[target]] = [current[target], current[index]];
      return { ...previous, sectionOrder: current };
    });
  };
  const toggleSection = (id: CvSectionId) => setDraft(previous => ({
    ...previous,
    enabledSections: previous.enabledSections.includes(id) ? previous.enabledSections.filter(item => item !== id) : [...previous.enabledSections, id]
  }));
  const resetStyle = () => setDraft(previous => ({
    ...previous,
    templateId: "modern",
    accentColor: "#397b68",
    fontFamily: "Inter",
    fontSize: 10,
    photoStyle: "circle",
    textStyles: {},
    headerLayout: emptyCvDraft().headerLayout
  }));
  const resetSelectedTextStyle = () => {
    if (!selectedTextId) return;
    setDraft(previous => {
      const textStyles = { ...previous.textStyles };
      delete textStyles[selectedTextId];
      return { ...previous, textStyles };
    });
  };
  const onSelectText = (id: string, label: string) => {
    setSelectedTextId(id);
    setSelectedTextLabel(label);
  };
  const addCustomBlock = () => {
    const block = { id: uid(), title: "Additional Information", body: "" };
    setDraft(previous => ({ ...previous, customBlocks: [...previous.customBlocks, block] }));
    onSelectText(`custom:${block.id}:title`, "Custom section heading");
  };
  const removeCustomBlock = async (id: string) => {
    if (!await confirm("Remove custom section", "Remove this custom section and its text? This cannot be undone.")) return;
    setDraft(previous => ({ ...previous, customBlocks: previous.customBlocks.filter(block => block.id !== id) }));
    if (selectedTextId?.startsWith(`custom:${id}:`)) setSelectedTextId(null);
  };
  const moveCustomBlock = (id: string, direction: -1 | 1) => setDraft(previous => {
    const blocks = [...previous.customBlocks];
    const index = blocks.findIndex(block => block.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= blocks.length) return previous;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    return { ...previous, customBlocks: blocks };
  });

  const entries: Array<{ id: "certifications" | "training" | "publications" | "volunteer" | "awards" | "references"; title: string }> = [
    { id: "certifications", title: "Certifications" }, { id: "training", title: "Professional Training" },
    { id: "publications", title: "Research & Publications" }, { id: "volunteer", title: "Volunteer Experience" },
    { id: "awards", title: "Awards & Achievements" }, { id: "references", title: "References" }
  ];

  return <LocalizedUi><div className="cv-builder">
    <header className="cv-page-header">
      <div><div className="eyebrow">LOCAL · PRIVATE CV WORKSPACE</div><h1 className="page-title">CV Builder</h1><p>Create a polished CV with a live preview. Your draft and photo stay in this browser.</p></div>
      <div className="cv-header-actions"><span className={`cv-save-state ${saving ? "saving" : ""}`} role="status">{!ready ? "Loading draft…" : saving ? "Saving locally…" : "Draft saved locally"}</span><button type="button" className="secondary-button" onClick={() => void startNew()}><FilePlus2 size={15}/> New CV</button></div>
    </header>
    <div className="app-toast-stack no-print">
      {error && <AppToast key={`cv-error-${error}`} variant="error" message={error} onClose={() => setError("")}/>}
      {notice && <AppToast key={`cv-notice-${notice}`} variant="success" message={notice} onClose={() => setNotice("")}/>}
    </div>
    <div className="cv-mobile-tabs">
      <button type="button" className={mobileTab === "form" ? "selected" : ""} onClick={() => setMobileTab("form")}>Form</button>
      <button type="button" className={mobileTab === "preview" ? "selected" : ""} onClick={() => setMobileTab("preview")}>Preview</button>
    </div>
    <section className={`cv-template-panel ${mobileTab === "preview" ? "mobile-hide" : ""}`}>
      <div className="cv-section-heading"><div><h2>Choose a template</h2><p>Compare 24 distinct layouts. Your information and compatible text styling stay with you when switching.</p></div><span>{templates.find(template => template.id === draft.templateId)?.name} · {templates.length}</span></div>
      <label className="cv-template-search"><Search size={16}/><input value={templateSearch} onChange={event => setTemplateSearch(event.target.value)} placeholder="Search templates or career types" aria-label="Search templates or career types"/>{templateSearch && <button type="button" aria-label="Clear template search" onClick={() => setTemplateSearch("")}><X size={14}/></button>}</label>
      <div className="cv-template-filters" role="group" aria-label="Template categories">{templateCategories.map(category => <button type="button" key={category} className={templateCategory === category ? "selected" : ""} onClick={() => setTemplateCategory(category)}>{category}</button>)}</div>
      {filteredTemplates.length ? <div className="cv-template-grid">{filteredTemplates.map(template => <article key={template.id} className={`cv-template-card ${draft.templateId === template.id ? "selected" : ""}`}>
        <div className={`cv-template-thumb cv-thumb-${template.id}`} aria-hidden="true">
          <span className="cv-thumb-header"><b/><i/></span>
          <span className="cv-thumb-columns"><span><i/><i/><i/></span>{gridTemplateIds.has(template.id) && <span><i/><i/><i/></span>}</span>
        </div>
        <div className="cv-template-card-heading"><b>{template.name}</b>{draft.templateId === template.id && <span className="cv-template-check"><Check size={13}/></span>}</div>
        <small className="cv-template-description">{template.detail}</small>
        <div className="cv-template-meta"><span>{template.career}</span><span>{template.layout}</span></div>
        <div className="cv-template-badges"><span>{template.photo ? "Photo supported" : "No photo needed"}</span>{template.ats && <span>ATS-friendly</span>}</div>
        <div className="cv-template-actions"><button type="button" className="secondary-button" onClick={() => { setDraft(previous => ({ ...previous, templateId: template.id })); setMobileTab("preview"); }}><Eye size={13}/> Preview</button><button type="button" className="primary-button" aria-pressed={draft.templateId === template.id} onClick={() => setDraft(previous => ({ ...previous, templateId: template.id }))}>{draft.templateId === template.id ? "Selected" : "Select Template"}</button></div>
      </article>)}</div> : <p className="cv-template-empty">No templates match this category and search.</p>}
    </section>
    <div className={`cv-workspace ${mobileTab === "preview" ? "show-preview" : ""}`}>
      <div className={`cv-form-column ${mobileTab === "preview" ? "mobile-hide" : ""}`}>
        <SectionPanel title="Personal Details" description="Required fields are marked with an asterisk." icon={<UserRound size={17}/>}>
          <div className="cv-form-grid">
            <Field label="Full name" required value={draft.personal.fullName} onChange={value => updatePersonal("fullName", value)} placeholder="e.g. Amaya Perera" error={validation.fullName}/>
            <Field label="Professional title" value={draft.personal.title} onChange={value => updatePersonal("title", value)} placeholder="e.g. Software Engineer"/>
            <Field label="Email address" type="email" value={draft.personal.email} onChange={value => updatePersonal("email", value)} placeholder="name@example.com" error={validation.email}/>
            <Field label="Phone number" type="tel" value={draft.personal.phone} onChange={value => updatePersonal("phone", value)} placeholder="+94 77 123 4567" error={validation.phone}/>
            <Field label="Address" value={draft.personal.address} onChange={value => updatePersonal("address", value)} placeholder="Street, area"/>
            <Field label="City and country" value={draft.personal.cityCountry} onChange={value => updatePersonal("cityCountry", value)} placeholder="Colombo, Sri Lanka"/>
            <Field label="Professional summary / career objective" value={draft.personal.summary} onChange={value => updatePersonal("summary", value)} multiline placeholder="Briefly describe your experience, strengths, or career goals."/>
          </div>
          <div className="cv-photo-row">
            <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onPhoto}/>
            {photoUrl ? <Image className={`cv-photo-preview ${draft.photoStyle}`} src={photoUrl} alt="Profile photo preview" width={58} height={58} unoptimized/> : <span className="cv-photo-placeholder"><ImagePlus size={21}/></span>}
            <div className="cv-photo-actions"><b>Profile photo</b><small>JPG, PNG, WebP · maximum 8 MB</small><div><button className="small-action" type="button" onClick={() => photoInput.current?.click()}><ImagePlus size={14}/>{photoUrl ? "Replace photo" : "Upload photo"}</button>{photoUrl && <button className="small-action" type="button" onClick={() => setDraft(previous => ({ ...previous, photo: undefined }))}><X size={14}/>Remove</button>}</div></div>
            <label className="cv-field cv-photo-style"><span>Photo shape</span><select className="cv-input" value={draft.photoStyle} onChange={event => setDraft(previous => ({ ...previous, photoStyle: event.target.value as CvDraft["photoStyle"] }))}><option value="circle">Circle</option><option value="square">Square</option></select></label>
          </div>
        </SectionPanel>

        <SectionPanel title="Education" description="Add qualifications, including current studies." icon={<GraduationCap size={18}/>}>
          {draft.education.map((item, index) => <div className="cv-record-card" key={item.id}><div className="cv-record-head"><b>Education {index + 1}</b><button type="button" className="cv-icon-button" aria-label={`Remove education ${index + 1}`} onClick={() => removeRecord("education", item.id)}><Trash2 size={15}/></button></div>
            <div className="cv-form-grid"><Field label="Qualification or degree" value={item.qualification} onChange={value => updateRecord<CvEducation, "qualification">("education", item.id, "qualification", value)} placeholder="Bachelor of Science"/><Field label="Institution" value={item.institution} onChange={value => updateRecord<CvEducation, "institution">("education", item.id, "institution", value)} placeholder="University or school"/><Field label="Start year" value={item.startYear} onChange={value => updateRecord<CvEducation, "startYear">("education", item.id, "startYear", value)} placeholder="2022"/><Field label="End year / expected" value={item.endYear} onChange={value => updateRecord<CvEducation, "endYear">("education", item.id, "endYear", value)} placeholder="2026 or Present"/><Field label="Grade / GPA (optional)" value={item.grade} onChange={value => updateRecord<CvEducation, "grade">("education", item.id, "grade", value)} placeholder="3.8 GPA"/><Field label="Description (optional)" value={item.description} onChange={value => updateRecord<CvEducation, "description">("education", item.id, "description", value)} multiline placeholder="Relevant coursework or achievements"/></div>
          </div>)}
          <button className="cv-add-button" type="button" onClick={() => setDraft(previous => ({ ...previous, education: [...previous.education, { id: uid(), qualification: "", institution: "", startYear: "", endYear: "", grade: "", description: "" }] }))}><Plus size={15}/> Add Education</button>
          {([
            { collection: "olResults", title: "G.C.E. O/L results" },
            { collection: "alResults", title: "G.C.E. A/L results" }
          ] as const).map(({ collection, title }) => <div className="cv-exam-editor" key={collection}>
            <div className="cv-record-head"><b>{title}</b></div>
            <div className="cv-form-grid cv-exam-details">
              <Field label="Exam year" value={collection === "olResults" ? draft.olExamYear : draft.alExamYear} onChange={value => setDraft(previous => ({ ...previous, [collection === "olResults" ? "olExamYear" : "alExamYear"]: value }))} placeholder="e.g. 2021"/>
              <Field label="Index number" value={collection === "olResults" ? draft.olIndexNumber : draft.alIndexNumber} onChange={value => setDraft(previous => ({ ...previous, [collection === "olResults" ? "olIndexNumber" : "alIndexNumber"]: value }))} placeholder="Enter your exam index number"/>
            </div>
            {draft[collection].map((item, index) => <div className="cv-exam-record" key={item.id}>
              <div className="cv-record-head"><small>{title} subject {index + 1}</small><button type="button" className="cv-icon-button" aria-label={`Remove ${title} subject ${index + 1}`} onClick={() => removeRecord(collection, item.id)}><Trash2 size={15}/></button></div>
              <div className="cv-form-grid">
                <ExamSubjectField collection={collection} id={item.id} subject={item.subject} onChange={value => updateRecord<CvExamResult, "subject">(collection, item.id, "subject", value)}/>
                <Field label="Result / grade" value={item.result} onChange={value => updateRecord<CvExamResult, "result">(collection, item.id, "result", value)} placeholder="e.g. A"/>
              </div>
            </div>)}
            <button className="cv-add-button" type="button" onClick={() => setDraft(previous => ({ ...previous, [collection]: [...previous[collection], { id: uid(), subject: "", result: "" }] }))}><Plus size={15}/> Add {title} subject</button>
          </div>)}
        </SectionPanel>

        <SectionPanel title="Work Experience" description="Describe responsibilities and meaningful achievements." icon={<BriefcaseBusiness size={17}/>}>
          {draft.experience.map((item, index) => <div className="cv-record-card" key={item.id}><div className="cv-record-head"><b>Experience {index + 1}</b><button type="button" className="cv-icon-button" aria-label={`Remove experience ${index + 1}`} onClick={() => removeRecord("experience", item.id)}><Trash2 size={15}/></button></div>
            <div className="cv-form-grid"><Field label="Job title" value={item.title} onChange={value => updateRecord<CvExperience, "title">("experience", item.id, "title", value)} placeholder="e.g. Sales Assistant"/><Field label="Company" value={item.company} onChange={value => updateRecord<CvExperience, "company">("experience", item.id, "company", value)} placeholder="Company name"/><Field label="Start date" type="month" value={item.startDate} onChange={value => updateRecord<CvExperience, "startDate">("experience", item.id, "startDate", value)}/>{!item.current && <Field label="End date" type="month" value={item.endDate} onChange={value => updateRecord<CvExperience, "endDate">("experience", item.id, "endDate", value)}/>}<label className="cv-check-field"><input type="checkbox" checked={item.current} onChange={event => updateRecord<CvExperience, "current">("experience", item.id, "current", event.target.checked)}/> I currently work here</label><Field label="Responsibilities and achievements" value={item.details} onChange={value => updateRecord<CvExperience, "details">("experience", item.id, "details", value)} multiline placeholder="Use short sentences or bullet-style lines"/></div>
          </div>)}
          <button className="cv-add-button" type="button" onClick={() => setDraft(previous => ({ ...previous, experience: [...previous.experience, { id: uid(), title: "", company: "", startDate: "", endDate: "", current: false, details: "" }] }))}><Plus size={15}/> Add Experience</button>
        </SectionPanel>

        <SectionPanel title="Projects" description="Add personal, academic, or professional projects." icon={<FileText size={17}/>}>
          {draft.projects.map((item, index) => <div className="cv-record-card" key={item.id}><div className="cv-record-head"><b>Project {index + 1}</b><button type="button" className="cv-icon-button" aria-label={`Remove project ${index + 1}`} onClick={() => removeRecord("projects", item.id)}><Trash2 size={15}/></button></div>
            <div className="cv-form-grid"><Field label="Project name" value={item.name} onChange={value => updateRecord<CvProject, "name">("projects", item.id, "name", value)} placeholder="Project title"/><Field label="Technologies used" value={item.technologies} onChange={value => updateRecord<CvProject, "technologies">("projects", item.id, "technologies", value)} placeholder="React, SQL, Python"/><Field label="Description" value={item.description} onChange={value => updateRecord<CvProject, "description">("projects", item.id, "description", value)} multiline placeholder="What did you build or achieve?"/><Field label="Project URL (optional)" value={item.url} onChange={value => updateRecord<CvProject, "url">("projects", item.id, "url", value)} placeholder="https://example.com"/><Field label="GitHub URL (optional)" value={item.githubUrl} onChange={value => updateRecord<CvProject, "githubUrl">("projects", item.id, "githubUrl", value)} placeholder="https://github.com/username/project"/></div>
          </div>)}
          <button className="cv-add-button" type="button" onClick={() => setDraft(previous => ({ ...previous, projects: [...previous.projects, { id: uid(), name: "", description: "", technologies: "", url: "", githubUrl: "" }] }))}><Plus size={15}/> Add Project</button>
        </SectionPanel>

        <SectionPanel title="Skills & Languages" description="Add skills one at a time. Press Enter to add each item." icon={<Check size={17}/>}>
          {(["technicalSkills", "softSkills", "languages"] as const).map((collection, index) => {
            const label = ["Technical skills", "Soft skills", "Languages"][index];
            return <div className="cv-skill-editor" key={collection}><b>{label}</b><form className="cv-skill-add" onSubmit={event => addSkill(collection, event)}><input ref={element => { skillInputRefs.current[collection] = element; }} className="cv-input" value={skillDrafts[collection]} onChange={event => setSkillDrafts(previous => ({ ...previous, [collection]: event.target.value }))} placeholder={`Add ${label.toLowerCase()}`}/><button className="small-action" type="submit"><Plus size={14}/> Add</button></form><div className="cv-skill-chips">{draft[collection].map(skill => <span key={skill}>{skill}<button type="button" aria-label={`Remove ${skill}`} onClick={() => removeSkill(collection, skill)}><X size={12}/></button></span>)}</div></div>;
          })}
        </SectionPanel>

        <SectionPanel title="Additional Sections" description="Enable optional sections only when you have information to include." icon={<Plus size={17}/>}>
          <div className="cv-section-toggles">{entries.map(({ id, title }) => <label key={id}><input type="checkbox" checked={draft.enabledSections.includes(id)} onChange={() => toggleSection(id)}/>{title}</label>)}</div>
          {entries.map(({ id, title }) => draft.enabledSections.includes(id) && <div className="cv-optional-records" key={id}><h3>{title}</h3>
            {draft[id].map((item, index) => <div className="cv-record-card" key={item.id}><div className="cv-record-head"><b>{title} {index + 1}</b><button type="button" className="cv-icon-button" aria-label={`Remove ${title} ${index + 1}`} onClick={() => removeRecord(id, item.id)}><Trash2 size={15}/></button></div><div className="cv-form-grid"><Field label="Name / title" value={item.title} onChange={value => updateRecord<CvEntry, "title">(id, item.id, "title", value)} placeholder="Title"/><Field label="Organization" value={item.organization} onChange={value => updateRecord<CvEntry, "organization">(id, item.id, "organization", value)} placeholder="Organization or institution"/><Field label="Date" value={item.date} onChange={value => updateRecord<CvEntry, "date">(id, item.id, "date", value)} placeholder="Year or period"/><Field label="Details (optional)" value={item.description} onChange={value => updateRecord<CvEntry, "description">(id, item.id, "description", value)} multiline placeholder="Short details"/></div></div>)}
            <button type="button" className="cv-add-button" onClick={() => setDraft(previous => ({ ...previous, [id]: [...previous[id], { id: uid(), title: "", organization: "", date: "", description: "" }] }))}><Plus size={15}/> Add {title}</button>
          </div>)}
          <div className="cv-form-grid cv-social-fields"><Field label="LinkedIn profile" value={draft.personal.linkedIn} onChange={value => updatePersonal("linkedIn", value)} placeholder="https://linkedin.com/in/…"/><Field label="GitHub profile" value={draft.personal.github} onChange={value => updatePersonal("github", value)} placeholder="https://github.com/…"/><Field label="Portfolio website" value={draft.personal.portfolio} onChange={value => updatePersonal("portfolio", value)} placeholder="https://…"/></div>
        </SectionPanel>

        <SectionPanel title="Template Settings" description="Adjust your document appearance." icon={<RotateCcw size={17}/>}>
          <div className="cv-style-controls"><label className="cv-field"><span>Accent colour</span><div className="cv-color-picker">{palettes.map(color => <button type="button" key={color} aria-label={`Accent ${color}`} className={draft.accentColor === color ? "selected" : ""} style={{ background: color }} onClick={() => setDraft(previous => ({ ...previous, accentColor: color }))}/>)}</div></label>
            <label className="cv-field"><span>Font family</span><select className="cv-input" value={draft.fontFamily} onChange={event => setDraft(previous => ({ ...previous, fontFamily: event.target.value }))}><option>Inter</option><option>Poppins</option><option>Lato</option><option>Nunito</option><option>Roboto</option><option>Noto Sans Sinhala</option><option>Noto Serif Sinhala</option></select></label>
            <label className="cv-field"><span>Font size · {draft.fontSize} pt</span><input type="range" min="9" max="12" step="0.5" value={draft.fontSize} onChange={event => setDraft(previous => ({ ...previous, fontSize: Number(event.target.value) }))}/></label>
            <label className="cv-field"><span>Paper size</span><select className="cv-input" value="A4" disabled><option>A4</option></select></label>
          </div>
          <div className="cv-order-controls"><b>Section order</b><small>Move sections up or down to change the document order.</small>{draft.sectionOrder.map((id, index) => <div key={id}><label><input type="checkbox" checked={draft.enabledSections.includes(id)} onChange={() => toggleSection(id)}/>{cvSectionLabels[id]}</label><span><button type="button" disabled={index === 0} aria-label={`Move ${cvSectionLabels[id]} up`} onClick={() => moveSection(id, -1)}><ArrowUp size={14}/></button><button type="button" disabled={index === draft.sectionOrder.length - 1} aria-label={`Move ${cvSectionLabels[id]} down`} onClick={() => moveSection(id, 1)}><ArrowDown size={14}/></button></span></div>)}</div>
          <button type="button" className="secondary-button mt-4" onClick={resetStyle}><RotateCcw size={14}/> Reset template style</button>
        </SectionPanel>

        <SectionPanel title="Header & Photo Layout" description="Keep a long name readable and make space for a profile photo." icon={<UserRound size={17}/>}>
          <div className="cv-style-controls">
            <label className="cv-field"><span>Name block width · {draft.headerLayout.nameWidthPercent}%</span><input type="range" min="25" max="100" step="1" value={draft.headerLayout.nameWidthPercent} onChange={event => setDraft(previous => ({ ...previous, headerLayout: { ...previous.headerLayout, nameWidthPercent: Number(event.target.value) } }))}/></label>
            <label className="cv-field"><span>Space below name · {draft.headerLayout.titleGapPt} pt</span><input type="range" min="0" max="30" step="0.5" value={draft.headerLayout.titleGapPt} onChange={event => setDraft(previous => ({ ...previous, headerLayout: { ...previous.headerLayout, titleGapPt: Number(event.target.value) } }))}/></label>
            <label className="cv-field cv-header-check"><span><input type="checkbox" checked={draft.headerLayout.nameFitToOneLine} onChange={event => setDraft(previous => ({ ...previous, headerLayout: { ...previous.headerLayout, nameFitToOneLine: event.target.checked } }))}/> Fit name to one line when possible</span></label>
            <label className="cv-field cv-header-check"><span><input type="checkbox" checked={draft.headerLayout.photoVisible} onChange={event => setDraft(previous => ({ ...previous, headerLayout: { ...previous.headerLayout, photoVisible: event.target.checked } }))}/> Show profile photo</span></label>
            <label className="cv-field"><span>Photo position</span><select className="cv-input" value={draft.headerLayout.photoSide} onChange={event => setDraft(previous => ({ ...previous, headerLayout: { ...previous.headerLayout, photoSide: event.target.value as CvDraft["headerLayout"]["photoSide"] } }))}><option value="left">Left</option><option value="right">Right</option><option value="top">Above header</option></select></label>
            <label className="cv-field"><span>Photo width · {draft.headerLayout.photoWidthMm} mm</span><input type="range" min="15" max="45" value={draft.headerLayout.photoWidthMm} onChange={event => setDraft(previous => ({ ...previous, headerLayout: { ...previous.headerLayout, photoWidthMm: Number(event.target.value) } }))}/></label>
            <label className="cv-field"><span>Photo height · {draft.headerLayout.photoHeightMm} mm</span><input type="range" min="15" max="55" value={draft.headerLayout.photoHeightMm} onChange={event => setDraft(previous => ({ ...previous, headerLayout: { ...previous.headerLayout, photoHeightMm: Number(event.target.value) } }))}/></label>
            <label className="cv-field"><span>Gap to text · {draft.headerLayout.photoGapMm} mm</span><input type="range" min="0" max="20" value={draft.headerLayout.photoGapMm} onChange={event => setDraft(previous => ({ ...previous, headerLayout: { ...previous.headerLayout, photoGapMm: Number(event.target.value) } }))}/></label>
            <label className="cv-field"><span>Photo crop position</span><select className="cv-input" value={draft.headerLayout.photoObjectPosition} onChange={event => setDraft(previous => ({ ...previous, headerLayout: { ...previous.headerLayout, photoObjectPosition: event.target.value as CvDraft["headerLayout"]["photoObjectPosition"] } }))}><option value="center">Centre</option><option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option></select></label>
          </div>
        </SectionPanel>

        <SectionPanel title="Edit Preview Text" description="Select any text in the CV preview, then edit its content and appearance here." icon={<FileText size={17}/>}>
          {!selectedTextId ? <p className="cv-text-help">Choose a text item in the preview to edit its content and independent style.</p> : <>
            <div className="cv-selected-text-heading"><b>{selectedTextLabel}</b><span>Selected in preview</span></div>
            <label className="cv-field cv-edit-content"><span>Text content</span><textarea className="cv-input" rows={3} value={selectedTextValue(draft, selectedTextId)} onChange={event => updateText(selectedTextId, event.target.value)}/></label>
            <div className="cv-editor-modes" role="tablist" aria-label="Text styling mode">
              <button type="button" className={styleMode === "basic" ? "selected" : ""} onClick={() => setStyleMode("basic")}>Basic</button>
              <button type="button" className={styleMode === "advanced" ? "selected" : ""} onClick={() => setStyleMode("advanced")}>Advanced</button>
            </div>
            <div className="cv-style-controls">
              <label className="cv-field"><span>Font family</span><select className="cv-input" value={draft.textStyles[selectedTextId]?.fontFamily ?? draft.fontFamily} onChange={event => updateTextStyle("fontFamily", event.target.value)}>{cvFontFamilies.map(font => <option key={font}>{font}</option>)}</select></label>
              <label className="cv-field"><span>Font size · {draft.textStyles[selectedTextId]?.fontSizePt ?? defaultTextSize(draft, selectedTextId)} pt</span><input type="range" min="6" max="36" step="0.5" value={draft.textStyles[selectedTextId]?.fontSizePt ?? defaultTextSize(draft, selectedTextId)} onChange={event => updateTextStyle("fontSizePt", Number(event.target.value))}/></label>
              <label className="cv-field"><span>Text colour</span><input className="cv-color-input" type="color" value={draft.textStyles[selectedTextId]?.color ?? (selectedTextId === "personal.fullName" ? "#263448" : "#465264")} onChange={event => updateTextStyle("color", event.target.value)}/></label>
              <label className="cv-field"><span>Alignment</span><select className="cv-input" value={draft.textStyles[selectedTextId]?.align ?? "left"} onChange={event => updateTextStyle("align", event.target.value as NonNullable<CvTextStyle["align"]>)}><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option><option value="justify">Justify · fit both sides</option></select></label>
            </div>
            <div className="cv-format-buttons">
              <button type="button" className={(draft.textStyles[selectedTextId]?.fontWeight ?? defaultTextWeight(selectedTextId)) === 700 ? "selected" : ""} onClick={() => updateTextStyle("fontWeight", (draft.textStyles[selectedTextId]?.fontWeight ?? defaultTextWeight(selectedTextId)) === 700 ? 400 : 700)}><b>B</b> Bold</button>
              <button type="button" className={draft.textStyles[selectedTextId]?.italic ? "selected" : ""} onClick={() => updateTextStyle("italic", !draft.textStyles[selectedTextId]?.italic)}><i>I</i> Italic</button>
              <button type="button" className={draft.textStyles[selectedTextId]?.underline ? "selected" : ""} onClick={() => updateTextStyle("underline", !draft.textStyles[selectedTextId]?.underline)}><u>U</u> Underline</button>
            </div>
            {styleMode === "advanced" && <div className="cv-style-controls cv-advanced-controls">
              <label className="cv-field"><span>Exact font size · pt</span><input className="cv-input" type="number" min="6" max="36" step="0.1" value={draft.textStyles[selectedTextId]?.fontSizePt ?? defaultTextSize(draft, selectedTextId)} onChange={event => updateTextStyle("fontSizePt", Math.min(36, Math.max(6, Number(event.target.value) || defaultTextSize(draft, selectedTextId))))}/></label>
              <label className="cv-field"><span>Font weight</span><select className="cv-input" value={draft.textStyles[selectedTextId]?.fontWeight ?? defaultTextWeight(selectedTextId)} onChange={event => updateTextStyle("fontWeight", Number(event.target.value) as CvTextStyle["fontWeight"])}><option value="400">Regular</option><option value="500">Medium weight</option><option value="600">Semibold</option><option value="700">Bold</option></select></label>
              <label className="cv-field"><span>Line height</span><input className="cv-input" type="number" min="0.8" max="3" step="0.1" value={draft.textStyles[selectedTextId]?.lineHeight ?? 1.45} onChange={event => updateTextStyle("lineHeight", Math.min(3, Math.max(0.8, Number(event.target.value) || 1.45)))}/></label>
              <label className="cv-field"><span>Letter spacing · pt</span><input className="cv-input" type="number" min="-2" max="10" step="0.1" value={draft.textStyles[selectedTextId]?.letterSpacingPt ?? 0} onChange={event => updateTextStyle("letterSpacingPt", Math.min(10, Math.max(-2, Number(event.target.value) || 0)))}/></label>
              <label className="cv-field"><span>Text width · %</span><input className="cv-input" type="number" min="10" max="100" step="1" value={draft.textStyles[selectedTextId]?.widthPercent ?? 100} onChange={event => updateTextStyle("widthPercent", Math.min(100, Math.max(10, Number(event.target.value) || 100)))}/></label>
              <label className="cv-field"><span>Top spacing · pt</span><input className="cv-input" type="number" min="0" max="48" step="0.5" value={draft.textStyles[selectedTextId]?.marginTopPt ?? 0} onChange={event => updateTextStyle("marginTopPt", Math.min(48, Math.max(0, Number(event.target.value) || 0)))}/></label>
              <label className="cv-field"><span>Bottom spacing · pt</span><input className="cv-input" type="number" min="0" max="48" step="0.5" value={draft.textStyles[selectedTextId]?.marginBottomPt ?? 0} onChange={event => updateTextStyle("marginBottomPt", Math.min(48, Math.max(0, Number(event.target.value) || 0)))}/></label>
              <label className="cv-field"><span>Text indent · pt</span><input className="cv-input" type="number" min="-24" max="72" step="0.5" value={draft.textStyles[selectedTextId]?.indentPt ?? 0} onChange={event => updateTextStyle("indentPt", Math.min(72, Math.max(-24, Number(event.target.value) || 0)))}/></label>
              <label className="cv-field"><span>Background colour</span><input className="cv-color-input" type="color" value={draft.textStyles[selectedTextId]?.backgroundColor ?? "#ffffff"} onChange={event => updateTextStyle("backgroundColor", event.target.value)}/></label>
              <label className="cv-field"><span>Border colour</span><input className="cv-color-input" type="color" value={draft.textStyles[selectedTextId]?.borderColor ?? "#ffffff"} onChange={event => updateTextStyle("borderColor", event.target.value)}/></label>
              <label className="cv-field"><span>Border width · pt</span><input className="cv-input" type="number" min="0" max="8" step="0.5" value={draft.textStyles[selectedTextId]?.borderWidthPt ?? 0} onChange={event => updateTextStyle("borderWidthPt", Math.min(8, Math.max(0, Number(event.target.value) || 0)))}/></label>
              <label className="cv-field"><span>Corner radius · pt</span><input className="cv-input" type="number" min="0" max="24" step="0.5" value={draft.textStyles[selectedTextId]?.borderRadiusPt ?? 0} onChange={event => updateTextStyle("borderRadiusPt", Math.min(24, Math.max(0, Number(event.target.value) || 0)))}/></label>
              <label className="cv-field"><span>Padding · pt</span><input className="cv-input" type="number" min="0" max="24" step="0.5" value={draft.textStyles[selectedTextId]?.paddingPt ?? 0} onChange={event => updateTextStyle("paddingPt", Math.min(24, Math.max(0, Number(event.target.value) || 0)))}/></label>
              <label className="cv-field cv-header-check"><span><input type="checkbox" checked={draft.textStyles[selectedTextId]?.wrap !== false} onChange={event => updateTextStyle("wrap", event.target.checked)}/> Wrap text</span></label>
            </div>}
            <button type="button" className="secondary-button mt-4" onClick={resetSelectedTextStyle}><RotateCcw size={14}/> Reset selected style</button>
          </>}
        </SectionPanel>

        <SectionPanel title="Custom Text Sections" description="Add editable blocks to the CV and change their headings or text in the preview." icon={<Plus size={17}/>}>
          {draft.customBlocks.map((block, index) => <div className="cv-record-card" key={block.id}>
            <div className="cv-record-head"><b>{block.title || "Untitled section"}</b>
              <span className="cv-custom-order">
                <button type="button" className="cv-icon-button" disabled={index === 0} aria-label={`Move ${block.title || "custom section"} up`} onClick={() => moveCustomBlock(block.id, -1)}><ArrowUp size={14}/></button>
                <button type="button" className="cv-icon-button" disabled={index === draft.customBlocks.length - 1} aria-label={`Move ${block.title || "custom section"} down`} onClick={() => moveCustomBlock(block.id, 1)}><ArrowDown size={14}/></button>
              </span>
              <button type="button" className="cv-icon-button" aria-label={`Remove ${block.title || "custom section"}`} onClick={() => void removeCustomBlock(block.id)}><Trash2 size={15}/></button>
            </div>
            <div className="cv-form-grid">
              <Field label="Section heading" value={block.title} onChange={value => updateText(`custom:${block.id}:title`, value)} placeholder="Additional Information"/>
              <Field label="Text block" value={block.body} onChange={value => updateText(`custom:${block.id}:body`, value)} multiline placeholder="Add details for this section."/>
            </div>
          </div>)}
          <button className="cv-add-button" type="button" onClick={addCustomBlock}><Plus size={15}/> Add text section</button>
        </SectionPanel>
      </div>
      <aside className={`cv-preview-column ${mobileTab === "form" ? "mobile-hide" : ""}`}>
        <div className="cv-preview-toolbar"><div><b>Live CV Preview</b><small>{templates.find(template => template.id === draft.templateId)?.name} · A4</small></div><div><button type="button" className="primary-button" data-paid-feature disabled={!ready || !fontReady} onClick={() => void preparePrint()}><Download size={15}/> Download PDF</button><button type="button" className="secondary-button" data-paid-feature disabled={!ready || !fontReady} onClick={() => void preparePrint()}><Printer size={15}/> Print CV</button></div></div>
        <p className="cv-pdf-guidance">A print preview opens. Choose your printer and select <b>Print</b>.</p>
        {!fontReady && <p className="cv-loading" role="status">Loading document fonts…</p>}
        <div className="cv-paper-stage"><div className="cv-print-root"><CvDocument draft={draft} photoUrl={photoUrl} selectedTextId={selectedTextId} onSelectText={onSelectText}/></div></div>
      </aside>
    </div>
    {dialogHost}
  </div></LocalizedUi>;
}
