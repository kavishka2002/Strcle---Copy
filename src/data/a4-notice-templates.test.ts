import { describe, expect, it } from "vitest";
import {
  a4NoticeTemplates, getVisibleNoticeFields, noticeCategories, noticePaperDimensionsMm
} from "./a4-notice-templates";

describe("A4 notice template library", () => {
  it("includes each requested category with three visibly different ready-to-use designs", () => {
    expect(noticeCategories).toHaveLength(12);
    expect(a4NoticeTemplates).toHaveLength(36);
    expect(noticeCategories.map(category => category.id)).toEqual([
      "land-for-sale", "house-for-sale", "house-room-rent", "property-wanted", "shop-for-rent",
      "general-sale", "second-hand-sale", "jobs-available", "employees-wanted", "tuition-classes",
      "lost-found", "general-notice"
    ]);
    for (const category of noticeCategories) {
      const templates = a4NoticeTemplates.filter(template => template.categoryId === category.id);
      expect(templates).toHaveLength(3);
      expect(new Set(templates.map(template => template.style)).size).toBe(3);
      expect(templates.some(template => template.orientation === "portrait")).toBe(true);
      expect(templates.some(template => template.orientation === "landscape")).toBe(true);
      expect(new Set(templates.map(template => template.language))).toEqual(new Set(["si", "bi", "en"]));
      expect(templates.every(template => template.defaults.heading.trim().length > 0)).toBe(true);
    }
  });

  it("provides appropriate editable fields and optional contact and price details", () => {
    const land = noticeCategories.find(category => category.id === "land-for-sale");
    const house = noticeCategories.find(category => category.id === "house-for-sale");
    const rent = noticeCategories.find(category => category.id === "house-room-rent");
    const sale = noticeCategories.find(category => category.id === "general-sale");
    const notice = noticeCategories.find(category => category.id === "general-notice");

    expect(land?.fields.map(field => field.key)).toEqual(["location", "size", "price", "description", "contact", "contact2"]);
    expect(land?.fields.find(field => field.key === "price")?.optional).toBe(true);
    expect(house?.fields.some(field => field.key === "rooms")).toBe(true);
    expect(rent?.fields.some(field => field.key === "conditions")).toBe(true);
    expect(sale?.fields.some(field => field.key === "item")).toBe(true);
    expect(notice?.fields.some(field => field.key === "notice")).toBe(true);
    expect(land?.nameSi).toBe("ඉඩම් විකිණීමට ඇත");
  });

  it("uses standard A4 dimensions and keeps blank, hidden, and long Sinhala fields predictable", () => {
    expect(noticePaperDimensionsMm).toEqual({
      portrait: { width: 210, height: 297 },
      landscape: { width: 297, height: 210 }
    });

    const land = noticeCategories.find(category => category.id === "land-for-sale")!;
    const values = {
      heading: "ඉඩම් විකිණීමට ඇත",
      location: "කොළඹ නගරයට ආසන්නව පිහිටි ඉඩමක් සහ ප්‍රධාන මාර්ගයට පහසු ප්‍රවේශයක් සහිතව ඇත",
      size: "",
      price: "",
      description: "",
      contact: "077 123 4567",
      contact2: ""
    };
    const visible = getVisibleNoticeFields(land.fields, values, ["price", "contact2"]);

    expect(visible.map(field => field.key)).toEqual(["location", "contact"]);
    expect(values.location).toContain("ප්‍රධාන මාර්ගයට");
    expect(getVisibleNoticeFields(land.fields, { ...values, contact: "  " }, ["price", "contact2"]).map(field => field.key))
      .toEqual(["location"]);
  });
});
