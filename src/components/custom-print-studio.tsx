"use client";

import {
  ArrowLeft, Check, ChevronRight, Circle, Copy, Flower2, ImagePlus, Layers,
  Minus, Plus, Printer, Save, Search, Shapes, Sparkles, Trash2, Trophy, Type, X
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ImageAsset } from "@/types";
import { db, getActiveTenantId } from "@/lib/database";
import { LocalizedUi } from "@/components/app-language";
import { AppToast } from "@/components/app-toast";
import { useAppDialog } from "@/components/app-dialog";
import { printCurrentPage } from "@/lib/print-page";
import { englishFonts, sinhalaFonts } from "@/lib/font-catalog";
import {
  calculateCustomPrintLayout, createNumberValues, fitCustomPrintFontSize, formatNumberLabel, parseCustomLabels,
  type CustomPrintDesign, type CustomPrintFit, type CustomPrintFont, type CustomPrintItem,
  type CustomPrintLayout, type CustomPrintShape, type CustomPrintTool, type NumberLabelStyle, updateCustomPrintItems
} from "@/lib/custom-print";

type ToolPage = CustomPrintTool | "dashboard" | "maker-preview";
type PaletteName = "school" | "rainbow" | "pastel" | "monochrome";
type ArtworkOption = { id: string; name: string; category: string };

const artworkOptions: ArtworkOption[] = [
  { id: "daisy", name: "Daisy", category: "Flowers" },
  { id: "rose", name: "Rose", category: "Flowers" },
  { id: "tulip", name: "Tulip", category: "Flowers" },
  { id: "sunflower", name: "Sunflower", category: "Flowers" },
  { id: "simple-flower", name: "Simple Flower", category: "Flowers" },
  { id: "heart", name: "Heart", category: "Decorations" },
  { id: "star", name: "Star", category: "Decorations" },
  { id: "smile", name: "Smiley", category: "Decorations" },
  { id: "butterfly", name: "Butterfly", category: "Nature" },
  { id: "rainbow", name: "Rainbow", category: "Nature" },
  { id: "cloud", name: "Cloud", category: "Nature" },
  { id: "leaf", name: "Leaf", category: "Nature" },
  { id: "pencil", name: "Pencil", category: "School" },
  { id: "book", name: "Book", category: "School" },
  { id: "apple", name: "Apple", category: "School" },
  { id: "sports", name: "Ball", category: "Sports" },
  { id: "planet", name: "Planet", category: "Space" }
];

const rewards = ["Good Job", "Excellent", "Very Good", "Well Done", "Star Student", "Great Work"];
const palettes: Record<PaletteName, string[]> = {
  school: ["#e95855", "#3279bd", "#51a76a", "#edb638", "#8b61bd"],
  rainbow: ["#ed5a5a", "#f29b38", "#e5cb35", "#54a96b", "#438bd0", "#8563bd"],
  pastel: ["#f5b7c7", "#b8d8ee", "#c8b9e9", "#c4dfc5", "#f5dfac"],
  monochrome: ["#252525", "#616161", "#909090", "#c1c1c1", "#e1e1e1"]
};
const stickerShapes: CustomPrintShape[] = ["circle", "square", "rectangle", "rounded", "triangle", "star", "heart"];
const toolCards: Array<{ id: CustomPrintTool; name: string; description: string; icon: typeof Circle; color: string }> = [
  { id: "numbers", name: "Number Sticker Maker", description: "Build number ranges and school number sets.", icon: Circle, color: "bg-[#fff0e8] text-[#cf8056]" },
  { id: "alphabet", name: "Alphabet & Letter Maker", description: "English, numbers, Sinhala, words, and initials.", icon: Type, color: "bg-[#f1eafd] text-[#8061a8]" },
  { id: "mini-art", name: "Mini Picture & Art Maker", description: "Tiny original illustrations and your own art.", icon: Flower2, color: "bg-[#eaf5e9] text-[#628c65]" },
  { id: "shapes", name: "Colour & Shape Sticker Maker", description: "Plain shape labels or shapes with text.", icon: Shapes, color: "bg-[#fff5dc] text-[#b38c3d]" },
  { id: "rewards", name: "Reward Label Maker", description: "Friendly teacher praise in English or Sinhala.", icon: Trophy, color: "bg-[#ffedf1] text-[#bd7183]" },
  { id: "bulk-builder", name: "Bulk A4 Print Builder", description: "Combine mixed labels, pictures, and shapes.", icon: Layers, color: "bg-[#edf0fb] text-[#6b78ad]" },
  { id: "saved", name: "Saved Custom Designs", description: "Reopen, duplicate, rename, and delete orders.", icon: Save, color: "bg-[#eef3e8] text-[#718c55]" }
];

const newId = () => crypto.randomUUID();
const timestamp = () => Date.now();
const getDefaultDesign = (): CustomPrintDesign => ({
  id: newId(), name: "Custom print order", tool: "bulk-builder", kind: "order", items: [],
  printSettings: { orientation: "portrait", marginMm: 4, gapMm: 2, calibration: false, cutlines: false },
  createdAt: timestamp(), updatedAt: timestamp()
});

function recentCustomIds(): string[] {
  try {
    const stored = localStorage.getItem(`little-paper-custom-print-recents:${getActiveTenantId()}`);
    const value: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string").slice(0, 10) : [];
  } catch (error) {
    console.error("Could not read recent custom print designs.", error);
    return [];
  }
}

function rememberCustomId(id: string): void {
  try {
    const next = [id, ...recentCustomIds().filter(previous => previous !== id)].slice(0, 10);
    localStorage.setItem(`little-paper-custom-print-recents:${getActiveTenantId()}`, JSON.stringify(next));
  } catch (error) {
    console.error("Could not update recent custom print designs.", error);
    throw new Error("The design was saved, but the recent custom print list could not be updated.");
  }
}

function makeItem(text: string, label: string, options: {
  widthMm: number; heightMm: number; copies: number; shape: CustomPrintShape; background: string;
  color: string; outlineColor: string; outlineWidth: number; borderStyle: CustomPrintItem["borderStyle"];
  fontSize: number; fontFamily: CustomPrintFont; bold: boolean; align: CustomPrintItem["align"];
  artwork?: string; assetId?: string; fit: CustomPrintFit; id?: string;
}): CustomPrintItem {
  return { ...options, id: options.id ?? newId(), label, text };
}

function makeStarPoints(): string {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = Math.PI * index / 5 - Math.PI / 2;
    const radius = index % 2 === 0 ? 48 : 21;
    return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`;
  }).join(" ");
}

function Artwork({ name, color = "#548b69" }: { name: string; color?: string }) {
  const flower = name === "daisy" || name === "tulip" || name === "sunflower" || name === "simple-flower";
  return <svg aria-hidden="true" viewBox="0 0 100 100" className="h-[58%] w-[58%]" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    {name === "rose" ? <><path d="M50 56v32m0-11c-13-13-22-8-20-2 3 7 14 6 20 2m0 8c10-12 19-8 18-2-2 7-12 7-18 2Z" fill="#79a76d"/><path d="M50 53c-10 0-18-8-15-17 2-7 10-10 15-5 5-5 13-2 15 5 3 9-5 17-15 17Zm0-2c-8-8-4-17 2-16 6 1 6 8-2 16Zm-1 0c-11-7-9-16-3-17 5-1 9 7 3 17Z" fill="#df7e91"/></>
      : flower ? <><path d="M50 55v34M50 76c-13-13-22-8-20-2 3 7 14 6 20 2Zm0 8c10-12 19-8 18-2-2 7-12 7-18 2Z" fill="#76a36c"/><g fill={name === "sunflower" ? "#f3bd48" : "#fffdf7"} stroke={color}><ellipse cx="50" cy="27" rx="10" ry="18"/><ellipse cx="50" cy="27" rx="10" ry="18" transform="rotate(45 50 35)"/><ellipse cx="50" cy="27" rx="10" ry="18" transform="rotate(90 50 35)"/><ellipse cx="50" cy="27" rx="10" ry="18" transform="rotate(135 50 35)"/></g><circle cx="50" cy="35" r="10" fill="#efc44b"/></>
      : name === "heart" ? <path d="M50 82 17 49C-3 25 26 5 50 31 74 5 103 25 83 49Z" fill="#e98492"/>
        : name === "star" ? <polygon points={makeStarPoints()} fill="#f2c34c"/>
          : name === "smile" ? <><circle cx="50" cy="50" r="40" fill="#f6d778"/><circle cx="37" cy="42" r="3" fill={color}/><circle cx="63" cy="42" r="3" fill={color}/><path d="M32 57c8 18 28 18 36 0" /></>
            : name === "butterfly" ? <><path d="M50 35v40"/><path d="M47 43C12 7 6 51 43 58c-30 17-3 39 8 13 11 26 38 4 8-13 37-7 31-51-4-15" fill="#d8b8e9"/><path d="m45 34-8-8m18 8 8-8"/></>
              : name === "rainbow" ? <><path d="M12 71a38 38 0 0 1 76 0M24 71a26 26 0 0 1 52 0M36 71a14 14 0 0 1 28 0" strokeWidth="10" stroke="#e76b62"/><path d="M24 70a26 26 0 0 1 52 0" stroke="#efc04c"/><path d="M36 70a14 14 0 0 1 28 0" stroke="#5a9e70"/></>
                : name === "cloud" ? <path d="M23 70h53c19 0 20-25 2-29-3-19-31-23-40-5-21-9-35 20-15 34Z" fill="#d8edf7"/>
                  : name === "leaf" ? <><path d="M20 79C20 37 51 12 83 16c2 35-23 64-63 63Z" fill="#9fcb8c"/><path d="M20 80 68 33m-28 26 1-18m13 6 16-2"/></>
                    : name === "pencil" ? <><path d="m24 69 44-44 13 13-44 44-17 4z" fill="#f0ca57"/><path d="m68 25 8-8 13 13-8 8M24 69l13 13"/></>
                      : name === "book" ? <><path d="M16 22c15-7 25-3 34 5v54c-9-8-19-12-34-6Zm68 0c-15-7-25-3-34 5v54c9-8 19-12 34-6Z" fill="#a6c5e5"/><path d="M25 37h15m-15 9h15m28-9h7m-7 9h7"/></>
                        : name === "apple" ? <><path d="M50 37c-29-17-45 9-35 36 10 25 25 18 35 13 10 5 25 12 35-13 10-27-6-53-35-36Z" fill="#ed7974"/><path d="M50 37c-3-13 3-23 17-25m-16 25c8-12 18-14 26-10" fill="#7cac67"/></>
                          : name === "sports" ? <><circle cx="50" cy="50" r="37" fill="#f5f3e8"/><path d="m50 32 14 10-5 16H41l-5-16Zm0-24 8 24m34 4-28 6m-2 48 8-32m-56 0 28-16M8 36l28 6m-2 50 8-32" /></>
                            : <><circle cx="50" cy="50" r="37" fill="#dbebf6"/><ellipse cx="50" cy="50" rx="48" ry="17" transform="rotate(-25 50 50)"/><circle cx="50" cy="50" r="13" fill="#efc34e"/></>}
  </svg>;
}

function ItemShape({ item, imageUrl, compact = false }: { item: CustomPrintItem; imageUrl?: string; compact?: boolean }) {
  const isHeart = item.shape === "heart";
  const isPolygon = item.shape === "triangle" || item.shape === "star";
  const svgStrokeStyle: React.CSSProperties = {
    strokeWidth: `${item.outlineWidth}mm`,
    strokeDasharray: item.borderStyle === "dashed" ? "4 2" : item.borderStyle === "dotted" ? "1 2" : undefined
  };
  const shapeStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: item.background === "transparent" ? "transparent" : item.background,
    border: item.shape === "triangle" || item.shape === "star" || isHeart ? "none" : `${item.outlineWidth}mm ${item.borderStyle} ${item.outlineColor}`,
    borderRadius: item.shape === "circle" ? "50%" : item.shape === "rounded" ? "16%" : item.shape === "square" ? "0" : "5%",
    printColorAdjust: "exact",
    WebkitPrintColorAdjust: "exact"
  };
  return <div className={`custom-print-item-art ${compact ? "compact" : ""}`} style={{ transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined }}>
    {isHeart && <svg viewBox="0 0 100 100" aria-hidden="true" className="custom-print-vector-shape"><path d="M50 90 11 51C-3 35 5 12 25 12c10 0 18 6 25 15 7-9 15-15 25-15 20 0 28 23 14 39Z" fill={item.background === "transparent" ? "none" : item.background} stroke={item.outlineColor} style={svgStrokeStyle}/></svg>}
    {isPolygon && <svg viewBox="0 0 100 100" aria-hidden="true" className="custom-print-vector-shape"><polygon points={item.shape === "triangle" ? "50,3 97,96 3,96" : makeStarPoints()} fill={item.background === "transparent" ? "none" : item.background} stroke={item.outlineColor} strokeLinejoin="round" style={svgStrokeStyle}/></svg>}
    {!isHeart && !isPolygon && <div className="custom-print-shape" style={shapeStyle}/>}
    {imageUrl ? <Image className={`custom-print-art-image fit-${item.fit}`} src={imageUrl} alt="" fill sizes="240px" unoptimized /> : item.artwork ? <div className="custom-print-artwork"><Artwork name={item.artwork} color={item.color}/></div> : null}
    {item.text && <span className={`custom-print-label-text ${sinhalaFonts.some(font => font.family === item.fontFamily) ? "sinhala" : ""}`} style={{ color: item.color, fontSize: `${fitCustomPrintFontSize(item)}pt`, fontWeight: item.bold ? 700 : 400, textAlign: item.align, justifyContent: item.align === "left" ? "flex-start" : item.align === "right" ? "flex-end" : "center", fontFamily: `"${item.fontFamily}", "Noto Sans Sinhala", sans-serif` }}>{item.text}</span>}
    {compact && <span className="custom-print-label-caption">{item.widthMm} × {item.heightMm} mm</span>}
  </div>;
}

function CustomSheetPage({
  page, layout, orientation, imageUrls, screenPreview = false, calibrationOnly = false, cutlines = false
}: {
  page: number;
  layout: CustomPrintLayout;
  orientation: "portrait" | "landscape";
  imageUrls: Record<string, string>;
  screenPreview?: boolean;
  calibrationOnly?: boolean;
  cutlines?: boolean;
}) {
  const pageWidth = orientation === "portrait" ? 210 : 297;
  const pageHeight = orientation === "portrait" ? 297 : 210;
  const pageItems = calibrationOnly ? [] : layout.placements.filter(placement => placement.page === page);
  return <div className={`custom-print-page ${orientation} ${screenPreview ? "screen-preview" : ""} ${cutlines ? "cutlines" : ""}`} style={{ width: `${pageWidth}mm`, height: `${pageHeight}mm`, page: orientation === "portrait" ? "custom-portrait" : "custom-landscape" }}>
    {pageItems.map(placement => {
      const imageUrl = placement.item.assetId ? imageUrls[placement.item.assetId] : undefined;
      return <div key={`${placement.item.id}-${placement.copyIndex}`} className={`custom-print-placed ${cutlines ? "cutline" : ""}`} style={{ left: `${placement.xMm}mm`, top: `${placement.yMm}mm`, width: `${placement.item.widthMm}mm`, height: `${placement.item.heightMm}mm` }}>
        <ItemShape item={placement.item} imageUrl={imageUrl}/>
      </div>;
    })}
    {calibrationOnly && <div className="custom-print-calibration" style={{ left: `${Math.max(5, (pageWidth - 50) / 2)}mm`, top: `${Math.max(5, (pageHeight - 50) / 2)}mm` }}><div/>50 mm test square</div>}
  </div>;
}

export function CustomPrintStudio({
  assets, assetUrls, onUpload
}: {
  assets: ImageAsset[];
  assetUrls: Record<string, string>;
  onUpload: (files: FileList | null) => Promise<void>;
}) {
  const { confirm, prompt, host: dialogHost } = useAppDialog();
  const [activeTool, setActiveTool] = useState<ToolPage>("dashboard");
  const [design, setDesign] = useState<CustomPrintDesign>(getDefaultDesign);
  const [makerDesign, setMakerDesign] = useState<CustomPrintDesign | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [hexColorDrafts, setHexColorDrafts] = useState<Record<string, string>>({});
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const [savedDesigns, setSavedDesigns] = useState<CustomPrintDesign[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [imageSearch, setImageSearch] = useState("");
  const [selectedArtwork, setSelectedArtwork] = useState("daisy");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [alphabetMode, setAlphabetMode] = useState("uppercase");
  const [numberPreset, setNumberPreset] = useState("1-10");
  const [numberLabelStyle, setNumberLabelStyle] = useState<NumberLabelStyle>("digits");
  const [numberStart, setNumberStart] = useState("1");
  const [numberEnd, setNumberEnd] = useState("10");
  const [manualNumbers, setManualNumbers] = useState<number[]>([]);
  const [manualSelectionEnabled, setManualSelectionEnabled] = useState(false);
  const [customText, setCustomText] = useState("");
  const [shapeText, setShapeText] = useState("");
  const [showShapeText, setShowShapeText] = useState(false);
  const [customShapeColor, setCustomShapeColor] = useState("#397b68");
  const [selectedRewards, setSelectedRewards] = useState<string[]>(["Good Job", "Excellent", "Well Done"]);
  const [toolShapes, setToolShapes] = useState<Record<CustomPrintTool, CustomPrintShape>>({
    numbers: "rounded",
    alphabet: "rounded",
    "mini-art": "rounded",
    shapes: "rounded",
    rewards: "star",
    "text-labels": "rounded",
    "bulk-builder": "rounded",
    saved: "rounded"
  });
  const [paletteName, setPaletteName] = useState<PaletteName>("school");
  const [selectedColors, setSelectedColors] = useState<string[]>(palettes.school.slice(0, 3));
  const [background, setBackground] = useState("#fffdf7");
  const [textColor, setTextColor] = useState("#26394a");
  const [outlineColor, setOutlineColor] = useState("#397b68");
  const [outlineWidth, setOutlineWidth] = useState("0.5");
  const [borderStyle, setBorderStyle] = useState<CustomPrintItem["borderStyle"]>("solid");
  const [fontFamily, setFontFamily] = useState<CustomPrintFont>("Inter");
  const [fontSize, setFontSize] = useState("24");
  const [bold, setBold] = useState(true);
  const [align, setAlign] = useState<CustomPrintItem["align"]>("center");
  const [sizeUnit, setSizeUnit] = useState<"mm" | "cm">("mm");
  const [width, setWidth] = useState("20");
  const [height, setHeight] = useState("20");
  const [copies, setCopies] = useState("1");
  const [pictureFit, setPictureFit] = useState<CustomPrintFit>("contain");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState("4");
  const [gap, setGap] = useState("2");
  const [pageIndex, setPageIndex] = useState(0);
  const [calibration, setCalibration] = useState(false);
  const [cutlines, setCutlines] = useState(false);
  const currentPrintSettings = { orientation, marginMm: Number(margin), gapMm: Number(gap), calibration, cutlines };
  const latestDesign = useRef(design);
  const latestMakerDesign = useRef(makerDesign);
  useEffect(() => {
    latestDesign.current = design;
    latestMakerDesign.current = makerDesign;
  }, [design, makerDesign]);

  const allArtwork = useMemo(() => artworkOptions.filter(option =>
    `${option.name} ${option.category}`.toLowerCase().includes(imageSearch.toLowerCase())
  ), [imageSearch]);
  const imageAssetUrls = useMemo(() => Object.fromEntries(assets
    .filter(asset => asset.type.startsWith("image/"))
    .map(asset => [asset.id, assetUrls[asset.id]])), [assets, assetUrls]);
  const selectedAsset = assets.find(asset => asset.id === selectedAssetId);
  const liveArtworkUrl = selectedAsset ? assetUrls[selectedAsset.id] : undefined;
  const currentNumberValues = useMemo(() => {
    const start = Number(numberStart);
    const end = Number(numberEnd);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || end - start > 99) return [];
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [numberStart, numberEnd]);
  const layout = useMemo(() => {
    try {
      return calculateCustomPrintLayout(design.items, {
        orientation, marginMm: Number(margin), gapMm: Number(gap)
      });
    } catch {
      return null;
    }
  }, [design.items, gap, margin, orientation]);
  const layoutError = useMemo(() => {
    if (!design.items.length) return "";
    try {
      calculateCustomPrintLayout(design.items, { orientation, marginMm: Number(margin), gapMm: Number(gap) });
      return "";
    } catch (cause) {
      return cause instanceof Error ? cause.message : "Could not lay out the current print items.";
    }
  }, [design.items, gap, margin, orientation]);
  const makerLayout = useMemo(() => {
    if (!makerDesign) return null;
    try {
      return calculateCustomPrintLayout(makerDesign.items, {
        orientation: makerDesign.printSettings.orientation,
        marginMm: makerDesign.printSettings.marginMm,
        gapMm: makerDesign.printSettings.gapMm
      });
    } catch {
      return null;
    }
  }, [makerDesign]);
  const makerLayoutError = useMemo(() => {
    if (!makerDesign?.items.length) return "";
    try {
      calculateCustomPrintLayout(makerDesign.items, makerDesign.printSettings);
      return "";
    } catch (cause) {
      return cause instanceof Error ? cause.message : "Could not lay out this sticker design.";
    }
  }, [makerDesign]);
  const recentDesigns = recentIds.map(id => savedDesigns.find(item => item.id === id)).filter((item): item is CustomPrintDesign => Boolean(item));
  const editingMaker = activeTool === "maker-preview";
  const editableDesign = editingMaker ? makerDesign : design;
  const selectedItems = editableDesign?.items.filter(item => selectedItemIds.includes(item.id)) ?? [];
  const selectedItem = selectedItems[0];

  useEffect(() => {
    let active = true;
    void db.getAllCustomPrintDesigns().then(stored => {
      if (active) setSavedDesigns(stored.sort((a, b) => b.updatedAt - a.updatedAt));
    }).catch(cause => {
      if (active) setError(cause instanceof Error ? cause.message : "Could not load saved custom print designs.");
    });
    void Promise.resolve().then(() => {
      if (active) {
        try { setRecentIds(recentCustomIds()); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Could not read recent custom designs."); }
      }
    });
    return () => { active = false; };
  }, []);

  const persistDesign = async (next: CustomPrintDesign, notice?: string) => {
    const saved = { ...next, kind: next.kind ?? "order", updatedAt: timestamp() };
    try {
      await db.putCustomPrintDesign(saved);
      rememberCustomId(saved.id);
      setDesign(saved);
      setSavedDesigns(previous => [saved, ...previous.filter(item => item.id !== saved.id)].sort((a, b) => b.updatedAt - a.updatedAt));
      setRecentIds(recentCustomIds());
      setError("");
      if (notice) setMessage(notice);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this custom print design.");
    }
  };

  const updateSelectedItems = (patch: Partial<CustomPrintItem>, itemIds = selectedItemIds) => {
    const current = editingMaker ? latestMakerDesign.current : latestDesign.current;
    if (!current) return;
    const next = { ...current, updatedAt: timestamp(), items: updateCustomPrintItems(current.items, itemIds, patch) };
    if (editingMaker) {
      latestMakerDesign.current = next;
      setMakerDesign(next);
    } else {
      latestDesign.current = next;
      setDesign(next);
    }
    setSavedDesigns(previous => [next, ...previous.filter(item => item.id !== next.id)].sort((a, b) => b.updatedAt - a.updatedAt));
    saveQueue.current = saveQueue.current.then(async () => { await db.putCustomPrintDesign(next); }).catch(cause => {
      setError(cause instanceof Error ? cause.message : "Could not save the edited sticker design.");
    });
  };

  const removeSelectedItems = () => {
    const current = editingMaker ? latestMakerDesign.current : latestDesign.current;
    if (!current) return;
    const next = { ...current, updatedAt: timestamp(), items: current.items.filter(item => !selectedItemIds.includes(item.id)) };
    if (editingMaker) {
      latestMakerDesign.current = next;
      setMakerDesign(next);
    } else {
      latestDesign.current = next;
      setDesign(next);
    }
    setSelectedItemIds([]);
    setSavedDesigns(previous => [next, ...previous.filter(item => item.id !== next.id)].sort((a, b) => b.updatedAt - a.updatedAt));
    saveQueue.current = saveQueue.current.then(async () => { await db.putCustomPrintDesign(next); }).catch(cause => {
      setError(cause instanceof Error ? cause.message : "Could not save the edited sticker design.");
    });
  };

  const duplicateSelectedItems = () => {
    const current = editingMaker ? latestMakerDesign.current : latestDesign.current;
    if (!current || !selectedItemIds.length) return;
    const duplicates = current.items.filter(item => selectedItemIds.includes(item.id)).map(item => ({ ...item, id: newId() }));
    if (current.items.reduce((sum, item) => sum + item.copies, 0) + duplicates.reduce((sum, item) => sum + item.copies, 0) > 5000) {
      setError("A print design can contain at most 5,000 individual stickers.");
      return;
    }
    const next = { ...current, updatedAt: timestamp(), items: [...current.items, ...duplicates] };
    if (editingMaker) {
      latestMakerDesign.current = next;
      setMakerDesign(next);
    } else {
      latestDesign.current = next;
      setDesign(next);
    }
    setSelectedItemIds(duplicates.map(item => item.id));
    setSavedDesigns(previous => [next, ...previous.filter(item => item.id !== next.id)].sort((a, b) => b.updatedAt - a.updatedAt));
    saveQueue.current = saveQueue.current.then(async () => { await db.putCustomPrintDesign(next); }).catch(cause => {
      setError(cause instanceof Error ? cause.message : "Could not save the duplicated stickers.");
    });
  };

  const renderSelectedItemEditor = () => {
    if (!selectedItem || !editableDesign) return null;
    const numericValue = (value: string, key: "widthMm" | "heightMm" | "fontSize" | "outlineWidth" | "rotation" | "copies") => {
      const number = Number(value);
      if (!Number.isFinite(number)) return;
      const valid = key === "widthMm" || key === "heightMm" ? number > 0 && number <= 297
        : key === "fontSize" ? number >= 4 && number <= 160
          : key === "outlineWidth" ? number >= 0 && number <= 5
            : key === "copies" ? Number.isInteger(number) && number >= 1 && number <= 1000
              : number >= -360 && number <= 360;
      if (valid) {
        const itemIds = editingMaker && editableDesign?.tool === "numbers" && key === "fontSize"
          ? editableDesign.items.map(item => item.id)
          : selectedItemIds;
        updateSelectedItems({ [key]: number }, itemIds);
      }
    };
    const colorField = (label: string, value: string, key: "background" | "color" | "outlineColor") => <label className="field-label">{label}<div className="mt-2 flex gap-2"><input className="text-input h-10 w-14 p-1" type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"} onChange={event => updateSelectedItems({ [key]: event.target.value })}/><input className="text-input min-w-0 flex-1" aria-label={`${label} HEX`} value={hexColorDrafts[key] ?? value} onFocus={() => setHexColorDrafts(previous => ({ ...previous, [key]: value }))} onChange={event => { const next = event.target.value; setHexColorDrafts(previous => ({ ...previous, [key]: next })); if (/^#[0-9a-f]{6}$/i.test(next)) updateSelectedItems({ [key]: next }); }} onBlur={event => { if (/^#[0-9a-f]{6}$/i.test(event.target.value)) updateSelectedItems({ [key]: event.target.value }); setHexColorDrafts(previous => ({ ...previous, [key]: /^#[0-9a-f]{6}$/i.test(event.target.value) ? event.target.value : value })); }}/></div></label>;
    const sizeControl = (label: string, key: "widthMm" | "heightMm", max: number) => <label className="field-label">{label}<input className="text-input mt-2" type="number" min="0.1" max="297" step="0.1" value={selectedItem[key]} onChange={event => numericValue(event.target.value, key)}/><input className="mt-2 w-full accent-[#397b68]" aria-label={`${label} slider`} type="range" min="1" max={max} step="1" value={Math.min(max, selectedItem[key])} onChange={event => numericValue(event.target.value, key)}/></label>;
    return <section className="mt-5 rounded-xl border border-[#e9eee9] bg-[#fbfdfb] p-4" aria-label="Selected sticker editor">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><b className="text-sm">Edit selected sticker{selectedItems.length > 1 ? "s" : ""}</b><p className="mt-1 text-[11px] text-slate-500">{selectedItems.length} selected · updates save automatically</p>{editingMaker && editableDesign.tool === "numbers" && <p className="mt-1 text-[11px] text-slate-500">Width and height change only for selected numbers. Font size updates every number; larger stickers continue onto extra A4 pages.</p>}</div><div className="flex gap-2"><button className="small-action" onClick={duplicateSelectedItems}><Copy size={13}/> Duplicate</button><button className="small-action danger" onClick={removeSelectedItems}><Trash2 size={13}/> Delete</button></div></div>
      <label className="field-label block">Sticker text<textarea className="text-input mt-2 min-h-16" lang="si" dir="auto" value={selectedItem.text} onChange={event => updateSelectedItems({ text: event.target.value, label: event.target.value || selectedItem.label })}/></label>
      <div className="mt-3 grid grid-cols-2 gap-3">{sizeControl("Width (mm)", "widthMm", 200)}{sizeControl("Height (mm)", "heightMm", 280)}</div>
      {selectedItems.some(item => item.text) && <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="field-label">Font family<select className="text-input mt-2" value={selectedItem.fontFamily} onChange={event => updateSelectedItems({ fontFamily: event.target.value as CustomPrintFont })}><optgroup label="English">{englishFonts.map(font => <option key={font.family} value={font.family}>{font.family}</option>)}</optgroup><optgroup label="Sinhala">{sinhalaFonts.map(font => <option key={font.family} value={font.family}>{font.family}</option>)}</optgroup></select></label>
        <label className="field-label">Font size (pt)<input className="text-input mt-2" type="number" min="4" max="160" step="1" value={selectedItem.fontSize} onChange={event => numericValue(event.target.value, "fontSize")}/><input className="mt-2 w-full accent-[#397b68]" aria-label="Font size slider" type="range" min="4" max="160" value={selectedItem.fontSize} onChange={event => numericValue(event.target.value, "fontSize")}/></label>
        {colorField("Text colour", selectedItem.color, "color")}
        <label className="field-label">Text alignment<select className="text-input mt-2" value={selectedItem.align} onChange={event => updateSelectedItems({ align: event.target.value as CustomPrintItem["align"] })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
        <label className="col-span-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={selectedItem.bold} onChange={event => updateSelectedItems({ bold: event.target.checked })}/> Bold text</label>
      </div>}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="field-label">Shape<select className="text-input mt-2" value={selectedItem.shape} onChange={event => updateSelectedItems({ shape: event.target.value as CustomPrintShape })}>{["circle", "square", "rectangle", "rounded", "triangle", "star", "heart", "image"].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="field-label">Copies<input className="text-input mt-2" type="number" min="1" max="1000" step="1" value={selectedItem.copies} onChange={event => numericValue(event.target.value, "copies")}/></label>
        {colorField("Fill colour", selectedItem.background === "transparent" ? "#ffffff" : selectedItem.background, "background")}
        {colorField("Border colour", selectedItem.outlineColor, "outlineColor")}
        <label className="field-label">Border thickness (mm)<input className="text-input mt-2" type="number" min="0" max="5" step="0.1" value={selectedItem.outlineWidth} onChange={event => numericValue(event.target.value, "outlineWidth")}/></label>
        <label className="field-label">Border style<select className="text-input mt-2" value={selectedItem.borderStyle} onChange={event => updateSelectedItems({ borderStyle: event.target.value as CustomPrintItem["borderStyle"] })}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option></select></label>
        <label className="field-label">Rotation (degrees)<input className="text-input mt-2" type="number" min="-360" max="360" step="1" value={selectedItem.rotation ?? 0} onChange={event => numericValue(event.target.value, "rotation")}/></label>
        <label className="col-span-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={selectedItem.background === "transparent"} onChange={event => updateSelectedItems({ background: event.target.checked ? "transparent" : "#fffdf7" })}/> Transparent fill</label>
      </div>
    </section>;
  };

  const updatePrintSettings = (next: CustomPrintDesign["printSettings"]) => {
    setOrientation(next.orientation);
    setMargin(String(next.marginMm));
    setGap(String(next.gapMm));
    setCalibration(next.calibration);
    setCutlines(next.cutlines);
    void persistDesign({ ...design, printSettings: next });
  };

  const appendItems = async (items: CustomPrintItem[], source: CustomPrintTool) => {
    if (!items.length) {
      setError("Choose or enter at least one item to create a separate design.");
      return;
    }
    try {
      const now = timestamp();
      const batch: CustomPrintDesign = {
        id: newId(),
        name: `${toolCards.find(card => card.id === source)?.name ?? "Custom"} design`,
        tool: source,
        kind: "maker",
        items,
        printSettings: currentPrintSettings,
        createdAt: now,
        updatedAt: now
      };
      calculateCustomPrintLayout(items, {
        orientation: batch.printSettings.orientation,
        marginMm: batch.printSettings.marginMm,
        gapMm: batch.printSettings.gapMm
      });
      await db.putCustomPrintDesign(batch);
      rememberCustomId(batch.id);
      setMakerDesign(batch);
      setSavedDesigns(previous => [batch, ...previous.filter(item => item.id !== batch.id)].sort((a, b) => b.updatedAt - a.updatedAt));
      setRecentIds(recentCustomIds());
      setError("");
      setMessage("A separate maker design was saved. Print it here or add it to your mixed A4 order.");
      setPageIndex(0);
      setActiveTool("maker-preview");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this maker design.");
    }
  };

  const dimensionMm = (value: string) => Number(value) * (sizeUnit === "cm" ? 10 : 1);
  const commonSettings = () => {
    const widthMm = dimensionMm(width);
    const heightMm = dimensionMm(height);
    const copiesValue = Number(copies);
    const fontSizeValue = Number(fontSize);
    const outlineValue = Number(outlineWidth);
    if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm) || widthMm <= 0 || heightMm <= 0 || widthMm > 200 || heightMm > 280) {
      throw new RangeError("Enter a positive label size up to 200 mm wide and 280 mm high.");
    }
    if (!Number.isInteger(copiesValue) || copiesValue < 1 || copiesValue > 1000) throw new RangeError("Copies must be a whole number from 1 to 1,000.");
    if (!Number.isFinite(fontSizeValue) || fontSizeValue < 4 || fontSizeValue > 160) throw new RangeError("Font size must be between 4 and 160 points.");
    if (!Number.isFinite(outlineValue) || outlineValue < 0 || outlineValue > 5) throw new RangeError("Outline thickness must be between 0 and 5 mm.");
    return {
      widthMm, heightMm, copies: copiesValue, background, color: textColor, outlineColor,
      outlineWidth: outlineValue, borderStyle, fontSize: fontSizeValue, fontFamily, bold, align, fit: pictureFit
    } as const;
  };

  const createLabelItems = (texts: string[], tool: CustomPrintTool, selectedShape = toolShapes[tool], artwork?: string, assetId?: string) => {
    const common = commonSettings();
    const palette = paletteName === "school" ? [] : palettes[paletteName];
    return texts.map((text, index) => {
      const itemColor = selectedColors.length ? selectedColors[index % selectedColors.length] : common.color;
      return makeItem(text, text || artworkOptions.find(option => option.id === artwork)?.name || "Shape", {
        ...common,
        color: selectedColors.length ? itemColor : common.color,
        shape: selectedShape,
        artwork,
        assetId,
        background: palette.length && !artwork && tool === "shapes"
          ? palette[index % palette.length]
          : common.background
      });
    });
  };

  const generateNumbers = async () => {
    setError("");
    try {
      const [start, end] = numberPreset === "1-10" ? [1, 10]
        : numberPreset === "1-20" ? [1, 20]
          : numberPreset === "1-50" ? [1, 50]
            : numberPreset === "1-100" ? [1, 100] : [Number(numberStart), Number(numberEnd)];
      const values = createNumberValues(start, end);
      const selection = numberPreset === "custom" && manualSelectionEnabled
        ? values.filter(value => manualNumbers.includes(value))
        : values;
      const made = createLabelItems(selection.map(value => formatNumberLabel(value, numberLabelStyle)), "numbers");
      await appendItems(made, "numbers");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate this number range.");
    }
  };

  const generateAlphabet = async () => {
    setError("");
    try {
      const input = parseCustomLabels(customText);
      const text = customText;
      const values = alphabetMode === "uppercase" ? Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))
        : alphabetMode === "lowercase" ? Array.from({ length: 26 }, (_, index) => String.fromCharCode(97 + index))
          : alphabetMode === "digits" ? Array.from({ length: 10 }, (_, index) => String(index))
            : alphabetMode === "graphemes" ? (typeof Intl.Segmenter === "function"
              ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), part => part.segment)
              : Array.from(text))
              : input;
      await appendItems(createLabelItems(values, "alphabet"), "alphabet");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate these letters.");
    }
  };

  const generateMiniArt = async () => {
    setError("");
    try {
      const artwork = selectedAssetId ? undefined : selectedArtwork;
      const assetId = selectedAssetId || undefined;
      const [pictureItem] = createLabelItems([""], "mini-art", toolShapes["mini-art"], artwork, assetId);
      pictureItem.label = selectedAsset?.name ?? artworkOptions.find(option => option.id === selectedArtwork)?.name ?? "Picture";
      await appendItems([pictureItem], "mini-art");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the picture stickers.");
    }
  };

  const generateShapes = async () => {
    setError("");
    try {
      const colorsToUse = selectedColors.length ? selectedColors : [background];
      const common = commonSettings();
      const labels = showShapeText && shapeText.trim() ? parseCustomLabels(shapeText) : [""];
      const made = colorsToUse.flatMap((color, index) => labels.map((text, labelIndex) => makeItem(text, text || `Shape ${index + 1}`, {
        ...common, shape: toolShapes.shapes, background: color, color: textColor, outlineColor, outlineWidth: common.outlineWidth,
        id: `${newId()}-${labelIndex}`
      })));
      await appendItems(made, "shapes");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create these shape stickers.");
    }
  };

  const generateRewards = async () => {
    setError("");
    try {
      const texts = [...selectedRewards, ...parseCustomLabels(customText)];
      if (!texts.length) throw new RangeError("Select a reward message or enter custom text.");
      await appendItems(createLabelItems(texts, "rewards"), "rewards");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create reward labels.");
    }
  };

  const updateItems = async (items: CustomPrintItem[]) => {
    await persistDesign({ ...design, items }, "Print order updated.");
  };

  const openSaved = (saved: CustomPrintDesign) => {
    setOrientation(saved.printSettings.orientation);
    setMargin(String(saved.printSettings.marginMm));
    setGap(String(saved.printSettings.gapMm));
    setCalibration(saved.printSettings.calibration);
    setCutlines(saved.printSettings.cutlines);
    if (saved.kind === "maker") {
      setMakerDesign({ ...saved });
      setActiveTool("maker-preview");
    } else {
      setDesign({ ...saved });
      setActiveTool("bulk-builder");
    }
    setPageIndex(0);
    setMessage(`Opened “${saved.name}”.`);
    void rememberOpened(saved);
  };

  const rememberOpened = async (saved: CustomPrintDesign) => {
    try {
      rememberCustomId(saved.id);
      setRecentIds(recentCustomIds());
      await db.putCustomPrintDesign({ ...saved, updatedAt: timestamp() });
      setSavedDesigns(previous => [{ ...saved, updatedAt: timestamp() }, ...previous.filter(item => item.id !== saved.id)]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update recent custom designs.");
    }
  };

  const duplicateSaved = async (saved: CustomPrintDesign) => {
    const now = timestamp();
    const copy = { ...saved, id: newId(), name: `${saved.name} copy`, createdAt: now, updatedAt: now, items: saved.items.map(item => ({ ...item, id: newId() })) };
    await persistDesign(copy, "A copy of the custom print design was saved.");
  };

  const renameSaved = async (saved: CustomPrintDesign) => {
    const name = await prompt("Rename custom design", "Give this custom design a name", saved.name);
    if (!name?.trim()) return;
    const renamed = { ...saved, name: name.trim() };
    await persistDesign(renamed, "Custom design renamed.");
  };

  const deleteSaved = async (saved: CustomPrintDesign) => {
    if (!await confirm("Delete custom design", `Delete “${saved.name}” from this device? This cannot be undone.`)) return;
    try {
      await db.deleteCustomPrintDesign(saved.id);
      setSavedDesigns(previous => previous.filter(item => item.id !== saved.id));
      const nextRecent = recentCustomIds().filter(id => id !== saved.id);
      localStorage.setItem(`little-paper-custom-print-recents:${getActiveTenantId()}`, JSON.stringify(nextRecent));
      setRecentIds(nextRecent);
      if (design.id === saved.id) setDesign(getDefaultDesign());
      setMessage("Saved custom print design deleted.");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this custom design.");
    }
  };

  const printOrder = async () => {
    if (!layout?.pages) {
      setError(layoutError || "Add at least one sticker to the A4 builder before printing.");
      return;
    }
    await printDesign("order");
  };

  const printMakerDesign = async () => {
    if (!makerDesign || !makerLayout?.pages) {
      setError("Generate a valid sticker design before printing.");
      return;
    }
    await printDesign("maker");
  };

  const printDesign = async (target: "order" | "maker") => {
    try {
      const items = target === "order" ? design.items : makerDesign?.items ?? [];
      await Promise.all(items.filter(item => item.text).map(item =>
        document.fonts.load(`${item.bold ? 700 : 400} ${item.fontSize}px "${item.fontFamily}"`, item.text)
      ));
      await document.fonts.ready;
      const selector = target === "order" ? ".custom-print-order-pages" : ".custom-print-maker-pages";
      const pages = document.querySelector(selector);
      if (!pages) throw new Error("The print preview is not available.");
      const images = Array.from(pages.querySelectorAll<HTMLImageElement>("img"));
      await Promise.all(images.map(image => image.decode()));
      document.documentElement.dataset.customPrintTarget = target;
      document.documentElement.classList.add("custom-print-mode");
      const result = await printCurrentPage({ orientation: target === "order" ? orientation : makerDesign?.printSettings.orientation ?? "portrait" });
      if (result.status === "printed") setMessage(`Print job sent to ${result.printerName}.`);
      else if (result.status === "previewed") setMessage("Print preview opened. Choose your printer and select Print.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not prepare all custom print images and fonts.");
    } finally {
      document.documentElement.classList.remove("custom-print-mode");
      delete document.documentElement.dataset.customPrintTarget;
    }
  };

  const addMakerDesignToOrder = async () => {
    if (!makerDesign) return;
    const items = [...design.items, ...makerDesign.items];
    try {
      if (items.reduce((sum, item) => sum + item.copies, 0) > 5000) {
        throw new RangeError("A print order can contain at most 5,000 individual stickers.");
      }
      calculateCustomPrintLayout(items, currentPrintSettings);
      await persistDesign({
        ...design,
        name: design.name === "Custom print order" ? makerDesign.name : design.name,
        printSettings: currentPrintSettings,
        items
      }, `${makerDesign.items.reduce((sum, item) => sum + item.copies, 0)} sticker(s) added to the mixed A4 order.`);
      setPageIndex(0);
      setActiveTool("bulk-builder");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "These items cannot be added to the A4 order.");
    }
  };

  const setRangePreset = (value: string) => {
    setNumberPreset(value);
    const [start, end] = value === "custom" ? [Number(numberStart) || 1, Number(numberEnd) || 10] : value.split("-").map(Number);
    setNumberStart(String(start));
    setNumberEnd(String(end));
    setManualNumbers([]);
    setManualSelectionEnabled(false);
  };

  const selectPalette = (value: PaletteName) => {
    setPaletteName(value);
    setSelectedColors(value === "school" ? [] : [...palettes[value]]);
  };
  const selectToolShape = (tool: CustomPrintTool, value: CustomPrintShape) => {
    setToolShapes(previous => ({ ...previous, [tool]: value }));
  };

  const selectedTool = toolCards.find(card => card.id === activeTool);
  const mainPreviewText = activeTool === "numbers" ? (() => {
    try { return formatNumberLabel(numberPreset === "1-100" ? 42 : Number(numberStart) || 1, numberLabelStyle); }
    catch { return "1"; }
  })()
    : activeTool === "alphabet" ? alphabetMode === "uppercase" ? "A" : alphabetMode === "lowercase" ? "a" : alphabetMode === "digits" ? "1" : parseCustomLabels(customText)[0] ?? "අ"
      : activeTool === "rewards" ? selectedRewards[0] ?? "Well Done"
        : activeTool === "shapes" ? showShapeText ? parseCustomLabels(shapeText)[0] ?? "" : ""
        : activeTool === "mini-art" ? ""
          : customText || "Your label";
  const previewItem = makeItem(mainPreviewText, "Preview", {
    widthMm: Number.isFinite(dimensionMm(width)) && dimensionMm(width) > 0 ? dimensionMm(width) : 20,
    heightMm: Number.isFinite(dimensionMm(height)) && dimensionMm(height) > 0 ? dimensionMm(height) : 20,
    copies: 1,
    shape: activeTool === "maker-preview" ? selectedItem?.shape ?? "rounded"
      : activeTool === "dashboard" || activeTool === "saved" ? "rounded"
        : toolShapes[activeTool],
    background: activeTool === "shapes" && selectedColors.length ? selectedColors[0] : background,
    color: textColor,
    outlineColor,
    outlineWidth: Number(outlineWidth) || 0,
    borderStyle,
    fontSize: Number(fontSize) || 24,
    fontFamily,
    bold,
    align,
    artwork: activeTool === "mini-art" && !selectedAssetId ? selectedArtwork : undefined,
    assetId: activeTool === "mini-art" ? selectedAssetId || undefined : undefined,
    fit: pictureFit
  });
  const previewOrientation = activeTool === "maker-preview" && makerDesign ? makerDesign.printSettings.orientation : orientation;
  const previewCalibration = activeTool === "maker-preview" && makerDesign ? makerDesign.printSettings.calibration : calibration;
  const previewCutlines = activeTool === "maker-preview" && makerDesign ? makerDesign.printSettings.cutlines : cutlines;
  const currentLayout = activeTool === "maker-preview" ? makerLayout : layout;
  const pageWidthMm = previewOrientation === "portrait" ? 210 : 297;
  const pageHeightMm = previewOrientation === "portrait" ? 297 : 210;
  const activePageCount = currentLayout?.pages ? currentLayout.pages + Number(previewCalibration) : 0;
  const previewStickerCount = currentLayout?.total ?? 0;
  const hasSmallPrintText = (activeTool === "maker-preview" ? makerDesign?.items ?? [] : design.items)
    .some(item => item.text && fitCustomPrintFontSize(item) < 8);
  const previewTextIsSmall = previewItem.text && fitCustomPrintFontSize(previewItem) < 8;

  return <LocalizedUi><div className="custom-print-studio space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><div className="eyebrow">LOCAL DESIGN · TRUE PRINT SIZE</div><h1 className="page-title">Custom Print Studio</h1><p className="mt-2 text-sm text-slate-500">Make small stickers and print mixed batches at their requested physical size.</p></div>
      {activeTool !== "dashboard" && <button className="secondary-button" onClick={() => setActiveTool("dashboard")}><ArrowLeft size={14}/> All tools</button>}
    </div>
    <div className="app-toast-stack no-print">
      {message && <AppToast key={`success-${message}`} variant="success" message={message} onClose={() => setMessage("")}/>}
      {error && <AppToast key={`error-${error}`} variant="error" message={error} onClose={() => setError("")}/>}
    </div>

    {activeTool === "dashboard" && <div className="space-y-6">
      <div className="hero-panel relative overflow-hidden rounded-[24px] p-7 md:p-8"><div className="relative z-10 max-w-[570px]"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#8d5960]"><Sparkles size={14}/> FOR YOUR EVERYDAY BOOKSHOP ORDERS</div><h2 className="text-2xl font-bold leading-tight">Little labels, in any size.</h2><p className="mt-2 max-w-lg text-sm leading-6 text-[#756b70]">Create numbers, letters, pictures, shapes, reward notes, or custom labels—then combine everything into an accurately sized A4 print run.</p><button className="primary-button mt-4" onClick={() => setActiveTool("numbers")}><Plus size={15}/> Start a print order <ChevronRight size={15}/></button></div><div className="hero-art" aria-hidden="true"><div className="hero-sun">✿</div><div className="hero-sticker"><span>✦</span><b>20 × 20</b><small>MILLIMETRE STICKERS</small></div><div className="hero-star">✷</div></div></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{toolCards.map(card => { const Icon = card.icon; return <button key={card.id} onClick={() => setActiveTool(card.id)} className="soft-card custom-print-tool-card p-5 text-left"><span className={`grid h-10 w-10 place-items-center rounded-xl ${card.color}`}><Icon size={19}/></span><b className="mt-4 block text-sm">{card.name}</b><p className="mt-1 text-xs leading-5 text-slate-500">{card.description}</p><span className="mt-4 inline-flex items-center text-xs font-semibold text-[#397b68]">Open tool <ChevronRight size={13}/></span></button>; })}</div>
      <section className="soft-card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold">Recently used custom designs</h2><p className="mt-1 text-xs text-slate-500">The latest 10 are shown here; older designs stay saved.</p></div><button className="text-xs font-semibold text-[#397b68]" onClick={() => setActiveTool("saved")}>See saved designs</button></div>
        {recentDesigns.length ? <div className="flex flex-wrap gap-3">{recentDesigns.slice(0, 5).map(saved => <button key={saved.id} className="custom-recent-chip" onClick={() => openSaved(saved)}><span className="rounded-lg bg-[#e8f2ec] p-2 text-[#397b68]"><Layers size={15}/></span><span><b>{saved.name}</b><small>{saved.items.length} item types · {saved.updatedAt ? new Date(saved.updatedAt).toLocaleDateString() : "Saved locally"}</small></span></button>)}</div> : <div className="empty-strip">No custom print orders yet. <span>Choose a maker to begin.</span></div>}
      </section>
    </div>}

    {activeTool === "saved" && <section className="space-y-4"><div><div className="eyebrow">ON THIS DEVICE</div><h2 className="text-lg font-bold">Saved Custom Designs</h2><p className="mt-1 text-xs text-slate-500">Stored locally in IndexedDB; deleting an entry only removes that custom design.</p></div>
      {savedDesigns.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{savedDesigns.map(saved => <div key={saved.id} className="soft-card p-4"><button className="w-full text-left" onClick={() => openSaved(saved)}><b className="block truncate text-sm">{saved.name}</b><small className="mt-1 block text-slate-500">{saved.items.length} item types · {saved.items.reduce((sum, item) => sum + item.copies, 0)} stickers · {new Date(saved.updatedAt).toLocaleDateString()}</small><div className="mt-3 flex gap-1 overflow-hidden">{saved.items.slice(0, 5).map(item => <div key={item.id} className="custom-saved-thumb" style={{ background: item.background === "transparent" ? "#fff" : item.background, color: item.color }}>{item.artwork ? <Artwork name={item.artwork} color={item.color}/> : item.text.slice(0, 3)}</div>)}</div></button><div className="mt-3 flex gap-2"><button className="small-action flex-1" onClick={() => openSaved(saved)}>Open</button><button className="small-action" title="Duplicate saved design" onClick={() => void duplicateSaved(saved)}><Copy size={14}/></button><button className="small-action" title="Rename saved design" onClick={() => void renameSaved(saved)}>✎</button><button className="small-action" title="Delete saved design" onClick={() => void deleteSaved(saved)}><Trash2 size={14}/></button></div></div>)}</div> : <div className="empty-large"><div className="empty-illustration"><Save size={24}/></div><h3>No saved custom designs yet</h3><p>Generate stickers and add them to your A4 builder. Your order is saved on this device automatically.</p><button className="primary-button mt-4" onClick={() => setActiveTool("numbers")}><Plus size={15}/> Create a print order</button></div>}
    </section>}

    {activeTool !== "dashboard" && activeTool !== "saved" && <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(330px,440px)]">
      <section className="soft-card p-5 md:p-6">
        {activeTool === "maker-preview" && makerDesign ? <div>
          <div className="eyebrow">SEPARATE DESIGN · {toolCards.find(card => card.id === makerDesign.tool)?.name.toUpperCase() ?? "CUSTOM STICKERS"}</div>
          <h2 className="mt-1 text-lg font-bold">{makerDesign.name}</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">This maker design is saved separately. Printing here will not include items from your mixed A4 order.</p>
          <div className="mt-4 flex flex-wrap gap-2"><button className="small-action" onClick={() => setSelectedItemIds(makerDesign.items.map(item => item.id))}>Select all {makerDesign.items.length}</button><button className="small-action" onClick={() => setSelectedItemIds([])}>Clear selection</button></div>
          <label className="field-label mt-3 block">Choose stickers to edit <span className="font-normal text-slate-400">(Ctrl/Cmd-click to select several)</span><select className="text-input mt-2 min-h-24" multiple size={6} value={selectedItemIds} onChange={event => setSelectedItemIds(Array.from(event.target.selectedOptions, option => option.value))}>{makerDesign.items.map(item => <option key={item.id} value={item.id}>{item.label || item.text || "Untitled sticker"}</option>)}</select></label>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{makerDesign.items.slice(0, 18).map(item => <button type="button" key={item.id} className={`soft-card p-3 text-left ${selectedItemIds.includes(item.id) ? "ring-2 ring-[#57917a]" : ""}`} onClick={() => setSelectedItemIds(previous => previous.includes(item.id) ? previous.filter(id => id !== item.id) : [...previous, item.id])}>
            <div className="custom-mini-preview"><div className="h-14 w-14"><ItemShape item={item} imageUrl={item.assetId ? imageAssetUrls[item.assetId] : undefined}/></div></div>
            <b className="mt-2 block truncate text-xs">{item.label}</b>
            <small className="mt-1 block text-slate-500">{item.widthMm} × {item.heightMm} mm · {item.copies} {item.copies === 1 ? "copy" : "copies"}</small>
          </button>)}</div>
          {makerDesign.items.length > 18 && <p className="mt-3 text-xs text-slate-500">Showing 18 of {makerDesign.items.length} sticker designs. All are included in the print output.</p>}
          {renderSelectedItemEditor()}
          {makerLayoutError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{makerLayoutError}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="primary-button" data-paid-feature disabled={!makerLayout?.total || Boolean(makerLayoutError)} onClick={() => void printMakerDesign()}><Printer size={15}/> Print Now</button>
            <button className="secondary-button" onClick={() => void addMakerDesignToOrder()}><Layers size={14}/> Add to mixed A4 order</button>
            <button className="secondary-button" onClick={() => setActiveTool(makerDesign.tool)}><ArrowLeft size={14}/> Back to maker</button>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">Print uses A4 pages at 100% / Actual Size with the saved margin and gap. The existing mixed order stays separate until you choose to add this design.</p>
        </div> : activeTool === "bulk-builder" ? <div>
          <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Bulk A4 Print Builder</h2><p className="mt-1 text-xs text-slate-500">Add different designs to one order; item sizes are never scaled to fit.</p></div><span className="step-number">{layout?.total ?? 0}</span></div>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]"><label className="field-label">Order name<input className="text-input mt-2" value={design.name} onChange={e => setDesign(previous => ({ ...previous, name: e.target.value }))} onBlur={e => void persistDesign({ ...design, name: e.target.value })}/></label><label className="field-label">Paper orientation<select className="text-input mt-2" value={orientation} onChange={e => { updatePrintSettings({ ...currentPrintSettings, orientation: e.target.value as "portrait" | "landscape" }); setPageIndex(0); }}><option value="portrait">A4 portrait · 210 × 297 mm</option><option value="landscape">A4 landscape · 297 × 210 mm</option></select></label></div>
              <div className="mt-4 grid grid-cols-2 gap-3"><label className="field-label">Paper margin (mm)<input className="text-input mt-2" type="number" min="0" max="30" step="0.5" value={margin} onChange={e => { const value = Number(e.target.value); setMargin(e.target.value); if (Number.isFinite(value) && value >= 0 && value <= 30) void persistDesign({ ...design, printSettings: { ...currentPrintSettings, marginMm: value } }); }}/></label><label className="field-label">Cutting gap (mm)<input className="text-input mt-2" type="number" min="0" max="20" step="0.5" value={gap} onChange={e => { const value = Number(e.target.value); setGap(e.target.value); if (Number.isFinite(value) && value >= 0 && value <= 20) void persistDesign({ ...design, printSettings: { ...currentPrintSettings, gapMm: value } }); }}/></label></div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600"><label className="flex items-center gap-2"><input type="checkbox" checked={calibration} onChange={e => { const next = { ...currentPrintSettings, calibration: e.target.checked }; setCalibration(e.target.checked); setPageIndex(0); void persistDesign({ ...design, printSettings: next }); }}/> Add a separate 50 mm ruler-check test page</label><label className="flex items-center gap-2"><input type="checkbox" checked={cutlines} onChange={e => { const next = { ...currentPrintSettings, cutlines: e.target.checked }; setCutlines(e.target.checked); void persistDesign({ ...design, printSettings: next }); }}/> Show dashed cutting guides</label></div>
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><thead><tr className="border-b border-[#f1ede8] text-slate-500"><th className="p-2"><input type="checkbox" aria-label="Select all order items" checked={Boolean(design.items.length) && design.items.every(item => selectedItemIds.includes(item.id))} onChange={event => setSelectedItemIds(event.target.checked ? design.items.map(item => item.id) : [])}/></th><th className="p-2">Design</th><th className="p-2">Size</th><th className="p-2">Copies</th><th className="p-2">Shape</th><th className="p-2"/></tr></thead><tbody>{design.items.map(item => <tr key={item.id} className={`border-b border-[#f5f1ec] ${selectedItemIds.includes(item.id) ? "bg-[#f1f7f2]" : ""}`}><td className="p-2"><input type="checkbox" aria-label={`Select ${item.label}`} checked={selectedItemIds.includes(item.id)} onChange={event => setSelectedItemIds(previous => event.target.checked ? [...previous.filter(id => id !== item.id), item.id] : previous.filter(id => id !== item.id))}/></td><td className="max-w-48 truncate p-2 font-semibold">{item.label}</td><td className="p-2">{item.widthMm} × {item.heightMm} mm</td><td className="p-2">{item.copies}</td><td className="p-2 capitalize">{item.shape === "image" ? item.artwork ?? "uploaded art" : item.shape}</td><td className="p-2 text-right"><button className="icon-action danger" title={`Remove ${item.label}`} onClick={() => { setSelectedItemIds(previous => previous.filter(id => id !== item.id)); void updateItems(design.items.filter(entry => entry.id !== item.id)); }}><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>
          {renderSelectedItemEditor()}
          {!design.items.length && <div className="empty-strip mt-4">Your print order is empty. <button className="font-semibold text-[#397b68]" onClick={() => setActiveTool("numbers")}>Create numbers, pictures, or labels.</button></div>}
          {layoutError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{layoutError}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#eff7f2] p-4 text-xs"><div><small className="block text-slate-500">Total stickers</small><b>{layout?.total ?? 0}</b></div><div><small className="block text-slate-500">A4 pages</small><b>{activePageCount}</b></div><div><small className="block text-slate-500">Paper</small><b>{pageWidthMm} × {pageHeightMm} mm</b></div><div><small className="block text-slate-500">Printable area</small><b>{layout?.usableWidthMm ?? pageWidthMm - Number(margin) * 2} × {layout?.usableHeightMm ?? pageHeightMm - Number(margin) * 2} mm</b></div></div>
          {hasSmallPrintText && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800" role="status">Some long labels will print below 8 pt to fit their sticker. Consider increasing their size or shortening the text for easier reading.</p>}
          <div className="mt-4 flex flex-wrap gap-2"><button className="primary-button" data-paid-feature disabled={!layout?.total || Boolean(layoutError)} onClick={() => void printOrder()}><Printer size={15}/> Print Now</button><button className="secondary-button" onClick={() => setActiveTool("saved")}><Save size={14}/> Saved orders</button><button className="secondary-button" onClick={() => { if (design.items.length) void confirm("Clear print order", "Remove all stickers from this print order?").then(confirmed => { if (confirmed) void updateItems([]); }); }}><Trash2 size={14}/> Clear order</button></div>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">Prints all A4 pages at 100% / Actual Size directly to your Windows default printer. If no default printer is configured or Microsoft Print to PDF is the default, Windows opens the print dialog so you can choose one.</p>
        </div> : <div>
          <div className="mb-5 flex items-center justify-between"><div><div className="eyebrow">{selectedTool?.name.toUpperCase()}</div><h2 className="mt-1 font-bold">{selectedTool?.name}</h2><p className="mt-1 text-xs text-slate-500">Set your sticker content, physical size, and copies.</p></div><span className="step-number">01</span></div>
          {activeTool === "numbers" && <div className="space-y-4">
            <label className="field-label block">Number range<select className="text-input mt-2" value={numberPreset} onChange={e => setRangePreset(e.target.value)}><option value="1-10">1 to 10</option><option value="1-20">1 to 20</option><option value="1-50">1 to 50</option><option value="1-100">1 to 100</option><option value="custom">Custom range</option></select></label>
            <label className="field-label block">Number style<select className="text-input mt-2" value={numberLabelStyle} onChange={e => setNumberLabelStyle(e.target.value as NumberLabelStyle)}><option value="digits">Digits · 1, 2, 3</option><option value="english-words">English words · One, Two, Three</option><option value="sinhala-words">Sinhala words · එක, දෙක, තුන</option></select></label>
            {numberLabelStyle !== "digits" && <p className="rounded-xl bg-[#f5f2fa] p-3 text-[11px] leading-5 text-slate-500">Number words are available for 0–20. Choose a range within that limit to generate word stickers.</p>}
            <div className="grid grid-cols-2 gap-3"><label className="field-label">Start<input className="text-input mt-2" type="number" value={numberStart} onChange={e => { setNumberPreset("custom"); setNumberStart(e.target.value); setManualNumbers([]); setManualSelectionEnabled(false); }}/></label><label className="field-label">End<input className="text-input mt-2" type="number" value={numberEnd} onChange={e => { setNumberPreset("custom"); setNumberEnd(e.target.value); setManualNumbers([]); setManualSelectionEnabled(false); }}/></label></div>
            {numberPreset === "custom" && currentNumberValues.length > 0 && <div className="rounded-xl bg-[#faf8f4] p-3"><div className="mb-2 flex justify-between text-[11px] text-slate-500"><span>Select individual numbers (up to 100)</span><button className="font-semibold text-[#397b68]" onClick={() => { setManualNumbers(currentNumberValues); setManualSelectionEnabled(true); }}>All</button></div>{currentNumberValues.length <= 100 ? <div className="flex max-h-28 flex-wrap gap-1 overflow-auto">{currentNumberValues.map(value => <button key={value} className={`placement-chip ${!manualSelectionEnabled || manualNumbers.includes(value) ? "selected" : ""}`} onClick={() => { setManualNumbers(previous => manualSelectionEnabled ? previous.includes(value) ? previous.filter(number => number !== value) : [...previous, value] : currentNumberValues.filter(number => number !== value)); setManualSelectionEnabled(true); }}>{value}</button>)}</div> : <p className="text-[10px] text-slate-400">Ranges over 100 values generate all numbers; reduce the range to select individual numbers.</p>}</div>}
            <p className="text-xs text-slate-500">Generate each selected number as an individual sticker. Custom range supports up to 5,000 unique numbers.</p>
          </div>}
          {activeTool === "alphabet" && <div className="space-y-4">
            <label className="field-label block">Character set<select className="text-input mt-2" value={alphabetMode} onChange={e => setAlphabetMode(e.target.value)}><option value="uppercase">English uppercase A–Z</option><option value="lowercase">English lowercase a–z</option><option value="digits">Digits 0–9</option><option value="lines">Custom words, initials, or mixed text (one per line)</option><option value="graphemes">Custom text, separate each visible character</option></select></label>
            {(alphabetMode === "lines" || alphabetMode === "graphemes") && <label className="field-label block">Text (Sinhala, English, or mixed)<textarea className="text-input mt-2 min-h-24 resize-y" lang="si" dir="auto" value={customText} onChange={e => setCustomText(e.target.value)} placeholder={alphabetMode === "graphemes" ? "අ ආ ඉ A B 1" : "A1\nB2\nROOM 5"}/></label>}
            <p className="rounded-xl bg-[#f5f2fa] p-3 text-[11px] leading-5 text-slate-500">Entered Unicode is kept as typed. Grapheme mode separates visible characters without splitting Sinhala vowel signs when the browser supports Unicode segmentation.</p>
          </div>}
          {activeTool === "mini-art" && <div className="space-y-4">
            <div className="flex items-center gap-2"><div className="search-box flex-1"><Search size={15}/><input placeholder="Search original pictures" value={imageSearch} onChange={e => setImageSearch(e.target.value)}/></div><label className="small-action cursor-pointer"><ImagePlus size={14}/> Upload<input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={e => { void onUpload(e.target.files).catch(cause => setError(cause instanceof Error ? cause.message : "Could not upload the image.")); e.currentTarget.value = ""; }}/></label></div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{allArtwork.map(option => <button key={option.id} className={`artwork-choice ${selectedArtwork === option.id && !selectedAssetId ? "selected" : ""}`} onClick={() => { setSelectedArtwork(option.id); setSelectedAssetId(""); }}><span><Artwork name={option.id}/></span><small>{option.name}</small></button>)}</div>
            {assets.filter(asset => asset.type.startsWith("image/")).length > 0 && <div><b className="text-xs">Your uploaded art</b><div className="mt-2 flex flex-wrap gap-2">{assets.filter(asset => asset.type.startsWith("image/")).map(asset => <button key={asset.id} className={`asset-shortcut ${selectedAssetId === asset.id ? "border-[#57917a] bg-[#edf5ef]" : ""}`} onClick={() => setSelectedAssetId(asset.id)}>{assetUrls[asset.id] && <Image src={assetUrls[asset.id]} alt="" width={28} height={28} className="h-7 w-7 object-contain" unoptimized/>}<span>{asset.name}</span></button>)}</div></div>}
            <label className="field-label block">Image fit<select className="text-input mt-2" value={pictureFit} onChange={e => setPictureFit(e.target.value as CustomPrintFit)}><option value="contain">Contain · preserve full image</option><option value="cover">Cover · fill with crop</option><option value="crop">Crop · fill frame</option></select></label>
            <p className="text-[11px] text-slate-500">Original vector icons are drawn locally; uploaded image blobs are stored in the existing local asset library and printed from IndexedDB-backed URLs.</p>
          </div>}
          {activeTool === "shapes" && <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={showShapeText} onChange={e => setShowShapeText(e.target.checked)}/> Add text inside the shapes</label>
            {showShapeText && <label className="field-label block">Text inside each shape<textarea className="text-input mt-2 min-h-20 resize-y" lang="si" dir="auto" value={shapeText} onChange={e => setShapeText(e.target.value)} placeholder="Enter text in Sinhala or English"/></label>}
            <p className="text-xs text-slate-500">Text is off by default. One line makes one sticker for each selected colour.</p>
            <div className="flex flex-wrap items-end gap-2"><label className="field-label">Custom shape colour<input className="text-input mt-2 h-10 w-20 p-1" type="color" value={customShapeColor} onChange={e => setCustomShapeColor(e.target.value)}/></label><button type="button" className="secondary-button" onClick={() => setSelectedColors(previous => previous.includes(customShapeColor) ? previous : [...previous, customShapeColor])}>Add colour</button><button type="button" className="secondary-button" onClick={() => setSelectedColors([customShapeColor])}>Use only this colour</button></div>
          </div>}
          {activeTool === "rewards" && <div className="space-y-4">
            <b className="text-xs">Starter rewards</b><div className="flex flex-wrap gap-2">{rewards.map(reward => <button key={reward} className={`filter-chip ${selectedRewards.includes(reward) ? "selected" : ""}`} onClick={() => setSelectedRewards(previous => previous.includes(reward) ? previous.filter(value => value !== reward) : [...previous, reward])}>{selectedRewards.includes(reward) && <Check size={12}/>} {reward}</button>)}</div>
            <label className="field-label block">Extra custom messages<textarea className="text-input mt-2 min-h-20 resize-y" lang="si" dir="auto" value={customText} onChange={e => setCustomText(e.target.value)} placeholder={"Great effort!\nහොඳ වැඩක්"}/></label>
          </div>}
          <div className="mt-5 space-y-4 border-t border-[#f1ede8] pt-4">
            {activeTool !== "numbers" && activeTool !== "alphabet" && <div className="grid grid-cols-2 gap-3"><label className="field-label">Sticker width <div className="mt-2 flex gap-2"><input className="text-input min-w-0" type="number" min="0.1" step="0.1" value={width} onChange={e => setWidth(e.target.value)}/><select aria-label="Sticker size unit" className="text-input max-w-20" value={sizeUnit} onChange={e => setSizeUnit(e.target.value as "mm" | "cm")}><option value="mm">mm</option><option value="cm">cm</option></select></div></label><label className="field-label">Sticker height<input className="text-input mt-2" type="number" min="0.1" step="0.1" value={height} onChange={e => setHeight(e.target.value)}/></label></div>}
            {(activeTool === "numbers" || activeTool === "alphabet") && <div className="grid grid-cols-2 gap-3"><label className="field-label">Sticker width <div className="mt-2 flex gap-2"><input className="text-input min-w-0" type="number" min="0.1" step="0.1" value={width} onChange={e => setWidth(e.target.value)}/><select aria-label="Sticker size unit" className="text-input max-w-20" value={sizeUnit} onChange={e => setSizeUnit(e.target.value as "mm" | "cm")}><option value="mm">mm</option><option value="cm">cm</option></select></div></label><label className="field-label">Sticker height<input className="text-input mt-2" type="number" min="0.1" step="0.1" value={height} onChange={e => setHeight(e.target.value)}/></label></div>}
            {activeTool !== "maker-preview" && <label className="field-label block">Sticker shape<select className="text-input mt-2" value={toolShapes[activeTool]} onChange={event => selectToolShape(activeTool, event.target.value as CustomPrintShape)}>{stickerShapes.map(option => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}</select></label>}
            {activeTool === "mini-art" && <div className="grid grid-cols-2 gap-2 text-[11px]">{[10, 15, 20, 25, 30].map(size => <button key={size} className={`filter-chip ${dimensionMm(width) === size && dimensionMm(height) === size ? "selected" : ""}`} onClick={() => { setSizeUnit("mm"); setWidth(String(size)); setHeight(String(size)); }}>{size === 10 ? "1 × 1 cm" : `${(size / 10).toFixed(size % 10 ? 1 : 0)} × ${(size / 10).toFixed(size % 10 ? 1 : 0)} cm`}</button>)}</div>}
            <div className="grid grid-cols-2 gap-3"><label className="field-label">Copies per design<input className="text-input mt-2" type="number" min="1" max="1000" value={copies} onChange={e => setCopies(e.target.value)}/></label><label className="field-label">Preset palette<select className="text-input mt-2" value={paletteName} onChange={e => selectPalette(e.target.value as PaletteName)}><option value="school">School colours</option><option value="rainbow">Rainbow</option><option value="pastel">Pastel</option><option value="monochrome">Monochrome</option></select></label></div>
            <div className="flex flex-wrap gap-2" aria-label="Sticker colour palette">{palettes[paletteName].map(color => <button type="button" key={color} aria-label={`Toggle colour ${color}`} className={`color-dot ${selectedColors.includes(color) ? "selected" : ""}`} style={{ background: color }} onClick={() => setSelectedColors(previous => previous.includes(color) ? previous.filter(item => item !== color) : [...previous, color])}/>)}</div>
            <details className="rounded-xl border border-[#eee9e2] p-3"><summary className="cursor-pointer text-xs font-semibold">Advanced colour, outline & type settings</summary><div className="mt-3 grid grid-cols-2 gap-3">
              <label className="field-label">Background<input className="text-input mt-2 h-10 p-1" type="color" value={background === "transparent" ? "#ffffff" : background} onChange={e => setBackground(e.target.value)}/></label>
              <label className="field-label">Text colour<input className="text-input mt-2 h-10 p-1" type="color" value={textColor} onChange={e => setTextColor(e.target.value)}/></label>
              <label className="field-label">Outline colour<input className="text-input mt-2 h-10 p-1" type="color" value={outlineColor} onChange={e => setOutlineColor(e.target.value)}/></label>
              <label className="field-label">Outline width (mm)<input className="text-input mt-2" type="number" min="0" max="5" step="0.1" value={outlineWidth} onChange={e => setOutlineWidth(e.target.value)}/></label>
              <label className="field-label">Outline style<select className="text-input mt-2" value={borderStyle} onChange={e => setBorderStyle(e.target.value as CustomPrintItem["borderStyle"])}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option></select></label>
              <label className="field-label">Font family<select className="text-input mt-2" value={fontFamily} onChange={e => setFontFamily(e.target.value as CustomPrintFont)}><optgroup label="English">{englishFonts.map(font => <option key={font.family} value={font.family}>{font.family}</option>)}</optgroup><optgroup label="Sinhala">{sinhalaFonts.map(font => <option key={font.family} value={font.family}>{font.family}</option>)}</optgroup></select></label>
              <label className="field-label">Font size (pt)<input className="text-input mt-2" type="number" min="4" max="160" value={fontSize} onChange={e => setFontSize(e.target.value)}/><input className="mt-2 w-full accent-[#397b68]" aria-label="Generator font size slider" type="range" min="4" max="160" value={Math.min(160, Math.max(4, Number(fontSize) || 24))} onChange={e => setFontSize(e.target.value)}/></label>
              <label className="field-label">Text alignment<select className="text-input mt-2" value={align} onChange={e => setAlign(e.target.value as CustomPrintItem["align"])}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
              <label className="col-span-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={bold} onChange={e => setBold(e.target.checked)}/> Bold text</label>
              <label className="col-span-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={background === "transparent"} onChange={e => setBackground(e.target.checked ? "transparent" : "#fffdf7")}/> Transparent fill where supported</label>
            </div></details>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {activeTool === "numbers" && <button className="primary-button" onClick={() => void generateNumbers()}><Plus size={15}/> Generate numbers</button>}
            {activeTool === "alphabet" && <button className="primary-button" onClick={() => void generateAlphabet()}><Plus size={15}/> Generate letters / words</button>}
            {activeTool === "mini-art" && <button className="primary-button" onClick={() => void generateMiniArt()}><Plus size={15}/> Add picture stickers</button>}
            {activeTool === "shapes" && <button className="primary-button" onClick={() => void generateShapes()}><Plus size={15}/> Add shape stickers</button>}
            {activeTool === "rewards" && <button className="primary-button" onClick={() => void generateRewards()}><Plus size={15}/> Add reward labels</button>}
            <button className="secondary-button" onClick={() => setActiveTool("bulk-builder")}><Layers size={14}/> Open A4 builder {design.items.length > 0 && `· ${design.items.length} types`}</button>
          </div>
        </div>}
      </section>

      <aside className="space-y-4">
        <div className="soft-card p-5"><div className="mb-4 flex items-center justify-between"><div><b className="text-sm">{activeTool === "bulk-builder" || activeTool === "maker-preview" ? "Exact A4 page preview" : "Live sticker preview"}</b><p className="mt-1 text-[11px] text-slate-500">{activeTool === "bulk-builder" || activeTool === "maker-preview" ? `${pageWidthMm} × ${pageHeightMm} mm · ${activePageCount || 0} page(s)` : `${dimensionMm(width).toFixed(1)} × ${dimensionMm(height).toFixed(1)} mm physical size`}</p></div><span className="rounded-full bg-[#e8f2ec] px-2.5 py-1 text-[10px] font-semibold text-[#397b68]">{activeTool === "bulk-builder" || activeTool === "maker-preview" ? `${currentLayout?.total ?? 0} stickers` : activeTool}</span></div>
          {activeTool === "bulk-builder" || activeTool === "maker-preview" ? currentLayout?.pages ? <><div className="custom-print-page-wrap"><div className="custom-print-scaled-page"><CustomSheetPage page={Math.max(0, pageIndex - Number(previewCalibration))} layout={currentLayout} orientation={previewOrientation} imageUrls={imageAssetUrls} screenPreview calibrationOnly={previewCalibration && pageIndex === 0} cutlines={previewCutlines}/></div></div><div className="mt-3 flex items-center justify-between"><button className="small-action" disabled={pageIndex <= 0} onClick={() => setPageIndex(value => Math.max(0, value - 1))}><Minus size={13}/> Previous</button><span className="text-xs">Page {Math.min(pageIndex, activePageCount - 1) + 1} of {activePageCount}</span><button className="small-action" disabled={pageIndex >= activePageCount - 1} onClick={() => setPageIndex(value => Math.min(activePageCount - 1, value + 1))}>Next <Plus size={13}/></button></div></> : <div className="empty-strip">Add designs from any maker to preview your sheet. <span>No stickers added.</span></div>
            : <div className="custom-item-preview-wrap"><div className="custom-item-live" style={{ aspectRatio: `${previewItem.widthMm}/${previewItem.heightMm}` }}><ItemShape item={previewItem} imageUrl={liveArtworkUrl}/></div><p className="mt-3 text-center text-[10px] text-slate-400">Preview is scaled to show the selected aspect ratio. Print output uses physical millimetres.</p>{previewTextIsSmall && <p className="mt-2 text-center text-[10px] text-amber-700" role="status">This text may print below 8 pt at the selected size.</p>}</div>}
          {activeTool !== "bulk-builder" && activeTool !== "mini-art" && <div className="mt-4 grid grid-cols-2 gap-2">{currentNumberValues.length > 0 && activeTool === "numbers" ? currentNumberValues.slice(0, 5).map((number, index) => { let text = String(number); try { text = formatNumberLabel(number, numberLabelStyle); } catch { text = String(number); } const item = { ...previewItem, id: `preview-${number}`, text, label: String(number), copies: 1, color: selectedColors.length ? selectedColors[index % selectedColors.length] : textColor }; return <div key={number} className="custom-mini-preview"><ItemShape item={item}/></div>; }) : activeTool === "alphabet" && (alphabetMode === "uppercase" || alphabetMode === "lowercase" || alphabetMode === "digits") ? ["A", "B", "C", "D"].map(letter => <div key={letter} className="custom-mini-preview"><ItemShape item={{ ...previewItem, id: letter, text: alphabetMode === "digits" ? String(letter.charCodeAt(0) - 61) : alphabetMode === "lowercase" ? letter.toLowerCase() : letter }}/></div>) : null}</div>}
        </div>
        {activeTool !== "bulk-builder" && activeTool !== "maker-preview" && <div className="soft-card p-4"><b className="text-xs">A4 order so far</b><div className="mt-2 flex items-center justify-between text-xs"><span>{previewStickerCount} stickers · {layout?.pages ?? 0} page(s)</span><button className="font-semibold text-[#397b68]" onClick={() => setActiveTool("bulk-builder")}>View builder →</button></div><div className="mt-3 flex flex-wrap gap-1">{design.items.slice(-8).map(item => <span key={item.id} className="custom-order-pill">{item.label} × {item.copies}</span>)}</div></div>}
        {activeTool !== "bulk-builder" && <div className="tip-card"><span className="tip-bulb">✦</span><div><b>True-size print tip</b><p>Use A4 paper and 100% / Actual Size. A 2 cm picture is printed at 20 × 20 mm, even when pages continue.</p></div></div>}
      </aside>
    </div>}

    {layout?.pages ? <div className="custom-print-pages custom-print-order-pages print-only" aria-hidden="true">{calibration && <CustomSheetPage key="calibration" page={0} layout={layout} orientation={orientation} imageUrls={imageAssetUrls} calibrationOnly/>}{Array.from({ length: layout.pages }, (_, page) => <CustomSheetPage key={`order-sheet-${page}`} page={page} layout={layout} orientation={orientation} imageUrls={imageAssetUrls} cutlines={cutlines}/>)}</div> : null}
    {makerDesign && makerLayout?.pages ? <div className="custom-print-pages custom-print-maker-pages print-only" aria-hidden="true">{makerDesign.printSettings.calibration && <CustomSheetPage key="maker-calibration" page={0} layout={makerLayout} orientation={makerDesign.printSettings.orientation} imageUrls={imageAssetUrls} calibrationOnly/>}{Array.from({ length: makerLayout.pages }, (_, page) => <CustomSheetPage key={`maker-sheet-${page}`} page={page} layout={makerLayout} orientation={makerDesign.printSettings.orientation} imageUrls={imageAssetUrls} cutlines={makerDesign.printSettings.cutlines}/>)}</div> : null}
  </div>{dialogHost}</LocalizedUi>;
}
