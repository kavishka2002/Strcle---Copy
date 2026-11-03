"use client";

import {
  ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronUp, Copy, Download, FileText, Flower2,
  GraduationCap, Grid2X2, Heart, Lightbulb, ListChecks, Palette, Pencil, Printer,
  Save, Shapes, Sparkles, Trash2
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { db } from "@/lib/database";
import { printCurrentPage, printCurrentPageWithDialog } from "@/lib/print-page";
import { englishFonts, sinhalaFonts } from "@/lib/font-catalog";
import {
  duplicateWorksheetDraft, generateWorksheetExercises, getWorksheetTemplate, validateWorksheetDraft,
  worksheetCategories, worksheetTemplates,
  type WorksheetActivity, type WorksheetDraft, type WorksheetExercise,
  type WorksheetOrientation, type WorksheetTemplate
} from "@/lib/worksheets";

const categoryIcons = [BookOpen, BookOpen, Grid2X2, Lightbulb, Palette, Shapes, Pencil, ListChecks, GraduationCap];
const categoryColors = ["#fff0ed", "#edf3ff", "#fff5db", "#f2edff", "#e8f6ea", "#e8f5f4", "#fff0f4", "#edf2ff", "#fff1e0"];
const categorySinhalaNames = ["සිංහල හෝඩිය", "ඉංග්‍රීසි හෝඩිය", "අංක 1–100", "ගණිතය", "පාට කිරීම", "හැඩතල සහ පින්තූර", "අත් අකුරු පුහුණුව", "ගැළපීමේ ක්‍රියාකාරකම්", "1–5 ශ්‍රේණි ක්‍රියාකාරකම්"];
const englishActivities: WorksheetActivity[] = [
  "Trace letters", "Identify letters", "Letter pictures", "Trace numbers", "Number recognition", "Counting",
  "Missing numbers", "Before and after", "Addition", "Subtraction", "Multiplication", "Division",
  "Compare numbers", "Fractions", "Word problems", "Number patterns", "Colouring", "Shape tracing",
  "Find the shape", "Match shapes", "Identify picture", "Words", "Sentences", "Writing lines", "Match letters and pictures",
  "Match numbers and quantities", "Match shapes and names", "Match words and pictures", "Grade activity"
];
const activitiesByCategory: Record<WorksheetDraft["category"], WorksheetActivity[]> = {
  "Sinhala Alphabet Worksheets": ["Trace letters", "Identify letters", "Letter pictures"],
  "English Alphabet Worksheets": ["Trace letters", "Identify letters", "Letter pictures"],
  "Numbers 1–100": ["Trace numbers", "Number recognition", "Counting", "Missing numbers", "Before and after"],
  "Mathematics Worksheets": ["Addition", "Subtraction", "Multiplication", "Division", "Compare numbers", "Fractions", "Word problems", "Number patterns"],
  "Colouring Pages": ["Colouring"],
  "Shapes & Pictures": ["Shape tracing", "Find the shape", "Match shapes", "Identify picture"],
  "Handwriting Practice": ["Trace letters", "Words", "Sentences", "Writing lines"],
  "Matching Activities": ["Match letters and pictures", "Match numbers and quantities", "Match shapes and names", "Match words and pictures"],
  "Grade 1–5 Activity Sheets": ["Grade activity", ...englishActivities.filter(activity => ["Addition", "Subtraction", "Multiplication", "Word problems", "Number patterns", "Words", "Sentences", "Find the shape", "Colouring"].includes(activity))]
};
const defaultFont = "Nunito";
const defaultSinhalaFont = "Noto Sans Sinhala";
const newId = () => crypto.randomUUID();

function makeDraft(template: WorksheetTemplate): WorksheetDraft {
  const timestamp = Date.now();
  const draft: WorksheetDraft = {
    id: newId(), title: template.language === "Sinhala" ? template.titleSinhala : template.title,
    sourceTemplateId: template.id, category: template.category, activity: template.activity,
    language: template.language, grade: template.grade, difficulty: template.difficulty,
    orientation: "portrait", fontFamily: template.language === "Sinhala" ? defaultSinhalaFont : defaultFont,
    borderStyle: "solid", letterCase: "uppercase", coloringCategory: "Animals",
    fontSize: 20, lineSpacing: 1.6, textColor: "#26394a", background: "#ffffff", borderColor: "#77a98f",
    schoolName: "", studentName: true, gradeDate: true,
    instructions: template.language === "Sinhala" ? template.instructionsSinhala : template.instructions,
    includeAnswerKey: false, startNumber: 1, endNumber: template.activity === "Trace numbers" ? 20 : 10,
    selectedLetters: "", shuffleMatches: false, exercises: [], createdAt: timestamp, updatedAt: timestamp
  };
  draft.exercises = generateWorksheetExercises(draft, template.exerciseCount);
  return draft;
}

function duplicateWorksheet(item: WorksheetDraft): WorksheetDraft {
  const copy = duplicateWorksheetDraft(item, newId());
  return { ...copy, title: `${copy.title} copy` };
}

function toPages<T>(items: T[], pageSize: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += pageSize) pages.push(items.slice(index, index + pageSize));
  return pages.length ? pages : [[]];
}

function Picture({ name }: { name: string }) {
  if (name.startsWith("color-")) {
    const illustration = name.replace("color-", "");
    return <svg viewBox="0 0 220 170" role="img" aria-label={illustration} className="worksheet-picture worksheet-color-illustration">
      <use href={`/worksheets/coloring-library.svg#${illustration}`}/>
    </svg>;
  }
  const shape = name.toLowerCase();
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg viewBox="0 0 100 80" aria-hidden="true" className="worksheet-picture">
    {["circle", "oval"].includes(shape) ? <ellipse {...common} cx="50" cy="40" rx={shape === "oval" ? 34 : 24} ry="24"/>
      : shape === "square" ? <rect {...common} x="27" y="17" width="46" height="46"/>
        : shape === "triangle" ? <path {...common} d="M50 14 79 64H21z"/>
          : shape === "rectangle" ? <rect {...common} x="17" y="24" width="66" height="36"/>
            : shape === "star" ? <path {...common} d="m50 10 10 23 25 2-19 16 6 24-22-13-22 13 6-24-19-16 25-2z"/>
              : shape === "diamond" ? <path {...common} d="m50 10 30 30-30 30-30-30z"/>
                : shape === "apple" || shape === "fruit" || shape === "orange" ? <><path {...common} d="M50 25c-18-15-36 1-28 25 6 22 17 27 28 18 11 9 22 4 28-18 8-24-10-40-28-25z"/><path {...common} d="M50 25c-2-9 1-15 7-19M53 15c9-7 16-6 18-3-3 7-10 10-18 8"/></>
                    : shape === "carrot" ? <><path {...common} d="m31 27 44-12-20 54c-3 8-10 8-11 0zM40 23c-7-10-3-17 1-20 9 8 9 15 7 19m6-2c2-10 10-14 16-12-1 9-6 15-14 16"/></>
                  : shape === "ball" ? <><circle {...common} cx="50" cy="40" r="29"/><path {...common} d="M24 26c17 3 26 15 26 28m26-28C59 29 50 42 50 54M24 54c17-3 27-9 34-24m18 24c-14-2-22-10-26-26"/></>
                    : shape === "egg" ? <path {...common} d="M50 10c-17 0-30 25-30 44 0 16 13 24 30 24s30-8 30-24C80 35 67 10 50 10z"/>
                      : shape === "fish" ? <><path {...common} d="M15 40c19-25 46-25 65 0-19 25-46 25-65 0zM80 40l13-14v28z"/><circle {...common} cx="36" cy="36" r="2"/><path {...common} d="M51 25c-8 10-8 20 0 30"/></>
                        : shape === "cup" ? <><path {...common} d="M25 25h45l-5 42H30zM70 31h9c11 0 11 17 0 17h-9M35 17c-5-7 5-9 0-15m17 15c-5-7 5-9 0-15m17 15c-5-7 5-9 0-15"/></>
                          : shape === "icecream" ? <><path {...common} d="m29 42 21 32 21-32zM27 37c0-10 8-16 17-13 2-17 29-17 30 3 14-1 18 23 0 25H36c-6 0-9-7-9-15z"/></>
                            : shape === "crown" ? <><path {...common} d="m18 29 20 16 12-29 12 29 20-16-8 39H26zM25 57h50"/><circle {...common} cx="18" cy="26" r="3"/><circle {...common} cx="50" cy="13" r="3"/><circle {...common} cx="82" cy="26" r="3"/></>
                              : shape === "rainbow" ? <><path {...common} d="M18 65a32 32 0 0 1 64 0M28 65a22 22 0 0 1 44 0M38 65a12 12 0 0 1 24 0"/></>
                                : shape === "moon" ? <path {...common} d="M65 15c-6 22 7 42 25 45-12 15-35 17-51 5-16-13-17-37-4-52 8-9 19-9 30-7z"/>
                                  : shape === "sun" ? <><circle {...common} cx="50" cy="40" r="19"/><path {...common} d="M50 8v11m0 42v11M18 40H7m86 0H82M27 17l-8-8m62 62-8-8m0-46 8-8m-62 62 8-8"/></>
                                    : shape === "nest" ? <><path {...common} d="M20 50c15-6 45-6 60 0l-7 19H27zM25 46c13 7 37 7 50 0M34 28c0-14 32-14 32 0v15H34z"/><path {...common} d="M38 30h1m10-4h1m10 4h1"/></>
                                      : shape === "umbrella" ? <><path {...common} d="M13 44a37 32 0 0 1 74 0H13zm37 0v25c0 12 17 12 17 0"/></>
                                        : shape === "xylophone" ? <><path {...common} d="M20 23h60M25 33v35m12-42v42m12-47v47m12-42v42m12-35v35M18 70h64"/></>
                  : shape === "flower" ? <><circle {...common} cx="50" cy="37" r="10"/><circle {...common} cx="50" cy="19" r="9"/><circle {...common} cx="68" cy="37" r="9"/><circle {...common} cx="50" cy="55" r="9"/><circle {...common} cx="32" cy="37" r="9"/><path {...common} d="M50 47v25m0-7c-8-10-17-8-18-6 4 8 11 11 18 9"/></>
                    : shape === "cat" || shape === "animal" ? <><path {...common} d="m26 37 2-23 17 13c4-1 8-1 12 0l17-13 2 23c5 7 6 17 2 25-7 15-37 18-51 0-5-7-5-17-1-25z"/><circle {...common} cx="40" cy="45" r="2"/><circle {...common} cx="60" cy="45" r="2"/><path {...common} d="M46 54q4 4 8 0M22 52l14 2m-14 6 14-2m42-6-14 2m14 6-14-2"/></>
                      : shape === "bird" ? <><path {...common} d="M25 51c-4-20 11-35 30-31 16 4 25 20 17 34-8 15-34 18-47 4z"/><path {...common} d="m68 40 18 5-17 8M39 61v12m17-12v12m-27 0h19m0 0h19"/><circle {...common} cx="59" cy="39" r="1"/></>
                        : shape === "vehicle" ? <><path {...common} d="m17 53 7-22h47l12 22v13H17zM30 31l6-14h26l9 14M17 51h66"/><circle {...common} cx="31" cy="67" r="7"/><circle {...common} cx="69" cy="67" r="7"/></>
                          : shape === "book" ? <><path {...common} d="M17 20c14-5 25-2 33 5 8-7 19-10 33-5v48c-14-5-25-2-33 5-8-7-19-10-33-5zM50 25v48m-24-37c7-2 13-1 18 2m30-2c-7-2-13-1-18 2"/></>
                        : shape === "tree" || shape === "leaf" ? <><path {...common} d="M50 72V43m0 13c-16 0-25-10-25-22 14 0 22 7 25 18m0-8c0-16 9-27 25-29 1 17-8 27-25 32"/></>
                          : shape === "house" ? <><path {...common} d="m17 39 33-27 33 27v33H17zM42 72V49h16v23M27 44h10m27 0h10"/></>
                            : shape === "kite" ? <><path {...common} d="m50 8 28 32-28 32-28-32zM50 72v5l-8 4 11 2 4 5m-35-48 28 32 28-32"/></>
                              : shape === "pencil" ? <><path {...common} d="m31 62 8 8 36-36-8-8zM31 62l-8 13 16-5m28-44 8-8 8 8-8 8"/></>
                                : shape.startsWith("count-") ? <>{Array.from({ length: Number(shape.slice(6)) }, (_, index) => <circle key={index} {...common} cx={22 + index % 4 * 19} cy={25 + Math.floor(index / 4) * 25} r="7"/>)}</>
                                  : <><path {...common} d="M23 58c2-20 17-34 34-34 13 0 22 8 21 20-1 15-18 25-38 25-11 0-18-4-17-11z"/><path {...common} d="M33 53c10 6 22 5 31-4m-34 21v8m36-9 7 8"/></>}
  </svg>;
}

function WorksheetPage({ draft, exercises, pageNumber, answerSheet = false }: {
  draft: WorksheetDraft; exercises: WorksheetExercise[]; pageNumber: number; answerSheet?: boolean;
}) {
  const siFont = sinhalaFonts.some(font => font.family === draft.fontFamily) ? draft.fontFamily : defaultSinhalaFont;
  const fontFamily = `"${draft.fontFamily}", "${siFont}", "Noto Sans Sinhala", sans-serif`;
  const isSinhala = draft.language === "Sinhala";
  return <article className={`kids-worksheet-page ${draft.orientation === "landscape" ? "landscape" : "portrait"}`}
    style={{ fontFamily, color: draft.textColor, backgroundColor: draft.background, borderColor: draft.borderColor, borderStyle: draft.borderStyle } as CSSProperties}>
    <header className="kids-worksheet-header">
      {draft.schoolName && <div className="kids-school-name">{draft.schoolName}</div>}
      <h2>{answerSheet ? `${draft.title} · ${isSinhala ? "පිළිතුරු" : "Answer key"}` : draft.title}</h2>
      <div className="kids-worksheet-meta">
        {draft.studentName && <span>{isSinhala ? "නම:" : "Name:"} <i/></span>}
        {draft.gradeDate && <><span>{isSinhala ? `ශ්‍රේණිය ${draft.grade}` : `Grade ${draft.grade}`}</span><span>{isSinhala ? "දිනය:" : "Date:"} <i/></span></>}
      </div>
      {!answerSheet && <p>{draft.instructions}</p>}
    </header>
    <div className={`kids-exercise-list ${answerSheet ? "answer-key" : ""}`} style={{ fontSize: `${draft.fontSize}px`, lineHeight: draft.lineSpacing }}>
      {exercises.map((item, index) => answerSheet
        ? <div className="kids-answer-row" key={item.id}><span>{index + 1}.</span><b>{(isSinhala ? item.answerSinhala ?? item.answer : item.answer) || "________________"}</b></div>
        : <div className={`kids-exercise ${item.kind === "trace" ? "trace" : ""} ${item.kind === "color" ? "color" : ""}`} key={item.id}>
          <span className="kids-exercise-number">{pageNumber * (draft.orientation === "landscape" ? 10 : 8) + index + 1}.</span>
          <div className="kids-exercise-body">
            <div className="kids-exercise-prompt">{isSinhala ? item.promptSinhala ?? item.prompt : item.prompt}</div>
            {item.picture && item.kind !== "color" && <Picture name={item.picture}/>}
            {item.kind === "match" && item.choices?.length
              ? <div className="kids-match-choices">{(isSinhala ? item.choicesSinhala ?? item.choices : item.choices).join(" · ")}</div>
              : null}
            {item.kind === "trace" && <div className="kids-writing-lines"><i/><i/></div>}
            {item.kind === "write" && <div className="kids-writing-lines"><i/><i/></div>}
            {item.kind === "match" && <div className="kids-match-line"/>}
            {item.kind === "color" && <div className="kids-coloring-space"><Picture name={item.picture ?? "color-flowers"}/></div>}
          </div>
        </div>)}
    </div>
    <footer className="kids-worksheet-footer">PaperBloom · {pageNumber + 1}</footer>
  </article>;
}

export function WorksheetMaker() {
  const [category, setCategory] = useState<WorksheetDraft["category"]>(worksheetCategories[0]);
  const [draft, setDraft] = useState<WorksheetDraft | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WorksheetTemplate | null>(null);
  const [saved, setSaved] = useState<WorksheetDraft[]>([]);
  const [selectedSaved, setSelectedSaved] = useState<string[]>([]);
  const [batchPrint, setBatchPrint] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateGrade, setTemplateGrade] = useState<number | "all">("all");
  const [templateLanguage, setTemplateLanguage] = useState<WorksheetDraft["language"] | "all">("all");
  const [templateDifficulty, setTemplateDifficulty] = useState<WorksheetDraft["difficulty"] | "all">("all");
  const [templateActivity, setTemplateActivity] = useState<WorksheetActivity | "all">("all");
  const [selectedPage, setSelectedPage] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void db.getAllWorksheetDrafts().then(items => {
      if (active) setSaved(items.sort((left, right) => right.updatedAt - left.updatedAt));
    }).catch(cause => {
      console.error("Could not load saved worksheets.", cause);
      if (active) setError(cause instanceof Error ? cause.message : "Could not load saved worksheets.");
    }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const categoryTemplates = useMemo(() => worksheetTemplates.filter(template =>
    template.category === category &&
    `${template.title} ${template.titleSinhala} ${template.description} ${template.descriptionSinhala}`.toLocaleLowerCase().includes(templateSearch.trim().toLocaleLowerCase()) &&
    (templateGrade === "all" || template.grade === templateGrade) &&
    (templateLanguage === "all" || template.languages.includes(templateLanguage)) &&
    (templateDifficulty === "all" || template.difficulty === templateDifficulty) &&
    (templateActivity === "all" || template.activity === templateActivity)
  ), [category, templateActivity, templateDifficulty, templateGrade, templateLanguage, templateSearch]);
  const previewDraft = useMemo(() => previewTemplate ? makeDraft(previewTemplate) : null, [previewTemplate]);
  const usableActivities = activitiesByCategory[draft?.category ?? category];
  const exercisePages = draft ? toPages(draft.exercises, draft.orientation === "landscape" ? 10 : 8) : [];
  const pages = draft ? [
    ...exercisePages.map((items, index) => ({ items, pageNumber: index, answerSheet: false })),
    ...(draft.includeAnswerKey ? toPages(draft.exercises, 24).map((items, index) => ({ items, pageNumber: exercisePages.length + index, answerSheet: true })) : [])
  ] : [];
  const maxPreview = Math.max(pages.length - 1, 0);

  const patchDraft = (changes: Partial<WorksheetDraft>) => {
    setDraft(current => current ? { ...current, ...changes, updatedAt: Date.now() } : current);
    if (changes.exercises) setSelectedPage(0);
    setStatus("");
    setError("");
  };

  const createFromTemplate = (template: WorksheetTemplate) => {
    setCategory(template.category);
    setDraft(makeDraft(template));
    setPreviewTemplate(null);
    setSelectedPage(0);
    setStatus("");
    setError("");
    requestAnimationFrame(() => document.getElementById("kids-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const regenerate = (patch: Partial<WorksheetDraft> = {}, count = draft?.exercises.length ?? 12) => {
    if (!draft) return;
    try {
      const next = { ...draft, ...patch };
      if (patch.activity) next.sourceTemplateId = undefined;
      if (patch.language && draft.sourceTemplateId) {
        const source = getWorksheetTemplate(draft.sourceTemplateId);
        if (source) {
          const previousTitle = draft.language === "Sinhala" ? source.titleSinhala : source.title;
          const previousInstructions = draft.language === "Sinhala" ? source.instructionsSinhala : source.instructions;
          if (draft.title === previousTitle) next.title = next.language === "Sinhala" ? source.titleSinhala : source.title;
          if (draft.instructions === previousInstructions) next.instructions = next.language === "Sinhala" ? source.instructionsSinhala : source.instructions;
        }
      }
      next.exercises = generateWorksheetExercises(next, count);
      next.updatedAt = Date.now();
      setDraft(next);
      setSelectedPage(0);
      setStatus("Worksheet updated.");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate the worksheet.");
    }
  };

  const saveDraft = async () => {
    if (!draft) return;
    const validationErrors = validateWorksheetDraft(draft);
    if (validationErrors.length) {
      setError(validationErrors.join(" "));
      setStatus("");
      return;
    }
    try {
      const next = { ...draft, updatedAt: Date.now() };
      await db.putWorksheetDraft(next);
      setDraft(next);
      setSaved(previous => [next, ...previous.filter(item => item.id !== next.id)].sort((left, right) => right.updatedAt - left.updatedAt));
      setStatus("Saved on this device.");
      setError("");
    } catch (cause) {
      console.error("Could not save worksheet.", cause);
      setError(cause instanceof Error ? cause.message : "Could not save worksheet on this device.");
    }
  };

  const openDraft = (item: WorksheetDraft, duplicate = false) => {
    const next = duplicate ? duplicateWorksheet(item) : { ...item };
    setDraft(next);
    setCategory(next.category);
    setSelectedPage(0);
    setStatus(duplicate ? "Copy ready to edit." : "Worksheet reopened.");
    setError("");
  };

  const removeDraft = async (id: string) => {
    try {
      await db.deleteWorksheetDraft(id);
      setSaved(previous => previous.filter(item => item.id !== id));
      setSelectedSaved(previous => previous.filter(selectedId => selectedId !== id));
      setStatus("Saved worksheet removed.");
    } catch (cause) {
      console.error("Could not delete saved worksheet.", cause);
      setError(cause instanceof Error ? cause.message : "Could not delete the saved worksheet.");
    }
  };

  const print = async (withDialog: boolean, selected = false) => {
    const batch = selected ? saved.filter(item => selectedSaved.includes(item.id)) : draft ? [draft] : [];
    if (!batch.length) return;
    setBatchPrint(selected);
    const orientation = batch[0].orientation;
    if (batch.some(item => item.orientation !== orientation)) {
      setError("Print selected worksheets in separate jobs so each keeps its A4 orientation.");
      return;
    }
    document.documentElement.classList.add("kids-print-mode");
    if (orientation === "landscape") document.documentElement.classList.add("kids-print-landscape");
    try {
      await Promise.all([...new Set(batch.map(item => item.fontFamily))]
        .map(font => document.fonts.load(`16px "${font}", "Noto Sans Sinhala"`)));
      await document.fonts.ready;
      const result = withDialog
        ? await printCurrentPageWithDialog({ orientation, paperSize: "A4" })
        : await printCurrentPage({ orientation, paperSize: "A4" });
      if (result.status === "printed") setStatus(`Sent to ${result.printerName}.`);
      else if (result.status === "previewed") setStatus("Print preview opened. Choose Print or save a PDF.");
      else setStatus("Print dialog opened.");
    } catch (cause) {
      console.error("Could not prepare worksheet print output.", cause);
      setError(cause instanceof Error ? cause.message : "Could not prepare the worksheet for printing.");
    } finally {
      document.documentElement.classList.remove("kids-print-mode", "kids-print-landscape");
      setBatchPrint(false);
    }
  };

  const downloadCopy = () => {
    if (!draft) return;
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${draft.title.replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "") || "worksheet"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("Worksheet backup downloaded.");
  };

  const updateExercise = (index: number, patch: Partial<WorksheetExercise>) => {
    if (!draft) return;
    patchDraft({ exercises: draft.exercises.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  };

  const restoreDefault = () => {
    if (!draft?.sourceTemplateId) return;
    const template = getWorksheetTemplate(draft.sourceTemplateId);
    if (!template) {
      setError("The original default worksheet is not available.");
      return;
    }
    createFromTemplate(template);
    setStatus("The original default template has been restored. Your saved copy was not changed.");
  };

  const setOrientation = (orientation: WorksheetOrientation) => {
    if (!draft) return;
    patchDraft({ orientation });
    setSelectedPage(0);
  };

  const fontOptions = [...englishFonts.map(font => font.family), ...sinhalaFonts.map(font => font.family)];

  return <section className="kids-maker">
    <div className="kids-hero">
      <div className="kids-hero-copy">
        <div className="kids-eyebrow"><Sparkles size={14}/> PAPERBLOOM LEARNING STUDIO</div>
        <h1>Little steps, bright ideas <span>✿</span></h1>
        <p>Make cheerful, print-ready learning sheets in English or Sinhala. Everything stays on this device.</p>
        <div className="kids-hero-actions">
          <button className="kids-primary" onClick={() => document.getElementById("kids-templates")?.scrollIntoView({ behavior: "smooth" })}><Sparkles size={16}/> Choose a worksheet</button>
          <span><Check size={14}/> Offline templates · A4 ready</span>
        </div>
      </div>
      <div className="kids-hero-art" aria-hidden="true"><div className="kids-sun">☼</div><div className="kids-paper-art"><b>අ</b><i/><i/><i/></div><span className="kids-flower">✿</span><span className="kids-star">✦</span></div>
    </div>

    <div className="kids-section-heading"><div><span className="kids-eyebrow">YOUR WORKSHEET WORKSHOP</span><h2>Pick a learning path</h2><p>Choose a category, then start with a ready-made sheet.</p></div></div>
    <div className="kids-category-grid">
      {worksheetCategories.map((name, index) => {
        const Icon = categoryIcons[index];
        return <button key={name} onClick={() => setCategory(name)} className={`kids-category-card ${category === name ? "selected" : ""}`}>
          <span style={{ backgroundColor: categoryColors[index] }}><Icon size={20}/></span><b>{name}<br/><span className="kids-category-sinhala">{categorySinhalaNames[index]}</span></b><small>{worksheetTemplates.filter(template => template.category === name).length} ready-made worksheets</small>
          <ArrowRight size={15} className="kids-category-arrow"/>
        </button>;
      })}
    </div>

    <div className="kids-section-heading" id="kids-templates"><div><span className="kids-eyebrow">READY WHEN YOU ARE</span><h2>Template library</h2><p>{category} · Editable starters, not an official curriculum claim.</p></div>
      <div className="kids-template-count"><Flower2 size={15}/>{categoryTemplates.length} templates</div>
    </div>
    <div className="kids-template-filters">
      <label>Category<select value={category} onChange={event => setCategory(event.target.value as WorksheetDraft["category"])}>{worksheetCategories.map(item => <option key={item}>{item}</option>)}</select></label>
      <label className="kids-template-search">Search<input type="search" value={templateSearch} onChange={event => setTemplateSearch(event.target.value)} placeholder="Search in Sinhala or English"/></label>
      <label>Grade<select value={templateGrade} onChange={event => setTemplateGrade(event.target.value === "all" ? "all" : Number(event.target.value))}><option value="all">All grades</option>{[1, 2, 3, 4, 5].map(grade => <option key={grade} value={grade}>Grade {grade}</option>)}</select></label>
      <label>Language<select value={templateLanguage} onChange={event => setTemplateLanguage(event.target.value as WorksheetDraft["language"] | "all")}><option value="all">All languages</option><option>English</option><option>Sinhala</option></select></label>
      <label>Difficulty<select value={templateDifficulty} onChange={event => setTemplateDifficulty(event.target.value as WorksheetDraft["difficulty"] | "all")}><option value="all">All levels</option><option>Easy</option><option>Medium</option><option>Advanced</option></select></label>
      <label>Worksheet type<select value={templateActivity} onChange={event => setTemplateActivity(event.target.value as WorksheetActivity | "all")}><option value="all">All types</option>{[...new Set(worksheetTemplates.map(template => template.activity))].map(activity => <option key={activity}>{activity}</option>)}</select></label>
    </div>
    <div className="kids-template-grid">
      {categoryTemplates.map(template => <article key={template.id} className="kids-template-card">
        <div className="kids-template-preview" aria-hidden="true"><span>{template.icon}</span><b>{template.titleSinhala}</b><i/><i/></div>
        <b>{template.title}</b><small>{template.titleSinhala}<br/>{template.description} · {template.grade ? `Grade ${template.grade}` : "All grades"} · English &amp; Sinhala · {Math.max(1, Math.ceil(template.exerciseCount / 8))} page{template.exerciseCount > 8 ? "s" : ""}</small>
        <div className="kids-template-card-actions">
          <button type="button" className="kids-card-preview" onClick={() => setPreviewTemplate(template)}>Preview</button>
          <button type="button" className="kids-card-use" onClick={() => createFromTemplate(template)}>Use Template</button>
          <button type="button" className="kids-card-customize" onClick={() => createFromTemplate(template)}>Customize</button>
        </div>
      </article>)}
      {!categoryTemplates.length && <div className="kids-empty-card">No worksheets match these filters. Try another category, language, or search term.</div>}
    </div>

    {previewTemplate && previewDraft && <div className="kids-template-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPreviewTemplate(null); }}>
      <section className="kids-template-modal" role="dialog" aria-modal="true" aria-labelledby="kids-template-preview-title">
        <div className="kids-template-modal-heading"><div><span className="kids-eyebrow">READY-TO-PRINT WORKSHEET</span><h2 id="kids-template-preview-title">{previewTemplate.title} · {previewTemplate.titleSinhala}</h2><p>{previewTemplate.description} · {previewTemplate.exerciseCount} activities · A4</p></div><button type="button" aria-label="Close preview" onClick={() => setPreviewTemplate(null)}>×</button></div>
        <div className="kids-template-modal-sheet"><WorksheetPage draft={previewDraft} exercises={toPages(previewDraft.exercises, previewDraft.orientation === "landscape" ? 10 : 8)[0] ?? []} pageNumber={0}/></div>
        <div className="kids-template-modal-actions"><button type="button" className="kids-secondary" onClick={() => setPreviewTemplate(null)}>Close</button><button type="button" className="kids-primary" onClick={() => createFromTemplate(previewTemplate)}>Use this worksheet</button></div>
      </section>
    </div>}

    {draft && <div className="kids-editor" id="kids-editor">
      <div className="kids-section-heading"><div><span className="kids-eyebrow">MAKE IT YOURS</span><h2>Worksheet editor</h2><p>Changes appear in your live A4 preview.</p></div><div className="kids-editor-actions">
        <button className="kids-secondary" onClick={() => void saveDraft()}><Save size={15}/> Save</button>
        {draft.sourceTemplateId && <button className="kids-secondary" onClick={restoreDefault}>Restore default</button>}
        <button className="kids-secondary" onClick={downloadCopy}><Download size={15}/> Backup</button>
      </div></div>
      <div className="kids-workspace">
        <div className="kids-controls">
          <label className="kids-field">Worksheet title<input value={draft.title} onChange={event => patchDraft({ title: event.target.value })}/></label>
          <label className="kids-field">Instructions<textarea value={draft.instructions} rows={2} onChange={event => patchDraft({ instructions: event.target.value })}/></label>
          <div className="kids-fields-two">
            <label className="kids-field">Language<select value={draft.language} onChange={event => regenerate({ language: event.target.value as WorksheetDraft["language"] })}><option>English</option><option>Sinhala</option></select></label>
            <label className="kids-field">Activity<select value={draft.activity} onChange={event => regenerate({ activity: event.target.value as WorksheetActivity })}>{usableActivities.map(activity => <option key={activity}>{activity}</option>)}</select></label>
          </div>
          <div className="kids-fields-three">
            <label className="kids-field">Grade<select value={draft.grade} onChange={event => regenerate({ grade: Number(event.target.value) })}>{[1, 2, 3, 4, 5].map(grade => <option key={grade} value={grade}>Grade {grade}</option>)}</select></label>
            <label className="kids-field">Level<select value={draft.difficulty} onChange={event => regenerate({ difficulty: event.target.value as WorksheetDraft["difficulty"] })}><option>Easy</option><option>Medium</option><option>Advanced</option></select></label>
            <label className="kids-field">Exercises<select value={draft.exercises.length} onChange={event => regenerate({}, Number(event.target.value))}>{[5, 8, 10, 12, 16, 18, 20, 26, 50, 52, 59, 100].map(count => <option key={count} value={count}>{count}</option>)}</select></label>
          </div>
          {draft.category === "English Alphabet Worksheets" && <label className="kids-field">Letter case<select value={draft.letterCase} onChange={event => regenerate({ letterCase: event.target.value as WorksheetDraft["letterCase"] })}><option value="uppercase">Uppercase A–Z</option><option value="lowercase">Lowercase a–z</option><option value="both">Uppercase and lowercase</option></select></label>}
          {draft.category === "Colouring Pages" && <label className="kids-field">Colouring category<select value={draft.coloringCategory} onChange={event => regenerate({ coloringCategory: event.target.value as WorksheetDraft["coloringCategory"] })}>{["Animals", "Birds", "Flowers", "Fruits", "Vegetables", "Vehicles", "Nature", "Original illustrations", "Educational objects"].map(name => <option key={name}>{name}</option>)}</select></label>}
          {(draft.category === "Numbers 1–100" || ["Trace numbers", "Number recognition", "Counting", "Missing numbers", "Before and after"].includes(draft.activity)) && <div className="kids-fields-two">
            <label className="kids-field">Start number<input type="number" min="1" max="100" value={draft.startNumber} onChange={event => patchDraft({ startNumber: Number(event.target.value) })}/></label>
            <label className="kids-field">End number<input type="number" min={draft.startNumber} max="100" value={draft.endNumber} onChange={event => patchDraft({ endNumber: Number(event.target.value) })}/></label>
            <div className="kids-range-chips">{[[1, 10], [1, 20], [1, 50], [1, 100]].map(([start, end]) => <button key={end} type="button" className="kids-range-chip" onClick={() => regenerate({ startNumber: start, endNumber: end })}>1–{end}</button>)}</div>
          </div>}
          {(draft.category.includes("Alphabet") || draft.category === "Handwriting Practice") && <label className="kids-field">Letters to practise <input placeholder="Leave blank for the complete set" value={draft.selectedLetters} onChange={event => patchDraft({ selectedLetters: event.target.value })}/><small>Enter selected letters separated by spaces or commas, or leave blank for the full alphabet.</small></label>}
          <div className="kids-fields-two">
            <label className="kids-field">School name<input value={draft.schoolName} onChange={event => patchDraft({ schoolName: event.target.value })}/></label>
            <label className="kids-field">Font<select value={draft.fontFamily} onChange={event => patchDraft({ fontFamily: event.target.value })}>{fontOptions.map(font => <option key={font}>{font}</option>)}</select></label>
          </div>
          <div className="kids-fields-three">
            <label className="kids-field">Text size<input type="number" min="12" max="36" value={draft.fontSize} onChange={event => patchDraft({ fontSize: Math.min(36, Math.max(12, Number(event.target.value))) })}/></label>
            <label className="kids-field">Line spacing<input type="number" min="1" max="2.5" step="0.1" value={draft.lineSpacing} onChange={event => patchDraft({ lineSpacing: Math.min(2.5, Math.max(1, Number(event.target.value))) })}/></label>
            <label className="kids-field">Page layout<select value={draft.orientation} onChange={event => setOrientation(event.target.value as WorksheetOrientation)}><option value="portrait">A4 portrait</option><option value="landscape">A4 landscape</option></select></label>
          </div>
          <label className="kids-field">Border style<select value={draft.borderStyle} onChange={event => patchDraft({ borderStyle: event.target.value as WorksheetDraft["borderStyle"] })}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option></select></label>
          <div className="kids-fields-three kids-color-controls">
            <label className="kids-field">Text color<input type="color" value={draft.textColor} onChange={event => patchDraft({ textColor: event.target.value })}/></label>
            <label className="kids-field">Page background<input type="color" value={draft.background} onChange={event => patchDraft({ background: event.target.value })}/></label>
            <label className="kids-field">Border color<input type="color" value={draft.borderColor} onChange={event => patchDraft({ borderColor: event.target.value })}/></label>
          </div>
          <div className="kids-checkbox-row">
            <label><input type="checkbox" checked={draft.studentName} onChange={event => patchDraft({ studentName: event.target.checked })}/> Student name line</label>
            <label><input type="checkbox" checked={draft.gradeDate} onChange={event => patchDraft({ gradeDate: event.target.checked })}/> Grade &amp; date</label>
            <label><input type="checkbox" checked={draft.includeAnswerKey} onChange={event => { patchDraft({ includeAnswerKey: event.target.checked }); setSelectedPage(0); }}/> Answer sheet</label>
            <label><input type="checkbox" checked={draft.shuffleMatches} onChange={event => regenerate({ shuffleMatches: event.target.checked })}/> Shuffle matching</label>
          </div>
          <div className="kids-exercise-editor"><div className="kids-exercise-editor-heading"><b>Edit questions</b><button type="button" onClick={() => patchDraft({ exercises: [...draft.exercises, { id: newId(), prompt: "Write your question here.", answer: "", kind: "write" }] })}><Sparkles size={13}/> Add question</button></div>
            {draft.exercises.map((item, index) => <div className="kids-question-edit" key={item.id}>
              <span>{index + 1}</span><input aria-label={`Question ${index + 1}`} value={draft.language === "Sinhala" ? item.promptSinhala ?? item.prompt : item.prompt} onChange={event => updateExercise(index, { prompt: event.target.value, promptSinhala: event.target.value, answer: "", answerSinhala: "" })}/>
              <input aria-label={`Answer ${index + 1}`} placeholder="Answer" value={draft.language === "Sinhala" ? item.answerSinhala ?? item.answer : item.answer} onChange={event => updateExercise(index, { answer: event.target.value, answerSinhala: event.target.value })}/>
              <select aria-label={`Illustration for question ${index + 1}`} value={item.picture ?? ""} onChange={event => updateExercise(index, { picture: event.target.value || undefined })}><option value="">No picture</option>{["apple", "animal", "bird", "book", "carrot", "flower", "fruit", "vehicle", "tree", "pencil", "circle", "square", "triangle", "rectangle", "oval", "diamond", "star"].map(picture => <option key={picture}>{picture}</option>)}</select>
              <span className="kids-reorder-buttons"><button type="button" aria-label={`Move question ${index + 1} up`} disabled={index === 0} onClick={() => { const exercises = [...draft.exercises]; [exercises[index - 1], exercises[index]] = [exercises[index], exercises[index - 1]]; patchDraft({ exercises }); }}><ChevronUp size={12}/></button><button type="button" aria-label={`Move question ${index + 1} down`} disabled={index === draft.exercises.length - 1} onClick={() => { const exercises = [...draft.exercises]; [exercises[index], exercises[index + 1]] = [exercises[index + 1], exercises[index]]; patchDraft({ exercises }); }}><ChevronDown size={12}/></button></span>
              <button type="button" aria-label={`Remove question ${index + 1}`} onClick={() => patchDraft({ exercises: draft.exercises.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={14}/></button>
            </div>)}
          </div>
          <button className="kids-generate-button" onClick={() => regenerate()}><Sparkles size={15}/> Generate this worksheet</button>
        </div>
        <div className="kids-preview-column">
          <div className="kids-preview-toolbar"><div><b>Live A4 preview</b><small>{pages.length} page{pages.length === 1 ? "" : "s"} · {draft.orientation}</small></div>
            <div className="kids-preview-pager"><button aria-label="Previous preview page" disabled={selectedPage <= 0} onClick={() => setSelectedPage(page => Math.max(0, page - 1))}><ArrowLeft size={15}/></button><span>{selectedPage + 1} / {pages.length || 1}</span><button aria-label="Next preview page" disabled={selectedPage >= maxPreview} onClick={() => setSelectedPage(page => Math.min(maxPreview, page + 1))}><ArrowRight size={15}/></button></div>
          </div>
          <div className="kids-preview-stage">{pages[selectedPage] && <WorksheetPage draft={draft} exercises={pages[selectedPage].items} pageNumber={pages[selectedPage].pageNumber} answerSheet={pages[selectedPage].answerSheet}/>}</div>
          <div className="kids-print-actions"><button className="kids-primary" onClick={() => void print(false)}><FileText size={16}/> Preview / PDF</button><button className="kids-secondary" onClick={() => void print(true)}><Printer size={16}/> Print</button><span><Check size={13}/> A4 · {draft.orientation}</span></div>
          <div className="kids-print-hint">Desktop opens PaperBloom’s local PDF preview. Use Print to choose your printer, or select “Microsoft Print to PDF” to save a PDF.</div>
        </div>
      </div>
    </div>}

    <div className="kids-section-heading kids-saved-heading"><div><span className="kids-eyebrow">YOUR DEVICE LIBRARY</span><h2>Saved &amp; recent worksheets</h2><p>Saved locally for this bookshop account. Reopen or make a copy anytime.</p></div><div className="kids-editor-actions"><span className="kids-template-count">{saved.length} saved</span>{selectedSaved.length > 0 && <button className="kids-secondary" onClick={() => void print(true, true)}><Printer size={14}/> Print selected ({selectedSaved.length})</button>}</div></div>
    {isLoading ? <div className="kids-empty-card">Loading your saved worksheets…</div> : error && !draft ? <div className="kids-error-banner">{error}</div> : saved.length ? <div className="kids-saved-grid">{saved.map(item => <article className="kids-saved-card" key={item.id}>
      <input type="checkbox" aria-label={`Select ${item.title} for batch printing`} checked={selectedSaved.includes(item.id)} onChange={event => setSelectedSaved(current => event.target.checked ? [...new Set([...current, item.id])] : current.filter(id => id !== item.id))}/>
      <div className="kids-saved-icon"><FileText size={18}/></div><div className="kids-saved-info"><b>{item.title}</b><small>{item.category} · Grade {item.grade} · {new Date(item.updatedAt).toLocaleDateString()}</small></div>
      <button title="Open worksheet" onClick={() => openDraft(item)}><ArrowDown size={15}/></button><button title="Duplicate worksheet" onClick={() => openDraft(item, true)}><Copy size={14}/></button><button title="Delete worksheet" onClick={() => void removeDraft(item.id)}><Trash2 size={14}/></button>
    </article>)}</div> : <div className="kids-empty-card"><Heart size={17}/> Save a worksheet from the editor and it will be waiting here next time.</div>}
    {(status || error) && <div className={error ? "kids-error-banner" : "kids-status-banner"} role={error ? "alert" : "status"}>{error || status}{error && <button onClick={() => setError("")}>Dismiss</button>}</div>}

    {(draft || batchPrint && selectedSaved.length > 0) && <div className="kids-print-root" aria-hidden="true">
      {(batchPrint ? saved.filter(item => selectedSaved.includes(item.id)) : draft ? [draft] : []).flatMap(printDraft => {
        const worksheetPages = toPages(printDraft.exercises, printDraft.orientation === "landscape" ? 10 : 8);
        const batchPages = [
          ...worksheetPages.map((items, index) => ({ items, pageNumber: index, answerSheet: false })),
          ...(printDraft.includeAnswerKey ? toPages(printDraft.exercises, 24).map((items, index) => ({ items, pageNumber: worksheetPages.length + index, answerSheet: true })) : [])
        ];
        return batchPages.map((page, index) => <WorksheetPage key={`${printDraft.id}-${page.answerSheet ? "answers" : "worksheet"}-${index}`} draft={printDraft} exercises={page.items} pageNumber={page.pageNumber} answerSheet={page.answerSheet}/>);
      })}
    </div>}
  </section>;
}
