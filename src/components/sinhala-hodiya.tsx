"use client";

import { useState } from "react";
import { Printer, RotateCcw } from "lucide-react";
import {
  englishHodiyaLetters,
  englishHodiyaNumerals,
  getHodiyaPrintLayout,
  getSelectedHodiyaGroups,
  getSinhalaHodiyaGroups,
  hodiyaLetterSelectionKey,
  hodiyaLetterStyleKey,
  sinhalaHodiyaNumerals,
  sinhalaHodiyaSections,
  splitHodiyaLetters,
  type SinhalaHodiyaSection
} from "@/data/sinhala-hodiya";
import { printCurrentPage } from "@/lib/print-page";

type HodiyaFont = "Noto Sans Sinhala" | "Noto Serif Sinhala" | "Abhaya Libre" | "Gemunu Libre" | "Yaldevi" | "Inter";
type LetterShape = "rounded" | "square" | "circle";
type LetterStyle = { fontFamily: HodiyaFont; color: string; background: string };
type WorksheetGroup = { id: string; title: string; description: string; letters: string[]; sinhala: boolean };
const hodiyaFonts: HodiyaFont[] = ["Noto Sans Sinhala", "Noto Serif Sinhala", "Abhaya Libre", "Gemunu Libre", "Yaldevi", "Inter"];
const isLetterShape = (shape: string): shape is LetterShape => ["rounded", "square", "circle"].includes(shape);

const defaultLetterStyle: LetterStyle = {
  fontFamily: "Noto Sans Sinhala",
  color: "#26394a",
  background: "#ffffff"
};
const defaultLetterStyleByFont: Record<HodiyaFont, string> = {
  "Noto Sans Sinhala": '"Noto Sans Sinhala", sans-serif',
  "Noto Serif Sinhala": '"Noto Serif Sinhala", "Noto Sans Sinhala", sans-serif',
  "Abhaya Libre": '"Abhaya Libre", "Noto Sans Sinhala", serif',
  "Gemunu Libre": '"Gemunu Libre", "Noto Sans Sinhala", sans-serif',
  Yaldevi: '"Yaldevi", "Noto Sans Sinhala", sans-serif',
  Inter: '"Inter", "Noto Sans Sinhala", sans-serif'
};
const isHodiyaFont = (font: string): font is HodiyaFont => hodiyaFonts.some(availableFont => availableFont === font);

function makeWorksheetGroups(includeSinhalaNumerals: boolean, includeEnglish: boolean): WorksheetGroup[] {
  return [
    ...sinhalaHodiyaSections.map(section => ({
      ...section,
      sinhala: true
    })),
    ...(includeSinhalaNumerals ? [{ id: "sinhala-numerals", title: "සිංහල ඉලක්කම්", description: "Sinhala numerals", letters: sinhalaHodiyaNumerals, sinhala: true }] : []),
    ...(includeEnglish ? [
      { id: "english-letters", title: "English Letters", description: "A–Z", letters: englishHodiyaLetters, sinhala: false },
      { id: "english-numerals", title: "English Numbers", description: "0–9", letters: englishHodiyaNumerals, sinhala: false }
    ] : [])
  ];
}

function LetterGrid({
  group,
  columns,
  fontSize,
  shape,
  selectedLetterStyleKey,
  selectedLetters,
  onSelect,
  onInclude,
  styleFor
}: {
  group: Pick<SinhalaHodiyaSection, "id" | "title" | "description" | "letters">;
  columns: number;
  fontSize: number;
  shape: LetterShape;
  selectedLetterStyleKey: string;
  selectedLetters: ReadonlySet<string>;
  onSelect: (groupId: string, letter: string) => void;
  onInclude: (groupId: string, index: number, included: boolean) => void;
  styleFor: (groupId: string, letter: string) => LetterStyle;
}) {
  return <section className="hodiya-letter-section" aria-labelledby={`hodiya-${group.id}`}>
    <div className="hodiya-section-heading">
      <div><h2 id={`hodiya-${group.id}`} lang={group.id.startsWith("english") ? "en" : "si"}>{group.title}</h2><p>{group.description}</p></div>
      <span>{group.letters.length}</span>
    </div>
    <div className="hodiya-letter-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {group.letters.map((letter, index) => {
        const style = styleFor(group.id, letter);
        const selectionKey = hodiyaLetterSelectionKey(group.id, index);
        return <div className="hodiya-letter-option" key={selectionKey}>
          <button type="button" className={`hodiya-letter-tile ${selectedLetterStyleKey === hodiyaLetterStyleKey(group.id, letter) ? "active-letter" : ""}`} aria-pressed={selectedLetterStyleKey === hodiyaLetterStyleKey(group.id, letter)} aria-label={`Customize letter ${letter}`} onClick={() => onSelect(group.id, letter)} lang={/[\u0D80-\u0DFF]/.test(letter) ? "si" : "en"} style={{ color: style.color, backgroundColor: style.background, fontFamily: defaultLetterStyleByFont[style.fontFamily], fontSize: `${fontSize}px`, minHeight: `${Math.max(45, fontSize * 1.45)}px`, borderRadius: shape === "square" ? "0" : shape === "circle" ? "50%" : "9px", ...(shape === "circle" ? { aspectRatio: "1", minHeight: "unset" } : {}) }}>{letter}</button>
          <input type="checkbox" className="hodiya-print-select" checked={selectedLetters.has(selectionKey)} aria-label={`Include ${letter} in the printed worksheet`} onChange={event => onInclude(group.id, index, event.target.checked)}/>
        </div>;
      })}
    </div>
  </section>;
}

export function SinhalaHodiya() {
  const [selectedLetter, setSelectedLetter] = useState("අ");
  const [selectedLetterStyleKey, setSelectedLetterStyleKey] = useState(hodiyaLetterStyleKey("vowels", "අ"));
  const [defaultStyle, setDefaultStyle] = useState<LetterStyle>(defaultLetterStyle);
  const [fontSize, setFontSize] = useState(32);
  const [shape, setShape] = useState<LetterShape>("rounded");
  const [letterStyles, setLetterStyles] = useState<Record<string, LetterStyle>>({});
  const [selectedLetters, setSelectedLetters] = useState<Set<string>>(() => new Set(
    makeWorksheetGroups(false, false).flatMap(group => group.letters.map((_, index) => hodiyaLetterSelectionKey(group.id, index)))
  ));
  const [spacing, setSpacing] = useState(8);
  const [tileSize, setTileSize] = useState(14);
  const [rows, setRows] = useState(6);
  const [columns, setColumns] = useState(8);
  const [includeSinhalaNumerals, setIncludeSinhalaNumerals] = useState(false);
  const [includeEnglish, setIncludeEnglish] = useState(false);
  const [printMode, setPrintMode] = useState<"selected" | "sinhala">("selected");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const groups = makeWorksheetGroups(includeSinhalaNumerals, includeEnglish);
  const printableGroups = getSelectedHodiyaGroups(groups, selectedLetters);
  const fullSinhalaGroups = getSinhalaHodiyaGroups();
  const printWorksheetGroups = printMode === "sinhala" ? fullSinhalaGroups : printableGroups;
  const selectedCount = printableGroups.reduce((count, group) => count + group.letters.length, 0);
  const worksheetLetterCount = printWorksheetGroups.reduce((count, group) => count + group.letters.length, 0);
  const longestLetter = Math.max(
    1,
    ...printWorksheetGroups.flatMap(group => group.letters.map(letter => Array.from(letter).length))
  );
  const printLayout = getHodiyaPrintLayout(fontSize, tileSize, spacing, rows, columns, longestLetter);
  const longestVisibleLetter = Math.max(
    1,
    ...groups.flatMap(group => group.letters.map(letter => Array.from(letter).length))
  );
  const editorLayout = getHodiyaPrintLayout(fontSize, tileSize, spacing, rows, columns, longestVisibleLetter);
  const activeStyle = letterStyles[selectedLetterStyleKey] ?? defaultStyle;

  const styleFor = (groupId: string, letter: string) => letterStyles[hodiyaLetterStyleKey(groupId, letter)] ?? defaultStyle;
  const updateIncludedLetter = (groupId: string, index: number, included: boolean) => {
    const key = hodiyaLetterSelectionKey(groupId, index);
    setSelectedLetters(previous => {
      const next = new Set(previous);
      if (included) next.add(key);
      else next.delete(key);
      return next;
    });
  };
  const updateOptionalGroup = (groupId: "sinhala-numerals" | "english-letters", included: boolean, update: (value: boolean) => void) => {
    update(included);
    const groupIds = groupId === "english-letters" ? ["english-letters", "english-numerals"] : [groupId];
    const groupsToUpdate = makeWorksheetGroups(true, true).filter(group => groupIds.includes(group.id));
    setSelectedLetters(previous => {
      const next = new Set(previous);
      groupsToUpdate.forEach(group => group.letters.forEach((_, index) => {
        const key = hodiyaLetterSelectionKey(group.id, index);
        if (included) next.add(key);
        else next.delete(key);
      }));
      return next;
    });
  };
  const selectAllLetters = () => setSelectedLetters(new Set(
    groups.flatMap(group => group.letters.map((_, index) => hodiyaLetterSelectionKey(group.id, index)))
  ));
  const clearLetterSelection = () => setSelectedLetters(new Set());
  const updateStyle = (patch: Partial<LetterStyle>) => {
    const updated = { ...activeStyle, ...patch };
    setLetterStyles(previous => ({ ...previous, [selectedLetterStyleKey]: updated }));
  };
  const resetSelectedLetter = () => setLetterStyles(previous => {
    const next = { ...previous };
    delete next[selectedLetterStyleKey];
    return next;
  });
  const changeNumber = (value: string, setValue: (next: number) => void, minimum: number, maximum: number) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) setValue(Math.max(minimum, Math.min(maximum, Math.round(parsed))));
  };
  const printWorksheet = async (mode: "selected" | "sinhala") => {
    setError("");
    setNotice("");
    const printGroups = mode === "sinhala" ? fullSinhalaGroups : printableGroups;
    const printCount = printGroups.reduce((count, group) => count + group.letters.length, 0);
    if (printCount === 0) {
      setError("Select at least one letter for the worksheet before printing.");
      return;
    }
    try {
      setPrintMode(mode);
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      const sample = printGroups.flatMap(group => group.letters).join("");
      const fontFamilies = [...new Set([...printGroups.flatMap(group => group.letters.map(letter => styleFor(group.id, letter).fontFamily)), defaultStyle.fontFamily])];
      await Promise.all(fontFamilies.map(fontFamily => document.fonts.load(`700 ${fontSize}px "${fontFamily}"`, sample)));
      await document.fonts.ready;
      document.documentElement.classList.add("hodiya-print-mode");
      const result = await printCurrentPage({ orientation: "portrait" });
      if (result.status === "previewed") setNotice("Print preview opened. Check the A4 worksheet, then choose your printer and Print.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not prepare the Sinhala Hodiya print preview.");
    } finally {
      document.documentElement.classList.remove("hodiya-print-mode");
      setPrintMode("selected");
    }
  };

  return <main className="sinhala-hodiya-page">
    <div className="sinhala-hodiya-screen">
      <header className="hodiya-page-header">
        <div><span className="eyebrow">LEARN · PRACTISE · PRINT</span><h1 className="page-title">සිංහල හෝඩිය <span className="text-base font-medium text-slate-400">· Sinhala Hodiya</span></h1><p className="mt-2 text-sm text-slate-500">Explore Sinhala letters and create a clear A4 learning worksheet for children.</p></div>
        <div className="hodiya-print-actions"><button type="button" className="primary-button" onClick={() => void printWorksheet("selected")}><Printer size={16}/> Print selected ({selectedCount})</button><button type="button" className="hodiya-print-all-button" onClick={() => void printWorksheet("sinhala")}><Printer size={16}/> Print full Sinhala Hodiya</button></div>
      </header>
      {notice && <p className="status-message" role="status">{notice}</p>}
      {error && <p className="status-error" role="alert">{error}</p>}
      <div className="hodiya-workspace">
        <section className="hodiya-main-panel">
          <div className="hodiya-panel-heading"><div><h2>Letters and combinations</h2><p>Choose letters with the checkboxes, or print the complete Sinhala Hodiya.</p></div><div className="hodiya-selection-actions"><span className="step-number">{selectedCount} selected</span><button type="button" className="hodiya-selection-button" onClick={selectAllLetters}>Select all</button><button type="button" className="hodiya-selection-button" onClick={clearLetterSelection}>Clear</button></div></div>
          <div className="hodiya-letter-sections">
            {groups.map(group => <LetterGrid key={group.id} group={group} columns={editorLayout.columns} fontSize={fontSize} shape={shape} selectedLetterStyleKey={selectedLetterStyleKey} selectedLetters={selectedLetters} onSelect={(groupId, letter) => { setSelectedLetter(letter); setSelectedLetterStyleKey(hodiyaLetterStyleKey(groupId, letter)); }} onInclude={updateIncludedLetter} styleFor={styleFor}/>)}
          </div>
        </section>
        <aside className="hodiya-settings-column">
          <section className="soft-card hodiya-controls-card">
            <div className="hodiya-panel-heading"><div><h2>Selected letter</h2><p>Customize “{selectedLetter}” for the worksheet.</p></div></div>
            <div className="hodiya-large-preview" lang={/[\u0D80-\u0DFF]/.test(selectedLetter) ? "si" : "en"} style={{ color: activeStyle.color, backgroundColor: activeStyle.background, fontFamily: defaultLetterStyleByFont[activeStyle.fontFamily], fontSize: `${fontSize}px`, borderRadius: shape === "square" ? "0" : shape === "circle" ? "50%" : "13px", ...(shape === "circle" ? { aspectRatio: "1", minHeight: "unset", width: "100%", maxWidth: "220px", justifySelf: "center" } : {}) }}>{selectedLetter}</div>
            <div className="flex flex-wrap gap-3">
              {letterStyles[selectedLetterStyleKey] && <button type="button" className="hodiya-reset-button" onClick={resetSelectedLetter}><RotateCcw size={13}/> Reset this letter&apos;s colours and font</button>}
              <button type="button" className="hodiya-reset-button" onClick={() => { setDefaultStyle(activeStyle); setLetterStyles({}); }}>Apply font and colours to all letters</button>
            </div>
            <label className="field-label block">Font family<select className="text-input mt-2" value={activeStyle.fontFamily} onChange={event => { if (isHodiyaFont(event.target.value)) updateStyle({ fontFamily: event.target.value }); }}><option>Noto Sans Sinhala</option><option>Abhaya Libre</option><option>Noto Serif Sinhala</option><option>Gemunu Libre</option><option>Yaldevi</option><option>Inter</option></select></label>
            <label className="field-label block">All letters font size · px<input className="text-input mt-2" type="number" min="12" max="72" value={fontSize} onChange={event => changeNumber(event.target.value, setFontSize, 12, 72)}/></label>
            <input aria-label="All letters font size" className="hodiya-range" type="range" min="12" max="72" value={fontSize} onChange={event => setFontSize(Number(event.target.value))}/>
            <label className="field-label block">Shape for all letters<select className="text-input mt-2" value={shape} onChange={event => { if (isLetterShape(event.target.value)) setShape(event.target.value); }}><option value="rounded">Rounded</option><option value="square">Square</option><option value="circle">Circle</option></select></label>
            <div className="hodiya-color-controls">
              <label className="field-label">Text colour<input aria-label="Letter text colour" className="hodiya-color-input" type="color" value={activeStyle.color} onChange={event => updateStyle({ color: event.target.value })}/></label>
              <label className="field-label">Tile colour<input aria-label="Letter tile background colour" className="hodiya-color-input" type="color" value={activeStyle.background} onChange={event => updateStyle({ background: event.target.value })}/></label>
            </div>
          </section>
          <section className="soft-card hodiya-controls-card">
            <div className="hodiya-panel-heading"><div><h2>Worksheet layout</h2><p>Adjust the A4 grid before printing.</p></div></div>
            <div className="hodiya-number-controls">
              <label className="field-label">Rows per group<input className="text-input mt-2" type="number" min="1" max="12" value={rows} onChange={event => changeNumber(event.target.value, setRows, 1, 12)}/></label>
              <label className="field-label">Columns<input className="text-input mt-2" type="number" min="2" max="12" value={columns} onChange={event => changeNumber(event.target.value, setColumns, 2, 12)}/></label>
              <label className="field-label">Tile spacing · mm<input className="text-input mt-2" type="number" min="0" max="20" value={spacing} onChange={event => changeNumber(event.target.value, setSpacing, 0, 20)}/></label>
              <label className="field-label">Tile size · mm<input className="text-input mt-2" type="number" min="8" max="30" value={tileSize} onChange={event => changeNumber(event.target.value, setTileSize, 8, 30)}/></label>
            </div>
            <div className="hodiya-extra-options">
              <label><input type="checkbox" checked={includeSinhalaNumerals} onChange={event => updateOptionalGroup("sinhala-numerals", event.target.checked, setIncludeSinhalaNumerals)}/> Include Sinhala numerals</label>
              <label><input type="checkbox" checked={includeEnglish} onChange={event => updateOptionalGroup("english-letters", event.target.checked, setIncludeEnglish)}/> Include English A–Z and 0–9</label>
            </div>
            <p className="hodiya-size-note">Large letters automatically use fewer rows and columns to fit A4. Changing tile shape does not change letter size. Print sheet: A4 portrait · 210 × 297 mm · page margins 10 mm</p>
          </section>
        </aside>
      </div>
      <section className="hodiya-sheet-preview-panel">
        <div className="hodiya-panel-heading"><div><h2>Worksheet preview</h2><p>Print preview uses these same fonts, letter styles, and grid settings.</p></div><span className="step-number">{printWorksheetGroups.length} sections · {worksheetLetterCount} letters</span></div>
        <div className="hodiya-sheet-preview">
          {printWorksheetGroups.length === 0 && <p className="hodiya-empty-selection">No letters selected. Check letters above to add them to the worksheet.</p>}
          {printWorksheetGroups.map(group => <section key={group.id} className="hodiya-preview-group">
            <h3 lang={group.sinhala ? "si" : "en"}>{group.title}</h3>
            <div className="hodiya-preview-grid" style={{ gridTemplateColumns: `repeat(${printLayout.columns}, minmax(0, 1fr))`, gap: `${Math.min(spacing, 12) / 2}px` }}>
              {group.letters.map((letter, index) => {
                const style = styleFor(group.id, letter);
                return <div key={`${group.id}-${letter}-${index}`} className="hodiya-preview-tile" lang={/[\u0D80-\u0DFF]/.test(letter) ? "si" : "en"} style={{ backgroundColor: style.background, color: style.color, fontFamily: defaultLetterStyleByFont[style.fontFamily], fontSize: `${fontSize}px`, minHeight: `${Math.max(40, fontSize * 1.45)}px`, borderRadius: shape === "square" ? "0" : shape === "circle" ? "50%" : "7px", ...(shape === "circle" ? { aspectRatio: "1", minHeight: "unset" } : {}) }}>{letter}</div>;
              })}
            </div>
          </section>)}
        </div>
      </section>
    </div>
    <div className="hodiya-print-root" aria-hidden="true">
      <div className="hodiya-print-heading"><h1 lang="si">සිංහල හෝඩිය</h1><p>Learning worksheet · A4 portrait · 210 × 297 mm</p></div>
      {printWorksheetGroups.map(group => splitHodiyaLetters(group.letters, printLayout.rows, printLayout.columns).map((chunk, chunkIndex) => <section key={`${group.id}-${chunkIndex}`} className="hodiya-print-section">
        <header><h2 lang={group.sinhala ? "si" : "en"}>{group.title}{chunkIndex > 0 ? " · continued" : ""}</h2><span>{group.description}</span></header>
        <div className="hodiya-print-grid" style={{ gridTemplateColumns: `repeat(${printLayout.columns}, minmax(0, 1fr))`, gap: `${spacing}mm` }}>
          {chunk.map((letter, index) => {
            const style = styleFor(group.id, letter);
            return <div key={`${group.id}-${chunkIndex}-${letter}-${index}`} className="hodiya-print-tile" lang={/[\u0D80-\u0DFF]/.test(letter) ? "si" : "en"} style={{ color: style.color, backgroundColor: style.background, fontFamily: defaultLetterStyleByFont[style.fontFamily], fontSize: `${fontSize * 0.75}pt`, minHeight: `${printLayout.tileSize}mm`, borderRadius: shape === "square" ? "0" : shape === "circle" ? "50%" : "1.5mm", ...(shape === "circle" ? { width: `min(100%, ${printLayout.tileSize}mm)`, aspectRatio: "1", minHeight: "unset", justifySelf: "center" } : {}) }}>{letter}</div>;
          })}
        </div>
      </section>))}
    </div>
  </main>;
}
