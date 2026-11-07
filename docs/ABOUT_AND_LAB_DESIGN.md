# About story and SAR Lab presentation

## About FluviSAR

`/about` presents the project as four chapters: the question, the landscapes, the approach and the people. `/about-us` redirects to the same page. Primary navigation and the landing footer expose the story. The chapter navigation supports direct anchors, a reading indicator and mobile scrolling.

Names and project roles are retained from the earlier `nasa-2026-web/web/src/pages/About.tsx`:

| Name | Project role | Contribution |
| --- | --- | --- |
| Sabbir Ahmed | Mission Commander | System Architecture & AI Pipeline |
| Sanjid Talukder | Data Scientist | SAR Processing & Remote Sensing |
| Sakibul Hassan Shovon | AI Engineer | Interactive Visualization & UX |
| Yasin Arafat | Hydro Analyst | River Dynamics & Quality Assurance |

Only the GitHub link present in the original team record is used. Initials represent team members; no invented biographies or portraits are added. Landscape images, dates and acquisition counts come from the active registered catalogue. The copy describes the current Sentinel-1 evidence workflow rather than carrying forward the earlier project's NISAR operational-data claims. Source details remain in Reports.

## SAR Lab: CSS-only changes

The Lab presentation uses the same surface, border, accent, type scale and container spacing as the analysis workspaces. Dark/light palettes and small-screen layouts are scoped to `.sar-lab`. Its existing hero, disclosure, sections, diagrams, controls, teaching simulations and references remain present.

The original page source is byte-identical before and after this change:

```text
fluvisar-next/apps/web/src/features/legacy/pages/SARLab.tsx
SHA-256: 22DE17B985E87A2BB839FB99897FB76B5BE900864EF95154993C17085C7998BB
```

All changes to the Lab live in `src/styles/sar-lab-consistency.css`, imported by the shared layout. No Lab source text, image reference, calculation, default input, event handler or scientific dataset was edited. The initial inventory remains 19 buttons and 17 range inputs with their original limits and default values.

## Checks

Browser checks cover team identity and roles, registered imagery, chapter navigation, route aliases, light/dark presentation, mobile/tablet navigation, the Lab control inventory, original section anchors, band selection, standing-water toggling, threshold changes and change-map scanning. Every Lab range input is checked for visibility and viewport fit on mobile. Production TypeScript/Vite build and the existing route/data/UI regression suite are also run.
