import { pbkdf2Sync, randomBytes } from "node:crypto";
import { createInterface } from "node:readline";
import { StringDecoder } from "node:string_decoder";

const readline = createInterface({ input: process.stdin, output: process.stdout });
const ask = prompt => new Promise(resolve => readline.question(prompt, resolve));

const id = await ask("Account ID (e.g. shop-322): ");
const username = await ask("Username: ");
const shopName = await ask("Bookshop name: ");
const ownerContact = await ask("Owner/contact label (optional): ");
const roleInput = (await ask("Role (admin/shop) [admin]: ")).trim().toLowerCase();
const role = roleInput || "admin";
readline.close();
process.stdout.write("Initial password (input hidden): ");
if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
  readline.close();
  throw new Error("Run this script in an interactive terminal so the password can be entered without echo.");
}
process.stdin.setRawMode(true);
process.stdin.resume();
let password = "";
const decoder = new StringDecoder("utf8");
await new Promise((resolve, reject) => {
  const onData = chunk => {
    for (const character of decoder.write(chunk)) {
      if (character === "\u0003") {
        process.stdin.setRawMode(false);
        process.stdout.write("\n");
        reject(new Error("Account seed generation cancelled."));
        return;
      }
      if (character === "\r" || character === "\n") {
        process.stdin.off("data", onData);
        process.stdin.setRawMode(false);
        process.stdout.write("\n");
        resolve();
        return;
      }
      if (character === "\u0008" || character === "\u007f") password = Array.from(password).slice(0, -1).join("");
      else password += character;
    }
  };
  process.stdin.on("data", onData);
});
if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) throw new Error("ACCOUNT_ID must contain only letters, digits, and hyphens (up to 80 characters).");
if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username.trim())) throw new Error("ACCOUNT_USERNAME must be 3–32 letters, digits, dots, underscores, or hyphens.");
if (!shopName.trim() || shopName.length > 100) throw new Error("ACCOUNT_SHOP_NAME must be 1–100 characters.");
if (ownerContact.length > 120) throw new Error("Owner/contact label must be at most 120 characters.");
if (password.length < 10 || password.length > 128) throw new Error("ACCOUNT_PASSWORD must be 10–128 characters.");
if (role !== "admin" && role !== "shop") throw new Error("Role must be admin or shop.");

const salt = randomBytes(16);
const passwordHash = pbkdf2Sync(password, salt, 310_000, 32, "sha256");
console.log(JSON.stringify({
  id,
  username: username.trim(),
  shopName: shopName.trim(),
  ownerContact: ownerContact.trim(),
  passwordHash: passwordHash.toString("base64"),
  salt: salt.toString("base64"),
  active: true,
  createdAt: Date.now(),
  role,
  mustChangePassword: role === "shop"
}, null, 2));
