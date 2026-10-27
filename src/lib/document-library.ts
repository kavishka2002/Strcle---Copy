export const documentCategories = [
  { id: "general", en: "General Government and Request Letters", si: "රාජ්‍ය හා සාමාන්‍ය ඉල්ලීම් ලිපි" },
  { id: "gn-divisional", en: "Grama Niladhari and Divisional Secretariat Letters", si: "ග්‍රාම නිලධාරී හා ප්‍රාදේශීය ලේකම් කාර්යාල ලිපි" },
  { id: "certificates", en: "Personal Certificates and Official Forms", si: "පුද්ගලික සහතික හා නිල පෝරම" },
  { id: "school", en: "School and Education Letters", si: "පාසල් හා අධ්‍යාපන ලිපි" },
  { id: "career", en: "Employment and Career Documents", si: "රැකියා හා වෘත්තීය ලේඛන" },
  { id: "business", en: "Business and Financial Documents", si: "ව්‍යාපාරික හා මූල්‍ය ලේඛන" },
  { id: "property", en: "House, Land and Vehicle Documents", si: "නිවාස, ඉඩම් හා වාහන ලේඛන" },
  { id: "medical", en: "Medical and Insurance Letters", si: "වෛද්‍ය හා රක්ෂණ ලිපි" },
  { id: "public-services", en: "Other Public Service Documents", si: "වෙනත් මහජන සේවා ලේඛන" }
] as const;

export type DocumentField = {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
  type?: "text" | "date";
  validation?: "money";
};

export type OfficialFormLink = {
  label: string;
  agency: string;
  url: string;
  sourceUrl: string;
  verifiedOn: string;
  detail: string;
};

export type DocumentTemplate = {
  id: string;
  titleEn: string;
  titleSi: string;
  categoryId: typeof documentCategories[number]["id"];
  description: string;
  fields?: DocumentField[];
  content?: string;
  legalNotice?: string;
  officialLinks?: OfficialFormLink[];
};

export type SavedDocumentDraft = {
  id: string;
  templateId: string;
  title: string;
  values: Record<string, string>;
  content: string;
  updatedAt: number;
};

function localDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const date: DocumentField = { id: "date", label: "දිනය", placeholder: "දිනය", required: true, type: "date" };
const sender: DocumentField = { id: "sender", label: "ඔබගේ සම්පූර්ණ නම", placeholder: "උදා: කේ. ඒ. නිමල් පෙරේරා", required: true };
const address: DocumentField = { id: "address", label: "ඔබගේ ලිපිනය", placeholder: "නිවසේ අංකය, මාර්ගය, නගරය", required: true, multiline: true };
const recipient: DocumentField = { id: "recipient", label: "ලබන්නාගේ තනතුර / ආයතනය", placeholder: "උදා: ප්‍රාදේශීය ලේකම්තුමා", required: true };
const subject: DocumentField = { id: "subject", label: "ලිපියේ මාතෘකාව", placeholder: "අදාළ මාතෘකාව", required: true };
const reason: DocumentField = { id: "reason", label: "ඉල්ලීම / හේතුව", placeholder: "ඔබගේ ඉල්ලීම හෝ හේතුව පැහැදිලිව සඳහන් කරන්න", required: true, multiline: true };
const details: DocumentField = { id: "details", label: "අමතර විස්තර", placeholder: "අදාළ අංක, දිනයන් සහ වෙනත් සහායක විස්තර", multiline: true };
const phone: DocumentField = { id: "phone", label: "දුරකථන අංකය", placeholder: "07X XXX XXXX" };
const reference: DocumentField = { id: "reference", label: "අදාළ අංකය / විස්තරය", placeholder: "අයදුම්පත්, සහතික හෝ යොමු අංකය", required: true };

const letter = (id: string, titleEn: string, titleSi: string, categoryId: DocumentTemplate["categoryId"], description: string, request: string, extraFields: DocumentField[] = [], legalNotice?: string): DocumentTemplate => {
  const fields = [...new Map([date, sender, address, recipient, subject, reason, details, phone, ...extraFields].map(field => [field.id, field])).values()];
  return {
    id, titleEn, titleSi, categoryId, description,
    fields,
    content: "{{date}}\n\n{{recipient}}\n\nමහත්මයාණෙනි / මහත්මියණි,\n\n{{subject}}\n\nමා ඉහත සඳහන් කරුණ සම්බන්ධයෙන් මෙම ලිපිය ඉදිරිපත් කරමි. {{reason}}\n\n{{details}}\n\n{{request}}\n\nමේ සඳහා අවශ්‍ය සහය ලබාදෙන මෙන් කාරුණිකව ඉල්ලා සිටිමි.\n\nස්තුතියි.\n\nමෙයට විශ්වාසී,\n\n\n........................................\n{{sender}}\n{{address}}\n{{phone}}".replace("{{request}}", request),
    legalNotice
  };
};

const officialLinks: OfficialFormLink[] = [
  {
    label: "Passport application form (K 35 A) and instructions",
    agency: "Department of Immigration and Emigration",
    url: "https://www.immigration.gov.lk/content/files/applications/passport_application.pdf",
    sourceUrl: "https://www.immigration.gov.lk/pages_e.php?id=7",
    verifiedOn: "2026-10-24",
    detail: "The department's passport information page identifies this official application form. Confirm current instructions and requirements before submission."
  },
  {
    label: "National Identity Card services and forms",
    agency: "Department for Registration of Persons",
    url: "https://drp.gov.lk/",
    sourceUrl: "https://drp.gov.lk/",
    verifiedOn: "2026-10-24",
    detail: "Official department website. Follow its current identity-card services and forms links; this library does not reproduce or modify NIC forms."
  },
  {
    label: "Birth, marriage and death registration services",
    agency: "Registrar General's Department",
    url: "https://rgd.gov.lk/",
    sourceUrl: "https://rgd.gov.lk/",
    verifiedOn: "2026-10-24",
    detail: "Official Registrar General's Department website. Use its current certificate and registration service links."
  },
  {
    label: "Sri Lanka Government Services Directory",
    agency: "Government Information Centre",
    url: "https://www.gov.lk/",
    sourceUrl: "https://www.gov.lk/",
    verifiedOn: "2026-10-24",
    detail: "Official government services portal with citizen-registration, education, employment and other public-service directories."
  }
];

export const documentTemplates: DocumentTemplate[] = [
  letter("general-request", "General Request Letter", "සාමාන්‍ය ඉල්ලීම් ලිපිය", "general", "රාජ්‍ය හෝ වෙනත් ආයතනයකට ඉල්ලීමක් ඉදිරිපත් කිරීමට.", "අදාළ කටයුත්ත සිදුකර ගැනීම සඳහා ඔබගේ කාරුණික අවධානය හා සහය අපේක්ෂා කරමි.", [phone]),
  letter("grama-niladhari", "Letter to Grama Niladhari", "ග්‍රාම නිලධාරී වෙත ලිපිය", "gn-divisional", "ග්‍රාම නිලධාරීවරයා වෙත ගෞරවාන්විත ඉල්ලීමක්.", "අදාළ කරුණ පිළිබඳව පරීක්ෂා කර අවශ්‍ය නිර්දේශය හෝ උපදෙස් ලබාදෙන මෙන් ඉල්ලා සිටිමි.", [phone]),
  letter("divisional-secretariat", "Letter to Divisional Secretariat", "ප්‍රාදේශීය ලේකම් කාර්යාලය වෙත ලිපිය", "gn-divisional", "ප්‍රාදේශීය ලේකම් කාර්යාලයට නිල ඉල්ලීමක්.", "අදාළ කරුණ සලකා බලා නියමිත ක්‍රියාමාර්ග ගැනීමට කාරුණික වන මෙන් ඉල්ලා සිටිමි.", [phone]),
  letter("residence-confirmation", "Residence Confirmation Request", "පදිංචිය තහවුරු කිරීමේ ඉල්ලීම", "gn-divisional", "පදිංචිය පිළිබඳ තහවුරු කිරීමක් ඉල්ලා සිටීමට.", "මා ඉහත ලිපිනයේ පදිංචි බව සලකා බලා, අවශ්‍ය පදිංචි තහවුරු කිරීම ලබාදෙන මෙන් ඉල්ලා සිටිමි.", [phone]),
  letter("income-certificate", "Income Certificate Request", "ආදායම් සහතිකයක් ඉල්ලීම", "gn-divisional", "ආදායම් තොරතුරු තහවුරු කිරීමක් ඉල්ලා සිටීමට.", "මගේ පවුලේ ආදායම් තත්ත්වය සලකා බලා, අදාළ කටයුත්ත සඳහා අවශ්‍ය ආදායම් තහවුරු කිරීම ලබාදීමට කාරුණික වන මෙන් ඉල්ලා සිටිමි.", [phone]),
  letter("certificate-copy", "Certificate Copy Request", "සහතිකයක පිටපතක් ඉල්ලීම", "certificates", "පවතින සහතිකයක පිටපතක් ලබාගැනීමට; මෙය සහතිකයක් නොවේ.", "අදාළ ලේඛන පරීක්ෂා කර නියමිත ක්‍රමවේදය අනුව සහතික කළ පිටපතක් ලබාගැනීමට අවශ්‍ය පියවර දැනුම් දෙන මෙන් ඉල්ලා සිටිමි.", [reference, details, phone]),
  letter("complaint", "Complaint Letter", "පැමිණිලි ලිපිය", "general", "සිදුවීමක් හෝ සේවා ගැටලුවක් නිල වශයෙන් දැනුම් දීමට.", "පහත සඳහන් කරුණ පිළිබඳව විධිමත් පැමිණිල්ලක් ඉදිරිපත් කරමි. කරුණාකර මෙය පරීක්ෂා කර සාධාරණ විසඳුමක් ලබාදෙන ලෙස ඉල්ලා සිටිමි.", [details, phone]),
  letter("permission-request", "Permission Request Letter", "අවසර ඉල්ලීමේ ලිපිය", "general", "කාර්යයක් හෝ වැඩසටහනක් සඳහා අවසර ඉල්ලීමට.", "පහත සඳහන් කටයුත්ත සඳහා අදාළ දිනයේ අවසර ලබාදෙන මෙන් කාරුණිකව ඉල්ලා සිටිමි.", [details, phone]),
  letter("authorization-letter", "Authorization Letter", "බලය පැවරීමේ ලිපිය", "certificates", "නිශ්චිත කටයුත්තක් වෙනත් අයෙකුට පැවරීමට.", "මා වෙනුවෙන් පහත කටයුත්ත ඉටු කිරීමට {{authorizedPerson}} මහතා / මහත්මියට අවසර ලබාදෙමි.", [{ id: "authorizedPerson", label: "බලය පවරන පුද්ගලයාගේ නම", placeholder: "සම්පූර්ණ නම", required: true }, reference, details, phone]),
  {
    id: "affidavit-draft", titleEn: "Affidavit Draft", titleSi: "දිවුරුම් ප්‍රකාශ කෙටුම්පත", categoryId: "certificates",
    description: "අදාළ තොරතුරු සකස් කර නීතිඥයෙකු / බලයලත් නිලධාරියෙකු සමඟ පරීක්ෂා කිරීම සඳහා කෙටුම්පතක්.",
    fields: [date, sender, address, { id: "identity", label: "ජාතික හැඳුනුම්පත් අංකය", placeholder: "අංකය", required: true }, { id: "declaration", label: "ප්‍රකාශය", placeholder: "තහවුරු කරන කරුණු පැහැදිලිව ලියන්න", required: true, multiline: true }],
    content: "දිවුරුම් ප්‍රකාශය — කෙටුම්පත\n\n{{date}}\n\nමම, {{sender}}, ජාතික හැඳුනුම්පත් අංක {{identity}} දරන, {{address}} හි පදිංචි අයෙකු වන අතර, පහත සඳහන් කරුණු සත්‍ය හා නිවැරදි බව ප්‍රකාශ කරමි:\n\n{{declaration}}\n\nඉහත කරුණු මාගේ දැනුම හා විශ්වාසය අනුව සත්‍ය බව මෙයින් ප්‍රකාශ කරමි.\n\n\n........................................\nප්‍රකාශකයාගේ අත්සන\n\nසාක්ෂිකරු / දිවුරුම් කොමසාරිස් / නොතාරිස් ඉදිරියේ අත්සන් කළ යුතුය.",
    legalNotice: "මෙය නීතිමය දිවුරුම් ප්‍රකාශයක් නොව කෙටුම්පතක් පමණි. අත්සන් කිරීමට පෙර නීතිඥයෙකුගෙන් හෝ බලයලත් දිවුරුම් කොමසාරිස්වරයෙකුගෙන් උපදෙස් ලබාගන්න. සාක්ෂිකරුවන්, නොතාරිස් කිරීම හෝ වෙනත් විධිමත් අවශ්‍යතා අදාළ විය හැක."
  },
  letter("school-leave", "School Leave Request", "පාසල් නිවාඩු ඉල්ලීම", "school", "ශිෂ්‍යයෙකු වෙනුවෙන් පාසලට නිවාඩු ඉල්ලීමක්.", "මගේ දරුවාට ඉහත හේතුව මත සඳහන් කාලය සඳහා පාසලෙන් නිවාඩු ලබාදෙන මෙන් ඉල්ලා සිටිමි.", [{ id: "studentName", label: "ශිෂ්‍යයාගේ නම", placeholder: "සම්පූර්ණ නම", required: true }, { id: "grade", label: "ශ්‍රේණිය / පන්තිය", placeholder: "උදා: 7-A", required: true }, { id: "period", label: "නිවාඩු කාලය", placeholder: "ආරම්භක සහ අවසන් දිනය", required: true }, phone]),
  letter("principal-letter", "Letter to Principal", "විදුහල්පතිතුමාට ලිපිය", "school", "පාසල් කටයුත්තක් පිළිබඳ විදුහල්පතිවරයාට යොමු කරන ලිපිය.", "මෙම කරුණ සලකා බලා සුදුසු උපදෙස් සහ අනුමැතිය ලබාදෙන මෙන් ගෞරවයෙන් ඉල්ලා සිටිමි.", [{ id: "studentName", label: "ශිෂ්‍යයාගේ නම", placeholder: "සම්පූර්ණ නම" }, { id: "grade", label: "ශ්‍රේණිය / පන්තිය", placeholder: "ශ්‍රේණිය" }, details, phone]),
  letter("school-admission", "School Admission Request", "පාසලට ඇතුළත් කරගැනීමේ ඉල්ලීම", "school", "පාසලට ඇතුළත් කරගැනීම සම්බන්ධයෙන් කරන ඉල්ලීම.", "මගේ දරුවා ඉහත පාසලට ඇතුළත් කරගැනීම සඳහා සලකා බලන මෙන් කාරුණිකව ඉල්ලා සිටිමි. අවශ්‍ය ලේඛන ඉදිරිපත් කිරීමට සූදානම්ය.", [{ id: "studentName", label: "දරුවාගේ සම්පූර්ණ නම", placeholder: "සම්පූර්ණ නම", required: true }, { id: "birthDate", label: "උපන් දිනය", placeholder: "උපන් දිනය", type: "date", required: true }, { id: "grade", label: "ඉල්ලන ශ්‍රේණිය", placeholder: "ශ්‍රේණිය", required: true }, phone]),
  letter("scholarship-request", "Scholarship Request Letter", "ශිෂ්‍යත්ව සහාය ඉල්ලීම", "school", "අධ්‍යාපනික ශිෂ්‍යත්වයක් හෝ ආධාරයක් සඳහා ඉල්ලීම.", "අධ්‍යාපනික කටයුතු අඛණ්ඩව කරගෙන යාම සඳහා ලබාදිය හැකි ශිෂ්‍යත්ව හෝ මූල්‍ය සහාය පිළිබඳව සලකා බලන මෙන් ඉල්ලා සිටිමි.", [{ id: "studentName", label: "ශිෂ්‍යයාගේ නම", placeholder: "සම්පූර්ණ නම", required: true }, { id: "grade", label: "ශ්‍රේණිය / පාඨමාලාව", placeholder: "ශ්‍රේණිය හෝ පාඨමාලාව", required: true }, details, phone]),
  letter("exam-certificate-copy", "Examination Certificate Copy Request", "විභාග සහතික පිටපතක් ඉල්ලීම", "school", "විභාග සහතික පිටපතක් ලබාගැනීම සඳහා කරන ඉල්ලීම.", "අදාළ විභාග වාර්තා පරීක්ෂා කර සහතික කළ පිටපතක් ලබාගැනීමේ ක්‍රමවේදය සහ අවශ්‍ය ගාස්තු දැනුම් දෙන මෙන් ඉල්ලා සිටිමි.", [{ id: "candidateName", label: "අයදුම්කරුගේ නම", placeholder: "විභාගයට පෙනී සිටි නම", required: true }, { id: "examDetails", label: "විභාගය / වර්ෂය / අංකය", placeholder: "විභාග විස්තර", required: true }, details, phone]),
  letter("job-application", "Job Application Letter", "රැකියා අයදුම් ලිපිය", "career", "රැකියා පුරප්පාඩුවක් සඳහා අයදුම් කිරීමට.", "ඔබගේ ආයතනයේ {{position}} තනතුර සඳහා මාගේ අයදුම්පත සලකා බලන මෙන් ඉල්ලා සිටිමි. අදාළ සුදුසුකම් හා විස්තර ඇමුණුම් කර ඇත.", [{ id: "position", label: "අයදුම් කරන තනතුර", placeholder: "තනතුර", required: true }, { id: "qualifications", label: "සුදුසුකම් / පළපුරුද්ද", placeholder: "අදාළ සුදුසුකම්", required: true, multiline: true }, { id: "phone", label: "දුරකථන අංකය", placeholder: "07X XXX XXXX", required: true }, { id: "email", label: "විද්‍යුත් තැපෑල", placeholder: "name@example.com" }]),
  letter("cover-letter", "Cover Letter", "රැකියා ආවරණ ලිපිය", "career", "CV එකක් සමඟ ඉදිරිපත් කරන රැකියා ආවරණ ලිපිය.", "මාගේ පළපුරුද්ද සහ කුසලතා {{position}} තනතුරේ අවශ්‍යතා සමඟ ගැළපෙන බැවින් මාගේ අයදුම්පත සලකා බලන මෙන් ඉල්ලා සිටිමි.", [{ id: "position", label: "අයදුම් කරන තනතුර", placeholder: "තනතුර", required: true }, { id: "qualifications", label: "අදාළ කුසලතා / පළපුරුද්ද", placeholder: "කෙටියෙන් සඳහන් කරන්න", required: true, multiline: true }, phone]),
  letter("resignation", "Resignation Letter", "ඉල්ලා අස්වීමේ ලිපිය", "career", "රැකියාවෙන් ඉල්ලා අස්වීම දැනුම් දීමට.", "මා {{lastDay}} දින සිට ක්‍රියාත්මක වන පරිදි {{position}} තනතුරෙන් ඉල්ලා අස්වන බව මෙයින් දැනුම් දෙමි. භාරදීමේ කටයුතු නිසි පරිදි අවසන් කිරීමට සහය වන්නෙමි.", [{ id: "position", label: "තනතුර", placeholder: "තනතුර", required: true }, { id: "lastDay", label: "අවසන් සේවා දිනය", placeholder: "දිනය", required: true }, details]),
  letter("service-certificate", "Service Certificate Request", "සේවා සහතිකයක් ඉල්ලීම", "career", "සේවා කාලය තහවුරු කරන සහතිකයක් ඉල්ලීමට.", "මාගේ සේවා කාලය සහ තනතුර ඇතුළත් සේවා සහතිකයක් නිකුත් කිරීමේ ක්‍රමවේදය දැනුම් දෙන මෙන් ඉල්ලා සිටිමි.", [{ id: "position", label: "දරන ලද තනතුර", placeholder: "තනතුර", required: true }, { id: "period", label: "සේවා කාලය", placeholder: "ආරම්භක සහ අවසන් දිනය", required: true }, phone]),
  letter("leave-request", "Leave Request Letter", "නිවාඩු ඉල්ලීමේ ලිපිය", "career", "සේවා ස්ථානයෙන් නිවාඩු ඉල්ලීමට.", "ඉහත හේතුව මත {{period}} කාලය සඳහා නිවාඩු අනුමත කරන මෙන් කාරුණිකව ඉල්ලා සිටිමි.", [{ id: "position", label: "තනතුර / අංශය", placeholder: "තනතුර හෝ අංශය" }, { id: "period", label: "නිවාඩු කාලය", placeholder: "දිනය / කාලය", required: true }, phone]),
  {
    id: "cv-resume", titleEn: "CV / Resume", titleSi: "ජීව දත්ත පත්‍රය / CV", categoryId: "career",
    description: "මූලික ජීව දත්ත පත්‍රයක් සකස් කරන්න. සවිස්තරාත්මක නිර්මාණ සඳහා CV Builder භාවිතා කරන්න.",
    fields: [sender, address, { id: "phone", label: "දුරකථන අංකය", placeholder: "07X XXX XXXX", required: true }, { id: "email", label: "විද්‍යුත් තැපෑල", placeholder: "name@example.com" }, { id: "profile", label: "වෘත්තීය අරමුණ / හැඳින්වීම", placeholder: "කෙටි හැඳින්වීම", multiline: true }, { id: "education", label: "අධ්‍යාපන සුදුසුකම්", placeholder: "ආයතනය, සුදුසුකම, වර්ෂය", required: true, multiline: true }, { id: "experience", label: "සේවා පළපුරුද්ද", placeholder: "තනතුර, ආයතනය, වගකීම්", multiline: true }, { id: "skills", label: "කුසලතා", placeholder: "ප්‍රධාන කුසලතා", multiline: true }, { id: "references", label: "නිර්දේශකයන්", placeholder: "නම සහ සම්බන්ධ කරගත හැකි විස්තර", multiline: true }],
    content: "ජීව දත්ත පත්‍රය\n\n{{sender}}\n{{address}}\nදුරකථන: {{phone}}    විද්‍යුත් තැපෑල: {{email}}\n\nවෘත්තීය හැඳින්වීම\n{{profile}}\n\nඅධ්‍යාපන සුදුසුකම්\n{{education}}\n\nසේවා පළපුරුද්ද\n{{experience}}\n\nකුසලතා\n{{skills}}\n\nනිර්දේශකයන්\n{{references}}"
  },
  {
    id: "invoice", titleEn: "Invoice", titleSi: "ඉන්වොයිසිය / බිල්පත", categoryId: "business", description: "ව්‍යාපාරික ගනුදෙනුවක් සඳහා අයිතම හා මුදල් විස්තර ඇතුළත් කරන්න.",
    fields: [date, { id: "business", label: "ව්‍යාපාරයේ නම සහ ලිපිනය", placeholder: "ව්‍යාපාර විස්තර", required: true, multiline: true }, { id: "invoiceNo", label: "ඉන්වොයිස් අංකය", placeholder: "INV-001", required: true }, { id: "customer", label: "පාරිභෝගිකයා", placeholder: "නම / ලිපිනය", required: true, multiline: true }, { id: "items", label: "අයිතම / ප්‍රමාණය / ඒකක මිල", placeholder: "අයිතමය — ප්‍රමාණය — මිල\nඑක් පේළියකට එක් අයිතමයක්", required: true, multiline: true }, { id: "total", label: "මුළු මුදල (රු.)", placeholder: "0.00", required: true, validation: "money" }, details],
    content: "ඉන්වොයිසිය\n\n{{business}}\n\nඉන්වොයිස් අංකය: {{invoiceNo}}\nදිනය: {{date}}\n\nපාරිභෝගිකයා:\n{{customer}}\n\nඅයිතම / ප්‍රමාණය / ඒකක මිල\n{{items}}\n\nමුළු මුදල: රු. {{total}}\n\nසටහන්: {{details}}\n\n\n........................................\nඅත්සන"
  },
  {
    id: "quotation", titleEn: "Quotation", titleSi: "මිල ගණන් ඉදිරිපත් කිරීම", categoryId: "business", description: "භාණ්ඩ හෝ සේවා සඳහා මිල ගණන් යෝජනාවක්.",
    fields: [date, { id: "business", label: "ව්‍යාපාරයේ නම සහ ලිපිනය", placeholder: "ව්‍යාපාර විස්තර", required: true, multiline: true }, { id: "quoteNo", label: "යොමු අංකය", placeholder: "QT-001", required: true }, { id: "customer", label: "පාරිභෝගිකයා", placeholder: "නම / ආයතනය", required: true }, { id: "items", label: "අයිතම / විස්තර / මිල", placeholder: "එක් අයිතමයක් එක් පේළියකට", required: true, multiline: true }, { id: "total", label: "ඇස්තමේන්තුගත මුළු මුදල (රු.)", placeholder: "0.00", required: true, validation: "money" }, { id: "validity", label: "මිල ගණන් වලංගු කාලය", placeholder: "උදා: දින 14" }, details],
    content: "මිල ගණන් ඉදිරිපත් කිරීම\n\n{{business}}\n\nයොමු අංකය: {{quoteNo}}\nදිනය: {{date}}\n\nවෙත: {{customer}}\n\nඔබගේ අවශ්‍යතාව අනුව පහත මිල ගණන් ඉදිරිපත් කරමි.\n\nඅයිතම / විස්තර / මිල\n{{items}}\n\nඇස්තමේන්තුගත මුළු මුදල: රු. {{total}}\nමිල ගණන් වලංගු කාලය: {{validity}}\n\nසටහන්: {{details}}\n\n\n........................................\nඅත්සන / මුද්‍රාව"
  },
  {
    id: "receipt", titleEn: "Receipt", titleSi: "මුදල් ලදුපත", categoryId: "business", description: "ලැබුණු ගෙවීමක් වාර්තා කරන්න; අදාළ ගනුදෙනු විස්තර පරීක්ෂා කරන්න.",
    fields: [date, { id: "business", label: "මුදල් ලැබූ පුද්ගලයා / ආයතනය", placeholder: "නම / ලිපිනය", required: true, multiline: true }, { id: "receiptNo", label: "ලදුපත් අංකය", placeholder: "RC-001", required: true }, { id: "payer", label: "ගෙවූ පුද්ගලයා", placeholder: "නම", required: true }, { id: "amount", label: "ලැබුණු මුදල (රු.)", placeholder: "0.00", required: true, validation: "money" }, { id: "purpose", label: "ගෙවීමේ අරමුණ", placeholder: "ගෙවීමට අදාළ විස්තර", required: true }, { id: "paymentMethod", label: "ගෙවීමේ ක්‍රමය", placeholder: "මුදල් / බැංකු හුවමාරුව / වෙනත්" }],
    content: "මුදල් ලදුපත\n\nලදුපත් අංකය: {{receiptNo}}\nදිනය: {{date}}\n\n{{business}}\n\n{{payer}} වෙතින් රු. {{amount}} ක මුදලක් {{purpose}} සඳහා ලැබුණු බව මෙයින් තහවුරු කරමි.\n\nගෙවීමේ ක්‍රමය: {{paymentMethod}}\n\n\n........................................\nමුදල් ලැබූ පුද්ගලයාගේ අත්සන"
  },
  {
    id: "payment-voucher", titleEn: "Payment Voucher", titleSi: "ගෙවීම් වවුචරය", categoryId: "business", description: "ගෙවීමක අභ්‍යන්තර වාර්තාවක් සකස් කරන්න.",
    fields: [date, { id: "business", label: "ව්‍යාපාරයේ නම", placeholder: "ව්‍යාපාරය", required: true }, { id: "voucherNo", label: "වවුචර් අංකය", placeholder: "PV-001", required: true }, { id: "payee", label: "ගෙවීම ලබන්නා", placeholder: "නම", required: true }, { id: "amount", label: "ගෙවූ මුදල (රු.)", placeholder: "0.00", required: true, validation: "money" }, { id: "purpose", label: "ගෙවීමේ හේතුව", placeholder: "විස්තර", required: true }, { id: "paymentMethod", label: "ගෙවීමේ ක්‍රමය / යොමු අංකය", placeholder: "මුදල් / බැංකු හුවමාරුව" }],
    content: "ගෙවීම් වවුචරය\n\nව්‍යාපාරය: {{business}}\nවවුචර් අංකය: {{voucherNo}}\nදිනය: {{date}}\n\nගෙවීම ලබන්නා: {{payee}}\nගෙවූ මුදල: රු. {{amount}}\nගෙවීමේ හේතුව: {{purpose}}\nගෙවීමේ ක්‍රමය / යොමු අංකය: {{paymentMethod}}\n\n\n....................................       ....................................\nසකස් කළේ                              අනුමත කළේ\n\n\n........................................\nමුදල් ලබාගත් බවට අත්සන"
  },
  {
    id: "vehicle-sale-draft", titleEn: "Vehicle Sale Agreement Draft", titleSi: "වාහන විකිණීමේ ගිවිසුම් කෙටුම්පත", categoryId: "property", description: "වාහන ගනුදෙනුවක මූලික කොන්දේසි සටහන් කිරීමට පමණි.",
    fields: [date, { id: "seller", label: "විකුණුම්කරුගේ නම / ලිපිනය", placeholder: "විස්තර", required: true, multiline: true }, { id: "buyer", label: "ගැනුම්කරුගේ නම / ලිපිනය", placeholder: "විස්තර", required: true, multiline: true }, { id: "vehicle", label: "වාහනයේ විස්තර / ලියාපදිංචි අංකය", placeholder: "වර්ගය, මාදිලිය, අංකය", required: true, multiline: true }, { id: "price", label: "එකඟ වූ මිල (රු.)", placeholder: "0.00", required: true }, { id: "terms", label: "කොන්දේසි / ගෙවීම් විස්තර", placeholder: "පාර්ශ්ව එකඟ වූ කරුණු", required: true, multiline: true }],
    content: "වාහන විකිණීමේ ගිවිසුම — කෙටුම්පත\n\nදිනය: {{date}}\n\nවිකුණුම්කරු:\n{{seller}}\n\nගැනුම්කරු:\n{{buyer}}\n\nවාහනයේ විස්තර:\n{{vehicle}}\n\nඑකඟ වූ මිල: රු. {{price}}\n\nපාර්ශ්වයන් එකඟ වූ කොන්දේසි:\n{{terms}}\n\nවිකුණුම්කරුගේ අත්සන: ............................    දිනය: ................\n\nගැනුම්කරුගේ අත්සන: ...............................    දිනය: ................\n\nසාක්ෂිකරු 1: ........................................    සාක්ෂිකරු 2: ........................................",
    legalNotice: "මෙය නීතිමය ගිවිසුමක් නොව මූලික කෙටුම්පතකි. අත්සන් කිරීමට පෙර නීතිඥ උපදෙස් සහ අදාළ වාහන පැවරීමේ නීතිමය ක්‍රියාපටිපාටි පරීක්ෂා කරන්න. සාක්ෂිකරුවන්, ලේඛන සහ සහතික කිරීමේ අවශ්‍යතා අදාළ විය හැක."
  },
  {
    id: "house-rental-draft", titleEn: "House Rental Agreement Draft", titleSi: "නිවාස කුලී ගිවිසුම් කෙටුම්පත", categoryId: "property", description: "නිවාස කුලියට දීමේ මූලික කොන්දේසි සටහන් කිරීමට පමණි.",
    fields: [date, { id: "landlord", label: "හිමිකරුගේ නම / ලිපිනය", placeholder: "විස්තර", required: true, multiline: true }, { id: "tenant", label: "කුලීකරුගේ නම / ලිපිනය", placeholder: "විස්තර", required: true, multiline: true }, { id: "property", label: "දේපළ ලිපිනය / විස්තර", placeholder: "සම්පූර්ණ ලිපිනය", required: true, multiline: true }, { id: "rent", label: "මාසික කුලිය සහ තැන්පතුව (රු.)", placeholder: "විස්තර", required: true }, { id: "period", label: "කාලසීමාව", placeholder: "ආරම්භක සහ අවසන් දිනය", required: true }, { id: "terms", label: "අනෙකුත් එකඟතා", placeholder: "දෙපාර්ශ්වය එකඟ වූ කොන්දේසි", multiline: true }],
    content: "නිවාස කුලී ගිවිසුම — කෙටුම්පත\n\nදිනය: {{date}}\n\nහිමිකරු:\n{{landlord}}\n\nකුලීකරු:\n{{tenant}}\n\nදේපළ:\n{{property}}\n\nමාසික කුලිය සහ තැන්පතුව: රු. {{rent}}\nගිවිසුම් කාලසීමාව: {{period}}\n\nඅනෙකුත් එකඟතා:\n{{terms}}\n\nහිමිකරුගේ අත්සන: .................................    දිනය: ................\n\nකුලීකරුගේ අත්සන: ................................    දිනය: ................\n\nසාක්ෂිකරු 1: ........................................    සාක්ෂිකරු 2: ........................................",
    legalNotice: "මෙය නීතිමය ගිවිසුමක් නොව මූලික කෙටුම්පතකි. භාවිතයට පෙර නීතිඥ උපදෙස් සහ අදාළ කුලී / දේපළ නීති පරීක්ෂා කරන්න. සාක්ෂිකරුවන්, මුද්දර ගාස්තු, නොතාරිස් කිරීම හෝ වෙනත් විධිමත් අවශ්‍යතා අදාළ විය හැක."
  },
  letter("medical-record-copy", "Medical Record Copy Request", "වෛද්‍ය වාර්තාවක පිටපතක් ඉල්ලීම", "medical", "රෝහලකින් හෝ වෛද්‍ය ආයතනයකින් වාර්තා පිටපතක් ඉල්ලීමට.", "අදාළ රෝගී වාර්තා හඳුනාගෙන නියමිත ක්‍රමවේදය සහ අනන්‍යතා තහවුරු කිරීම් අනුව පිටපතක් ලබාගැනීමට අවශ්‍ය උපදෙස් දෙන මෙන් ඉල්ලා සිටිමි.", [{ id: "patient", label: "රෝගියාගේ නම", placeholder: "සම්පූර්ණ නම", required: true }, { id: "recordDetails", label: "රෝහල් අංකය / ප්‍රතිකාර දිනය", placeholder: "අදාළ විස්තර", required: true }, { id: "relationship", label: "අයදුම්කරුගේ සම්බන්ධතාව", placeholder: "තමන් / භාරකරු / බලයලත් නියෝජිත" }, phone]),
  letter("insurance-claim", "Insurance Claim Letter", "රක්ෂණ වන්දි ඉල්ලීමේ ලිපිය", "medical", "රක්ෂණ සමාගමකට වන්දි ඉල්ලීමක් ඉදිරිපත් කිරීමට.", "අදාළ රක්ෂණ ආවරණය යටතේ මෙම සිදුවීම සලකා බලා හිමිකම් ඉල්ලීමේ ක්‍රමවේදය සහ අවශ්‍ය ලේඛන දැනුම් දෙන මෙන් ඉල්ලා සිටිමි.", [{ id: "policyNo", label: "රක්ෂණ ඔප්පු අංකය", placeholder: "අංකය", required: true }, { id: "incident", label: "සිදුවීමේ දිනය සහ විස්තර", placeholder: "දිනය සහ සිදුවීම", required: true, multiline: true }, { id: "claimAmount", label: "ඉල්ලන මුදල (අදාළ නම්)", placeholder: "රු." }, { id: "phone", label: "දුරකථන අංකය", placeholder: "07X XXX XXXX", required: true }, details]),
  {
    id: "official-forms-directory", titleEn: "Official Passport and NIC Forms Directory", titleSi: "විදේශ ගමන් බලපත්‍ර හා ජාතික හැඳුනුම්පත් නිල පෝරම",
    categoryId: "public-services", description: "රජයේ නිල ආයතන වෙත සෘජු සබැඳි. මෙම මෙවලම නිල පෝරම නිර්මාණය හෝ වෙනස් කිරීම සිදු නොකරයි.",
    officialLinks
  }
];

export function categoryForDocument(categoryId: DocumentTemplate["categoryId"]) {
  return documentCategories.find(category => category.id === categoryId);
}

export function initialDocumentValues(template: DocumentTemplate, today = localDateInputValue()): Record<string, string> {
  return Object.fromEntries((template.fields ?? []).map(field => [field.id, field.id === "date" ? today : ""]));
}

export function renderDocumentContent(template: DocumentTemplate, values: Record<string, string>): string {
  if (!template.content) return "";
  return template.content.replace(/\{\{([a-zA-Z0-9]+)\}\}/g, (_match, key: string) => {
    const value = values[key]?.trim();
    if (value) return value;
    const field = template.fields?.find(item => item.id === key);
    return field?.required ? `【${field.label}】` : "";
  });
}

export function validateDocument(template: DocumentTemplate, values: Record<string, string>): string[] {
  const fields = template.fields ?? [];
  const missing = fields
    .filter(field => field.required && !values[field.id]?.trim())
    .map(field => field.label);
  const invalidMoney = fields
    .filter(field => field.validation === "money" && values[field.id]?.trim())
    .filter(field => !/^(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{1,2})?$/.test(values[field.id].trim()))
    .map(field => `${field.label} — කරුණාකර වලංගු මුදලක් ඇතුළත් කරන්න`);
  return [...missing, ...invalidMoney];
}

export function searchDocumentTemplate(template: DocumentTemplate, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;
  const category = categoryForDocument(template.categoryId);
  return [template.titleEn, template.titleSi, template.description, category?.en, category?.si]
    .some(value => value?.toLocaleLowerCase().includes(normalizedQuery));
}
