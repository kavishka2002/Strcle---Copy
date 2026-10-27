const { createHash } = require("node:crypto");
const { createReadStream } = require("node:fs");
const { readFile, stat } = require("node:fs/promises");
const path = require("node:path");

async function hashFile(filePath) {
  const sha512 = createHash("sha512");
  const sha256 = createHash("sha256");

  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", chunk => {
      sha512.update(chunk);
      sha256.update(chunk);
    });
    stream.once("error", reject);
    stream.once("end", resolve);
  });

  return {
    sha512: sha512.digest("base64"),
    sha256: sha256.digest("hex")
  };
}

function readScalar(manifest, key) {
  const match = manifest.match(new RegExp(`^${key}: (.+)$`, "m"));
  return match?.[1];
}

async function inspectReleaseAssets(directory, version) {
  const installerName = `LittlePaper-Setup-${version}.exe`;
  const blockmapName = `${installerName}.blockmap`;
  const installerPath = path.join(directory, installerName);
  const blockmapPath = path.join(directory, blockmapName);
  const manifestPath = path.join(directory, "latest.yml");

  for (const filePath of [installerPath, manifestPath, blockmapPath]) {
    const file = await stat(filePath);
    if (!file.isFile() || file.size === 0) {
      throw new Error(`Required release asset is missing or empty: ${path.basename(filePath)}`);
    }
  }

  const manifest = await readFile(manifestPath, "utf8");
  const fileEntry = manifest.match(
    /^files:\r?\n[ \t]*-[ \t]+url: ([^\r\n]+)\r?\n[ \t]+sha512: ([^\r\n]+)\r?\n[ \t]+size: (\d+)\r?\n/m
  );
  const manifestInstallerName = fileEntry?.[1]?.trim();
  const manifestHash = fileEntry?.[2]?.trim();
  const manifestSize = fileEntry?.[3];
  const installerStats = await stat(installerPath);
  const installerHashes = await hashFile(installerPath);

  if (readScalar(manifest, "version") !== version ||
      readScalar(manifest, "path") !== installerName ||
      manifestInstallerName !== installerName ||
      manifestHash !== installerHashes.sha512 ||
      readScalar(manifest, "sha512") !== installerHashes.sha512 ||
      manifestSize !== String(installerStats.size)) {
    throw new Error("latest.yml does not match the installer version, filename, size, and SHA-512.");
  }

  const blockmapStats = await stat(blockmapPath);
  const blockmapHashes = await hashFile(blockmapPath);

  return {
    [installerName]: { size: installerStats.size, sha256: installerHashes.sha256 },
    "latest.yml": {
      size: (await stat(manifestPath)).size,
      sha256: (await hashFile(manifestPath)).sha256
    },
    [blockmapName]: { size: blockmapStats.size, sha256: blockmapHashes.sha256 }
  };
}

async function verifyReleaseAssets(directory, version, compareDirectory) {
  const localAssets = await inspectReleaseAssets(directory, version);

  if (compareDirectory) {
    const uploadedAssets = await inspectReleaseAssets(compareDirectory, version);
    for (const [name, local] of Object.entries(localAssets)) {
      const uploaded = uploadedAssets[name];
      if (!uploaded || uploaded.size !== local.size || uploaded.sha256 !== local.sha256) {
        throw new Error(`Uploaded release asset does not match the validated build: ${name}`);
      }
    }
  }

  return localAssets;
}

module.exports = { verifyReleaseAssets };

if (require.main === module) {
  const [, , directory, version, compareDirectory] = process.argv;
  if (!directory || !version) {
    console.error("Usage: node scripts/verify-desktop-release.cjs <asset-directory> <version> [compare-directory]");
    process.exitCode = 2;
  } else {
    verifyReleaseAssets(directory, version, compareDirectory)
      .then(assets => {
        for (const [name, asset] of Object.entries(assets)) {
          console.log(`Verified ${name} (${asset.size} bytes).`);
        }
      })
      .catch(error => {
        console.error(error);
        process.exitCode = 1;
      });
  }
}
