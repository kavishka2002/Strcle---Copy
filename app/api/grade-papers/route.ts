import { NextResponse } from "next/server";
import manifest from "../../../src/data/grade-papers-manifest.json";
import { createDriveGradePaper } from "../../../src/lib/grade-papers";

export function GET() {
  return NextResponse.json({ papers: manifest.papers.map(createDriveGradePaper) });
}
