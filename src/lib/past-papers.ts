export type ExaminationType = "O/L" | "A/L" | "Grade 5 Scholarship";
export type PaperMedium = "Sinhala" | "English" | "Tamil";
export type PaperKind = "Question Paper" | "Marking Scheme";

export interface PaperSearchQuery {
  examination: ExaminationType;
  year: number;
  subject: string;
  medium: PaperMedium;
}

export interface PaperSearchCandidate extends PaperSearchQuery {
  id: string;
  paperKind: PaperKind;
  title: string;
  filename: string;
  sourceName: string;
  sourcePageUrl: string;
  directPdfUrl: string;
  automaticDownload: true;
}

export type PaperSourceState = "searching" | "found" | "manual-required" | "no-match" | "unavailable";

export interface PaperSourceStatus {
  sourceName: string;
  state: PaperSourceState;
  message: string;
  sourceUrl: string;
}

export interface SavedPaper extends PaperSearchQuery {
  id: string;
  paperKind: PaperKind;
  title: string;
  originalFilename: string;
  sourceUrl: string;
  downloadedAt: number;
  fileSize: number;
  mimeType: string;
  checksum: string | null;
  verified: true;
  blob: Blob;
}

export const subjectsByExamination: Record<ExaminationType, string[]> = {
  "O/L": [
    "Mathematics", "Science", "English", "Sinhala", "Tamil", "History", "Geography",
    "Buddhism", "Commerce", "ICT", "Business & Accounting Studies"
  ],
  "A/L": [
    "Combined Mathematics", "Physics", "Chemistry", "Biology", "Accounting", "Economics",
    "Business Studies", "ICT", "Engineering Technology", "Political Science", "Sinhala", "English"
  ],
  "Grade 5 Scholarship": ["Scholarship Examination"]
};

export function sanitizePaperFilename(filename: string): string {
  const baseName = filename.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/[. ]+$/g, "").trim();
  const withoutPdfExtension = baseName.replace(/\.pdf$/i, "");
  const safeBase = withoutPdfExtension.replace(/[. ]+$/g, "").slice(0, 150);
  return `${safeBase || "past-paper"}.pdf`;
}

export function validatePdfFile(file: Pick<File, "size" | "type" | "slice">, maxBytes = 50 * 1024 * 1024): Promise<void> {
  if (file.size <= 0) return Promise.reject(new Error("The selected file is empty."));
  if (file.size > maxBytes) return Promise.reject(new Error("PDF files must be 50 MB or smaller."));
  const contentType = file.type.trim().toLowerCase();
  if (contentType && !["application/pdf", "application/x-pdf", "application/octet-stream"].includes(contentType)) {
    return Promise.reject(new Error("The selected file is not identified as a PDF."));
  }
  return file.slice(0, 5).arrayBuffer().then(buffer => {
    const signature = new TextDecoder().decode(buffer);
    if (!signature.startsWith("%PDF-")) {
      throw new Error("This file does not contain a valid PDF signature. HTML error pages and other file types are rejected.");
    }
  });
}

export function isSafeSourceUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function checksumForBlob(blob: Blob): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null;
  const digest = await globalThis.crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function samePaperMetadata(left: PaperSearchQuery & { paperKind: PaperKind }, right: PaperSearchQuery & { paperKind: PaperKind }): boolean {
  return left.examination === right.examination
    && left.year === right.year
    && left.subject.trim().toLocaleLowerCase() === right.subject.trim().toLocaleLowerCase()
    && left.medium === right.medium
    && left.paperKind === right.paperKind;
}

export function sameSavedPaper(left: SavedPaper, right: PaperSearchCandidate): boolean {
  return left.sourceUrl === right.directPdfUrl;
}

export function formatPaperSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
