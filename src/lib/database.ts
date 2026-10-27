import type { ImageAsset, StickerDesign, StickerTemplate, SubjectPreset } from "@/types";
import type { CustomPrintDesign } from "./custom-print";
import type { SavedPaper } from "./past-papers";
import type { CvDraft } from "./cv";
import type { SavedDocumentDraft } from "./document-library";

const DB_NAME = "little-paper-studio";
const DB_VERSION = 6;
type StoreName = "designs" | "templates" | "assets" | "subjects" | "customPrintDesigns" | "pastPapers" | "cvDrafts" | "documentDrafts";
let activeTenantId = "legacy";

function databaseName(tenantId = activeTenantId): string {
  return tenantId === "legacy" ? DB_NAME : `${DB_NAME}-tenant-${tenantId}`;
}

function openDatabase(name = databaseName()): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("Local browser storage is unavailable."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("designs")) db.createObjectStore("designs", { keyPath: "id" });
      if (!db.objectStoreNames.contains("templates")) db.createObjectStore("templates", { keyPath: "id" });
      if (!db.objectStoreNames.contains("assets")) db.createObjectStore("assets", { keyPath: "id" });
      if (!db.objectStoreNames.contains("subjects")) db.createObjectStore("subjects", { keyPath: "gradeBand" });
      if (!db.objectStoreNames.contains("customPrintDesigns")) db.createObjectStore("customPrintDesigns", { keyPath: "id" });
      if (!db.objectStoreNames.contains("pastPapers")) db.createObjectStore("pastPapers", { keyPath: "id" });
      if (!db.objectStoreNames.contains("cvDrafts")) db.createObjectStore("cvDrafts", { keyPath: "id" });
      if (!db.objectStoreNames.contains("documentDrafts")) db.createObjectStore("documentDrafts", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local design storage."));
  });
}

async function copyLegacyDatabase(target: IDBDatabase): Promise<void> {
  const legacy = await openDatabase(DB_NAME);
  const stores: StoreName[] = ["designs", "templates", "assets", "subjects", "customPrintDesigns", "pastPapers", "cvDrafts", "documentDrafts"];
  await new Promise<void>((resolve, reject) => {
    const names = stores.filter(name => legacy.objectStoreNames.contains(name));
    if (!names.length) {
      legacy.close();
      resolve();
      return;
    }
    const read = legacy.transaction(names, "readonly");
    const pending: Array<{ store: StoreName; values: unknown[] }> = [];
    let remaining = names.length;
    for (const store of names) {
      const request = read.objectStore(store).getAll();
      request.onsuccess = () => {
        pending.push({ store, values: request.result });
        remaining -= 1;
        if (remaining !== 0) return;
        try {
          const write = target.transaction(names, "readwrite");
          for (const batch of pending) {
            const destination = write.objectStore(batch.store);
            for (const value of batch.values) destination.put(value);
          }
          write.oncomplete = () => {
            legacy.close();
            resolve();
          };
          write.onerror = () => {
            legacy.close();
            reject(write.error ?? new Error("Could not migrate existing local bookshop data."));
          };
          write.onabort = () => {
            legacy.close();
            reject(write.error ?? new Error("Could not migrate existing local bookshop data."));
          };
        } catch (error) {
          legacy.close();
          reject(error);
        }
      };
      request.onerror = () => {
        legacy.close();
        reject(request.error ?? new Error(`Could not read existing ${store} data.`));
      };
    }
    read.onerror = () => {
      legacy.close();
      reject(read.error ?? new Error("Could not read existing local bookshop data."));
    };
  });
}

export async function activateTenant(tenantId: string, migrateLegacy = false): Promise<void> {
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(tenantId)) throw new Error("Invalid local account identifier.");
  const previous = activeTenantId;
  activeTenantId = tenantId;
  try {
    const database = await openDatabase();
    if (migrateLegacy) {
      await copyLegacyDatabase(database);
      const legacyPreferences = [
        "little-paper-language", "little-paper-typing-mode", "little-paper-recent-ids",
        "little-paper-custom-print-recents", "little-paper-colouring-searches", "little-paper-colouring-recent"
      ];
      for (const key of legacyPreferences) {
        try {
          const value = localStorage.getItem(key);
          if (value !== null && localStorage.getItem(`${key}:${tenantId}`) === null) {
            localStorage.setItem(`${key}:${tenantId}`, value);
          }
        } catch (error) {
          console.error(`Could not migrate the local preference ${key}.`, error);
        }
      }
    }
    database.close();
  } catch (error) {
    activeTenantId = previous;
    throw error;
  }
}

export function getActiveTenantId(): string {
  return activeTenantId;
}

async function request<T>(storeName: StoreName, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const req = action(tx.objectStore(storeName));
    let result: T;
    let requestCompleted = false;
    req.onsuccess = () => {
      result = req.result;
      requestCompleted = true;
    };
    req.onerror = () => reject(req.error ?? new Error(`Could not access ${storeName}.`));
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error(`Could not save ${storeName}.`));
    };
    tx.oncomplete = () => {
      db.close();
      if (requestCompleted) resolve(result);
      else reject(new Error(`Could not complete the ${storeName} transaction.`));
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error(`Could not access ${storeName}.`));
    };
  });
}

export const db = {
  getAllDesigns: () => request<StickerDesign[]>("designs", "readonly", store => store.getAll()),
  putDesign: (design: StickerDesign) => request<IDBValidKey>("designs", "readwrite", store => store.put(design)),
  deleteDesign: (id: string) => request<undefined>("designs", "readwrite", store => store.delete(id)),
  getAllTemplates: () => request<StickerTemplate[]>("templates", "readonly", store => store.getAll()),
  putTemplate: (template: StickerTemplate) => request<IDBValidKey>("templates", "readwrite", store => store.put(template)),
  deleteTemplate: (id: string) => request<undefined>("templates", "readwrite", store => store.delete(id)),
  getAllAssets: () => request<ImageAsset[]>("assets", "readonly", store => store.getAll()),
  putAsset: (asset: ImageAsset) => request<IDBValidKey>("assets", "readwrite", store => store.put(asset)),
  deleteAsset: (id: string) => request<undefined>("assets", "readwrite", store => store.delete(id)),
  getAllSubjectPresets: () => request<SubjectPreset[]>("subjects", "readonly", store => store.getAll()),
  putSubjectPreset: (preset: SubjectPreset) => request<IDBValidKey>("subjects", "readwrite", store => store.put(preset)),
  getAllCustomPrintDesigns: () => request<CustomPrintDesign[]>("customPrintDesigns", "readonly", store => store.getAll()),
  putCustomPrintDesign: (design: CustomPrintDesign) => request<IDBValidKey>("customPrintDesigns", "readwrite", store => store.put(design)),
  deleteCustomPrintDesign: (id: string) => request<undefined>("customPrintDesigns", "readwrite", store => store.delete(id)),
  getAllPastPapers: () => request<SavedPaper[]>("pastPapers", "readonly", store => store.getAll()),
  putPastPaper: (paper: SavedPaper) => request<IDBValidKey>("pastPapers", "readwrite", store => store.put(paper)),
  deletePastPaper: (id: string) => request<undefined>("pastPapers", "readwrite", store => store.delete(id)),
  getCvDraft: () => request<CvDraft | undefined>("cvDrafts", "readonly", store => store.get("current")),
  putCvDraft: (draft: CvDraft) => request<IDBValidKey>("cvDrafts", "readwrite", store => store.put(draft)),
  deleteCvDraft: () => request<undefined>("cvDrafts", "readwrite", store => store.delete("current")),
  getAllDocumentDrafts: () => request<SavedDocumentDraft[]>("documentDrafts", "readonly", store => store.getAll()),
  putDocumentDraft: (draft: SavedDocumentDraft) => request<IDBValidKey>("documentDrafts", "readwrite", store => store.put(draft)),
  deleteDocumentDraft: (id: string) => request<undefined>("documentDrafts", "readwrite", store => store.delete(id))
};

const RECENTS_KEY = "little-paper-recent-ids";
const recentKey = () => `${RECENTS_KEY}:${activeTenantId}`;
export function readRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(recentKey());
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string").slice(0, 10) : [];
  } catch (error) {
    console.error("Could not read recent designs.", error);
    return [];
  }
}

export function writeRecentIds(id: string): void {
  try {
    const recent = [id, ...readRecentIds().filter(existing => existing !== id)].slice(0, 10);
    localStorage.setItem(recentKey(), JSON.stringify(recent));
  } catch (error) {
    console.error("Could not update recent designs.", error);
    throw new Error("The design was saved, but the recent list could not be updated.");
  }
}
