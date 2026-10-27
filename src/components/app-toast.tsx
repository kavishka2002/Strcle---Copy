"use client";

import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { translateUiText, useAppLanguage } from "@/components/app-language";

export type ToastVariant = "success" | "error" | "warning" | "info";

const toastAppearance = {
  success: { Icon: CheckCircle2, title: "සාර්ථකයි!", color: "success" },
  error: { Icon: AlertCircle, title: "යම් ගැටලුවක් ඇති වුණා", color: "error" },
  warning: { Icon: TriangleAlert, title: "අවධානය යොමු කරන්න", color: "warning" },
  info: { Icon: Info, title: "දැනුම්දීමක්", color: "info" }
} as const;

export function AppToast({
  variant, message, onClose, duration = variant === "error" ? 0 : 5000
}: {
  variant: ToastVariant;
  message: string;
  onClose: () => void;
  duration?: number;
}) {
  const [visible, setVisible] = useState(true);
  const { language } = useAppLanguage();
  const appearance = toastAppearance[variant];
  const { Icon } = appearance;

  useEffect(() => {
    if (!duration) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;
  const translatedMessage = translateUiText(message, language);
  return <div className={`app-toast app-toast-${appearance.color}`} role={variant === "error" ? "alert" : "status"} aria-live={variant === "error" ? "assertive" : "polite"}>
    <Icon size={20} className="app-toast-icon" aria-hidden="true"/>
    <div className="min-w-0 flex-1">
      <b>{language === "si" ? appearance.title : variant === "success" ? "Success" : variant === "error" ? "Something went wrong" : variant === "warning" ? "Please note" : "Information"}</b>
      <p>{translatedMessage}</p>
    </div>
    <button type="button" className="app-toast-close" aria-label={language === "si" ? "දැනුම්දීම වසන්න" : "Close notification"} onClick={onClose}><X size={16}/></button>
  </div>;
}
