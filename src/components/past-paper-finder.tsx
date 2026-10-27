"use client";

import {
  AlertCircle, ArrowDownToLine, BookOpen, CheckCircle2, ExternalLink, FileText,
  FolderOpen, LoaderCircle, Pencil, Printer, Search, Trash2, Upload, X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { RenderTask } from "pdfjs-dist/legacy/build/pdf.mjs";
import { db } from "@/lib/database";
import { LocalizedUi } from "@/components/app-language";
import { AppToast } from "@/components/app-toast";
import { useAppDialog } from "@/components/app-dialog";
import { useTrialAccess } from "@/components/trial-access";
import { printPdfBlob } from "@/lib/print-page";
import {
  checksumForBlob, formatPaperSize, isSafeSourceUrl, sameSavedPaper,
  sanitizePaperFilename, subjectsByExamination, validatePdfFile
} from "@/lib/past-papers";
import type {
  ExaminationType, PaperKind, PaperMedium, PaperSearchCandidate, PaperSearchQuery, PaperSourceState,
  PaperSourceStatus, SavedPaper
} from "@/lib/past-papers";

const examTypes: ExaminationType[] = ["O/L", "A/L", "Grade 5 Scholarship"];
const mediums: PaperMedium[] = ["Sinhala", "English", "Tamil"];
const paperKinds: PaperKind[] = ["Question Paper", "Marking Scheme"];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1989 }, (_, index) => currentYear - index);
const officialSourceUrl = "https://doenets.lk/";
const eThaksalawaUrl = "https://e-thaksalawa.moe.gov.lk/";
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();

function TrialPaperPreview({ url, pageNumber, onPageCount }: { url: string; pageNumber: number; onPageCount: (count: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadingTask = pdfjs.getDocument({ url, isEvalSupported: false });
    void loadingTask.promise.then(pdfDocument => {
      if (cancelled) return;
      setDocument(pdfDocument);
      setError("");
      onPageCount(pdfDocument.numPages);
    }).catch(cause => {
      if (cancelled) return;
      console.error("Could not render a trial PDF preview.", cause);
      setError("Preview unavailable");
    });
    return () => {
      cancelled = true;
      void loadingTask.destroy().catch(cause => console.error("Could not release trial PDF preview resources.", cause));
    };
  }, [onPageCount, url]);

  useEffect(() => {
    if (!document || !canvasRef.current) return;
    let cancelled = false;
    let renderTask: RenderTask | undefined;
    void document.getPage(pageNumber).then(page => {
      if (cancelled || !canvasRef.current) return;
      const viewport = page.getViewport({ scale: 1.4 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas rendering is unavailable in this browser.");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      renderTask = page.render({ canvasContext: context, viewport });
      return renderTask.promise;
    }).catch(cause => {
      if (cancelled) return;
      console.error(`Could not render trial PDF page ${pageNumber}.`, cause);
      setError("This PDF page could not be previewed.");
    });
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [document, pageNumber]);

  return <div className="grid min-h-0 flex-1 place-items-center overflow-auto bg-slate-100 p-3">
    {error ? <p className="text-sm text-slate-500">{error}</p>
      : !document ? <LoaderCircle className="animate-spin text-slate-400" size={22}/>
        : <canvas ref={canvasRef} className="max-h-full max-w-full object-contain"/>}
  </div>;
}

type PaperDownloadState = "Paper Found" | "Downloading PDF" | "Validating PDF" | "Saved Locally" | "Already Saved" | "Download Failed";
interface PaperDownloadResult {
  candidate: PaperSearchCandidate;
  state: PaperDownloadState;
  detail: string;
  progress: number | null;
  existingPaper?: SavedPaper;
}

function stateLabel(state: PaperSourceState): string {
  if (state === "searching") return "Searching Sources";
  if (state === "found") return "Paper Found";
  if (state === "manual-required") return "Manual Download Required";
  if (state === "unavailable") return "Source Unavailable";
  return "No Matching Paper Found";
}

async function readDownloadResponse(response: Response, onProgress: (progress: number | null) => void): Promise<Blob> {
  if (!response.body) throw new Error("The download response did not contain a file.");
  const totalHeader = Number(response.headers.get("content-length") ?? 0);
  const total = Number.isFinite(totalHeader) && totalHeader > 0 ? totalHeader : null;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    size += value.byteLength;
    chunks.push(value);
    onProgress(total ? Math.min(100, Math.round(size / total * 100)) : null);
  }
  const buffer = new ArrayBuffer(size);
  const output = new Uint8Array(buffer);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new Blob([buffer], { type: response.headers.get("content-type") ?? "application/pdf" });
}

const defaultSubject = (examination: ExaminationType) => subjectsByExamination[examination][0];

export function PastPaperFinder() {
  const { confirm, prompt, host: dialogHost } = useAppDialog();
  const isTrial = useTrialAccess();
  const [examination, setExamination] = useState<ExaminationType>("O/L");
  const [year, setYear] = useState(currentYear - 2);
  const [subject, setSubject] = useState(defaultSubject("O/L"));
  const [customSubject, setCustomSubject] = useState("");
  const [medium, setMedium] = useState<PaperMedium>("Sinhala");
  const [selectedKinds, setSelectedKinds] = useState<PaperKind[]>(["Question Paper"]);
  const [importPaperKind, setImportPaperKind] = useState<PaperKind>("Question Paper");
  const [sourceStatuses, setSourceStatuses] = useState<PaperSourceStatus[]>([]);
  const [results, setResults] = useState<PaperDownloadResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeDownloadId, setActiveDownloadId] = useState<string | null>(null);
  const [papers, setPapers] = useState<SavedPaper[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [filterExamination, setFilterExamination] = useState<ExaminationType | "All">("All");
  const [filterMedium, setFilterMedium] = useState<PaperMedium | "All">("All");
  const [filterKind, setFilterKind] = useState<PaperKind | "All">("All");
  const [sortBy, setSortBy] = useState<"year" | "subject" | "downloadedAt">("downloadedAt");
  const [sourceUrl, setSourceUrl] = useState("");
  const [preview, setPreview] = useState<{ paper: SavedPaper; url: string } | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewPageCount, setPreviewPageCount] = useState(0);
  const [importedFilename, setImportedFilename] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const previewFrame = useRef<HTMLIFrameElement>(null);
  const papersRef = useRef<SavedPaper[]>([]);

  const selectedSubject = subject === "Other" ? customSubject.trim() : subject;
  const query: PaperSearchQuery = { examination, year, subject: selectedSubject || subject, medium };

  useEffect(() => {
    let active = true;
    const loadLibrary = async () => {
      try {
        const storedPapers = await db.getAllPastPapers();
        if (active) {
          papersRef.current = storedPapers;
          setPapers(storedPapers);
          setError("");
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load the local paper library.");
      } finally {
        if (active) setLoadingLibrary(false);
      }
    };
    void loadLibrary();
    return () => { active = false; };
  }, []);
  const showPreview = (paper: SavedPaper) => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreviewPage(1);
    setPreviewPageCount(0);
    setPreview({ paper, url: URL.createObjectURL(paper.blob) });
  };
  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };
  const printPaper = async (paper: SavedPaper) => {
    if (window.littlePaperDesktop?.isDesktop) {
      try {
        const result = await printPdfBlob(paper.blob);
        if (result.status === "previewed") setNotice("Print preview opened. Choose your printer and select Print.");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not open the paper print preview.");
      }
      return;
    }
    if (preview?.paper.id === paper.id) {
      previewFrame.current?.contentWindow?.print();
      return;
    }
    showPreview(paper);
    window.setTimeout(() => previewFrame.current?.contentWindow?.print(), 250);
  };

  const visiblePapers = useMemo(() => {
    const search = libraryQuery.trim().toLocaleLowerCase();
    return papers.filter(paper =>
      (filterExamination === "All" || paper.examination === filterExamination)
      && (filterMedium === "All" || paper.medium === filterMedium)
      && (filterKind === "All" || paper.paperKind === filterKind)
      && (!search || `${paper.title} ${paper.originalFilename} ${paper.subject} ${paper.year}`.toLocaleLowerCase().includes(search))
    ).sort((left, right) => sortBy === "year"
      ? right.year - left.year
      : sortBy === "subject"
        ? left.subject.localeCompare(right.subject)
        : right.downloadedAt - left.downloadedAt);
  }, [papers, libraryQuery, filterExamination, filterMedium, filterKind, sortBy]);

  const downloadCandidate = async (candidate: PaperSearchCandidate, newVersion = false, previewOnly = false) => {
    const existing = papersRef.current.find(paper => sameSavedPaper(paper, candidate));
    if (existing && !newVersion) {
      if (previewOnly) showPreview(existing);
      else setResults(previous => previous.map(result => result.candidate.id === candidate.id
          ? { ...result, state: "Already Saved", detail: "This exact source PDF is already in your local library.", progress: null, existingPaper: existing }
          : result));
      return;
    }

    setActiveDownloadId(candidate.id);
    setResults(previous => previous.map(result => result.candidate.id === candidate.id
      ? { ...result, state: "Downloading PDF", detail: "Downloading the published PDF from the approved source…", progress: 0, existingPaper: undefined }
      : result));
    try {
      const response = await fetch("/api/past-papers/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, paperKind: candidate.paperKind, candidateId: candidate.id })
      });
      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : `The PDF source returned HTTP ${response.status}.`;
        throw new Error(message);
      }
      const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
      if (contentType !== "application/pdf") throw new Error("The download route did not return a PDF response.");
      const blob = await readDownloadResponse(response, progress => {
        setResults(previous => previous.map(result => result.candidate.id === candidate.id ? { ...result, progress } : result));
      });
      const file = new File([blob], candidate.filename, { type: contentType });
      setResults(previous => previous.map(result => result.candidate.id === candidate.id
        ? { ...result, state: "Validating PDF", detail: "Checking PDF signature and duplicate checksum…", progress: null }
        : result));
      await validatePdfFile(file);
      const checksum = await checksumForBlob(blob);
      const identical = checksum ? papersRef.current.find(paper => paper.checksum === checksum) : undefined;
      if (identical) {
        setResults(previous => previous.map(result => result.candidate.id === candidate.id
          ? { ...result, state: "Already Saved", detail: "The downloaded bytes match an existing local PDF exactly.", progress: null, existingPaper: identical }
          : result));
        return;
      }
      const saved: SavedPaper = {
        ...candidate,
        id: crypto.randomUUID(),
        title: candidate.title,
        originalFilename: sanitizePaperFilename(candidate.filename),
        sourceUrl: candidate.directPdfUrl,
        downloadedAt: Date.now(),
        fileSize: blob.size,
        mimeType: contentType,
        checksum,
        verified: true,
        blob
      };
      if (previewOnly) {
        setPreviewPage(1);
        setPreviewPageCount(0);
        setPreview({ paper: saved, url: URL.createObjectURL(blob) });
        setResults(previous => previous.map(result => result.candidate.id === candidate.id
          ? { ...result, state: "Paper Found", detail: "Opened a temporary preview; the PDF was not saved to the library.", progress: null }
          : result));
      } else {
        await db.putPastPaper(saved);
        papersRef.current = [saved, ...papersRef.current];
        setPapers(papersRef.current);
        setResults(previous => previous.map(result => result.candidate.id === candidate.id
          ? { ...result, state: "Saved Locally", detail: `${formatPaperSize(blob.size)} validated and saved in IndexedDB.`, progress: null, existingPaper: saved }
          : result));
      }
    } catch (cause) {
      setResults(previous => previous.map(result => result.candidate.id === candidate.id
        ? { ...result, state: "Download Failed", detail: cause instanceof Error ? cause.message : "The PDF could not be downloaded or saved.", progress: null }
        : result));
    } finally {
      setActiveDownloadId(null);
    }
  };

  const runSearch = async () => {
    setError("");
    setNotice("");
    if (!selectedSubject) {
      setError("Enter a subject before searching.");
      return;
    }
    if (selectedKinds.length === 0) {
      setError("Choose Question Paper, Marking Scheme, or both.");
      return;
    }
    setSearching(true);
    setResults([]);
    setSourceStatuses([
      { sourceName: "Department of Examinations, Sri Lanka", state: "searching", message: "Searching the official public paper catalog…", sourceUrl: officialSourceUrl },
      { sourceName: "e-Thaksalawa", state: "searching", message: "Checking whether automatic search is available…", sourceUrl: eThaksalawaUrl }
    ]);
    try {
      const response = await fetch("/api/past-papers/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, kinds: selectedKinds })
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : `Search failed with HTTP ${response.status}.`;
        throw new Error(message);
      }
      if (!data || typeof data !== "object" || !("candidates" in data) || !Array.isArray(data.candidates) || !("sources" in data) || !Array.isArray(data.sources)) {
        throw new Error("The source search returned an invalid response.");
      }
      const candidates = data.candidates as PaperSearchCandidate[];
      setSourceStatuses(data.sources as PaperSourceStatus[]);
      setResults(candidates.map(candidate => ({
        candidate,
        state: "Paper Found",
        detail: "Exact examination, year, subject, medium, and paper type match verified against the source catalog.",
        progress: null
      })));
      if ("truncated" in data && data.truncated === true) setNotice("The source returned many matching PDF files; the first eight matches are shown.");
      else if (candidates.length === 0) {
        const statuses = data.sources as PaperSourceStatus[];
        if (statuses.some(status => status.state === "manual-required")) setNotice("No exact automatic match was safe to download. Use the official source page or import a PDF manually.");
        else setNotice("No matching paper was found in the supported source catalog.");
      } else {
        if (isTrial) {
          setNotice("Select Preview PDF to view a paper temporarily. Downloads and saving to the library require full access.");
        } else {
          for (let index = 0; index < candidates.length; index += 1) {
            if (index > 0) await new Promise(resolve => window.setTimeout(resolve, 750));
            await downloadCandidate(candidates[index]);
          }
        }
      }
    } catch (cause) {
      setSourceStatuses([{
        sourceName: "Supported paper sources",
        state: "unavailable",
        message: cause instanceof Error ? cause.message : "Could not search the supported sources.",
        sourceUrl: officialSourceUrl
      }]);
      setError(cause instanceof Error ? cause.message : "Could not search the supported sources.");
    } finally {
      setSearching(false);
    }
  };

  const importPdf = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setNotice("");
    setSaving(true);
    setImportedFilename(file.name);
    try {
      await validatePdfFile(file);
      if (!isSafeSourceUrl(sourceUrl)) throw new Error("Source URL must be a valid HTTP or HTTPS address.");
      const checksum = await checksumForBlob(file);
      if (checksum && papersRef.current.some(paper => paper.checksum === checksum)) {
        setNotice("This exact PDF is already saved in your library. No duplicate copy was added.");
        return;
      }
      const originalFilename = sanitizePaperFilename(file.name);
      const saved: SavedPaper = {
        ...query,
        id: crypto.randomUUID(),
        paperKind: importPaperKind,
        title: originalFilename.replace(/\.pdf$/i, ""),
        originalFilename,
        sourceUrl: sourceUrl.trim(),
        downloadedAt: Date.now(),
        fileSize: file.size,
        mimeType: file.type || "application/pdf",
        checksum,
        verified: true,
        blob: file
      };
      await db.putPastPaper(saved);
      papersRef.current = [saved, ...papersRef.current];
      setPapers(papersRef.current);
      setNotice(`${originalFilename} was validated and saved in this browser's IndexedDB library.`);
      setImportedFilename("");
      if (fileInput.current) fileInput.current.value = "";
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not import this PDF.");
    } finally {
      setSaving(false);
    }
  };

  const openPaper = (paper: SavedPaper) => {
    const url = URL.createObjectURL(paper.blob);
    const opened = window.open(url, "_blank");
    if (!opened) setError("The browser blocked the new tab. Allow pop-ups for this app, or use Preview instead.");
    else opened.opener = null;
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const exportPaper = (paper: SavedPaper) => {
    const url = URL.createObjectURL(paper.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = paper.originalFilename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  const renamePaper = async (paper: SavedPaper) => {
    const title = await prompt("Rename saved paper", "Display title", paper.title);
    if (title === null || !title.trim() || title.trim() === paper.title) return;
    try {
      const updated = { ...paper, title: title.trim().slice(0, 180) };
      await db.putPastPaper(updated);
      papersRef.current = papersRef.current.map(item => item.id === paper.id ? updated : item);
      setPapers(papersRef.current);
      setNotice("Display title updated. The PDF file itself was not changed.");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not rename this saved paper.");
    }
  };

  const deletePaper = async (paper: SavedPaper) => {
    if (!await confirm("Delete saved paper", `Delete “${paper.title}” from this browser's paper library?`)) return;
    try {
      await db.deletePastPaper(paper.id);
      papersRef.current = papersRef.current.filter(item => item.id !== paper.id);
      setPapers(papersRef.current);
      if (preview?.paper.id === paper.id) closePreview();
      setNotice("Saved paper deleted from this browser.");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this saved paper.");
    }
  };

  const toggleKind = (kind: PaperKind) => {
    setSelectedKinds(previous => previous.includes(kind)
      ? previous.filter(value => value !== kind)
      : [...previous, kind]);
  };

  return <LocalizedUi><div className="past-paper-finder space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="eyebrow">EXAM RESOURCES · LOCAL LIBRARY</div>
        <h1 className="page-title">Past Paper Finder</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Search supported public catalogs and automatically save verified direct PDFs to this browser&apos;s local library.
        </p>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-[#e3ece7] bg-[#f8fbf9] px-3 py-2 text-xs text-[#61796e]">
        <FolderOpen size={15}/> IndexedDB library · this browser
      </div>
    </header>

    <div className="app-toast-stack no-print">
      {error && <AppToast key={`error-${error}`} variant="error" message={error} onClose={() => setError("")}/>}
      {notice && <AppToast key={`success-${notice}`} variant="success" message={notice} onClose={() => setNotice("")}/>}
    </div>

    <section className="soft-card p-5 md:p-6" data-trial-allow aria-labelledby="paper-search-heading">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf4ef] text-[#347765]"><Search size={19}/></div>
        <div><h2 id="paper-search-heading" className="text-base font-bold">Find &amp; Download</h2><p className="mt-1 text-xs text-slate-500">Exact source matches are downloaded, checked, and saved automatically.</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="field-label">Examination
          <select className="text-input mt-2" value={examination} onChange={event => {
            const next = event.target.value as ExaminationType;
            setExamination(next);
            setSubject(defaultSubject(next));
            setCustomSubject("");
          }}>{examTypes.map(value => <option key={value}>{value}</option>)}</select>
        </label>
        <label className="field-label">Year
          <select className="text-input mt-2" value={year} onChange={event => setYear(Number(event.target.value))}>{years.map(value => <option key={value}>{value}</option>)}</select>
        </label>
        <label className="field-label">Subject
          <select className="text-input mt-2" value={subject} onChange={event => setSubject(event.target.value)}>
            {subjectsByExamination[examination].map(value => <option key={value}>{value}</option>)}
            <option value="Other">Other subject…</option>
          </select>
        </label>
        <label className="field-label">Medium
          <select className="text-input mt-2" value={medium} onChange={event => setMedium(event.target.value as PaperMedium)}>{mediums.map(value => <option key={value}>{value}</option>)}</select>
        </label>
      </div>
      {subject === "Other" && <label className="field-label mt-4 block">Subject name
        <input className="text-input mt-2 max-w-xl" value={customSubject} onChange={event => setCustomSubject(event.target.value)} placeholder="Enter the subject to search"/>
      </label>}
      <fieldset className="mt-5">
        <legend className="field-label mb-2">Paper type</legend>
        <div className="flex flex-wrap gap-3">
          {paperKinds.map(kind => <label key={kind} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e6ebf0] bg-white px-3 text-sm text-slate-700">
            <input type="checkbox" checked={selectedKinds.includes(kind)} onChange={() => toggleKind(kind)}/>{kind}
          </label>)}
        </div>
      </fieldset>
      <button className="primary-button mt-5" disabled={searching || activeDownloadId !== null} onClick={() => void runSearch()}>
        {searching || activeDownloadId ? <><LoaderCircle size={15} className="animate-spin"/> {activeDownloadId ? "Loading PDF preview…" : "Searching Sources…"}</> : <><Search size={15}/> {isTrial ? "Find papers" : "Find &amp; Download"}</>}
      </button>
      <div className="tip-card mt-5">
        <AlertCircle size={17} className="mt-0.5 shrink-0 text-[#c58a47]"/>
        <p className="text-xs leading-5">Automatic downloads are limited to direct PDFs listed by the official Department catalog and only when its published metadata exactly matches every selected field. The Department currently omits subject names from many O/L/A/L entries, so those are marked for manual download instead of guessing. No login, CAPTCHA, or access restriction is bypassed.</p>
      </div>
    </section>

    {(searching || sourceStatuses.length > 0) && <section aria-labelledby="source-results-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="source-results-heading" className="text-base font-bold">Search results</h2><p className="mt-1 text-xs text-slate-500">{query.examination} · {query.year} · {query.subject} · {query.medium}</p></div>
        {sourceStatuses.length > 0 && !searching && <button className="small-action" onClick={() => { setSourceStatuses([]); setResults([]); setNotice(""); }}><X size={14}/> Clear results</button>}
      </div>
      <div className="grid gap-3">
        {sourceStatuses.map(status => <article className="soft-card flex flex-wrap items-start justify-between gap-3 p-4" key={status.sourceName}>
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f0f4fb] text-[#4c6b99]">
              {status.state === "searching" ? <LoaderCircle size={17} className="animate-spin"/> : status.state === "found" ? <CheckCircle2 size={17}/> : <AlertCircle size={17}/>}
            </div>
            <div><h3 className="font-semibold text-slate-800">{status.sourceName} · {stateLabel(status.state)}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{status.message}</p></div>
          </div>
          {status.state !== "searching" && status.state !== "found" && <a className="small-action shrink-0" data-paid-feature href={status.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={14}/> Open source</a>}
        </article>)}
      </div>
      {searching && <div className="soft-card flex items-center gap-2 p-4 text-sm text-slate-600"><LoaderCircle size={16} className="animate-spin"/> Searching Sources…</div>}
      {results.length > 0 && <div className="grid gap-3">
        {results.map(result => <article className="soft-card p-4" key={result.candidate.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff4e7] text-[#bd7a2f]"><FileText size={18}/></div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800">{result.candidate.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{result.candidate.examination} · {result.candidate.year} · {result.candidate.subject} · {result.candidate.medium} · {result.candidate.paperKind}</p>
                <p className="mt-1 break-all text-[11px] text-slate-400">{result.candidate.filename} · {result.candidate.sourceName}</p>
                {!isTrial && <p className="mt-1 break-all text-[11px] text-slate-400">Published PDF: {result.candidate.directPdfUrl}</p>}
                <p className="mt-2 text-xs text-slate-600" role="status">{result.state}{result.detail ? ` · ${result.detail}` : ""}</p>
                {result.state === "Downloading PDF" && <div className="mt-2 max-w-md">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#397b68] transition-[width] duration-150" style={{ width: `${result.progress ?? 8}%` }}/></div>
                  <p className="mt-1 text-[10px] text-slate-400">{result.progress === null ? "Downloading…" : `${result.progress}%`}</p>
                </div>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isTrial && result.state === "Paper Found" && <button className="small-action" data-trial-allow disabled={activeDownloadId !== null} onClick={() => void downloadCandidate(result.candidate, false, true)}><BookOpen size={14}/> Preview PDF</button>}
              {result.existingPaper && <>
                <button className="small-action" data-paid-feature onClick={() => openPaper(result.existingPaper!)}><FolderOpen size={14}/> Open</button>
                <button className="small-action" data-trial-allow onClick={() => showPreview(result.existingPaper!)}><BookOpen size={14}/> Preview</button>
                <button className="small-action" data-paid-feature onClick={() => void printPaper(result.existingPaper!)}><Printer size={14}/> Print</button>
                <button className="small-action" data-paid-feature onClick={() => exportPaper(result.existingPaper!)}><ArrowDownToLine size={14}/> Export</button>
                {result.state === "Already Saved" && <button className="small-action" data-paid-feature disabled={activeDownloadId !== null} onClick={() => void downloadCandidate(result.candidate, true)}>Download New Version</button>}
              </>}
              {result.state === "Download Failed" && <button className="small-action" data-paid-feature disabled={activeDownloadId !== null} onClick={() => void downloadCandidate(result.candidate)}>Retry download</button>}
            </div>
          </div>
        </article>)}
      </div>}
    </section>}

    <section className="soft-card p-5 md:p-6" aria-labelledby="manual-import-heading">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff4e7] text-[#bd7a2f]"><Upload size={18}/></div>
        <div><h2 id="manual-import-heading" className="text-base font-bold">Import a paper PDF</h2><p className="mt-1 text-xs text-slate-500">Save a PDF you downloaded from a source page to this browser&apos;s local library.</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="field-label">Paper type
          <select className="text-input mt-2" value={importPaperKind} onChange={event => setImportPaperKind(event.target.value as PaperKind)}>{paperKinds.map(value => <option key={value}>{value}</option>)}</select>
        </label>
        <label className="field-label sm:col-span-1 xl:col-span-3">Original source page URL <span className="font-normal text-slate-400">· optional</span>
          <input className="text-input mt-2" type="url" inputMode="url" value={sourceUrl} onChange={event => setSourceUrl(event.target.value)} placeholder="https://publisher.example/paper-page"/>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className={`primary-button cursor-pointer ${saving ? "pointer-events-none opacity-60" : ""}`}>
          {saving ? <><LoaderCircle size={15} className="animate-spin"/> Validating and saving…</> : <><Upload size={15}/> Choose PDF to import</>}
          <input ref={fileInput} className="hidden" type="file" accept="application/pdf,.pdf" disabled={saving} onChange={event => {
            void importPdf(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}/>
        </label>
        <span className="text-xs text-slate-500">PDF signature checked · maximum 50 MB · duplicate checks use SHA-256</span>
      </div>
      {saving && importedFilename && <p className="mt-3 text-xs text-slate-500" role="status">Checking {importedFilename} and writing it to IndexedDB…</p>}
    </section>

    <section aria-labelledby="paper-library-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><div className="eyebrow">SAVED ON THIS DEVICE</div><h2 id="paper-library-heading" className="mt-1 text-lg font-bold">Paper library <span className="text-sm font-medium text-slate-400">({papers.length})</span></h2><p className="mt-1 text-xs text-slate-500">Persistent browser storage is separate from files exported to your computer.</p></div>
      </div>
      <div className="soft-card mb-4 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5" data-trial-allow>
        <label className="search-box sm:col-span-2"><Search size={15}/><input aria-label="Search saved papers" className="!w-full" placeholder="Search year, subject, title, filename" value={libraryQuery} onChange={event => setLibraryQuery(event.target.value)}/></label>
        <label className="sr-only" htmlFor="paper-filter-exam">Filter by examination</label>
        <select id="paper-filter-exam" className="text-input" value={filterExamination} onChange={event => setFilterExamination(event.target.value as ExaminationType | "All")}><option value="All">All examinations</option>{examTypes.map(value => <option key={value}>{value}</option>)}</select>
        <label className="sr-only" htmlFor="paper-filter-medium">Filter by medium</label>
        <select id="paper-filter-medium" className="text-input" value={filterMedium} onChange={event => setFilterMedium(event.target.value as PaperMedium | "All")}><option value="All">All mediums</option>{mediums.map(value => <option key={value}>{value}</option>)}</select>
        <label className="sr-only" htmlFor="paper-filter-kind">Filter by paper type</label>
        <select id="paper-filter-kind" className="text-input" value={filterKind} onChange={event => setFilterKind(event.target.value as PaperKind | "All")}><option value="All">All paper types</option>{paperKinds.map(value => <option key={value}>{value}</option>)}</select>
        <label className="field-label flex items-center gap-2 sm:col-span-2 xl:col-span-5">Sort by
          <select className="text-input max-w-xs" value={sortBy} onChange={event => setSortBy(event.target.value as typeof sortBy)}>
            <option value="downloadedAt">Download date</option><option value="year">Year</option><option value="subject">Subject</option>
          </select>
        </label>
      </div>

      {loadingLibrary ? <div className="soft-card flex items-center justify-center gap-2 p-10 text-sm text-slate-500"><LoaderCircle size={17} className="animate-spin"/> Loading saved papers…</div>
        : visiblePapers.length === 0 ? <div className="empty-large"><div className="empty-illustration"><FileText size={26}/></div><h3>{papers.length ? "No papers match these filters" : "Your paper library is empty"}</h3><p>{papers.length ? "Change your search or filters to see saved PDFs." : "Search a source page, download a paper yourself, and import its PDF to keep a local copy."}</p></div>
          : <div className="grid gap-3">
            {visiblePapers.map(paper => <article className="soft-card flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between" key={paper.id}>
              <div className="flex min-w-0 items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff4e7] text-[#bd7a2f]"><FileText size={18}/></div>
                <div className="min-w-0">
                  <h3 className="break-words font-semibold text-slate-800">{paper.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{paper.examination} · {paper.year} · {paper.subject} · {paper.medium} · {paper.paperKind}</p>
                  <p className="mt-1 break-all text-[11px] text-slate-400">{paper.originalFilename} · {formatPaperSize(paper.fileSize)} · Saved {new Date(paper.downloadedAt).toLocaleDateString()}</p>
                  {paper.sourceUrl && <a className="mt-1 inline-flex items-center gap-1 break-all text-[11px] text-[#397b68] hover:underline" data-paid-feature href={paper.sourceUrl} target="_blank" rel="noopener noreferrer">Original source page <ExternalLink size={11}/></a>}
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#eaf4ef] px-2 py-1 text-[10px] font-semibold text-[#2d6b58]"><CheckCircle2 size={12}/> Verified PDF · stored locally</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <button className="small-action" data-trial-allow onClick={() => showPreview(paper)}><BookOpen size={14}/> Preview</button>
                <button className="small-action" data-paid-feature onClick={() => openPaper(paper)}><FolderOpen size={14}/> Open</button>
                <button className="small-action" data-paid-feature onClick={() => void printPaper(paper)}><Printer size={14}/> Print</button>
                <button className="small-action" data-paid-feature onClick={() => exportPaper(paper)}><ArrowDownToLine size={14}/> Export</button>
                <button className="small-action" aria-label={`Rename ${paper.title}`} onClick={() => void renamePaper(paper)}><Pencil size={14}/></button>
                <button className="small-action text-rose-700 hover:!bg-rose-50" aria-label={`Delete ${paper.title}`} onClick={() => void deletePaper(paper)}><Trash2 size={14}/></button>
              </div>
            </article>)}
          </div>}
    </section>

    {preview && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-3 md:p-8" role="dialog" aria-modal="true" aria-label={`Preview ${preview.paper.title}`}>
      <div className="flex h-[min(92vh,1000px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="min-w-0"><h2 className="truncate font-semibold text-slate-800">{preview.paper.title}</h2><p className="mt-1 text-xs text-slate-500">{preview.paper.examination} · {preview.paper.year} · {preview.paper.subject} · {preview.paper.medium} · {formatPaperSize(preview.paper.fileSize)}</p></div>
          <div className="flex gap-2">
              <button className="small-action" data-paid-feature onClick={() => void printPaper(preview.paper)}><Printer size={14}/> Print</button>
              <button className="small-action" data-paid-feature onClick={() => exportPaper(preview.paper)}><ArrowDownToLine size={14}/> Export</button>
            <button className="small-action" data-trial-allow aria-label="Close preview" onClick={closePreview}><X size={16}/></button>
          </div>
        </div>
          {isTrial
            ? <><div className="flex items-center justify-center gap-3 border-b border-slate-100 py-2 text-xs"><button className="small-action" data-trial-allow disabled={previewPage <= 1} onClick={() => setPreviewPage(page => Math.max(1, page - 1))}>Previous</button><span>Page {previewPage} / {previewPageCount || "…"}</span><button className="small-action" data-trial-allow disabled={previewPageCount === 0 || previewPage >= previewPageCount} onClick={() => setPreviewPage(page => Math.min(previewPageCount, page + 1))}>Next</button></div><TrialPaperPreview url={preview.url} pageNumber={previewPage} onPageCount={setPreviewPageCount}/></>
            : <iframe ref={previewFrame} title={`${preview.paper.title} PDF preview`} src={preview.url} className="min-h-0 flex-1 bg-slate-100"/>}
      </div>
    </div>}
  </div>{dialogHost}</LocalizedUi>;
}
