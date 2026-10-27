import { StickerStudio } from "@/components/sticker-studio";
import { LocalAccountGate } from "@/components/local-account-gate";

export default function Home() {
  return <LocalAccountGate><StickerStudio /></LocalAccountGate>;
}
