export interface SavedA4Notice {
  id: string;
  name: string;
  templateId: string;
  orientation: "portrait" | "landscape";
  values: Record<string, string>;
  hiddenFields: string[];
  headingFontSize: number;
  bodyFontSize: number;
  textColor: string;
  align: "left" | "center" | "right";
  updatedAt: number;
}

const storageKey = (tenantId: string) => `little-paper-a4-notices:${tenantId}:v1`;

export function loadSavedA4Notices(storage: Pick<Storage, "getItem">, tenantId: string): SavedA4Notice[] {
  const raw = storage.getItem(storageKey(tenantId));
  if (raw === null) return [];

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    throw new Error("Saved A4 notices could not be read because their local data is invalid.", { cause: error });
  }
  if (!Array.isArray(value)) throw new Error("Saved A4 notices could not be read because their local data has an unexpected format.");

  return value.map((notice, index) => {
    if (!notice || typeof notice !== "object") throw new Error(`Saved A4 notice ${index + 1} is invalid.`);
    const item = notice as Partial<SavedA4Notice>;
    if (
      typeof item.id !== "string" || typeof item.name !== "string" || typeof item.templateId !== "string" ||
      (item.orientation !== "portrait" && item.orientation !== "landscape") ||
      !item.values || typeof item.values !== "object" || Array.isArray(item.values) ||
      !Array.isArray(item.hiddenFields) || !item.hiddenFields.every(key => typeof key === "string") ||
      typeof item.headingFontSize !== "number" || typeof item.bodyFontSize !== "number" ||
      typeof item.textColor !== "string" ||
      (item.align !== "left" && item.align !== "center" && item.align !== "right") ||
      typeof item.updatedAt !== "number" ||
      !Object.values(item.values).every(text => typeof text === "string")
    ) {
      throw new Error(`Saved A4 notice ${index + 1} is invalid.`);
    }
    return item as SavedA4Notice;
  });
}

export function saveA4Notices(storage: Pick<Storage, "setItem">, tenantId: string, notices: SavedA4Notice[]): void {
  storage.setItem(storageKey(tenantId), JSON.stringify(notices));
}
