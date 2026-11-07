# Atlas cases and experimental water-area outlook

## Purpose and provenance

The Atlas adapts the earlier project's Cases structure to the two regions that
this repository actually processes: Jamuna and Sundarbans. Cards expose location,
bounding box, dated optical imagery, radar windows, source records, measured
transitions, support area and processing-quality verdicts. They do not reproduce
unregistered regions or substitute NISAR claims for Sentinel-1 measurements.

The outlook reads `public/observations/index.json` through the existing evidence
catalogue. Each region currently contributes six dated Sentinel-1 RTC screened
water-area observations. Dates are sorted chronologically before calculation;
the registered default pair is not assumed to be chronological archive order.
Original observations and source imagery remain unchanged.

## Calculation

`src/data/waterOutlook.ts` compares two transparent baseline methods:

- Persistence: the last measured water area remains constant.
- Elapsed-time drift: the first-to-last area difference is divided by actual
  elapsed days, then extrapolated from the last observation to the target date.

Rolling-origin validation starts with three observations. Each successive actual
observation is predicted using only earlier observations, producing three checks
per method in the current archive. The automatic choice has the lowest mean
absolute error; ties favor persistence. Users may instead select either method
and a horizon of 6, 12 or 24 days after the latest recorded observation.

Predictions are bounded between zero and the common valid support area. The
historical-error envelope uses the selected method's largest absolute validation
miss, multiplied by `max(1, horizon / median validation gap)`, and bounded to the
same physical support. This is a descriptive stress envelope, not a calibrated
confidence interval or a probability of flooding. With only three checks, it
cannot establish an empirical coverage level.

The methods and chronological evaluation follow the baseline forecasting and
time-series cross-validation ideas described in
[Forecasting: Principles and Practice](https://otexts.com/fpp3/toolbox.html).
The particular envelope is an explicit application heuristic, not a claimed
statistical interval from that reference.

## Interpretation and visible limits

The chart separates recorded measurements from the projected continuation. The
interface displays the forecast origin, target date, method, measured difference,
backtest error and sample count. Targets already in the past relative to Dhaka's
current date are labelled as archived outlooks.

This is an experimental aggregate water-area baseline. Six observations and
three model-selection checks do not constitute independent validation. Rainfall,
river stage, tide and meteorological predictions are not inputs. It does not
forecast spatial flood boundaries, erosion, mangrove loss, people affected or
damage. Radar screening and region-quality warnings remain visible. The review
link opens an existing measured finding; no future polygon is fabricated.

Export includes all dated inputs, original source URLs, method comparisons and
holdouts, bounds, support area, quality checks, generation time and the explicit
uncalibrated interpretation. The assistant's data tools do not yet contain these
forecast calculations, so this panel intentionally has no Chat with Data action.

## Verification

`tests/atlas-outlook.spec.ts` checks irregular date gaps, chronological holdouts,
absence of future-data leakage, physical bounds, constant-series tie behavior,
input immutability, both six-pass real archives, auditable export, responsive
themes and the docked chat. The same suite verifies that an old session-level
seen flag cannot suppress the Observatory zoom-in on a fresh visit.
