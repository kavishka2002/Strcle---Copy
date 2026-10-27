"use client";

import { AlertCircle, CheckCircle2, Download, LoaderCircle, RefreshCw, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { DesktopUpdateStatus } from "@/components/service-worker-registration";

export function DesktopUpdateManager({ showSettings, showPrompt = true }: { showSettings: boolean; showPrompt?: boolean }) {
  const [status, setStatus] = useState<DesktopUpdateStatus | null>(null);
  const [promptVersion, setPromptVersion] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [installing, setInstalling] = useState(false);
  const promptedVersion = useRef<string | null>(null);
  const bridge = typeof window === "undefined" ? undefined : window.littlePaperDesktop;

  useEffect(() => {
    const desktop = window.littlePaperDesktop;
    if (!desktop?.getUpdateInfo || !desktop.onUpdateStatus) return;
    let active = true;

    const applyStatus = (nextStatus: DesktopUpdateStatus) => {
      if (!active) return;
      setStatus(current => nextStatus.revision >= (current?.revision ?? -1) ? nextStatus : current);
      if (nextStatus.state === "available" && nextStatus.notify && nextStatus.latestVersion) {
        promptedVersion.current = nextStatus.latestVersion;
        setPromptVersion(nextStatus.latestVersion);
      } else if (
        promptedVersion.current &&
        nextStatus.latestVersion === promptedVersion.current &&
        ["downloading", "downloaded", "error"].includes(nextStatus.state)
      ) {
        setPromptVersion(nextStatus.latestVersion);
      }
    };

    const unsubscribe = desktop.onUpdateStatus(applyStatus);
    void desktop.getUpdateInfo().then(applyStatus).catch(error => {
      console.error("Could not read the desktop update status.", error);
      if (active) setActionError(error instanceof Error ? error.message : String(error));
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (!bridge?.isDesktop) return null;

  const runAction = async (action: (() => Promise<unknown>) | undefined, failureMessage: string) => {
    if (!action) {
      setActionError(failureMessage);
      return;
    }
    setActionError("");
    try {
      await action();
    } catch (error) {
      console.error(failureMessage, error);
      setActionError(error instanceof Error ? error.message : failureMessage);
    }
  };

  const checkForUpdates = () => runAction(bridge.checkForUpdates, "Could not check for updates.");
  const downloadUpdate = () => runAction(bridge.downloadUpdate, "Could not download the update.");
  const installUpdate = async () => {
    setInstalling(true);
    await runAction(bridge.installUpdate, "Could not install the update.");
    setInstalling(false);
  };
  const dismissUpdate = async () => {
    if (!promptVersion) return;
    const version = promptVersion;
    promptedVersion.current = null;
    setPromptVersion(null);
    await runAction(() => bridge.dismissUpdate?.(version) ?? Promise.reject(new Error("Could not save your update preference.")), "Could not save your update preference.");
  };

  const isPromptOpen = showPrompt && Boolean(promptVersion && status?.latestVersion === promptVersion);
  const currentVersion = status?.currentVersion ?? "…";
  const updateEnabled = status?.enabled ?? false;
  const isBusy = status?.state === "checking" || status?.state === "downloading";
  const updateAvailable = status?.state === "available" || (status?.state === "error" && Boolean(status.latestVersion));

  return <>
    {showSettings && <section className="soft-card desktop-update-card p-5" aria-labelledby="desktop-update-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><RefreshCw size={17} className="text-[#397b68]"/><h3 id="desktop-update-title" className="font-bold">Software updates</h3></div>
          <p className="mt-1 text-xs text-slate-500">Installed version: <b>{currentVersion}</b></p>
        </div>
        {updateEnabled && status?.state !== "downloaded" && updateAvailable
          ? <button className="primary-button !py-2" onClick={() => void downloadUpdate()} disabled={isBusy}><Download size={14}/> Download &amp; Install Update</button>
          : status?.state === "downloaded"
            ? <button className="primary-button !py-2" onClick={() => void installUpdate()} disabled={installing}><RefreshCw size={14}/> Install and Restart</button>
            : updateEnabled
              ? <button className="secondary-button !py-2" onClick={() => void checkForUpdates()} disabled={isBusy}><RefreshCw size={14} className={isBusy ? "animate-spin" : ""}/> Check for Updates</button>
              : null}
      </div>
      {!updateEnabled
        ? <p className="mt-3 text-xs leading-5 text-slate-500">Automatic update checks are available in the installed Windows desktop app. Development builds do not contact the release service.</p>
        : status?.state === "checking"
          ? <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><LoaderCircle size={14} className="animate-spin"/> Checking GitHub Releases…</p>
          : status?.state === "not-available"
            ? <p className="mt-3 flex items-center gap-2 text-xs text-emerald-700"><CheckCircle2 size={14}/> PaperBloom is up to date.</p>
            : status?.state === "available" || status?.state === "error" && status.latestVersion
              ? <div className="mt-3 text-xs text-slate-600"><p>Version <b>{status.latestVersion}</b> is available.</p>{status.releaseNotes && <p className="mt-2 whitespace-pre-line leading-5">{status.releaseNotes}</p>}{status.state === "error" && status.error && <p className="mt-2 text-rose-700" role="alert">{status.error}</p>}</div>
              : status?.state === "downloading"
                ? <div className="mt-3"><p className="text-xs text-slate-600">Downloading update… {Math.round(status.percent ?? 0)}%</p><progress className="desktop-update-progress mt-2" max="100" value={status.percent ?? 0}/></div>
                : status?.state === "downloaded"
                  ? <p className="mt-3 text-xs text-emerald-700">The update is ready. Choose Install and Restart when you are ready.</p>
                  : status?.state === "error"
                    ? <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-rose-700"><AlertCircle size={14} className="mt-0.5 shrink-0"/>{status.error || "Could not check for updates. Check your internet connection and try again."}</p>
                    : <p className="mt-3 text-xs text-slate-500">Check for the latest improvements and fixes.</p>}
      {actionError && <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-rose-700" role="alert"><AlertCircle size={14} className="mt-0.5 shrink-0"/>{actionError}</p>}
    </section>}

    {isPromptOpen && status && <div className="desktop-update-backdrop no-print">
      <section className="desktop-update-dialog" role="dialog" aria-modal="true" aria-labelledby="desktop-update-heading">
        <button className="desktop-update-close" aria-label="Close update notification" onClick={() => void dismissUpdate()}><X size={17}/></button>
        <div className="desktop-update-icon"><Sparkles size={22}/></div>
        <p className="desktop-update-eyebrow">PAPERBLOOM UPDATE</p>
        <h2 id="desktop-update-heading">New Update Available</h2>
        <p className="desktop-update-description">An update for PaperBloom is available! Install the latest version to enjoy new features, improvements, and bug fixes.</p>
        <div className="desktop-update-versions">
          <span>Current version <b>{status.currentVersion}</b></span>
          <span>Latest version <b>{status.latestVersion}</b></span>
        </div>
        {status.releaseNotes && <div className="desktop-update-notes"><b>What’s new</b><p>{status.releaseNotes}</p></div>}
        {actionError && <p className="desktop-update-error" role="alert">{actionError}</p>}
        {status.state === "downloading"
          ? <div className="desktop-update-download"><span>Downloading update… {Math.round(status.percent ?? 0)}%</span><progress className="desktop-update-progress" max="100" value={status.percent ?? 0}/></div>
          : status.state === "downloaded"
            ? <p className="desktop-update-ready">The update has downloaded and is ready to install.</p>
            : status.state === "error" && <p className="desktop-update-error" role="alert">{status.error || "The update could not be completed. Check your connection and try again."}</p>}
        <div className="desktop-update-actions">
          {status.state === "downloaded"
            ? <button className="primary-button" onClick={() => void installUpdate()} disabled={installing}><RefreshCw size={15}/>{installing ? "Installing…" : "Install and Restart"}</button>
            : status.state === "downloading"
              ? <button className="primary-button" disabled><LoaderCircle size={15} className="animate-spin"/>Downloading…</button>
              : status.state === "error" && status.latestVersion
                ? <button className="primary-button" onClick={() => void downloadUpdate()}><Download size={15}/>Retry Download</button>
                : status.state === "error"
                  ? <button className="primary-button" onClick={() => void checkForUpdates()}><RefreshCw size={15}/>Check Again</button>
                  : <button className="primary-button" onClick={() => void downloadUpdate()}><Download size={15}/>Download &amp; Install Update</button>}
          <button className="secondary-button" onClick={() => void dismissUpdate()}>Later</button>
        </div>
      </section>
    </div>}
  </>;
}
