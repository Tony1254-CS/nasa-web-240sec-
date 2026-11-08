# Decision Insights

## Analysis of the previous project

The previous `nasa-2026-web/web/src/App.tsx` maps `/insights` to
`pages/Impact.tsx`. The current project's Decision Desk already covers numerical
change review, exposure, source history, quality checks, scenarios and briefs,
but there was no `/insights` route or separate executive overview.

The earlier screen's concepts are adapted rather than copying its constants:

| Earlier concept | Current implementation |
| --- | --- |
| People/homes/economic KPIs | Measured transition area, intersecting building ways, road overlap and historical land-cover overlap |
| Sendai indicator dashboard | Evidence-to-indicator bridge using correct B-3/B-4, B-5, C-2, C-4, C-5 and D-2/D-3 definitions |
| Fixed DaLA totals and 65/35 split | Explicit local unit rates, affected-share assumption and duration; separately calculated physical-cost and revenue-flow terms |
| Erosion probability bars | Four area-ranked observed polygons with coordinates, mapped overlaps and exact map handoffs |
| Hard-coded economic trajectory | Conditional time curve derived from the entered duration and daily revenue assumption |
| Emergency action matrix | Source-triggered review steps with browser-local completion status, isolated by run |
| Granule/QC footer and briefing | Registered sources, current checks, JSON packet and a shared scope-correct brief |

No unsupported population totals, housing counts, calibrated erosion probability,
verified crop loss or evacuation order is introduced. Both supported Bangladesh
regions use their current registered comparison, including non-default pairs.

## Page and navigation

`InsightsPage.tsx` is lazy-loaded at `/insights`, accessible from primary
navigation and the landing footer. It uses dedicated scoped styles matching the
site's light/dark palette, card widths and typography. Navigation switches to its
existing compact menu by 1440 px so the added destination does not crowd controls.
The Decision Desk remains the operational map/review workspace; Insights supplies
an executive overview, reporting context and conditional valuation.

## Sources and scope

`useObservatoryEvidence` resolves the selected registered pair. The existing
`decision-context` service computes source-backed history, geometric OSM
intersections, candidate robustness and historical WorldCover overlap. The
headline exposure cards describe the **land-to-water** category. WorldCover is a
2021 reference, not present-day verified crop or mangrove loss. Buildings are
mapped ways, not unique homes, occupants or damaged structures. Incomplete OSM
coverage prevents a zero overlap from proving the absence of real assets/loss.

The shared brief supports a `comparison` scope: the current pair without an
unrelated selected finding. Changing the pair updates metrics, context, sources,
exports and brief together. Source/model loading is explicit and cannot produce
invented fallback totals. Review checkboxes record user workflow steps only.

## Conditional economic calculation

All three local BDT unit rates start blank. A user may explicitly enter zero to
exclude a term. Given affected share `s`, interruption duration `d`, building ways
`B`, road-overlap metres `R` and cropland-reference hectares `A`:

```
building term = B × entered BDT/way × s
road term     = R × entered BDT/metre × s
physical cost = building term + road term
flow loss     = A × entered BDT/hectare/day × d × s
total         = physical cost + flow loss
```

The time curve holds the direct-cost assumption constant and accumulates the
daily revenue assumption. No fixed damage/loss split, replacement price, currency
conversion, event probability or independent uncertainty interval is invented.
Non-finite/negative inputs, invalid shares, durations outside integer 1–365 days
and overflowing arithmetic do not generate a total. This is limited planning
sensitivity, not an official DaLA or measured damage; other sectors are excluded.

## Research basis

- [UNDRR indicator definitions](https://www.undrr.org/implementing-sendai-framework/monitoring-sendai-framework/sfm-methodology) distinguish people affected, monetary loss and confirmed facility damage. Spatial screening alone cannot fill those official counts.
- [GFDRR assessment guidance](https://www.gfdrr.org/en/damage-loss-and-needs-assessment-tools-and-methodology) distinguishes physical-asset damage from interrupted economic flows. The scenario preserves that distinction and discloses its narrower scope.

These primary references were reviewed on 9 November 2026. Their definitions do
not validate this project's scenario as an official assessment.

## Verification

`insights.spec.ts` verifies explicit-rate arithmetic and physical inputs, actual
source-backed figures in both regions, JSON export, non-default pair/brief scope,
run-isolated review persistence, navigation reachability and eight viewport/theme
combinations. The responsive audit now includes eleven public routes. Existing
Decision Desk and shared brief tests remain part of the regression checks.

The restricted numerical runtime and its parity checks are described in
[READ_ONLY_RASTER_RUNTIME.md](READ_ONLY_RASTER_RUNTIME.md).
