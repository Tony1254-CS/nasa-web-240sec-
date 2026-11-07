import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, X } from 'lucide-react';

interface PairCandidate {
  dateA: string;
  dateB: string;
  deltaDays: number;
  stageDiffM: number;
  orbitMatch: boolean;
  status: 'recommended' | 'acceptable' | 'rejected';
  reason: string;
}

const JAMUNA_PAIRS: PairCandidate[] = [
  {
    dateA: '2026-08-26',
    dateB: '2026-09-19',
    deltaDays: 24,
    stageDiffM: 0.85,
    orbitMatch: true,
    status: 'recommended',
    reason: 'Stage-matched pre/post monsoon peak twin with identical orbit track (135-A)',
  },
  {
    dateA: '2026-06-23',
    dateB: '2026-10-21',
    deltaDays: 120,
    stageDiffM: 1.40,
    orbitMatch: true,
    status: 'acceptable',
    reason: 'Long-interval seasonal comparison; hydrological stage difference is moderate',
  },
  {
    dateA: '2026-08-10',
    dateB: '2026-10-21',
    deltaDays: 72,
    stageDiffM: 3.45,
    orbitMatch: false,
    status: 'rejected',
    reason: 'Stage difference > 3m (monsoon peak vs dry recession). Water transition reflects seasonal flooding, not erosion.',
  },
];

interface PairSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PairSelectorModal: React.FC<PairSelectorProps> = ({ isOpen, onClose }) => {
  const { selectedPair, setSelectedPair } = useWorkspaceStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 pt-16 sm:pt-20 pb-6 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl max-w-xl w-full overflow-hidden text-xs flex flex-col max-h-[84vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#F1F5F9] bg-[#F8FAFC] shrink-0">
          <div>
            <h3 className="text-sm font-bold text-[#102A43]">SAR Time Machine: Compatible Pair Selector</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Select observation dates with matching orbital geometry and controlled water levels.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pair Candidates List */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {JAMUNA_PAIRS.map((pair) => {
            const isSelected = selectedPair && selectedPair[0] === pair.dateA && selectedPair[1] === pair.dateB;
            const isRec = pair.status === 'recommended';
            const isRej = pair.status === 'rejected';

            return (
              <div
                key={`${pair.dateA}-${pair.dateB}`}
                onClick={() => {
                  if (!isRej) {
                    setSelectedPair([pair.dateA, pair.dateB]);
                    onClose();
                  }
                }}
                className={`p-3 rounded-lg border transition-all flex flex-col space-y-2 ${
                  isSelected
                    ? 'border-[#155E75] bg-[#E0F2FE]/30 ring-1 ring-[#155E75]'
                    : isRej
                    ? 'border-red-200 bg-red-50/40 opacity-75 cursor-not-allowed'
                    : 'border-[#E2E8F0] bg-white hover:border-[#94A3B8] cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-mono font-bold text-xs text-[#102A43]">
                    <span>{pair.dateA}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>{pair.dateB}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 ${
                      isRec
                        ? 'bg-emerald-100 text-emerald-800'
                        : isRej
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isRec ? <CheckCircle2 className="w-3 h-3" /> : isRej ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    <span>{pair.status.toUpperCase()}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-[#475569] bg-[#F8FAFC] p-1.5 rounded">
                  <div>Elapsed: <strong className="font-mono text-[#102A43]">{pair.deltaDays}d</strong></div>
                  <div>Stage Δh: <strong className="font-mono text-[#102A43]">{pair.stageDiffM}m</strong></div>
                  <div>Orbit Match: <strong className={pair.orbitMatch ? 'text-emerald-700' : 'text-red-700'}>{pair.orbitMatch ? 'YES' : 'NO'}</strong></div>
                </div>

                <p className="text-[11px] text-[#64748B] leading-snug">{pair.reason}</p>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#CBD5E1] text-[11px] text-[#64748B] flex items-center justify-between">
          <span>Equal stage is a necessary control, but does not substitute for ground validation.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-[#155E75] text-white font-semibold hover:bg-[#0E7490]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

