import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, MapPin, CheckCircle2 } from 'lucide-react';
import { radarSonifier } from '../utils/sonification';

interface CardImageSwipeProps {
  regionId: string;
  opticalSrc: string;
  sarSrc: string;
  title: string;
  coordsStr: string;
  scenesCount: number;
  dbValue: number;
  dbLabel: string;
  categoryTag: string;
}

export function CardImageSwipe({
  opticalSrc,
  sarSrc,
  title,
  coordsStr,
  scenesCount,
  dbValue,
  dbLabel,
  categoryTag
}: CardImageSwipeProps) {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioTimerRef = useRef<number | null>(null);

  // Update slider position based on clientX
  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const pct = Math.round((x / rect.width) * 100);
    setSliderPos(pct);
  }, []);

  // Pointer event handlers for smooth mouse & touch dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
  };

  // Sonification trigger
  const handleToggleSonify = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      radarSonifier.stop();
      setIsPlayingAudio(false);
      if (audioTimerRef.current) {
        window.clearTimeout(audioTimerRef.current);
        audioTimerRef.current = null;
      }
    } else {
      radarSonifier.playToneForDb(dbValue);
      setIsPlayingAudio(true);
      if (audioTimerRef.current) {
        window.clearTimeout(audioTimerRef.current);
      }
      audioTimerRef.current = window.setTimeout(() => {
        radarSonifier.stop();
        setIsPlayingAudio(false);
        audioTimerRef.current = null;
      }, 2600);
    }
  };

  useEffect(() => {
    return () => {
      if (audioTimerRef.current) {
        window.clearTimeout(audioTimerRef.current);
      }
      radarSonifier.stop();
    };
  }, []);

  return (
    <div className="relative w-full rounded-t-2xl overflow-hidden bg-[#0f171b] select-none">
      {/* 1. Main Interactive Image Swipe Area */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative h-60 sm:h-64 w-full overflow-hidden cursor-ew-resize touch-none group"
        title="Drag or click to compare Sentinel-2 Optical vs. Sentinel-1 SAR Radar"
      >
        {/* Layer A: Base SAR Radar Image (Right Side) */}
        <img
          src={sarSrc}
          alt={`SAR Radar observation of ${title}`}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          loading="eager"
        />

        {/* Layer B: Clipped Optical Image (Left Side) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
          style={{
            clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
          }}
        >
          <img
            src={opticalSrc}
            alt={`Optical Sentinel-2 image of ${title}`}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            loading="eager"
          />
        </div>

        {/* Subtle Dark Vignette Bottom & Top for Label Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f171b] via-transparent to-[#0f171b]/40 pointer-events-none" />

        {/* Floating Category Badge (Top Left) */}
        <div className="absolute top-3 left-3 pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-lg bg-[#0f171b]/90 backdrop-blur-md border border-[#2a383e] text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5 shadow-lg">
            <MapPin size={11} className="text-cyan-400" />
            {categoryTag}
          </span>
        </div>

        {/* Floating Verification Badge (Top Right) */}
        <div className="absolute top-3 right-3 pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/95 backdrop-blur-md border border-emerald-500/70 text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
            <CheckCircle2 size={11} className="text-emerald-400" />
            Verified Analysis
          </span>
        </div>

        {/* Dynamic Comparison Sensor Tags */}
        {sliderPos > 12 && (
          <div
            className="absolute top-11 left-3 z-10 pointer-events-none transition-opacity duration-200"
            style={{ opacity: Math.min(1, sliderPos / 30) }}
          >
            <span className="px-2 py-0.5 rounded bg-amber-950/85 backdrop-blur-md border border-amber-600/70 text-[9px] font-mono font-semibold text-amber-200 shadow">
              Sentinel-2 Optical (Cloud Cover)
            </span>
          </div>
        )}

        {sliderPos < 88 && (
          <div
            className="absolute top-11 right-3 z-10 pointer-events-none transition-opacity duration-200"
            style={{ opacity: Math.min(1, (100 - sliderPos) / 30) }}
          >
            <span className="px-2 py-0.5 rounded bg-cyan-950/85 backdrop-blur-md border border-cyan-600/70 text-[9px] font-mono font-semibold text-cyan-200 shadow">
              Sentinel-1 SAR (Radar Penetration)
            </span>
          </div>
        )}

        {/* Center Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_12px_#22d3ee] pointer-events-none z-20"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Draggable luminous pill handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#0f171b] border-2 border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.9)] flex items-center justify-center text-cyan-300 pointer-events-none transition-transform group-hover:scale-110">
            <span className="text-[10px] font-bold font-mono tracking-tighter">◀▶</span>
          </div>
        </div>

        {/* Bottom Metadata Ribbon Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-200 pointer-events-none z-10">
          <span className="bg-[#0f171b]/85 backdrop-blur-sm px-2.5 py-0.5 rounded border border-[#2a383e]">
            {coordsStr}
          </span>
          <span className="bg-[#0f171b]/85 backdrop-blur-sm px-2.5 py-0.5 rounded border border-[#2a383e] text-cyan-300 font-semibold">
            {scenesCount} Registered Scenes · 12d Revisit
          </span>
        </div>
      </div>

      {/* 2. Interactive Comparison Control Bar (Presets + Sonification) */}
      <div className="bg-[#0f171b] border-b border-[#2a383e] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Preset quick buttons */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-slate-400 text-[10px] mr-1 hidden sm:inline">Compare:</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSliderPos(100); }}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              sliderPos >= 90
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold'
                : 'text-slate-400 hover:text-white bg-[#151e22] border border-[#2a383e]'
            }`}
          >
            Optical (Clouds)
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSliderPos(50); }}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              sliderPos > 35 && sliderPos < 65
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold'
                : 'text-slate-400 hover:text-white bg-[#151e22] border border-[#2a383e]'
            }`}
          >
            50/50 Split
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSliderPos(0); }}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              sliderPos <= 10
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold'
                : 'text-slate-400 hover:text-white bg-[#151e22] border border-[#2a383e]'
            }`}
          >
            SAR Penetration
          </button>
        </div>

        {/* Acoustic Sonification Pill */}
        <button
          type="button"
          onClick={handleToggleSonify}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer border ${
            isPlayingAudio
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-pulse'
              : 'bg-[#151e22] text-slate-300 border-[#2a383e] hover:border-slate-500 hover:text-white'
          }`}
          title="Play real-time acoustic pitch mapped from calibrated radar backscatter"
        >
          {isPlayingAudio ? (
            <>
              <Volume2 size={13} className="text-cyan-400 animate-bounce" />
              <span className="font-bold text-cyan-300">Sonifying: {dbLabel}</span>
            </>
          ) : (
            <>
              <VolumeX size={13} className="text-slate-400" />
              <span>Acoustic Preview ({dbLabel})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
