"use client";

import { AlertTriangle, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { translateUiText, useAppLanguage } from "@/components/app-language";

type DialogSpec = {
  id: number;
  mode: "confirm" | "prompt";
  title: string;
  message: string;
  initialValue?: string;
};

type DialogResult = boolean | string | null;

export function useAppDialog() {
  const [dialog, setDialog] = useState<DialogSpec | null>(null);
  const nextId = useRef(0);
  const resolver = useRef<((result: DialogResult) => void) | null>(null);

  const ask = useCallback((spec: Omit<DialogSpec, "id">) => new Promise<DialogResult>(resolve => {
    if (resolver.current) resolver.current(null);
    resolver.current = resolve;
    setDialog({ ...spec, id: ++nextId.current });
  }), []);

  const confirm = useCallback(async (title: string, message: string) => (await ask({ mode: "confirm", title, message })) === true, [ask]);
  const prompt = useCallback(async (title: string, message: string, initialValue: string) => {
    const result = await ask({ mode: "prompt", title, message, initialValue });
    return typeof result === "string" ? result : null;
  }, [ask]);

  const close = useCallback((result: DialogResult) => {
    const complete = resolver.current;
    resolver.current = null;
    setDialog(null);
    complete?.(result);
  }, []);

  const host = dialog ? <AppDialog key={dialog.id} dialog={dialog} onClose={close}/> : null;
  return { confirm, prompt, host };
}

function AppDialog({ dialog, onClose }: { dialog: DialogSpec; onClose: (result: DialogResult) => void }) {
  const [value, setValue] = useState(dialog.initialValue ?? "");
  const dialogRef = useRef<HTMLElement>(null);
  const { language } = useAppLanguage();
  const title = translateUiText(dialog.title, language);
  const message = translateUiText(dialog.message, language);
  const cancel = language === "si" ? "අවලංගු කරන්න" : "Cancel";
  const confirm = language === "si" ? (dialog.mode === "prompt" ? "සුරකින්න" : "තහවුරු කරන්න") : (dialog.mode === "prompt" ? "Save" : "Confirm");

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const firstTarget = dialogRef.current?.querySelector<HTMLElement>(dialog.mode === "prompt" ? "input" : "[data-dialog-cancel]");
    firstTarget?.focus();
    return () => previousFocus?.focus();
  }, [dialog.id, dialog.mode]);

  return <div className="app-dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(null); }}>
    <section ref={dialogRef} className="app-dialog" role="dialog" aria-modal="true" aria-labelledby="app-dialog-title" aria-describedby="app-dialog-message" onKeyDown={event => {
      if (event.key === "Escape") onClose(null);
      if (event.key === "Tab") {
        const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])"));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }}>
      <div className="app-dialog-icon"><AlertTriangle size={21}/></div>
      <button className="app-dialog-x" type="button" aria-label={language === "si" ? "වසන්න" : "Close"} onClick={() => onClose(null)}><X size={17}/></button>
      <h2 id="app-dialog-title">{title}</h2>
      <p id="app-dialog-message">{message}</p>
      {dialog.mode === "prompt" && <input aria-label={title} className="text-input mt-4" value={value} onChange={event => setValue(event.target.value)} onKeyDown={event => { if (event.key === "Enter") onClose(value); }}/>}
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="secondary-button" data-dialog-cancel onClick={() => onClose(null)}>{cancel}</button>
        <button type="button" className={dialog.mode === "confirm" ? "dialog-destructive" : "primary-button"} disabled={dialog.mode === "prompt" && !value.trim()} onClick={() => onClose(dialog.mode === "prompt" ? value : true)}>{confirm}</button>
      </div>
    </section>
  </div>;
}
