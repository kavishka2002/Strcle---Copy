import type { WorksheetActivity, WorksheetCategory, WorksheetDifficulty, WorksheetLanguage, WorksheetTemplate } from "@/lib/worksheets";

type TemplateRow = [
  id: string,
  title: string,
  titleSinhala: string,
  contentKey: string,
  icon: string,
  grade: number,
  activity: WorksheetActivity,
  language?: WorksheetLanguage,
  difficulty?: WorksheetDifficulty,
  exerciseCount?: number
];

const instructions: Record<WorksheetCategory, { en: string; si: string }> = {
  "Sinhala Alphabet Worksheets": { en: "Look carefully at each Sinhala letter. Say it aloud, follow the activity, and write neatly on the lines.", si: "සෑම සිංහල අකුරක්ම හොඳින් බලන්න. ශබ්ද නඟා කියවා, ක්‍රියාකාරකම කර, ඉරි මත පිළිවෙළට ලියන්න." },
  "English Alphabet Worksheets": { en: "Say each letter and its sound. Complete the activity, then write your answer clearly.", si: "සෑම ඉංග්‍රීසි අකුරක්ම සහ එහි ශබ්දය කියන්න. ක්‍රියාකාරකම සම්පූර්ණ කර පිළිතුර පැහැදිලිව ලියන්න." },
  "Numbers 1–100": { en: "Read, count, and write each number. Check the number sequence before you finish.", si: "සෑම අංකයක්ම කියවා, ගණන් කර, ලියන්න. අවසන් කිරීමට පෙර අංක අනුපිළිවෙළ පරීක්ෂා කරන්න." },
  "Mathematics Worksheets": { en: "Read each problem, show your working in the space, and check your answer.", si: "සෑම ගැටලුවක්ම කියවා, ඉඩෙහි ගණනය පෙන්වා, පිළිතුර පරීක්ෂා කරන්න." },
  "Colouring Pages": { en: "Colour the large picture with care. Use your favourite colours and stay inside the outlines.", si: "විශාල රූපය සැලකිල්ලෙන් වර්ණ කරන්න. කැමති වර්ණ භාවිතා කර පිටත ඉරිවලින් නොපනින්න." },
  "Shapes & Pictures": { en: "Look at each shape and picture. Name it, trace it, or complete the matching activity.", si: "සෑම හැඩයක් සහ රූපයක්ම බලන්න. නම කියා, ඇඳගෙන හෝ ගැළපීමේ ක්‍රියාකාරකම සම්පූර්ණ කරන්න." },
  "Handwriting Practice": { en: "Sit comfortably, trace the model, then copy it carefully on the writing lines.", si: "සුවපහසු ලෙස හිඳගෙන ආදර්ශය මත ලියා, පසුව ලිවීමේ ඉරි මත පිළිවෙළට පිටපත් කරන්න." },
  "Matching Activities": { en: "Read each item on the left. Draw a line to the matching picture, word, or answer.", si: "වම්පස ඇති සෑම අයිතමයක්ම කියවන්න. ගැළපෙන රූපය, වචනය හෝ පිළිතුර වෙත ඉරක් අඳින්න." },
  "Grade 1–5 Activity Sheets": { en: "Read each task carefully. Try every activity and show your thinking in the answer space.", si: "සෑම කාර්යයක්ම හොඳින් කියවන්න. සියලු ක්‍රියාකාරකම් කර පිළිතුරු ඉඩෙහි ඔබේ අදහස් පෙන්වන්න." }
};

function templates(category: WorksheetCategory, rows: TemplateRow[]): WorksheetTemplate[] {
  return rows.map(([id, title, titleSinhala, contentKey, icon, grade, activity, language = "English", difficulty = "Easy", exerciseCount = 8]) => ({
    id, title, titleSinhala, category, activity, language, grade, difficulty,
    instructions: instructions[category].en,
    instructionsSinhala: instructions[category].si,
    description: `${title} · Ready-to-print A4 activity`,
    descriptionSinhala: `${titleSinhala} · මුද්‍රණයට සූදානම් A4 ක්‍රියාකාරකම`,
    icon, contentKey, exerciseCount, languages: ["English", "Sinhala"]
  }));
}

const sinhalaAlphabet = templates("Sinhala Alphabet Worksheets", [
  ["si-vowels", "Sinhala vowels practice", "සිංහල ස්වර පුහුණුව", "si-vowels", "අ", 1, "Trace letters", "Sinhala", "Easy", 18],
  ["si-consonants", "Sinhala consonants practice", "සිංහල ව්‍යංජන පුහුණුව", "si-consonants", "ක", 1, "Trace letters", "Sinhala", "Easy", 20],
  ["si-complete-chart", "Complete Sinhala alphabet chart", "සම්පූර්ණ සිංහල හෝඩිය", "si-chart", "අආ", 1, "Identify letters", "Sinhala", "Easy", 15],
  ["si-amba-match", "අ – අඹ letter and picture match", "අ – අඹ අකුර සහ රූපය ගළපමු", "si-letter-picture", "අඹ", 1, "Letter pictures", "Sinhala", "Easy", 1],
  ["si-tracing", "Sinhala letter tracing", "සිංහල අකුරු ලිවීමේ පුහුණුව", "si-trace", "✎", 1, "Trace letters", "Sinhala"],
  ["si-missing", "Find the missing Sinhala letters", "නැති සිංහල අකුරු සොයමු", "si-missing", "අ…", 1, "Identify letters", "Sinhala"],
  ["si-identify", "Identify the correct Sinhala letter", "නිවැරදි සිංහල අකුර හඳුනාගනිමු", "si-identify", "ක?", 1, "Identify letters", "Sinhala"],
  ["si-picture-match", "Match Sinhala letters and pictures", "සිංහල අකුරු සහ රූප ගළපමු", "si-picture-match", "↔", 1, "Letter pictures", "Sinhala"],
  ["si-word-recognition", "Sinhala word recognition", "සිංහල වචන හඳුනාගනිමු", "si-words", "පොත", 1, "Words", "Sinhala"],
  ["si-circle-letter", "Circle the correct Sinhala letter", "නිවැරදි සිංහල අකුර වටකරමු", "si-circle", "◯", 1, "Identify letters", "Sinhala"],
  ["si-independent-writing", "Write Sinhala letters independently", "සිංහල අකුරු තනිව ලියමු", "si-independent", "අ", 1, "Trace letters", "Sinhala"],
  ["si-revision-test", "Sinhala alphabet revision test", "සිංහල හෝඩිය පුනරීක්ෂණ පරීක්ෂණය", "si-test", "✓", 1, "Identify letters", "Sinhala", "Medium"]
]);

const englishAlphabet = templates("English Alphabet Worksheets", [
  ["en-chart", "A–Z alphabet chart", "A–Z ඉංග්‍රීසි හෝඩි සටහන", "en-chart", "Aa", 1, "Identify letters", "English", "Easy", 13],
  ["en-uppercase", "Uppercase letter tracing", "කැපිටල් අකුරු ලිවීම", "en-uppercase", "ABC", 1, "Trace letters", "English", "Easy", 13],
  ["en-lowercase", "Lowercase letter tracing", "සිම්පල් අකුරු ලිවීම", "en-lowercase", "abc", 1, "Trace letters", "English", "Easy", 13],
  ["en-picture-match", "Match letters with pictures", "අකුරු රූප සමඟ ගළපමු", "en-picture-match", "A🍎", 1, "Letter pictures", "English"],
  ["en-beginning-sounds", "Beginning sounds", "ආරම්භක ශබ්ද හඳුනාගනිමු", "en-sounds", "B?", 1, "Letter pictures", "English"],
  ["en-missing", "Missing alphabet letters", "නැති ඉංග්‍රීසි අකුරු සොයමු", "en-missing", "A…Z", 1, "Identify letters", "English"],
  ["en-circle", "Circle the correct letter", "නිවැරදි අකුර වටකරමු", "en-circle", "◯", 1, "Identify letters", "English"],
  ["en-write-missing", "Write the missing letters", "නැති අකුරු ලියමු", "en-write-missing", "A _ C", 1, "Identify letters", "English"],
  ["en-ordering", "Put the alphabet in order", "අකුරු හෝඩි පිළිවෙළට සකසමු", "en-order", "↕", 1, "Identify letters", "English"],
  ["en-revision", "English alphabet revision test", "ඉංග්‍රීසි හෝඩිය පුනරීක්ෂණ පරීක්ෂණය", "en-test", "✓", 1, "Identify letters", "English", "Medium"]
]);

const numberTemplates = templates("Numbers 1–100", [
  ["num-1-10", "Numbers 1–10", "අංක 1–10", "num-1-10", "1–10", 1, "Trace numbers", "English", "Easy", 10],
  ["num-1-20", "Numbers 1–20", "අංක 1–20", "num-1-20", "1–20", 1, "Trace numbers", "English", "Easy", 10],
  ["num-1-50", "Numbers 1–50", "අංක 1–50", "num-1-50", "1–50", 1, "Number recognition", "English", "Easy", 10],
  ["num-1-100", "Numbers 1–100", "අංක 1–100", "num-1-100", "1–100", 2, "Number recognition", "English", "Medium", 10],
  ["num-sinhala", "Sinhala numerals and number words", "සිංහල ඉලක්කම් සහ අංක නාම", "num-sinhala", "෧෨෩", 1, "Trace numbers", "Sinhala", "Easy", 10],
  ["num-english-words", "English number words", "ඉංග්‍රීසි අංක නාම", "num-words", "one", 1, "Words", "English", "Easy", 10],
  ["num-tracing", "Number tracing practice", "අංක ලිවීමේ පුහුණුව", "num-trace", "✎", 1, "Trace numbers", "English", "Easy", 10],
  ["num-count-objects", "Count the objects", "වස්තු ගණන් කරමු", "num-count", "●", 1, "Counting", "English", "Easy", 10],
  ["num-missing", "Find missing numbers", "නැති අංක සොයමු", "num-missing", "…", 1, "Missing numbers", "English", "Easy", 10],
  ["num-before-after", "Before and after numbers", "පෙර සහ පසු අංක", "num-before-after", "↔", 1, "Before and after", "English", "Easy", 10],
  ["num-compare", "Greater than and less than", "වැඩි සහ අඩු අංක", "num-compare", "><", 2, "Compare numbers", "English", "Medium", 10],
  ["num-recognition-test", "Number recognition test", "අංක හඳුනාගැනීමේ පරීක්ෂණය", "num-test", "✓", 1, "Number recognition", "English", "Medium", 10]
]);

const mathematics = templates("Mathematics Worksheets", [
  ["math-addition", "Friendly addition", "එකතු කිරීමේ පුහුණුව", "math-add", "+", 1, "Addition", "English", "Easy"],
  ["math-subtraction", "Subtraction stories", "අඩු කිරීමේ ගැටලු", "math-subtract", "−", 1, "Subtraction", "English", "Easy"],
  ["math-multiplication", "Multiplication tables", "ගුණ කිරීමේ වගු", "math-multiply", "×", 3, "Multiplication", "English", "Medium"],
  ["math-division", "Fair-share division", "සමානව බෙදීම", "math-divide", "÷", 3, "Division", "English", "Medium"],
  ["math-patterns", "Number patterns", "අංක රටා", "math-pattern", "2,4…", 2, "Number patterns", "English", "Easy"],
  ["math-picture-counting", "Picture-based counting", "රූප ඇසුරින් ගණන් කිරීම", "math-picture-count", "●", 1, "Counting", "English", "Easy"],
  ["math-word-problems", "Everyday word problems", "දෛනික වචන ගැටලු", "math-word", "?", 2, "Word problems", "English", "Medium"],
  ["math-shapes-measure", "Shapes and measurements", "හැඩතල සහ මිනුම්", "math-measure", "△", 2, "Identify picture", "English", "Easy", 7],
  ["math-compare", "Compare numbers", "අංක සසඳමු", "math-compare", "><", 2, "Compare numbers", "English", "Easy"],
  ["math-missing-equations", "Missing number equations", "නැති අංකය සොයමු", "math-equation", "□", 2, "Addition", "English", "Medium"],
  ["math-mental", "Mental maths warm-up", "මානසික ගණිත අභ්‍යාසය", "math-mental", "⚡", 3, "Addition", "English", "Medium"],
  ["math-grade-1", "Grade 1 mathematics", "1 ශ්‍රේණිය ගණිතය", "grade1-math", "1", 1, "Grade activity", "Sinhala", "Easy"],
  ["math-grade-2", "Grade 2 mathematics", "2 ශ්‍රේණිය ගණිතය", "grade2-math", "2", 2, "Grade activity", "Sinhala", "Easy"],
  ["math-grade-3", "Grade 3 mathematics", "3 ශ්‍රේණිය ගණිතය", "grade3-math", "3", 3, "Grade activity", "Sinhala", "Medium"],
  ["math-grade-4-5", "Grade 4–5 mathematics", "4–5 ශ්‍රේණි ගණිතය", "grade45-math", "4–5", 4, "Grade activity", "Sinhala", "Advanced"]
]);

const coloring = templates("Colouring Pages", [
  ["color-animals", "Animals in the garden", "වත්තේ සතුන්", "color-animals", "♡", 1, "Colouring", "English", "Easy", 1],
  ["color-cat", "Curious cat", "කුතුහලයෙන් පිරි බළලා", "color-cat", "🐈", 1, "Colouring", "English", "Easy", 1],
  ["color-dog", "Happy puppy", "සතුටු බලු පැටියා", "color-dog", "🐕", 1, "Colouring", "English", "Easy", 1],
  ["color-elephant", "Gentle elephant", "මෘදු ඇතා", "color-elephant", "🐘", 1, "Colouring", "English", "Easy", 1],
  ["color-lion", "Kind jungle lion", "වනාන්තරයේ සිංහයා", "color-lion", "🦁", 1, "Colouring", "English", "Easy", 1],
  ["color-birds", "Birds on a branch", "අත්තේ සිටින කුරුල්ලෝ", "color-birds", "🐦", 1, "Colouring", "English", "Easy", 1],
  ["color-butterfly", "Butterfly garden", "සමනල උයන", "color-butterfly", "🦋", 1, "Colouring", "English", "Easy", 1],
  ["color-flowers", "Big garden flower", "වත්තේ විශාල මල", "color-flowers", "✿", 1, "Colouring", "English", "Easy", 1],
  ["color-fruits", "Basket of fruit", "පලතුරු කූඩය", "color-fruits", "🍎", 1, "Colouring", "English", "Easy", 1],
  ["color-apple", "Shiny apple", "ලස්සන ඇපල් ගෙඩිය", "color-apple", "●", 1, "Colouring", "English", "Easy", 1],
  ["color-banana", "Banana bunch", "කෙසෙල් ඇවරිය", "color-banana", "◒", 1, "Colouring", "English", "Easy", 1],
  ["color-vehicles", "Little car on the road", "පාරේ යන කුඩා මෝටර් රථය", "color-car", "🚗", 1, "Colouring", "English", "Easy", 1],
  ["color-house", "My little home", "මගේ පුංචි නිවස", "color-house", "⌂", 1, "Colouring", "English", "Easy", 1],
  ["color-trees", "Tree full of leaves", "කොළ පිරුණු ගස", "color-tree", "♧", 1, "Colouring", "English", "Easy", 1],
  ["color-nature", "Sunny nature scene", "හිරු එළිය ඇති පරිසරය", "color-nature", "☼", 1, "Colouring", "English", "Easy", 1]
]);

const shapes = templates("Shapes & Pictures", [
  ["shape-chart", "Basic shapes chart", "මූලික හැඩතල සටහන", "shape-chart", "△", 1, "Identify picture", "English", "Easy", 7],
  ["shape-circle-square", "Circle and square recognition", "වෘත්තය සහ චතුරස්‍රය හඳුනාගනිමු", "shape-circle-square", "◯", 1, "Find the shape", "Sinhala", "Easy", 2],
  ["shape-triangle-rectangle", "Triangle and rectangle", "ත්‍රිකෝණය සහ ඍජුකෝණාස්‍රය", "shape-triangle-rectangle", "▱", 1, "Find the shape", "Sinhala", "Easy", 2],
  ["shape-match", "Match the shapes", "හැඩතල ගළපමු", "shape-match", "↔", 1, "Match shapes", "English", "Easy", 7],
  ["shape-identify", "Find the named shape", "නම සඳහන් හැඩය සොයමු", "shape-identify", "?", 1, "Find the shape", "English", "Easy", 7],
  ["shape-trace", "Trace basic shapes", "මූලික හැඩතල අඳිමු", "shape-trace", "✎", 1, "Shape tracing", "Sinhala", "Easy", 7],
  ["shape-color", "Colour the shapes", "හැඩතල වර්ණ කරමු", "shape-color", "▧", 1, "Colouring", "Sinhala", "Easy", 7],
  ["shape-around-us", "Shapes around us", "අප වටා ඇති හැඩතල", "shape-around", "⌂", 1, "Identify picture", "English", "Easy", 7],
  ["shape-names", "Sinhala and English shape names", "සිංහල සහ ඉංග්‍රීසි හැඩතල නම්", "shape-names", "Aa", 1, "Match shapes", "Sinhala", "Easy", 7],
  ["shape-revision", "Shapes revision worksheet", "හැඩතල පුනරීක්ෂණ වැඩපත්‍රිකාව", "shape-revision", "✓", 2, "Identify picture", "English", "Medium", 7]
]);

const handwriting = templates("Handwriting Practice", [
  ["write-si-vowels", "Sinhala vowel handwriting", "සිංහල ස්වර අත් අකුරු", "write-si-vowels", "අ", 1, "Trace letters", "Sinhala"],
  ["write-si-consonants", "Sinhala consonant handwriting", "සිංහල ව්‍යංජන අත් අකුරු", "write-si-consonants", "ක", 1, "Trace letters", "Sinhala"],
  ["write-en-uppercase", "English uppercase handwriting", "ඉංග්‍රීසි කැපිටල් අත් අකුරු", "write-en-upper", "ABC", 1, "Trace letters", "English"],
  ["write-en-lowercase", "English lowercase handwriting", "ඉංග්‍රීසි සිම්පල් අත් අකුරු", "write-en-lower", "abc", 1, "Trace letters", "English"],
  ["write-si-words", "Copy Sinhala words", "සිංහල වචන පිටපත් කරමු", "write-si-words", "පොත", 2, "Words", "Sinhala"],
  ["write-en-words", "Copy English words", "ඉංග්‍රීසි වචන පිටපත් කරමු", "write-en-words", "book", 2, "Words", "English"],
  ["write-sentences", "Copy a sentence", "වාක්‍යයක් පිටපත් කරමු", "write-sentences", "…", 2, "Sentences", "Sinhala", "Easy", 4],
  ["write-dotted", "Dotted letter tracing", "තිත් ඉරි අකුරු ලිවීම", "write-dotted", "⋯", 1, "Trace letters", "English"],
  ["write-ruled", "Ruled writing practice", "ඉරි මත අත් අකුරු පුහුණුව", "write-ruled", "☰", 2, "Writing lines", "Sinhala", "Easy", 3],
  ["write-free", "Free handwriting practice", "නිදහස් අත් අකුරු පුහුණුව", "write-free", "✎", 2, "Writing lines", "English"]
]);

const matching = templates("Matching Activities", [
  ["match-animals", "Animal and name matching", "සතුන් සහ නම් ගළපමු", "match-animals", "🐾", 1, "Match words and pictures", "English", "Easy", 4],
  ["match-fruits", "Fruit and name matching", "පලතුරු සහ නම් ගළපමු", "match-fruits", "🍎", 1, "Match words and pictures", "Sinhala", "Easy", 4],
  ["match-letters", "Letter and picture matching", "අකුරු සහ රූප ගළපමු", "match-letters", "Aa", 1, "Match letters and pictures", "English"],
  ["match-numbers", "Number and quantity matching", "අංක සහ ප්‍රමාණ ගළපමු", "match-numbers", "123", 1, "Match numbers and quantities", "Sinhala"],
  ["match-shapes", "Shape matching", "හැඩතල ගළපමු", "match-shapes", "△", 1, "Match shapes and names", "English", "Easy", 7],
  ["match-colours", "Colour word matching", "වර්ණ සහ වචන ගළපමු", "match-colours", "●", 1, "Match words and pictures", "Sinhala", "Easy", 4],
  ["match-opposites", "Opposite words", "විරුද්ධ අර්ථ ඇති වචන", "match-opposites", "↔", 2, "Match words and pictures", "English", "Easy", 4],
  ["match-sinhala-words", "Sinhala word matching", "සිංහල වචන ගළපමු", "match-si-words", "සි", 2, "Match words and pictures", "Sinhala"],
  ["match-english-words", "English vocabulary matching", "ඉංග්‍රීසි වචන ගළපමු", "match-en-words", "ABC", 2, "Match words and pictures", "English"],
  ["match-revision", "Mixed revision matching", "මිශ්‍ර පුනරීක්ෂණ ගැළපීම", "match-revision", "✓", 2, "Match words and pictures", "Sinhala", "Medium", 7]
]);

const gradeActivities = templates("Grade 1–5 Activity Sheets", [
  ["grade1-si", "Grade 1 Sinhala", "1 ශ්‍රේණිය සිංහල", "grade1-si", "අ", 1, "Grade activity", "Sinhala"],
  ["grade1-en", "Grade 1 English", "1 ශ්‍රේණිය ඉංග්‍රීසි", "grade1-en", "Aa", 1, "Grade activity", "English"],
  ["grade1-math", "Grade 1 Mathematics", "1 ශ්‍රේණිය ගණිතය", "grade1-math", "1", 1, "Grade activity", "Sinhala"],
  ["grade1-env", "Grade 1 Environmental Studies", "1 ශ්‍රේණිය පරිසරය", "grade1-env", "🌱", 1, "Grade activity", "Sinhala", "Easy", 6],
  ["grade2-si", "Grade 2 Sinhala", "2 ශ්‍රේණිය සිංහල", "grade2-si", "ක", 2, "Grade activity", "Sinhala"],
  ["grade2-en", "Grade 2 English", "2 ශ්‍රේණිය ඉංග්‍රීසි", "grade2-en", "ABC", 2, "Grade activity", "English"],
  ["grade2-math", "Grade 2 Mathematics", "2 ශ්‍රේණිය ගණිතය", "grade2-math", "2", 2, "Grade activity", "Sinhala"],
  ["grade2-env", "Grade 2 Environmental Studies", "2 ශ්‍රේණිය පරිසරය", "grade2-env", "☼", 2, "Grade activity", "Sinhala", "Easy", 6],
  ["grade3-si", "Grade 3 Sinhala", "3 ශ්‍රේණිය සිංහල", "grade3-si", "ම", 3, "Grade activity", "Sinhala"],
  ["grade3-en", "Grade 3 English", "3 ශ්‍රේණිය ඉංග්‍රීසි", "grade3-en", "ABC", 3, "Grade activity", "English"],
  ["grade3-math", "Grade 3 Mathematics", "3 ශ්‍රේණිය ගණිතය", "grade3-math", "3", 3, "Grade activity", "Sinhala"],
  ["grade3-env", "Grade 3 Environmental Studies", "3 ශ්‍රේණිය පරිසරය", "grade3-env", "🌿", 3, "Grade activity", "Sinhala", "Easy", 6],
  ["grade4-si", "Grade 4 Sinhala", "4 ශ්‍රේණිය සිංහල", "grade4-si", "ස", 4, "Grade activity", "Sinhala"],
  ["grade4-en", "Grade 4 English", "4 ශ්‍රේණිය ඉංග්‍රීසි", "grade4-en", "ABC", 4, "Grade activity", "English"],
  ["grade4-math", "Grade 4 Mathematics", "4 ශ්‍රේණිය ගණිතය", "grade4-math", "4", 4, "Grade activity", "Sinhala"],
  ["grade4-env", "Grade 4 Environmental Studies", "4 ශ්‍රේණිය පරිසරය", "grade4-env", "🌦", 4, "Grade activity", "Sinhala", "Easy", 6],
  ["grade5-si", "Grade 5 Sinhala", "5 ශ්‍රේණිය සිංහල", "grade5-si", "ල", 5, "Grade activity", "Sinhala", "Medium"],
  ["grade5-en", "Grade 5 English", "5 ශ්‍රේණිය ඉංග්‍රීසි", "grade5-en", "ABC", 5, "Grade activity", "English", "Medium"],
  ["grade5-math", "Grade 5 Mathematics", "5 ශ්‍රේණිය ගණිතය", "grade5-math", "5", 5, "Grade activity", "Sinhala", "Medium"],
  ["grade5-env", "Grade 5 Environmental Studies", "5 ශ්‍රේණිය පරිසරය", "grade5-env", "🌍", 5, "Grade activity", "Sinhala", "Medium", 6]
]);

export const worksheetTemplateDefinitions: WorksheetTemplate[] = [
  ...sinhalaAlphabet, ...englishAlphabet, ...numberTemplates, ...mathematics,
  ...coloring, ...shapes, ...handwriting, ...matching, ...gradeActivities
];

const templateIds = new Set(worksheetTemplateDefinitions.map(template => template.id));
if (templateIds.size !== worksheetTemplateDefinitions.length) throw new Error("Worksheet template IDs must be unique.");
