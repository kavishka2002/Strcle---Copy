"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, FileText, History, Printer, Save, Search, Trash2 } from "lucide-react";
import { AppToast } from "@/components/app-toast";
import { db } from "@/lib/database";
import { printCurrentPage } from "@/lib/print-page";
import {
  categoryForDocument, documentCategories, documentTemplates, initialDocumentValues,
  renderDocumentContent, searchDocumentTemplate, validateDocument,
  type DocumentTemplate, type SavedDocumentDraft
} from "@/lib/document-library";

const dateToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export function DocumentLibrary() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [selected, setSelected] = useState<DocumentTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [documentContent, setDocumentContent] = useState("");
  const [draftId, setDraftId] = useState("");
  const [recent, setRecent] = useState<SavedDocumentDraft[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);

  const visibleTemplates = useMemo(() => documentTemplates.filter(template =>
    (categoryId === "all" || template.categoryId === categoryId) && searchDocumentTemplate(template, query)
  ), [categoryId, query]);

  const refreshRecent = useCallback(async () => {
    try {
      const drafts = await db.getAllDocumentDrafts();
      setRecent(drafts.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load locally saved documents.");
    }
  }, []);

  useEffect(() => {
    void db.getAllDocumentDrafts()
      .then(drafts => setRecent(drafts.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8)))
      .catch(cause => setError(cause instanceof Error ? cause.message : "Could not load locally saved documents."));
  }, []);

  const selectTemplate = (template: DocumentTemplate) => {
    const nextValues = initialDocumentValues(template);
    setSelected(template);
    setValues(nextValues);
    setDocumentContent(renderDocumentContent(template, nextValues));
    setDraftId("");
    setError("");
    setNotice("");
  };

  const updateField = (fieldId: string, value: string) => {
    if (!selected) return;
    const nextValues = { ...values, [fieldId]: value };
    setValues(nextValues);
    setDocumentContent(renderDocumentContent(selected, nextValues));
    setNotice("");
  };

  const openDraft = (draft: SavedDocumentDraft) => {
    const template = documentTemplates.find(item => item.id === draft.templateId);
    if (!template) {
      setError("This saved document uses a template that is no longer available.");
      return;
    }
    setSelected(template);
    setValues({ ...initialDocumentValues(template), ...draft.values });
    setDocumentContent(draft.content);
    setDraftId(draft.id);
    setError("");
    setNotice("");
  };

  const saveDocument = async () => {
    if (!selected || selected.officialLinks) return;
    const missing = validateDocument(selected, values);
    if (missing.length) {
      setError(`සුරැකීමට පෙර අවශ්‍ය තොරතුරු පුරවන්න: ${missing.join(", ")}`);
      return;
    }
    if (!documentContent.trim()) {
      setError("හිස් ලේඛනයක් සුරැකිය නොහැක.");
      return;
    }
    try {
      const draft: SavedDocumentDraft = {
        id: draftId || crypto.randomUUID(),
        templateId: selected.id,
        title: `${selected.titleSi} · ${values.sender || values.customer || values.payer || values.studentName || values.business || dateToday()}`,
        values,
        content: documentContent,
        updatedAt: Date.now()
      };
      await db.putDocumentDraft(draft);
      setDraftId(draft.id);
      setNotice("ලේඛනය මෙම උපාංගයේ පමණක් සුරැකිණි.");
      setError("");
      await refreshRecent();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this document on this device.");
    }
  };

  const deleteDraft = async (id: string) => {
    try {
      await db.deleteDocumentDraft(id);
      if (draftId === id) setDraftId("");
      setNotice("සුරැකි ලේඛනය ඉවත් කරන ලදී.");
      setError("");
      await refreshRecent();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this saved document.");
    }
  };

  const printDocument = async () => {
    if (!selected || selected.officialLinks) return;
    const missing = validateDocument(selected, values);
    if (missing.length) {
      setError(`මුද්‍රණයට පෙර අවශ්‍ය තොරතුරු පුරවන්න: ${missing.join(", ")}`);
      return;
    }
    if (!documentContent.trim()) {
      setError("හිස් ලේඛනයක් මුද්‍රණය කළ නොහැක.");
      return;
    }
    setIsPreparing(true);
    setError("");
    try {
      await document.fonts.load('400 16px "Noto Sans Sinhala"', documentContent);
      await document.fonts.load('700 16px "Noto Sans Sinhala"', documentContent);
      await document.fonts.ready;
      document.documentElement.classList.add("document-print-mode");
      const result = await printCurrentPage();
      if (result.status === "browser") setNotice("මුද්‍රණ කවුළුවෙන් ඔබගේ printer එක තෝරා Print ඔබන්න.");
      else if (result.status === "previewed") setNotice("මුද්‍රණ පෙරදසුන විවෘත කළා. Printer එක තෝරා Print ඔබන්න.");
      else if (result.status === "printed") setNotice(`Print job sent to ${result.printerName}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not prepare the document for print or PDF.");
    } finally {
      window.setTimeout(() => {
        document.documentElement.classList.remove("document-print-mode");
        setIsPreparing(false);
      }, 500);
    }
  };

  return <div className="document-library">
    <section className="document-library-workspace">
      <div className="document-library-main">
        <div className="eyebrow">PAPERBLOOM · ලිපි සහ ලේඛන</div>
        <h1 className="page-title">සිංහල ලේඛන සහ පෝරම පුස්තකාලය</h1>
        <p className="document-library-intro">ලිපි, ව්‍යාපාරික ලේඛන සහ කෙටුම්පත් සකස් කර A4 ප්‍රමාණයෙන් මුද්‍රණය කරන්න. ඔබ සුරකින ලේඛන මෙම උපාංගයේ පමණක් තබා ඇත.</p>

        <label className="document-search">
          <Search size={17}/>
          <input data-trial-allow className="text-input" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="සිංහලෙන් හෝ English වලින් සොයන්න" aria-label="Search document templates"/>
        </label>
        <div className="document-category-list" aria-label="Document categories">
          <button data-trial-allow className={`filter-chip ${categoryId === "all" ? "selected" : ""}`} onClick={() => setCategoryId("all")}>සියල්ල · All</button>
          {documentCategories.map(category => <button data-trial-allow key={category.id} className={`filter-chip ${categoryId === category.id ? "selected" : ""}`} onClick={() => setCategoryId(category.id)}>{category.si}</button>)}
        </div>

        <div className="document-template-grid">
          {visibleTemplates.map(template => {
            const category = categoryForDocument(template.categoryId);
            return <button key={template.id} data-trial-allow className={`document-template-card ${selected?.id === template.id ? "selected" : ""}`} onClick={() => selectTemplate(template)}>
              <span className="document-template-icon"><FileText size={18}/></span>
              <span className="document-template-card-title">{template.titleSi}</span>
              <span className="document-template-card-en">{template.titleEn}</span>
              <span className="document-template-card-description">{template.description}</span>
              <span className="document-template-category">{category?.si}</span>
            </button>;
          })}
          {!visibleTemplates.length && <div className="empty-large document-empty"><div className="empty-illustration"><Search size={24}/></div><h3>සැකිලි හමු නොවීය</h3><p>වෙනත් සිංහල හෝ ඉංග්‍රීසි වචනයක් සොයන්න.</p></div>}
        </div>

        <section className="document-recent-panel">
          <div className="document-section-heading"><div><History size={17}/><h2>මෑතකදී සුරැකි ලේඛන</h2></div><span>මෙම උපාංගයේ පමණි</span></div>
          {recent.length ? <ul className="document-recent-list">{recent.map(draft => <li key={draft.id}>
            <button data-trial-allow className="document-recent-open" onClick={() => openDraft(draft)}><b>{draft.title}</b><small>{new Date(draft.updatedAt).toLocaleString()}</small></button>
            <button className="icon-action danger" data-paid-feature aria-label={`Delete ${draft.title}`} onClick={() => void deleteDraft(draft.id)}><Trash2 size={14}/></button>
          </li>)}</ul> : <p className="document-muted">ඔබ සුරකින ලේඛන මෙහි දිස්වේ. ලේඛන ස්වයංක්‍රීයව සුරැකෙන්නේ නැත.</p>}
        </section>
      </div>

      <aside className="document-editor-column">
        {!selected ? <div className="document-empty-state"><div className="document-template-icon"><FileText size={22}/></div><h2>සැකිල්ලක් තෝරන්න</h2><p>සැකිල්ලක් තෝරා අවශ්‍ය විස්තර පුරවන්න. අවසන් ලේඛනය මෙහි සජීවීව සකස් වේ.</p></div>
          : <div className="document-editor-card">
            <div className="document-editor-heading"><div className="eyebrow">DOCUMENT BUILDER</div><h2>{selected.titleSi}</h2><p>{selected.description}</p></div>
            {selected.officialLinks ? <div className="official-directory">
              <div className="official-source-note">නිල ආයතනවල වෙබ් අඩවි වෙත පමණක් යොමු කරයි. මෙම යෙදුම රජයේ ලාංඡන හෝ නිල පෝරම අනුකරණය නොකරයි.</div>
              {selected.officialLinks.map(link => <article className="official-link-card" key={link.label}>
                <div><b>{link.label}</b><small>{link.agency}</small><p>{link.detail}</p><small>අවසන් වරට පරීක්ෂා කළේ: {link.verifiedOn}</small></div>
                <a data-trial-allow className="secondary-button official-link-button" href={link.url} target="_blank" rel="noopener noreferrer">නිල වෙබ් අඩවිය <ExternalLink size={14}/></a>
                <a data-trial-allow className="official-source-link" href={link.sourceUrl} target="_blank" rel="noopener noreferrer">මූලාශ්‍ර පිටුව පෙන්වන්න</a>
              </article>)}
            </div> : <>
              <div className="document-form-fields">
                {(selected.fields ?? []).map(field => <label className="document-field" key={field.id}>
                  <span>{field.label}{field.required && <i aria-label="required"> *</i>}</span>
                  {field.multiline
                    ? <textarea className="text-input sinhala" rows={3} value={values[field.id] ?? ""} placeholder={field.placeholder} onChange={event => updateField(field.id, event.target.value)}/>
                    : <input className="text-input" type={field.type ?? "text"} value={values[field.id] ?? ""} placeholder={field.placeholder} onChange={event => updateField(field.id, event.target.value)}/>}
                </label>)}
              </div>
              {selected.legalNotice && <div className="document-legal-notice"><b>වැදගත් නීතිමය දැනුම්දීම</b><p>{selected.legalNotice}</p></div>}
              <div className="document-final-editor"><label htmlFor="document-final-content">අවසන් ලේඛනය සංස්කරණය කරන්න</label><textarea id="document-final-content" className="text-input sinhala" rows={11} value={documentContent} onChange={event => setDocumentContent(event.target.value)}/><small>මෙහි කළ සංස්කරණ මුල් පෝරම ක්ෂේත්‍ර වෙනස් නොකරයි.</small></div>
              <div className="document-action-row">
                <button className="secondary-button" data-paid-feature onClick={() => void saveDocument()}><Save size={15}/> මෙම උපාංගයේ සුරකින්න</button>
                <button className="primary-button" data-paid-feature disabled={isPreparing} onClick={() => void printDocument()}><Printer size={15}/> මුද්‍රණය කරන්න</button>
              </div>
              <p className="document-pdf-guidance">A4 ප්‍රමාණයෙන් මුද්‍රණය කිරීමට මුද්‍රණ කවුළුවේ ඔබගේ printer එක තෝරන්න.</p>
              <div className="document-print-root" aria-label="A4 document print preview">
                <div className="document-paper" lang="si">
                  <pre className="document-paper-content">{documentContent}</pre>
                  <footer className="document-paper-footer">PaperBloom ලිපි සහ ලේඛන පුස්තකාලය · සකස් කළ ලේඛනයකි, නිල සහතිකයක් නොවේ</footer>
                </div>
              </div>
            </>}
          </div>}
      </aside>
    </section>
    {notice && <AppToast variant="success" message={notice} onClose={() => setNotice("")}/>}
    {error && <AppToast variant="error" message={error} onClose={() => setError("")}/>}
  </div>;
}
