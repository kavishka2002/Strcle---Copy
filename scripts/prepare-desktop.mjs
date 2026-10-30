import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { shouldCopyPublicAsset } from "./public-asset-copy.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const desktopOutputDirectory = path.join(
  projectRoot,
  process.env.LITTLEPAPER_DESKTOP_DIST_DIR || ".next-desktop"
);
const desktopDistDirectoryName = path.basename(desktopOutputDirectory);
const standaloneDirectory = path.join(desktopOutputDirectory, "standalone");
const serverPath = path.join(standaloneDirectory, "server.js");
const publicDirectory = path.join(projectRoot, "public");
const staticDirectory = path.join(desktopOutputDirectory, "static");
const iconSourcePath = path.join(publicDirectory, "bookshop-icon.svg");
const iconOutputPath = path.join(desktopOutputDirectory, "littlepaper.ico");
const iconSizes = [16, 32, 48, 64, 128, 256];

try {
  await access(serverPath);
  await access(staticDirectory);
} catch (cause) {
  throw new Error("Run `npm run build` successfully before preparing the desktop app.", { cause });
}

await Promise.all([
  cp(publicDirectory, path.join(standaloneDirectory, "public"), {
    recursive: true,
    force: true,
    filter: assetPath => shouldCopyPublicAsset(publicDirectory, assetPath)
  }),
  mkdir(path.join(standaloneDirectory, desktopDistDirectoryName), { recursive: true })
]);
await cp(staticDirectory, path.join(standaloneDirectory, desktopDistDirectoryName, "static"), { recursive: true, force: true });

const iconSvg = await readFile(iconSourcePath);
const iconPngs = await Promise.all(iconSizes.map(size =>
  sharp(iconSvg).resize(size, size).png().toBuffer()
));
const directorySize = 6 + iconSizes.length * 16;
const iconSize = directorySize + iconPngs.reduce((total, png) => total + png.length, 0);
const icon = Buffer.alloc(iconSize);
icon.writeUInt16LE(0, 0);
icon.writeUInt16LE(1, 2);
icon.writeUInt16LE(iconSizes.length, 4);

let imageOffset = directorySize;
iconPngs.forEach((png, index) => {
  const entryOffset = 6 + index * 16;
  const size = iconSizes[index];
  icon.writeUInt8(size === 256 ? 0 : size, entryOffset);
  icon.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
  icon.writeUInt16LE(1, entryOffset + 4);
  icon.writeUInt16LE(32, entryOffset + 6);
  icon.writeUInt32LE(png.length, entryOffset + 8);
  icon.writeUInt32LE(imageOffset, entryOffset + 12);
  png.copy(icon, imageOffset);
  imageOffset += png.length;
});

await writeFile(iconOutputPath, icon);
console.log("Prepared the standalone Next.js server, public assets, and LittlePaper Windows icon.");
