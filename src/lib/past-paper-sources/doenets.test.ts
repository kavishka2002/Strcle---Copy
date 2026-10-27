import { describe, expect, it, vi } from "vitest";
import { isAllowedDoENetPdfUrl, parsePaperSearchQuery, parsePaperKinds, searchDoENetPapers } from "./doenets";

describe("Department of Examinations adapter validation", () => {
  it("accepts only a fixed examination query shape", () => {
    expect(parsePaperSearchQuery({
      examination: "O/L",
      year: 2024,
      subject: "Mathematics",
      medium: "Sinhala"
    })).toEqual({
      examination: "O/L",
      year: 2024,
      subject: "Mathematics",
      medium: "Sinhala"
    });
    expect(parsePaperSearchQuery({
      examination: "O/L",
      year: 3024,
      subject: "Mathematics",
      medium: "Sinhala"
    })).toBeNull();
    expect(parsePaperSearchQuery({
      examination: "Grade 5 Scholarship",
      year: 2024,
      subject: "Mathematics",
      medium: "Sinhala"
    })).toBeNull();
  });

  it("validates paper types and confines published PDF URLs to the approved source path", () => {
    expect(parsePaperKinds(["Question Paper", "Marking Scheme"])).toEqual(["Question Paper", "Marking Scheme"]);
    expect(parsePaperKinds(["Other"])).toBeNull();
    expect(isAllowedDoENetPdfUrl("https://doenets.lk/images/resources/PAPA/paper.pdf")?.hostname).toBe("doenets.lk");
    expect(isAllowedDoENetPdfUrl("https://attacker.example/images/resources/PAPA/paper.pdf")).toBeNull();
    expect(isAllowedDoENetPdfUrl("https://doenets.lk/cms/api/resources")).toBeNull();
    expect(isAllowedDoENetPdfUrl("http://doenets.lk/images/resources/PAPA/paper.pdf")).toBeNull();
  });

  it("matches only published exact subject metadata and maps the selected medium link", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      resources: [{
        id: 99,
        resourceType: "PAPA",
        isEnabled: true,
        title: { en: "G.C.E. Ordinary Level Mathematics Examination - 2024" },
        description: { en: "" },
        tags: [
          { categoryCode: "YEAR", en: "2024" },
          { categoryCode: "EDITION", en: "Past Papers" }
        ],
        links: [{
          lable: { en: "", si: "", ta: "" },
          link: {
            en: "/images/resources/PAPA/2024-mathematics-en.pdf",
            si: "/images/resources/PAPA/2024-mathematics-si.pdf",
            ta: "/images/resources/PAPA/2024-mathematics-ta.pdf"
          }
        }]
      }]
    }), { headers: { "Content-Type": "application/json" } })));

    const query = { examination: "O/L" as const, year: 2024, subject: "Mathematics", medium: "Sinhala" as const };
    const found = await searchDoENetPapers(query, ["Question Paper"]);
    expect(found.candidates).toHaveLength(1);
    expect(found.candidates[0].directPdfUrl).toBe("https://doenets.lk/images/resources/PAPA/2024-mathematics-si.pdf");
    expect(found.status.state).toBe("found");

    const unknownSubject = await searchDoENetPapers({ ...query, subject: "Physics" }, ["Question Paper"]);
    expect(unknownSubject.candidates).toHaveLength(0);
    expect(unknownSubject.status.state).toBe("manual-required");
    vi.unstubAllGlobals();
  });
});
