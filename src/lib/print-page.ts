export type PrintPageResult =
  | { status: "browser" }
  | { status: "previewed" }
  | { status: "printed"; printerName: string };
export type PrintDialogResult =
  | { status: "browser" }
  | { status: "cancelled" }
  | { status: "printed"; printerName: string };

export interface PrintPageOptions {
  orientation?: "portrait" | "landscape";
  paperSize?: "A4" | "A5" | "A6";
  customWidthMm?: number;
  customHeightMm?: number;
}

async function waitForPageToRender(): Promise<void> {
  if (typeof document === "undefined") return;

  if ("fonts" in document && typeof document.fonts?.ready?.then === "function") {
    await document.fonts.ready;
  }

  await new Promise<void>(resolve => {
    const flushFrame = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    };

    if (document.readyState === "complete") {
      flushFrame();
      return;
    }

    const done = () => {
      document.removeEventListener("readystatechange", done);
      flushFrame();
    };

    document.addEventListener("readystatechange", done, { once: true });
    if (document.readyState !== "loading") {
      done();
    }
  });

  await new Promise<void>(resolve => setTimeout(resolve, 200));
}

export async function printCurrentPage(options?: PrintPageOptions): Promise<PrintPageResult> {
  if (window.littlePaperDesktop?.isDesktop) {
    if (typeof window.littlePaperDesktop.printCurrentPage !== "function") {
      throw new Error("This desktop app needs the latest print update. Reinstall LittlePaper to print.");
    }
    await waitForPageToRender();
    return window.littlePaperDesktop.printCurrentPage(options);
  }
  window.print();
  return { status: "browser" };
}

export async function printCurrentPageWithDialog(options?: PrintPageOptions): Promise<PrintDialogResult> {
  if (window.littlePaperDesktop?.isDesktop) {
    if (typeof window.littlePaperDesktop.printWithDialog !== "function") {
      throw new Error("This desktop app needs the latest print update. Reinstall LittlePaper to print.");
    }
    await waitForPageToRender();
    return window.littlePaperDesktop.printWithDialog(options);
  }
  await waitForPageToRender();
  window.print();
  return { status: "browser" };
}

export async function printResource(url: string): Promise<PrintPageResult> {
  if (window.littlePaperDesktop?.isDesktop) {
    if (typeof window.littlePaperDesktop.printResource !== "function") {
      throw new Error("This desktop app needs the latest print update. Reinstall LittlePaper to print.");
    }
    return window.littlePaperDesktop.printResource(new URL(url, window.location.href).href);
  }
  window.open(url, "_blank", "noopener,noreferrer");
  return { status: "browser" };
}

export async function printPdfBlob(blob: Blob): Promise<PrintPageResult> {
  if (!window.littlePaperDesktop?.isDesktop) {
    throw new Error("Opening a local PDF print preview is only supported in the desktop app.");
  }
  if (typeof window.littlePaperDesktop.printPdfData !== "function") {
    throw new Error("This desktop app needs the latest print update. Reinstall LittlePaper to print.");
  }
  return window.littlePaperDesktop.printPdfData(new Uint8Array(await blob.arrayBuffer()));
}
