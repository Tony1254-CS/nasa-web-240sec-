import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { getProvenanceRecord } from '../data/provenanceRegistry';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface SourceCitationBadgeProps {
  sourceId: string;
  className?: string;
  showIcon?: boolean;
}

export const SourceCitationBadge: React.FC<SourceCitationBadgeProps> = ({
  sourceId,
  className = '',
  showIcon = true,
}) => {
  const { setSelectedSourceId } = useWorkspaceStore();
  const record = getProvenanceRecord(sourceId);

  if (!record) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSourceId(sourceId);
  };

  const getCategoryStyles = () => {
    switch (record.category) {
      case 'satellite_radar':
        return 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100 hover:border-sky-400';
      case 'insitu_gauge':
        return 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100 hover:border-teal-400';
      case 'satellite_optical':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400';
      case 'gis_socio':
        return 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400';
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      title={`Verified Source: ${record.agency} - ${record.productLevel}. Click to inspect official NASA/DAAC provenance.`}
      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight border transition-all cursor-pointer shadow-2xs select-none ${getCategoryStyles()} ${className}`}
    >
      {showIcon && <ShieldCheck className="w-2.5 h-2.5 shrink-0 opacity-80" />}
      <span>{record.shortCode}</span>
      <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
    </button>
  );
};

