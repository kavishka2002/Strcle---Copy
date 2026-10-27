import { describe, expect, it } from "vitest";
import { createColoringSheet, createGradeColoringSheet, searchColoringSheets, sortColoringSheets } from "./coloring-sheets";

const sheets = [
  createColoringSheet("පින්තුර/මල් වර්ග.pdf", "/පින්තුර/මල්%20වර්ග.pdf", 1000),
  createColoringSheet("පින්තුර/මල්.pdf", "/පින්තුර/මල්.pdf", 900),
  createColoringSheet("පින්තුර/විවිධ සතුන්.pdf", "/පින්තුර/විවිධ%20සතුන්.pdf", 1200),
  createColoringSheet("පින්තුර/පළතුරු.pdf", "/පින්තුර/පළතුරු.pdf", 800)
];

describe("colouring sheet catalogue and search", () => {
  it("categorizes real filenames and produces local public metadata", () => {
    expect(sheets[0]).toMatchObject({ sinhalaName: "මල් වර්ග", category: "Flowers", url: "/පින්තුර/මල්%20වර්ග.pdf", sizeBytes: 1000 });
  });

  it("matches Sinhala and English flower aliases with exact titles ranked first", () => {
    expect(searchColoringSheets(sheets, "flower").map(sheet => sheet.sinhalaName)).toEqual(["මල්", "මල් වර්ග"]);
    expect(searchColoringSheets(sheets, "මල").map(sheet => sheet.category)).toEqual(["Flowers", "Flowers"]);
    expect(searchColoringSheets(sheets, " flowers ").map(sheet => sheet.category)).toEqual(["Flowers", "Flowers"]);
  });

  it("finds category-relevant Sinhala files from English animal searches", () => {
    expect(searchColoringSheets(sheets, "dogs").map(sheet => sheet.sinhalaName)).toContain("විවිධ සතුන්");
    expect(searchColoringSheets(sheets, "පළතුරු")[0].category).toBe("Fruits");
  });

  it("normalizes Sinhala joiners in filenames and search terms without losing the display spelling", () => {
    const sports = createColoringSheet("පින්තුර/අපේ ක්_රීඩකයෝ.pdf", "/sports.pdf", 500);
    expect(sports.sinhalaName).toBe("අපේ ක්‍රීඩකයෝ");
    expect(sports.category).toBe("Sports");
    expect(searchColoringSheets([sports], "ක්‍රීඩා")).toHaveLength(1);
  });

  it("keeps Grade 1 sheets in curriculum title order with Sinhala labels", () => {
    const titleThree = createGradeColoringSheet("Grade 1/Title 3 waththta ena sathun/wathata ena sathun.png", "/Grade%201/title-3.png", 500);
    const titleOne = createGradeColoringSheet("Grade 1/Title 1 pasala awata/apay pasaly gas warga.png", "/Grade%201/title-1.png", 600);

    expect(titleThree).toMatchObject({ mediaType: "image", grade: 1, titleOrder: 3, titleSinhala: "වත්තට එන සතුන්" });
    expect(searchColoringSheets([titleThree], "waththata ena sathun")).toHaveLength(1);
    expect(searchColoringSheets([titleThree], "සතුන්")).toHaveLength(1);
    expect(sortColoringSheets([titleThree, titleOne], "curriculum").map(sheet => sheet.titleOrder)).toEqual([1, 3]);
  });

  it("recognizes Grade 2 lessons, Sinhala titles, and romanized search", () => {
    const school = createGradeColoringSheet("grade 2/Title 1 pasala ape pasale sthana/school-places.png", "/grade%202/school-places.png", 500);
    const home = createGradeColoringSheet("grade 2/Title 2 niwasa ape gedara/family-homes.png", "/grade%202/family-homes.png", 500);

    expect(school).toMatchObject({ grade: 2, titleOrder: 1, titleSinhala: "පාසල - අපේ පාසලේ ස්ථාන" });
    expect(searchColoringSheets([school], "pasala ape pasale sthana")).toHaveLength(1);
    expect(searchColoringSheets([school], "පාසල")).toHaveLength(1);
    expect(sortColoringSheets([home, school], "curriculum").map(sheet => sheet.titleOrder)).toEqual([1, 2]);
  });

  it("recognizes Grade 3 lesson groups and searches their Sinhala and romanized titles", () => {
    const plants = createGradeColoringSheet("grade 3/Title 3 palati ha gaswal/plant-and-tree-types.png", "/grade%203/plants.png", 500);
    const animals = createGradeColoringSheet("grade 3/Title 4 apa awata sathun/common-animals.png", "/grade%203/animals.png", 600);

    expect(plants).toMatchObject({ grade: 3, titleOrder: 3, titleSinhala: "පැළෑටි හා ගස්වැල්" });
    expect(searchColoringSheets([plants], "palati ha gaswal")).toHaveLength(1);
    expect(searchColoringSheets([plants], "පැළෑටි")).toHaveLength(1);
    expect(sortColoringSheets([animals, plants], "curriculum").map(sheet => sheet.titleOrder)).toEqual([3, 4]);
  });

  it("recognizes Grade 4 lesson groups and searches Sinhala and romanized titles", () => {
    const plants = createGradeColoringSheet("grade 4/Title 3 palati ha gaswal/flowering-plants.png", "/grade%204/plants.png", 500);
    const tools = createGradeColoringSheet("grade 4/Title 11 wada pahasu karana upakarana/work-tools.png", "/grade%204/tools.png", 500);

    expect(plants).toMatchObject({ grade: 4, titleOrder: 3, titleSinhala: "පැළෑටි හා ගස්වැල්" });
    expect(searchColoringSheets([plants], "පැළෑටි")).toHaveLength(1);
    expect(searchColoringSheets([plants], "palati ha gaswal")).toHaveLength(1);
    expect(sortColoringSheets([tools, plants], "curriculum").map(sheet => sheet.titleOrder)).toEqual([3, 11]);
  });
});
