"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { BookOpen, Download, Eye, EyeOff, Info, KeyRound, LogOut, Mail, Phone, RefreshCw, Search, ShieldCheck, Store, UserRound, Wifi, WifiOff, X } from "lucide-react";
import { AppLanguageProvider, LanguageToggle, ThemeToggle, useAppLanguage } from "@/components/app-language";
import { WelcomePopup, WhatsAppContact } from "@/components/bookshop-contact-widgets";
import { TrialAccessBoundary, TrialNotice } from "@/components/trial-access";
import {
  backupAccountMetadata, changeLocalShopName, changeLocalUsername, initializeLocalAccounts,
  isLegacyDataMigrated, listLocalAccounts, loginLocalAccount, markLegacyDataMigrated, saveAccountPassword,
  updateLocalAccount, validatePassword, type LocalAccount, type PublicAccount
} from "@/lib/local-auth";
import { activateTenant } from "@/lib/database";

const messages = {
  si: {
    welcome: "ඔබගේ පොත්හල වැඩබිමට සාදරයෙන් පිළිගනිමු", intro: "ඔබගේ නිර්මාණ සහ මුද්‍රණ කටයුතු එකම තැනකින් කළමනාකරණය කරන්න.",
    username: "පරිශීලක නාමය", password: "මුරපදය", remember: "පරිශීලක නාමය මතක තබාගන්න", login: "ඇතුළු වන්න",
    offline: "අන්තර්ජාලය නොමැතිව ක්‍රියා කරයි", online: "මාර්ගගතයි", loading: "ගිණුම් සකසමින්…", demo: "ඔබගේ පරිශීලක නාමය සහ මුරපදය කිසිවෙකු සමඟ බෙදා නොගන්න. බෙදාගැනීමක් හෝ අනිසි භාවිතයක් නිසා ගිණුම අක්‍රිය කළ හැක. නව යාවත්කාලීන ඉක්මනින් ලබාදෙමු.",
    initialPassword: "මුල් පිවිසුම සඳහා නව මුරපදයක් තෝරන්න", newPassword: "නව මුරපදය", confirmPassword: "නව මුරපදය තහවුරු කරන්න",
    updatePassword: "මුරපදය යාවත්කාලීන කරන්න", error: "පිවිසීමට නොහැකි විය", bookshop: "පොත්හල", manager: "ගිණුම් කළමනාකරණය",
    back: "වැඩබිමට ආපසු", logout: "ඉවත් වන්න", account: "ගිණුම",
    shopName: "පොත්හලේ නම",
    accounts: "දේශීය ගිණුම්", search: "නම හෝ පොත්හල සොයන්න", active: "සක්‍රිය", inactive: "අක්‍රිය", admin: "පරිපාලක",
    deactivate: "අක්‍රිය කරන්න", activate: "සක්‍රිය කරන්න", changeUser: "පරිශීලක නාමය වෙනස් කරන්න",
    created: "සාදන ලද දිනය", backup: "ගිණුම් තොරතුරු අපනයනය",
    security: "මෙම ගිණුම් මෙම බ්‍රවුසරයේ පමණක් පවතී. උපාංගය හෝ බ්‍රවුසර දත්ත වෙත සම්පූර්ණ ප්‍රවේශයක් ඇති අයෙකුගෙන් ඒවා ආරක්ෂා නොවේ. වෙනත් පරිගණක සමඟ ස්වයංක්‍රීයව සමමුහුර්ත නොවේ.",
    data: "පවතින වැඩබිම් දත්ත පළමු පරිපාලක ගිණුමට පිටපත් කරයි; මුල් දත්ත මකා නොදමයි. සෑම පොත්හලකටම වෙනම දේශීය දත්ත ගබඩාවක් ඇත.",
    codeProvisioning: "නව පාරිභෝගික ගිණුම් මෙහි සාදන්න බැහැ. ඒවා source code හි local-account-seeds.ts වෙත hash කළ මුරපද සමඟ එක් කර app එක නැවත build කරන්න.",
    accountsBackup: "අපනයන ගොනුවේ salted password hash පමණක් ඇත; සරල මුරපද නැත. JSON ගොනුව රහසිගතව තබන්න. version 1 සහ PBKDF2-SHA-256-310000 hash ආකෘතිය භාවිත වේ."
  },
  en: {
    welcome: "Welcome to your bookshop workspace", intro: "Manage your designs and print work from one calm, focused place.",
    username: "Username", password: "Password", remember: "Remember username", login: "Sign in",
    offline: "Working offline", online: "Online", loading: "Preparing local accounts…", demo: "Keep your username and password private. Sharing credentials or misuse may result in account deactivation. New updates are coming soon.",
    initialPassword: "Choose a new password to continue", newPassword: "New password", confirmPassword: "Confirm new password",
    updatePassword: "Update password", error: "Unable to sign in", bookshop: "Bookshop", manager: "Account management",
    back: "Back to workspace", logout: "Sign out", account: "Account",
    shopName: "Bookshop name",
    accounts: "Local accounts", search: "Search username or bookshop", active: "Active", inactive: "Inactive", admin: "Administrator",
    deactivate: "Deactivate", activate: "Activate", changeUser: "Change username",
    created: "Created", backup: "Export account backup",
    security: "These accounts exist only in this browser profile. They cannot protect against someone with full access to the device or browser data and do not synchronize to other computers.",
    data: "Existing workspace data is copied to the first administrator account; the original data is not deleted. Each bookshop gets a separate local database.",
    codeProvisioning: "New customer accounts cannot be created here. Add them with hashed passwords to local-account-seeds.ts in source code, then rebuild the app.",
    accountsBackup: "Exports include salted password hashes (never plaintext passwords). Treat the JSON file as sensitive."
  }
} as const;
function localizedAuthError(error: string, language: "si" | "en"): string {
  if (language === "en") return error;
  const translations: Record<string, string> = {
    "Username or password is incorrect.": "පරිශීලක නාමය හෝ මුරපදය නිවැරදි නැත.",
    "This account is inactive. Ask the administrator for help.": "මෙම ගිණුම අක්‍රියයි. පරිපාලකගෙන් සහාය ලබාගන්න.",
    "This account is temporarily locked. Try again later.": "මෙම ගිණුම තාවකාලිකව අගුළු දමා ඇත. පසුව නැවත උත්සාහ කරන්න.",
    "Too many attempts. This account is locked for five minutes.": "අසාර්ථක උත්සාහ වැඩියි. මෙම ගිණුම මිනිත්තු පහකට අගුළු දමා ඇත.",
    "The new passwords do not match.": "නව මුරපද දෙක ගැළපෙන්නේ නැත.",
    "Use a password between 10 and 128 characters.": "අක්ෂර 10ත් 128ත් අතර මුරපදයක් භාවිත කරන්න."
  };
  return translations[error] ?? error;
}
const subscribeToOnlineStatus = (callback: () => void) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};

export function LocalAccountGate({ children }: { children: ReactNode }) {
  return <AppLanguageProvider><GateContent>{children}</GateContent></AppLanguageProvider>;
}

function GateContent({ children }: { children: ReactNode }) {
  const { language, setScope } = useAppLanguage();
  const text = messages[language];
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [pendingChange, setPendingChange] = useState<LocalAccount | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const online = useSyncExternalStore(subscribeToOnlineStatus, () => navigator.onLine, () => false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);

  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem("little-paper-remembered-username");
      if (savedUsername) window.setTimeout(() => { setUsername(savedUsername); setRemember(true); }, 0);
    } catch (cause) {
      console.error("Could not read the remembered username.", cause);
    }
    void initializeLocalAccounts().then(() => setReady(true)).catch(cause => {
      setError(cause instanceof Error ? cause.message : "Could not initialize offline accounts.");
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!account || !sessionExpiry) return;
    const timeout = window.setTimeout(() => {
      setAccount(null);
      setShowManager(false);
      setShowWelcome(false);
      setError("Your local session expired. Sign in again.");
    }, Math.max(0, sessionExpiry - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [account, sessionExpiry]);

  useEffect(() => {
    if (!showAbout) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowAbout(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showAbout]);

  const finishLogin = async (loggedIn: LocalAccount) => {
    const migrateLegacy = loggedIn.role === "admin" && !(await isLegacyDataMigrated());
    await activateTenant(loggedIn.id, migrateLegacy);
    if (migrateLegacy) await markLegacyDataMigrated();
    setScope(loggedIn.id);
    setAccount(loggedIn);
    setPendingChange(null);
    setShowWelcome(true);
    setSessionExpiry(Date.now() + 8 * 60 * 60 * 1000);
    setPassword("");
    setError("");
  };

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const loggedIn = await loginLocalAccount(username, password);
      if (remember) localStorage.setItem("little-paper-remembered-username", loggedIn.username);
      else localStorage.removeItem("little-paper-remembered-username");
      if (loggedIn.mustChangePassword) setPendingChange(loggedIn);
      else await finishLogin(loggedIn);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const onChangeRequiredPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = String(form.get("new-password") ?? "");
    const confirm = String(form.get("confirm-password") ?? "");
    if (next !== confirm) { setError(localizedAuthError("The new passwords do not match.", language)); return; }
    setBusy(true);
    setError("");
    try {
      validatePassword(next);
      const updated = await saveAccountPassword(pendingChange!, next);
      await finishLogin(updated);
    } catch (cause) {
      setError(localizedAuthError(cause instanceof Error ? cause.message : "Could not update the password.", language));
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    setAccount(null);
    setPendingChange(null);
    setShowManager(false);
    setShowWelcome(false);
    setSessionExpiry(null);
    setPassword("");
    setError("");
    setScope("global");
  };

  if (!ready) return <div className="auth-loading"><div className="auth-brand-icon"><BookOpen size={24}/></div><p>{text.loading}</p></div>;
  if (pendingChange) return <PasswordChangeRequired
    account={pendingChange} language={language} text={text} error={error} busy={busy}
    onSubmit={onChangeRequiredPassword} onLanguageToggle={<LanguageToggle/>}
  />;
  if (!account) return <main className="auth-page" lang={language}>
    <div className="auth-orb auth-orb-one"/><div className="auth-orb auth-orb-two"/>
    <section className="auth-card">
      <div className="auth-card-brand"><div className="auth-brand-icon"><Image src="/bookshop-icon.svg" width={43} height={43} alt="" aria-hidden="true"/></div><div><strong>PaperBloom</strong><small>STATIONERY · CREATIVE STUDIO</small></div></div>
      <div className="auth-welcome"><span className="auth-eyebrow"><ShieldCheck size={14}/> LOCAL BOOKSHOP WORKSPACE</span><h1>{text.welcome}</h1><p>{text.intro}</p></div>
      <form className="auth-form" onSubmit={onLogin}>
        <label>{text.username}<span className="auth-input-wrap"><UserRound size={17}/><input autoComplete="username" autoFocus required value={username} onChange={event => setUsername(event.target.value)} placeholder={language === "si" ? "ඔබගේ පරිශීලක නාමය" : "Enter your username"}/></span></label>
        <label>{text.password}<span className="auth-input-wrap"><KeyRound size={17}/><input autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} type={showPassword ? "text" : "password"} placeholder="••••••••"/><button type="button" className="auth-eye" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
        <label className="auth-remember"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)}/>{text.remember}</label>
        {error && <div className="auth-error" role="alert">{text.error}: {localizedAuthError(error, language)}</div>}
        <button className="auth-submit" type="submit" disabled={busy || !username.trim() || !password} aria-label={busy ? (language === "si" ? "පිවිසෙමින්" : "Signing in") : text.login}>
          {busy ? <><RefreshCw className="auth-spin" size={17}/><span className="auth-submit-label">{language === "si" ? "පිවිසෙමින්…" : "Signing in…"}</span></> : <><span className="auth-submit-label">{text.login}</span><span className="auth-submit-arrow" aria-hidden="true">→</span></>}
        </button>
      </form>
      <div className="auth-foot">
        <span className={`auth-online-dot ${online ? "" : "offline"}`}>{online ? <Wifi size={13}/> : <WifiOff size={13}/>} {online ? text.online : text.offline}</span>
        <button className="auth-about-link" type="button" onClick={() => setShowAbout(true)}><Info size={14}/>{language === "si" ? "මා ගැන" : "About me"}</button>
        <ThemeToggle/>
        <LanguageToggle/>
      </div>
      <p className="auth-demo-note">{text.demo}</p>
    </section>
    <div className="auth-side-note"><div className="auth-side-mark"><Store size={22}/></div><span>{language === "si" ? "ඔබගේ නිර්මාණ. ඔබගේ පොත්හල. ඔබගේ උපාංගයේම." : "Your craft. Your bookshop. Right here on this device."}</span></div>
    {showAbout && <div className="auth-about-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowAbout(false); }}>
      <section className="auth-about-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-about-title">
        <button className="auth-about-close" type="button" onClick={() => setShowAbout(false)} aria-label={language === "si" ? "වසන්න" : "Close"}><X size={18}/></button>
        <Image className="auth-about-logo" src="/nexora-labs-logo.svg" width={112} height={112} alt="Nexora Labs" unoptimized/>
        <span className="auth-eyebrow">{language === "si" ? "සංවර්ධකයා" : "DEVELOPER"}</span>
        <h2 id="auth-about-title">{language === "si" ? "මා ගැන" : "About me"}</h2>
        <p className="auth-about-name">M.L.K Sandaruwan</p>
        <p className="auth-about-copyright">© 2026 M.L.K Sandaruwan</p>
        <div className="auth-about-contacts">
          <a href="tel:0767660922"><Phone size={16}/>0767660922</a>
          <a href="mailto:kavishkasandaruwan68@gmail.com"><Mail size={16}/>kavishkasandaruwan68@gmail.com</a>
        </div>
        <p className="auth-about-caption">{language === "si" ? "PaperBloom Stationery & Creative Studio හි නිර්මාණකරු සහ සංවර්ධක." : "Developed by M.L.K Sandaruwan for PaperBloom Stationery & Creative Studio."}</p>
      </section>
    </div>}
  </main>;

  return <TrialAccessBoundary enabled={Boolean(account.isTrial)}><div className="auth-app-shell">
    <div className="auth-session-bar no-print"><div className="auth-session-brand"><div className="auth-session-icon"><Image src="/bookshop-icon.svg" width={29} height={29} alt="" aria-hidden="true"/></div><span>PaperBloom</span></div><div className="auth-session-info"><span className="auth-session-shop">{account.bookshopName}</span><span className="auth-session-user">{account.username}</span>{account.role === "admin" && <button className="auth-manage-link" data-trial-allow onClick={() => setShowManager(true)}><ShieldCheck size={15}/>{text.manager}</button>}<button className="auth-logout" data-trial-allow onClick={logout}><LogOut size={15}/>{text.logout}</button></div></div>
    {account.isTrial && <TrialNotice/>}
    <div className="auth-app-content">{showManager && account.role === "admin" ? <AccountManager language={language} onClose={() => setShowManager(false)}/> : children}</div>
    <WelcomePopup open={showWelcome} userName={account.username} isTrial={Boolean(account.isTrial)} onClose={() => setShowWelcome(false)}/>
    <WhatsAppContact hidden={showWelcome}/>
    <footer className="workspace-footer no-print">
      <div className="workspace-footer-brand">
      <Image className="workspace-footer-logo" src="/bookshop-icon.svg" width={58} height={58} alt="PaperBloom" unoptimized/>
        <div className="workspace-footer-brand-copy">
        <strong>PaperBloom Stationery</strong>
        <span className="workspace-footer-studio">CREATIVE STUDIO</span>
        <span>{language === "si" ? "සංවර්ධනය කළේ" : "Developed by"}</span>
        <b className="workspace-footer-developer">M.L.K Sandaruwan</b>
          <small className="workspace-footer-copyright">© 2026 M.L.K Sandaruwan. All rights reserved.</small>
        </div>
      </div>
      <div className="workspace-footer-contact"><a href="tel:0767660922"><Phone size={14}/>0767660922</a><a href="mailto:kavishkasandaruwan68@gmail.com"><Mail size={14}/>kavishkasandaruwan68@gmail.com</a></div>
      <div className="workspace-footer-terms">
        <span>{language === "si" ? "ගිණුම් විස්තර ආරක්ෂිතව තබාගන්න. පරිශීලක නාමය හෝ මුරපදය බෙදා නොගන්න." : "Keep account details private. Do not share your username or password."}</span>
        <span>{language === "si" ? "බෙදාගැනීමක් හෝ අනිසි භාවිතයක් වාර්තා වුවහොත් ගිණුම අක්‍රිය කළ හැක." : "Accounts may be disabled if credential sharing or misuse is reported."}</span>
        <span>{language === "si" ? "නව යාවත්කාලීන ඉක්මනින් ලබාදෙමු." : "New updates are coming soon."}</span>
      </div>
    </footer>
  </div></TrialAccessBoundary>;
}

function PasswordChangeRequired({ account, text, error, busy, onSubmit, onLanguageToggle }: {
  account: LocalAccount; language: "si" | "en"; text: typeof messages.en | typeof messages.si; error: string; busy: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void; onLanguageToggle: ReactNode;
}) {
  return <main className="auth-page"><section className="auth-card auth-change-card">
    <div className="auth-card-brand"><div className="auth-brand-icon"><KeyRound size={23}/></div><div><strong>{text.initialPassword}</strong><small>{account.bookshopName}</small></div></div>
    <p className="auth-change-hint">{text.demo}</p>
    <form className="auth-form" onSubmit={onSubmit}>
      <label>{text.newPassword}<input className="auth-plain-input" name="new-password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required/></label>
      <label>{text.confirmPassword}<input className="auth-plain-input" name="confirm-password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required/></label>
      {error && <div className="auth-error" role="alert">{error}</div>}
      <button className="auth-submit" disabled={busy}><span className="auth-submit-label">{busy ? "…" : text.updatePassword}</span><span className="auth-submit-arrow" aria-hidden="true">→</span></button>
    </form>
    <div className="auth-foot">{onLanguageToggle}</div>
  </section></main>;
}

function AccountManager({ language, onClose }: { language: "si" | "en"; onClose: () => void }) {
  const text = messages[language];
  const [accounts, setAccounts] = useState<PublicAccount[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const filtered = useMemo(() => accounts.filter(item => `${item.username} ${item.bookshopName} ${item.ownerContact}`.toLowerCase().includes(search.toLowerCase())), [accounts, search]);
  const refresh = async () => setAccounts(await listLocalAccounts());

  useEffect(() => {
    void listLocalAccounts().then(setAccounts).catch(cause => setError(cause instanceof Error ? cause.message : "Could not load accounts."));
  }, []);

  const toggleActive = async (item: PublicAccount) => {
    if (item.role === "admin") return;
    const action = item.active ? "deactivate" : "activate";
    if (item.active && !window.confirm(`${text.deactivate} ${item.username}? They will be signed out on their next login.`)) return;
    try {
      await updateLocalAccount(item.id, value => ({ ...value, active: action === "activate" }));
      await refresh(); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update account status."); }
  };

  const rename = async (item: PublicAccount) => {
    if (item.role === "admin") return;
    const next = window.prompt(text.changeUser, item.username);
    if (!next || next === item.username) return;
    try {
      await changeLocalUsername(item.id, next);
      await refresh(); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not change username."); }
  };

  const renameShop = async (item: PublicAccount) => {
    if (item.role === "admin") return;
    const next = window.prompt(text.shopName, item.bookshopName);
    if (!next || next === item.bookshopName) return;
    try {
      await changeLocalShopName(item.id, next);
      await refresh(); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not change bookshop name."); }
  };

  const exportAccounts = async () => {
    try {
      const backup = await backupAccountMetadata();
      const url = URL.createObjectURL(new Blob([backup], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url; link.download = "little-paper-account-backup.json"; link.click();
      URL.revokeObjectURL(url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not export account metadata."); }
  };

  return <main className="account-manager-page">
    <header className="account-manager-header"><div><span className="auth-eyebrow"><ShieldCheck size={14}/> {text.admin}</span><h1>{text.manager}</h1><p>{text.data}</p></div><button className="auth-close" onClick={onClose}><X size={17}/>{text.back}</button></header>
    <div className="account-manager-notice">{text.security}</div>
    <div className="account-manager-notice">{text.codeProvisioning}</div>
    {error && <div className="auth-error account-message" role="alert">{error}</div>}
    <section className="account-panel account-list-panel">
      <div className="account-list-heading"><div><h2>{text.accounts}</h2><p>{accounts.length} {language === "si" ? "ගිණුම්" : "accounts"}</p></div><label className="account-search"><Search size={16}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder={text.search}/></label></div>
      <div className="account-table-wrap"><table className="account-table"><thead><tr><th>{text.account}</th><th>{text.shopName}</th><th>{text.created}</th><th>{text.active}</th><th>{language === "si" ? "ක්‍රියා" : "Actions"}</th></tr></thead><tbody>
        {filtered.map(item => <tr key={item.id}><td><strong>{item.username}</strong><small>{item.role === "admin" ? text.admin : item.ownerContact || text.bookshop}</small></td><td>{item.bookshopName}</td><td>{new Date(item.createdAt).toLocaleDateString(language === "si" ? "si-LK" : "en-GB")}</td><td><span className={`account-status ${item.active ? "is-active" : ""}`}>{item.active ? text.active : text.inactive}</span></td><td>{item.role === "shop" && <div className="account-row-actions"><button onClick={() => void rename(item)}>{text.changeUser}</button><button onClick={() => void renameShop(item)}>{text.shopName}</button><button className={item.active ? "danger-action" : ""} onClick={() => void toggleActive(item)}>{item.active ? text.deactivate : text.activate}</button></div>}</td></tr>)}
        {!filtered.length && <tr><td colSpan={5} className="account-empty">{language === "si" ? "ගිණුම් හමු නොවීය." : "No accounts match your search."}</td></tr>}
      </tbody></table></div>
    </section>
    <section className="account-backup-row"><div><h2>{text.backup}</h2><p>{text.accountsBackup}</p></div><div className="account-backup-actions"><button className="auth-close" onClick={() => void exportAccounts()}><Download size={15}/>{text.backup}</button></div></section>
  </main>;
}
