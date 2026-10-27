import { describe, expect, it } from "vitest";
import { provisionedAccountSeeds } from "../data/local-account-seeds";
import { changeLocalShopName, createPasswordRecord, generateInitialPassword, validatePassword, validateUsername } from "./local-auth";

describe("offline account input and password handling", () => {
  it("provisions the trial account without replacing the existing administrator", () => {
    const trial = provisionedAccountSeeds.find(account => account.username === "T123");
    expect(trial).toMatchObject({ role: "shop", shopName: "PaperBloom Free Trial", active: true, mustChangePassword: false, isTrial: true });
    expect(trial?.passwordHash).not.toBe("1234");
    expect(provisionedAccountSeeds.filter(account => account.role === "admin")).toHaveLength(1);
  });

  it("provisions Danu communication with a salted shop account", () => {
    const account = provisionedAccountSeeds.find(seed => seed.username === "Danu");
    expect(account).toMatchObject({
      id: "shop-danu-communication",
      shopName: "Danu communication",
      role: "shop",
      active: true,
      mustChangePassword: false
    });
    expect(account?.salt).toHaveLength(24);
    expect(account?.passwordHash).toHaveLength(44);
  });

  it("validates usernames without accepting whitespace or unsafe characters", () => {
    expect(validateUsername("P321")).toBe("P321");
    expect(validateUsername("shop.owner_1")).toBe("shop.owner_1");
    expect(() => validateUsername("ab")).toThrow();
    expect(() => validateUsername("shop name")).toThrow();
    expect(() => validateUsername("shop/path")).toThrow();
  });

  it("enforces a usable minimum password length", () => {
    expect(() => validatePassword("short123")).toThrow();
    expect(() => validatePassword("valid-offline-password")).not.toThrow();
    expect(() => validatePassword("x".repeat(129))).toThrow();
  });

  it("stores a salted PBKDF2-derived value rather than the original password", async () => {
    const first = await createPasswordRecord("bookshop-local-password");
    const second = await createPasswordRecord("bookshop-local-password");
    expect(first.salt).not.toBe(second.salt);
    expect(first.passwordHash).not.toBe("bookshop-local-password");
    expect(first.passwordHash).not.toBe(second.passwordHash);
    expect(first.passwordHash).toHaveLength(44);
  });

  it("generates one-time passwords with adequate length", () => {
    expect(generateInitialPassword()).toHaveLength(16);
    expect(generateInitialPassword()).not.toBe(generateInitialPassword());
  });

  it("validates bookshop names before attempting account updates", async () => {
    await expect(changeLocalShopName("missing-account", " ")).rejects.toThrow("Enter a bookshop name");
    await expect(changeLocalShopName("missing-account", "x".repeat(101))).rejects.toThrow("Enter a bookshop name");
  });

});
