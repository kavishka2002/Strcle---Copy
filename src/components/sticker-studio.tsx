"use client";

import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, Copy, Download, FileImage, Files, Megaphone,
  FileText, FileUser, Flower2, FolderHeart, Heart, Home, ImagePlus, Layers, LayoutGrid, Menu, Minus, Palette, Shapes,
  Plus, Printer, RotateCcw, Save, Search, Settings, Sparkles, Trash2, Upload, WandSparkles, X
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createStarterAsset, englishBookSubjectOptions, starterArtwork, starterTemplates, subjectPresets } from "@/data/templates";
import { newDesignTemplateIds, newDesignTemplates } from "@/data/new-templates";
import { customArtworkAssets, customArtworkTemplateIds, customArtworkTemplates } from "@/data/custom-art-templates";
import { printableLabelCategories, printableLabelCategoryById, printableLabelTemplateIds, printableLabelTemplates, type PrintableLabelCategory } from "@/data/printable-label-templates";
import { sinhalaAlphabetSections, type SinhalaAlphabetSectionId } from "@/data/sinhala-alphabet";
import { CUSTOM_SIZE_ARTWORK_ID, CUSTOM_SIZE_TEMPLATE_ID, customSizeTemplate } from "@/data/custom-size-template";
import { createDesign, createSubjectDesign, templateFromDesign } from "@/lib/design";
import { db, getActiveTenantId, readRecentIds, writeRecentIds } from "@/lib/database";
import { isSupportedCustomSize, measurementToMillimeters, millimetersToMeasurement } from "@/lib/custom-size";
import { calculateSheetLayout } from "@/lib/layout";
import { createPrintSticker, getPrintStickerCount, getPrintSubjectIndex, getPrintSubjects } from "@/lib/printing";
import { englishFonts, fontPreviewText, fontCategories, normalizeFontSelection, resolvedFontWeight, sinhalaFonts, textFontStack } from "@/lib/font-catalog";
import { initializeSinglish, transliterateSinglish, updateLiveTransliterationDraft } from "@/lib/sinhala";
import { getDisplayText, getFittedFontSize } from "@/lib/text-layout";
import { formatGradeForCard } from "@/lib/grade";
import { addMissingStarterSubjects } from "@/lib/subject-presets";
import { englishSubjectName, isEnglishCardSubject, subjectNameForLanguage } from "@/lib/subject-labels";
import { StickerDecoration } from "@/components/sticker-decoration";
import { CustomPrintStudio } from "@/components/custom-print-studio";
import { OlPastPapers } from "@/components/ol-past-papers";
import { ColoringSheetLibrary } from "@/components/coloring-sheet-library";
import { CvBuilder } from "@/components/cv-builder";
import { DocumentLibrary } from "@/components/document-library";
import { A4NoticeLibrary } from "@/components/a4-notice-library";
import { SinhalaHodiya } from "@/components/sinhala-hodiya";
import { LanguageToggle, LocalizedUi, ThemeToggle } from "@/components/app-language";
import { AppToast } from "@/components/app-toast";
import { DesktopUpdateManager } from "@/components/desktop-update-manager";
import { useAppDialog } from "@/components/app-dialog";
import { useTrialAccess } from "@/components/trial-access";
import { printCurrentPage } from "@/lib/print-page";
import type { AssetCategory, DesignImage, EnglishFontFamily, ImageAsset, LanguageMode, MeasurementUnit, SinhalaFontFamily, StickerDesign, StickerTemplate, TextElement, TextInputMode } from "@/types";

type Section = "Home" | "Create sticker" | "Templates" | "Recent designs" | "Saved designs" | "PNG assets" | "Past Paper Finder" | "Picture Colouring Library" | "CV Builder" | "Documents & Forms" | "A4 print studio" | "A4 Notice & Advertisement Templates" | "Sinhala Hodiya" | "Custom Print Studio" | "Settings";
const navGroups: Array<{ label: string; items: Array<{ title: Section; icon: typeof Home }> }> = [
  { label: "Workspace", items: [{ title: "Home", icon: Home }, { title: "Create sticker", icon: Sparkles }, { title: "Templates", icon: LayoutGrid }] },
  { label: "Your library", items: [{ title: "Recent designs", icon: RotateCcw }, { title: "Saved designs", icon: FolderHeart }, { title: "PNG assets", icon: FileImage }, { title: "Picture Colouring Library", icon: ImagePlus }, { title: "Past Paper Finder", icon: Files }, { title: "CV Builder", icon: FileUser }, { title: "Documents & Forms", icon: FileText }] },
  { label: "Production", items: [{ title: "A4 print studio", icon: Printer }, { title: "A4 Notice & Advertisement Templates", icon: Megaphone }, { title: "Sinhala Hodiya", icon: BookOpen }, { title: "Custom Print Studio", icon: Shapes }] },
  { label: "Preferences", items: [{ title: "Settings", icon: Settings }] }
];
const categories: AssetCategory[] = ["Cartoon", "Flowers", "Animals", "Nature", "School", "Sports", "Space", "Custom"];
const colors = ["#000000", "#34465e", "#397b68", "#c88a3d", "#754fa1", "#428e73", "#356dba"];
const uid = () => crypto.randomUUID();
const allNewTemplateIds = new Set([...newDesignTemplateIds, ...customArtworkTemplateIds, ...printableLabelTemplateIds, CUSTOM_SIZE_TEMPLATE_ID]);
const formatMeasurement = (millimeters: number, unit: MeasurementUnit) =>
  Number(millimetersToMeasurement(millimeters, unit).toFixed(3)).toString();
const formatMillimeters = (millimeters: number) => Number(millimeters.toFixed(2)).toString();
const subjectLabel = (subject: { en: string; si: string }) => englishSubjectName(subject);
const containsSinhala = (value: string) => /[\u0D80-\u0DFF]/.test(value);
const isCircularSticker = (design: Pick<StickerDesign, "widthMm" | "heightMm" | "radius">) =>
  design.widthMm === design.heightMm && design.radius * 0.2646 >= design.widthMm / 2 - 0.1;
const stickerCornerRadius = (design: StickerDesign) => isCircularSticker(design) ? "50%" : `${design.radius}px`;
const printCornerRadius = (design: StickerDesign) => isCircularSticker(design) ? "50%" : `${design.radius * 0.2646}mm`;
const normalizeDesign = (design: StickerDesign): StickerDesign => {
  const subjects = design.printSubjects?.map(subject => subject.trim()).filter(Boolean) ?? [];
  const combinedSubject = subjects.join(" • ");
  return {
    ...design,
    texts: (design.texts ?? []).map(text => {
      const fontSelection = normalizeFontSelection(text.fontFamily, text.sinhalaFontFamily);
      return {
        ...text,
        ...(text.field === "subject" && combinedSubject && text.text.trim() === combinedSubject ? { text: subjects[0] } : {}),
        lineHeight: text.lineHeight ?? 1.18,
        letterSpacing: text.letterSpacing ?? 0,
        height: text.height ?? (text.field === "name" ? 22 : text.field === "school" ? 17 : 14),
        wrap: text.wrap ?? true,
        fontFamily: fontSelection.english,
        sinhalaFontFamily: fontSelection.sinhala
      };
    }),
    images: design.images ?? []
  };
};

function reflowForCustomFields(texts: TextElement[]): TextElement[] {
  const customTexts = texts.filter(text => text.field === "custom" && text.visible && text.text.trim());
  const count = customTexts.length;
  if (count === 0) return texts;

  const layouts: Record<number, { standard: Record<"name" | "school" | "grade" | "subject", number>; custom: number[]; customHeight: number; customFontSize: number }> = {
    1: { standard: { name: 21, school: 39, grade: 56, subject: 70 }, custom: [89], customHeight: 12, customFontSize: 9 },
    2: { standard: { name: 18, school: 33, grade: 47, subject: 61 }, custom: [78, 92], customHeight: 10, customFontSize: 8 },
    3: { standard: { name: 15, school: 28, grade: 40, subject: 52 }, custom: [66, 79, 92], customHeight: 8, customFontSize: 7 }
  };
  const layout = layouts[count];
  if (!layout) return texts;

  let customIndex = 0;
  return texts.map(text => {
    if (text.field === "custom") {
      if (!text.visible || !text.text.trim()) return text;
      const index = customIndex++;
      return { ...text, y: layout.custom[index], height: layout.customHeight, fontSize: Math.min(text.fontSize, layout.customFontSize) };
    }
    return { ...text, y: layout.standard[text.field] };
  });
}

async function loadStarterAssets(existingAssets: ImageAsset[]): Promise<ImageAsset[]> {
  const assets = [...existingAssets];
  const existingIds = new Set(existingAssets.map(asset => asset.id));

  for (const artwork of starterArtwork) {
    if (existingIds.has(artwork.id)) continue;
    const response = await fetch(`/starter-art/${artwork.file}`);
    if (!response.ok) throw new Error(`Could not load starter illustration "${artwork.name}".`);
    const asset = createStarterAsset(artwork, await response.blob());
    await db.putAsset(asset);
    assets.push(asset);
  }

  if (!existingIds.has(CUSTOM_SIZE_ARTWORK_ID)) {
    const response = await fetch("/starter-art/custom-size-apple-pencil.png");
    if (!response.ok) throw new Error("Could not load the custom sticker apple-and-pencil illustration.");
    assets.push({
      id: CUSTOM_SIZE_ARTWORK_ID,
      name: "Apple & pencil",
      category: "School",
      type: "image/png",
      blob: await response.blob(),
      createdAt: 0,
      bundled: true
    });
    await db.putAsset(assets[assets.length - 1]);
    existingIds.add(CUSTOM_SIZE_ARTWORK_ID);
  }

  for (const artwork of customArtworkAssets) {
    if (existingIds.has(artwork.id)) continue;
    const response = await fetch(`/${artwork.folder ?? "custom-art"}/${artwork.file}`);
    if (!response.ok) throw new Error(`Could not load supplied illustration "${artwork.name}".`);
    const asset: ImageAsset = {
      id: artwork.id,
      name: artwork.name,
      category: artwork.category,
      type: artwork.file.toLowerCase().endsWith(".jpg") ? "image/jpeg" : "image/png",
      blob: await response.blob(),
      createdAt: 0,
      bundled: true
    };
    await db.putAsset(asset);
    assets.push(asset);
    existingIds.add(artwork.id);
  }

  return assets;
}

export function StickerStudio() {
  const { confirm, prompt, host: dialogHost } = useAppDialog();
  const isTrial = useTrialAccess();
  const [section, setSection] = useState<Section>("Home");
  const [sectionHistory, setSectionHistory] = useState<Section[]>([]);
  const [templates, setTemplates] = useState<StickerTemplate[]>([]);
  const [templateCollection, setTemplateCollection] = useState<"existing" | "new">("existing");
  const [printableLabelCategory, setPrintableLabelCategory] = useState<PrintableLabelCategory | "All">("All");
  const [customUnit, setCustomUnit] = useState<MeasurementUnit>("in");
  const [customWidthMm, setCustomWidthMm] = useState(customSizeTemplate.widthMm);
  const [customHeightMm, setCustomHeightMm] = useState(customSizeTemplate.heightMm);
  const [customWidthInput, setCustomWidthInput] = useState(formatMeasurement(customSizeTemplate.widthMm, "in"));
  const [customHeightInput, setCustomHeightInput] = useState(formatMeasurement(customSizeTemplate.heightMm, "in"));
  const [designWidthInput, setDesignWidthInput] = useState("");
  const [designHeightInput, setDesignHeightInput] = useState("");
  const [customStyleTemplateId, setCustomStyleTemplateId] = useState(CUSTOM_SIZE_TEMPLATE_ID);
  const [subjectOptions, setSubjectOptions] = useState(subjectPresets);
  const [subjectGroup, setSubjectGroup] = useState("1-5");
  const [designs, setDesigns] = useState<StickerDesign[]>([]);
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [design, setDesign] = useState<StickerDesign | null>(null);
  const [previewSubject, setPreviewSubject] = useState("");
  const [selectedText, setSelectedText] = useState<string>("name");
  const [language, setLanguage] = useState<LanguageMode>("English");
  const [typingMode, setTypingMode] = useState<TextInputMode>("English");
  const [transliterationStatus, setTransliterationStatus] = useState<"loading" | "ready" | "error">("loading");
  const [transliterationError, setTransliterationError] = useState("");
  const [student, setStudent] = useState({ name: "", grade: "", school: "", customSubject: "", stream: "", englishName: "", englishSchool: "" });
  const [subjectsSelected, setSubjectsSelected] = useState<string[]>([]);
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [kind, setKind] = useState<"sticker" | "cover">("sticker");
  const [selectedTemplateId, setSelectedTemplateId] = useState("art-tiger");
  const [generatedBatch, setGeneratedBatch] = useState<StickerDesign[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AssetCategory | "All">("All");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copies, setCopies] = useState(1);
  const [margin, setMargin] = useState(4);
  const [gapX, setGapX] = useState(2.5);
  const [gapY, setGapY] = useState(2.5);
  const [printOrientation, setPrintOrientation] = useState<"portrait" | "landscape">("portrait");
  const [printPage, setPrintPage] = useState(0);
  const [sinhalaAlphabetPanelVisible, setSinhalaAlphabetPanelVisible] = useState(true);
  const [sinhalaAlphabetSection, setSinhalaAlphabetSection] = useState<SinhalaAlphabetSectionId>("vowels");
  const [sinhalaAlphabetDraft, setSinhalaAlphabetDraft] = useState<string[]>([]);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const stickerTextInputRef = useRef<HTMLTextAreaElement>(null);
  const stickerTextSelectionRef = useRef<{ textId: string; start: number; end: number } | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preferencesLoaded = useRef(false);
  const dragRef = useRef<{ id: string; type: "text" | "image"; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const transliterationDrafts = useRef<Record<string, { rawValue: string; displayedValue: string }>>({});
  const studentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const composingStudentFields = useRef(new Set<string>());
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    try {
      const [storedDesigns, storedTemplates, storedAssets, storedSubjectPresets] = await Promise.all([db.getAllDesigns(), db.getAllTemplates(), db.getAllAssets(), db.getAllSubjectPresets()]);
      const storedTemplateById = new Map(storedTemplates.map(template => [template.id, template]));
      const seededTemplates = starterTemplates.map(template => ({
        ...template,
        favourite: storedTemplateById.get(template.id)?.favourite ?? template.favourite
      }));
      const starterTemplateIds = new Set(starterTemplates.map(template => template.id));
      const seededNewTemplates = newDesignTemplates.map(template => ({
        ...template,
        favourite: storedTemplateById.get(template.id)?.favourite ?? template.favourite
      }));
      const seededArtworkTemplates = customArtworkTemplates.map(template => ({
        ...template,
        favourite: storedTemplateById.get(template.id)?.favourite ?? template.favourite
      }));
      const seededPrintableLabelTemplates = printableLabelTemplates.map(template => ({
        ...template,
        favourite: storedTemplateById.get(template.id)?.favourite ?? template.favourite
      }));
      const seededCustomSizeTemplate = {
        ...customSizeTemplate,
        favourite: storedTemplateById.get(customSizeTemplate.id)?.favourite ?? customSizeTemplate.favourite
      };
      await Promise.all([...seededTemplates, ...seededNewTemplates, ...seededArtworkTemplates, ...seededPrintableLabelTemplates, seededCustomSizeTemplate].map(template => db.putTemplate(template)));
      const mergedTemplates = [
        ...seededTemplates,
        ...seededNewTemplates,
        ...seededArtworkTemplates,
        ...seededPrintableLabelTemplates,
        seededCustomSizeTemplate,
        ...storedTemplates.filter(template => template.userCreated && !starterTemplateIds.has(template.id) && !allNewTemplateIds.has(template.id))
      ];
      const mergedAssets = await loadStarterAssets(storedAssets);
      const storedPresetsByBand = new Map(storedSubjectPresets.map(preset => [preset.gradeBand, preset]));
      const mergedSubjects = { ...subjectPresets };
      await Promise.all(Object.entries(subjectPresets).map(async ([gradeBand, starterSubjects]) => {
        const storedPreset = storedPresetsByBand.get(gradeBand);
        if (!storedPreset) {
          await db.putSubjectPreset({ gradeBand, subjects: starterSubjects, starterVersion: 1 });
          return;
        }
        if ((storedPreset.starterVersion ?? 0) < 1) {
          const subjects = addMissingStarterSubjects(storedPreset.subjects, starterSubjects);
          await db.putSubjectPreset({ ...storedPreset, subjects, starterVersion: 1 });
          mergedSubjects[gradeBand] = subjects;
          return;
        }
        mergedSubjects[gradeBand] = storedPreset.subjects;
      }));
      setDesigns(storedDesigns.map(normalizeDesign).sort((a, b) => b.updatedAt - a.updatedAt));
      setTemplates(mergedTemplates);
      setSubjectOptions(mergedSubjects);
      setAssets(mergedAssets.sort((a, b) => b.createdAt - a.createdAt));
      setRecentIds(readRecentIds());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load local studio data.");
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    let active = true;
    void initializeSinglish().then(() => {
      if (active) setTransliterationStatus("ready");
    }).catch(e => {
      if (!active) return;
      setTransliterationStatus("error");
      setTransliterationError(e instanceof Error ? e.message : "Could not load Sinhala typing support.");
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`little-paper-language:${getActiveTenantId()}`);
      if (stored === "English" || stored === "Sinhala" || stored === "Sinhala + English") setLanguage(stored);
      const storedTypingMode = localStorage.getItem(`little-paper-typing-mode:${getActiveTenantId()}`);
      if (storedTypingMode === "English" || storedTypingMode === "Sinhala Keyboard" || storedTypingMode === "Singlish to Sinhala") {
        setTypingMode(storedTypingMode);
      }
      preferencesLoaded.current = true;
    } catch (e) {
      preferencesLoaded.current = true;
      setError(e instanceof Error ? e.message : "Could not read local preferences.");
    }
  }, []);
  useEffect(() => {
    if (!preferencesLoaded.current) return;
    try { localStorage.setItem(`little-paper-language:${getActiveTenantId()}`, language); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save the language preference."); }
  }, [language]);
  useEffect(() => {
    if (!preferencesLoaded.current) return;
    try { localStorage.setItem(`little-paper-typing-mode:${getActiveTenantId()}`, typingMode); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save the text input mode."); }
  }, [typingMode]);
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const asset of assets) next[asset.id] = URL.createObjectURL(asset.blob);
    setAssetUrls(next);
    return () => Object.values(next).forEach(URL.revokeObjectURL);
  }, [assets]);
  useEffect(() => {
    if (!design) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      const saved = { ...design, updatedAt: Date.now(), lastUsedAt: Date.now() };
      try {
        await db.putDesign(saved);
        writeRecentIds(saved.id);
        setDesigns(prev => [saved, ...prev.filter(item => item.id !== saved.id)]);
        setRecentIds(readRecentIds());
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save the latest edit.");
      }
    }, 450);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [design]);

  const sortedRecent = useMemo(() => recentIds.map(id => designs.find(d => d.id === id)).filter((d): d is StickerDesign => !!d), [recentIds, designs]);
  const visibleTemplates = templates.filter(t =>
    t.kind === kind &&
    (templateCollection === "new" ? allNewTemplateIds.has(t.id) : !allNewTemplateIds.has(t.id)) &&
    (templateCollection !== "new" || printableLabelCategory === "All" || printableLabelCategoryById.get(t.id) === printableLabelCategory) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );
  const availableSubjects = useMemo(() => {
    const grade = Number(student.grade.replace(/\D/g, ""));
    const band = grade >= 12 ? "12-13" : grade >= 6 ? "6-11" : "1-5";
    const gradeSubjects = subjectOptions[band] ?? subjectOptions["1-5"];
    const subjectsByName = new Map(gradeSubjects.map(subject => [subject.en, subject]));
    for (const subject of englishBookSubjectOptions) subjectsByName.set(subject.en, subject);
    return [...subjectsByName.values()];
  }, [student.grade, subjectOptions]);
  const unavailableSubjects = subjectsSelected.filter(value => !availableSubjects.some(subject => subject.en === value));
  const selectedSubjectLabels = useMemo(() => [
    ...subjectsSelected.map(value => {
      const option = availableSubjects.find(subject => subject.en === value);
      const subject = option ? subjectNameForLanguage(option, language) : value;
      return student.stream ? `${student.stream} · ${subject}` : subject;
    }),
    ...customSubjects,
    student.customSubject.trim()
  ].filter(Boolean), [availableSubjects, customSubjects, language, student.customSubject, student.stream, subjectsSelected]);
  const addCustomSubject = () => {
    const value = student.customSubject.trim();
    if (!value) return;
    const existingSubjects = [...subjectsSelected, ...customSubjects].map(subject => subject.trim().toLocaleLowerCase());
    if (existingSubjects.includes(value.toLocaleLowerCase())) {
      setError("That subject has already been added.");
      return;
    }
    if (isEnglishCardSubject(value)) {
      const includesSinhala = (text: string) => /[\u0D80-\u0DFF]/.test(text);
      setStudent(previous => ({
        ...previous,
        englishName: previous.englishName || (includesSinhala(previous.name) ? "" : previous.name),
        englishSchool: previous.englishSchool || (includesSinhala(previous.school) ? "" : previous.school)
      }));
    }
    setCustomSubjects(previous => [...previous, value]);
    setStudent(previous => ({ ...previous, customSubject: "" }));
    transliterationDrafts.current.customSubject = { rawValue: "", displayedValue: "" };
    setError("");
  };
  const toggleSubjectSelection = (value: string) => {
    if (subjectsSelected.includes(value)) {
      setSubjectsSelected(previous => previous.filter(subject => subject !== value));
      return;
    }
    if (isEnglishCardSubject(value)) {
      const includesSinhala = (text: string) => /[\u0D80-\u0DFF]/.test(text);
      setStudent(previous => ({
        ...previous,
        englishName: previous.englishName || (includesSinhala(previous.name) ? "" : previous.name),
        englishSchool: previous.englishSchool || (includesSinhala(previous.school) ? "" : previous.school)
      }));
    }
    setSubjectsSelected(previous => [...previous, value]);
  };
  const filteredSubjects = useMemo(() => {
    const queries = new Set([subjectSearch.toLocaleLowerCase()]);
    if (language === "Sinhala" && transliterationStatus === "ready") queries.add(transliterateSinglish(subjectSearch).toLocaleLowerCase());
    return availableSubjects.filter(subject => {
      const labels = `${subject.en} ${subject.si}`.toLocaleLowerCase();
      return [...queries].some(query => labels.includes(query));
    });
  }, [availableSubjects, language, subjectSearch, transliterationStatus]);
  const printSubjects = useMemo(() => design ? getPrintSubjects(design) : [], [design]);
  const totalPrintStickers = useMemo(() => {
    try { return getPrintStickerCount(copies, printSubjects); }
    catch { return 0; }
  }, [copies, printSubjects]);
  const sheetLayout = useMemo(() => {
    if (!design || !totalPrintStickers) return null;
    try { return calculateSheetLayout(design.widthMm, design.heightMm, totalPrintStickers, margin, gapX, gapY, printOrientation === "portrait" ? 210 : 297, printOrientation === "portrait" ? 297 : 210); }
    catch { return null; }
  }, [design, totalPrintStickers, margin, gapX, gapY, printOrientation]);

  const persistDesign = useCallback(async (next: StickerDesign, announce = false) => {
    const saved = { ...next, updatedAt: Date.now(), lastUsedAt: Date.now() };
    try {
      await db.putDesign(saved);
      writeRecentIds(saved.id);
      setDesigns(prev => [saved, ...prev.filter(d => d.id !== saved.id)]);
      setRecentIds(readRecentIds());
      setGeneratedBatch(prev => prev.map(item => item.id === saved.id ? saved : item));
      setDesign(saved);
      if (saved.customDimensionUnit) {
        setDesignWidthInput(formatMeasurement(saved.widthMm, saved.customDimensionUnit));
        setDesignHeightInput(formatMeasurement(saved.heightMm, saved.customDimensionUnit));
        setCustomUnit(saved.customDimensionUnit);
        setCustomWidthMm(saved.widthMm);
        setCustomHeightMm(saved.heightMm);
        setCustomWidthInput(formatMeasurement(saved.widthMm, saved.customDimensionUnit));
        setCustomHeightInput(formatMeasurement(saved.heightMm, saved.customDimensionUnit));
      }
      if (announce) setMessage("Design saved on this device.");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this design.");
    }
  }, []);

  const patchDesign = (patch: Partial<StickerDesign>) => {
    if (!design) return;
    const updated = { ...design, ...patch };
    setDesign(updated);
    setGeneratedBatch(prev => prev.map(item => item.id === updated.id ? updated : item));
  };
  const updateCustomDesignDimension = (axis: "width" | "height", value: number, unit: MeasurementUnit, rawValue: string) => {
    if (!design) return;
    if (axis === "width") setDesignWidthInput(rawValue);
    else setDesignHeightInput(rawValue);
    const millimeters = measurementToMillimeters(value, unit);
    const widthMm = axis === "width" ? millimeters : design.widthMm;
    const heightMm = axis === "height" ? millimeters : design.heightMm;
    if (!isSupportedCustomSize(widthMm, heightMm)) {
      setError(axis === "width"
        ? "Width must be between 20 and 200 mm (0.79–7.87 in or 2–20 cm)."
        : "Height must be between 15 and 280 mm (0.59–11.02 in or 1.5–28 cm).");
      return;
    }
    patchDesign(axis === "width" ? { widthMm } : { heightMm });
    setError("");
  };
  const updateCreationDimension = (axis: "width" | "height", rawValue: string) => {
    if (axis === "width") setCustomWidthInput(rawValue);
    else setCustomHeightInput(rawValue);
    const value = Number(rawValue);
    const millimeters = measurementToMillimeters(value, customUnit);
    const widthMm = axis === "width" ? millimeters : customWidthMm;
    const heightMm = axis === "height" ? millimeters : customHeightMm;
    if (rawValue.trim() && isSupportedCustomSize(widthMm, heightMm)) {
      if (axis === "width") setCustomWidthMm(millimeters);
      else setCustomHeightMm(millimeters);
      setError("");
    } else {
      setError(axis === "width"
        ? "Width must be between 20 and 200 mm (0.79–7.87 in or 2–20 cm)."
        : "Height must be between 15 and 280 mm (0.59–11.02 in or 1.5–28 cm).");
    }
  };
  const updateText = (textId: string, patch: Partial<TextElement>) => {
    if (!design) return;
    const target = design.texts.find(text => text.id === textId || text.field === textId);
    if (!target) return;
    const activeSubject = design.printSubjects?.includes(previewSubject)
      ? previewSubject
      : design.texts.find(text => text.field === "subject")?.text ?? "";
    const selectedSubjectIndex = target.field === "subject" && patch.text !== undefined
      ? design.printSubjects?.indexOf(activeSubject) ?? -1
      : -1;
    const selectedSubjects = selectedSubjectIndex >= 0 && design.printSubjects
      ? design.printSubjects.map((subject, index) => index === selectedSubjectIndex ? patch.text!.trim() : subject)
      : undefined;
    const updatedTexts = design.texts.map(text => text.id === target.id ? { ...text, ...patch } : text);
    const previousCustomCount = design.texts.filter(text => text.field === "custom" && text.visible && text.text.trim()).length;
    const nextCustomCount = updatedTexts.filter(text => text.field === "custom" && text.visible && text.text.trim()).length;
    const englishPreview = isEnglishCardSubject(activeSubject);
    patchDesign({
      texts: previousCustomCount === nextCustomCount ? updatedTexts : reflowForCustomFields(updatedTexts),
      ...(selectedSubjects ? { printSubjects: selectedSubjects } : {}),
      ...(englishPreview && target.field === "name" && patch.text !== undefined ? { englishCardName: patch.text } : {}),
      ...(englishPreview && target.field === "grade" && patch.text !== undefined ? { englishCardGrade: patch.text } : {}),
      ...(englishPreview && target.field === "school" && patch.text !== undefined ? { englishCardSchool: patch.text } : {}),
      ...(!englishPreview && target.field === "name" && patch.text !== undefined ? { defaultCardName: patch.text } : {}),
      ...(!englishPreview && target.field === "grade" && patch.text !== undefined ? { defaultCardGrade: patch.text } : {}),
      ...(!englishPreview && target.field === "school" && patch.text !== undefined ? { defaultCardSchool: patch.text } : {})
    });
  };
  const updateStickerTextInput = (text: TextElement, nextValue: string, selectionStart: number, isComposing = false) => {
    const draftKey = `sticker:${text.id}`;
    if (typingMode !== "Singlish to Sinhala" || transliterationStatus !== "ready") {
      transliterationDrafts.current[draftKey] = { rawValue: nextValue, displayedValue: nextValue };
      updateText(text.id, { text: nextValue, ...(!text.text.trim() ? { visible: !!nextValue.trim() } : {}) });
      return;
    }

    const currentDraft = transliterationDrafts.current[draftKey] ?? { rawValue: text.text, displayedValue: text.text };
    if (isComposing) {
      transliterationDrafts.current[draftKey] = { rawValue: nextValue, displayedValue: nextValue };
      updateText(text.id, { text: nextValue, ...(!text.text.trim() ? { visible: !!nextValue.trim() } : {}) });
      return;
    }

    const result = updateLiveTransliterationDraft(currentDraft, nextValue, selectionStart);
    transliterationDrafts.current[draftKey] = result.draft;
    updateText(text.id, { text: result.draft.displayedValue, ...(!text.text.trim() ? { visible: !!result.draft.displayedValue.trim() } : {}) });
    requestAnimationFrame(() => {
      const input = stickerTextInputRef.current;
      if (input && document.activeElement === input) input.setSelectionRange(result.caret, result.caret);
    });
  };
  const rememberStickerTextSelection = (textId: string, input: HTMLTextAreaElement) => {
    stickerTextSelectionRef.current = {
      textId,
      start: input.selectionStart,
      end: input.selectionEnd
    };
  };
  const insertSinhalaAlphabetDraft = (text: TextElement) => {
    const insertion = sinhalaAlphabetDraft.join("");
    if (!insertion) return;

    const selection = stickerTextSelectionRef.current?.textId === text.id
      ? stickerTextSelectionRef.current
      : { start: text.text.length, end: text.text.length };
    const start = Math.max(0, Math.min(selection.start, text.text.length));
    const end = Math.max(start, Math.min(selection.end, text.text.length));
    const nextText = `${text.text.slice(0, start)}${insertion}${text.text.slice(end)}`;
    const caret = start + insertion.length;

    transliterationDrafts.current[`sticker:${text.id}`] = { rawValue: nextText, displayedValue: nextText };
    updateText(text.id, { text: nextText, visible: !!nextText.trim() });
    stickerTextSelectionRef.current = { textId: text.id, start: caret, end: caret };
    setSinhalaAlphabetDraft([]);
    requestAnimationFrame(() => {
      const input = stickerTextInputRef.current;
      if (!input) return;
      input.focus();
      input.setSelectionRange(caret, caret);
    });
  };
  const beginStickerTextInput = (text: TextElement, currentText = text.text) => {
    transliterationDrafts.current[`sticker:${text.id}`] = { rawValue: currentText, displayedValue: currentText };
  };
  const addCustomText = () => {
    if (!design) return;
    const customCount = design.texts.filter(text => text.field === "custom").length;
    if (customCount >= 3) {
      setMessage("A sticker can have up to three extra fields to keep the printed text readable.");
      return;
    }
    const text: TextElement = {
      id: uid(),
      field: "custom",
      customLabel: "Student ID",
      text: "",
      visible: false,
      fontFamily: "Inter",
      fontSize: 9,
      height: 12,
      wrap: true,
      color: design.texts.find(item => item.field === "name")?.color ?? design.borderColor,
      bold: false,
      align: "center",
      x: 66,
      y: 89,
      width: 62,
      rotation: 0,
      lineHeight: 1.12,
      letterSpacing: 0
    };
    patchDesign({ texts: reflowForCustomFields([...design.texts, text]) });
    setSelectedText(text.id);
  };
  const removeCustomText = (textId: string) => {
    if (!design) return;
    const remaining = design.texts.filter(text => text.id !== textId);
    patchDesign({ texts: reflowForCustomFields(remaining) });
    setSelectedText("name");
  };
  const beginStudentInput = (field: keyof typeof student) => {
    transliterationDrafts.current[field] = { rawValue: student[field], displayedValue: student[field] };
  };
  const finishStudentComposition = (field: keyof typeof student, value: string, selectionStart: number) => {
    composingStudentFields.current.delete(field);
    updateStudentInput(field, value, selectionStart);
  };
  const updateStudentInput = (
    field: keyof typeof student,
    nextValue: string,
    selectionStart = nextValue.length,
    isComposing = false
  ): string => {
    const shouldTransliterate = typingMode === "Singlish to Sinhala"
      && transliterationStatus === "ready"
      && (field === "name" || field === "school" || field === "customSubject");
    if (!shouldTransliterate) {
      setStudent(previous => ({ ...previous, [field]: nextValue }));
      return nextValue;
    }

    const currentDraft = transliterationDrafts.current[field] ?? {
      rawValue: student[field],
      displayedValue: student[field]
    };
    if (isComposing) {
      transliterationDrafts.current[field] = { rawValue: nextValue, displayedValue: nextValue };
      setStudent(previous => ({ ...previous, [field]: nextValue }));
      return nextValue;
    }

    const result = updateLiveTransliterationDraft(currentDraft, nextValue, selectionStart);
    transliterationDrafts.current[field] = result.draft;
    setStudent(previous => ({ ...previous, [field]: result.draft.displayedValue }));
    requestAnimationFrame(() => {
      const input = studentInputRefs.current[field];
      if (input && document.activeElement === input) input.setSelectionRange(result.caret, result.caret);
    });
    return result.draft.displayedValue;
  };

  const openDesign = async (item: StickerDesign) => {
    const normalized = normalizeDesign(item);
    if (normalized.customDimensionUnit) {
      setDesignWidthInput(formatMeasurement(normalized.widthMm, normalized.customDimensionUnit));
      setDesignHeightInput(formatMeasurement(normalized.heightMm, normalized.customDimensionUnit));
      setCustomUnit(normalized.customDimensionUnit);
      setCustomWidthMm(normalized.widthMm);
      setCustomHeightMm(normalized.heightMm);
      setCustomWidthInput(formatMeasurement(normalized.widthMm, normalized.customDimensionUnit));
      setCustomHeightInput(formatMeasurement(normalized.heightMm, normalized.customDimensionUnit));
      setCustomStyleTemplateId(normalized.customStyleTemplateId ?? CUSTOM_SIZE_TEMPLATE_ID);
    }
    if (!generatedBatch.some(batchItem => batchItem.id === normalized.id)) setGeneratedBatch([]);
    setDesign(normalized);
    setPreviewSubject("");
    setSelectedText("name");
    changeSection("Create sticker");
    await persistDesign(normalized);
  };
  const backToSubjectSelection = async () => {
    if (!design) return;
    const savedSubjects = getPrintSubjects(design);
    const availableOptions = [...new Map(
      [...Object.values(subjectOptions).flat(), ...englishBookSubjectOptions]
        .map(subject => [subject.en, subject])
    ).values()];
    const selectedOptions: string[] = [];
    const restoredCustomSubjects: string[] = [];
    let restoredStream = "";
    for (const label of savedSubjects) {
      const matchingOption = availableOptions.find(option => {
        const localizedName = subjectNameForLanguage(option, design.language);
        if (label === option.en || label === option.si || label === localizedName) return true;
        const streamLabel = ` · ${localizedName}`;
        if (label.endsWith(streamLabel)) {
          restoredStream = label.slice(0, -streamLabel.length);
          return true;
        }
        return false;
      });
      if (matchingOption) selectedOptions.push(matchingOption.en);
      else restoredCustomSubjects.push(label);
    }
    const textFor = (field: TextElement["field"]) => design.texts.find(text => text.field === field)?.text ?? "";
    setStudent(previous => ({
      ...previous,
      name: design.defaultCardName ?? textFor("name"),
      grade: design.defaultCardGrade ?? textFor("grade"),
      school: design.defaultCardSchool ?? textFor("school"),
      englishName: design.englishCardName ?? previous.englishName,
      englishSchool: design.englishCardSchool ?? previous.englishSchool,
      stream: restoredStream,
      customSubject: ""
    }));
    setSubjectsSelected(selectedOptions);
    setCustomSubjects(restoredCustomSubjects);
    setKind(design.kind);
    setSelectedTemplateId(design.templateId);
    setPreviewSubject("");
    try {
      const saved = { ...design, updatedAt: Date.now(), lastUsedAt: Date.now() };
      await db.putDesign(saved);
      writeRecentIds(saved.id);
      setDesigns(previous => [saved, ...previous.filter(item => item.id !== saved.id)]);
      setRecentIds(readRecentIds());
      setDesign(null);
      setSelectedText("name");
      setError("");
      changeSection("Create sticker");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the current card before returning to subject selection.");
    }
  };
  const generateDesign = async (template?: StickerTemplate) => {
    if (!student.name.trim()) { setError("Add the student name to create a sticker."); return; }
    const englishSelected = selectedSubjectLabels.some(isEnglishCardSubject);
    const hasSinhalaText = containsSinhala;
    const englishCardName = student.englishName.trim() || (!hasSinhalaText(student.name) ? student.name.trim() : "");
    const englishCardSchool = student.englishSchool.trim() || (!hasSinhalaText(student.school) ? student.school.trim() : "");
    const englishCardGrade = formatGradeForCard(student.grade, language, true);
    if (englishSelected && (!englishCardName || hasSinhalaText(englishCardName))) {
      setError("Enter the student name in English for the English subject card.");
      return;
    }
    if (englishSelected && (hasSinhalaText(englishCardSchool) || (student.school.trim() && !englishCardSchool))) {
      setError("Enter the school name in English for the English subject card.");
      return;
    }
    if (englishSelected && student.grade.trim() && (!englishCardGrade || hasSinhalaText(englishCardGrade))) {
      setError("Enter a grade number for the English subject card.");
      return;
    }
    if (selectedTemplateId === CUSTOM_SIZE_TEMPLATE_ID && (
      !customWidthInput.trim() || !customHeightInput.trim()
      || !isSupportedCustomSize(
        measurementToMillimeters(Number(customWidthInput), customUnit),
        measurementToMillimeters(Number(customHeightInput), customUnit)
      )
    )) {
      setError("Choose a custom sticker width from 20 to 200 mm and a height from 15 to 280 mm.");
      return;
    }
    const selectedTemplate = template ?? (selectedTemplateId === CUSTOM_SIZE_TEMPLATE_ID
      ? {
        ...(templates.find(item => item.id === customStyleTemplateId) ?? customSizeTemplate),
        id: CUSTOM_SIZE_TEMPLATE_ID,
        name: customSizeTemplate.name,
        customStyleTemplateId,
        customDimensionUnit: customUnit,
        widthMm: customWidthMm,
        heightMm: customHeightMm
      }
      : templates.find(t => t.id === selectedTemplateId && t.kind === kind) ?? templates.find(t => t.kind === kind && t.favourite) ?? templates.find(t => t.kind === kind) ?? starterTemplates[0]);
    const subjectLabels = selectedSubjectLabels;
    const nextDesign = createSubjectDesign(student.name.trim(), {
      name: student.name.trim(), grade: formatGradeForCard(student.grade, language, false), school: student.school
    }, subjectLabels, selectedTemplate, language, englishSelected
      ? { name: englishCardName, grade: englishCardGrade, school: englishCardSchool }
      : undefined);
    if (selectedTemplate.id === CUSTOM_SIZE_TEMPLATE_ID) nextDesign.customDimensionUnit = customUnit;
    if (nextDesign.customDimensionUnit) {
      setDesignWidthInput(formatMeasurement(nextDesign.widthMm, nextDesign.customDimensionUnit));
      setDesignHeightInput(formatMeasurement(nextDesign.heightMm, nextDesign.customDimensionUnit));
    }
    try {
      const saved = { ...nextDesign, updatedAt: Date.now(), lastUsedAt: Date.now() };
      await db.putDesign(saved);
      writeRecentIds(saved.id);
      setDesigns(prev => [saved, ...prev.filter(item => item.id !== saved.id)]);
      setRecentIds(readRecentIds());
      setGeneratedBatch([saved]);
      setDesign(saved);
      setPreviewSubject("");
      setSelectedText("name");
      setError("");
      setMessage(subjectLabels.length > 1
        ? `The editor shows ${saved.texts.find(text => text.field === "subject")?.text || subjectLabels[0]}; A4 printing will include all ${subjectLabels.length} selected subjects.`
        : "Your sticker is ready to personalize.");
      changeSection("Create sticker");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the generated card.");
    }
  };
  const applyTemplate = (template: StickerTemplate) => {
    if (!design) {
      setKind(template.kind);
      changeSection("Create sticker");
      return;
    }
    const fieldText = (field: TextElement["field"]) => design.texts.find(text => text.field === field)?.text ?? "";
    const layoutDesign = createDesign(design.name, {
      name: fieldText("name"), grade: fieldText("grade"), subject: fieldText("subject"), school: fieldText("school")
    }, template, design.language);
    const existingCustomTexts = design.texts.filter(text => text.field === "custom");
    const templateCustomTexts = layoutDesign.texts.filter(text => text.field === "custom");
    const customTexts = existingCustomTexts.length
      ? existingCustomTexts.map((text, index) => templateCustomTexts[index]
        ? {
          ...templateCustomTexts[index],
          ...text,
          id: text.id,
          customLabel: text.customLabel,
          text: text.text,
          visible: text.visible
        }
        : text)
      : templateCustomTexts;
    const hasCustomDimensions = design.customDimensionUnit !== undefined;
    const becomesCustomSize = template.id === CUSTOM_SIZE_TEMPLATE_ID || template.customDimensionUnit !== undefined;
    const next = {
      ...design,
      templateId: hasCustomDimensions || becomesCustomSize ? CUSTOM_SIZE_TEMPLATE_ID : template.id,
      customDimensionUnit: hasCustomDimensions ? design.customDimensionUnit : becomesCustomSize ? template.customDimensionUnit ?? "in" : undefined,
      customStyleTemplateId: hasCustomDimensions
        ? template.id === CUSTOM_SIZE_TEMPLATE_ID ? CUSTOM_SIZE_TEMPLATE_ID : template.id
        : template.customStyleTemplateId,
      layout: template.layout, kind: template.kind,
      widthMm: hasCustomDimensions ? design.widthMm : template.widthMm,
      heightMm: hasCustomDimensions ? design.heightMm : template.heightMm,
      background: template.background,
      backgroundAssetId: template.backgroundAssetId,
      decoration: template.decoration,
      borderColor: template.borderColor, borderStyle: template.borderStyle, radius: template.radius,
      borderWidth: template.borderWidth ?? design.borderWidth, innerBorder: template.innerBorder ?? design.innerBorder,
      showCutline: template.showCutline ?? design.showCutline,
      texts: reflowForCustomFields([
        ...layoutDesign.texts.filter(text => text.field !== "custom").map(text => {
        const existing = design.texts.find(item => item.field === text.field);
        return existing ? { ...text, id: existing.id, text: existing.text, visible: existing.visible } : text;
        }),
        ...customTexts
      ]),
      images: template.images?.map(image => ({ ...image, id: uid() })) ?? design.images
    };
    if (next.customDimensionUnit) {
      setDesignWidthInput(formatMeasurement(next.widthMm, next.customDimensionUnit));
      setDesignHeightInput(formatMeasurement(next.heightMm, next.customDimensionUnit));
      setCustomUnit(next.customDimensionUnit);
      setCustomWidthMm(next.widthMm);
      setCustomHeightMm(next.heightMm);
      setCustomWidthInput(formatMeasurement(next.widthMm, next.customDimensionUnit));
      setCustomHeightInput(formatMeasurement(next.heightMm, next.customDimensionUnit));
    }
    void persistDesign(next);
    changeSection("Create sticker");
  };
  const deleteDesign = async (item: StickerDesign) => {
    if (!await confirm("Delete design", `Delete “${item.name}” from this device? This cannot be undone.`)) return;
    try {
      await db.deleteDesign(item.id);
      setDesigns(prev => prev.filter(d => d.id !== item.id));
      setRecentIds(prev => {
        const next = prev.filter(id => id !== item.id);
        localStorage.setItem(`little-paper-recent-ids:${getActiveTenantId()}`, JSON.stringify(next));
        return next;
      });
      if (design?.id === item.id) setDesign(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete this design."); }
  };
  const duplicateDesign = async (item: StickerDesign) => {
    const now = Date.now();
    await persistDesign({ ...item, id: uid(), name: `${item.name} copy`, createdAt: now, updatedAt: now, lastUsedAt: now, texts: item.texts.map(t => ({ ...t, id: uid() })), images: item.images.map(i => ({ ...i, id: uid() })) }, true);
  };
  const renameDesign = async (item: StickerDesign) => {
    const name = await prompt("Rename design", "Give this design a name", item.name);
    if (name?.trim()) await persistDesign({ ...item, name: name.trim() }, true);
  };
  const toggleFavourite = (item: StickerDesign) => void persistDesign({ ...item, favourite: !item.favourite });

  const onUpload = async (files: FileList | null) => {
    if (!files) return;
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    for (const file of Array.from(files)) {
      if (!allowed.includes(file.type)) { setError(`${file.name}: use a PNG, JPG, JPEG, or WebP image.`); continue; }
      if (file.size > 12 * 1024 * 1024) { setError(`${file.name}: image must be 12 MB or smaller.`); continue; }
      try {
        await db.putAsset({ id: uid(), name: file.name, category: "Custom", type: file.type, blob: file, createdAt: Date.now() });
      } catch (e) { setError(e instanceof Error ? e.message : "Could not store this image."); }
    }
    await refresh();
  };
  const addImage = (asset: ImageAsset, preset = "bottom-right") => {
    if (!design) { setError("Open a design before adding an illustration."); return; }
    const spots: Record<string, [number, number]> = {
      "top-left": [14, 17], "top-right": [86, 17], "bottom-left": [14, 82], "bottom-right": [86, 82],
      "top-centre": [50, 14], "bottom-centre": [50, 87], centre: [50, 50], custom: [50, 50]
    };
    const [x, y] = spots[preset] ?? spots["bottom-right"];
    const image: DesignImage = { id: uid(), assetId: asset.id, x, y, width: 16, rotation: 0 };
    patchDesign({ images: [...design.images, image] });
    setSelectedText("");
    setMessage(`${asset.name} added to your sticker.`);
  };
  const updateImage = (id: string, patch: Partial<DesignImage>) => {
    if (design) patchDesign({ images: design.images.map(img => img.id === id ? { ...img, ...patch } : img) });
  };
  const setAssetCategory = async (asset: ImageAsset, nextCategory: AssetCategory) => {
    try { await db.putAsset({ ...asset, category: nextCategory }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not update this asset category."); }
  };
  const removeAsset = async (asset: ImageAsset) => {
    if (!await confirm("Remove artwork", `Remove ${asset.name} from your library? Designs that use it will need the file added again before printing.`)) return;
    try { await db.deleteAsset(asset.id); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not remove this asset."); }
  };

  const startDrag = (event: React.PointerEvent, id: string, type: "text" | "image", x: number, y: number) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id, type, startX: event.clientX, startY: event.clientY, originX: x, originY: y };
  };
  const moveDrag = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!drag || !bounds || !design) return;
    const dx = ((event.clientX - drag.startX) / bounds.width) * 100;
    const dy = ((event.clientY - drag.startY) / bounds.height) * 100;
    if (drag.type === "text") updateText(drag.id, { x: Math.max(5, Math.min(95, drag.originX + dx)), y: Math.max(8, Math.min(92, drag.originY + dy)) });
    else updateImage(drag.id, { x: Math.max(5, Math.min(95, drag.originX + dx)), y: Math.max(5, Math.min(95, drag.originY + dy)) });
  };

  const saveTemplate = async () => {
    if (!design) return;
    const name = await prompt("Save template", "Name your new template", `${design.name} template`);
    if (!name?.trim()) return;
    const template = templateFromDesign(design, name.trim());
    try { await db.putTemplate(template); await refresh(); setMessage("Template saved for future designs."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save this template."); }
  };
  const updateTemplateFavourite = async (template: StickerTemplate) => {
    try {
      await db.putTemplate({ ...template, favourite: !template.favourite, updatedAt: Date.now() });
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update this template."); }
  };
  const renameTemplate = async (template: StickerTemplate) => {
    const name = await prompt("Rename template", "Give this template a name", template.name);
    if (!name?.trim()) return;
    try {
      await db.putTemplate({ ...template, name: name.trim(), updatedAt: Date.now() });
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not rename this template."); }
  };
  const duplicateTemplate = async (template: StickerTemplate) => {
    const now = Date.now();
    const copy = { ...template, id: uid(), name: `${template.name} copy`, favourite: false, userCreated: true, createdAt: now, updatedAt: now };
    try {
      await db.putTemplate(copy);
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not duplicate this template."); }
  };
  const saveSubjectGroup = async (gradeBand: string, subjects: Array<{ en: string; si: string }>) => {
    setSubjectOptions(previous => ({ ...previous, [gradeBand]: subjects }));
    try {
      await db.putSubjectPreset({ gradeBand, subjects, starterVersion: 1 });
      setMessage("Subject presets saved on this device.");
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save these subject presets."); }
  };
  const deleteTemplate = async (template: StickerTemplate) => {
    if (!template.userCreated || !await confirm("Delete template", `Delete template “${template.name}”?`)) return;
    try {
      await db.deleteTemplate(template.id);
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete this template."); }
  };
  const exportDesign = (item: StickerDesign) => {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${item.name.replace(/[^\w-]+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const importDesign = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Design JSON must be 5 MB or smaller.");
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || !("texts" in parsed) || !("widthMm" in parsed) || !("id" in parsed) || !("heightMm" in parsed) || !("name" in parsed) || !("images" in parsed)) throw new Error("This file is not a valid sticker design export.");
      const candidate = parsed as StickerDesign;
      const validText = (value: unknown): value is TextElement => !!value && typeof value === "object" && "text" in value && typeof value.text === "string" && "field" in value && ["name", "grade", "subject", "school"].includes(String(value.field)) && "fontSize" in value && Number.isFinite(value.fontSize);
      const validImage = (value: unknown): value is DesignImage => !!value && typeof value === "object" && "assetId" in value && typeof value.assetId === "string" && "x" in value && Number.isFinite(value.x) && "y" in value && Number.isFinite(value.y) && "width" in value && Number.isFinite(value.width);
      if (typeof candidate.name !== "string" || typeof candidate.widthMm !== "number" || !Number.isFinite(candidate.widthMm) || candidate.widthMm < 20 || candidate.widthMm > 200 || typeof candidate.heightMm !== "number" || !Number.isFinite(candidate.heightMm) || candidate.heightMm < 15 || candidate.heightMm > 280 || !Array.isArray(candidate.texts) || !candidate.texts.every(validText) || !Array.isArray(candidate.images) || !candidate.images.every(validImage)) throw new Error("The design file is missing required fields or contains invalid elements.");
      const imported = { ...candidate, id: uid(), name: `${candidate.name || "Imported design"} (imported)`, createdAt: Date.now(), updatedAt: Date.now(), lastUsedAt: Date.now() };
      await persistDesign(imported, true);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not import this design."); }
  };
  const hasInvalidCustomDimensionDraft = () => design?.customDimensionUnit !== undefined
    && (!designWidthInput.trim() || !designHeightInput.trim()
      || !isSupportedCustomSize(
        measurementToMillimeters(Number(designWidthInput), design.customDimensionUnit),
        measurementToMillimeters(Number(designHeightInput), design.customDimensionUnit)
      ));
  const print = async () => {
    if (!design || !sheetLayout) return;
    if (hasInvalidCustomDimensionDraft()) {
      setError("Correct the custom sticker dimensions before printing.");
      return;
    }
    try {
      await Promise.all(design.texts.flatMap(text => {
        const weight = resolvedFontWeight(text);
        const sample = text.text || fontPreviewText.english;
        return [text.fontFamily, text.sinhalaFontFamily ?? "Noto Sans Sinhala"].map(family =>
          document.fonts.load(`${weight} 16px "${family}"`, sample)
        );
      }));
      await document.fonts.ready;
      await Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>(".print-sheet img")).map(image => image.decode()));
      document.documentElement.classList.add(printOrientation);
      const result = await printCurrentPage({ orientation: printOrientation === "landscape" ? "landscape" : "portrait" });
      if (result.status === "printed") setMessage(`Print job sent to ${result.printerName}.`);
      else if (result.status === "previewed") setMessage("Print preview opened. Choose your printer and select Print.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not prepare print output."); }
    finally { document.documentElement.classList.remove("portrait", "landscape"); }
  };
  const visibleAssets = assets.filter(a => (category === "All" || a.category === category) && a.name.toLowerCase().includes(search.toLowerCase()));

  const changeSection = (item: Section) => {
    if (item !== section) {
      setSectionHistory(history => [...history, section]);
      setSection(item);
    }
    setMobileNavOpen(false);
    setError("");
  };
  const goBack = () => {
    const previousSection = sectionHistory[sectionHistory.length - 1];
    setSectionHistory(history => history.slice(0, -1));
    setSection(previousSection ?? "Home");
    setMobileNavOpen(false);
    setError("");
  };
  const content = () => {
    if (section === "Create sticker" && design) return Editor();
    if (section === "Create sticker" || section === "Templates") return Creation();
    if (section === "PNG assets") return AssetLibrary();
    if (section === "A4 print studio") return design ? PrintStudio() : EmptyPanel({ title: "Open a design to start printing", text: "Create or open a saved sticker first, then choose A4 Print Studio.", action: () => changeSection("Create sticker") });
    if (section === "A4 Notice & Advertisement Templates") return <A4NoticeLibrary/>;
    if (section === "Sinhala Hodiya") return <SinhalaHodiya/>;
    if (section === "Custom Print Studio") return <CustomPrintStudio assets={assets} assetUrls={assetUrls} onUpload={onUpload}/>;
    if (section === "Past Paper Finder") return isTrial
      ? <div className="empty-large"><div className="empty-illustration"><Files size={28}/></div><h3>Past papers require full access</h3><p>Past Paper Finder is not available in the free trial.</p></div>
      : <OlPastPapers/>;
    if (section === "Picture Colouring Library") return <ColoringSheetLibrary/>;
    if (section === "CV Builder") return <CvBuilder/>;
    if (section === "Documents & Forms") return <DocumentLibrary/>;
    if (section === "Recent designs") return DesignList({ title: "Recent designs", items: sortedRecent, empty: "Your latest designs will appear here as you create and save them." });
    if (section === "Saved designs") return DesignList({ title: "Saved designs", items: designs, empty: "No designs saved yet. Create your first sticker and it will be saved on this device." });
    if (section === "Settings") return SettingsPanel();
    return Dashboard();
  };

  function Dashboard() {
    return <div className="space-y-8">
      <div className="hero-panel relative overflow-hidden rounded-[28px] p-8 md:p-10">
        <div className="relative z-10 max-w-[510px]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#8d5960]"><Sparkles size={14}/> PAPERBLOOM · STATIONERY &amp; CREATIVE STUDIO</div>
          <h1 className="text-3xl font-bold leading-tight tracking-[-0.04em] md:text-[38px]">පුංචි නමක්,<br/><span className="text-[#397b68]">ලස්සන මතකයක්! 🌈</span></h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#756b70]">ඔබේ දරුවාගේ නමින්ම හැඩවුණු වර්ණවත් ලේබල් සහ ස්ටිකර්. ආදරයෙන් නිර්මාණය කර, මුද්‍රණයට සූදානම් කළ පුංචි ලස්සනක්!</p>
          <p className="mt-3 max-w-md text-xs font-semibold leading-5 text-[#397b68]">PaperBloom | ඔබේ සිතුවිලිවලට ලස්සන හැඩයක්. 🌸</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="primary-button" data-trial-allow onClick={() => { setKind("sticker"); changeSection("Create sticker"); }}><Sparkles size={16}/> Create new sticker <ArrowRight size={15}/></button>
            <button className="secondary-button" data-trial-allow onClick={() => { setKind("cover"); setSelectedTemplateId("cover-rose-garden"); changeSection("Create sticker"); }}><BookOpen size={16}/> Create cover label</button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="hero-sun">✿</div><div className="hero-sticker"><span>✦</span><Image className="hero-sticker-logo" src="/bookshop-icon.svg" width={30} height={30} unoptimized alt=""/><b>PaperBloom</b><small>STATIONERY · CREATIVE</small></div><div className="hero-star">✷</div><div className="hero-pencil">✎</div></div>
      </div>
      <div className="grid gap-7 xl:grid-cols-[1fr_300px]">
        <section>
          <div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-bold tracking-tight">Pick a happy starting point</h2><p className="mt-1 text-xs text-slate-500">A favourite style, ready to make your own.</p></div><button className="text-xs font-semibold text-[#397b68] hover:underline" onClick={() => changeSection("Templates")}>All templates <ArrowRight size={13} className="ml-1 inline"/></button></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{templates.filter(t => t.favourite).slice(0, 4).map(t => <TemplateCard key={t.id} template={t} assetUrls={assetUrls} onChoose={() => { setKind(t.kind); setSelectedTemplateId(t.id); changeSection("Create sticker"); }}/>)}</div>
          <div className="mb-4 mt-8 flex items-end justify-between"><div><h2 className="text-lg font-bold tracking-tight">Recently loved</h2><p className="mt-1 text-xs text-slate-500">Pick up where you left off.</p></div><button className="text-xs font-semibold text-[#397b68] hover:underline" onClick={() => changeSection("Recent designs")}>See recent <ArrowRight size={13} className="ml-1 inline"/></button></div>
          {sortedRecent.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{sortedRecent.slice(0, 3).map(item => <DesignCard key={item.id} item={item} assetUrls={assetUrls} onOpen={() => void openDesign(item)}/>)}</div> : <div className="empty-strip">Your designs will show up here as you make them. <span>Ready when you are ✨</span></div>}
        </section>
        <aside className="space-y-4">
          <div className="soft-card p-5"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Your little toolkit</h3><span className="rounded-lg bg-[#f6e9df] p-2 text-[#bd7960]"><Flower2 size={17}/></span></div>
            <button className="tool-link" onClick={() => changeSection("PNG assets")}><span className="tool-icon bg-[#e9f5ed] text-[#549572]"><ImagePlus size={17}/></span><span><b>PNG illustration library</b><small>Add your own artwork</small></span><ArrowRight size={14}/></button>
            <button className="tool-link" onClick={() => changeSection("Saved designs")}><span className="tool-icon bg-[#fff1e1] text-[#c78a42]"><FolderHeart size={17}/></span><span><b>Saved designs</b><small>{designs.length} on this device</small></span><ArrowRight size={14}/></button>
          </div>
          <div className="tip-card"><span className="tip-bulb">✦</span><div><b>A little print tip</b><p>Choose “Actual size” in your print dialog so every sticker comes out just right.</p><button onClick={() => changeSection("A4 print studio")}>See print guide <ArrowRight size={13}/></button></div></div>
        </aside>
      </div>
    </div>;
  }

  function Creation() {
    const usingCustomSize = selectedTemplateId === CUSTOM_SIZE_TEMPLATE_ID;
    const stickerStyleOptions = templates.filter(template => template.kind === "sticker" && template.id !== CUSTOM_SIZE_TEMPLATE_ID);
    const originalStickerStyles = stickerStyleOptions.filter(template => !allNewTemplateIds.has(template.id) && !template.userCreated);
    const newStickerStyles = stickerStyleOptions.filter(template => allNewTemplateIds.has(template.id));
    const savedStickerStyles = stickerStyleOptions.filter(template => template.userCreated);
    const customStyle = templates.find(template => template.id === customStyleTemplateId && template.kind === "sticker")
      ?? customSizeTemplate;
    const previewTemplate = usingCustomSize
      ? { ...customStyle, id: CUSTOM_SIZE_TEMPLATE_ID, name: customSizeTemplate.name, widthMm: customWidthMm, heightMm: customHeightMm }
      : templates.find(template => template.id === selectedTemplateId && template.kind === kind)
        ?? templates.find(template => template.kind === kind)
        ?? starterTemplates.find(template => template.kind === kind)
        ?? starterTemplates[0];
    const selectedPreviewSubjects = selectedSubjectLabels;
    const previewSubject = selectedPreviewSubjects.find(isEnglishCardSubject)
      ?? selectedPreviewSubjects[0]
      ?? "Subject";
    const englishPreview = isEnglishCardSubject(previewSubject);
    const hasSinhalaText = (value: string) => /[\u0D80-\u0DFF]/.test(value);
    const previewName = englishPreview
      ? student.englishName.trim() || (!hasSinhalaText(student.name) ? student.name.trim() : "Student Name")
      : student.name.trim() || "Student Name";
    const previewSchool = englishPreview
      ? student.englishSchool.trim() || (!hasSinhalaText(student.school) ? student.school.trim() : "")
      : student.school;
    const previewGrade = formatGradeForCard(student.grade || "5", language, englishPreview);
    const livePreview = createDesign(previewName, {
      name: previewName,
      grade: previewGrade,
      subject: previewSubject,
      school: previewSchool
    }, previewTemplate, language);
    const sortedQuickTemplates = templates
      .filter(template => template.kind === kind)
      .sort((left, right) => Number(right.id === selectedTemplateId) - Number(left.id === selectedTemplateId))
      .slice(0, 4);
    const quickTemplates = kind !== "sticker" || sortedQuickTemplates.some(template => template.id === CUSTOM_SIZE_TEMPLATE_ID)
      ? sortedQuickTemplates
      : [...sortedQuickTemplates.slice(0, 3), customSizeTemplate];

    return <div className="mx-auto max-w-6xl">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><div className="eyebrow">A LITTLE BIT OF MAGIC</div><h1 className="page-title">{section === "Templates" ? "Choose their favourite" : "Let’s make a name sticker"}</h1><p className="mt-2 text-sm text-slate-500">A few details, a lovely design, and they’re ready for school.</p></div><div className="workflow-pill"><span className="active">1</span> Details <i/> <span className={design ? "active" : ""}>2</span> Make it yours</div></div>
      {section === "Templates" ? <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button className={`filter-chip ${templateCollection === "existing" ? "selected" : ""}`} onClick={() => setTemplateCollection("existing")}>Existing templates</button>
          <button className={`filter-chip ${templateCollection === "new" ? "selected" : ""}`} onClick={() => { setTemplateCollection("new"); setKind("sticker"); }}>New Designs · {newDesignTemplates.length + customArtworkTemplates.length + printableLabelTemplates.length + 1}</button>
          <span className="mx-1 h-5 w-px bg-[#eae6e0]"/>
          <button className={`filter-chip ${kind === "sticker" ? "selected" : ""}`} onClick={() => setKind("sticker")}>Name stickers</button>
          <button className={`filter-chip ${kind === "cover" ? "selected" : ""}`} onClick={() => { setTemplateCollection("existing"); setKind("cover"); }}>Cover labels</button>
          <div className="search-box ml-auto"><Search size={15}/><input placeholder="Find a style" value={search} onChange={e => setSearch(e.target.value)}/></div>
        </div>
        {templateCollection === "new" && <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Print-ready template categories">
          <button className={`filter-chip ${printableLabelCategory === "All" ? "selected" : ""}`} onClick={() => setPrintableLabelCategory("All")}>All designs</button>
          {printableLabelCategories.map(category => <button key={category} className={`filter-chip ${printableLabelCategory === category ? "selected" : ""}`} onClick={() => setPrintableLabelCategory(category)}>{category}</button>)}
        </div>}
        <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-lg font-bold">{templateCollection === "new" ? "New Designs collection" : "Existing templates"}</h2><p className="mt-1 text-xs text-slate-500">{templateCollection === "new" ? "Choose from image-led stationery designs, clean no-art labels, and CSS/SVG-only printable name-tag styles." : "Your original built-in and saved templates remain available here."}</p></div><span className="text-xs text-slate-400">{visibleTemplates.length} styles</span></div>
        {visibleTemplates.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{visibleTemplates.map(t => <TemplateCard key={t.id} template={t} assetUrls={assetUrls} selected={selectedTemplateId === t.id} onChoose={() => { setSelectedTemplateId(t.id); if (design) applyTemplate(t); else { setKind(t.kind); changeSection("Create sticker"); } }} favoriteAction={() => void updateTemplateFavourite(t)} renameAction={t.userCreated ? () => void renameTemplate(t) : undefined} duplicateAction={() => void duplicateTemplate(t)} deleteAction={t.userCreated ? () => void deleteTemplate(t) : undefined}/>)}</div> : <div className="empty-strip">No templates match this collection and search. <span>Try a different filter.</span></div>}
      </div>
      : <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="soft-card p-5 md:p-7">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Who’s this for?</h2><p className="mt-1 text-xs text-slate-500">Just the name is enough to get started.</p></div><span className="step-number">01</span></div>
          <label className="field-label">Student name <span className="required">*</span><input ref={element => { studentInputRefs.current.name = element; }} onFocus={() => beginStudentInput("name")} onCompositionStart={() => composingStudentFields.current.add("name")} lang={containsSinhala(student.name) || typingMode !== "English" ? "si" : "en"} dir="auto" spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off" className="text-input mt-2" placeholder={typingMode === "Singlish to Sinhala" ? "Type Singlish · amma → අම්මා as you type" : "e.g. Amaya Perera / අමායා පෙරේරා"} value={student.name} onChange={e => updateStudentInput("name", e.target.value, e.target.selectionStart ?? e.target.value.length, composingStudentFields.current.has("name"))} onCompositionEnd={e => finishStudentComposition("name", e.currentTarget.value, e.currentTarget.selectionStart ?? e.currentTarget.value.length)}/></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="field-label">{language === "Sinhala" ? "ශ්‍රේණිය" : language === "Sinhala + English" ? "Grade / ශ්‍රේණිය" : "Grade"} <input lang={language === "English" ? "en" : "si"} list="grade-options" dir="auto" spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off" className="text-input mt-2" placeholder={language === "Sinhala" ? "1 සිට 13 දක්වා" : language === "Sinhala + English" ? "Grade 1–13 / 1–13 ශ්‍රේණිය" : "Optional — Grade 1 to 13"} value={student.grade} onChange={e => { const grade = updateStudentInput("grade", e.target.value); const gradeNumber = Number(grade.replace(/\D/g, "")); setStudent(previous => ({ ...previous, stream: gradeNumber >= 12 ? previous.stream : "" })); }}/><datalist id="grade-options">{Array.from({ length: 13 }, (_, i) => <option key={i + 1} value={language === "English" ? `Grade ${i + 1}` : language === "Sinhala" ? `${i + 1} ශ්‍රේණිය` : `Grade ${i + 1} / ${i + 1} ශ්‍රේණිය`}/>)}</datalist></label>
            <label className="field-label">Grade display language <select className="text-input mt-2" value={language} onChange={e => setLanguage(e.target.value as LanguageMode)}><option value="English">English</option><option value="Sinhala">Sinhala</option><option value="Sinhala + English">Sinhala + English</option></select></label>
          </div>
          <label className="field-label mt-4 block">Text input mode <select className="text-input mt-2 max-w-sm" value={typingMode} onChange={e => setTypingMode(e.target.value as TextInputMode)}><option value="English">English</option><option value="Sinhala Keyboard">Sinhala Keyboard</option><option value="Singlish to Sinhala" disabled={transliterationStatus !== "ready"}>Singlish to Sinhala{transliterationStatus === "loading" ? " · loading" : transliterationStatus === "error" ? " · unavailable" : ""}</option></select></label>
          {usingCustomSize && <section className="mt-4 rounded-2xl border border-[#e5dced] bg-[#fbf9ff] p-4">
            <div className="mb-3"><b className="text-sm">Custom Size Sticker</b><p className="mt-1 text-[11px] text-slate-500">Set the final physical dimensions. The preview keeps the same proportions as your print.</p></div>
            <label className="field-label block">Sticker style<select className="text-input mt-2" value={customStyle.id} onChange={e => setCustomStyleTemplateId(e.target.value)}><optgroup label="Custom size"><option value={CUSTOM_SIZE_TEMPLATE_ID}>Scholar’s Apple · Custom dimensions</option></optgroup>{originalStickerStyles.length > 0 && <optgroup label="Original sticker styles">{originalStickerStyles.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>}{newStickerStyles.length > 0 && <optgroup label="New sticker designs">{newStickerStyles.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>}{savedStickerStyles.length > 0 && <optgroup label="My saved sticker styles">{savedStickerStyles.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>}</select><span className="mt-1 block text-[10px] font-normal text-slate-500">Choose a named sticker design below; your custom width and height stay unchanged.</span></label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <label className="field-label col-span-1">Width ({customUnit})<input aria-label={`Sticker width in ${customUnit}`} className="text-input mt-2" type="text" inputMode="decimal" value={customWidthInput} onChange={e => updateCreationDimension("width", e.target.value)}/></label>
              <label className="field-label col-span-1">Height ({customUnit})<input aria-label={`Sticker height in ${customUnit}`} className="text-input mt-2" type="text" inputMode="decimal" value={customHeightInput} onChange={e => updateCreationDimension("height", e.target.value)}/></label>
              <label className="field-label col-span-1">Units<select aria-label="Measurement unit" className="text-input mt-2" value={customUnit} onChange={e => { const unit = e.target.value as MeasurementUnit; setCustomUnit(unit); setCustomWidthInput(formatMeasurement(customWidthMm, unit)); setCustomHeightInput(formatMeasurement(customHeightMm, unit)); setError(""); }}><option value="in">Inches (in)</option><option value="cm">Centimeters (cm)</option></select></label>
            </div>
            <p className="mt-2 text-[10px] text-slate-500">Print size: {customWidthMm.toFixed(2)} × {customHeightMm.toFixed(2)} mm. Supported range: 20–200 mm wide × 15–280 mm high.</p>
            {(customWidthMm < 35 || customHeightMm < 20) && <p className="mt-2 text-[11px] font-semibold text-amber-700" role="status">This small sticker may not fit all text legibly. Consider a larger size or fewer optional fields.</p>}
          </section>}
          <label className="field-label mt-4 block">Copies for each selected subject
            <input className="text-input mt-2 max-w-48" type="number" min="1" max="1000" value={copies} onChange={e => setCopies(Math.max(1, Math.min(1000, Math.trunc(Number(e.target.value)))))}/>
            <span className="mt-1 block text-[10px] font-normal text-slate-500">For example, 4 subjects × 2 copies = 8 stickers. The sheet continues onto more A4 pages when needed.</span>
          </label>
          <p className="mt-2 rounded-xl bg-[#f1f6f2] px-3 py-2 text-[10px] leading-5 text-[#527565]">{typingMode === "Singlish to Sinhala" ? <>Sinhala updates as you type. Use Sinhala Keyboard or English mode when you want to edit direct Unicode text without conversion.</> : <>Text is kept exactly as entered. Sinhala Keyboard mode accepts the characters from your operating-system keyboard or IME without transliteration.</>}</p>
          {transliterationError && language === "Sinhala" && <p className="mt-2 text-xs text-rose-600" role="alert">{transliterationError} Direct Sinhala keyboard input is still available.</p>}
          <label className="field-label mt-4 block">School name <span className="font-normal text-slate-400">· optional</span><input ref={element => { studentInputRefs.current.school = element; }} onFocus={() => beginStudentInput("school")} onCompositionStart={() => composingStudentFields.current.add("school")} lang={containsSinhala(student.school) || typingMode !== "English" ? "si" : "en"} dir="auto" spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off" className="text-input mt-2" placeholder="Sinhala, English, or mixed text" value={student.school} onChange={e => updateStudentInput("school", e.target.value, e.target.selectionStart ?? e.target.value.length, composingStudentFields.current.has("school"))} onCompositionEnd={e => finishStudentComposition("school", e.currentTarget.value, e.currentTarget.selectionStart ?? e.currentTarget.value.length)}/></label>
          {student.grade && <div className="subject-picker-panel mt-4 rounded-2xl border border-[#f0e9e2] bg-[#fffdfa] p-4">
            <div className="mb-3 flex items-center justify-between"><div><b className="text-sm">Add subjects</b><p className="mt-1 text-[11px] text-slate-500">English subject labels stay in English; other subjects follow the selected display language. Each selected subject gets its own sticker on the A4 sheet.</p></div><span className="rounded-full bg-[#f5ecfa] px-2.5 py-1 text-[10px] font-semibold text-[#80609a]">{Number(student.grade.replace(/\D/g, "")) ? `Grade ${student.grade.replace(/\D/g, "")} ideas` : "Subject ideas"}</span></div>
            {unavailableSubjects.length > 0 && <p className="mb-3 rounded-lg bg-amber-50 p-2 text-[10px] text-amber-800">The selected subject(s) may not match this grade: {unavailableSubjects.join(", ")}. Review them before generating.</p>}
            {Number(student.grade.replace(/\D/g, "")) >= 12 && <label className="field-label mb-3 block">Stream or subject combination<select className="text-input mt-2" value={student.stream} onChange={e => setStudent({ ...student, stream: e.target.value })}><option value="">Optional — choose a stream</option>{["Biological Science", "Physical Science", "Commerce", "Arts", "Technology", "Custom combination"].map(option => <option key={option}>{option}</option>)}</select></label>}
            <label className="search-box mb-3 flex w-full"><Search size={15}/><input aria-label="Search subjects" lang="en" dir="auto" spellCheck={false} placeholder="Search subjects" value={subjectSearch} onChange={e => setSubjectSearch(e.target.value)}/></label>
            <div className="flex flex-wrap gap-2">{filteredSubjects.map(subject => <button key={subject.en} onClick={() => toggleSubjectSelection(subject.en)} className={`subject-pill ${subjectsSelected.includes(subject.en) ? "chosen" : ""}`}>{subjectsSelected.includes(subject.en) && <Check size={12}/>} {subjectLabel(subject)}</button>)}</div>
            {filteredSubjects.length === 0 && <p className="mt-2 text-xs text-slate-500">No subjects match that search.</p>}
            {selectedSubjectLabels.some(isEnglishCardSubject) && <div className="mt-3 grid gap-3 rounded-xl border border-[#e7eee9] bg-[#fbfdfb] p-3 sm:grid-cols-2">
              <label className="field-label">Name in English <span className="required">*</span>
                <input ref={element => { studentInputRefs.current.englishName = element; }} onFocus={() => beginStudentInput("englishName")} lang="en" dir="auto" spellCheck={false} autoComplete="off" autoCapitalize="words" autoCorrect="off" className="text-input mt-2" placeholder="e.g. Kavindu Perera" value={student.englishName} onChange={event => updateStudentInput("englishName", event.target.value)}/>
              </label>
              <label className="field-label">School in English <span className="font-normal text-slate-400">· optional</span>
                <input ref={element => { studentInputRefs.current.englishSchool = element; }} onFocus={() => beginStudentInput("englishSchool")} lang="en" dir="auto" spellCheck={false} autoComplete="off" autoCapitalize="words" autoCorrect="off" className="text-input mt-2" placeholder="e.g. ABC College" value={student.englishSchool} onChange={event => updateStudentInput("englishSchool", event.target.value)}/>
              </label>
              <p className="text-[10px] leading-5 text-slate-500 sm:col-span-2">These English details are used only on English subject and book cards. Other subject cards keep their original details and Sinhala grade.</p>
            </div>}
            {customSubjects.length > 0 && <div className="mt-3 flex flex-wrap gap-2" aria-label="Added custom subjects">{customSubjects.map(subject => <span key={subject} className="subject-pill chosen">{subject}<button type="button" className="ml-1 rounded-full p-0.5 hover:bg-white/70" aria-label={`Remove ${subject}`} onClick={() => setCustomSubjects(previous => previous.filter(item => item !== subject))}><X size={12}/></button></span>)}</div>}
            {selectedSubjectLabels.length > 0 && <p className="mt-3 text-[11px] font-medium text-[#397b68]">{selectedSubjectLabels.length} subject{selectedSubjectLabels.length === 1 ? "" : "s"} selected. Each will appear on a separate sticker, in this order: {selectedSubjectLabels.join(" → ")}.</p>}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input ref={element => { studentInputRefs.current.customSubject = element; }} onFocus={() => beginStudentInput("customSubject")} onCompositionStart={() => composingStudentFields.current.add("customSubject")} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addCustomSubject(); } }} lang={containsSinhala(student.customSubject) || typingMode !== "English" ? "si" : "en"} dir="auto" spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off" className="text-input min-w-0 flex-1 py-2 text-xs" placeholder="Add any subject you need" value={student.customSubject} onChange={e => updateStudentInput("customSubject", e.target.value, e.target.selectionStart ?? e.target.value.length, composingStudentFields.current.has("customSubject"))} onCompositionEnd={e => finishStudentComposition("customSubject", e.currentTarget.value, e.currentTarget.selectionStart ?? e.currentTarget.value.length)}/>
              <button type="button" className="secondary-button w-full shrink-0 justify-center sm:w-auto" onClick={addCustomSubject}><Plus size={14}/> Add subject</button>
            </div>
          </div>}
          <div className="mt-6 border-t border-[#f1ede8] pt-5"><div className="mb-3 flex items-center justify-between"><div><b className="text-sm">Pick a style</b><p className="mt-1 text-[11px] text-slate-500">You can change it later. Current selection is highlighted.</p></div><button className="text-xs font-semibold text-[#397b68]" onClick={() => changeSection("Templates")}>Browse all <ArrowRight size={13} className="ml-1 inline"/></button></div><div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{quickTemplates.map(t => <TemplateCard key={t.id} template={t} assetUrls={assetUrls} compact selected={selectedTemplateId === t.id} onChoose={() => { setSelectedTemplateId(t.id); if (design) applyTemplate(t); }}/>)}</div></div>
          <button className="primary-button mt-5 w-full justify-center py-3.5" onClick={() => void generateDesign()}><WandSparkles size={16}/> Generate my sticker <ArrowRight size={15}/></button>
        </section>
        <aside className="space-y-4"><div className="soft-card p-5"><div className="mb-3 flex items-center gap-2"><span className="step-number">02</span><b>See the lovely details</b></div><div className="preview-stage"><StickerPreview design={livePreview} assetUrls={assetUrls} fitWithinStage={usingCustomSize}/></div><p className="mt-3 text-center text-[11px] text-slate-400">Preview updates as you enter details and change styles.</p></div><div className="tip-card"><span className="tip-bulb">♥</span><div><b>Type it just as they do</b><p>Sinhala Unicode keyboards work beautifully. We keep every character exactly as typed.</p></div></div></aside>
      </div>}
    </div>;
  }

  function Editor() {
    const text = design?.texts.find(t => t.id === selectedText || t.field === selectedText) ?? design?.texts.find(t => t.field === "name");
    const fittedText = text && design ? getFittedFontSize(text, design.widthMm, design.heightMm) : null;
    if (!design) return null;
    const customDimensionUnit = design.customDimensionUnit;
    const editorSubjects = getPrintSubjects(design);
    const defaultPreviewSubject = design.texts.find(item => item.field === "subject")?.text ?? editorSubjects[0] ?? "";
    const activePreviewSubject = editorSubjects.includes(previewSubject) ? previewSubject : defaultPreviewSubject;
    const editorPreviewDesign = activePreviewSubject ? createPrintSticker(design, activePreviewSubject) : design;
    const activeAlphabetSection = sinhalaAlphabetSections.find(section => section.id === sinhalaAlphabetSection) ?? sinhalaAlphabetSections[0];
    const alphabetPreview = sinhalaAlphabetDraft.join("");
    return <div className="space-y-5">
      {generatedBatch.length > 1 && <section className="soft-card p-4"><div className="flex flex-wrap items-end justify-between gap-2"><div><b className="text-sm">All generated subject cards</b><p className="mt-1 text-xs text-slate-500">Preview every card here. Edit or print cards individually.</p></div><span className="text-xs text-slate-500">{generatedBatch.length} cards</span></div><div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{generatedBatch.map(item => <article className="rounded-xl border border-[#eee9e2] bg-white p-3" key={item.id}><button className="block w-full text-left" onClick={() => void openDesign(item)}><div className="design-card-preview min-h-24"><StickerPreview design={item} assetUrls={assetUrls}/></div><b className="mt-2 block truncate text-xs">{item.texts.find(text => text.field === "subject")?.text || item.name}</b></button><div className="mt-2 flex gap-2"><button className="small-action flex-1" onClick={() => void openDesign(item)}>Edit card</button><button className="small-action flex-1" data-paid-feature onClick={() => { setDesign(item); setCopies(1); setPrintPage(0); changeSection("A4 print studio"); }}>Print this card</button></div></article>)}</div></section>}
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex flex-wrap gap-2"><button className="back-link" onClick={() => changeSection("Home")}><ArrowLeft size={14}/> Back to studio</button><button className="secondary-button !px-3 !py-2" onClick={() => void backToSubjectSelection()}><ArrowLeft size={14}/> Back to details / add subjects</button></div><h1 className="page-title mt-2">Make it yours <span className="text-base font-medium text-slate-400">· {design.name}</span></h1><p className="mt-1 text-xs text-slate-500">Tap a line to edit it. Drag text and decorations right on the sticker.</p>{editorSubjects.filter(Boolean).length > 1 && <p className="mt-2 rounded-lg bg-[#eff7f2] px-3 py-2 text-xs text-[#397b68]">This editor preview shows “{design.texts.find(item => item.field === "subject")?.text}”. The A4 print sheet includes all {editorSubjects.length} selected subjects, each on its own sticker.</p>}</div><div className="flex flex-wrap gap-2"><button className="secondary-button !px-3" onClick={() => void saveTemplate()}><LayoutGrid size={15}/> Save as template</button><button className="primary-button !px-4" onClick={() => void persistDesign(design, true)}><Save size={15}/> Save design</button></div></div>
      <div className="sticker-editor-layout grid gap-5">
        <div className="soft-card sticker-preview-column p-4 md:p-7">
          <div className="mb-4 flex items-center justify-between"><span className="eyebrow">LIVE PREVIEW · {design.widthMm} × {design.heightMm} MM</span><span className="text-[11px] text-slate-400">Click text to select · drag to move</span></div>
          {editorSubjects.length > 1 && <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Choose subject card preview"><span className="mr-1 text-xs font-semibold text-slate-500">Preview card</span>{editorSubjects.map(subject => <button type="button" key={subject} aria-pressed={activePreviewSubject === subject} className={`subject-pill ${activePreviewSubject === subject ? "chosen" : ""}`} onClick={() => setPreviewSubject(subject)}>{subject}</button>)}</div>}
          <div className="editor-stage"><div className="sticker-canvas relative overflow-hidden" ref={canvasRef} onPointerMove={moveDrag} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }} style={{ width: "min(100%, 620px)", aspectRatio: `${design.widthMm}/${design.heightMm}`, background: design.background, border: `${design.borderWidth}px ${design.borderStyle} ${design.borderColor}`, borderRadius: stickerCornerRadius(design), boxShadow: "0 8px 25px #29344a1a", touchAction: "none", containerType: "inline-size" }}>
            {design.backgroundAssetId && assetUrls[design.backgroundAssetId] && <img src={assetUrls[design.backgroundAssetId]} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover"/>}
            {design.innerBorder && <div className="pointer-events-none absolute inset-[5px] rounded-[inherit]" style={{ border: `1px solid ${design.borderColor}88` }}/>}
            {design.showCutline && <div className="pointer-events-none absolute -inset-1 rounded-[inherit]" style={{ border: "1px dashed #888"}}/>}
            <StickerDecoration variant={design.decoration} accent={editorPreviewDesign.texts.find(text => text.field === "name")?.color ?? design.borderColor} secondary={editorPreviewDesign.texts.find(text => text.field === "grade")?.color ?? design.borderColor}/>
            {design.images.map(image => { const asset = assets.find(a => a.id === image.assetId); return asset && assetUrls[asset.id] ? <img key={image.id} src={assetUrls[asset.id]} alt={asset.name} draggable={false} onPointerDown={e => startDrag(e, image.id, "image", image.x, image.y)} className="absolute z-10 cursor-move object-contain" style={{ left: `${image.x}%`, top: `${image.y}%`, width: `${image.width}%`, transform: `translate(-50%,-50%) rotate(${image.rotation}deg)` }}/> : null; })}
            {editorPreviewDesign.texts.filter(t => t.visible && t.text).map(t => {
              const fit = getFittedFontSize(t, design.widthMm, design.heightMm);
              return <div key={t.id} lang={containsSinhala(t.text) ? "si" : "en"} onClick={() => setSelectedText(t.id)} onPointerDown={e => startDrag(e, t.id, "text", t.x, t.y)} className={`absolute z-20 flex cursor-move select-none break-words px-1 ${selectedText === t.id || selectedText === t.field ? "outline outline-1 outline-dashed outline-[#397b68]/70" : ""}`} style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.width}%`, height: `${t.height ?? 20}%`, transform: `translate(-50%,-50%) rotate(${t.rotation}deg)`, color: t.color, fontFamily: textFontStack(t.fontFamily, t.sinhalaFontFamily), fontSize: `${fit.fontSize * 0.2646 / design.widthMm * 100}cqw`, fontWeight: resolvedFontWeight(t), textAlign: t.align, justifyContent: t.align === "left" ? "flex-start" : t.align === "right" ? "flex-end" : "center", alignItems: "center", whiteSpace: t.wrap === false ? "nowrap" : "normal", overflow: "hidden", overflowWrap: "anywhere", lineHeight: t.lineHeight, letterSpacing: `${t.letterSpacing * 0.2646 / design.widthMm * 100}cqw` }}>{getDisplayText(t)}</div>;
            })}
            {!design.texts.some(t => t.visible && t.text) && <div className="absolute inset-0 grid place-items-center text-sm text-slate-400">Your text will appear here</div>}
          </div></div>
          {(design.images.some(image => !assets.some(asset => asset.id === image.assetId)) || (design.backgroundAssetId && !assets.some(asset => asset.id === design.backgroundAssetId))) && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">One or more illustrations are not in this browser’s asset library. Re-import those image files before printing this design.</div>}
          <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">{assets.slice(0, 4).map(asset => <button key={asset.id} onClick={() => addImage(asset)} className="asset-shortcut">{assetUrls[asset.id] && <img src={assetUrls[asset.id]} alt="" className="h-9 w-9 object-contain"/>}<span>{asset.name}</span><Plus size={13}/></button>)}<button className="asset-shortcut text-[#397b68]" onClick={() => changeSection("PNG assets")}><ImagePlus size={17}/> Browse illustrations <ArrowRight size={13}/></button></div>
          <details className="mt-4 rounded-xl border border-[#eee9e2] bg-white p-4"><summary className="cursor-pointer text-xs font-semibold">Design layers <ChevronDown size={14} className="ml-1 inline"/></summary><div className="mt-3 space-y-2">{design.texts.map(t => <div key={t.id} className="flex items-center justify-between text-xs"><button onClick={() => setSelectedText(t.id)} className={selectedText === t.id ? "font-bold text-[#db5e73]" : ""}>{t.field === "custom" ? t.customLabel || "Custom text" : t.field}: {t.text || "empty"}</button><span className="flex gap-2"><button title={t.visible ? "Hide field" : "Show field"} onClick={() => updateText(t.id, { visible: !t.visible })}>{t.visible ? "Shown" : "Hidden"}</button><button onClick={() => { const fields = [...design.texts]; const i = fields.findIndex(x => x.id === t.id); if (i > 0) { [fields[i - 1], fields[i]] = [fields[i], fields[i - 1]]; patchDesign({ texts: fields }); } }}>↑</button><button onClick={() => { const fields = [...design.texts]; const i = fields.findIndex(x => x.id === t.id); if (i < fields.length - 1) { [fields[i + 1], fields[i]] = [fields[i], fields[i + 1]]; patchDesign({ texts: fields }); } }}>↓</button></span></div>)}</div></details>
        </div>
        <aside className="space-y-3">
          <div className="soft-card p-4"><div className="flex items-center justify-between gap-2"><div><b className="text-sm">Optional extra fields</b><p className="mt-1 text-[10px] text-slate-500">Add up to three details such as class, student ID, or school year.</p></div><button className="small-action shrink-0" onClick={addCustomText}><Plus size={13}/> Add field</button></div>{design.texts.filter(item => item.field === "custom").length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{design.texts.filter(item => item.field === "custom").map(item => <button key={item.id} className={`field-tab ${selectedText === item.id ? "chosen" : ""}`} onClick={() => setSelectedText(item.id)}>{item.customLabel || "Custom field"}</button>)}</div>}</div>
          <div className="soft-card overflow-hidden"><div className="panel-heading"><span className="panel-icon pink"><Palette size={16}/></span><div><b>Text styling</b><small>Make every word feel just right</small></div></div>
            <div className="space-y-4 p-4">
              {design.texts.map(t => <button key={t.id} onClick={() => setSelectedText(t.id)} className={`field-tab ${selectedText === t.id || selectedText === t.field ? "chosen" : ""}`}>{t.field === "custom" ? t.customLabel || "Custom text" : t.field[0].toUpperCase() + t.field.slice(1)}{t.visible ? "" : " · hidden"}</button>)}
              {text && <><label className="field-label mt-2 block">Show on sticker<input type="checkbox" className="ml-2 align-middle accent-[#397b68]" checked={text.visible} onChange={e => updateText(text.id, { visible: e.target.checked })}/></label>
                {text.field === "custom" && <div><label className="field-label block">Field label<input className="text-input mt-2" value={text.customLabel ?? ""} placeholder="e.g. Student ID" onChange={e => updateText(text.id, { customLabel: e.target.value })}/></label><button className="mt-2 text-[10px] font-semibold text-rose-600 hover:underline" onClick={() => removeCustomText(text.id)}>Remove this extra field</button></div>}
                <label className="field-label block">Text input mode<select className="text-input mt-2" value={typingMode} onChange={event => { setTypingMode(event.target.value as TextInputMode); beginStickerTextInput(text); }}><option value="English">English</option><option value="Sinhala Keyboard">Sinhala Keyboard</option><option value="Singlish to Sinhala" disabled={transliterationStatus !== "ready"}>Singlish to Sinhala{transliterationStatus === "loading" ? " · loading" : transliterationStatus === "error" ? " · unavailable" : ""}</option></select></label>
                <p className="mt-2 text-[10px] leading-5 text-slate-500">{typingMode === "Singlish to Sinhala" ? "Type Singlish to convert as you type. Existing Sinhala text stays as entered." : typingMode === "Sinhala Keyboard" ? "Type Sinhala with your device's Sinhala keyboard or input method." : "Type English, or paste Sinhala text directly."}</p>
                <label className="field-label block">Displayed text<textarea ref={stickerTextInputRef} lang={containsSinhala(text.text) || typingMode !== "English" ? "si" : "en"} dir="auto" spellCheck={false} autoCapitalize="off" autoCorrect="off" className="text-input mt-2 min-h-16 resize-y" style={{ fontFamily: textFontStack(text.fontFamily, text.sinhalaFontFamily), fontWeight: resolvedFontWeight(text) }} value={text.text} onFocus={event => { beginStickerTextInput(text, event.currentTarget.value); rememberStickerTextSelection(text.id, event.currentTarget); }} onSelect={event => rememberStickerTextSelection(text.id, event.currentTarget)} onBlur={event => rememberStickerTextSelection(text.id, event.currentTarget)} onCompositionStart={() => composingStudentFields.current.add(`sticker:${text.id}`)} onCompositionEnd={event => { const key = `sticker:${text.id}`; composingStudentFields.current.delete(key); rememberStickerTextSelection(text.id, event.currentTarget); updateStickerTextInput(text, event.currentTarget.value, event.currentTarget.selectionStart); }} onChange={event => { rememberStickerTextSelection(text.id, event.target); updateStickerTextInput(text, event.target.value, event.target.selectionStart, composingStudentFields.current.has(`sticker:${text.id}`)); }}/></label>
                <section className="rounded-xl border border-[#dce9e1] bg-[#f7fbf8] p-3" aria-label="Sinhala alphabet picker">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div><b className="text-sm">සිංහල හෝඩිය</b><p className="mt-1 text-[10px] text-slate-500">Choose letters to preview, then insert them into the selected text.</p></div>
                    <button type="button" className="small-action" aria-expanded={sinhalaAlphabetPanelVisible} onClick={() => setSinhalaAlphabetPanelVisible(visible => !visible)}>{sinhalaAlphabetPanelVisible ? "Hide alphabet" : "Show alphabet"}</button>
                  </div>
                  {sinhalaAlphabetPanelVisible && <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Sinhala alphabet sections">
                      {sinhalaAlphabetSections.map(section => <button type="button" key={section.id} role="tab" aria-selected={sinhalaAlphabetSection === section.id} aria-controls="sinhala-alphabet-letters" className={`filter-chip !px-2.5 !py-1.5 ${sinhalaAlphabetSection === section.id ? "selected" : ""}`} onClick={() => setSinhalaAlphabetSection(section.id)}>{section.label}</button>)}
                    </div>
                    <div id="sinhala-alphabet-letters" role="tabpanel" className="rounded-lg border border-[#e7eee9] bg-white p-2">
                      <p className="mb-2 text-[10px] text-slate-500">{activeAlphabetSection.description}</p>
                      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8" lang="si">
                        {activeAlphabetSection.letters.map((letter, index) => <button type="button" key={`${activeAlphabetSection.id}-${index}`} className="grid min-h-10 place-items-center rounded-lg border border-[#e5ebe7] bg-[#fffdfa] px-1 text-lg text-[#2d6555] transition hover:border-[#397b68] hover:bg-[#eff7f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#397b68]" aria-label={`Add ${letter} to letter preview`} onMouseDown={event => event.preventDefault()} onClick={() => setSinhalaAlphabetDraft(current => [...current, letter])} style={{ fontFamily: '"Noto Sans Sinhala", sans-serif' }}>{letter}</button>)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#e7eee9] bg-white p-3">
                      <span className="field-label">Selected text preview</span>
                      <div lang="si" dir="auto" aria-live="polite" className="mt-1 min-h-10 break-words rounded-md bg-[#f8faf8] px-3 py-2 text-xl text-[#26394a]" style={{ fontFamily: '"Noto Sans Sinhala", sans-serif' }}>{alphabetPreview || <span className="text-sm text-slate-400">Your selected letters will appear here.</span>}</div>
                      <div className="mt-2 flex flex-wrap justify-end gap-2">
                        <button type="button" className="small-action" disabled={sinhalaAlphabetDraft.length === 0} onMouseDown={event => event.preventDefault()} onClick={() => setSinhalaAlphabetDraft(current => current.slice(0, -1))}>Backspace</button>
                        <button type="button" className="small-action" disabled={sinhalaAlphabetDraft.length === 0} onMouseDown={event => event.preventDefault()} onClick={() => setSinhalaAlphabetDraft([])}>Clear all</button>
                        <button type="button" className="primary-button !px-3 !py-2" disabled={!alphabetPreview} onMouseDown={event => event.preventDefault()} onClick={() => insertSinhalaAlphabetDraft(text)}>Insert into text</button>
                      </div>
                    </div>
                  </div>}
                  <p className="mt-2 text-[10px] leading-4 text-slate-500">The text box above remains available for your regular keyboard or Sinhala IME. Noto Sans Sinhala is bundled with the app and works offline.</p>
                </section>
                <div className="sticker-font-controls space-y-3 rounded-xl border border-[#eee9e2] bg-[#fffdfa] p-3">
                  <label className="field-label block">English font<select className="text-input mt-2" value={text.fontFamily} onChange={e => updateText(text.id, { fontFamily: e.target.value as EnglishFontFamily })}>{fontCategories.map(category => <optgroup key={category} label={category}>{englishFonts.filter(font => font.category === category).map(font => <option key={font.family} value={font.family}>{font.family}</option>)}</optgroup>)}</select></label>
                  <div className="rounded-lg bg-white p-2 text-sm" style={{ fontFamily: `"${text.fontFamily}", sans-serif` }}>{fontPreviewText.english}</div>
                  <label className="field-label block">Sinhala font<select className="text-input mt-2" value={text.sinhalaFontFamily ?? "Noto Sans Sinhala"} onChange={e => updateText(text.id, { sinhalaFontFamily: e.target.value as SinhalaFontFamily })}>{fontCategories.map(category => <optgroup key={category} label={category}>{sinhalaFonts.filter(font => font.category === category).map(font => <option key={font.family} value={font.family}>{font.family}</option>)}</optgroup>)}</select></label>
                  <div lang="si" className="rounded-lg bg-white p-2 text-sm" style={{ fontFamily: `"${text.sinhalaFontFamily ?? "Noto Sans Sinhala"}", "Noto Sans Sinhala", sans-serif` }}>{fontPreviewText.sinhala}</div>
                  <p className="text-[10px] text-slate-400">Font changes affect this field only. Sinhala uses the selected Sinhala font with Noto Sans Sinhala as a glyph fallback.</p>
                </div>
                <div><div className="mb-2 flex justify-between"><span className="field-label">Font size</span><input type="number" min="5" max="60" value={text.fontSize} className="tiny-number" onChange={e => updateText(text.id, { fontSize: Math.max(5, Math.min(60, Number(e.target.value))) })}/></div><input type="range" min="5" max="60" value={text.fontSize} className="w-full accent-[#397b68]" onChange={e => updateText(text.id, { fontSize: Number(e.target.value) })}/><p className="mt-1 text-[10px] text-slate-400">Text automatically wraps and scales to fit its box. The A4 output uses the same fitted size.</p>{fittedText && !fittedText.fits && <p className="mt-1 text-[10px] font-semibold text-amber-700">This text is too long for its current box, even at the smallest readable size. Increase the box or move/shorten the text.</p>}{fittedText && fittedText.fontSize < 8 && <p className="mt-1 text-[10px] font-semibold text-amber-700">This text is being reduced below 8px to fit. Give it more space or shorten it for a clearer print.</p>}</div>
                <div className="grid grid-cols-2 gap-3"><label className="field-label">Line spacing<input className="text-input mt-2" type="number" min="0.8" max="2" step="0.1" value={text.lineHeight} onChange={e => updateText(text.id, { lineHeight: Math.max(0.8, Math.min(2, Number(e.target.value))) })}/></label><label className="field-label">Letter spacing px<input className="text-input mt-2" type="number" min="-2" max="8" step="0.5" value={text.letterSpacing} onChange={e => updateText(text.id, { letterSpacing: Math.max(-2, Math.min(8, Number(e.target.value))) })}/></label></div>
                <label className="field-label block">Wrap long text<input type="checkbox" className="ml-2 align-middle accent-[#397b68]" checked={text.wrap !== false} onChange={e => updateText(text.id, { wrap: e.target.checked })}/></label>
                <div><span className="field-label">Text colour</span><div className="mt-2 flex gap-2">{colors.map(c => <button key={c} title={c} onClick={() => updateText(text.id, { color: c })} className={`color-dot ${text.color === c ? "selected" : ""}`} style={{ background: c }}/>)}</div><input aria-label="Custom text colour" type="color" className="mt-2 h-8 w-10 cursor-pointer rounded border-0 bg-transparent" value={text.color} onChange={e => updateText(text.id, { color: e.target.value })}/></div>
                <div className="grid grid-cols-2 gap-3"><label className="field-label">Weight<select className="text-input mt-2" value={resolvedFontWeight(text)} onChange={e => { const fontWeight = Number(e.target.value) as 400 | 500 | 600 | 700; updateText(text.id, { fontWeight, bold: fontWeight >= 600 }); }}><option value={400}>Normal</option><option value={500}>Medium weight</option><option value={600}>Semibold</option><option value={700}>Bold</option></select></label><label className="field-label">Alignment<select className="text-input mt-2" value={text.align} onChange={e => updateText(text.id, { align: e.target.value as TextElement["align"] })}><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></label></div>
                <div className="grid grid-cols-2 gap-3"><label className="field-label">Box width (%)<input className="text-input mt-2" type="number" min="10" max="95" value={text.width} onChange={e => updateText(text.id, { width: Math.max(10, Math.min(95, Number(e.target.value))) })}/></label><label className="field-label">Box height (%)<input className="text-input mt-2" type="number" min="5" max="80" value={text.height ?? 20} onChange={e => updateText(text.id, { height: Math.max(5, Math.min(80, Number(e.target.value))) })}/></label></div>
                <div className="grid grid-cols-2 gap-3"><label className="field-label">Rotation °<input className="text-input mt-2" type="number" min="-45" max="45" value={text.rotation} onChange={e => updateText(text.id, { rotation: Number(e.target.value) })}/></label><label className="field-label">Position X<input className="text-input mt-2" type="number" min="0" max="100" value={Math.round(text.x)} onChange={e => updateText(text.id, { x: Number(e.target.value) })}/></label></div>
                <label className="field-label block">Position Y<input className="text-input mt-2" type="number" min="0" max="100" value={Math.round(text.y)} onChange={e => updateText(text.id, { y: Number(e.target.value) })}/></label>
              </>}
            </div>
          </div>
          <div className="soft-card overflow-hidden"><div className="panel-heading"><span className="panel-icon orange"><Palette size={16}/></span><div><b>Border & paper</b><small>Finishing touches all around</small></div></div><div className="space-y-4 p-4">
            <label className="field-label block">Background<input type="color" className="ml-3 h-8 w-12 align-middle" value={design.background} onChange={e => patchDesign({ background: e.target.value })}/></label>
            {design.backgroundAssetId && <div className="flex items-center justify-between rounded-lg bg-[#f8f5f0] p-2 text-[10px]"><span>Background image: {assets.find(asset => asset.id === design.backgroundAssetId)?.name ?? "missing asset"}</span><button className="font-semibold text-[#d45a70]" onClick={() => patchDesign({ backgroundAssetId: undefined })}>Remove</button></div>}
            <label className="field-label block">Border colour<input type="color" className="ml-3 h-8 w-12 align-middle" value={design.borderColor} onChange={e => patchDesign({ borderColor: e.target.value })}/></label>
            <div><label className="field-label">Border thickness · {design.borderWidth} mm</label><input className="mt-2 w-full accent-[#397b68]" type="range" min="0.4" max="4" step="0.2" value={design.borderWidth} onChange={e => patchDesign({ borderWidth: Number(e.target.value) })}/></div>
            <div className="grid grid-cols-2 gap-3"><label className="field-label">Line style<select className="text-input mt-2" value={design.borderStyle} onChange={e => patchDesign({ borderStyle: e.target.value as StickerDesign["borderStyle"] })}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option></select></label>{!isCircularSticker(design) && <label className="field-label">Corner style<select className="text-input mt-2" value={design.radius === 0 ? "square" : design.radius > 12 ? "round" : "soft"} onChange={e => patchDesign({ radius: e.target.value === "square" ? 0 : e.target.value === "round" ? 18 : 8 })}><option value="soft">Soft</option><option value="round">Rounded</option><option value="square">Square</option></select></label>}</div>
            {isCircularSticker(design) ? <p className="text-[10px] text-slate-500">Circle cut shape · {design.widthMm} mm diameter</p> : <label className="field-label block">Corner radius · {design.radius}px<input className="mt-2 w-full accent-[#397b68]" type="range" min="0" max="24" value={design.radius} onChange={e => patchDesign({ radius: Number(e.target.value) })}/></label>}
            {customDimensionUnit ? <>
              <div className="grid grid-cols-3 gap-2">
                <label className="field-label">Width ({customDimensionUnit})<input aria-label={`Sticker width in ${customDimensionUnit}`} className="text-input mt-2" type="text" inputMode="decimal" value={designWidthInput} onChange={e => updateCustomDesignDimension("width", Number(e.target.value), customDimensionUnit, e.target.value)}/></label>
                <label className="field-label">Height ({customDimensionUnit})<input aria-label={`Sticker height in ${customDimensionUnit}`} className="text-input mt-2" type="text" inputMode="decimal" value={designHeightInput} onChange={e => updateCustomDesignDimension("height", Number(e.target.value), customDimensionUnit, e.target.value)}/></label>
                <label className="field-label">Units<select aria-label="Measurement unit" className="text-input mt-2" value={customDimensionUnit} onChange={e => { const unit = e.target.value as MeasurementUnit; patchDesign({ customDimensionUnit: unit }); setDesignWidthInput(formatMeasurement(design.widthMm, unit)); setDesignHeightInput(formatMeasurement(design.heightMm, unit)); setError(""); }}><option value="in">Inches (in)</option><option value="cm">Centimeters (cm)</option></select></label>
              </div>
              <p className="text-[10px] text-slate-500">Print dimensions stay exact in millimeters: {design.widthMm.toFixed(2)} × {design.heightMm.toFixed(2)} mm.</p>
            </> : <>
              <label className="field-label block">Sticker size<select className="text-input mt-2" value={`${design.widthMm}x${design.heightMm}`} onChange={e => { const [w, h] = e.target.value.split("x").map(Number); patchDesign({ widthMm: w, heightMm: h }); }}><option value="70x35">Small · 70 × 35 mm</option><option value="90x45">Medium · 90 × 45 mm</option><option value="100x60">Large · 100 × 60 mm</option><option value={`${design.widthMm}x${design.heightMm}`}>Current · {design.widthMm} × {design.heightMm} mm</option></select></label>
              <div className="grid grid-cols-2 gap-3"><label className="field-label">Width mm<input className="text-input mt-2" type="number" min="20" max="200" value={design.widthMm} onChange={e => patchDesign({ widthMm: Math.max(20, Number(e.target.value)) })}/></label><label className="field-label">Height mm<input className="text-input mt-2" type="number" min="15" max="280" value={design.heightMm} onChange={e => patchDesign({ heightMm: Math.max(15, Number(e.target.value)) })}/></label></div>
            </>}
            {customDimensionUnit && (design.widthMm < 35 || design.heightMm < 20 || design.texts.filter(item => item.visible && item.text.trim()).length > 5) && <p className="rounded-lg bg-amber-50 p-2 text-[10px] font-medium text-amber-800">This size or field count may make text hard to read. Check the text fit warnings and consider increasing the sticker dimensions.</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs"><label><input type="checkbox" checked={design.innerBorder} onChange={e => patchDesign({ innerBorder: e.target.checked })}/> Inner border</label><label><input type="checkbox" checked={design.showCutline} onChange={e => patchDesign({ showCutline: e.target.checked })}/> Cutting outline</label></div>
            <button className="w-full rounded-xl border border-[#eee5de] py-2 text-xs font-semibold hover:bg-[#fff8f2]" onClick={() => patchDesign({ background: "#ffffff", borderColor: "#000000", borderWidth: 1.4, borderStyle: "solid", radius: 0, innerBorder: false, showCutline: false })}>Reset border</button>
          </div></div>
          {design.images.length > 0 && <div className="soft-card p-4"><b className="text-sm">Illustrations</b>{design.images.map(i => <div key={i.id} className="mt-3 flex flex-wrap items-center gap-2 text-xs"><select aria-label="Replace image" className="max-w-36 rounded-lg border border-[#eee9e2] p-1.5" value={i.assetId} onChange={e => updateImage(i.id, { assetId: e.target.value })}>{assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select><input aria-label="Image size" type="range" min="5" max="50" value={i.width} onChange={e => updateImage(i.id, { width: Number(e.target.value) })}/><button title="Rotate image" onClick={() => updateImage(i.id, { rotation: i.rotation + 15 })}><RotateCcw size={14}/></button><button title="Duplicate image" onClick={() => patchDesign({ images: [...design.images, { ...i, id: uid(), x: Math.min(95, i.x + 5), y: Math.min(95, i.y + 5) }] })}><Copy size={14}/></button><button title="Move image forward" onClick={() => { const images = [...design.images]; const index = images.findIndex(image => image.id === i.id); if (index < images.length - 1) [images[index], images[index + 1]] = [images[index + 1], images[index]]; patchDesign({ images }); }}>↑</button><button title="Move image backward" onClick={() => { const images = [...design.images]; const index = images.findIndex(image => image.id === i.id); if (index > 0) [images[index], images[index - 1]] = [images[index - 1], images[index]]; patchDesign({ images }); }}>↓</button><button title="Remove image" onClick={() => patchDesign({ images: design.images.filter(img => img.id !== i.id) })}><Trash2 size={14}/></button></div>)}</div>}
          <button className="primary-button w-full justify-center" disabled={design.customDimensionUnit !== undefined && !isSupportedCustomSize(measurementToMillimeters(Number(designWidthInput), design.customDimensionUnit), measurementToMillimeters(Number(designHeightInput), design.customDimensionUnit))} onClick={() => { setPrintPage(0); changeSection("A4 print studio"); }}><Printer size={15}/> Preview A4 print sheet</button>
        </aside>
      </div>
    </div>;
  }

  function AssetLibrary() {
    return <div><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><div className="eyebrow">YOUR PERSONAL ART DRAWER</div><h1 className="page-title">PNG assets</h1><p className="mt-2 text-sm text-slate-500">Add your own artwork and use it on any sticker. Transparent PNGs stay transparent.</p></div><label className="primary-button cursor-pointer"><Upload size={15}/> Upload artwork<input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={e => void onUpload(e.target.files)}/></label></div>
      {!design && <div className="mb-4 flex items-center justify-between rounded-xl bg-[#fff3e6] p-3 text-xs text-[#8d6b4f]"><span>Open a design to place artwork on a sticker.</span><button className="font-semibold underline" onClick={() => changeSection("Create sticker")}>Create a sticker</button></div>}
      <div className="mb-4 flex flex-wrap gap-2"><button className={`filter-chip ${category === "All" ? "selected" : ""}`} onClick={() => setCategory("All")}>All art</button>{categories.map(c => <button key={c} className={`filter-chip ${category === c ? "selected" : ""}`} onClick={() => setCategory(c)}>{c}</button>)}<div className="search-box ml-auto"><Search size={15}/><input placeholder="Search art" value={search} onChange={e => setSearch(e.target.value)}/></div></div>
      {visibleAssets.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{visibleAssets.map(asset => <div className="soft-card overflow-hidden" key={asset.id}><div className="asset-preview">{assetUrls[asset.id] && <img src={assetUrls[asset.id]} alt={asset.name} className="max-h-32 max-w-full object-contain"/>}</div><div className="p-3"><b className="block truncate text-xs">{asset.name}</b>{asset.bundled && <span className="mt-1 inline-block text-[10px] text-slate-400">Built-in artwork</span>}<select className="mt-2 w-full rounded-lg border border-[#eee9e2] bg-white p-2 text-[11px]" value={asset.category} onChange={e => void setAssetCategory(asset, e.target.value as AssetCategory)}>{categories.map(c => <option key={c}>{c}</option>)}</select><div className="mt-2 flex gap-2"><button className="small-action flex-1" disabled={!design} onClick={() => addImage(asset)}>Add to sticker</button><button className="small-action" disabled={!design} onClick={() => { if (design) { patchDesign({ backgroundAssetId: asset.id }); setMessage(`${asset.name} set as the sticker background.`); } }}>Set background</button><button className="small-action" title={asset.bundled ? "Built-in artwork is kept in the studio" : "Delete asset"} disabled={asset.bundled} onClick={() => void removeAsset(asset)}><Trash2 size={13}/></button></div><div className="mt-2 flex flex-wrap gap-1">{["top-left","top-right","bottom-left","bottom-right","top-centre","bottom-centre","centre"].map(p => <button key={p} disabled={!design} className="placement-chip" onClick={() => addImage(asset,p)}>{p.replace("-", " ")}</button>)}</div></div></div>)}</div> : <div className="empty-large"><div className="empty-illustration"><ImagePlus size={28}/></div><h3>Your art drawer is waiting</h3><p>Upload PNG, JPG or WebP artwork up to 12 MB. Files stay on this device.</p><label className="secondary-button mt-3 inline-flex cursor-pointer"><Upload size={15}/> Choose images<input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={e => void onUpload(e.target.files)}/></label></div>}
      <p className="mt-5 text-xs text-slate-400">Upload and category editing are stored locally. Assigning assets to starter categories is done from each image card.</p>
    </div>;
  }

  function PrintStudio() {
    if (!design || !sheetLayout) return <EmptyPanel title="These settings do not fit" text="Reduce the sticker size or page margins to fit at least one sticker on A4." action={() => changeSection("Create sticker")}/>;
    const currentPageCount = Math.min(sheetLayout.perPage, totalPrintStickers - printPage * sheetLayout.perPage);
    return <div className="space-y-5 print-studio">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <button className="back-link" onClick={() => changeSection("Create sticker")}><ArrowLeft size={14}/> Back to editor</button>
          <div className="eyebrow mt-3">PRINT AT ACTUAL SIZE</div>
          <h1 className="page-title">A4 print studio</h1>
          <p className="mt-1 text-sm text-slate-500">Each selected subject gets its own sticker design.</p>
        </div>
        <button className="primary-button" data-paid-feature disabled={hasInvalidCustomDimensionDraft()} onClick={() => void print()}><Printer size={16}/> Print A4 sheet</button>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="soft-card p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button className="small-action" disabled={printPage === 0} onClick={() => setPrintPage(p => p - 1)}><ArrowLeft size={14}/></button>
              <span className="text-xs font-semibold">Page {printPage + 1} of {sheetLayout.pages}</span>
              <button className="small-action" disabled={printPage + 1 >= sheetLayout.pages} onClick={() => setPrintPage(p => p + 1)}><ArrowRight size={14}/></button>
            </div>
            <span className="text-xs text-slate-500">{sheetLayout.columns} across × {sheetLayout.rows} rows · {sheetLayout.perPage} per page</span>
          </div>
          <div className="a4-preview">
            {Array.from({ length: sheetLayout.pages }, (_, pageIndex) => <PrintSheet
              key={pageIndex}
              design={design}
              subjects={printSubjects}
              assets={assets}
              assetUrls={assetUrls}
              pageIndex={pageIndex}
              selectedPage={printPage}
              copies={copies}
              perPage={sheetLayout.perPage}
              columns={sheetLayout.columns}
              margin={margin}
              gapX={gapX}
              gapY={gapY}
              orientation={printOrientation}
            />)}
          </div>
        </div>
        <aside className="space-y-4">
          <div className="soft-card p-5">
            <h3 className="font-bold">Sheet setup</h3>
            <p className="mb-4 mt-1 text-xs text-slate-500">A4 paper · {printOrientation === "portrait" ? "210 × 297 mm · portrait" : "297 × 210 mm · landscape"}</p>
            <div className="mb-4 flex gap-2">
              <button className={`filter-chip ${printOrientation === "portrait" ? "selected" : ""}`} onClick={() => { setPrintOrientation("portrait"); setPrintPage(0); }}>Portrait</button>
              <button className={`filter-chip ${printOrientation === "landscape" ? "selected" : ""}`} onClick={() => { setPrintOrientation("landscape"); setPrintPage(0); }}>Landscape</button>
            </div>
            <label className="field-label block">Copies per subject
              <input className="text-input mt-2" type="number" min="1" max="1000" value={copies} onChange={e => setCopies(Math.max(1, Math.min(1000, Math.trunc(Number(e.target.value)))))}/>
            </label>
            <p className="mt-1 text-[11px] text-slate-500">{printSubjects.filter(Boolean).length || 1} subject card style(s) · {totalPrintStickers} stickers total</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="field-label">Margins mm<input className="text-input mt-2" type="number" min="0" max="30" value={margin} onChange={e => setMargin(Math.max(0, Number(e.target.value)))}/></label>
              <label className="field-label">Gap mm<input className="text-input mt-2" type="number" min="0" max="20" value={gapX} onChange={e => { const val = Math.max(0, Number(e.target.value)); setGapX(val); setGapY(val); }}/></label>
            </div>
            <div className="mt-4 rounded-xl bg-[#eff7f2] p-4">
              <span className="eyebrow text-[#528b6b]">YOUR PRINT SUMMARY</span>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div><small className="block text-slate-500">Each sticker · actual size</small><b>{design.customDimensionUnit ? `${formatMeasurement(design.widthMm, design.customDimensionUnit)} × ${formatMeasurement(design.heightMm, design.customDimensionUnit)} ${design.customDimensionUnit} · ` : ""}{formatMillimeters(design.widthMm)} × {formatMillimeters(design.heightMm)} mm</b></div>
                <div><small className="block text-slate-500">On this page</small><b>{currentPageCount} stickers</b></div>
                <div><small className="block text-slate-500">Page capacity</small><b>{sheetLayout.perPage} stickers</b></div>
                <div><small className="block text-slate-500">Total pages</small><b>{sheetLayout.pages}</b></div>
              </div>
            </div>
          </div>
          <div className="tip-card"><CircleHelp size={20} className="shrink-0 text-[#df9468]"/><div><b>Before you print</b><p>Choose A4 paper and set scaling to 100% or “Actual size”; turn off “Fit to page” and browser headers and footers. Print one test sheet and check a sticker with a ruler. Printer margins and driver settings can affect results.</p></div></div>
        </aside>
      </div>
    </div>;
  }

  function DesignList({ title, items, empty }: { title: string; items: StickerDesign[]; empty: string }) {
    return <div><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><div className="eyebrow">MADE HERE, SAVED HERE</div><h1 className="page-title">{title}</h1><p className="mt-2 text-sm text-slate-500">Private to this browser · your latest 10 show in Recent designs.</p></div><button className="primary-button" onClick={() => changeSection("Create sticker")}><Plus size={16}/> New sticker</button></div>
      {items.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(item => <div className="soft-card p-3" key={item.id}><div className="design-card-preview" onClick={() => void openDesign(item)}><StickerPreview design={item} assetUrls={assetUrls}/></div><div className="flex items-center justify-between gap-2 px-1 pt-3"><button className="min-w-0 text-left" onClick={() => void openDesign(item)}><b className="block truncate text-sm">{item.name}</b><small className="text-slate-400">{formatMillimeters(item.widthMm)} × {formatMillimeters(item.heightMm)} mm · {new Date(item.updatedAt).toLocaleDateString()}</small></button><div className="flex gap-1"><button className="icon-action" title="Favourite" onClick={() => toggleFavourite(item)}><Heart size={15} fill={item.favourite ? "#397b68" : "none"} color={item.favourite ? "#397b68" : "currentColor"}/></button><button className="icon-action" title="Rename" onClick={() => void renameDesign(item)}>✎</button><button className="icon-action" title="Duplicate" onClick={() => void duplicateDesign(item)}><Copy size={14}/></button><button className="icon-action" title="Export JSON" data-paid-feature onClick={() => exportDesign(item)}><Download size={14}/></button><button className="icon-action danger" title="Delete" onClick={() => void deleteDesign(item)}><Trash2 size={14}/></button></div></div></div>)}</div> : <div className="empty-large"><div className="empty-illustration"><FolderHeart size={28}/></div><h3>Nothing here just yet</h3><p>{empty}</p><button className="primary-button mt-4" onClick={() => changeSection("Create sticker")}><Sparkles size={15}/> Create a sticker</button></div>}
      <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><label className="secondary-button cursor-pointer !py-2"><Upload size={14}/> Import design JSON<input type="file" accept="application/json,.json" className="hidden" onChange={e => void importDesign(e.target.files?.[0])}/></label><span>Exported designs can be moved between browsers.</span></div>
    </div>;
  }

  function SettingsPanel() {
    const saveCurrentGroup = () => void saveSubjectGroup(subjectGroup, subjectOptions[subjectGroup] ?? []);
    return <div className="max-w-4xl">
      <div className="eyebrow">A FEW HOUSEKEEPING DETAILS</div><h1 className="page-title">Settings</h1><p className="mt-2 text-sm text-slate-500">Your designs, fonts and artwork live right here on this device.</p>
      <div className="mt-6 space-y-4">
        <div className="soft-card flex flex-wrap items-center justify-between gap-4 p-5"><div><h3 className="font-bold">Appearance</h3><p className="mt-1 text-xs text-slate-500">Choose a light or dark workspace theme. Your choice is saved for this bookshop on this device.</p></div><ThemeToggle/></div>
        <div className="soft-card p-5"><h3 className="font-bold">Text input mode</h3><p className="mt-1 text-xs text-slate-500">Choose how new text is entered. Sinhala Keyboard accepts operating-system keyboard/IME characters as typed. In Singlish to Sinhala mode, text converts live while you type; English and pasted Sinhala characters are retained as entered.</p><select className="text-input mt-4 max-w-xs" value={typingMode} onChange={e => setTypingMode(e.target.value as TextInputMode)}><option value="Sinhala Keyboard">Sinhala Keyboard</option><option value="Singlish to Sinhala" disabled={transliterationStatus !== "ready"}>Singlish to Sinhala{transliterationStatus === "loading" ? " · loading" : transliterationStatus === "error" ? " · unavailable" : ""}</option><option value="English">English</option></select><p className="mt-2 text-xs text-slate-500">Subject display language: <select className="ml-2 rounded-lg border border-[#eee9e2] bg-white px-2 py-1" value={language} onChange={e => setLanguage(e.target.value as LanguageMode)}><option value="English">English</option><option value="Sinhala">Sinhala</option><option value="Sinhala + English">Sinhala + English</option></select></p></div>
        <div className="soft-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">Subject suggestions</h3><p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">Edit the offline starter options for each grade band. These are suggestions, not a fixed curriculum; names can be entered in both languages.</p></div><button className="secondary-button !py-2" onClick={() => { const values = [...(subjectOptions[subjectGroup] ?? []), { en: "New subject", si: "" }]; void saveSubjectGroup(subjectGroup, values); }}> <Plus size={14}/> Add subject</button></div>
          <div className="mt-4 flex flex-wrap gap-2">{["1-5", "6-11", "12-13"].map(group => <button key={group} className={`filter-chip ${subjectGroup === group ? "selected" : ""}`} onClick={() => setSubjectGroup(group)}>Grades {group}</button>)}</div>
          <div className="mt-3 space-y-2">{(subjectOptions[subjectGroup] ?? []).map((option, index) => <div key={`${subjectGroup}-${index}`} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"><input className="text-input" aria-label="English subject name" value={option.en} onChange={e => setSubjectOptions(previous => ({ ...previous, [subjectGroup]: previous[subjectGroup].map((item, i) => i === index ? { ...item, en: e.target.value } : item) }))}/><input className="text-input sinhala" aria-label="Sinhala subject name" value={option.si} placeholder="Sinhala name (optional)" onChange={e => setSubjectOptions(previous => ({ ...previous, [subjectGroup]: previous[subjectGroup].map((item, i) => i === index ? { ...item, si: e.target.value } : item) }))}/><button className="icon-action danger" aria-label={`Remove ${option.en}`} onClick={() => void confirm("Remove subject", `Remove ${option.en || "this subject"} from this grade band?`).then(confirmed => { if (confirmed) void saveSubjectGroup(subjectGroup, subjectOptions[subjectGroup].filter((_, i) => i !== index)); })}><Trash2 size={14}/></button></div>)}</div>
          <button className="primary-button mt-4" onClick={saveCurrentGroup}><Save size={14}/> Save subject suggestions</button>
        </div>
        <div className="soft-card p-5"><h3 className="font-bold">Local storage</h3><p className="mt-1 text-xs leading-5 text-slate-500">Designs, templates, subject presets, and uploaded image blobs are saved in this browser’s IndexedDB. The latest 10 recent design references, subject display language, and text input mode are stored in localStorage. Clearing browser site data will remove them; export important designs as JSON for a backup.</p><div className="mt-3 flex gap-5 text-xs"><span><b>{designs.length}</b> designs</span><span><b>{templates.length}</b> templates</span><span><b>{assets.length}</b> illustrations</span></div></div>
        <div className="soft-card p-5"><h3 className="font-bold">Local fonts</h3><p className="mt-1 text-xs leading-5 text-slate-500">The font picker includes ten locally bundled English families and three Sinhala Unicode families, all distributed under the SIL Open Font License. Fonts are loaded from the app, not a live font service. Use the font controls on an individual text field to select English and Sinhala faces independently.</p></div>
      </div>
    </div>;
  }

  function EmptyPanel({ title, text, action }: { title: string; text: string; action: () => void }) {
    return <div className="empty-large"><div className="empty-illustration"><Printer size={28}/></div><h3>{title}</h3><p>{text}</p><button className="primary-button mt-4" onClick={action}><ArrowLeft size={14}/> Go back</button></div>;
  }

  return <LocalizedUi><div className="studio-shell">
    <aside className={`sidebar no-print ${isMobileNavOpen ? "mobile-open" : ""}`}><div className="brand"><div className="brand-mark"><img src="/bookshop-icon.svg" alt=""/></div><div><b>PaperBloom</b><small>CREATIVE STUDIO</small></div><button className="mobile-close" data-trial-allow onClick={() => setMobileNavOpen(false)}><X size={18}/></button></div>
      <nav className="sidebar-nav" aria-label="Main navigation">{navGroups.map(group => <div className="nav-group" key={group.label}><div className="sidebar-label">{group.label}</div>{group.items.map(({ title, icon: Icon }) => <button key={title} {...(title === "Past Paper Finder" && isTrial ? { "data-paid-feature": true, title: "Full access required" } : { "data-trial-allow": true })} className={`nav-item ${section === title ? "active" : ""}`} aria-current={section === title ? "page" : undefined} onClick={() => changeSection(title)}><Icon size={17} strokeWidth={1.8}/><span>{title}</span>{title === "Recent designs" && sortedRecent.length > 0 && <small>{sortedRecent.length}</small>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="offline-badge"><span/> Works offline on this device</div><div className="profile-card"><div className="profile-avatar"><img src="/bookshop-icon.svg" alt="" aria-hidden="true"/></div><div><b>PaperBloom</b><small>CREATIVE STUDIO</small></div><Settings size={15}/></div><div className="version">PaperBloom Studio · 1.0</div></div>
    </aside>
    {isMobileNavOpen && <button aria-label="Close menu" data-trial-allow className="mobile-overlay" onClick={() => setMobileNavOpen(false)}/>}
    <main className="main-column"><header className="topbar no-print"><div className="flex min-w-0 items-center gap-3"><button className="secondary-button !px-3 !py-2" aria-label="Back to previous section" disabled={section === "Home" && sectionHistory.length === 0} onClick={goBack}><ArrowLeft size={14}/>Back</button><button className="menu-button" data-trial-allow aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={19}/></button><div className="breadcrumb truncate">Your bookshop <span>/</span> <b>{section}</b></div></div><div className="flex items-center gap-3"><span className="saved-indicator"><span/> Everything stays on this device</span><ThemeToggle/><LanguageToggle/><button className="top-new" data-trial-allow onClick={() => { setDesign(null); setGeneratedBatch([]); changeSection("Create sticker"); }}><Plus size={15}/> New design</button></div></header>
      <div className="main-content" data-trial-allow={isTrial && section === "Create sticker" ? "" : undefined}>{isTrial && section === "Create sticker" && <p className="mb-4 rounded-xl border border-[#e5dced] bg-[#fbf9ff] px-4 py-3 text-xs leading-5 text-[#66558b]">Free trial: create and preview name stickers. Printing and Past Paper Finder require full access.</p>}{content()}<DesktopUpdateManager showSettings={section === "Settings"} showPrompt={false}/></div>
      <div className="app-toast-stack no-print">
        {error && <AppToast key={`error-${error}`} variant="error" message={error} onClose={() => setError("")}/>}
        {message && <AppToast key={`success-${message}`} variant="success" message={message} onClose={() => setMessage("")}/>}
      </div>
    </main>
  </div>{dialogHost}</LocalizedUi>;
}

function PrintSheet({
  design, subjects, assets, assetUrls, pageIndex, selectedPage, copies, perPage, columns, margin, gapX, gapY, orientation
}: {
  design: StickerDesign;
  subjects: string[];
  assets: ImageAsset[];
  assetUrls: Record<string, string>;
  pageIndex: number;
  selectedPage: number;
  copies: number;
  perPage: number;
  columns: number;
  margin: number;
  gapX: number;
  gapY: number;
  orientation: "portrait" | "landscape";
}) {
  const count = Math.min(perPage, copies * subjects.length - pageIndex * perPage);
  const pageColumns = Math.min(columns, count);
  const pageRows = Math.ceil(count / pageColumns);
  const pageWidth = orientation === "portrait" ? 210 : 297;
  const pageHeight = orientation === "portrait" ? 297 : 210;
  return <div className={`print-sheet print-grid ${orientation === "landscape" ? "paper-landscape" : ""} ${pageIndex === selectedPage ? "print-current" : "print-hidden"} ${pageIndex === Math.ceil(copies * subjects.length / perPage) - 1 ? "print-last" : ""}`} style={{ "--page-margin": `${margin}mm`, width: `${pageWidth}mm`, height: `${pageHeight}mm`, gridTemplateColumns: `repeat(${pageColumns}, ${design.widthMm}mm)`, gridTemplateRows: `repeat(${pageRows}, ${design.heightMm}mm)`, columnGap: `${gapX}mm`, rowGap: `${gapY}mm`, padding: `${margin}mm`, justifyContent: count < perPage ? "center" : "start", alignContent: count < perPage ? "center" : "start" } as React.CSSProperties}>
    {design.backgroundAssetId && assetUrls[design.backgroundAssetId] && <img src={assetUrls[design.backgroundAssetId]} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}/>}
    {Array.from({ length: count }, (_, index) => {
      const subject = subjects[getPrintSubjectIndex(pageIndex * perPage + index, subjects.length)] ?? "";
      const stickerDesign = createPrintSticker(design, subject);
      return <div className="print-sticker" key={index} style={{ width: `${design.widthMm}mm`, height: `${design.heightMm}mm`, border: `${design.borderWidth}mm ${design.borderStyle} ${design.borderColor}`, outline: design.showCutline ? "0.25mm dashed #888" : "none", outlineOffset: design.showCutline ? "0.6mm" : "0", borderRadius: printCornerRadius(design), background: design.background, position: "relative", boxSizing: "border-box" }}>
      {design.innerBorder && <span style={{ position: "absolute", inset: "1.2mm", border: `0.25mm solid ${design.borderColor}88`, borderRadius: printCornerRadius(design), pointerEvents: "none" }}/>}
      <StickerDecoration variant={design.decoration} accent={design.texts.find(text => text.field === "name")?.color ?? design.borderColor} secondary={design.texts.find(text => text.field === "grade")?.color ?? design.borderColor}/>
      {design.images.map(image => {
        const asset = assets.find(item => item.id === image.assetId);
        return asset && assetUrls[asset.id] ? <img key={image.id} src={assetUrls[asset.id]} alt="" style={{ position: "absolute", left: `${image.x}%`, top: `${image.y}%`, width: `${image.width}%`, transform: `translate(-50%,-50%) rotate(${image.rotation}deg)` }}/> : null;
      })}
      {stickerDesign.texts.filter(text => text.visible && text.text).map(text => {
        const fit = getFittedFontSize(text, design.widthMm, design.heightMm);
        return <span key={text.id} lang={containsSinhala(text.text) ? "si" : "en"} style={{ position: "absolute", left: `${text.x}%`, top: `${text.y}%`, width: `${text.width}%`, height: `${design.heightMm * (text.height ?? 20) / 100}mm`, display: "flex", alignItems: "center", justifyContent: text.align === "left" ? "flex-start" : text.align === "right" ? "flex-end" : "center", transform: `translate(-50%,-50%) rotate(${text.rotation}deg)`, color: text.color, fontFamily: textFontStack(text.fontFamily, text.sinhalaFontFamily), fontSize: `${fit.fontSize * 0.2646}mm`, fontWeight: resolvedFontWeight(text), textAlign: text.align, whiteSpace: text.wrap === false ? "nowrap" : "normal", overflow: "hidden", overflowWrap: "anywhere", lineHeight: text.lineHeight, letterSpacing: `${text.letterSpacing * 0.2646}mm` }}>{getDisplayText(text)}</span>;
      })}
    </div>;
    })}
  </div>;
}

function previewForTemplate(template: StickerTemplate): StickerDesign {
  return createDesign("Your name", { name: "Amaya Perera", grade: "Grade 4", subject: "Art & crafts", school: "Willow Primary School" }, template, "English");
}

function StickerPreview({ design, assetUrls, fitWithinStage = false }: { design: StickerDesign; assetUrls: Record<string, string>; fitWithinStage?: boolean }) {
  const previewScale = Math.min(220 / design.widthMm, 180 / design.heightMm);
  const stageSize = fitWithinStage ? { width: `${design.widthMm * previewScale}px`, height: `${design.heightMm * previewScale}px`, flex: "none" } : {};
  return <div className="preview-sticker" style={{ ...stageSize, aspectRatio: `${design.widthMm}/${design.heightMm}`, background: design.background, border: `${Math.max(1, design.borderWidth)}px ${design.borderStyle} ${design.borderColor}`, borderRadius: stickerCornerRadius(design), containerType: "inline-size" }}>
    {design.backgroundAssetId && assetUrls[design.backgroundAssetId] && <img src={assetUrls[design.backgroundAssetId]} alt="" className="absolute inset-0 h-full w-full object-cover"/>}
    <StickerDecoration variant={design.decoration} accent={design.texts.find(text => text.field === "name")?.color ?? design.borderColor} secondary={design.texts.find(text => text.field === "grade")?.color ?? design.borderColor}/>
    {design.images.map(img => assetUrls[img.assetId] && <img key={img.id} src={assetUrls[img.assetId]} alt="" style={{ position: "absolute", left: `${img.x}%`, top: `${img.y}%`, width: `${img.width}%`, transform: `translate(-50%,-50%) rotate(${img.rotation}deg)` }}/>)}
    {design.texts.filter(t => t.visible && t.text).map(t => {
      const fit = getFittedFontSize(t, design.widthMm, design.heightMm);
      return <span key={t.id} lang={containsSinhala(t.text) ? "si" : "en"} style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.width}%`, height: `${t.height ?? 20}%`, display: "flex", alignItems: "center", justifyContent: t.align === "left" ? "flex-start" : t.align === "right" ? "flex-end" : "center", transform: `translate(-50%,-50%) rotate(${t.rotation}deg)`, color: t.color, fontWeight: resolvedFontWeight(t), textAlign: t.align, whiteSpace: t.wrap === false ? "nowrap" : "normal", overflow: "hidden", overflowWrap: "anywhere", lineHeight: t.lineHeight, letterSpacing: `${t.letterSpacing * 0.2646 / design.widthMm * 100}cqw`, fontSize: `${fit.fontSize * 0.2646 / design.widthMm * 100}cqw`, fontFamily: textFontStack(t.fontFamily, t.sinhalaFontFamily) }}>{getDisplayText(t)}</span>;
    })}
  </div>;
}

function TemplateCard({ template, assetUrls, onChoose, compact = false, selected = false, favoriteAction, renameAction, duplicateAction, deleteAction }: { template: StickerTemplate; assetUrls: Record<string, string>; onChoose: () => void; compact?: boolean; selected?: boolean; favoriteAction?: () => void; renameAction?: () => void; duplicateAction?: () => void; deleteAction?: () => void }) {
  const fake = previewForTemplate(template);
  const sizeLabel = template.customDimensionUnit
    ? `Customizable · ${formatMeasurement(template.widthMm, template.customDimensionUnit)} × ${formatMeasurement(template.heightMm, template.customDimensionUnit)} ${template.customDimensionUnit}`
    : `${template.widthMm} × ${template.heightMm} mm`;
  return <div className={`template-card ${compact ? "compact" : ""} ${selected ? "selected" : ""}`}>
    <button onClick={onChoose} className="template-preview-wrap" aria-label={`Choose ${template.name}`}><StickerPreview design={fake} assetUrls={assetUrls}/></button>
    <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-2"><button onClick={onChoose} className="min-w-0 text-left"><b className="block truncate text-xs">{template.name}</b><small className="text-[10px] text-slate-400">{sizeLabel}</small></button><div className="flex items-center">{favoriteAction && <button className="icon-action !p-1.5" title="Favourite template" onClick={e => { e.stopPropagation(); favoriteAction(); }}><Heart size={13} fill={template.favourite ? "#397b68" : "none"} color={template.favourite ? "#397b68" : "currentColor"}/></button>}{renameAction && <button className="icon-action !p-1.5" title="Rename template" onClick={renameAction}>✎</button>}{duplicateAction && <button className="icon-action !p-1.5" title="Duplicate template" onClick={duplicateAction}><Copy size={13}/></button>}{deleteAction && <button className="icon-action danger !p-1.5" title="Delete template" onClick={deleteAction}><Trash2 size={13}/></button>}</div></div>
  </div>;
}

function DesignCard({ item, assetUrls, onOpen }: { item: StickerDesign; assetUrls: Record<string, string>; onOpen: () => void }) {
  return <button className="soft-card design-card text-left" onClick={onOpen}><div className="design-card-preview"><StickerPreview design={item} assetUrls={assetUrls}/></div><div className="p-3"><b className="block truncate text-xs">{item.name}</b><small className="text-[10px] text-slate-400">{new Date(item.updatedAt).toLocaleDateString()}</small></div></button>;
}
