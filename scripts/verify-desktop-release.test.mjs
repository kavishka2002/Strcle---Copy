import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import validation from "./verify-desktop-release.cjs";

const { verifyReleaseAssets } = validation;
const version = "1.0.2";
const installerName = `LittlePaper-Setup-${version}.exe`;
const blockmapName = `${installerName}.blockmap`;
let temporaryDirectory;

async function writeRelease(directory, installer = Buffer.from("installer bytes"), blockmap = Buffer.from("blockmap bytes")) {
  await mkdir(directory, { recursive: true });
  const installerHash = createHash("sha512").update(installer).digest("base64");
  await writeFile(path.join(directory, installerName), installer);
  await writeFile(path.join(directory, blockmapName), blockmap);
  await writeFile(path.join(directory, "latest.yml"), [
    `version: ${version}`,
    "files:",
    `  - url: ${installerName}`,
    `    sha512: ${installerHash}`,
    `    size: ${installer.byteLength}`,
    `path: ${installerName}`,
    `sha512: ${installerHash}`,
    "releaseDate: '2026-10-27T00:00:00.000Z'",
    ""
  ].join("\n"));
}

beforeEach(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "littlepaper-release-test-"));
});

afterEach(async () => {
  await rm(temporaryDirectory, { recursive: true, force: true });
});

describe("desktop release asset verification", () => {
  it("accepts a manifest that exactly matches the installer and blockmap", async () => {
    const directory = path.join(temporaryDirectory, "build");
    await writeRelease(directory);

    const assets = await verifyReleaseAssets(directory, version);

    expect(Object.keys(assets)).toEqual([installerName, "latest.yml", blockmapName]);
  });

  it("rejects a manifest with a different installer filename", async () => {
    const directory = path.join(temporaryDirectory, "build");
    await writeRelease(directory);
    const manifestPath = path.join(directory, "latest.yml");
    const manifest = await readFile(manifestPath, "utf8");
    await writeFile(manifestPath, manifest.replace(`path: ${installerName}`, "path: wrong-name.exe"));

    await expect(verifyReleaseAssets(directory, version)).rejects.toThrow("latest.yml does not match");
  });

  it("rejects an installer whose contents do not match the manifest SHA-512", async () => {
    const directory = path.join(temporaryDirectory, "build");
    await writeRelease(directory);
    await writeFile(path.join(directory, installerName), "modified installer bytes");

    await expect(verifyReleaseAssets(directory, version)).rejects.toThrow("latest.yml does not match");
  });

  it("rejects a manifest with the wrong version", async () => {
    const directory = path.join(temporaryDirectory, "build");
    await writeRelease(directory);
    const manifestPath = path.join(directory, "latest.yml");
    const manifest = await readFile(manifestPath, "utf8");
    await writeFile(manifestPath, manifest.replace(`version: ${version}`, "version: 1.0.3"));

    await expect(verifyReleaseAssets(directory, version)).rejects.toThrow("latest.yml does not match");
  });

  it("rejects missing required assets", async () => {
    const directory = path.join(temporaryDirectory, "build");
    await writeRelease(directory);
    await rm(path.join(directory, blockmapName));

    await expect(verifyReleaseAssets(directory, version)).rejects.toThrow(blockmapName);
  });

  it("rejects uploaded assets that differ from the validated build", async () => {
    const directory = path.join(temporaryDirectory, "build");
    const uploadedDirectory = path.join(temporaryDirectory, "uploaded");
    await writeRelease(directory);
    await writeRelease(uploadedDirectory, Buffer.from("different installer bytes"));

    await expect(verifyReleaseAssets(directory, version, uploadedDirectory))
      .rejects.toThrow(`Uploaded release asset does not match the validated build: ${installerName}`);
  });

  it("rejects an uploaded blockmap that differs from the build output", async () => {
    const directory = path.join(temporaryDirectory, "build");
    const uploadedDirectory = path.join(temporaryDirectory, "uploaded");
    await writeRelease(directory);
    await writeRelease(uploadedDirectory, Buffer.from("installer bytes"), Buffer.from("different blockmap"));

    await expect(verifyReleaseAssets(directory, version, uploadedDirectory))
      .rejects.toThrow(`Uploaded release asset does not match the validated build: ${blockmapName}`);
  });
});
