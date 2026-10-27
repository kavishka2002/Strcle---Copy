"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    littlePaperDesktop?: Readonly<{
      isDesktop: true;
      printCurrentPage?: (options?: { orientation?: "portrait" | "landscape" }) => Promise<{ status: "previewed" }>;
      printResource?: (url: string) => Promise<{ status: "previewed" }>;
      printPdfData?: (pdfData: Uint8Array) => Promise<{ status: "previewed" }>;
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
