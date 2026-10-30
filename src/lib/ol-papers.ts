const subjectAliases: Record<string, string> = {
  agriculture: "Agriculture",
  "agriculture-food-technology": "Agriculture and Food Technology",
  "appreciation-of-english-literary-texts": "Appreciation of English Literary Texts",
  "appreciation-of-sinhala-literary-text": "Appreciation of Sinhala Literary Texts",
  "appreciation-of-sinhala-literary-texts": "Appreciation of Sinhala Literary Texts",
  "appreciation-of-tamil-literary-texts": "Appreciation of Tamil Literary Texts",
  "aquatic-bioresources-technology": "Aquatic Bioresources Technology",
  art: "Art",
  "art-craft": "Art and Crafts",
  "art-crafts": "Art and Crafts",
  "arts-crafts": "Art and Crafts",
  buddhism: "Buddhism",
  "business-accounting-studies": "Business and Accounting Studies",
  "business-studies": "Business Studies",
  catholicism: "Catholicism",
  civic: "Civic Education",
  "civic-education": "Civic Education",
  "communication-media-studies": "Communication and Media Studies",
  "dancing-bharata": "Bharatha Dancing",
  "dancing-oriental": "Oriental Dancing",
  "design-construction-technology": "Design and Construction Technology",
  "design-electrical-electronic-technology": "Design, Electrical and Electronic Technology",
  "design-mechanical-technology": "Design and Mechanical Technology",
  "design-technology": "Design and Technology",
  drama: "Drama and Theatre",
  "drama-and-theatre": "Drama and Theatre",
  "drama-theater": "Drama and Theatre",
  "drama-theatre": "Drama and Theatre",
  "electronic-writing-shorthand": "Electronic Writing and Shorthand",
  english: "English Language",
  "english-language": "English Language",
  "english-literature": "English Literature",
  "entrepreneurship-studies": "Entrepreneurship Studies",
  "fisheries-and-food-technology": "Fisheries and Food Technology",
  "fisheries-food-technology": "Fisheries and Food Technology",
  geography: "Geography",
  health: "Health and Physical Education",
  "health-physical-education": "Health and Physical Education",
  "health-science": "Health Science",
  history: "History",
  "home-economics": "Home Economics",
  "home-science": "Home Science",
  ict: "Information and Communication Technology",
  "information-communication-technology": "Information and Communication Technology",
  islam: "Islam",
  mathematics: "Mathematics",
  media: "Media",
  "music-oriental": "Oriental Music",
  "music-western": "Western Music",
  science: "Science",
  "second-language": "Tamil as a Second Language",
  "second-language-sinhala": "Sinhala as a Second Language",
  "second-language-tamil": "Tamil as a Second Language",
  sinhala: "Sinhala Language and Literature",
  "sinhala-language-literature": "Sinhala Language and Literature",
  "sinhala-literature": "Sinhala Language and Literature",
  "sinhala-second-language": "Sinhala as a Second Language",
  "social-studies": "Social Studies",
  tamil: "Tamil",
  "tamil-second-language": "Tamil as a Second Language",
  "western-music": "Western Music"
};

const mediumNames: Record<string, string> = {
  english: "English medium",
  sinhala: "Sinhala medium",
  tamil: "Tamil medium"
};

export type OlPaper = {
  id: string;
  exam: PaperExam;
  year: number;
  subject: string;
  medium: string;
  syllabus: string | null;
  fileName: string;
  url: string;
  driveFileId?: string;
  displayName?: string;
  fileType?: string;
};

export type PaperExam = "O/L" | "Grade 5 Scholarship";

export type OlPaperManifestRecord = {
  id: string;
  year: number;
  subject: string;
  language: string;
  displayName: string;
  originalFileName: string;
  driveFileId: string;
  fileType: string;
  syllabus: string | null;
};

export function createDriveOlPaper(record: OlPaperManifestRecord): OlPaper {
  const downloadUrl = new URL("https://drive.google.com/uc");
  downloadUrl.searchParams.set("export", "download");
  downloadUrl.searchParams.set("id", record.driveFileId);

  return {
    id: record.id,
    exam: "O/L",
    year: record.year,
    subject: record.subject,
    medium: record.language === "Not specified" ? "Medium not specified" : `${record.language} medium`,
    syllabus: record.syllabus,
    fileName: record.originalFileName,
    url: downloadUrl.href,
    driveFileId: record.driveFileId,
    displayName: record.displayName,
    fileType: record.fileType
  };
}

export function createOlPaper(folderName: string, fileName: string): OlPaper | null {
  const folderMatch = /^(\d{4}) ol$/i.exec(folderName);
  if (!folderMatch || !/\.pdf$/i.test(fileName)) return null;

  const year = Number(folderMatch[1]);
  if (year < 2007 || year > 2025) return null;

  let subjectSlug = fileName
    .replace(/\.pdf$/i, "")
    .replace(/\s*\(\d+\)$/, "")
    .replace(/^\d{4}-ol-/i, "")
    .replace(/-(?:new|old)-syllabus/gi, "");
  const media = [...subjectSlug.matchAll(/(?:^|-)(sinhala|english|tamil)(?=$|-)/gi)];
  const medium = media.at(-1)?.[1]?.toLowerCase() ?? "";
  subjectSlug = subjectSlug.replace(/(?:-(?:sinhala|english|tamil))+$/i, "");
  const normalizedSlug = subjectSlug.toLowerCase();
  const subject = subjectAliases[normalizedSlug]
    ?? normalizedSlug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  if (!subject) return null;
  const syllabus = /-new-syllabus/i.test(fileName)
    ? "New syllabus"
    : /-old-syllabus/i.test(fileName)
      ? "Old syllabus"
      : null;

  return {
    id: `${year}-${fileName}`,
    exam: "O/L",
    year,
    subject,
    medium: mediumNames[medium] ?? "Medium not specified",
    syllabus,
    fileName,
    url: `/papers/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`
  };
}

export function createScholarshipPaper(folderName: string, fileName: string): OlPaper | null {
  if (!/^(?:scolarship paper|scholarship paper|grade 5 scholarship)$/i.test(folderName) || !/\.pdf$/i.test(fileName)) {
    return null;
  }

  const yearMatch = /^(\d{4})-grade-5-scholarship-examination-(sinhala|english|tamil)\.pdf$/i.exec(fileName);
  if (!yearMatch) return null;

  const [, yearString, medium] = yearMatch;
  const year = Number(yearString);
  return {
    id: `${year}-${fileName}`,
    exam: "Grade 5 Scholarship",
    year,
    subject: "Grade 5 Scholarship",
    medium: mediumNames[medium.toLowerCase()] ?? "Medium not specified",
    syllabus: null,
    fileName,
    url: `/papers/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`
  };
}
