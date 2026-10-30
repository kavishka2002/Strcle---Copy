"use client";

import { ArrowUpRight, BookOpen, FileText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { OlPaper, PaperExam } from "@/lib/ol-papers";
import type { DesktopDrivePdfDownloadProgress } from "@/components/service-worker-registration";

const paperExams: PaperExam[] = ["O/L", "Grade 5 Scholarship"];

export function OlPastPapers() {
  const [papers, setPapers] = useState<OlPaper[]>([]);
  const [exam, setExam] = useState<PaperExam>("O/L");
  const [year, setYear] = useState("all");
  const [subject, setSubject] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [driveDownload, setDriveDownload] = useState<(DesktopDrivePdfDownloadProgress & { paperId: string }) | null>(null);
  const [driveDownloadStatus, setDriveDownloadStatus] = useState<{ paperId: string; message: string; error: boolean } | null>(null);

  useEffect(() => {
    const desktop = window.littlePaperDesktop;
    if (!desktop?.onDrivePdfDownloadProgress) return;
    return desktop.onDrivePdfDownloadProgress(progress => {
      setDriveDownload(current =>
        current?.fileId === progress.fileId ? { ...current, ...progress } : current
      );
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/ol-papers", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Paper catalogue could not be loaded.");
        const data = await response.json() as { papers?: OlPaper[] };
        if (!Array.isArray(data.papers)) throw new Error("Paper catalogue response was invalid.");
        setPapers(data.papers);
      })
      .catch(cause => {
        if (controller.signal.aborted) return;
        console.error("Could not load the O/L paper catalogue.", cause);
        setError("We couldn’t load the papers just now. Please refresh the page to try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const examinationYears = useMemo(
    () => [...new Set(papers.filter(paper => paper.exam === exam).map(paper => paper.year))]
      .sort((left, right) => right - left),
    [exam, papers]
  );
  const subjects = useMemo(
    () => [...new Set(papers.filter(paper => paper.exam === exam).map(paper => paper.subject))]
      .sort((left, right) => left.localeCompare(right)),
    [exam, papers]
  );
  const filteredPapers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return papers.filter(paper =>
      paper.exam === exam
      && (year === "all" || paper.year === Number(year))
      && (subject === "all" || paper.subject === subject)
      && (!query || `${paper.subject} ${paper.year} ${paper.medium} ${paper.syllabus ?? ""}`.toLocaleLowerCase().includes(query))
    );
  }, [exam, papers, search, subject, year]);
  const papersByYear = useMemo(() => {
    const groups = new Map<number, OlPaper[]>();
    for (const paper of filteredPapers) {
      const group = groups.get(paper.year) ?? [];
      group.push(paper);
      groups.set(paper.year, group);
    }
    return [...groups.entries()];
  }, [filteredPapers]);
  const selectedYearHasPapers = year === "all" || papers.some(paper =>
    paper.exam === exam && paper.year === Number(year)
  );
  const examPaperCount = papers.filter(paper => paper.exam === exam).length;

  const changeExam = (nextExam: PaperExam) => {
    setExam(nextExam);
    setYear("all");
    setSubject("all");
    setSearch("");
  };

  const openDrivePaper = async (paper: OlPaper) => {
    const desktop = window.littlePaperDesktop;
    if (!paper.driveFileId) return;
    setDriveDownloadStatus(null);
    setDriveDownload({ paperId: paper.id, fileId: paper.driveFileId, transferred: 0 });
    try {
      if (!desktop?.downloadDrivePdf) throw new Error("Please update the desktop app to download O/L papers.");
      const result = await desktop.downloadDrivePdf({ fileId: paper.driveFileId, fileName: paper.fileName });
      setDriveDownloadStatus({
        paperId: paper.id,
        message: result.source === "cache"
          ? "Opened the saved PDF. / සුරැකි PDF ගොනුව විවෘත කළා."
          : "Downloaded and opened the PDF. / PDF ගොනුව බාගත කර විවෘත කළා.",
        error: false
      });
    } catch (downloadError) {
      console.error("Could not download or open the O/L paper.", downloadError);
      setDriveDownloadStatus({
        paperId: paper.id,
        message: "Could not download this paper. An internet connection is required the first time; downloaded papers work offline. / මෙම ප්‍රශ්න පත්‍රය බාගත කළ නොහැක. පළමු වරට බාගත කිරීමට අන්තර්ජාලය අවශ්‍යයි; කලින් බාගත කළ පත්‍ර නොබැඳිව විවෘත කළ හැක.",
        error: true
      });
    } finally {
      setDriveDownload(current => current?.paperId === paper.id ? null : current);
    }
  };

  return (
    <section className="ol-past-papers soft-card" aria-labelledby="ol-past-papers-title">
      <header className="ol-past-papers-header">
        <div className="ol-past-papers-copy">
          <span className="ol-past-papers-icon" aria-hidden="true"><BookOpen size={19}/></span>
          <div>
            <p className="ol-past-papers-eyebrow">STUDY · PRACTISE · SUCCEED</p>
            <h2 id="ol-past-papers-title">Past Papers</h2>
            <p className="ol-past-papers-description">Choose an examination, then filter by year or subject.</p>
          </div>
        </div>
        <div className="ol-past-papers-total">
          <strong>{loading || error ? "—" : examPaperCount}</strong>
          <span>papers available</span>
        </div>
      </header>

      <div className="ol-past-papers-filters">
        <label className="ol-past-papers-field">
          <span>Examination</span>
          <select
            value={exam}
            onChange={event => {
              const selectedExam = paperExams.find(paperExam => paperExam === event.target.value);
              if (selectedExam) changeExam(selectedExam);
            }}
          >
            {paperExams.map(paperExam => (
              <option key={paperExam} value={paperExam}>{paperExam}</option>
            ))}
          </select>
        </label>
        <label className="ol-past-papers-field">
          <span>Examination year</span>
          <select value={year} onChange={event => setYear(event.target.value)}>
            <option value="all">All available years</option>
            {examinationYears.map(examinationYear => (
              <option key={examinationYear} value={examinationYear}>{examinationYear}</option>
            ))}
          </select>
        </label>
        <label className="ol-past-papers-field">
          <span>Subject</span>
          <select value={subject} onChange={event => setSubject(event.target.value)}>
            <option value="all">All subjects</option>
            {subjects.map(subjectName => (
              <option key={subjectName} value={subjectName}>{subjectName}</option>
            ))}
          </select>
        </label>
        <label className="ol-past-papers-search">
          <Search size={16} aria-hidden="true"/>
          <span className="sr-only">Search papers</span>
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search subjects or medium"
          />
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
              Showing <strong>{filteredPapers.length}</strong> {filteredPapers.length === 1 ? "paper" : "papers"}
              {subject !== "all" ? <> for <strong>{subject}</strong></> : null}
              {year === "all" && subject !== "all" ? ` across all available ${exam} years` : null}
            </div>
            {papersByYear.map(([paperYear, yearPapers]) => (
              <section className="ol-past-papers-year-group" key={paperYear} aria-labelledby={`ol-year-${paperYear}`}>
                <div className="ol-past-papers-year-heading">
                  <h3 id={`ol-year-${paperYear}`}>{paperYear} {exam}</h3>
                  <span>{yearPapers.length} {yearPapers.length === 1 ? "paper" : "papers"}</span>
                </div>
                <div className="ol-past-papers-grid">
                  {yearPapers.map(paper => (
                    <article className="ol-past-papers-card" key={paper.id}>
                      <span className="ol-past-papers-file-icon" aria-hidden="true"><FileText size={17}/></span>
                      <div className="ol-past-papers-card-copy">
                        <h4>{paper.subject}</h4>
                        <div className="ol-past-papers-tags">
                          <span>{paper.medium}</span>
                          {paper.syllabus && <span>{paper.syllabus}</span>}
                        </div>
                      </div>
                      <a
                        className="ol-past-papers-open"
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${paper.year} ${paper.subject}, ${paper.medium} PDF in a new tab`}
                        onClick={event => {
                          if (!paper.driveFileId || !window.littlePaperDesktop?.isDesktop) return;
                          event.preventDefault();
                          void openDrivePaper(paper);
                        }}
                      >
                        Open PDF <ArrowUpRight size={14}/>
                      </a>
                      {paper.driveFileId && (
                        <div className="w-full" aria-live="polite">
                          {driveDownload?.paperId === paper.id && (
                            <>
                              <progress className="desktop-update-progress mt-2" max="100" value={driveDownload.percent} aria-label={`Downloading ${paper.subject} PDF`}/>
                              <p className="mt-1 text-xs text-slate-500">
                                Downloading paper / බාගත කරමින්
                                {driveDownload.percent === undefined ? "…" : `… ${Math.round(driveDownload.percent)}%`}
                              </p>
                            </>
                          )}
                          {driveDownloadStatus?.paperId === paper.id && (
                            <p className={`mt-1 text-xs ${driveDownloadStatus.error ? "text-red-600" : "text-slate-500"}`} role={driveDownloadStatus.error ? "alert" : "status"}>
                              {driveDownloadStatus.message}
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
        ) : !selectedYearHasPapers ? (
          <div className="ol-past-papers-state">
            <h3>No {exam} papers for {year}</h3>
            <p>There are no papers for this year in the available catalogue.</p>
          </div>
        ) : (
          <div className="ol-past-papers-state">
            <h3>No matching papers found</h3>
            <p>Try another year or subject, or clear the search text.</p>
            <button
              className="secondary-button"
              type="button"
              onClick={() => { setYear("all"); setSubject("all"); setSearch(""); }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      {!loading && !error && year === "all" && (
        <p className="ol-past-papers-note">
          {exam === "O/L"
            ? "Select a subject to see its O/L papers across all available years."
            : "Grade 5 Scholarship papers are available from 2017 to 2026."}
        </p>
      )}
    </section>
  );
}
