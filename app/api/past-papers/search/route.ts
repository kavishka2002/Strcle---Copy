import { NextResponse } from "next/server";
import { parsePaperKinds, parsePaperSearchQuery, searchDoENetPapers } from "../../../../src/lib/past-paper-sources/doenets";
import type { PaperSourceStatus } from "../../../../src/lib/past-papers";

export const dynamic = "force-dynamic";

const eThaksalawaStatus: PaperSourceStatus = {
  sourceName: "e-Thaksalawa",
  state: "manual-required",
  message: "Automatic search is not available: the public legacy course-search URL currently serves an informational page, not searchable paper records.",
  sourceUrl: "https://e-thaksalawa.moe.gov.lk/"
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Search request must contain valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Search request is invalid." }, { status: 400 });
  }
  const payload = body as Record<string, unknown>;
  const query = parsePaperSearchQuery(payload.query);
  const kinds = parsePaperKinds(payload.kinds);
  if (!query || !kinds) return NextResponse.json({ error: "Select a supported exam, year, subject, medium, and paper type." }, { status: 400 });

  try {
    const department = await searchDoENetPapers(query, kinds);
    return NextResponse.json({
      candidates: department.candidates.slice(0, 8),
      truncated: department.candidates.length > 8,
      sources: [department.status, eThaksalawaStatus]
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "The official Department paper catalog could not be searched.";
    return NextResponse.json({
      candidates: [],
      truncated: false,
      sources: [
        {
          sourceName: "Department of Examinations, Sri Lanka",
          state: "unavailable",
          message,
          sourceUrl: "https://doenets.lk/"
        },
        eThaksalawaStatus
      ]
    });
  }
}
