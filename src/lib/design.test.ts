import { describe, expect, it } from "vitest";
import { starterTemplates } from "../data/templates";
import { createDesign, createSubjectDesign, templateFromDesign } from "./design";
import type { StickerTemplate } from "../types";

const template: StickerTemplate = {
  id: "test-split", name: "Split", kind: "sticker", widthMm: 90, heightMm: 45,
  background: "#ffffff", borderColor: "#333333", accent: "#333333", borderStyle: "solid",
  radius: 8, layout: "split", decoration: "✦", favourite: false, createdAt: 0, updatedAt: 0
};

describe("createDesign", () => {
  it("preserves mixed Sinhala and English exactly and hides empty optional fields", () => {
    const name = "අමායා Perera";
    const design = createDesign(name, { name, grade: "", subject: "", school: "" }, template, "Sinhala + English");
    expect(design.texts.find(text => text.field === "name")?.text).toBe(name);
    expect(design.texts.find(text => text.field === "grade")?.visible).toBe(false);
    expect(design.texts.find(text => text.field === "school")?.visible).toBe(false);
    expect(design.language).toBe("Sinhala + English");
  });

  it("creates split layouts with separate grade and subject positions", () => {
    const design = createDesign("Nimal", { name: "Nimal", grade: "Grade 7", subject: "Science", school: "School" }, template, "English");
    const grade = design.texts.find(text => text.field === "grade");
    const subject = design.texts.find(text => text.field === "subject");
    expect(grade?.x).not.toBe(subject?.x);
    expect(grade?.visible).toBe(true);
    expect(subject?.visible).toBe(true);
  });

  it("shows only the first selected subject in the editor design and preserves student details", () => {
    const design = createSubjectDesign("Amaya", {
      name: "Amaya", grade: "Grade 3", school: "Central School"
    }, ["Mathematics", "සිංහල"], template, "Sinhala + English");

    expect(design.texts.find(text => text.field === "subject")?.text).toBe("Mathematics");
    expect(design.printSubjects).toEqual(["Mathematics", "සිංහල"]);
    expect(design.texts.find(text => text.field === "name")?.text).toBe("Amaya");
    expect(design.texts.find(text => text.field === "grade")?.text).toBe("Grade 3");
    expect(design.texts.find(text => text.field === "school")?.text).toBe("Central School");
  });

  it("creates a name-only design when no subjects are selected", () => {
    const design = createSubjectDesign("Amaya", {
      name: "Amaya", grade: "", school: ""
    }, [], template, "English");

    expect(design.texts.find(text => text.field === "subject")?.visible).toBe(false);
  });

  it("keeps the editor subject label focused on one selected subject", () => {
    const design = createSubjectDesign("Amaya", {
      name: "Amaya", grade: "Grade 10", school: "Central School"
    }, ["Mathematics", "Science", "English", "Sinhala", "History", "Geography"], template, "English");
    const subject = design.texts.find(text => text.field === "subject");

    expect(subject?.text).toBe("Mathematics");
    expect(design.printSubjects).toEqual(["Mathematics", "Science", "English", "Sinhala", "History", "Geography"]);
  });

  it("uses the tiger artwork template as the colorful default sticker", () => {
    const template = starterTemplates.find(item => item.id === "art-tiger");
    expect(template).toBeDefined();
    if (!template) throw new Error("Default tiger artwork template is missing.");
    const design = createDesign("Amaya", {
      name: "Amaya", grade: "Grade 3", subject: "Mathematics", school: ""
    }, template, "English");

    expect(design.background).toBe("#fff7e8");
    expect(design.borderColor).toBe("#d98216");
    expect(design.images).toMatchObject([{ assetId: "starter-tiger", x: 16, width: 31 }]);
    expect(design.texts.find(text => text.field === "name")?.text).toBe("Amaya");
  });

  it("keeps school names prominent and preserves entered details in the generated design", () => {
    const selected = starterTemplates.find(item => item.id === "art-rose");
    if (!selected) throw new Error("Default rose artwork template is missing.");
    const design = createDesign("Amaya", {
      name: "Alexandria Sandaruwan Jayawardena",
      grade: "Grade 10",
      subject: "Science",
      school: "Ananda Balika Vidyalaya International School"
    }, selected, "English");

    const name = design.texts.find(text => text.field === "name");
    const school = design.texts.find(text => text.field === "school");
    expect(name?.text).toBe("Alexandria Sandaruwan Jayawardena");
    expect(school?.text).toBe("Ananda Balika Vidyalaya International School");
    expect(name?.fontSize).toBeGreaterThan(school?.fontSize ?? 0);
    expect(school?.fontSize).toBeGreaterThanOrEqual(12);
    expect(school?.wrap).toBe(true);
    expect(school?.height).toBeGreaterThan(0);
  });

  it("stores custom field labels in reusable templates without storing the user's value", () => {
    const design = createDesign("Amaya", {
      name: "Amaya", grade: "Grade 4", subject: "English", school: "Willow Primary"
    }, template, "English");
    design.texts.push({
      id: "student-id",
      field: "custom",
      customLabel: "Student ID",
      text: "A-104",
      visible: true,
      fontFamily: "Inter",
      fontSize: 9,
      height: 12,
      wrap: true,
      color: "#333333",
      bold: false,
      align: "center",
      x: 50,
      y: 90,
      width: 80,
      rotation: 0,
      lineHeight: 1.12,
      letterSpacing: 0
    });

    const reusable = templateFromDesign(design, "Class label");
    const recreated = createDesign("Another student", {
      name: "Another student", grade: "Grade 5", subject: "Maths", school: ""
    }, reusable, "English");
    const custom = recreated.texts.find(text => text.field === "custom");

    expect(custom?.customLabel).toBe("Student ID");
    expect(custom?.text).toBe("");
    expect(custom?.visible).toBe(true);
  });
});
