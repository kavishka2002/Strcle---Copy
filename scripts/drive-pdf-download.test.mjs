import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import drivePdfDownload from "../electron/drive-pdf-download.cjs";

const { downloadDrivePdf } = drivePdfDownload;
const pdfBytes = Buffer.from("%PDF-1.7\nminimal test PDF\n");
let temporaryDirectory;

beforeEach(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "paperbloom-drive-pdf-"));
});

afterEach(async () => {
  await rm(temporaryDirectory, { recursive: true, force: true });
});

describe("Google Drive PDF download", () => {
  it("downloads, verifies, caches, and reuses a valid PDF", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(pdfBytes, {
      status: 200,
      headers: { "content-length": String(pdfBytes.length), "content-type": "application/octet-stream" }
    }));
    const onProgress = vi.fn();
    const options = {
      fileId: "sample_file-id_123",
      fileName: "sample.pdf",
      cacheDirectory: path.join(temporaryDirectory, "persistent"),
      fetchImpl,
      onProgress
    };

    const downloaded = await downloadDrivePdf(options);

    expect(downloaded.source).toBe("download");
    expect(downloaded.size).toBe(pdfBytes.length);
    expect(downloaded.sha256).toBe(createHash("sha256").update(pdfBytes).digest("hex"));
    expect(path.basename(downloaded.filePath)).toBe("sample_file-id_123.pdf");
    expect(await readFile(downloaded.filePath)).toEqual(pdfBytes);
    expect(onProgress).toHaveBeenCalled();

    const offlineFetch = vi.fn().mockRejectedValue(new Error("offline"));
    const cached = await downloadDrivePdf({
      ...options,
      fileName: "renamed-sample.pdf",
      fetchImpl: offlineFetch
    });

    expect(cached.source).toBe("cache");
    expect(cached.filePath).toBe(downloaded.filePath);
    expect(cached.sha256).toBe(downloaded.sha256);
    expect(offlineFetch).not.toHaveBeenCalled();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("rejects non-PDF responses and removes partial downloads", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("not a PDF", { status: 200 }));
    const cacheDirectory = path.join(temporaryDirectory, "persistent");

    await expect(downloadDrivePdf({
      fileId: "sample_file-id_123",
      fileName: "sample.pdf",
      cacheDirectory,
      fetchImpl
    })).rejects.toThrow("valid PDF");

    const files = await readdir(cacheDirectory);
    expect(files).toEqual([]);
  });

  it("follows a Google Drive confirmation form before validating the PDF", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(
        '<form action="/uc" method="get"><input name="confirm" value="confirmation-token"><input name="id" value="sample_file-id_123"></form>',
        { headers: { "content-type": "text/html" } }
      ))
      .mockResolvedValueOnce(new Response(pdfBytes, {
        headers: { "content-type": "application/pdf", "content-length": String(pdfBytes.length) }
      }));

    const result = await downloadDrivePdf({
      fileId: "sample_file-id_123",
      fileName: "sample.pdf",
      cacheDirectory: path.join(temporaryDirectory, "persistent"),
      fetchImpl
    });

    expect(result.source).toBe("download");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const confirmationUrl = new URL(fetchImpl.mock.calls[1][0]);
    expect(confirmationUrl.searchParams.get("confirm")).toBe("confirmation-token");
    expect(confirmationUrl.searchParams.get("id")).toBe("sample_file-id_123");
    expect(await readFile(result.filePath)).toEqual(pdfBytes);
  });

  it("reports rate limits and removes an interrupted temporary download", async () => {
    const cacheDirectory = path.join(temporaryDirectory, "persistent");
    const rateLimited = vi.fn().mockResolvedValue(new Response("Rate limited", { status: 429 }));
    await expect(downloadDrivePdf({
      fileId: "rate-limited-id",
      fileName: "rate-limited.pdf",
      cacheDirectory,
      fetchImpl: rateLimited
    })).rejects.toThrow("HTTP 429");

    const interruptedStream = new ReadableStream({
      start(controller) {
        controller.enqueue(Buffer.from("%PDF-1.7"));
        controller.error(new Error("Connection interrupted."));
      }
    });
    await expect(downloadDrivePdf({
      fileId: "interrupted-id",
      fileName: "interrupted.pdf",
      cacheDirectory,
      fetchImpl: vi.fn().mockResolvedValue(new Response(interruptedStream, { status: 200 }))
    })).rejects.toThrow("Connection interrupted");

    expect(await readdir(cacheDirectory)).toEqual([]);
  });

  it("rejects unsafe IDs and filenames before making a request", async () => {
    const fetchImpl = vi.fn();
    const options = { fileName: "sample.pdf", cacheDirectory: temporaryDirectory, fetchImpl };

    await expect(downloadDrivePdf({ ...options, fileId: "../private" })).rejects.toThrow("file ID");
    await expect(downloadDrivePdf({ ...options, fileId: "valid-id", fileName: "../sample.pdf" })).rejects.toThrow("filename");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});