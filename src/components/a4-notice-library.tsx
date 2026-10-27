"use client";

import {
  ArrowLeft, Copy, FileText, Printer, RotateCcw, Save, Search
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AppToast } from "@/components/app-toast";
import {
  a4NoticeTemplates, getNoticeCategory, getNoticeTemplate, getVisibleNoticeFields, noticeCategories,
  noticePaperDimensionsMm, type NoticeTemplate
} from "@/data/a4-notice-templates";
import { getActiveTenantId } from "@/lib/database";
import { loadSavedA4Notices, saveA4Notices, type SavedA4Notice } from "@/lib/a4-notice-storage";
import { printCurrentPageWithDialog } from "@/lib/print-page";

type NoticeDraft = SavedA4Notice;
type Alignment = NoticeDraft["align"];

const timestamp = () => Date.now();

function setA4NoticePrintMode(active: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("a4-notice-print-mode", active);
}

function makeDraft(template: NoticeTemplate): NoticeDraft {
  const category = getNoticeCategory(template.categoryId);
  return {
    id: crypto.randomUUID(),
    name: `${category?.nameEn ?? template.name} - ${template.name}`,
    templateId: template.id,
    orientation: template.orientation,
    values: { ...template.defaults },
    hiddenFields: template.fields.filter(field => field.optional).map(field => field.key),
    headingFontSize: 44,
    bodyFontSize: 18,
    textColor: template.colors.ink,
    align: "center",
    updatedAt: timestamp()
  };
}

function NoticePaper({
  template,
  draft,
  print = false
}: {
  template: NoticeTemplate;
  draft: NoticeDraft;
  print?: boolean;
}) {
  const category = getNoticeCategory(template.categoryId);
  const style = {
    "--notice-accent": template.colors.accent,
    "--notice-ink": draft.textColor,
    "--notice-text": draft.textColor,
    "--notice-soft": template.colors.soft,
    "--notice-heading-size": `${draft.headingFontSize * 0.3528}mm`,
    "--notice-body-size": `${draft.bodyFontSize * 0.3528}mm`,
    "--notice-align": draft.align
  } as CSSProperties;
  const heading = draft.values.heading?.trim();
  const visibleFields = getVisibleNoticeFields(template.fields, draft.values, draft.hiddenFields);
  const hasContact = visibleFields.some(field => field.key.startsWith("contact"));

  return <article
    className={`a4-notice-paper a4-notice-${template.style} ${draft.orientation} ${print ? "a4-notice-print-page" : ""}`}
    style={style}
    lang={template.language === "en" ? "en" : "si"}
    aria-label={`${category?.nameEn ?? "A4 notice"} ${draft.orientation} preview`}
  >
    <div className="a4-notice-inner">
      <header className="a4-notice-heading">
        <span className="a4-notice-kicker">{template.language === "si" ? category?.nameSi : template.language === "bi" ? "PAPERBLOOM · දැන්වීම / NOTICE" : "PAPERBLOOM · PUBLIC NOTICE"}</span>
        <h2>{heading || (template.language === "en" ? category?.nameEn : category?.nameSi)}</h2>
        {template.language === "bi" && <span className="a4-notice-translation">{category?.nameEn}</span>}
      </header>
      {visibleFields.length > 0 && <section className="a4-notice-fields" aria-label="Notice details">
        {visibleFields.map(field => {
          const value = draft.values[field.key]?.trim();
          const contact = field.key.startsWith("contact");
          return <div key={field.key} className={`a4-notice-field ${contact ? "contact" : ""} ${field.key === "description" || field.key === "details" || field.key === "notice" ? "wide" : ""}`}>
            <span className="a4-notice-field-label">{template.language === "en" ? field.labelEn : template.language === "si" ? field.labelSi : `${field.labelSi} / ${field.labelEn}`}</span>
            <p>{value}</p>
          </div>;
        })}
      </section>}
      {hasContact && <footer className="a4-notice-footer">
        <span>{template.language === "en" ? "PLEASE CONTACT" : template.language === "si" ? "විමසීම් සඳහා" : "විමසීම් සඳහා · PLEASE CONTACT"}</span>
      </footer>}
    </div>
  </article>;
}

function TemplateThumbnail({ template }: { template: NoticeTemplate }) {
  const category = getNoticeCategory(template.categoryId);
  const style = {
    "--notice-accent": template.colors.accent,
    "--notice-ink": template.colors.ink
  } as CSSProperties;
  return <div className={`a4-notice-thumbnail a4-notice-${template.style} ${template.orientation}`} style={style}>
    <span>{template.language === "en" ? category?.nameEn : category?.nameSi}</span>
    <i/><i/><i/>
    <b>077 123 4567</b>
  </div>;
}

export function A4NoticeLibrary() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [draft, setDraft] = useState<NoticeDraft | null>(null);
  const [savedNotices, setSavedNotices] = useState<SavedA4Notice[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      try {
        setSavedNotices(loadSavedA4Notices(window.localStorage, getActiveTenantId()));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not read saved A4 notices.");
      } finally {
        setStorageReady(true);
      }
    };
    void load();
  }, []);

  const visibleTemplates = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return a4NoticeTemplates.filter(template => {
      const category = getNoticeCategory(template.categoryId);
      const matchesCategory = categoryFilter === "all" || template.categoryId === categoryFilter;
      const searchable = `${category?.nameEn ?? ""} ${category?.nameSi ?? ""} ${template.name}`.toLocaleLowerCase();
      return matchesCategory && (!query || searchable.includes(query));
    });
  }, [categoryFilter, search]);

  const currentTemplate = draft ? getNoticeTemplate(draft.templateId) : undefined;
  const updateDraft = (patch: Partial<NoticeDraft>) => setDraft(previous =>
    previous ? { ...previous, ...patch, updatedAt: Date.now() } : previous
  );

  const persistSaved = (next: SavedA4Notice[], successMessage: string) => {
    try {
      saveA4Notices(window.localStorage, getActiveTenantId(), next);
      setSavedNotices(next);
      setMessage(successMessage);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? `Could not save this notice: ${cause.message}` : "Could not save this notice.");
    }
  };

  const chooseTemplate = (template: NoticeTemplate) => {
    setDraft(makeDraft(template));
    setShowSaved(false);
    setError("");
    setMessage("");
  };

  const saveDraft = () => {
    if (!draft || !currentTemplate) return;
    const saved = { ...draft, name: draft.name.trim() || currentTemplate.name, updatedAt: timestamp() };
    const next = [saved, ...savedNotices.filter(item => item.id !== saved.id)];
    persistSaved(next, "Notice saved on this device.");
    setDraft(saved);
  };

  const duplicateDraft = () => {
    if (!draft || !currentTemplate) return;
    const duplicate = { ...draft, id: crypto.randomUUID(), name: `${draft.name} - Copy`, updatedAt: timestamp() };
    persistSaved([duplicate, ...savedNotices], "A separate copy was saved. The original template is unchanged.");
    setDraft(duplicate);
  };

  const resetDraft = () => {
    if (!currentTemplate) return;
    const restored = makeDraft(currentTemplate);
    setDraft(previous => previous
      ? { ...restored, id: previous.id, name: previous.name, updatedAt: timestamp() }
      : restored
    );
    setMessage("Restored the original template design and default heading.");
    setError("");
  };

  const printNotice = async () => {
    if (!draft || !currentTemplate) return;
    try {
      const text = [draft.values.heading, ...currentTemplate.fields.map(field => draft.values[field.key])].filter(Boolean).join(" ");
      await document.fonts.load(`700 ${draft.headingFontSize}pt "Noto Sans Sinhala"`, text);
      await document.fonts.load(`400 ${draft.bodyFontSize}pt "Noto Sans Sinhala"`, text);
      await document.fonts.ready;
      setA4NoticePrintMode(true);
      const result = await printCurrentPageWithDialog({ orientation: draft.orientation });
      if (result.status === "printed") setMessage(`Print job sent to ${result.printerName}.`);
      else if (result.status === "cancelled") setMessage("Printing was cancelled. Your notice has not changed.");
      else setMessage("Print dialog opened. Select a printer or choose Save as PDF.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not prepare the A4 notice for printing.");
    } finally {
      setA4NoticePrintMode(false);
    }
  };

  const renderLibrary = () => <div className="a4-notice-library-main">
    <div className="a4-notice-library-header">
      <div>
        <div className="eyebrow">OFFLINE · A4 PRINT READY</div>
        <h1 className="page-title">A4 Notice &amp; Advertisement Templates</h1>
        <p>Choose a ready-made Sinhala, English, or bilingual notice. Change only the details you need, then print or save as PDF.</p>
      </div>
      <button className="secondary-button" onClick={() => { setShowSaved(true); setDraft(null); }}><Save size={15}/> Saved designs ({savedNotices.length})</button>
    </div>
    <label className="a4-notice-search"><Search size={16}/><input aria-label="Search notice templates" placeholder="Search in Sinhala or English" value={search} onChange={event => setSearch(event.target.value)}/></label>
    <div className="a4-notice-categories" aria-label="Notice categories">
      <button className={`filter-chip ${categoryFilter === "all" ? "selected" : ""}`} onClick={() => setCategoryFilter("all")}>All categories</button>
      {noticeCategories.map(category => <button key={category.id} className={`filter-chip ${categoryFilter === category.id ? "selected" : ""}`} onClick={() => setCategoryFilter(category.id)}>{category.nameEn} · {category.nameSi}</button>)}
    </div>
    <p className="a4-notice-result-count">{visibleTemplates.length} designs · 3 designs per category</p>
    {visibleTemplates.length ? <div className="a4-notice-template-grid">
      {visibleTemplates.map(template => {
        const category = getNoticeCategory(template.categoryId);
        return <article className="a4-notice-template-card" key={template.id}>
          <TemplateThumbnail template={template}/>
          <div className="a4-notice-card-copy">
            <b>{category?.nameEn}</b><span>{category?.nameSi}</span>
            <small>{template.name} · {template.orientation} · {template.language === "si" ? "Sinhala first" : template.language === "en" ? "English first" : "Bilingual"}</small>
          </div>
          <button className="primary-button a4-notice-use" onClick={() => chooseTemplate(template)}>Use This Template</button>
        </article>;
      })}
    </div> : <div className="empty-strip">No notice templates match this search. <span>Try another category or search word.</span></div>}
  </div>;

  const renderSaved = () => <section className="a4-notice-library-main">
    <div className="a4-notice-library-header">
      <div><div className="eyebrow">ON THIS DEVICE</div><h1 className="page-title">Saved A4 Notices</h1><p>Your edits are kept separately from the original template library.</p></div>
      <button className="secondary-button" onClick={() => setShowSaved(false)}><ArrowLeft size={15}/> Template library</button>
    </div>
    {savedNotices.length ? <div className="a4-notice-saved-grid">{savedNotices.map(saved => {
      const template = getNoticeTemplate(saved.templateId);
      return <article className="a4-notice-saved-card" key={saved.id}>
        {template && <TemplateThumbnail template={template}/>}
        <b>{saved.name}</b>
        <small>{new Date(saved.updatedAt).toLocaleDateString()} · A4 {saved.orientation}</small>
        <div className="flex gap-2"><button className="small-action flex-1" onClick={() => {
          if (!template) {
            setError("This saved notice refers to a template that is no longer available.");
            return;
          }
          setDraft(saved);
          setShowSaved(false);
        }}>Open and edit</button><button className="small-action" aria-label={`Duplicate ${saved.name}`} title="Duplicate saved design" onClick={() => {
          const copy = { ...saved, id: crypto.randomUUID(), name: `${saved.name} - Copy`, updatedAt: timestamp() };
          persistSaved([copy, ...savedNotices], "A separate copy was saved.");
        }}><Copy size={14}/></button><button className="small-action" aria-label={`Delete ${saved.name}`} title="Delete saved design" onClick={() => persistSaved(savedNotices.filter(item => item.id !== saved.id), "Saved notice removed.")}>×</button></div>
      </article>;
    })}</div> : <div className="empty-strip">No saved notices yet. <span>Use a template and save your edits on this device.</span></div>}
  </section>;

  const renderEditor = () => {
    if (!draft || !currentTemplate) return null;
    const category = getNoticeCategory(currentTemplate.categoryId);
    const setFieldValue = (key: string, value: string) =>
      updateDraft({ values: { ...draft.values, [key]: value } });
    const toggleField = (key: string, hidden: boolean) => updateDraft({
      hiddenFields: hidden
        ? [...draft.hiddenFields, key]
        : draft.hiddenFields.filter(fieldKey => fieldKey !== key)
    });

    return <div className="a4-notice-editor">
      <div className="a4-notice-editor-toolbar">
        <button className="secondary-button" onClick={() => { setDraft(null); setShowSaved(false); }}><ArrowLeft size={15}/> Templates</button>
        <div className="flex flex-wrap gap-2">
          <button className="small-action" onClick={resetDraft}><RotateCcw size={14}/> Reset design</button>
          <button className="small-action" onClick={duplicateDraft}><Copy size={14}/> Duplicate Template</button>
          <button className="primary-button" disabled={!storageReady} onClick={saveDraft}><Save size={14}/> Save design</button>
        </div>
      </div>
      <div className="a4-notice-edit-grid">
        <section className="a4-notice-controls soft-card">
          <div className="eyebrow">{category?.nameEn} · {category?.nameSi}</div>
          <h2>Edit your notice</h2>
          <p>Change any details or just enter the phone number. Empty fields will not print.</p>
          <label className="field-label">Saved design name<input className="text-input mt-2" value={draft.name} onChange={event => updateDraft({ name: event.target.value })}/></label>
          <label className="field-label mt-4">Main heading / ප්‍රධාන ශීර්ෂය<textarea className="text-input mt-2 min-h-20" value={draft.values.heading ?? ""} onChange={event => setFieldValue("heading", event.target.value)} dir="auto"/></label>
          <div className="a4-notice-edit-fields">{currentTemplate.fields.map(field => <div className="a4-notice-input-row" key={field.key}>
            <label className="field-label" htmlFor={`notice-${field.key}`}>{field.labelEn} / {field.labelSi}</label>
            <label className="a4-notice-visible"><input type="checkbox" checked={!draft.hiddenFields.includes(field.key)} onChange={event => toggleField(field.key, !event.target.checked)}/> Show</label>
            <textarea id={`notice-${field.key}`} className="text-input min-h-16" placeholder={`${field.placeholderEn} · ${field.placeholderSi}`} value={draft.values[field.key] ?? ""} onChange={event => setFieldValue(field.key, event.target.value)} dir="auto"/>
          </div>)}</div>
          <div className="a4-notice-setting-grid">
            <label className="field-label">Paper orientation
              <select className="text-input mt-2" value={draft.orientation} onChange={event => updateDraft({ orientation: event.target.value as NoticeDraft["orientation"] })}>
                <option value="portrait">A4 Portrait · 210 × 297 mm</option><option value="landscape">A4 Landscape · 297 × 210 mm</option>
              </select>
            </label>
            <label className="field-label">Text alignment
              <select className="text-input mt-2" value={draft.align} onChange={event => updateDraft({ align: event.target.value as Alignment })}>
                <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
              </select>
            </label>
            <label className="field-label">Heading size · {draft.headingFontSize} pt<input type="range" min="24" max="64" value={draft.headingFontSize} onChange={event => updateDraft({ headingFontSize: Number(event.target.value) })}/></label>
            <label className="field-label">Details size · {draft.bodyFontSize} pt<input type="range" min="12" max="32" value={draft.bodyFontSize} onChange={event => updateDraft({ bodyFontSize: Number(event.target.value) })}/></label>
            <label className="field-label a4-notice-color">Text color<input type="color" value={draft.textColor} onChange={event => updateDraft({ textColor: event.target.value })}/></label>
          </div>
        </section>
        <section className="a4-notice-preview-column">
          <div className="a4-notice-preview-header"><div><b>A4 preview</b><span>{noticePaperDimensionsMm[draft.orientation].width} × {noticePaperDimensionsMm[draft.orientation].height} mm · {draft.orientation}</span></div><button className="primary-button" data-paid-feature onClick={() => void printNotice()}><Printer size={15}/> Print / Save as PDF</button></div>
          <div className={`a4-notice-preview-stage ${draft.orientation}`}><NoticePaper template={currentTemplate} draft={draft}/></div>
          <p className="a4-notice-print-note"><FileText size={14}/> The normal printer dialog lets you choose a printer or Save as PDF. Check paper size and scale in the dialog before printing.</p>
        </section>
      </div>
    </div>;
  };

  return <div className="a4-notice-library" data-trial-allow>
    <div className="no-print">
      {message && <AppToast key={`notice-success-${message}`} variant="success" message={message} onClose={() => setMessage("")}/>}
      {error && <AppToast key={`notice-error-${error}`} variant="error" message={error} onClose={() => setError("")}/>}
      {draft ? renderEditor() : showSaved ? renderSaved() : renderLibrary()}
    </div>
    {draft && currentTemplate && <div className="a4-notice-print-host"><NoticePaper template={currentTemplate} draft={draft} print/></div>}
  </div>;
}
