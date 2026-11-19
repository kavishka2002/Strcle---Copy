import { describe, expect, it } from "vitest";
import { calculateCvPrintScale, emptyCvDraft, getRecentSavedCvs, validateCvPersonalDetails } from "./cv";

describe("CV optional personal and declaration details", () => {
  it("provides a default declaration and visible optional personal fields", () => {
    const draft = emptyCvDraft();
    expect(draft.declarationEnabled).toBe(false);
    expect(draft.declarationText).toBe("I hereby declare that the information provided above is true and correct to the best of my knowledge.");
    expect(draft.visiblePersonalFields.alternativePhone).toBe(true);
    expect(draft.visiblePersonalFields.dateOfBirth).toBe(true);
  });

  it("returns the ten most recently created saved CVs without changing the saved list", () => {
    const savedCvs = Array.from({ length: 12 }, (_, index) => ({
      id: `cv-${index}`,
      type: "cv" as const,
      name: `CV ${index}`,
      createdAt: index,
      updatedAt: 100 - index,
      templateId: "minimal-professional",
      draft: emptyCvDraft()
    }));

    expect(getRecentSavedCvs(savedCvs).map(cv => cv.id)).toEqual([
      "cv-11", "cv-10", "cv-9", "cv-8", "cv-7", "cv-6", "cv-5", "cv-4", "cv-3", "cv-2"
    ]);
    expect(savedCvs[0].id).toBe("cv-0");
  });

  describe("CV single-page print fit", () => {
    it("keeps a short CV at natural size and gently scales a slightly overflowing CV", () => {
      expect(calculateCvPrintScale(280)).toBe(1);
      expect(calculateCvPrintScale(310)).toBeCloseTo(295 / 310);
    });

    it("preserves multi-page output rather than making an overlong CV unreadably small", () => {
      expect(calculateCvPrintScale(400)).toBeNull();
      expect(calculateCvPrintScale(Number.NaN)).toBeNull();
    });
  });

  it("accepts international phone and identity formats while reporting invalid values", () => {
    const valid = emptyCvDraft().personal;
    valid.fullName = "Amaya Perera";
    valid.email = "amaya@example.co.uk";
    valid.phone = "+44 (0)20 7946 0958";
    valid.alternativePhone = "+94 77 123 4567";
    valid.nic = "AB-12345/XY";
    expect(validateCvPersonalDetails(valid)).toEqual({});

    expect(validateCvPersonalDetails({
      ...valid,
      email: "not-an-email",
      phone: "12",
      alternativePhone: "letters",
      nic: "?"
    })).toMatchObject({
      email: expect.any(String),
      phone: expect.any(String),
      alternativePhone: expect.any(String),
      nic: expect.any(String)
    });
  });
});
