import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { getProvenanceRecord } from '../data/provenanceRegistry';
import {
  X,
  ExternalLink,
  Database,
  Radio,
  FileCheck2,
  Copy,
  Check,
  Calendar,
  Layers
} from 'lucide-react';

export const SourceProvenanceModal: React.FC = () => {
  const { selectedSourceId, setSelectedSourceId, language } = useWorkspaceStore();
  const [copiedHash, setCopiedHash] = React.useState(false);

  if (!selectedSourceId) return null;

  const record = getProvenanceRecord(selectedSourceId);
  if (!record) return null;

  const isBn = language === 'bn';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(record.verificationHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getStatusBadge = () => {
    switch (record.status) {
      case 'CALIBRATED_L2':
        return { label: 'NASA Calibrated L2 Science Product', bg: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
      case 'IN_SITU_GROUND_TRUTH':
        return { label: 'In-Situ Physical Ground Telemetry', bg: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'VERIFIED_EMPIRICAL':
        return { label: 'Empirically Verified Remote Sensing', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      default:
        return { label: 'Open Data Specification', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={() => setSelectedSourceId(null)}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${statusBadge.bg}`}>
                {statusBadge.label}
              </span>
              <span className="text-[10px] text-cyan-800 font-mono font-bold bg-cyan-100 px-2 py-0.5 rounded border border-cyan-200">
                {record.shortCode}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 mt-2 leading-tight">
              {record.badgeLabel}
            </h2>

            <p className="text-xs text-slate-600 mt-1">
              {isBn ? record.agencyBn : record.agencyEn}
            </p>
          </div>

          <button
            onClick={() => setSelectedSourceId(null)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Summary Quote */}
          <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-slate-700 leading-relaxed">
            <span className="font-bold text-cyan-950 block mb-1">
              {isBn ? 'এই ডেটাসেট কীভাবে কাজ করে ও কেন দরকার:' : 'Physical Sensor Role in FluviSAR:'}
            </span>
            <p>{isBn ? record.descriptionBn : record.descriptionEn}</p>
          </div>

          {/* Core Technical Specifications Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center space-x-1">
                <Radio className="w-3 h-3 text-cyan-600" />
                <span>{isBn ? 'ইনস্ট্রুমেন্ট ও তরঙ্গ' : 'Instrument & Frequency'}</span>
              </span>
              <div className="font-bold text-slate-900 text-xs font-mono">{record.instrument}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center space-x-1">
                <Layers className="w-3 h-3 text-cyan-600" />
                <span>{isBn ? 'প্রোডাক্ট লেভেল ও ফরম্যাট' : 'Product Level'}</span>
              </span>
              <div className="font-bold text-slate-900 text-xs font-mono">{record.productLevel}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center space-x-1">
                <Database className="w-3 h-3 text-cyan-600" />
                <span>{isBn ? 'রেজোলিউশন ও কভারেজ' : 'Spatial Posting'}</span>
              </span>
              <div className="font-bold text-slate-900 text-xs font-mono">{record.spatialResolution}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-cyan-600" />
                <span>{isBn ? 'অরবিট রিভিজিট সাইকেল' : 'Temporal Revisit'}</span>
              </span>
              <div className="font-bold text-slate-900 text-xs font-mono">{record.temporalCoverage}</div>
            </div>
          </div>

          {/* Sample Granules Section */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs block">
              {isBn ? 'যাচাইকৃত গ্র্যানিউল মেটাডাটা ও নাসা লিংক (Official Granules):' : 'Authoritative Space & Ground Granule Lineage:'}
            </span>

            <div className="space-y-2">
              {record.sampleGranules.map((g, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 font-mono font-bold text-[10px]">
                        {g.date}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-cyan-800 break-all">
                        {g.granuleId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">{g.description}</div>
                  </div>

                  <a
                    href={g.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-400 text-slate-700 font-bold text-[11px] transition-colors shrink-0 shadow-2xs"
                  >
                    <span>{isBn ? 'আর্কাইভ দেখুন' : 'Open DAAC'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* SHA-256 Provenance Fingerprint */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center space-x-1">
                <FileCheck2 className="w-3 h-3 text-emerald-600" />
                <span>{isBn ? 'ক্রিপ্টোগ্রাফিক সনদ (Zero-Fabrication SHA-256)' : 'Cryptographic Provenance Fingerprint'}</span>
              </span>

              <button
                onClick={handleCopyHash}
                className="inline-flex items-center space-x-1 text-[10px] text-cyan-700 hover:text-cyan-900 font-bold transition-colors cursor-pointer"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'হ্যাশ কপি করুন' : 'Copy Hash')}</span>
              </button>
            </div>
            <div className="p-2 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600 break-all select-all">
              {record.verificationHash}
            </div>
          </div>

          {/* Peer-Reviewed Citation */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              {isBn ? 'বৈজ্ঞানিক মেথডলজি ও রেফারেন্স (Citation):' : 'Methodological Literature Citation:'}
            </span>
            <p className="text-[11px] text-slate-600 italic">
              {record.methodCitation}
            </p>
          </div>
        </div>

        {/* Footer with External Mission Portal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            {isBn ? 'আন্তর্জাতিক নাসা ও কোপার্নিকাস ওপেন সায়েন্স স্ট্যান্ডার্ড' : 'NASA Earth Science Open Data Compliant'}
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <a
              href={record.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors shadow-2xs"
            >
              <span>{isBn ? 'মিশন পোর্টাল' : 'Mission Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={record.dataAccessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isBn ? 'নাসা/ডাটা আর্কাইভ' : 'NASA Earthdata Access'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
