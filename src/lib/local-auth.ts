import { provisionedAccountSeeds } from "../data/local-account-seeds";

const AUTH_DB = "little-paper-local-accounts";
const AUTH_VERSION = 1;
const PBKDF2_ITERATIONS = 310_000;
const DEMO_USERNAME = "P321";
const DEMO_PASSWORD = "1234";
const DEMO_BOOKSHOP_NAME = "PaperBloom";
const LEGACY_DEMO_BOOKSHOP_NAME = "Little Paper Demo Bookshop";

export type AccountRole = "admin" | "shop";
export interface LocalAccount {
  id: string;
  username: string;
  normalizedUsername: string;
  bookshopName: string;
  ownerContact: string;
  role: AccountRole;
  active: boolean;
  mustChangePassword: boolean;
  isTrial?: boolean;
  salt: string;
  passwordHash: string;
  provisionedPasswordHash?: string;
  createdAt: number;
  failedAttempts: number;
  lockedUntil: number;
}
export type PublicAccount = Omit<LocalAccount, "normalizedUsername" | "salt" | "passwordHash" | "provisionedPasswordHash" | "failedAttempts" | "lockedUntil">;

function openAuthDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("Offline account storage is unavailable in this browser."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(AUTH_DB, AUTH_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("accounts")) database.createObjectStore("accounts", { keyPath: "id" });
      if (!database.objectStoreNames.contains("settings")) database.createObjectStore("settings", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local account storage."));
  });
}

function request<T>(storeName: "accounts" | "settings", mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openAuthDb().then(database => new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = action(transaction.objectStore(storeName));
    let value: T;
    request.onsuccess = () => { value = request.result; };
    request.onerror = () => reject(request.error ?? new Error("Could not access local account storage."));
    transaction.oncomplete = () => { database.close(); resolve(value); };
    transaction.onerror = () => { database.close(); reject(transaction.error ?? new Error("Could not complete the account operation.")); };
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error("The account operation was cancelled.")); };
  }));
}

const normalize = (username: string) => username.trim().toLocaleLowerCase("en-US");
const encode = (value: Uint8Array) => btoa(String.fromCharCode(...value));
const decode = (value: string) => Uint8Array.from(atob(value), character => character.charCodeAt(0));
const randomBytes = (length: number) => crypto.getRandomValues(new Uint8Array(length));
const constantTimeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
};

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  if (!crypto.subtle) throw new Error("Password hashing is unavailable. Open the app using HTTPS or localhost.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations: PBKDF2_ITERATIONS }, key, 256);
  return encode(new Uint8Array(bits));
}

export async function createPasswordRecord(password: string): Promise<{ salt: string; passwordHash: string }> {
  const salt = randomBytes(16);
  return { salt: encode(salt), passwordHash: await hashPassword(password, salt) };
}

export function validatePassword(password: string): void {
  if (password.length < 10 || password.length > 128) throw new Error("Use a password between 10 and 128 characters.");
}

export function validateUsername(username: string): string {
  const value = username.trim();
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(value)) throw new Error("Username must be 3–32 characters using letters, numbers, dot, underscore, or hyphen.");
  return value;
}

export async function initializeLocalAccounts(): Promise<void> {
  const current = await request<LocalAccount[]>("accounts", "readonly", store => store.getAll());
  const seeds = provisionedAccountSeeds.map(seed => {
    if (!seed || typeof seed.id !== "string" || typeof seed.username !== "string" ||
        typeof seed.shopName !== "string" || typeof seed.ownerContact !== "string" ||
        typeof seed.passwordHash !== "string" || typeof seed.salt !== "string") {
      throw new Error("Invalid source-provisioned account record.");
    }
    const username = validateUsername(seed.username);
    if (!/^[a-zA-Z0-9-]{1,80}$/.test(seed.id) || !seed.shopName.trim() || seed.shopName.length > 100 ||
        seed.ownerContact.length > 120 ||
        !Number.isFinite(seed.createdAt) || typeof seed.active !== "boolean") {
      throw new Error(`Invalid source-provisioned account record: ${seed.id || username}`);
    }
    const role = seed.role ?? "shop";
    if ((role !== "admin" && role !== "shop") ||
        (seed.mustChangePassword !== undefined && typeof seed.mustChangePassword !== "boolean")) {
      throw new Error(`Invalid role or password-change setting for source-provisioned account ${username}.`);
    }
    const hash = decode(seed.passwordHash);
    const salt = decode(seed.salt);
    if (hash.length !== 32 || salt.length !== 16 || encode(hash) !== seed.passwordHash || encode(salt) !== seed.salt) {
      throw new Error(`Invalid password hash or salt for source-provisioned account ${username}.`);
    }
    return {
      id: seed.id, username, normalizedUsername: normalize(username), bookshopName: seed.shopName.trim(),
      ownerContact: seed.ownerContact, role, active: seed.active,
      mustChangePassword: seed.mustChangePassword ?? role === "shop", isTrial: seed.isTrial ?? false,
      salt: seed.salt, passwordHash: seed.passwordHash,
      provisionedPasswordHash: seed.passwordHash,
      createdAt: seed.createdAt, failedAttempts: 0, lockedUntil: 0
    };
  });
  if (new Set(seeds.map(seed => seed.id)).size !== seeds.length ||
      new Set(seeds.map(seed => seed.normalizedUsername)).size !== seeds.length) {
    throw new Error("Source-provisioned accounts contain duplicate IDs or usernames.");
  }
  if (seeds.filter(seed => seed.role === "admin").length > 1) {
    throw new Error("Only one source-provisioned administrator account is allowed.");
  }
  const hasSeedAdmin = seeds.some(seed => seed.role === "admin");
  const password = current.length === 0 && !hasSeedAdmin ? await createPasswordRecord(DEMO_PASSWORD) : undefined;
  const admin: LocalAccount | undefined = password ? {
    id: crypto.randomUUID(), username: DEMO_USERNAME, normalizedUsername: normalize(DEMO_USERNAME),
    bookshopName: DEMO_BOOKSHOP_NAME, ownerContact: "", role: "admin", active: true,
    mustChangePassword: true, ...password, createdAt: Date.now(), failedAttempts: 0, lockedUntil: 0
  } : undefined;
  const database = await openAuthDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("accounts", "readwrite");
    const store = transaction.objectStore("accounts");
    const read = store.getAll();
    read.onsuccess = () => {
      const accounts = read.result as LocalAccount[];
      try {
        for (const account of accounts) {
          if (account.bookshopName === LEGACY_DEMO_BOOKSHOP_NAME) {
            const updated = { ...account, bookshopName: DEMO_BOOKSHOP_NAME };
            store.put(updated);
            accounts[accounts.indexOf(account)] = updated;
          }
        }
        if (accounts.length === 0) {
          if (hasSeedAdmin) {
            const seededAdmin = seeds.find(seed => seed.role === "admin");
            if (seededAdmin) {
              store.add(seededAdmin);
              accounts.push(seededAdmin);
            }
          } else if (admin) {
            store.add(admin);
            accounts.push(admin);
          }
        }
        for (const seed of seeds) {
          const existing = accounts.find(account => account.id === seed.id) ??
            accounts.find(account => account.normalizedUsername === seed.normalizedUsername && account.role === "admin" && seed.role === "admin");
          if (existing) {
            if (existing.role !== seed.role ||
                (existing.id === seed.id && existing.normalizedUsername !== seed.normalizedUsername)) {
              throw new Error(`Source-provisioned account ID ${seed.id} is already in use.`);
            }
            if (accounts.some(account => account.id !== existing.id && account.normalizedUsername === seed.normalizedUsername)) {
              throw new Error(`Source-provisioned username ${seed.username} is already in use.`);
            }
            const updated = { ...existing };
            if (existing.provisionedPasswordHash !== seed.passwordHash) {
              updated.mustChangePassword = seed.mustChangePassword;
              updated.salt = seed.salt;
              updated.passwordHash = seed.passwordHash;
              updated.provisionedPasswordHash = seed.passwordHash;
              updated.failedAttempts = 0;
              updated.lockedUntil = 0;
            }
            store.put(updated);
            accounts[accounts.indexOf(existing)] = updated;
            continue;
          }
          if (accounts.some(account => account.normalizedUsername === seed.normalizedUsername) ||
              (admin?.normalizedUsername === seed.normalizedUsername && accounts.length === 0)) {
            throw new Error(`Source-provisioned username ${seed.username} is already in use.`);
          }
          store.add(seed);
          accounts.push(seed);
        }
      } catch (error) {
        transaction.abort();
        reject(error);
      }
    };
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error ?? new Error("Could not initialize the demo administrator.")); };
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error("Could not initialize the demo administrator.")); };
  });
}

export async function listLocalAccounts(): Promise<PublicAccount[]> {
  const records = await request<LocalAccount[]>("accounts", "readonly", store => store.getAll());
  return records.map(({ normalizedUsername: _normalizedUsername, salt: _salt, passwordHash: _passwordHash, failedAttempts: _failedAttempts, lockedUntil: _lockedUntil, ...account }) => account)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function loginLocalAccount(username: string, password: string): Promise<LocalAccount> {
  const normalizedUsername = normalize(username);
  const accounts = await request<LocalAccount[]>("accounts", "readonly", store => store.getAll());
  const account = accounts.find(item => item.normalizedUsername === normalizedUsername);
  if (!account) throw new Error("Username or password is incorrect.");
  if (!account.active) throw new Error("This account is inactive. Ask the administrator for help.");
  if (account.lockedUntil > Date.now()) throw new Error("This account is temporarily locked. Try again later.");
  const valid = constantTimeEqual(await hashPassword(password, decode(account.salt)), account.passwordHash);
  if (!valid) {
    const failedAttempts = account.failedAttempts + 1;
    const updated = { ...account, failedAttempts: failedAttempts >= 5 ? 0 : failedAttempts, lockedUntil: failedAttempts >= 5 ? Date.now() + 5 * 60_000 : account.lockedUntil };
    await request<IDBValidKey>("accounts", "readwrite", store => store.put(updated));
    throw new Error(failedAttempts >= 5 ? "Too many attempts. This account is locked for five minutes." : "Username or password is incorrect.");
  }
  const updated = { ...account, failedAttempts: 0, lockedUntil: 0 };
  await request<IDBValidKey>("accounts", "readwrite", store => store.put(updated));
  return updated;
}

export async function markLegacyDataMigrated(): Promise<void> {
  await request<IDBValidKey>("settings", "readwrite", store => store.put({ key: "legacy-data-migrated", value: true }));
}

export async function isLegacyDataMigrated(): Promise<boolean> {
  const setting = await request<{ key: string; value: boolean } | undefined>("settings", "readonly", store => store.get("legacy-data-migrated"));
  return setting?.value === true;
}

export async function saveAccountPassword(account: LocalAccount, password: string, mustChange = false): Promise<LocalAccount> {
  validatePassword(password);
  const record = await createPasswordRecord(password);
  const updated = { ...account, ...record, mustChangePassword: mustChange, failedAttempts: 0, lockedUntil: 0 };
  await request<IDBValidKey>("accounts", "readwrite", store => store.put(updated));
  return updated;
}

export async function updateLocalAccount(accountId: string, update: (account: LocalAccount) => LocalAccount): Promise<LocalAccount> {
  const accounts = await request<LocalAccount[]>("accounts", "readonly", store => store.getAll());
  const account = accounts.find(item => item.id === accountId);
  if (!account) throw new Error("Account no longer exists.");
  const updated = update(account);
  await request<IDBValidKey>("accounts", "readwrite", store => store.put(updated));
  return updated;
}

export async function changeLocalUsername(accountId: string, username: string): Promise<LocalAccount> {
  const value = validateUsername(username);
  const database = await openAuthDb();
  let updated: LocalAccount | undefined;
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("accounts", "readwrite");
    const store = transaction.objectStore("accounts");
    const read = store.getAll();
    read.onsuccess = () => {
      const accounts = read.result as LocalAccount[];
      if (accounts.some(item => item.id !== accountId && item.normalizedUsername === normalize(value))) {
        transaction.abort();
        return;
      }

      const account = accounts.find(item => item.id === accountId);
      if (!account) {
        transaction.abort();
        return;
      }
      updated = { ...account, username: value, normalizedUsername: normalize(value) };
      store.put(updated);
    };
    read.onerror = () => reject(read.error ?? new Error("Could not read account records."));
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error ?? new Error("Could not change username.")); };
    transaction.onabort = () => { database.close(); reject(new Error("Username is already in use or account no longer exists.")); };
  });
  if (!updated) throw new Error("Account no longer exists.");
  return updated;
}

export async function changeLocalShopName(accountId: string, shopName: string): Promise<LocalAccount> {
  const value = shopName.trim();
  if (!value || value.length > 100) throw new Error("Enter a bookshop name up to 100 characters.");
  return updateLocalAccount(accountId, account => ({ ...account, bookshopName: value }));
}

export function generateInitialPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const random = randomBytes(16);
  return Array.from(random, byte => alphabet[byte % alphabet.length]).join("");
}

export async function backupAccountMetadata(): Promise<string> {
  const accounts = await request<LocalAccount[]>("accounts", "readonly", store => store.getAll());
  return JSON.stringify({
    version: 1,
    hashAlgorithm: `PBKDF2-SHA-256-${PBKDF2_ITERATIONS}`,
    users: accounts.filter(account => account.role !== "admin").map(account => ({
      id: account.id,
      username: account.username,
      passwordHash: account.passwordHash,
      salt: account.salt,
      role: "user",
      shopName: account.bookshopName,
      ownerContact: account.ownerContact,
      status: account.active ? "active" : "disabled",
      createdAt: account.createdAt,
      mustChangePassword: account.mustChangePassword
    }))
  }, null, 2);
}
