import {
  type ExaminationType,
  type PaperKind,
  type PaperMedium,
  type PaperSearchCandidate,
  type PaperSearchQuery,
  type PaperSourceStatus
} from "@/lib/past-papers";

const DOENETS_ORIGIN = "https://doenets.lk";
const DOENETS_HOME = `${DOENETS_ORIGIN}/`;
const DOENETS_CATALOG_URL = `${DOENETS_ORIGIN}/cms/api/resources?isEnabled=1&rowCount=0&type=PAPA`;
const MAX_CATALOG_BYTES = 10 * 1024 * 1024;
const catalogCacheMs = 5 * 60 * 1000;

interface DoENormalizedText {
  en?: unknown;
  si?: unknown;
  ta?: unknown;
}

interface DoETag {
  en?: unknown;
  categoryCode?: unknown;
}

interface DoELink {
  lable?: DoENormalizedText;
  link?: DoENormalizedText;
}

interface DoEResource {
  id?: unknown;
  title?: DoENormalizedText;
  description?: DoENormalizedText;
  tags?: unknown;
  links?: unknown;
  resourceType?: unknown;
  isEnabled?: unknown;
}

interface DoECatalog {
  resources?: unknown;
}

interface CatalogCache {
  expiresAt: number;
  resources: DoEResource[];
}

let cachedCatalog: CatalogCache | undefined;
let pendingCatalog: Promise<DoEResource[]> | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getLocalizedText(value: unknown): DoENormalizedText {
  return isRecord(value) ? value : {};
}

function getText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asResource(value: unknown): value is DoEResource {
  return isRecord(value)
    && (typeof value.id === "number" || typeof value.id === "string")
    && isRecord(value.title)
    && Array.isArray(value.tags)
    && Array.isArray(value.links);
}

async function readCatalog(): Promise<DoEResource[]> {
  if (cachedCatalog && cachedCatalog.expiresAt > Date.now()) return cachedCatalog.resources;
  if (pendingCatalog) return pendingCatalog;

  pendingCatalog = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
    try {
      const response = await fetch(DOENETS_CATALOG_URL, {
        headers: { Accept: "application/json" },
        redirect: "manual",
        signal: controller.signal,
        cache: "no-store"
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        const redirect = location ? new URL(location, DOENETS_ORIGIN) : null;
        if (!redirect || redirect.protocol !== "https:" || redirect.hostname !== "doenets.lk") {
          throw new Error("The Department paper catalog redirected to an unapproved destination.");
        }
        throw new Error("The Department paper catalog redirected; automatic access is unavailable for now.");
      }
      if (!response.ok) throw new Error(`The Department paper catalog returned HTTP ${response.status}.`);
      const mediaType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
      if (mediaType !== "application/json") throw new Error("The Department paper catalog did not return JSON.");
      const declaredLength = Number(response.headers.get("content-length") ?? 0);
      if (declaredLength > MAX_CATALOG_BYTES) throw new Error("The Department paper catalog response exceeded its size limit.");
      const body = await response.text();
      if (new TextEncoder().encode(body).byteLength > MAX_CATALOG_BYTES) throw new Error("The Department paper catalog response exceeded its size limit.");
      const payload: unknown = JSON.parse(body);
      if (!isRecord(payload) || !Array.isArray((payload as DoECatalog).resources)) {
        throw new Error("The Department paper catalog returned an unexpected response.");
      }
      const resources = (payload as { resources: unknown[] }).resources.filter(asResource);
      cachedCatalog = { expiresAt: Date.now() + catalogCacheMs, resources };
      return resources;
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") {
        throw new Error("The Department paper catalog timed out. Try again later or use manual download.");
      }
      throw cause;
    } finally {
      clearTimeout(timeout);
      pendingCatalog = undefined;
    }
  })();

  return pendingCatalog;
}

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[\s\p{P}\p{S}]+/gu, " ").trim();
}

function resourceText(resource: DoEResource): string {
  const fields = [
    ...Object.values(getLocalizedText(resource.title)),
    ...Object.values(getLocalizedText(resource.description))
  ];
  for (const linkValue of resource.links as unknown[]) {
    if (!isRecord(linkValue)) continue;
    fields.push(...Object.values(getLocalizedText((linkValue as DoELink).lable)));
    fields.push(...Object.values(getLocalizedText((linkValue as DoELink).link)));
  }
  return fields.filter((value): value is string => typeof value === "string").join(" ");
}

function yearFromResource(resource: DoEResource): number | null {
  const tags = resource.tags as unknown[];
  for (const value of tags) {
    if (!isRecord(value)) continue;
    const tag = value as DoETag;
    if (tag.categoryCode === "YEAR") {
      const year = Number(tag.en);
      if (Number.isInteger(year) && year >= 1900 && year <= 2200) return year;
    }
  }
  return null;
}

function matchesExamination(text: string, examination: ExaminationType): boolean {
  const normalized = normalize(text);
  if (examination === "O/L") {
    return normalized.includes("ordinary level") || normalized.includes("o l examination") || normalized.includes("o l exam");
  }
  if (examination === "A/L") {
    return normalized.includes("advanced level") || normalized.includes("a l examination") || normalized.includes("a l exam");
  }
  return /grade\s*5|scholarship examination/i.test(text);
}

function containsPhrase(text: string, phrase: string): boolean {
  const textWords = normalize(text).split(" ");
  const phraseWords = normalize(phrase).split(" ");
  if (phraseWords.length === 0 || phraseWords.some(word => !word)) return false;
  return textWords.some((_, index) => phraseWords.every((word, wordIndex) => textWords[index + wordIndex] === word));
}

function getLanguageLink(value: DoENormalizedText | undefined, medium: PaperMedium): string {
  if (!value) return "";
  const languageKey: Record<PaperMedium, "si" | "en" | "ta"> = {
    Sinhala: "si",
    English: "en",
    Tamil: "ta"
  };
  return getText(value[languageKey[medium]]).trim();
}

function publishedPdfUrl(value: string): URL | null {
  try {
    const url = new URL(value, DOENETS_ORIGIN);
    if (url.protocol !== "https:" || url.hostname !== "doenets.lk" || !url.pathname.startsWith("/images/resources/PAPA/")) return null;
    if (!/\.pdf$/i.test(url.pathname)) return null;
    return url;
  } catch {
    return null;
  }
}

function isPastPaperResource(resource: DoEResource, kind: PaperKind): boolean {
  const tags = resource.tags as unknown[];
  const editions = tags.flatMap(value => isRecord(value) && value.categoryCode === "EDITION" && typeof value.en === "string" ? [value.en] : []);
  const text = normalize(resourceText(resource));
  if (kind === "Marking Scheme") return text.includes("marking scheme");
  return editions.some(edition => normalize(edition).includes("past paper")) || text.includes("past paper");
}

function filenameForUrl(url: URL): string {
  const filename = decodeURIComponent(url.pathname.split("/").pop() ?? "past-paper.pdf");
  return filename.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").slice(0, 180);
}

function matchCandidate(resource: DoEResource, query: PaperSearchQuery, kind: PaperKind): PaperSearchCandidate[] {
  if (resource.isEnabled === false || resource.resourceType !== "PAPA") return [];
  if (yearFromResource(resource) !== query.year) return [];
  const text = resourceText(resource);
  if (!matchesExamination(text, query.examination)) return [];

  if (!containsPhrase(text, query.subject)) return [];
  if (!isPastPaperResource(resource, kind)) return [];

  const candidates: PaperSearchCandidate[] = [];
  const links = resource.links as unknown[];
  for (let index = 0; index < links.length; index += 1) {
    const value = links[index];
    if (!isRecord(value)) continue;
    const link = value as DoELink;
    const rawPdf = getLanguageLink(link.link, query.medium);
    const pdfUrl = publishedPdfUrl(rawPdf);
    if (!pdfUrl) continue;
    candidates.push({
      ...query,
      id: `doenets-${String(resource.id)}-${query.medium}-${kind.toLowerCase().replaceAll(" ", "-")}-${index}`,
      paperKind: kind,
      title: getText(getLocalizedText(resource.title).en).trim(),
      filename: filenameForUrl(pdfUrl),
      sourceName: "Department of Examinations, Sri Lanka",
      sourcePageUrl: DOENETS_HOME,
      directPdfUrl: pdfUrl.href,
      automaticDownload: true
    });
  }
  return candidates;
}

function hasExamYearResource(resources: DoEResource[], query: PaperSearchQuery): boolean {
  return resources.some(resource =>
    resource.resourceType === "PAPA"
    && yearFromResource(resource) === query.year
    && matchesExamination(resourceText(resource), query.examination)
  );
}

export async function searchDoENetPapers(
  query: PaperSearchQuery,
  kinds: PaperKind[]
): Promise<{ candidates: PaperSearchCandidate[]; status: PaperSourceStatus }> {
  const resources = await readCatalog();
  const candidates = kinds.flatMap(kind => resources.flatMap(resource => matchCandidate(resource, query, kind)));
  if (candidates.length > 0) {
    return {
      candidates,
      status: {
        sourceName: "Department of Examinations, Sri Lanka",
        state: "found",
        message: "Exact catalog matches were found; only these official PDF links are eligible for automatic download.",
        sourceUrl: DOENETS_HOME
      }
    };
  }

  const examYearExists = hasExamYearResource(resources, query);
  return {
    candidates: [],
    status: {
      sourceName: "Department of Examinations, Sri Lanka",
      state: examYearExists ? "manual-required" : "no-match",
      message: examYearExists
        ? "The official catalog has papers for this exam and year, but does not publish the requested subject or paper type in its metadata. Automatic matching would require guessing, so open the official source and download manually."
        : "No catalog entry matched this examination and year.",
      sourceUrl: DOENETS_HOME
    }
  };
}

export function parsePaperSearchQuery(value: unknown): PaperSearchQuery | null {
  if (!isRecord(value)) return null;
  const examination = value.examination;
  const year = value.year;
  const subject = value.subject;
  const medium = value.medium;
  if (examination !== "O/L" && examination !== "A/L" && examination !== "Grade 5 Scholarship") return null;
  if (typeof year !== "number" || !Number.isInteger(year) || year < 1990 || year > new Date().getFullYear()) return null;
  if (typeof subject !== "string" || subject.trim().length < 2 || subject.trim().length > 120) return null;
  if (medium !== "Sinhala" && medium !== "English" && medium !== "Tamil") return null;
  if (examination === "Grade 5 Scholarship" && normalize(subject) !== normalize("Scholarship Examination")) return null;
  if (/[<>]/.test(subject)) return null;
  return { examination, year, subject: subject.trim(), medium };
}

export function parsePaperKinds(value: unknown): PaperKind[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 2) return null;
  const result: PaperKind[] = [];
  for (const kind of value) {
    if (kind !== "Question Paper" && kind !== "Marking Scheme") return null;
    if (!result.includes(kind)) result.push(kind);
  }
  return result;
}

export async function getDoENetCandidateForDownload(
  query: PaperSearchQuery,
  kind: PaperKind,
  candidateId: string
): Promise<PaperSearchCandidate | null> {
  const found = await searchDoENetPapers(query, [kind]);
  return found.candidates.find(candidate => candidate.id === candidateId) ?? null;
}

export function isAllowedDoENetPdfUrl(value: string): URL | null {
  return publishedPdfUrl(value);
}
