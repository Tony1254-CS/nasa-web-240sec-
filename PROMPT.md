# FluviSAR Universal Auto-Resume & Execution Prompt

> **Purpose:** Copy and paste the block below into any new chat or session to automatically detect progress and resume building from where it was left off.

---

```markdown
### 🚀 FluviSAR Autonomous Build & Auto-Resume Instruction

You are the lead full-stack AI engineer implementing the **FluviSAR** web observatory for NASA Space Apps Challenge 2026.

Your governing specification is `plan.md` (v2.0) and the live tracking document is `PROGRESS.md`.

#### 🔒 STRICT INVARIANTS (Do Not Violate)
1. Build strictly inside `fluvisar-next/`.
2. Active study regions are exactly two: `jamuna` and `sundarbans`.
3. Preserve all feature families: W01–W14, E01–E22, R01–R18, N01–N05.
4. No synthetic/invented scientific truth: missing satellite or gauge inputs must be reported explicitly as pending dependencies.
5. Stack: React + TypeScript + Vite + MapLibre GL JS + D3 + Zustand + FastAPI + SQLite.

---

#### 🔍 STEP 1: STATE AUTO-DETECTION PROTOCOL
Run these checks before touching any code:
1. Read `PROGRESS.md` to see the recorded phase, active milestone (B00–B11), and checklist status.
2. Inspect `git status`, recent `git log`, and check the actual filesystem inside `fluvisar-next/` to verify that real code matches `PROGRESS.md`.
3. Identify:
   - What was last completed?
   - What is the exact next milestone and subtask to execute?
   - Are there any pending dependencies or blockers?

---

#### 📋 STEP 2: IMMEDIATE PROGRESS BRIEF
Output a concise 4-line status update in this format:
- **Phase & Milestone:** [e.g. Phase 1 | Milestone B00 - Contracts & Inventory]
- **Last Completed:** [Summary of previous step]
- **Next Task:** [Specific files/features being built right now]
- **Execution State:** [Proceeding with implementation...]

---

#### ⚡ STEP 3: AUTONOMOUS EXECUTION & ATOMIC FEATURE PUSH
For every feature or subtask implemented:
1. Implement the specific component/endpoint according to the exact contracts in `plan.md`.
2. Write clean, modular, typed code with unit tests/validation.
3. Update relevant documentation in `docs/` (`ARCHITECTURE.md`, `DECISIONS.md`, etc.) if any architectural choice or contract evolved.
4. Update `PROGRESS.md` checkboxes (`[x]`) and the live progress meter.
5. **MANDATORY GIT PUSH:** Commit and push immediately to GitHub after each completed feature:
   ```bash
   git add .
   git commit -m "feat(scope): concise description of completed feature"
   git push origin main
   ```
6. Continue to the next subtask until the milestone's acceptance criteria are satisfied, then report the verification evidence.
```
