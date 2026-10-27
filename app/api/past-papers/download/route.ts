import { NextResponse } from "next/server";
import {
  getDoENetCandidateForDownload,
  isAllowedDoENetPdfUrl,
  parsePaperSearchQuery
} from "../../../../src/lib/past-paper-sources/doenets";
import type { PaperKind } from "../../../../src/lib/past-papers";

export const dynamic = "force-dynamic";

const MAX_PDF_BYTES = 50 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const DOWNLOAD_TIMEOUT_MS = 30_000;

function safeDownloadError(cause: unknown): string {
  if (cause instanceof Error) {
    if (cause.name === "AbortError" || cause.name === "TimeoutError") return "The official PDF download timed out. Try again later.";
    return cause.message;
  }
  return "The official PDF could not be downloaded.";
}

async function fetchPdfBytes(initialUrl: URL): Promise<ArrayBuffer> {
  let target = initialUrl;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
  try {
    let response: Response | undefined;
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
      if (!isAllowedDoENetPdfUrl(target.href)) throw new Error("The PDF URL or redirect is outside the approved Department domain.");
      response = await fetch(target, {
        headers: { Accept: "application/pdf, application/octet-stream;q=0.9" },
        redirect: "manual",
        signal: controller.signal,
        cache: "no-store"
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get("location");
      if (!location) throw new Error("The source returned a redirect without a destination.");
      target = new URL(location, target);
      if (redirects === MAX_REDIRECTS) throw new Error("The source redirected too many times.");
    }

    if (!response || response.status !== 200) {
      throw new Error(`The official PDF source returned HTTP ${response?.status ?? "unknown"}.`);
    }
    const mediaType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
    if (mediaType !== "application/pdf" && mediaType !== "application/octet-stream") {
      throw new Error(`The source returned ${mediaType || "an unknown content type"}, not a PDF.`);
    }
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_PDF_BYTES) throw new Error("The PDF is larger than the 50 MB download limit.");
    if (!response.body) throw new Error("The source returned an empty response.");

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    let firstBytes = new Uint8Array(0);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      size += value.byteLength;
      if (size > MAX_PDF_BYTES) {
        await reader.cancel();
        throw new Error("The PDF is larger than the 50 MB download limit.");
      }
      if (firstBytes.length < 5) {
        const count = Math.min(5 - firstBytes.length, value.length);
        const next = new Uint8Array(firstBytes.length + count);
        next.set(firstBytes);
        next.set(value.subarray(0, count), firstBytes.length);
        firstBytes = next;
      }
      chunks.push(value);
    }

    if (new TextDecoder().decode(firstBytes) !== "%PDF-") {
      throw new Error("The source response did not contain a PDF signature; no file was saved.");
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const output = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(output).set(bytes);
    return output;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Download request must contain valid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Download request is invalid." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const query = parsePaperSearchQuery(payload.query);
  const kind = payload.paperKind;
  const candidateId = payload.candidateId;
  if (!query || (kind !== "Question Paper" && kind !== "Marking Scheme") || typeof candidateId !== "string" || candidateId.length > 180) {
    return NextResponse.json({ error: "The selected paper request is invalid." }, { status: 400 });
  }

  try {
    const candidate = await getDoENetCandidateForDownload(query, kind as PaperKind, candidateId);
    if (!candidate) return NextResponse.json({ error: "This paper is no longer an exact match in the approved source catalog." }, { status: 404 });
    const url = isAllowedDoENetPdfUrl(candidate.directPdfUrl);
    if (!url) return NextResponse.json({ error: "The approved source returned an unsafe PDF URL." }, { status: 400 });
    const bytes = await fetchPdfBytes(url);
    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `attachment; filename="${candidate.filename.replace(/["\\]/g, "-")}"`,
        "X-Paper-Source-Url": candidate.directPdfUrl,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (cause) {
    return NextResponse.json({ error: safeDownloadError(cause) }, { status: 502 });
  }
}
