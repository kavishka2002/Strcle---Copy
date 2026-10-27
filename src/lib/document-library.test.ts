import { describe, expect, it } from "vitest";
import {
  documentCategories, documentTemplates, initialDocumentValues, renderDocumentContent,
  searchDocumentTemplate, validateDocument
} from "./document-library";

describe("Sinhala documents and forms library", () => {
  it("provides all nine requested categories and thirty complete templates", () => {
    expect(documentCategories).toHaveLength(9);
    expect(documentTemplates).toHaveLength(30);
    expect(new Set(documentTemplates.map(template => template.id)).size).toBe(30);
    expect(new Set(documentTemplates.map(template => template.categoryId))).toEqual(new Set(documentCategories.map(category => category.id)));
    for (const template of documentTemplates) {
      if (template.officialLinks) {
        expect(template.officialLinks.length).toBeGreaterThan(0);
        continue;
      }
      expect(template.fields?.length, template.titleEn).toBeGreaterThan(0);
      expect(template.content, template.titleEn).toContain("{{");
      const fields = new Set(template.fields?.map(field => field.id));
      for (const [, fieldId] of template.content!.matchAll(/\{\{([a-zA-Z0-9]+)\}\}/g)) {
        expect(fields.has(fieldId), `${template.titleEn} references missing field "${fieldId}"`).toBe(true);
      }
    }
  });

  it("generates a Sinhala Grama Niladhari letter and validates required information", () => {
    const template = documentTemplates.find(item => item.id === "grama-niladhari")!;
    const values = {
      ...initialDocumentValues(template, "2026-10-24"),
      sender: "කමල් පෙරේරා",
      address: "අංක 12, මල් පාර, මහනුවර",
      recipient: "ග්‍රාම නිලධාරීතුමා",
      subject: "පදිංචිය තහවුරු කිරීම",
      reason: "මම මෙම ලිපිනයේ පදිංචිව සිටිමි.",
      details: "ග්‍රාම නිලධාරී වසම 12",
      phone: "0771234567"
    };

    expect(validateDocument(template, values)).toEqual([]);
    const content = renderDocumentContent(template, values);
    expect(content).toContain("ග්‍රාම නිලධාරීතුමා");
    expect(content).toContain("මම මෙම ලිපිනයේ පදිංචිව සිටිමි.");
    expect(content).toContain("කමල් පෙරේරා");
    expect(content).toContain("2026-10-24");
    expect(content).not.toContain("【");
  });

  it("keeps template-specific fields, legal draft notices, and official form sources", () => {
    const schoolLeave = documentTemplates.find(item => item.id === "school-leave")!;
    expect(schoolLeave.fields?.some(field => field.id === "studentName")).toBe(true);
    expect(schoolLeave.fields?.some(field => field.id === "vehicle")).toBe(false);
    expect(documentTemplates.find(item => item.id === "affidavit-draft")?.legalNotice).toContain("කෙටුම්පතක්");
    expect(documentTemplates.find(item => item.id === "vehicle-sale-draft")?.legalNotice).toContain("නීතිඥ");

    const directory = documentTemplates.find(item => item.id === "official-forms-directory")!;
    expect(directory.officialLinks?.some(link => link.label.includes("Passport application"))).toBe(true);
    expect(directory.officialLinks?.every(link => link.url.startsWith("https://") && link.sourceUrl.startsWith("https://") && link.verifiedOn === "2026-10-24")).toBe(true);
  });

  it("searches Sinhala and English labels and rejects invalid required or monetary values", () => {
    const invoice = documentTemplates.find(item => item.id === "invoice")!;
    expect(searchDocumentTemplate(invoice, "ඉන්වොයිසිය")).toBe(true);
    expect(searchDocumentTemplate(invoice, "invoice")).toBe(true);
    expect(searchDocumentTemplate(invoice, "passport")).toBe(false);
    expect(validateDocument(invoice, {})).toContain("ව්‍යාපාරයේ නම සහ ලිපිනය");
    const completeValues = Object.fromEntries((invoice.fields ?? []).map(field => [field.id, field.required ? "test" : ""]));
    expect(validateDocument(invoice, { ...completeValues, total: "1,250.50" })).toEqual([]);
    expect(validateDocument(invoice, { ...completeValues, total: "රුපියල් දහස" })).toContain("මුළු මුදල (රු.) — කරුණාකර වලංගු මුදලක් ඇතුළත් කරන්න");
  });
});
