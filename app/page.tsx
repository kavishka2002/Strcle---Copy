import { StickerStudio } from "@/components/sticker-studio";
import { DesktopUpdateManager } from "@/components/desktop-update-manager";
import { LocalAccountGate } from "@/components/local-account-gate";

export default function Home() {
  return <><DesktopUpdateManager showSettings={false}/><LocalAccountGate><StickerStudio /></LocalAccountGate></>;
}
