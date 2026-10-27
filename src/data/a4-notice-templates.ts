export type NoticeOrientation = "portrait" | "landscape";
export type NoticeLanguage = "si" | "en" | "bi";
export type NoticeVisualStyle = "bold" | "property" | "minimal";

export interface NoticeFieldDefinition {
  key: string;
  labelEn: string;
  labelSi: string;
  placeholderEn: string;
  placeholderSi: string;
  optional?: boolean;
}

export interface NoticeCategory {
  id: string;
  nameEn: string;
  nameSi: string;
  fields: NoticeFieldDefinition[];
}

export interface NoticeTemplate {
  id: string;
  categoryId: string;
  name: string;
  language: NoticeLanguage;
  orientation: NoticeOrientation;
  style: NoticeVisualStyle;
  colors: { accent: string; ink: string; paper: string; soft: string };
  fields: NoticeFieldDefinition[];
  defaults: Record<string, string>;
}

export const noticePaperDimensionsMm = {
  portrait: { width: 210, height: 297 },
  landscape: { width: 297, height: 210 }
} as const;

const field = (
  key: string,
  labelEn: string,
  labelSi: string,
  placeholderEn: string,
  placeholderSi: string,
  optional = false
): NoticeFieldDefinition => ({ key, labelEn, labelSi, placeholderEn, placeholderSi, optional });

export const noticeCategories: NoticeCategory[] = [
  {
    id: "land-for-sale", nameEn: "Land for Sale", nameSi: "ඉඩම් විකිණීමට ඇත",
    fields: [
      field("location", "Location", "ස්ථානය", "Town, road, or nearby landmark", "නගරය, මාර්ගය හෝ ළඟම ඇති ස්ථානය"),
      field("size", "Land size", "ඉඩමේ ප්‍රමාණය", "e.g. 10 perches", "උදා: පර්චස් 10"),
      field("price", "Price", "මිල", "Optional asking price", "විකිණුම් මිල", true),
      field("description", "Details", "විස්තර", "Access, utilities, or other details", "පිවිසුම, පහසුකම් හෝ වෙනත් විස්තර", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Add a contact number", "දුරකථන අංකය ඇතුළත් කරන්න"),
      field("contact2", "Second telephone number", "දෙවන දුරකථන අංකය", "Optional second number", "දෙවන අංකය", true)
    ]
  },
  {
    id: "house-for-sale", nameEn: "House for Sale", nameSi: "නිවාස විකිණීමට ඇත",
    fields: [
      field("location", "Location", "ස්ථානය", "Town or nearby landmark", "නගරය හෝ ළඟම ඇති ස්ථානය"),
      field("rooms", "Bedrooms", "නිදන කාමර", "e.g. 3 bedrooms", "උදා: නිදන කාමර 3", true),
      field("description", "House details", "නිවසේ විස්තර", "Add a short description", "කෙටි විස්තරයක් එක් කරන්න", true),
      field("price", "Price", "මිල", "Optional asking price", "විකිණුම් මිල", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Add a contact number", "දුරකථන අංකය ඇතුළත් කරන්න"),
      field("contact2", "Second telephone number", "දෙවන දුරකථන අංකය", "Optional second number", "දෙවන අංකය", true)
    ]
  },
  {
    id: "house-room-rent", nameEn: "House / Room for Rent", nameSi: "නිවාස / කාමර කුලියට",
    fields: [
      field("location", "Location", "ස්ථානය", "Town or nearby landmark", "නගරය හෝ ළඟම ඇති ස්ථානය"),
      field("price", "Monthly rent", "මාසික කුලිය", "Optional monthly rent", "මාසික කුලිය", true),
      field("rooms", "Rooms", "කාමර", "Number or type of rooms", "කාමර ගණන හෝ වර්ගය", true),
      field("conditions", "Conditions", "කොන්දේසි", "Add any rental conditions", "කුලී කොන්දේසි ඇතුළත් කරන්න", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Add a contact number", "දුරකථන අංකය ඇතුළත් කරන්න"),
      field("contact2", "Second telephone number", "දෙවන දුරකථන අංකය", "Optional second number", "දෙවන අංකය", true)
    ]
  },
  {
    id: "property-wanted", nameEn: "Property Wanted", nameSi: "ඉඩම් / නිවාස සොයනු ලැබේ",
    fields: [
      field("location", "Preferred location", "අවශ්‍ය ප්‍රදේශය", "Town or preferred area", "නගරය හෝ අවශ්‍ය ප්‍රදේශය"),
      field("details", "Requirements", "අවශ්‍යතා", "Type, size, or budget", "වර්ගය, ප්‍රමාණය හෝ අයවැය", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Add a contact number", "දුරකථන අංකය ඇතුළත් කරන්න"),
      field("contact2", "Second telephone number", "දෙවන දුරකථන අංකය", "Optional second number", "දෙවන අංකය", true)
    ]
  },
  {
    id: "shop-for-rent", nameEn: "Shop for Rent", nameSi: "කඩ කාමර කුලියට",
    fields: [
      field("location", "Location", "ස්ථානය", "Town, road, or landmark", "නගරය, මාර්ගය හෝ ස්ථානය"),
      field("size", "Shop size", "කඩ කාමරයේ ප්‍රමාණය", "Optional floor area", "බිම් ප්‍රමාණය", true),
      field("price", "Monthly rent", "මාසික කුලිය", "Optional monthly rent", "මාසික කුලිය", true),
      field("conditions", "Details", "විස්තර", "Access, facilities, or conditions", "පිවිසුම, පහසුකම් හෝ කොන්දේසි", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Add a contact number", "දුරකථන අංකය ඇතුළත් කරන්න")
    ]
  },
  {
    id: "general-sale", nameEn: "General Sale", nameSi: "විකිණීමට ඇත",
    fields: [
      field("item", "Item name", "භාණ්ඩයේ නම", "What is for sale?", "විකිණීමට ඇති භාණ්ඩය"),
      field("price", "Price", "මිල", "Optional price", "මිල", true),
      field("description", "Details", "විස්තර", "Add a short description", "කෙටි විස්තරයක් එක් කරන්න", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Optional contact number", "දුරකථන අංකය", true)
    ]
  },
  {
    id: "second-hand-sale", nameEn: "Second-Hand Items for Sale", nameSi: "පාවිච්චි කළ භාණ්ඩ විකිණීමට",
    fields: [
      field("item", "Item name", "භාණ්ඩයේ නම", "What is for sale?", "විකිණීමට ඇති භාණ්ඩය"),
      field("condition", "Condition", "තත්ත්වය", "Describe the item's condition", "භාණ්ඩයේ තත්ත්වය සඳහන් කරන්න", true),
      field("price", "Price", "මිල", "Optional price", "මිල", true),
      field("description", "Details", "විස්තර", "Add a short description", "කෙටි විස්තරයක් එක් කරන්න", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Optional contact number", "දුරකථන අංකය", true)
    ]
  },
  {
    id: "jobs-available", nameEn: "Jobs Available", nameSi: "රැකියා ඇබෑර්තු",
    fields: [
      field("position", "Position", "තනතුර", "Job title", "තනතුර"),
      field("location", "Work location", "සේවා ස්ථානය", "Town or work location", "නගරය හෝ සේවා ස්ථානය", true),
      field("requirements", "Requirements", "සුදුසුකම්", "Skills or qualifications", "කුසලතා හෝ සුදුසුකම්", true),
      field("description", "How to apply", "අයදුම් කරන ආකාරය", "Add application details", "අයදුම් විස්තර එක් කරන්න", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Add a contact number", "දුරකථන අංකය ඇතුළත් කරන්න"),
      field("contact2", "Second telephone number", "දෙවන දුරකථන අංකය", "Optional second number", "දෙවන අංකය", true)
    ]
  },
  {
    id: "employees-wanted", nameEn: "Employees Wanted", nameSi: "සේවකයින් අවශ්‍යයි",
    fields: [
      field("position", "Position / role", "තනතුර / රැකියාව", "Who are you looking for?", "අවශ්‍ය සේවකයාගේ තනතුර"),
      field("location", "Work location", "සේවා ස්ථානය", "Town or work location", "නගරය හෝ සේවා ස්ථානය", true),
      field("requirements", "Requirements", "සුදුසුකම්", "Skills or experience", "කුසලතා හෝ පළපුරුද්ද", true),
      field("description", "How to apply", "අයදුම් කරන ආකාරය", "Add application details", "අයදුම් විස්තර එක් කරන්න", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Add a contact number", "දුරකථන අංකය ඇතුළත් කරන්න")
    ]
  },
  {
    id: "tuition-classes", nameEn: "Tuition Classes", nameSi: "උපකාරක පන්ති",
    fields: [
      field("subject", "Subject / class", "විෂය / පන්තිය", "Subject, grade, or class", "විෂය, ශ්‍රේණිය හෝ පන්තිය"),
      field("teacher", "Teacher", "ගුරුවරයා", "Teacher's name", "ගුරුවරයාගේ නම", true),
      field("location", "Class location", "පන්ති ස්ථානය", "Town or venue", "නගරය හෝ ස්ථානය", true),
      field("description", "Class details", "පන්ති විස්තර", "Add class times or details", "වේලාවන් හෝ විස්තර එක් කරන්න", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Add a contact number", "දුරකථන අංකය ඇතුළත් කරන්න")
    ]
  },
  {
    id: "lost-found", nameEn: "Lost and Found", nameSi: "නැතිවූ / හමුවූ භාණ්ඩ",
    fields: [
      field("item", "Item", "භාණ්ඩය", "Describe the lost or found item", "නැතිවූ හෝ හමුවූ භාණ්ඩය සඳහන් කරන්න"),
      field("description", "Details", "විස්තර", "Where and when it was lost or found", "නැතිවූ හෝ හමුවූ ස්ථානය හා වේලාව", true),
      field("location", "Location", "ස්ථානය", "Town or nearby landmark", "නගරය හෝ ළඟම ඇති ස්ථානය", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Add a contact number", "දුරකථන අංකය ඇතුළත් කරන්න")
    ]
  },
  {
    id: "general-notice", nameEn: "General Notices", nameSi: "පොදු දැන්වීම්",
    fields: [
      field("notice", "Notice text", "දැන්වීමේ විස්තර", "Type the main notice here", "දැන්වීමේ විස්තර මෙහි ලියන්න"),
      field("extra", "Additional information", "අමතර තොරතුරු", "Optional extra details", "අමතර විස්තර", true),
      field("contact", "Telephone number", "දුරකථන අංකය", "Optional contact number", "දුරකථන අංකය", true)
    ]
  }
];

const templateLooks: Array<{
  style: NoticeVisualStyle;
  name: string;
  language: NoticeLanguage;
  orientation: NoticeOrientation;
  colors: NoticeTemplate["colors"];
}> = [
  { style: "bold", name: "Bold Public Notice", language: "si", orientation: "portrait", colors: { accent: "#b42318", ink: "#201b1a", paper: "#ffffff", soft: "#fff1ee" } },
  { style: "property", name: "Professional Colour", language: "bi", orientation: "portrait", colors: { accent: "#145b76", ink: "#172d3a", paper: "#ffffff", soft: "#eaf4f6" } },
  { style: "minimal", name: "Minimal Ink Saver", language: "en", orientation: "landscape", colors: { accent: "#202020", ink: "#171717", paper: "#ffffff", soft: "#f4f4f4" } }
];

export const a4NoticeTemplates: NoticeTemplate[] = noticeCategories.flatMap(category =>
  templateLooks.map(look => {
    const heading = look.language === "si" ? category.nameSi
      : look.language === "bi" ? `${category.nameSi}\n${category.nameEn}`
        : category.nameEn;
    return {
      id: `${category.id}-${look.style}`,
      categoryId: category.id,
      name: look.name,
      language: look.language,
      orientation: look.orientation,
      style: look.style,
      colors: look.colors,
      fields: category.fields,
      defaults: { heading }
    };
  })
);

export const getNoticeCategory = (id: string) => noticeCategories.find(category => category.id === id);
export const getNoticeTemplate = (id: string) => a4NoticeTemplates.find(template => template.id === id);

export function getVisibleNoticeFields(
  fields: NoticeFieldDefinition[],
  values: Record<string, string>,
  hiddenFields: string[]
): NoticeFieldDefinition[] {
  return fields.filter(field => !hiddenFields.includes(field.key) && values[field.key]?.trim());
}
