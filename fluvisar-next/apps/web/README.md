# FluviSAR Web Application

React/TypeScript frontend for the Jamuna and Sundarbans satellite Observatory, Evidence workflow, Decision Desk, ML Intelligence and SAR Lab.

**Full platform guide:** [Repository README](../../../README.md)

**Scientific archive:** [Real observations](../../../docs/REAL_OBSERVATIONS.md)

**Six-stage analysis:** [Evidence workflow](../../../docs/EVIDENCE_WORKFLOW.md)

## Run locally

Prepare the Python 3.12 environment at `fluvisar-next/.venv-data` and install `fluvisar-next/requirements-data.txt` first. See the root [Quick start](../../../README.md#3-quick-start) for Windows and macOS/Linux commands.

From this directory:

```bash
npm ci
npm run dev
```

The launcher starts or reuses the FastAPI service on port 8000, then starts Vite on port 5173. `/api` requests are proxied to the local service. Registered artifacts must be present for numerical sampling and Evidence calculations.

## Main routes

| Route | View |
| --- | --- |
| `/` | Landing |
| `/atlas` | Regional atlas |
| `/observatory/jamuna` | Jamuna satellite workspace |
| `/observatory/sundarbans` | Sundarbans satellite workspace |
| `/impact` | Decision Desk |
| `/intelligence` | Generated ML sandbox and source-linked evidence |
| `/sar-lab` | Educational SAR experiments |
| `/stories` | Guided observation stories |
| `/reports` | Default-pair report and provenance |

## Build and browser checks

```bash
npm run build
npx playwright install chromium
npm run test:e2e -- --workers=1
```

The output directory is `dist/`. Hosted deep links need SPA fallback routing; deployed numerical/Evidence features also need an API reverse proxy and the registered numerical archive. See [hosting notes](../../../README.md#17-build-hosting-and-troubleshooting).

## Source map

- `src/App.tsx`: route composition and Observatory assembly.
- `src/components/MapWorkspace.tsx`: registered map sources and camera synchronization.
- `src/components/EvidenceWorkbench.tsx`: direct stages and guided Live Analysis.
- `src/components/EvidenceStagePanels.tsx`: source-backed report content.
- `src/data/evidence.tsx`: shared catalogue and comparison loading.
- `src/data/fieldEvidence.ts`: browser-local field records and media export.
- `src/store/`: workspace and Evidence workflow state.
- `src/features/legacy/`: integrated Decision Desk, ML and SAR Lab pages.
- `public/observations/`: source-linked static artifacts.
- `tests/`: browser workflow, observation and readability checks.

Operational radar data is Sentinel-1 VV/VH. Generated ML and NISAR/InSAR teaching examples are separate from the measured archive. Consult the root [interpretation boundaries](../../../README.md#18-current-boundaries-and-next-steps) before using results in a demonstration.
