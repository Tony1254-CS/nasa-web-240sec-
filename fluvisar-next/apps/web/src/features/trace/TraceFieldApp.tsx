import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  HelpCircle,
  EyeOff,
  Camera,
  MapPin,
  UploadCloud,
  Wifi,
  WifiOff,
  RefreshCw,
  Compass,
  Volume2,
  Bookmark,
  ShieldCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { PointAndProve } from './components/PointAndProve';
import { WalkOnRadar } from './components/WalkOnRadar';
import { MyPlaceWatch } from './components/MyPlaceWatch';

interface MissionCase {
  id: string;
  finding_id: string;
  region_id: string;
  title: string;
  question: string;
  target_coords: [number, number];
  satellite_context: string;
  priority: string;
  checklist: string[];
}

interface QueuedObservation {
  id: string;
  finding_id: string;
  region_id: string;
  verdict: 'SUPPORTS' | 'CONTRADICTS' | 'INCONCLUSIVE' | 'NOT_OBSERVABLE';
  gps_lat: number;
  gps_lon: number;
  gps_accuracy_m: number;
  notes: string;
  observer_name: string;
  photo_data_url?: string;
  timestamp: string;
  synced: boolean;
}

export const TraceFieldApp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlFinding = searchParams.get('finding');

  const [activeTab, setActiveTab] = useState<'inbox' | 'verify' | 'point' | 'walk' | 'myplace'>('inbox');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Cases
  const [cases, setCases] = useState<MissionCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<MissionCase | null>(null);

  // Form State
  const [verdict, setVerdict] = useState<'SUPPORTS' | 'CONTRADICTS' | 'INCONCLUSIVE' | 'NOT_OBSERVABLE'>('SUPPORTS');
  const [notes, setNotes] = useState<string>('');
  const [observerName] = useState<string>('S. Rahman (Field Team 1)');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gpsCoords] = useState<{ lat: number; lon: number; accuracy: number }>({
    lat: 25.565,
    lon: 89.664,
    accuracy: 4.5
  });

  // Offline Queue
  const [queue, setQueue] = useState<QueuedObservation[]>(() => {
    try {
      const stored = localStorage.getItem('trace_field_queue');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [syncNotice, setSyncNotice] = useState<string>('');

  // Online status listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save queue to local storage
  useEffect(() => {
    try {
      localStorage.setItem('trace_field_queue', JSON.stringify(queue));
    } catch {}
  }, [queue]);

  // Load cases from backend API or fallback
  useEffect(() => {
    fetch('/api/trace/cases')
      .then(res => res.json())
      .then((data: MissionCase[]) => {
        if (Array.isArray(data) && data.length) {
          setCases(data);
          const matched = urlFinding ? data.find(c => c.finding_id === urlFinding) : data[0];
          setSelectedCase(matched ?? data[0]);
          if (urlFinding) setActiveTab('verify');
        }
      })
      .catch(() => {
        // Offline default fallback
        const fallback: MissionCase[] = [
          {
            id: 'CASE-JAMUNA-01',
            finding_id: 'FINDING-JAMUNA-2026-CHILMARI-01',
            region_id: 'jamuna',
            title: 'Chilmari West Embankment Cutbank Survey',
            question: 'Does the 145.8 ha low-backscatter radar zone represent permanent riverbank collapse or seasonal silt flat standing water?',
            target_coords: [89.665, 25.565],
            satellite_context: 'Sentinel-1 RTC Δγ⁰ = -8.2 dB (2026-10-19 → 2026-10-31)',
            priority: 'HIGH',
            checklist: [
              'Inspect embankment integrity',
              'Check whether riverbed is active channel or dry shoal',
              'Verify ferry ghat shuttle continuity'
            ]
          }
        ];
        setCases(fallback);
        setSelectedCase(fallback[0]);
      });
  }, [urlFinding]);

  // Handle Photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Submit Observation
  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    const newObs: QueuedObservation = {
      id: `OBS-${Date.now()}`,
      finding_id: selectedCase.finding_id,
      region_id: selectedCase.region_id,
      verdict,
      gps_lat: gpsCoords.lat,
      gps_lon: gpsCoords.lon,
      gps_accuracy_m: gpsCoords.accuracy,
      notes,
      observer_name: observerName,
      photo_data_url: photoPreview ?? undefined,
      timestamp: new Date().toISOString(),
      synced: false
    };

    // Try direct backend submission if online
    if (isOnline) {
      try {
        const response = await fetch('/api/trace/observations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newObs.id,
            finding_id: newObs.finding_id,
            region_id: newObs.region_id,
            verdict: newObs.verdict,
            gps_lat: newObs.gps_lat,
            gps_lon: newObs.gps_lon,
            gps_accuracy_m: newObs.gps_accuracy_m,
            notes: newObs.notes,
            observer_name: newObs.observer_name,
            photo_data_url: newObs.photo_data_url,
            timestamp: newObs.timestamp,
            sample_type: 'VERIFIED_FIELD_RECORD'
          })
        });
        if (response.ok) {
          newObs.synced = true;
          setSyncNotice('Evidence returned to FluviSAR! Status: Awaiting Review.');
        } else {
          setSyncNotice('Server queued observation for later synchronization.');
        }
      } catch {
        setSyncNotice('Network unavailable. Stored in local offline queue.');
      }
    } else {
      setSyncNotice('Device offline. Stored in local offline queue.');
    }

    setQueue([newObs, ...queue]);
    setNotes('');
    setPhotoPreview(null);
    setTimeout(() => setSyncNotice(''), 4000);
  };

  // Retry sync of offline queue
  const retrySyncQueue = async () => {
    const pending = queue.filter(q => !q.synced);
    if (!pending.length) return;

    let syncedCount = 0;
    const updated = [...queue];

    for (let i = 0; i < updated.length; i++) {
      if (!updated[i].synced) {
        try {
          const res = await fetch('/api/trace/observations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: updated[i].id,
              finding_id: updated[i].finding_id,
              region_id: updated[i].region_id,
              verdict: updated[i].verdict,
              gps_lat: updated[i].gps_lat,
              gps_lon: updated[i].gps_lon,
              gps_accuracy_m: updated[i].gps_accuracy_m,
              notes: updated[i].notes,
              observer_name: updated[i].observer_name,
              photo_data_url: updated[i].photo_data_url,
              timestamp: updated[i].timestamp,
              sample_type: 'VERIFIED_FIELD_RECORD'
            })
          });
          if (res.ok) {
            updated[i].synced = true;
            syncedCount++;
          }
        } catch {}
      }
    }
    setQueue(updated);
    setSyncNotice(`Synced ${syncedCount} of ${pending.length} pending observations.`);
    setTimeout(() => setSyncNotice(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto border-x border-slate-800 shadow-2xl">
      {/* Top Mobile Bar */}
      <header className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Link to="/" className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-cyan-400 tracking-wider">TRACE FIELD</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Ground Evidence & Verification Node</p>
          </div>
        </div>

        {/* Network & Offline Status Pill */}
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
              <Wifi size={11} /> Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-full font-mono animate-pulse">
              <WifiOff size={11} /> Offline Queue
            </span>
          )}
        </div>
      </header>

      {/* Sync Banner Notification */}
      {syncNotice && (
        <div className="bg-cyan-900 border-b border-cyan-700 text-white text-xs p-2 text-center font-medium animate-in fade-in">
          {syncNotice}
        </div>
      )}

      {/* Main Tab Navigation */}
      <nav className="flex items-center bg-slate-900/90 border-b border-slate-800 text-xs px-2 overflow-x-auto">
        {[
          { id: 'inbox', label: 'Inbox', icon: Inbox },
          { id: 'verify', label: 'Verify', icon: ShieldCheck },
          { id: 'point', label: 'Point & Prove', icon: Compass },
          { id: 'walk', label: 'Radar Walk', icon: Volume2 },
          { id: 'myplace', label: 'My Place', icon: Bookmark },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[70px] py-2.5 px-2 text-center flex flex-col items-center gap-1 border-b-2 font-medium cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon size={15} />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Contents */}
      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* TAB 1: Mission Inbox */}
        {activeTab === 'inbox' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Assigned Satellite Missions ({cases.length})
              </h2>
              {queue.some(q => !q.synced) && (
                <button
                  onClick={retrySyncQueue}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  <RefreshCw size={11} />
                  <span>Sync ({queue.filter(q => !q.synced).length} pending)</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {cases.map(mission => (
                <div
                  key={mission.id}
                  onClick={() => {
                    setSelectedCase(mission);
                    setActiveTab('verify');
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                    selectedCase?.id === mission.id
                      ? 'bg-cyan-950/40 border-cyan-500/80'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
                        {mission.priority} Priority
                      </span>
                      <h3 className="font-bold text-white text-xs mt-1.5">{mission.title}</h3>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">{mission.question}</p>
                  <div className="text-[10px] text-slate-400 mt-2 font-mono flex items-center gap-1">
                    <MapPin size={11} className="text-cyan-400" />
                    <span>Target: {mission.target_coords[0]}°E, {mission.target_coords[1]}°N</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Offline Submission History */}
            {queue.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Submitted Evidence History ({queue.length})
                </h3>
                <div className="space-y-1.5">
                  {queue.map(item => (
                    <div key={item.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-xs flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-white text-[11px]">{item.verdict}</strong>
                          <span className="text-[9px] font-mono text-slate-400">{item.finding_id}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{item.notes || 'No notes'}</p>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        item.synced ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {item.synced ? 'RETURNED' : 'OFFLINE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Structured Observation Form */}
        {activeTab === 'verify' && selectedCase && (
          <form onSubmit={handleSubmitObservation} className="space-y-4 text-xs">
            {/* Target Case Context Card */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  Target: {selectedCase.finding_id}
                </span>
                <span className="text-[10px] text-slate-400">GPS: ±{gpsCoords.accuracy}m</span>
              </div>
              <h3 className="font-bold text-white text-xs leading-snug">{selectedCase.question}</h3>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono">
                {selectedCase.satellite_context}
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] font-semibold">Field Verification Checklist:</span>
              {selectedCase.checklist.map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-200 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-cyan-400 rounded" />
                  <span>{item}</span>
                </label>
              ))}
            </div>

            {/* Structured Verdict Selector (AX01) */}
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] font-semibold">Structured Verdict (One-Tap):</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'SUPPORTS', label: 'SUPPORTS', icon: CheckCircle2, color: 'border-emerald-600 bg-emerald-950/40 text-emerald-200' },
                  { id: 'CONTRADICTS', label: 'CONTRADICTS', icon: XCircle, color: 'border-rose-600 bg-rose-950/40 text-rose-200' },
                  { id: 'INCONCLUSIVE', label: 'INCONCLUSIVE', icon: HelpCircle, color: 'border-amber-600 bg-amber-950/40 text-amber-200' },
                  { id: 'NOT_OBSERVABLE', label: 'NOT OBSERVABLE', icon: EyeOff, color: 'border-slate-600 bg-slate-900 text-slate-300' },
                ].map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVerdict(v.id as any)}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                      verdict === v.id ? `${v.color} ring-2 ring-white font-bold` : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <v.icon size={15} />
                    <span className="text-[11px]">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Capture & Upload */}
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] font-semibold">Ground Evidence Photo:</span>
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-cyan-400 transition-colors bg-slate-900/60">
                <Camera size={20} className="text-cyan-400 mb-1" />
                <span className="text-[11px] text-slate-300">Take Photo or Select File</span>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {photoPreview && (
                <div className="relative mt-2 rounded-lg overflow-hidden border border-slate-700">
                  <img src={photoPreview} alt="Field Observation" className="w-full h-36 object-cover" />
                  <span className="absolute bottom-1 right-1 text-[9px] bg-slate-950/80 px-1.5 py-0.5 rounded font-mono text-cyan-300">
                    Geotagged: {gpsCoords.lat}°N, {gpsCoords.lon}°E
                  </span>
                </div>
              )}
            </div>

            {/* Observer Notes */}
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px] font-semibold">Field Observation Notes:</label>
              <textarea
                rows={3}
                placeholder="Describe ground evidence (e.g. active cutbank erosion, standing water depth, ferry boat state)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>

            {/* Scientific Guardrail Disclaimer */}
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 flex items-start gap-2">
              <ShieldCheck size={14} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Evidence Rule:</strong> A field photo is independent evidence for human review. It enters the audit ledger as <em>Awaiting Review</em> and never automatically converts an uncertain finding into confirmed ground truth.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs cursor-pointer shadow-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <UploadCloud size={15} />
              <span>Submit Structured Field Observation</span>
            </button>
          </form>
        )}

        {/* TAB 3: Point & Prove */}
        {activeTab === 'point' && (
          <PointAndProve
            targetCoords={selectedCase?.target_coords}
            targetName={selectedCase?.title}
            findingId={selectedCase?.finding_id}
          />
        )}

        {/* TAB 4: Walk on Radar */}
        {activeTab === 'walk' && <WalkOnRadar />}

        {/* TAB 5: My Place Watch */}
        {activeTab === 'myplace' && <MyPlaceWatch />}
      </main>

      {/* Footer Navigation Back to FluviSAR */}
      <footer className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <Link to="/" className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]">
          <ArrowLeft size={12} />
          <span>Return to FluviSAR Observatory</span>
        </Link>
        <span className="font-mono text-[10px]">ID: {selectedCase?.id ?? 'TRACE-OFFLINE'}</span>
      </footer>
    </div>
  );
};
