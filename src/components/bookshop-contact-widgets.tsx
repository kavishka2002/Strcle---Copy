"use client";

import Image from "next/image";
import { BookOpen, Check, CircleHelp, Lightbulb, MessageCircle, Phone, Rocket, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { bookshopWelcomeInfo } from "@/data/bookshop-welcome";

const whatsappMessage = "Hi! I visited your bookshop web application and would like to know more about your services. Can you please help me?";
const whatsappUrl = `https://wa.me/94767660922?text=${encodeURIComponent(whatsappMessage)}`;

function WhatsAppBrandIcon() {
  return <svg className="whatsapp-brand-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <path d="M16 3.25A12.72 12.72 0 0 0 5.1 22.53L3.4 28.7l6.34-1.66A12.73 12.73 0 1 0 16 3.25Zm0 23.2c-2.03 0-4.02-.54-5.76-1.58l-.42-.25-3.76.99 1-3.66-.28-.43A10.36 10.36 0 1 1 16 26.45Z"/>
    <path d="M22.02 18.48c-.33-.17-1.94-.96-2.24-1.07-.3-.11-.52-.17-.74.17-.22.33-.85 1.07-1.04 1.3-.2.22-.39.25-.72.08-.33-.17-1.4-.52-2.67-1.65-.98-.88-1.65-1.97-1.84-2.3-.2-.33-.02-.51.15-.68.15-.15.33-.39.5-.58.16-.2.22-.33.33-.55.11-.22.06-.41-.03-.58-.08-.17-.74-1.79-1.02-2.45-.27-.64-.54-.55-.74-.56l-.64-.01c-.22 0-.58.08-.88.41-.3.33-1.15 1.13-1.15 2.75s1.18 3.19 1.35 3.41c.16.22 2.32 3.55 5.62 4.97.78.34 1.39.54 1.87.69.79.25 1.5.22 2.06.13.63-.09 1.94-.8 2.21-1.57.28-.77.28-1.43.2-1.57-.08-.14-.3-.22-.63-.39Z"/>
  </svg>;
}

function useDialogAccessibility(open: boolean, onClose: () => void, dialogRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const firstTarget = dialog?.querySelector<HTMLElement>("[data-modal-focus]")
      ?? dialog?.querySelector<HTMLElement>('button:not([disabled]),a[href]');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]'));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [dialogRef, onClose, open]);
}

export function WelcomePopup({ open, userName, isTrial = false, onClose }: { open: boolean; userName: string; isTrial?: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  useDialogAccessibility(open, onClose, dialogRef);
  if (!open) return null;

  return <div className="bookshop-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} className="bookshop-welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="bookshop-welcome-title" aria-describedby="bookshop-welcome-message">
      <div className="bookshop-welcome-scroll">
        <button className="bookshop-modal-close" type="button" data-trial-allow aria-label="පිළිගැනීමේ තොරතුරු වසන්න" onClick={onClose}><X size={18}/></button>
        <div className="bookshop-welcome-art" aria-hidden="true">
          <span className="bookshop-welcome-book"><Image src="/bookshop-icon.svg" width={54} height={54} alt=""/></span>
          <span className="bookshop-welcome-sparkle"><Sparkles size={18}/></span>
        </div>
        <p className="bookshop-dialog-eyebrow">PAPERBLOOM STATIONERY · CREATIVE STUDIO</p>
        {isTrial ? <>
          <h2 id="bookshop-welcome-title">නොමිලේ අත්හදා බැලීමේ අවස්ථාවක්! 🎉</h2>
          <p className="bookshop-welcome-user">ආයුබෝවන්, {userName}.</p>
          <div id="bookshop-welcome-message" className="trial-promotion">
            <section lang="si">
              <h3>සිංහල 🇱🇰</h3>
              <p>👀 නොමිලේ නම ස්ටිකර් සකස් කර පෙරදසුන් බලන්න. මුද්‍රණය සහ විභාග ප්‍රශ්න පත්‍ර සඳහා සම්පූර්ණ ප්‍රවේශය අවශ්‍යයි.</p>
              <p className="trial-promotion-highlight">✨ සම්පූර්ණ ප්‍රවේශය ලබාගැනීමට අදම ලියාපදිංචි වන්න!</p>
              <p>💰 සාමාන්‍ය මිල: රු. 3,499<br/><strong>🔥 විශේෂ හඳුන්වාදීමේ මිල: රු. 1,499 පමණයි!</strong></p>
              <p>📞 වැඩි විස්තර සඳහා අමතන්න හෝ WhatsApp කරන්න:</p>
              <a className="trial-promotion-number" href={bookshopWelcomeInfo.phoneHref}>076 766 0922</a>
              <p>ඔබේ සියලු නිර්මාණ කටයුතු එකම ස්ථානයකින් පහසුවෙන් කරගන්න!</p>
            </section>
            <section lang="en">
              <h3>English 🇬🇧</h3>
              <p>👀 Create and preview name stickers for free. Printing and exam papers require full access.</p>
              <p className="trial-promotion-highlight">✨ Get Full Access Today!</p>
              <p>💰 Regular Price: Rs. 3,499<br/><strong>🔥 Special Introductory Price: Only Rs. 1,499!</strong></p>
              <p>📞 Call or WhatsApp for more information:</p>
              <a className="trial-promotion-number" href={bookshopWelcomeInfo.phoneHref}>076 766 0922</a>
              <p>Enjoy a convenient, all-in-one solution for your creative and document needs!</p>
            </section>
            <a className="bookshop-whatsapp-action" href={bookshopWelcomeInfo.whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={17}/><span>WhatsApp · 076 766 0922</span>
            </a>
          </div>
        </> : <>
          <h2 id="bookshop-welcome-title">අපගේ Bookshop Application එකට සාදරයෙන් පිළිගනිමු! 🎉</h2>
          <p className="bookshop-welcome-user">ආයුබෝවන්, {userName}.</p>
          <p id="bookshop-welcome-message" className="bookshop-welcome-message">ඔබේ වැඩ පහසු කරන, කාලය ඉතිරි කරන නවීන ඩිජිටල් සහායකයෙක්.</p>

          <section className="bookshop-info-section">
          <h3><BookOpen size={17}/> නිර්මාණකරු පිළිබඳව</h3>
          <p>{bookshopWelcomeInfo.purpose}</p>
          <p className="bookshop-creator-name">{bookshopWelcomeInfo.creatorName}</p>
          </section>

          <section className="bookshop-info-section">
          <h3><Check size={17}/> දැනට තිබෙන පහසුකම්</h3>
          <ul>{bookshopWelcomeInfo.currentFeatures.map(feature => <li key={feature}>{feature}</li>)}</ul>
          </section>

          <section className="bookshop-info-section">
          <h3><Lightbulb size={17}/> භාවිතයෙන් ලැබෙන ප්‍රයෝජන</h3>
          <ul>{bookshopWelcomeInfo.benefits.map(benefit => <li key={benefit}>{benefit}</li>)}</ul>
          </section>

          <section className="bookshop-info-section bookshop-future-section">
          <h3><Rocket size={17}/> ඉදිරියේදී එකතු කිරීමට බලාපොරොත්තු වන පහසුකම්</h3>
          <ul>{bookshopWelcomeInfo.futureFeatures.map(feature => <li key={feature}>{feature}</li>)}</ul>
          </section>

          <section className="bookshop-info-section bookshop-contact-section">
          <h3><CircleHelp size={17}/> අප අමතන්න</h3>
          <p><Phone size={15}/> දුරකථන අංකය: <a href={bookshopWelcomeInfo.phoneHref}>{bookshopWelcomeInfo.phoneDisplay}</a></p>
          <p><MessageCircle size={15}/> WhatsApp අංකය: <span>{bookshopWelcomeInfo.phoneDisplay}</span></p>
          <a className="bookshop-whatsapp-action" href={bookshopWelcomeInfo.whatsappHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={17}/><span>WhatsApp හරහා පණිවිඩයක් යවන්න</span>
          </a>
          </section>
        </>}
      </div>
      <footer className="bookshop-welcome-footer">
        <p>{isTrial ? "Create and preview name stickers in the free trial; printing and Past Paper Finder require full access." : "ඔබගේ ඉගෙනුම් කටයුතු වඩාත් නිර්මාණශීලී සහ පහසු කරගනිමු!"}</p>
        <button className="bookshop-welcome-start" type="button" data-trial-allow data-modal-focus onClick={onClose}>
          <span>{isTrial ? "ස්ටිකර් සකස් කිරීම අරඹන්න · Start creating" : "හරි, Application එක භාවිතා කරමු!"}</span><Check size={17}/>
        </button>
      </footer>
    </section>
  </div>;
}

export function WhatsAppContact({ hidden = false }: { hidden?: boolean }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDialogAccessibility(open && !hidden, close, dialogRef);

  return <>
    {open && !hidden && <div className="whatsapp-contact-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <section ref={dialogRef} id="whatsapp-contact-dialog" className="whatsapp-contact-dialog" role="dialog" aria-modal="true" aria-labelledby="whatsapp-contact-title" aria-describedby="whatsapp-contact-message">
        <button className="whatsapp-contact-close" type="button" data-modal-focus aria-label="Close WhatsApp contact" onClick={close}><X size={17}/></button>
        <span className="whatsapp-contact-kicker"><MessageCircle size={14}/> BOOKSHOP SUPPORT</span>
        <h2 id="whatsapp-contact-title">Need Help? 💬</h2>
        <p id="whatsapp-contact-message">Hi there! 👋 Have a question about our bookshop services, stationery designs, or past papers? We&apos;re happy to help you!</p>
        <a className="whatsapp-contact-number" href={bookshopWelcomeInfo.phoneHref}><Phone size={15}/>{bookshopWelcomeInfo.phoneDisplay}</a>
        <a className="whatsapp-contact-action" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={17}/><span>Chat on WhatsApp</span>
        </a>
        <button className="whatsapp-contact-dismiss" type="button" onClick={close}>Close</button>
      </section>
    </div>}
    {!hidden && <button
      className="whatsapp-float-button"
      type="button"
      aria-label="Chat with us on WhatsApp"
      aria-expanded={open}
      aria-controls="whatsapp-contact-dialog"
      title="Chat with us on WhatsApp"
      onClick={() => setOpen(value => !value)}
    >
      <WhatsAppBrandIcon/>
      <span className="whatsapp-float-tooltip" role="tooltip">Chat with us on WhatsApp</span>
    </button>}
  </>;
}