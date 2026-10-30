const { createHash, randomUUID } = require("node:crypto");
const { createReadStream, createWriteStream } = require("node:fs");
const { mkdir, open, rename, stat, unlink } = require("node:fs/promises");
const path = require("node:path");
const { Readable, Transform } = require("node:stream");
const { pipeline } = require("node:stream/promises");

const DRIVE_FILE_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const activeDownloads = new Map();

async function inspectPdfFile(filePath) {
  let fileHandle;
  try {
    fileHandle = await open(filePath, "r");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }

  let signature;
  try {
    signature = Buffer.alloc(5);
    const { bytesRead } = await fileHandle.read(signature, 0, signature.length, 0);
    if (bytesRead !== signature.length || signature.toString("ascii") !== "%PDF-") return null;
  } finally {
    await fileHandle.close();
  }

  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return { size: (await stat(filePath)).size, sha256: hash.digest("hex") };
}

function decodeHtmlAttribute(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'");
}

function driveConfirmationUrl(html, responseUrl, fileId, fallbackUrl) {
  const formMatch = html.match(/<form\b([^>]*)>([\s\S]*?)<\/form>/i);
  const actionMatch = formMatch?.[1].match(/\baction\s*=\s*["']([^"']+)["']/i);
  let candidate;

  if (formMatch && actionMatch) {
    candidate = new URL(decodeHtmlAttribute(actionMatch[1]), responseUrl);
    for (const input of formMatch[2].matchAll(/<input\b([^>]*)>/gi)) {
      const name = input[1].match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1];
      const value = input[1].match(/\bvalue\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
      if (name) candidate.searchParams.set(name, decodeHtmlAttribute(value));
    }
  } else {
    for (const href of html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) {
      const url = new URL(decodeHtmlAttribute(href[1]), responseUrl);
      if (url.hostname === "drive.google.com" && url.pathname === "/uc" && url.searchParams.has("confirm")) {
        candidate = url;
        break;
      }
    }
  }

  if (!candidate || candidate.hostname !== "drive.google.com" || candidate.pathname !== "/uc") {
    candidate = new URL(fallbackUrl);
    candidate.searchParams.set("confirm", "t");
  }

  candidate.searchParams.set("id", fileId);
  candidate.searchParams.set("export", "download");
  return candidate;
}

async function getDrivePdfResponse(fileId, fetchImpl) {
  const downloadUrl = new URL("https://drive.google.com/uc");
  downloadUrl.searchParams.set("export", "download");
  downloadUrl.searchParams.set("id", fileId);
  const signal = AbortSignal.timeout(120_000);
  let response = await fetchImpl(downloadUrl, { redirect: "follow", signal });
  if (!response.ok) {
    throw new Error(`Google Drive download failed with HTTP ${response.status}.`);
  }

  if (response.headers.get("content-type")?.toLowerCase().includes("text/html")) {
    const html = await response.text();
    const responseUrl = response.url || downloadUrl.href;
    const confirmationUrl = driveConfirmationUrl(html, responseUrl, fileId, downloadUrl.href);
    const responseHeaders = {};
    const cookies = typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];
    if (cookies.length) responseHeaders.cookie = cookies.map(cookie => cookie.split(";", 1)[0]).join("; ");
    response = await fetchImpl(confirmationUrl, {
      redirect: "follow",
      signal,
      headers: responseHeaders
    });
    if (!response.ok) {
      throw new Error(`Google Drive confirmation download failed with HTTP ${response.status}.`);
    }
    if (response.headers.get("content-type")?.toLowerCase().includes("text/html")) {
      throw new Error("Google Drive returned a confirmation or error page instead of the PDF.");
    }
  }

  if (!response.body) throw new Error("Google Drive returned an empty download response.");
  return response;
}

async function downloadDrivePdfToCache({ fileId, fileName, cacheDirectory, onProgress, fetchImpl }) {
  const fileDirectory = cacheDirectory;
  const cachePath = path.join(fileDirectory, `${fileId}.pdf`);
  await mkdir(fileDirectory, { recursive: true });

  const cachedPdf = await inspectPdfFile(cachePath);
  if (cachedPdf) return { ...cachedPdf, filePath: cachePath, source: "cache" };

  const temporaryPath = path.join(fileDirectory, `.${fileId}.${randomUUID()}.part`);
  try {
    const response = await getDrivePdfResponse(fileId, fetchImpl);
    const contentLength = Number(response.headers.get("content-length"));
    const total = Number.isFinite(contentLength) && contentLength > 0 ? contentLength : undefined;
    let transferred = 0;
    const progressStream = new Transform({
      transform(chunk, encoding, callback) {
        transferred += chunk.length;
        onProgress?.({ fileId, transferred, total, percent: total ? Math.min(100, transferred / total * 100) : undefined });
        callback(null, chunk);
      }
    });

    await pipeline(
      Readable.fromWeb(response.body),
      progressStream,
      createWriteStream(temporaryPath, { flags: "wx" })
    );

    const downloadedPdf = await inspectPdfFile(temporaryPath);
    if (!downloadedPdf) throw new Error("Google Drive did not return a valid PDF file.");

    try {
      await unlink(cachePath);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    await rename(temporaryPath, cachePath);
    return { ...downloadedPdf, filePath: cachePath, source: "download" };
  } catch (error) {
    await unlink(temporaryPath).catch(cleanupError => {
      if (cleanupError?.code !== "ENOENT") throw cleanupError;
    });
    throw error;
  }
}

async function downloadDrivePdf({ fileId, fileName, cacheDirectory, onProgress, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fileId !== "string" || !DRIVE_FILE_ID_PATTERN.test(fileId)) {
    throw new TypeError("A valid Google Drive file ID is required.");
  }
  if (typeof fileName !== "string" || !fileName.trim() || path.basename(fileName) !== fileName || /[\\/\u0000-\u001f]/.test(fileName) || !/\.pdf$/i.test(fileName)) {
    throw new TypeError("A safe PDF filename is required.");
  }
  if (typeof cacheDirectory !== "string" || !path.isAbsolute(cacheDirectory)) {
    throw new TypeError("An absolute persistent cache directory is required.");
  }
  if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required.");

  const downloadKey = `${path.resolve(cacheDirectory)}\0${fileId}`;
  const currentDownload = activeDownloads.get(downloadKey);
  if (currentDownload) return currentDownload;

  const download = downloadDrivePdfToCache({ fileId, fileName, cacheDirectory, onProgress, fetchImpl });
  activeDownloads.set(downloadKey, download);
  try {
    return await download;
  } finally {
    if (activeDownloads.get(downloadKey) === download) activeDownloads.delete(downloadKey);
  }
}

module.exports = { downloadDrivePdf, inspectPdfFile };
