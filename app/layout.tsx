import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/noto-sans-sinhala/400.css";
import "@fontsource/noto-sans-sinhala/500.css";
import "@fontsource/noto-sans-sinhala/600.css";
import "@fontsource/noto-sans-sinhala/700.css";
import "@fontsource/poppins/latin.css";
import "@fontsource/nunito/latin.css";
import "@fontsource/lato/latin.css";
import "@fontsource/montserrat/latin.css";
import "@fontsource/quicksand/latin.css";
import "@fontsource/playfair-display/latin.css";
import "@fontsource/fredoka/latin.css";
import "@fontsource/baloo-2/latin.css";
import "@fontsource/roboto/latin.css";
import "@fontsource/lora/latin.css";
import "@fontsource/dm-sans/latin.css";
import "@fontsource/noto-serif-sinhala/latin.css";
import "@fontsource/noto-serif-sinhala/sinhala.css";
import "@fontsource/abhaya-libre/latin.css";
import "@fontsource/abhaya-libre/sinhala.css";
import "@fontsource/gemunu-libre/400.css";
import "@fontsource/gemunu-libre/500.css";
import "@fontsource/gemunu-libre/600.css";
import "@fontsource/gemunu-libre/700.css";
import "@fontsource/yaldevi/400.css";
import "@fontsource/yaldevi/500.css";
import "@fontsource/yaldevi/600.css";
import "@fontsource/yaldevi/700.css";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export const metadata: Metadata = {
  title: "PaperBloom | Stationery & Creative Studio",
  description: "PaperBloom stationery, printable designs, and creative templates.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/bookshop-icon.svg", apple: "/bookshop-icon.svg" }
};
export const viewport: Viewport = { themeColor: "#214d3d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><ServiceWorkerRegistration/>{children}</body>
    </html>
  );
}
