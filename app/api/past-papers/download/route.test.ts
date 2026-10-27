import { afterEach, describe, expect, it, vi } from "vitest";

const query = { examination: "O/L", year: 2024, subject: "Mathematics", medium: "Sinhala" };
const requestBody = {
  query,
  paperKind: "Question Paper",
  candidateId: "doenets-99-Sinhala-question-paper-0"
};
const catalog = {
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
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("past paper download route", () => {
  it("returns only validated bytes from a catalog-listed PDF", async () => {
    const pdfBytes = new TextEncoder().encode("%PDF-1.7\nverified test fixture");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(catalog), { headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(pdfBytes, { headers: { "Content-Type": "application/pdf" } }));
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost/api/past-papers/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("X-Paper-Source-Url")).toBe("https://doenets.lk/images/resources/PAPA/2024-mathematics-si.pdf");
    expect(new TextDecoder().decode(await response.arrayBuffer())).toMatch(/^%PDF-/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects an HTML error page instead of returning it as a PDF", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(catalog), { headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response("<html>not found</html>", { headers: { "Content-Type": "text/html" } }));
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost/api/past-papers/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    }));

    expect(response.status).toBe(502);
    expect((await response.json()).error).toContain("not a PDF");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not follow a redirect outside the approved Department domain", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(catalog), { headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { Location: "http://127.0.0.1/private" } }));
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost/api/past-papers/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    }));

    expect(response.status).toBe(502);
    expect((await response.json()).error).toContain("outside the approved Department domain");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
