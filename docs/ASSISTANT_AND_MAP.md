# FluviSAR Assistant and geographic fly-in

The Observatory fly-in and shared assistant preserve the current study-area data, imagery alignment and page layout. Both Jamuna and Sundarbans use the same implementation.

## Geographic camera sequence

`MapWorkspace` uses one camera to drive the synchronized before/after views. The sequence moves from a wide view through Bangladesh into the registered observation bounding box. The final camera retains zoom 11.4 and pitch 55 degrees in both regions; comparison views use shared study bounds. Image-source coordinates never change.

- Runs once per region on each fresh Observatory mount, with Replay and Skip controls. A previous session-level seen flag no longer suppresses the introduction.
- Dragging, scrolling, touching or using the keyboard interrupts the flight.
- Reduced-motion users go straight to the final study-area camera.
- Animation uses camera completion events, with listener cleanup when a map unmounts.
- Only tagged fly-in events advance the sequence. Both comparison maps resize together before camera synchronization resumes, so a follower resize cannot interrupt the primary flight. The final destination preserves the requested camera; comparison fitting measures the current viewport.
- Date/layer changes do not replay the introduction. Map handoffs focus the selected candidate centroid.

## One assistant, two entry points

**Ask FluviSAR** in the primary navigation and the bottom-left floating launcher open the same docked chat window. It is a non-modal `section` with dialog semantics: no separate popup, backdrop, background blur or inert page. The launcher minimizes the conversation, and Escape inside the panel closes it with focus restoration. Background controls remain usable. **Chat with Data** appears beside supported metrics, model workspace explanations and the active Evidence report stage; it highlights supported boxes before opening a conversation. Clicking a highlighted box, or pressing Enter on it, opens chat scoped to that box. Escape or Cancel leaves selection mode. Report selection stays inside the report, and opening chat does not resize underlying cards. Atlas and other unsupported surfaces do not show a Chat with Data action; the experimental Atlas outlook is not part of the assistant data tools.

The panel displays the active region, registered comparison dates and selected finding. Model workspaces have a separate synthetic context. Conversations persist on the device by run and measured/model context. Each answer retains its own pair and finding metadata, sources and map handoff, including when a later question uses another scope. Users can clear or export the conversation. Local field photos are not read or sent.

## Backend data tools

`POST /api/assistant/ask` accepts a registered `run_id`, optional `finding_id`, question, subject, language and bounded recent conversation. The server resolves the run itself and rejects findings outside that run. Client-supplied metric values are never used as scientific facts.

Tools cover transition areas, actual acquisition history, quality checks, sources, largest candidates, screening methods, mapped exposure, threshold sensitivity, field workflow, application help and synthetic-model explanations. Areas and history come from the existing numerical/evidence services. Source links are created by the server from the registered bundle, rather than invented by a language model.

`GET /api/assistant/status` reports whether a provider is configured. Without one, questions are matched to deterministic data tools and clearly labelled **Data-based answers**. Unknown questions receive an explicit supported-scope explanation.

## Optional generative AI

Set server environment variables before starting the API:

```powershell
$env:GEMINI_API_KEY = "your-server-side-key"
$env:FLUVISAR_ASSISTANT_MODEL = "gemini-2.5-flash"
npm run dev
```

Run `npm run dev` from `fluvisar-next/apps/web`. Restart an already running API after changing its environment. Alternatively start Uvicorn from a shell with these variables. Docker Compose forwards the same variables. Never use a `VITE_` variable for the key.

With a key, Gemini function calling chooses an allowed data tool, which the backend executes for the registered scope. A second request explains the returned facts in English or Bengali. Numerical tokens are checked against the tool result and verified answer; unsupported numbers, invalid tool calls, provider errors and timeouts fall back to the deterministic answer. This guard reduces numerical invention but does not independently validate an AI interpretation; sources and screening limitations remain visible. Provider failures are labelled per answer. No API key is included in browser requests, status responses or exports.

The implementation requires no additional Python or JavaScript dependency. Actual live provider access requires a valid server credential and network access; automated provider tests use controlled mocks.

## Verification

API tests verify registered totals, finding scope, non-default pairs, history provenance, map actions, Bengali answers, synthetic limitations, request validation and safe fallback after provider failures or invented numerical output. Browser tests verify flight cancellation/replay and camera alignment, source-linked chat, export/map handoffs, inspection without card resizing, mobile/light presentation and retry after a failed request.
