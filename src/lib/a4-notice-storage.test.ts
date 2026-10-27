import { describe, expect, it } from "vitest";
import { loadSavedA4Notices, saveA4Notices, type SavedA4Notice } from "./a4-notice-storage";

function memoryStorage(): Pick<Storage, "getItem" | "setItem"> {
  const entries = new Map<string, string>();
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value)
  };
}

const notice: SavedA4Notice = {
  id: "saved-1",
  name: "Land notice",
  templateId: "land-for-sale-bold",
  orientation: "portrait",
  values: { heading: "ඉඩම් විකිණීමට ඇත", contact: "077 123 4567" },
  hiddenFields: ["price"],
  headingFontSize: 44,
  bodyFontSize: 18,
  textColor: "#202020",
  align: "center",
  updatedAt: 123
};

describe("A4 notice local storage", () => {
  it("persists edited notices by local account and reloads them", () => {
    const storage = memoryStorage();
    saveA4Notices(storage, "bookshop-1", [notice]);

    expect(loadSavedA4Notices(storage, "bookshop-1")).toEqual([notice]);
    expect(loadSavedA4Notices(storage, "bookshop-2")).toEqual([]);
  });

  it("reports invalid local data rather than silently discarding saved notices", () => {
    const storage = memoryStorage();
    storage.setItem("little-paper-a4-notices:bookshop-1:v1", "{invalid");

    expect(() => loadSavedA4Notices(storage, "bookshop-1")).toThrow("local data is invalid");
  });
});
