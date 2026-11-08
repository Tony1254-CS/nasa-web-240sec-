import { Calendar, Columns2, Layers, SplitSquareHorizontal, MoveHorizontal, X, AlertTriangle } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useObservatoryEvidence as useEvidence, readableDate } from '../data/evidence';
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';

export function SwipeCompareMap({ dateA, dateB }: { dateA: string; dateB: string }) {
  const { evidence } = useEvidence();
  const {
    swipePosition,
    setSwipePosition,
    comparisonMode,
    setComparisonMode,
    comparisonLayout,
    setComparisonLayout,
    comparisonEnabled,
    setComparisonEnabled,
    basemapType,
    satelliteView,
    selectedDate,
    selectedPair,
    selectedOpticalDate,
    selectedOpticalPair,
  } = useWorkspaceStore();

  const optical = basemapType === 'satellite';
  const radarPair = selectedPair ?? [dateA, dateB];
  const opticalPair = selectedOpticalPair ?? evidence.optical_pair;
  const radarDate = comparisonEnabled && comparisonMode === 'dates' ? radarPair[1] : selectedDate;
  const opticalDate = comparisonEnabled && comparisonMode === 'dates' ? opticalPair?.[1] : selectedOpticalDate;
  const opticalScene = evidence.optical_observations?.find(o => o.date === opticalDate);
  const opticalLabel = (date: string | undefined) =>
    satelliteView === 'context'
      ? 'Esri satellite mosaic / not date-matched'
      : date
      ? 'Sentinel-2 optical · ' +
        readableDate(date) +
        ' / ' +
        Math.round((evidence.optical_observations?.find(o => o.date === date)?.cloud_fraction ?? 0) * 100) +
        '% ROI cloud/shadow'
      : 'Esri context mosaic';
  const radarLabel = (date: string) => 'Sentinel-1 radar · ' + readableDate(date);
  const leftLabel = comparisonMode === 'sensors' ? opticalLabel(selectedOpticalDate) : optical ? opticalLabel(opticalPair?.[0]) : radarLabel(radarPair[0]);
  const rightLabel = comparisonMode === 'sensors' ? radarLabel(selectedDate) : optical ? opticalLabel(opticalDate) : radarLabel(radarDate);

  // Stage comparison check
  const isJamuna = evidence.region_id === 'jamuna';
  const stageMap: Record<string, number> = isJamuna
    ? {
        '2026-10-19': 18.25,
        '2026-10-31': 17.40,
      }
    : {
        '2026-07-06': 3.42,
        '2026-08-23': 3.85,
        '2026-09-28': 2.95,
        '2026-10-10': 2.10,
        '2026-10-22': 1.85,
        '2026-11-03': 1.60,
      };
  const sA = stageMap[radarPair[0]] ?? 18.0;
  const sB = stageMap[radarPair[1]] ?? 17.0;
  const stageDelta = Math.abs(sA - sB);
  const isStageIncompatible = isJamuna ? stageDelta > 1.0 : stageDelta > 1.5;

  const overlay = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);

  const update = (clientX: number) => {
    const rect = overlay.current?.getBoundingClientRect();
    if (rect?.width) setSwipePosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };

  const finish = () => {
    const id = drag.current;
    drag.current = null;
    handle.current?.removeAttribute('data-dragging');
    if (id !== null && handle.current?.hasPointerCapture(id)) handle.current.releasePointerCapture(id);
  };

  useEffect(() => {
    const move = (event: globalThis.PointerEvent) => {
      if (drag.current !== event.pointerId) return;
      event.preventDefault();
      update(event.clientX);
    };
    const up = (event: globalThis.PointerEvent) => {
      if (drag.current !== event.pointerId) return;
      update(event.clientX);
      finish();
    };
    const cancel = (event: globalThis.PointerEvent) => {
      if (drag.current === event.pointerId) finish();
    };
    window.addEventListener('pointermove', move, { capture: true, passive: false });
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', cancel, true);
    window.addEventListener('blur', finish);
    return () => {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', cancel, true);
      window.removeEventListener('blur', finish);
      finish();
    };
  }, [setSwipePosition]);

  useEffect(() => {
    if (!comparisonEnabled || comparisonLayout !== 'swipe') finish();
  }, [comparisonEnabled, comparisonLayout]);

  const pointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current = event.pointerId;
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setAttribute('data-dragging', 'true');
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Window listeners keep dragging if native capture is unavailable. */
    }
    update(event.clientX);
  };

  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    let value: number | undefined;
    if (event.key === 'ArrowLeft') value = swipePosition - (event.shiftKey ? 5 : 1);
    if (event.key === 'ArrowRight') value = swipePosition + (event.shiftKey ? 5 : 1);
    if (event.key === 'Home') value = 0;
    if (event.key === 'End') value = 100;
    if (value !== undefined) {
      event.preventDefault();
      setSwipePosition(Math.max(0, Math.min(100, value)));
    }
  };

  const cloudy =
    satelliteView === 'dated' && (basemapType === 'satellite' || (comparisonEnabled && comparisonMode === 'sensors'))
      ? (evidence.optical_observations ?? []).filter(
          o =>
            (comparisonEnabled && comparisonMode === 'dates' ? (opticalPair ?? []) : [selectedOpticalDate]).includes(
              o.date
            ) && o.cloud_fraction > 0.1
        )
      : [];

  return (
    <div ref={overlay} className="restored-comparison-overlay">
      {cloudy.length > 0 && (
        <div className="obs-cloud-note" role="status">
          <b>White areas are recorded clouds.</b>
          <span>
            {cloudy.map(o => readableDate(o.date) + ': ' + Math.round(o.cloud_fraction * 100) + '% ROI cloud/shadow').join(' / ')}.
            Choose another date or Radar to inspect beneath clouds.
          </span>
        </div>
      )}

      <div className="restored-comparison-toolbar" aria-label="Comparison controls">
        <div className="comparison-mode-buttons">
          <button
            className={comparisonEnabled && comparisonMode === 'dates' ? 'selected' : ''}
            onClick={() => {
              setComparisonMode('dates');
              setComparisonEnabled(true);
            }}
          >
            <Calendar size={13} />
            Dates
          </button>
          <button
            className={comparisonEnabled && comparisonMode === 'sensors' ? 'selected' : ''}
            onClick={() => {
              setComparisonMode('sensors');
              setComparisonEnabled(true);
            }}
          >
            <Layers size={13} />
            Sat vs Radar
          </button>
        </div>
        <span className="control-divider" />
        <button
          aria-label={comparisonLayout === 'split' ? 'Switch to swipe view' : 'Switch to split view'}
          onClick={() => {
            setComparisonLayout(comparisonLayout === 'split' ? 'swipe' : 'split');
            setComparisonEnabled(true);
          }}
        >
          {comparisonLayout === 'split' ? <Columns2 size={13} /> : <SplitSquareHorizontal size={13} />}
          {' '}
          {comparisonLayout === 'split' ? 'Split' : 'Swipe'}
        </button>
        <button aria-pressed={!comparisonEnabled} onClick={() => setComparisonEnabled(!comparisonEnabled)}>
          {comparisonEnabled ? (
            <>
              <X size={12} />
              Single
            </>
          ) : (
            'Compare'
          )}
        </button>
      </div>

      {/* Stage Incompatibility Banner */}
      {comparisonEnabled && isStageIncompatible && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-md bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-semibold shadow-lg backdrop-blur-xs flex items-center gap-2 max-w-lg text-center animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertTriangle size={15} className="text-rose-400 shrink-0" />
          <span>
            <strong>REJECTED — HYDROLOGICAL CONDITIONS NOT COMPARABLE:</strong> Stage delta of {stageDelta.toFixed(2)}m exceeds {isJamuna ? '1.0m' : '1.5m'} threshold. Waterline shift reflects stage recession rather than bank erosion.
          </span>
        </div>
      )}

      {comparisonEnabled && comparisonLayout === 'swipe' && (
        <div
          ref={handle}
          className="restored-swipe-handle"
          style={{ left: swipePosition + '%' }}
          role="slider"
          aria-label="Map comparison slider"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={Math.round(swipePosition) + '% before / ' + Math.round(100 - swipePosition) + '% after'}
          aria-valuenow={Math.round(swipePosition)}
          tabIndex={0}
          onKeyDown={keyboard}
          onPointerDown={pointer}
        >
          <div className="swipe-divider-line" />
          <div className="swipe-knob">
            <MoveHorizontal size={24} aria-hidden="true" />
          </div>
          <div className="swipe-description">
            {comparisonMode === 'sensors' ? 'Optical ↔ Radar' : 'Drag to compare actual acquisitions'}
          </div>
        </div>
      )}

      {comparisonEnabled && comparisonLayout === 'split' && <div className="restored-split-divider" />}
      {comparisonEnabled && (
        <>
          <div className="restored-compare-label left">{leftLabel}</div>
          <div className="restored-compare-label right">{rightLabel}</div>
        </>
      )}
      {!comparisonEnabled && (
        <div className="restored-compare-label right">
          {optical ? opticalLabel(selectedOpticalDate) : radarLabel(selectedDate)}
          {optical && satelliteView === 'dated' && opticalScene?.detail_tiles_url ? ' / 10 m source' : ''}
        </div>
      )}
      <span className="comparison-source-sr">{evidence.observations[0].sensor}</span>
    </div>
  );
}
