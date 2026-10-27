"use client";

import type { CSSProperties } from "react";

export function StickerDecoration({
  variant,
  accent,
  secondary
}: {
  variant?: string;
  accent: string;
  secondary: string;
}) {
  if (!variant?.startsWith("collection-")) return null;

  const common: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 1
  };

  switch (variant) {
    case "collection-art-creative-circle":
      return <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={common}>
        <circle cx="50" cy="50" r="47.5" fill="none" stroke={secondary} strokeWidth=".65" opacity=".72"/>
        <circle cx="50" cy="50" r="44.5" fill="none" stroke={accent} strokeWidth=".25" strokeDasharray="1 2" opacity=".3"/>
        <path d="m22 19 1 2.1 2.3.3-1.7 1.6.4 2.3-2-1-2 1 .4-2.3-1.7-1.6 2.3-.3zM78 19l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1-2 1 .4-2.3-1.7-1.6 2.3-.3z" fill={secondary}/>
        <circle cx="19" cy="78" r="1.4" fill={accent} opacity=".45"/><circle cx="81" cy="78" r="1.4" fill={accent} opacity=".45"/>
        <path d="M35 8h30" stroke={secondary} strokeWidth=".7" strokeLinecap="round" opacity=".6"/>
      </svg>;
    case "collection-premium-pastel":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M2 7h24M2 10h16M75 47h22" stroke={secondary} strokeWidth=".7" opacity=".4"/>
        <circle cx="92" cy="8" r="2" fill={secondary} opacity=".6"/>
        <path d="m89 17 1.4 2.8 3 .4-2.2 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.2-2.1 3-.4z" fill={accent} opacity=".24"/>
      </svg>;
    case "collection-rainbow-kids":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M3 16a11 11 0 0 1 22 0M6 16a8 8 0 0 1 16 0M9 16a5 5 0 0 1 10 0" fill="none" stroke={secondary} strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="29" cy="9" r="1.3" fill={accent}/><circle cx="91" cy="39" r="1.5" fill={secondary}/>
        <path d="m77 5 1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z" fill={secondary}/>
      </svg>;
    case "collection-storybook":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M2 4h96" stroke={secondary} strokeWidth="1" opacity=".45"/>
        <circle cx="8" cy="42" r="3" fill={secondary} opacity=".2"/><circle cx="92" cy="9" r="2" fill={secondary} opacity=".45"/>
        <path d="m88 37 1 2 2 .3-1.5 1.4.4 2-1.9-1-1.8 1 .3-2-1.4-1.4 2-.3z" fill={accent} opacity=".35"/>
      </svg>;
    case "collection-minimal":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M8 7v36" stroke={secondary} strokeWidth="1.1"/>
        <circle cx="8" cy="6" r="2" fill={secondary}/><circle cx="8" cy="44" r="2" fill={secondary}/>
        <path d="M92 4v42" stroke={accent} strokeWidth=".35" opacity=".16"/>
      </svg>;
    case "collection-floral":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M3 43C13 38 11 27 19 21M4 40c5-1 8 1 9 5m-2-12c0-4 2-6 5-7m69 19c5-3 6-8 8-12" fill="none" stroke={secondary} strokeWidth=".8" strokeLinecap="round" opacity=".75"/>
        <circle cx="19" cy="20" r="1.6" fill={accent} opacity=".5"/><circle cx="83" cy="37" r="1.5" fill={secondary} opacity=".55"/>
      </svg>;
    case "collection-galaxy":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <circle cx="91" cy="11" r="5.5" fill="none" stroke={secondary} strokeWidth=".7" opacity=".7"/>
        <circle cx="91" cy="11" r="2.2" fill={secondary} opacity=".6"/>
        <path d="m8 8 1.1 2.2 2.4.3-1.8 1.6.4 2.4-2.1-1.1-2.1 1.1.4-2.4-1.8-1.6 2.4-.3zM88 35l.8 1.7 1.9.2-1.4 1.3.3 1.9-1.6-.9-1.7.9.3-1.9-1.4-1.3 1.9-.2z" fill={secondary}/>
        <circle cx="27" cy="8" r=".8" fill="white"/><circle cx="78" cy="8" r=".7" fill="white"/>
      </svg>;
    case "collection-nature":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 45C12 39 14 31 18 22m-8 15c-1-5 0-8 3-10m1 5c4-2 6-4 7-8m60 19c6-4 8-9 9-14" fill="none" stroke={secondary} strokeWidth=".9" strokeLinecap="round"/>
        <path d="M10 36c-5-3-6-7-5-10 5 1 8 5 7 9m5-9c0-4 2-7 5-8 1 4-1 8-5 10" fill={secondary} opacity=".5"/>
      </svg>;
    case "collection-blocks":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M0 0h3v50H0zM96 0h4v8h-4z" fill={secondary} opacity=".9"/>
        <path d="M80 50c0-7 6-13 13-13h7v13z" fill={accent} opacity=".1"/>
        <path d="M6 5h15v1H6z" fill={accent} opacity=".25"/>
      </svg>;
    case "collection-classic":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="2.5" y="2.5" width="95" height="45" rx="1.3" fill="none" stroke={secondary} strokeWidth=".5" opacity=".75"/>
        <path d="m50 3 1.8 2.2L50 7.5l-1.8-2.3z" fill={secondary}/>
        <circle cx="7" cy="25" r="1" fill={secondary}/><circle cx="93" cy="25" r="1" fill={secondary}/>
      </svg>;
    case "collection-paws":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <g fill={secondary} opacity=".38"><ellipse cx="7" cy="44" rx="2.8" ry="2.1"/><circle cx="3.5" cy="40" r="1.1"/><circle cx="6.5" cy="38.8" r="1.1"/><circle cx="9.5" cy="40" r="1.1"/><circle cx="11.2" cy="42.5" r=".9"/></g>
        <g fill={accent} opacity=".25"><ellipse cx="91" cy="8" rx="2.8" ry="2.1"/><circle cx="87.5" cy="4" r="1.1"/><circle cx="90.5" cy="2.8" r="1.1"/><circle cx="93.5" cy="4" r="1.1"/><circle cx="95.2" cy="6.5" r=".9"/></g>
      </svg>;
    case "collection-ocean":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M1 44c7-4 13 4 20 0s13 4 20 0m38-31c5-3 10 3 15 0s10 3 15 0" fill="none" stroke={secondary} strokeWidth="1" opacity=".45"/>
        <circle cx="91" cy="8" r="3" fill="none" stroke={accent} strokeWidth=".6" opacity=".3"/>
        <circle cx="81" cy="7" r=".8" fill={secondary}/><circle cx="76" cy="42" r="1.1" fill={secondary}/>
      </svg>;
    case "collection-custom-scholar":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="2.2" y="2.2" width="95.6" height="45.6" rx="3" fill="none" stroke={accent} strokeWidth=".45" opacity=".48"/>
        <path d="M47 7v36" stroke={secondary} strokeWidth=".6" strokeDasharray="1.2 1.8" opacity=".55"/>
        <path d="M5 8c3 0 4 2 4 4-3 0-4-1-4-4Zm87 30c3 0 4 2 4 4-3 0-4-1-4-4Z" fill={secondary} opacity=".65"/>
        <circle cx="42" cy="7" r=".8" fill={secondary}/><circle cx="58" cy="43" r=".8" fill={secondary}/>
      </svg>;
    case "collection-art-apple":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="2.5" y="2.5" width="95" height="45" rx="3" fill="none" stroke={accent} strokeWidth=".45" opacity=".42"/>
        <path d="M49 7v36" stroke={secondary} strokeWidth=".55" strokeDasharray="1.2 1.5" opacity=".58"/>
        <path d="M5 11c3-3 5-2 6 1-3 2-5 2-6-1Zm84 28c3-2 5-1 6 2-3 1-5 1-6-2Z" fill={secondary}/>
      </svg>;
    case "collection-art-lion":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 8h19m-19 3h12M77 44h19" stroke={secondary} strokeWidth=".7" strokeLinecap="round" opacity=".5"/>
        <circle cx="92" cy="9" r="3" fill="none" stroke={accent} strokeWidth=".65" opacity=".42"/>
        <path d="m90 40 1 2 2 .3-1.5 1.4.3 2-1.8-1-1.8 1 .3-2-1.5-1.4 2-.3z" fill={secondary}/>
      </svg>;
    case "collection-art-honey":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="m7 7 3-1.7L13 7v3.4l-3 1.7-3-1.7zm8 2 2-1.2L19 9v2.4l-2 1.2-2-1.2zm66 28 2-1.2 2 1.2v2.4l-2 1.2-2-1.2z" fill="none" stroke={secondary} strokeWidth=".65" opacity=".6"/>
        <circle cx="91" cy="10" r="1" fill={accent}/><circle cx="76" cy="7" r=".8" fill={secondary}/>
      </svg>;
    case "collection-art-penguin":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M2 44c7-4 12 4 19 0s12 4 19 0m39-34c6-3 10 3 16 0s9 3 13 0" fill="none" stroke={secondary} strokeWidth=".9" opacity=".55"/>
        <path d="m10 7 1 2 2 .3-1.5 1.4.3 2-1.8-1-1.8 1 .3-2L7 9.3 9 9z" fill={accent} opacity=".42"/>
        <circle cx="91" cy="39" r="1.2" fill={secondary}/>
      </svg>;
    case "collection-art-blue-bee":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 12h13m-8-4v8m72 28h13m-8-4v8" stroke={secondary} strokeWidth=".65" strokeLinecap="round" opacity=".65"/>
        <circle cx="24" cy="8" r="1.2" fill={accent}/><circle cx="29" cy="13" r=".8" fill={secondary}/>
        <path d="M88 8c0-2 2-4 4-4s4 2 4 4c0 2-4 5-4 5s-4-3-4-5Z" fill={secondary} opacity=".65"/>
      </svg>;
    case "collection-art-unicorn":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="m9 6 1.2 2.4 2.7.4-2 1.9.5 2.7L9 12l-2.4 1.4.5-2.7-2-1.9 2.7-.4zM91 36l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill={secondary}/>
        <circle cx="81" cy="9" r="3.2" fill="none" stroke={accent} strokeWidth=".65" opacity=".45"/>
        <path d="M6 39h13" stroke={accent} strokeWidth=".65" strokeLinecap="round" opacity=".35"/>
      </svg>;
    case "collection-art-bunny":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 44c6-4 7-10 10-15m-5 10c-3-1-5 0-6 3m9-9c3-1 5-3 6-6m62 17c5-4 6-9 8-15" fill="none" stroke={secondary} strokeWidth=".8" strokeLinecap="round"/>
        <circle cx="15" cy="28" r="1.2" fill={accent}/><circle cx="19" cy="24" r=".9" fill={secondary}/>
      </svg>;
    case "collection-art-monster":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <circle cx="9" cy="10" r="3.2" fill={secondary} opacity=".16"/><circle cx="17" cy="8" r="1" fill={accent}/>
        <path d="m85 43 4-7 4 7zM80 8l1.2 2.2 2.4.4-1.8 1.6.4 2.4-2.2-1.1-2.1 1.1.4-2.4-1.8-1.6 2.4-.4z" fill={secondary} opacity=".7"/>
      </svg>;
    case "collection-art-lamb":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M2 44c8-5 14 4 22 0s14 4 22 0" fill="none" stroke={secondary} strokeWidth=".75" opacity=".6"/>
        <path d="m12 7 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2L9 9.3l2.2-.3z" fill={accent} opacity=".35"/>
        <circle cx="91" cy="10" r="2.1" fill={secondary} opacity=".55"/>
      </svg>;
    case "collection-art-schoolgirl":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M3 7h20M77 44h20" stroke={secondary} strokeWidth=".6" strokeLinecap="round" opacity=".55"/>
        <g fill={secondary} opacity=".5"><circle cx="87" cy="8" r="1.5"/><circle cx="84.5" cy="8" r="1.2"/><circle cx="89.5" cy="8" r="1.2"/><circle cx="87" cy="5.5" r="1.2"/><circle cx="87" cy="10.5" r="1.2"/></g>
        <circle cx="9" cy="40" r="1.3" fill={accent} opacity=".4"/>
      </svg>;
    case "collection-art-birds":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 44c7-4 11-10 15-17m-9 12c-1-4 0-7 3-9m2 3c4-2 6-4 7-7m52 20c6-3 9-8 12-14" fill="none" stroke={secondary} strokeWidth=".75" strokeLinecap="round" opacity=".7"/>
        <path d="M10 38c-4-2-5-5-4-8 4 1 6 4 5 7m8-8c0-3 2-5 4-6 1 3 0 6-3 7" fill={accent} opacity=".35"/>
      </svg>;
    case "collection-art-reading":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M5 41h21m-21 3h16m57-31h17" stroke={secondary} strokeWidth=".7" strokeLinecap="round" opacity=".58"/>
        <path d="M9 9h9v9H9z" fill="none" stroke={accent} strokeWidth=".6" opacity=".4"/>
        <path d="m90 36 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill={secondary}/>
      </svg>;
    case "collection-art-duck":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M2 43c6-3 10 3 16 0s10 3 16 0m48-34c5-3 9 3 14 0s9 3 14 0" fill="none" stroke={secondary} strokeWidth=".8" opacity=".6"/>
        <circle cx="91" cy="39" r="2.5" fill="none" stroke={accent} strokeWidth=".6" opacity=".45"/>
        <circle cx="85" cy="34" r=".8" fill={secondary}/>
      </svg>;
    case "collection-art-school-walk":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M3 38c8-8 12 7 20-1m48-25h19" fill="none" stroke={secondary} strokeWidth=".75" strokeDasharray="1.5 2" opacity=".7"/>
        <circle cx="14" cy="11" r="3" fill="none" stroke={accent} strokeWidth=".65" opacity=".35"/>
        <path d="m33 7 1 2 2 .3-1.5 1.4.3 2-1.8-1-1.8 1 .3-2L31 9.3l2-.3z" fill={secondary}/>
      </svg>;
    case "collection-art-dolphin":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M2 43c6-4 11 4 18 0m0 4c6-3 10 3 16 0m44-34c6-4 10 4 16 0" fill="none" stroke={secondary} strokeWidth=".8" opacity=".65"/>
        <circle cx="90" cy="8" r="1.4" fill="none" stroke={accent} strokeWidth=".6"/><circle cx="84" cy="14" r=".8" fill={secondary}/>
      </svg>;
    case "collection-art-sunshine-student":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <circle cx="12" cy="11" r="3.2" fill="none" stroke={secondary} strokeWidth=".7"/>
        <path d="M12 5v-2m0 16v-2m-6-6H4m16 0h-2m-10-4L6.5 5.5m11 11L16 15m-8 0-1.5 1.5m11-11L16 7M4 42h18" stroke={accent} strokeWidth=".65" strokeLinecap="round" opacity=".55"/>
      </svg>;
    case "collection-art-bookish-student":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 8h17v13H4zm8 0v13m-5-9h3m-3 3h3m5-3h2m-2 3h2" fill="none" stroke={secondary} strokeWidth=".65" opacity=".68"/>
        <path d="M78 43h18m-9-5v10" stroke={accent} strokeWidth=".65" strokeLinecap="round" opacity=".38"/>
      </svg>;
    case "collection-art-turtle-study":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M5 43c7-4 12 4 20 0m-15-5 2-3m4 4 2-4m69-25h9" fill="none" stroke={secondary} strokeWidth=".8" strokeLinecap="round"/>
        <circle cx="12" cy="10" r="2.2" fill="none" stroke={accent} strokeWidth=".65" opacity=".45"/>
      </svg>;
    case "collection-art-panda-study":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M7 42V28m0 5-4-4m4 8 4-4m-1 9V31m0 4 3-3m-3 6-3-3m69 8h17" fill="none" stroke={secondary} strokeWidth=".75" strokeLinecap="round" opacity=".7"/>
        <circle cx="20" cy="9" r="1.1" fill={accent}/><circle cx="24" cy="14" r=".8" fill={secondary}/>
      </svg>;
    case "collection-art-kindness-angel":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <ellipse cx="14" cy="10" rx="5" ry="2" fill="none" stroke={secondary} strokeWidth=".75"/>
        <path d="m15 29 1.1 2.3 2.5.4-1.8 1.7.4 2.5-2.2-1.2-2.2 1.2.4-2.5-1.8-1.7 2.5-.4zM83 8l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.2 1.8-.3z" fill={secondary}/>
      </svg>;
    case "collection-art-teddy-friend":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M13 8c-2-3-6 0-4 3l4 4 4-4c2-3-2-6-4-3Z" fill={secondary} opacity=".65"/>
        <circle cx="86" cy="40" r="3" fill="none" stroke={accent} strokeWidth=".65" opacity=".45"/>
        <path d="M4 41h16" stroke={secondary} strokeWidth=".7" strokeLinecap="round"/>
      </svg>;
    case "collection-art-school-friends":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 8h19m-12-3v6m67 34h16m-10-3v6" stroke={secondary} strokeWidth=".7" strokeLinecap="round"/>
        <circle cx="32" cy="9" r="1.1" fill={accent}/><circle cx="71" cy="41" r="1.1" fill={secondary}/>
        <path d="m91 7 1 2 2 .3-1.5 1.4.3 2-1.8-1-1.8 1 .3-2L88 9.3l2-.3z" fill={secondary}/>
      </svg>;
    case "collection-art-young-scholar":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="m5 11 8-4 8 4-8 4-8-4Zm3 2v4c3 2 7 2 10 0v-4m-5-6v6m71 29h12" fill="none" stroke={secondary} strokeWidth=".7" strokeLinejoin="round"/>
        <circle cx="25" cy="9" r="1" fill={accent}/>
      </svg>;
    case "collection-art-midnight-cat":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M13 5a6 6 0 1 0 6 9 5 5 0 0 1-6-9Z" fill={secondary} opacity=".72"/>
        <path d="m29 8 .9 1.9 2.1.3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.4 2.1-.3z" fill={accent} opacity=".6"/>
        <circle cx="90" cy="39" r="1.2" fill={secondary}/>
      </svg>;
    case "collection-art-storybook-girl":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M5 37c4-2 8-2 12 0v9c-4-2-8-2-12 0zm12 0c4-2 8-2 12 0v9c-4-2-8-2-12 0m-6-7v9m12-9v9" fill="none" stroke={secondary} strokeWidth=".65" opacity=".72"/>
        <path d="m38 7 1 2 2 .3-1.5 1.4.3 2-1.8-1-1.8 1 .3-2L35 9.3l2-.3z" fill={accent} opacity=".48"/>
      </svg>;
    case "collection-art-winter-snowpal":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 44c8-4 14 4 22 0m53 0c6-4 11 4 17 0m-78-30h8m-4-4v8m-3-7 6 6m0-6-6 6m67 18h8m-4-4v8m-3-7 6 6m0-6-6 6" fill="none" stroke={secondary} strokeWidth=".7" strokeLinecap="round"/>
        <circle cx="39" cy="8" r="1" fill={accent}/><circle cx="71" cy="15" r=".8" fill={secondary}/>
      </svg>;
    case "collection-label-professional-blue":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 5h92M4 45h92" stroke={secondary} strokeWidth=".35" opacity=".5"/>
        <path d="M8 9v32" stroke={accent} strokeWidth="1.2" opacity=".7"/>
      </svg>;
    case "collection-label-modern-outline":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="4" y="4" width="92" height="42" rx="6" fill="none" stroke={secondary} strokeWidth=".45" opacity=".55"/>
        <circle cx="10" cy="10" r="1" fill={accent}/><circle cx="90" cy="40" r="1" fill={accent}/>
      </svg>;
    case "collection-label-executive-stripe":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M5 8h90M5 11h48" stroke={secondary} strokeWidth=".55"/>
        <rect x="5" y="39" width="90" height="3" rx="1.5" fill={accent} opacity=".12"/>
      </svg>;
    case "collection-label-staff-identity":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M7 8h18m-18 2h12M75 40h18" stroke={secondary} strokeWidth=".6" strokeLinecap="round"/>
        <circle cx="90" cy="10" r="2.3" fill="none" stroke={accent} strokeWidth=".55" opacity=".45"/>
      </svg>;
    case "collection-label-school-classic":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="m11 8 1.2 2.4 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4zM89 34l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill={secondary} opacity=".68"/>
      </svg>;
    case "collection-label-tech-grid":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M5 5h22v8H5zm4 4h3m2 0h6M75 36h20v8H75z" fill="none" stroke={secondary} strokeWidth=".55" opacity=".62"/>
        <path d="M27 9h8v8h8m32 23h-8v-8h-8" fill="none" stroke={accent} strokeWidth=".55" opacity=".45"/>
        <circle cx="35" cy="9" r="1" fill={secondary}/><circle cx="64" cy="32" r="1" fill={secondary}/>
      </svg>;
    case "collection-label-circuit-edge":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 6h12v8h9m-21 2h9v6h8m75 22H82v-8h-9m23-2h-9v-6h-8" fill="none" stroke={secondary} strokeWidth=".75"/>
        <circle cx="25" cy="14" r="1.4" fill={accent}/><circle cx="73" cy="36" r="1.4" fill={accent}/>
      </svg>;
    case "collection-label-digital-wave":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M3 39c12-12 18 8 30-2s18 8 30-2 20 4 34-4M3 43c12-12 18 8 30-2s18 8 30-2 20 4 34-4" fill="none" stroke={secondary} strokeWidth=".55" opacity=".65"/>
      </svg>;
    case "collection-label-code-minimal":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="m11 8-5 4 5 4m6 0 5-4-5-4m8 4h7M5 40h18m54-29h18" fill="none" stroke={secondary} strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    case "collection-label-ai-geometry":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M11 11 20 6l9 5v10l-9 5-9-5zm9-5v20m-9-15 18 10M80 29l8 4v9l-8 4-8-4v-9z" fill="none" stroke={secondary} strokeWidth=".55" opacity=".72"/>
        <circle cx="20" cy="16" r="2" fill={accent} opacity=".5"/>
      </svg>;
    case "collection-label-plain-white":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M5 43h90" stroke={secondary} strokeWidth=".3" opacity=".45"/>
      </svg>;
    case "collection-label-rounded-classic":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M9 7h15m52 0h15M9 43h15m52 0h15" stroke={secondary} strokeWidth=".6" strokeLinecap="round" opacity=".7"/>
      </svg>;
    case "collection-label-double-border":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="4" y="4" width="92" height="42" rx="1" fill="none" stroke={secondary} strokeWidth=".35" opacity=".6"/>
      </svg>;
    case "collection-label-ink-saver":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M5 7h16m-16 2h10M79 41h16m-10-3v6" stroke={accent} strokeWidth=".45" opacity=".5"/>
      </svg>;
    case "collection-label-corner-accent":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 17V5h18M96 33v12H78" fill="none" stroke={secondary} strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="9" cy="10" r="1.1" fill={accent}/><circle cx="91" cy="40" r="1.1" fill={accent}/>
      </svg>;
    case "collection-label-soft-pastel":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <circle cx="12" cy="11" r="3" fill={secondary} opacity=".12"/><circle cx="88" cy="39" r="4" fill={accent} opacity=".08"/>
        <path d="m85 8 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill={secondary}/>
      </svg>;
    case "collection-label-gradient-flow":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M2 40c18-18 32 12 50-2s30-8 46 1" fill="none" stroke={secondary} strokeWidth="1.2" opacity=".4"/>
        <path d="M4 43c18-12 30 9 48-2s30-7 44 0" fill="none" stroke={accent} strokeWidth=".45" opacity=".35"/>
      </svg>;
    case "collection-label-geometric-bloom":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <circle cx="12" cy="10" r="2.2" fill="none" stroke={secondary} strokeWidth=".6"/>
        <path d="m12 5 1.4 3.6L17 10l-3.6 1.4L12 15l-1.4-3.6L7 10l3.6-1.4zM88 34l1.2 3.1 3.1 1.2-3.1 1.2-1.2 3.1-1.2-3.1-3.1-1.2 3.1-1.2z" fill="none" stroke={accent} strokeWidth=".6" opacity=".65"/>
      </svg>;
    case "collection-label-botanical-line":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M7 43c8-9 12-17 13-31m-8 22c-5-1-7-4-7-8 5 0 8 2 8 6m4-9c-1-4 1-7 5-9 2 4 1 7-3 10m69 18c4-4 6-8 7-13" fill="none" stroke={secondary} strokeWidth=".65" strokeLinecap="round"/>
      </svg>;
    case "collection-label-creative-layers":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <path d="M4 6h27v4H4zm65 34h27v4H69z" fill={secondary} opacity=".14"/>
        <path d="M6 8h25M69 42h25" stroke={accent} strokeWidth=".6" opacity=".6"/>
        <circle cx="88" cy="9" r="2" fill={secondary} opacity=".75"/><circle cx="12" cy="40" r="1.4" fill={accent} opacity=".4"/>
      </svg>;
    case "collection-art-enchanted-frame":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="3" fill="none" stroke={secondary} strokeWidth="2.2" opacity=".75"/>
        <rect x="5" y="5" width="90" height="40" rx="2" fill="none" stroke={accent} strokeWidth=".45" strokeDasharray="1.2 1.7" opacity=".55"/>
        <path d="M7 8c3 0 4 2 4 5-3 0-4-2-4-5Zm5 3c0-3 2-5 5-5 0 3-2 5-5 5Zm71 27c3 0 5 2 5 5-3 0-5-2-5-5Zm5 1c0-3 2-5 5-5 0 3-2 5-5 5Z" fill={secondary}/>
        <circle cx="14" cy="13" r="1" fill={accent}/><circle cx="88" cy="38" r="1" fill={accent}/>
      </svg>;
    case "collection-art-bright-birds":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="1.5" fill="none" stroke={secondary} strokeWidth="2.4" opacity=".8"/>
        <path d="M4 7h22m-22 2h15M74 41h22m-14 2h14" stroke={accent} strokeWidth=".6" strokeLinecap="round" opacity=".7"/>
        <path d="m14 37 1.2 2.7 2.8.4-2 1.9.5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-1.9 2.8-.4zM85 7l1 2 2.1.3-1.5 1.5.4 2.1-2-1-1.9 1 .4-2.1-1.6-1.5 2.2-.3z" fill={secondary}/>
        <circle cx="23" cy="40" r="1" fill={accent}/><circle cx="78" cy="9" r="1" fill={accent}/>
      </svg>;
    case "collection-art-adventure-pals":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="4" fill="none" stroke={secondary} strokeWidth="2.2" opacity=".82"/>
        <path d="M5 8h17m-17 2h11M78 40h17m-11 2h11" stroke={accent} strokeWidth=".65" strokeLinecap="round" opacity=".65"/>
        <path d="m25 6 1 2.2 2.4.3-1.7 1.7.4 2.4-2.1-1.1-2.1 1.1.4-2.4-1.7-1.7 2.4-.3zM76 37l1 2.2 2.4.3-1.7 1.7.4 2.4-2.1-1.1-2.1 1.1.4-2.4-1.7-1.7 2.4-.3z" fill={secondary}/>
        <circle cx="10" cy="39" r="1.2" fill={accent}/><circle cx="90" cy="10" r="1.2" fill={accent}/>
      </svg>;
    case "collection-art-fairy-sparkle":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="8" fill="none" stroke={secondary} strokeWidth="2.4"/>
        <rect x="4.5" y="4.5" width="91" height="41" rx="6" fill="none" stroke={accent} strokeWidth=".45" strokeDasharray="1 1.6" opacity=".65"/>
        <path d="m10 8 1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8L6 13l2.8-1.2zM91 35l1.1 2.4 2.4 1.1-2.4 1.1-1.1 2.4-1.1-2.4-2.4-1.1 2.4-1.1z" fill={secondary}/>
        <circle cx="18" cy="39" r="1" fill={accent}/><circle cx="83" cy="10" r="1" fill={accent}/>
      </svg>;
    case "collection-art-fairy-crown":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="5" fill="none" stroke={accent} strokeWidth="1.25"/>
        <path d="M7 7h25m36 0h25M7 43h25m36 0h25" stroke={secondary} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="m12 6 1.5 3 3 .4-2.2 2.1.5 3-2.8-1.4-2.7 1.4.5-3-2.2-2.1 3-.4zM88 35l1.4 2.7 2.8.4-2 2 .5 2.8-2.7-1.3-2.6 1.3.5-2.8-2.1-2 2.8-.4z" fill={secondary}/>
        <circle cx="89" cy="11" r="1" fill={accent}/><circle cx="11" cy="39" r="1" fill={accent}/>
      </svg>;
    case "collection-art-unicorn-rainbow":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="10" fill="none" stroke={secondary} strokeWidth="2.4"/>
        <path d="M5 42c6-8 13-8 19 0m52-34c6 8 13 8 19 0" fill="none" stroke={accent} strokeWidth=".75" strokeLinecap="round" opacity=".7"/>
        <path d="m15 7 1.2 2.3 2.5.4-1.8 1.7.4 2.5-2.3-1.2-2.2 1.2.4-2.5-1.8-1.7 2.5-.4zM86 36l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill={secondary}/>
        <circle cx="23" cy="9" r="1" fill={accent}/><circle cx="77" cy="41" r="1" fill={accent}/>
      </svg>;
    case "collection-art-unicorn-heart":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="7" fill="none" stroke={secondary} strokeWidth="2.2"/>
        <rect x="5" y="5" width="90" height="40" rx="5" fill="none" stroke={accent} strokeWidth=".5" strokeDasharray="2 1.5" opacity=".55"/>
        <path d="M9 10c0-2 3-2 3 0 0-2 3-2 3 0s-3 4-3 4-3-2-3-4Zm73 27c0-2 3-2 3 0 0-2 3-2 3 0s-3 4-3 4-3-2-3-4Z" fill={secondary}/>
        <circle cx="19" cy="39" r="1" fill={accent}/><circle cx="84" cy="10" r="1" fill={accent}/>
      </svg>;
    case "collection-art-skater-tiger":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="3" fill="none" stroke={secondary} strokeWidth="2.3"/>
        <path d="M5 7h18m-13 3h14m53 30h18m-13 3h14" stroke={accent} strokeWidth="1.1" strokeLinecap="round"/>
        <circle cx="12" cy="37" r="2" fill="none" stroke={secondary} strokeWidth=".8"/><circle cx="88" cy="12" r="2" fill="none" stroke={secondary} strokeWidth=".8"/>
        <path d="m27 5 1 2 2 .3-1.5 1.5.3 2-1.8-.9-1.8.9.3-2L25 7.3l2-.3z" fill={accent}/>
      </svg>;
    case "collection-art-bear-hugs":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="8" fill="none" stroke={secondary} strokeWidth="2.5"/>
        <path d="M7 8c0-2 3-2 3 0 0-2 3-2 3 0s-3 4-3 4-3-2-3-4Zm76 29c0-2 3-2 3 0 0-2 3-2 3 0s-3 4-3 4-3-2-3-4Z" fill={secondary}/>
        <path d="M15 40h18m52-30H67" stroke={accent} strokeWidth=".55" strokeLinecap="round" opacity=".6"/>
        <circle cx="20" cy="10" r=".9" fill={accent}/><circle cx="80" cy="40" r=".9" fill={accent}/>
      </svg>;
    case "collection-art-parrot-party":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="5" fill="none" stroke={secondary} strokeWidth="2.3"/>
        <path d="M8 41c4-6 7-8 13-8m71-24c-4 6-7 8-13 8" fill="none" stroke={accent} strokeWidth=".8" strokeLinecap="round"/>
        <path d="M17 32c-4 0-6-3-5-6 4 0 6 2 6 5m-3 1c0-4 2-7 6-8 1 4-1 7-5 9m66-4c-4 0-6-3-5-6 4 0 6 2 6 5m-3 1c0-4 2-7 6-8 1 4-1 7-5 9" fill={secondary}/>
        <circle cx="28" cy="10" r="1" fill={accent}/><circle cx="72" cy="40" r="1" fill={accent}/>
      </svg>;
    case "collection-art-sunny-chick":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="7" fill="none" stroke={secondary} strokeWidth="2.5"/>
        <path d="M6 8h22M72 42h22" stroke={accent} strokeWidth=".6" strokeLinecap="round" opacity=".6"/>
        <path d="m14 33 1.1 2.4 2.5.4-1.8 1.7.4 2.5-2.2-1.2-2.2 1.2.4-2.5-1.8-1.7 2.5-.4zM86 8l1.1 2.4 2.5.4-1.8 1.7.4 2.5-2.2-1.2-2.2 1.2.4-2.5-1.8-1.7 2.5-.4z" fill={secondary}/>
        <circle cx="24" cy="40" r="1" fill={accent}/><circle cx="77" cy="9" r="1" fill={accent}/>
      </svg>;
    case "collection-art-bluebird-giggles":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="4" fill="none" stroke={secondary} strokeWidth="2.4"/>
        <path d="M7 8c5 0 8 2 9 7m77 27c-5 0-8-2-9-7" fill="none" stroke={accent} strokeWidth=".65"/>
        <path d="M15 14c-4 0-6-3-5-6 4 0 6 2 6 5m69 23c4 0 6 3 5 6-4 0-6-2-6-5" fill={secondary}/>
        <path d="m23 7 1 2.1 2.3.3-1.7 1.6.4 2.3-2-1-2 1 .4-2.3-1.7-1.6 2.3-.3zM77 37l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1-2 1 .4-2.3-1.7-1.6 2.3-.3z" fill={accent}/>
      </svg>;
    case "collection-art-fairy-star":
      return <svg aria-hidden="true" viewBox="0 0 100 50" preserveAspectRatio="none" style={common}>
        <rect x="1.5" y="1.5" width="97" height="47" rx="8" fill="none" stroke={secondary} strokeWidth="2.5"/>
        <path d="M6 8h22m44 0h22M6 42h22m44 0h22" stroke={accent} strokeWidth=".5" strokeDasharray="1 1.5" opacity=".65"/>
        <path d="m13 7 1.3 2.8 2.8 1.3-2.8 1.2-1.3 2.8-1.2-2.8L9 11.1l2.8-1.3zM87 34l1.1 2.4 2.4 1.1-2.4 1.1-1.1 2.4-1.1-2.4-2.4-1.1 2.4-1.1z" fill={secondary}/>
        <circle cx="21" cy="39" r=".9" fill={accent}/><circle cx="79" cy="11" r=".9" fill={accent}/>
      </svg>;
    default:
      return null;
  }
}
