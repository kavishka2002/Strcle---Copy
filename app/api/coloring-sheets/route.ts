import { readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { NextResponse } from "next/server";
import { createColoringSheet, createGradeColoringSheet } from "@/lib/coloring-sheets";

export const dynamic = "force-dynamic";

const assetRoot = join(process.cwd(), "public");
const pdfRoot = join(assetRoot, "පින්තුර", "පින්තුර");

async function collectMediaFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async entry => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return collectMediaFiles(fullPath);
    if (entry.isFile() && /\.(pdf|png|jpe?g|webp)$/i.test(entry.name)) return [fullPath];
    return [];
  }));
  return nestedFiles.flat();
}

export async function GET() {
  try {
    const gradeFolders = (await readdir(assetRoot, { withFileTypes: true }))
      .filter(entry => entry.isDirectory() && /^Grade \d+$/i.test(entry.name));
    const [legacyFiles, gradeFiles] = await Promise.all([
      collectMediaFiles(pdfRoot),
      Promise.all(gradeFolders.map(async folder =>
        (await collectMediaFiles(join(assetRoot, folder.name))).map(fullPath => ({ fullPath, gradeFolder: true as const }))
      ))
    ]);
    const files = [
      ...legacyFiles.map(fullPath => ({ fullPath, gradeFolder: false as const })),
      ...gradeFiles.flat()
    ];
    const sheets = await Promise.all(files.map(async ({ fullPath, gradeFolder }) => {
      const filePath = relative(assetRoot, fullPath).split(sep).join("/");
      const fileStat = await stat(fullPath);
      const url = `/${filePath.split("/").map(encodeURIComponent).join("/")}`;
      return gradeFolder
        ? createGradeColoringSheet(filePath, url, fileStat.size)
        : createColoringSheet(filePath, url, fileStat.size);
    }));
    sheets.sort((a, b) => (a.grade ?? Number.MAX_SAFE_INTEGER) - (b.grade ?? Number.MAX_SAFE_INTEGER)
      || (a.titleOrder ?? Number.MAX_SAFE_INTEGER) - (b.titleOrder ?? Number.MAX_SAFE_INTEGER)
      || a.sinhalaName.localeCompare(b.sinhalaName, "si"));
    return NextResponse.json({ sheets });
  } catch (cause) {
    console.error("Could not build the colouring sheet catalogue.", cause);
    return NextResponse.json({ error: "The local colouring sheet folder could not be read." }, { status: 500 });
  }
}
