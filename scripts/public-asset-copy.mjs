import path from "node:path";

export function shouldCopyPublicAsset(publicDirectory, assetPath) {
  const relativePath = path.relative(publicDirectory, assetPath);
  const segments = relativePath.split(path.sep);
  const isOlPaperPdf = segments[0]?.toLowerCase() === "papers"
    && /^\d{4} ol$/i.test(segments[1] ?? "")
    && /\.pdf$/i.test(segments.at(-1) ?? "");

  return !isOlPaperPdf;
}
