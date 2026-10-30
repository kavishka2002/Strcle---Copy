export type GradePaperAvailability = "available" | "incomplete";

export type GradePaperManifestRecord = {
  id: string;
  grade: number;
  subject: string;
  language: string;
  category: string;
  displayName: string;
  originalFileName: string;
  folderName: string;
  folderId: string;
  driveFileId: string;
  fileType: string;
  availability?: string;
};

export type GradePaper = GradePaperManifestRecord & {
  url: string;
};

export function createDriveGradePaper(record: GradePaperManifestRecord): GradePaper {
  const availability = record.availability ?? "available";
  if (availability !== "available" && availability !== "incomplete") {
    throw new Error(`Unknown grade paper availability status: ${availability}`);
  }

  const downloadUrl = new URL("https://drive.google.com/uc");
  downloadUrl.searchParams.set("export", "download");
  downloadUrl.searchParams.set("id", record.driveFileId);

  return {
    ...record,
    availability,
    url: downloadUrl.href
  };
}
