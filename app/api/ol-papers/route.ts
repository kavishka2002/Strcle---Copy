import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import manifest from "../../../src/data/ol-papers-manifest.json";
import { createDriveOlPaper, createScholarshipPaper, type OlPaper } from "../../../src/lib/ol-papers";

export const dynamic = "force-dynamic";

const papersRoot = join(process.cwd(), "public", "papers");

async function getScholarshipPapers(): Promise<OlPaper[]> {
  let paperFolders;
  try {
    paperFolders = await readdir(papersRoot, { withFileTypes: true });
  } catch (cause) {
    if (cause && typeof cause === "object" && "code" in cause && cause.code === "ENOENT") return [];
    throw cause;
  }

  const scholarshipFolders = paperFolders.filter(entry =>
    entry.isDirectory() && /^(?:scolarship paper|scholarship paper|grade 5 scholarship)$/i.test(entry.name)
  );
  const papers = (await Promise.all(scholarshipFolders.map(async folder => {
    const files = await readdir(join(papersRoot, folder.name), { withFileTypes: true });
    return files
      .filter(file => file.isFile() && /\.pdf$/i.test(file.name))
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(file => createScholarshipPaper(folder.name, file.name))
      .filter((paper): paper is OlPaper => paper !== null);
  }))).flat();

  const uniquePapers = new Map<string, OlPaper>();
  for (const paper of papers) {
    const key = `${paper.year}|${paper.medium}`;
    if (!uniquePapers.has(key)) uniquePapers.set(key, paper);
  }
  return [...uniquePapers.values()];
}

export async function GET() {
  try {
    const olPapers = manifest.papers.map(createDriveOlPaper);
    const scholarshipPapers = await getScholarshipPapers();
    const catalogue = [...olPapers, ...scholarshipPapers];
    catalogue.sort((left, right) =>
      left.exam.localeCompare(right.exam)
      || right.year - left.year
      || left.subject.localeCompare(right.subject)
      || left.medium.localeCompare(right.medium)
      || left.fileName.localeCompare(right.fileName)
    );
    return NextResponse.json({ papers: catalogue });
  } catch (cause) {
    console.error("Could not build the past paper catalogue.", cause);
    return NextResponse.json({ error: "The past paper catalogue could not be loaded." }, { status: 500 });
  }
}
