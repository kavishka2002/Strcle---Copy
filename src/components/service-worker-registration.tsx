"use client";

import { useEffect } from "react";

export interface DesktopUpdateStatus {
  state: "idle" | "checking" | "available" | "not-available" | "downloading" | "downloaded" | "error" | "disabled";
  currentVersion: string;
  enabled: boolean;
  revision: number;
  latestVersion?: string;
  releaseNotes?: string;
  percent?: number;
  transferred?: number;
  total?: number;
  error?: string;
  notify?: boolean;
}

export interface DesktopDrivePdfDownloadProgress {
  fileId: string;
  transferred: number;
  total?: number;
  percent?: number;
}

declare global {
  interface Window {
    littlePaperDesktop?: Readonly<{
      isDesktop: true;
      printCurrentPage?: (options?: { orientation?: "portrait" | "landscape"; paperSize?: "A4" | "A5" | "A6"; customWidthMm?: number; customHeightMm?: number }) => Promise<{ status: "previewed" }>;
      printWithDialog?: (options?: { orientation?: "portrait" | "landscape"; paperSize?: "A4" | "A5" | "A6"; customWidthMm?: number; customHeightMm?: number }) => Promise<{ status: "printed"; printerName: string } | { status: "cancelled" }>;
      printResource?: (url: string) => Promise<{ status: "previewed" }>;
      printPdfData?: (pdfData: Uint8Array) => Promise<{ status: "previewed" }>;
      getUpdateInfo?: () => Promise<DesktopUpdateStatus>;
      checkForUpdates?: () => Promise<{ status: "checking" }>;
      downloadUpdate?: () => Promise<{ status: "downloaded" }>;
      installUpdate?: () => Promise<{ status: "installing" }>;
      dismissUpdate?: (version: string) => Promise<{ status: "dismissed" }>;
      downloadDrivePdf?: (request: { fileId: string; fileName: string }) => Promise<{ status: "opened"; source: "cache" | "download"; size: number; sha256: string }>;
      onDrivePdfDownloadProgress?: (callback: (progress: DesktopDrivePdfDownloadProgress) => void) => () => void;
      onUpdateStatus?: (callback: (status: DesktopUpdateStatus) => void) => () => void;
    }>;
  }
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (window.littlePaperDesktop?.isDesktop || process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/service-worker.js").catch(error => {
      console.error("Could not register the offline application shell.", error);
    });
  }, []);

  return null;
}
