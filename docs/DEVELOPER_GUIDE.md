# Developer Onboarding & Contribution Guide

Welcome to the **FluviSAR** codebase! This guide gets you up and running in minutes and explains our development conventions.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20+ (v24 recommended) & **npm**
- **Python**: 3.11+
- **Git**
- *(Optional)* Docker

### 2. Directory Structure
```text
fluvisar-next/           # Primary application workspace
  apps/web/              # React + Vite + TypeScript frontend
  services/api/          # FastAPI backend services
  packages/contracts/    # Shared Pydantic/TypeScript data schemas
  pipeline/fluvisar/     # Python SAR processing pipeline
docs/                    # Developer documentation & ADRs
plan.md                  # Master authoritative specification
PROGRESS.md              # Live tracking dashboard
PROMPT.md                # Universal auto-resume prompt
```

### 3. Running the Web Application
```bash
cd fluvisar-next/apps/web
npm install
npm run dev
```

### 4. Running Backend Services
```bash
cd fluvisar-next/services/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 🛠️ Development Standards & Git Workflow

### Feature-Level Atomic Commits & Instant Push
To maintain continuous sync across developers and agents:
1. Implement **one specific feature/subtask** at a time.
2. Run tests to verify no regressions.
3. Update relevant documentation in `docs/` if architectural choices or APIs changed.
4. Update `PROGRESS.md` checklist.
5. Commit and **immediately push** to GitHub:
   ```bash
   git add .
   git commit -m "feat(module): description of feature"
   git push origin main
   ```

### Code Style
- **TypeScript:** Strict type checking enabled (`strict: true`). No `any` without explicit justification.
- **Python:** Type hints on all functions; Pydantic models for request/response payloads.
- **Bilingual:** All user-facing UI strings must support both English and Bangla (`Noto Sans Bengali`).
