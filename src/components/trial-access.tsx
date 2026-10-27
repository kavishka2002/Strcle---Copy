"use client";

import { createContext, useContext, useEffect, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { LockKeyhole, MessageCircle, X } from "lucide-react";

const TrialAccessContext = createContext(false);
const paymentMessage = "Hi, I would like to get full access to PaperBloom. Please share payment details.";

export function useTrialAccess(): boolean {
  return useContext(TrialAccessContext);
}

export function TrialAccessBoundary({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.dataset.trialAccess = "locked";
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ["p", "s"].includes(event.key.toLowerCase())) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setPaymentOpen(true);
        return;
      }
      if (event.target instanceof Element) {
        const action = event.target.closest("input, select, textarea, [contenteditable]:not([contenteditable='false'])");
        if (action && !action.closest("[data-trial-allow]")) {
          event.preventDefault();
          event.stopImmediatePropagation();
          setPaymentOpen(true);
        }
      }
    };
    const blockEditing = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest("input, select, textarea, [contenteditable]:not([contenteditable='false'])");
      if (!target || target.closest("[data-trial-allow]")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setPaymentOpen(true);
    };
    const blockDrop = (event: Event) => {
      if (!(event.target instanceof Element) || event.target.closest("[data-trial-allow]")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.type === "drop") setPaymentOpen(true);
    };
    const blockTrialPointer = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const paidAction = event.target.closest("[data-paid-feature], a[download]");
      if (paidAction) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setPaymentOpen(true);
        return;
      }
      const action = event.target.closest("button, a[href], input, select, textarea, label:has(input), label[for], [role='button'], [contenteditable='true'], .sticker-canvas");
      if (!action || action.closest("[data-trial-allow]")) return;
      if (action instanceof HTMLAnchorElement && /^(tel:|mailto:|https:\/\/wa\.me\/)/i.test(action.href)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setPaymentOpen(true);
    };
    const handleContextMenu = (event: globalThis.MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("img, canvas, iframe")) event.preventDefault();
    };
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("beforeinput", blockEditing, true);
    document.addEventListener("change", blockEditing, true);
    document.addEventListener("pointerdown", blockTrialPointer, true);
    document.addEventListener("dragover", blockDrop, true);
    document.addEventListener("drop", blockDrop, true);
    document.addEventListener("paste", blockEditing, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    return () => {
      delete root.dataset.trialAccess;
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("beforeinput", blockEditing, true);
      document.removeEventListener("change", blockEditing, true);
      document.removeEventListener("pointerdown", blockTrialPointer, true);
      document.removeEventListener("dragover", blockDrop, true);
      document.removeEventListener("drop", blockDrop, true);
      document.removeEventListener("paste", blockEditing, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [enabled]);

  const blockTrialAction = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!enabled || !(event.target instanceof Element)) return;
    const paidAction = event.target.closest("[data-paid-feature], a[download]");
    if (paidAction) {
      event.preventDefault();
      event.stopPropagation();
      setPaymentOpen(true);
      return;
    }
    const action = event.target.closest("button, a[href], input, select, textarea, label:has(input), label[for], [role='button'], [contenteditable]:not([contenteditable='false'])");
    if (!action || action.closest("[data-trial-allow]")) return;
    if (action instanceof HTMLAnchorElement && /^(tel:|mailto:|https:\/\/wa\.me\/)/i.test(action.href)) return;
    event.preventDefault();
    event.stopPropagation();
    setPaymentOpen(true);
  };

  return <TrialAccessContext.Provider value={enabled}>
    <div className="trial-access-boundary" onClickCapture={blockTrialAction}>
      {children}
      {enabled && paymentOpen && <div className="trial-payment-backdrop" onMouseDown={event => {
        if (event.target === event.currentTarget) setPaymentOpen(false);
      }}>
        <section className="trial-payment-dialog" role="dialog" aria-modal="true" aria-labelledby="trial-payment-title">
          <button className="trial-payment-close" type="button" data-trial-allow aria-label="වසන්න" onClick={() => setPaymentOpen(false)}><X size={18}/></button>
          <div className="trial-payment-icon"><LockKeyhole size={23}/></div>
          <p className="trial-payment-eyebrow">PAPERBLOOM · FULL ACCESS</p>
          <h2 id="trial-payment-title">Full access ලබාගන්න · முழு அணுகலைப் பெறுங்கள்</h2>
          <p className="trial-payment-copy">Free trial එකෙන් නම ස්ටිකර් සකස් කර පෙරදසුන් බලන්න පුළුවන්; මුද්‍රණය සහ විභාග ප්‍රශ්න පත්‍ර සඳහා සම්පූර්ණ ප්‍රවේශය අවශ්‍යයි. இலவச சோதனையில் பெயர் ஸ்டிக்கர்களை உருவாக்கி முன்னோட்டம் பார்க்கலாம்; அச்சிடவும் தேர்வுத் தாள்களை அணுகவும் முழு அணுகல் தேவை. Create and preview name stickers in the free trial; printing and exam papers require full access.</p>
          <p className="trial-payment-price">රු. 1,499</p>
          <a className="trial-payment-whatsapp" href={`https://wa.me/94767660922?text=${encodeURIComponent(paymentMessage)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={17}/> WhatsApp හරහා විමසන්න · 0767660922
          </a>
          <p className="trial-payment-note">සියලු විශේෂාංග සඳහා රු. 1,499 ගෙවා WhatsApp කරන්න. முழு அணுகலுக்கு ரூ. 1,499 செலுத்தி WhatsApp செய்யுங்கள்.</p>
        </section>
      </div>}
    </div>
  </TrialAccessContext.Provider>;
}

export function TrialNotice() {
  return <aside className="trial-notice" aria-label="Trial account information">
    <div className="trial-notice-track">
      <span>Sinhala: නොමිලේ අත්හදා බැලීමේදී නම ස්ටිකර් සකස් කර පෙරදසුන් බලන්න පුළුවන්. මුද්‍රණය සහ විභාග ප්‍රශ්න පත්‍ර සඳහා රු. 1,499 ගෙවා 0767660922 අමතන්න.</span>
      <span lang="ta">தமிழ்: இலவச சோதனையில் பெயர் ஸ்டிக்கர்களை உருவாக்கி முன்னோட்டம் பார்க்கலாம். அச்சிடவும் தேர்வுத் தாள்களை அணுகவும் ரூ. 1,499 செலுத்தி 0767660922-ஐ தொடர்புகொள்ளுங்கள்.</span>
      <span>English: Create and preview name stickers in the free trial. Pay Rs. 1,499 for printing and exam paper access. Call or WhatsApp 0767660922.</span>
      <span aria-hidden="true">Sinhala: නොමිලේ අත්හදා බැලීමේදී නම ස්ටිකර් සකස් කර පෙරදසුන් බලන්න පුළුවන්. මුද්‍රණය සහ විභාග ප්‍රශ්න පත්‍ර සඳහා රු. 1,499 ගෙවා 0767660922 අමතන්න.</span>
      <span lang="ta" aria-hidden="true">தமிழ்: இலவச சோதனையில் பெயர் ஸ்டிக்கர்களை உருவாக்கி முன்னோட்டம் பார்க்கலாம். அச்சிடவும் தேர்வுத் தாள்களை அணுகவும் ரூ. 1,499 செலுத்தி 0767660922-ஐ தொடர்புகொள்ளுங்கள்.</span>
      <span aria-hidden="true">English: Create and preview name stickers in the free trial. Pay Rs. 1,499 for printing and exam paper access. Call or WhatsApp 0767660922.</span>
    </div>
  </aside>;
}
