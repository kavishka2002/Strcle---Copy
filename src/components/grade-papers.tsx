"use client";

import { ArrowUpRight, BookOpen, FileText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { GradePaper } from "@/lib/grade-papers";
import type { DesktopDrivePdfDownloadProgress } from "@/components/service-worker-registration";

const grades = [6, 7, 8, 9];

export function GradePapers() {
  const [papers, setPapers] = useState<GradePaper[]>([]);
  const [grade, setGrade] = useState("all");
  const [subject, setSubject] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [download, setDownload] = useState<(DesktopDrivePdfDownloadProgress & { paperId: string }) | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<{ paperId: string; message: string; error: boolean } | null>(null);

  useEffect(() => {
    const desktop = window.littlePaperDesktop;
    if (!desktop?.onDrivePdfDownloadProgress) return;
    return desktop.onDrivePdfDownloadProgress(progress => {
      setDownload(current => current?.fileId === progress.fileId ? { ...current, ...progress } : current);
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/grade-papers", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Grade papers could not be loaded.");
        const data = await response.json() as { papers?: GradePaper[] };
        if (!Array.isArray(data.papers)) throw new Error("Grade paper response was invalid.");
        setPapers(data.papers);
      })
      .catch(cause => {
        if (controller.signal.aborted) return;
        console.error("Could not load Grade 6–9 papers.", cause);
        setError("We couldn’t load the papers just now. Please refresh the page to try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const availableSubjects = useMemo(
    () => [...new Set(papers.filter(paper => grade === "all" || paper.grade === Number(grade)).map(paper => paper.subject))]
      .sort((left, right) => left.localeCompare(right)),
    [grade, papers]
  );
  const filteredPapers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return papers.filter(paper =>
      (grade === "all" || paper.grade === Number(grade))
      && (subject === "all" || paper.subject === subject)
      && (!query || `${paper.grade} ${paper.subject} ${paper.language} ${paper.category} ${paper.displayName} ${paper.originalFileName}`.toLocaleLowerCase().includes(query))
    );
  }, [grade, papers, search, subject]);
  const papersByGrade = useMemo(() => {
    const groups = new Map<number, GradePaper[]>();
    for (const paper of filteredPapers) {
      const group = groups.get(paper.grade) ?? [];
      group.push(paper);
      groups.set(paper.grade, group);
    }
    return [...groups.entries()].sort(([left], [right]) => left - right);
  }, [filteredPapers]);

  const openPaper = async (paper: GradePaper) => {
    const desktop = window.littlePaperDesktop;
    setDownloadStatus(null);
    setDownload({ paperId: paper.id, fileId: paper.driveFileId, transferred: 0 });
    try {
      if (!desktop?.downloadDrivePdf) throw new Error("Please update the desktop app to download these papers.");
      const result = await desktop.downloadDrivePdf({ fileId: paper.driveFileId, fileName: paper.originalFileName });
      setDownloadStatus({
        paperId: paper.id,
        message: result.source === "cache"
          ? "Opened the saved PDF. / සුරැකි PDF ගොනුව විවෘත කළා."
          : "Downloaded and opened the PDF. / PDF ගොනුව බාගත කර විවෘත කළා.",
        error: false
      });
    } catch (cause) {
      console.error("Could not download or open a Grade 6–9 paper.", cause);
      setDownloadStatus({
        paperId: paper.id,
        message: "Could not download this paper. An internet connection is required the first time; downloaded papers work offline. / මෙම ප්‍රශ්න පත්‍රය බාගත කළ නොහැක. පළමු වරට බාගත කිරීමට අන්තර්ජාලය අවශ්‍යයි; කලින් බාගත කළ පත්‍ර නොබැඳිව විවෘත කළ හැක.",
        error: true
      });
    } finally {
      setDownload(current => current?.paperId === paper.id ? null : current);
    }
  };

  return (
    <section className="ol-past-papers soft-card" aria-labelledby="grade-papers-title">
      <header className="ol-past-papers-header">
        <div className="ol-past-papers-copy">
          <span className="ol-past-papers-icon" aria-hidden="true"><BookOpen size={19}/></span>
          <div>
            <p className="ol-past-papers-eyebrow">STUDY · PRACTISE · SUCCEED</p>
            <h2 id="grade-papers-title">Grade 6–9 Papers</h2>
            <p className="ol-past-papers-description">Choose a grade, then filter by subject or search the available papers.</p>
          </div>
        </div>
        <div className="ol-past-papers-total">
          <strong>{loading || error ? "—" : papers.length}</strong>
          <span>files listed</span>
        </div>
      </header>

      <div className="ol-past-papers-filters grade-papers-filters">
        <label className="ol-past-papers-field">
          <span>Grade</span>
          <select value={grade} onChange={event => { setGrade(event.target.value); setSubject("all"); }}>
            <option value="all">All grades</option>
            {grades.map(value => <option key={value} value={value}>Grade {value}</option>)}
          </select>
        </label>
        <label className="ol-past-papers-field">
          <span>Subject</span>
          <select value={subject} onChange={event => setSubject(event.target.value)}>
            <option value="all">All subjects</option>
            {availableSubjects.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label className="ol-past-papers-search">
          <Search size={16} aria-hidden="true"/>
          <span className="sr-only">Search grade papers</span>
          <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search papers"/>
        </label>
      </div>

      <div className="ol-past-papers-results" aria-live="polite">
        {loading ? (
          <div className="ol-past-papers-state">Loading papers…</div>
        ) : error ? (
          <div className="ol-past-papers-state ol-past-papers-error" role="alert">{error}</div>
        ) : filteredPapers.length ? (
          <>
            <div className="ol-past-papers-result-count">
              Showing <strong>{filteredPapers.length}</strong> {filteredPapers.length === 1 ? "file" : "files"}
            </div>
            {papersByGrade.map(([paperGrade, gradePapers]) => (
              <section className="ol-past-papers-year-group" key={paperGrade} aria-labelledby={`grade-paper-${paperGrade}`}>
                <div className="ol-past-papers-year-heading">
                  <h3 id={`grade-paper-${paperGrade}`}>Grade {paperGrade}</h3>
                  <span>{gradePapers.length} {gradePapers.length === 1 ? "file" : "files"}</span>
                </div>
                <div className="ol-past-papers-grid">
                  {gradePapers.map(paper => (
                    <article className="ol-past-papers-card" key={paper.id}>
                      <span className="ol-past-papers-file-icon" aria-hidden="true"><FileText size={17}/></span>
                      <div className="ol-past-papers-card-copy">
                        <h4>{paper.displayName}</h4>
                        <div className="ol-past-papers-tags">
                          <span>{paper.subject}</span>
                          <span>{paper.language === "Not specified" ? "Language not specified" : `${paper.language} medium`}</span>
                          <span>{paper.category}</span>
                        </div>
                      </div>
                      {paper.availability === "incomplete" ? (
                        <span className="ol-past-papers-open" aria-disabled="true">Incomplete PDF</span>
                      ) : (
                        <a
                          className="ol-past-papers-open"
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${paper.displayName}, Grade ${paper.grade} PDF in a new tab`}
                          onClick={event => {
                            if (!window.littlePaperDesktop?.isDesktop) return;
                            event.preventDefault();
                            void openPaper(paper);
                          }}
                        >
                          Open PDF <ArrowUpRight size={14}/>
                        </a>
                      )}
                      {paper.availability === "incomplete" ? (
                        <p className="grade-paper-unavailable" role="status">This Drive PDF is incomplete (17 bytes). / Drive PDF ගොනුව සම්පූර්ණ නැත.</p>
                      ) : (
                        <div className="w-full" aria-live="polite">
                          {download?.paperId === paper.id && (
                            <>
                              <progress className="desktop-update-progress mt-2" max="100" value={download.percent} aria-label={`Downloading ${paper.displayName}`}/>
                              <p className="mt-1 text-xs text-slate-500">
                                Downloading paper / බාගත කරමින්
                                {download.percent === undefined ? "…" : `… ${Math.round(download.percent)}%`}
                              </p>
                            </>
                          )}
                          {downloadStatus?.paperId === paper.id && (
                            <p className={`mt-1 text-xs ${downloadStatus.error ? "text-red-600" : "text-slate-500"}`} role={downloadStatus.error ? "alert" : "status"}>
                              {downloadStatus.message}
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : (
          <div className="ol-past-papers-state">
            <h3>No matching grade papers found</h3>
            <p>Try another grade or subject, or clear the search text.</p>
            <button className="secondary-button" type="button" onClick={() => { setGrade("all"); setSubject("all"); setSearch(""); }}>
              Clear filters
            </button>
          </div>
        )}
      </div>
      <p className="ol-past-papers-note">
        Papers are downloaded from Google Drive when opened and are cached for offline use. One Grade 7 Drive PDF is incomplete and is disabled until the source file is repaired.
      </p>
    </section>
  );
}
