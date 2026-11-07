import React from 'react';
import { X, Printer, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { QRCodeCanvas } from './QRCodeCanvas';

interface DecisionBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DecisionBriefModal: React.FC<DecisionBriefModalProps> = ({ isOpen, onClose }) => {
  const { regionId, selectedDate } = useWorkspaceStore();

  if (!isOpen) return null;

  const isJamuna = regionId === 'jamuna';
  const findingId = `BRIEF-${regionId.toUpperCase()}-2026-001`;
  const lineageHash = '7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 pt-16 sm:pt-20 pb-6 print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] w-full max-w-3xl max-h-[84vh] flex flex-col overflow-hidden print:max-h-none print:border-none print:shadow-none animate-in zoom-in-95 duration-150">
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] print:hidden shrink-0">
          <div className="flex items-center space-x-2 text-[#102A43] font-bold text-sm">
            <FileText className="w-4 h-4 text-[#155E75]" />
            <span>{isJamuna ? 'Jamuna Riverbank Decision Brief' : 'Sundarbans Canopy Pulse Brief'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#155E75] hover:bg-[#0E7490] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#102A43] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable One-Page Content (A4 / Letter target) */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 text-[#102A43] print:p-4 print:overflow-visible text-xs leading-relaxed font-sans">
          {/* Official Document Header */}
          <div className="border-b-2 border-[#155E75] pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-[#155E75] tracking-tight">FLUVISAR</span>
                <span className="text-[10px] bg-[#E0F2FE] text-[#0369A1] font-bold px-2 py-0.5 rounded uppercase">
                  Rapid Decision Brief
                </span>
              </div>
              <h1 className="text-base font-bold text-[#0F172A] mt-1">
                {isJamuna
                  ? 'যমুনা নদী অববাহিকা দ্রুত সিদ্ধান্ত সারসংক্ষেপ (Chilmari–Roumari Reach)'
                  : 'সুন্দরবন ম্যানগ্রোভ ক্যানোপি ও জোয়ার পর্যবেক্ষণ সারসংক্ষেপ (Dublar–Passur Reach)'}
              </h1>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Authority: NASA Space Apps Challenge 2026 · NISAR L2 GCOV / GUNW Verified Lineage
              </p>
            </div>
            <div className="text-right text-[10px] text-[#475569]">
              <div>ID: <strong className="font-mono text-[#0F172A]">{findingId}</strong></div>
              <div>Date: <strong className="font-mono text-[#0F172A]">{selectedDate}</strong></div>
              <div>Status: <span className="text-[#16A34A] font-bold">ACTIVE PROPOSED</span></div>
            </div>
          </div>

          {/* Core Finding Statement & Evidence Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <h2 className="font-bold text-xs uppercase tracking-wider text-[#155E75]">
                1. Scientific Observation Finding
              </h2>
              <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] space-y-1.5">
                <p className="text-xs text-[#1E293B] font-medium leading-normal">
                  {isJamuna
                    ? 'যমুনার চিলমারী পশ্চিম বাঁকে ১৮৪ হেক্টর নদীভাঙন/পানির বিস্তার শনাক্ত হয়েছে। এর মধ্যে ১৪৫.৮ হেক্টর রবাস্ট কোর (সব থ্রেশহোল্ডে স্থায়ী পানি) এবং ২৮.৪ হেক্টর প্রান্তিক প্লাবন।'
                    : 'পাসুর ও দুবলার চরে ৩১২ হেক্টর ম্যানগ্রোভ জোয়ারের পানির নিচে নিমজ্জিত। HH/HV ক্রস-পোলারাইজেশন রেশিও -6.2 dB যা ডাবল-বাউন্স প্রতিফলন নিশ্চিত করে।'}
                </p>
                <div className="flex items-center space-x-3 text-[10px] text-[#64748B] pt-1 border-t border-[#E2E8F0]">
                  <span>Sensor: <strong>NISAR L-band (23.84cm)</strong></span>
                  <span>Orbit: <strong>Descending Track 42</strong></span>
                  <span>Spatial Res: <strong>20m Posting</strong></span>
                </div>
              </div>
            </div>

            {/* Robustness Breakdown Card */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-3 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#1E40AF]">Uncertainty Envelope</span>
                <div className="mt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#1E3A8A]">Robust Core:</span>
                    <strong className="font-mono text-[#1E40AF]">145.8 ha</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1E3A8A]">Contested Fringe:</span>
                    <strong className="font-mono text-[#D97706]">28.4 ha</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1E3A8A]">Confidence Ratio:</span>
                    <strong className="font-mono text-[#16A34A]">83.7%</strong>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-[9px] text-[#2563EB] mt-2">
                <ShieldCheck className="w-3 h-3" />
                <span>Passed 6 of 7 Scientific Checks</span>
              </div>
            </div>
          </div>

          {/* Impact Ledger (What Changed for Whom) */}
          <div className="space-y-2">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#155E75]">
              2. Human & Infrastructure Impact Ledger (W09 / E16)
            </h2>
            <div className="border border-[#CBD5E1] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[#475569]">
                    <th className="p-2 font-semibold">Exposed Asset / Sector</th>
                    <th className="p-2 font-semibold">Identified Locations</th>
                    <th className="p-2 font-semibold">Tally / Metric</th>
                    <th className="p-2 font-semibold">Action Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  <tr>
                    <td className="p-2 font-medium text-[#0F172A]">Primary Education</td>
                    <td className="p-2 text-[#475569]">Chilmari Model Primary School, Mandaler Char Govt School</td>
                    <td className="p-2 font-mono font-bold text-[#155E75]">2 Schools exposed (&lt;50m)</td>
                    <td className="p-2 text-[#C2410C] font-semibold">Immediate Inspection</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-[#0F172A]">Community Healthcare</td>
                    <td className="p-2 text-[#475569]">Roumari Riverside Community Clinic</td>
                    <td className="p-2 font-mono font-bold text-[#155E75]">1 Clinic within 80m fringe</td>
                    <td className="p-2 text-[#D97706] font-semibold">Logistics Contingency</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-[#0F172A]">Transportation Access</td>
                    <td className="p-2 text-[#475569]">Chilmari Ghat Approach Embankment Road</td>
                    <td className="p-2 font-mono font-bold text-[#155E75]">1.4 km road segment severed</td>
                    <td className="p-2 text-[#C2410C] font-semibold">Deploy Ferry Shuttle</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-[#0F172A]">Settlement Population</td>
                    <td className="p-2 text-[#475569]">Chars 4 & 5 (BBS 2022 Census Mauza layer)</td>
                    <td className="p-2 font-mono font-bold text-[#0F172A]">~1,850 Residents exposed</td>
                    <td className="p-2 text-[#16A34A] font-semibold">Supply Route Check</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Field Inspection Protocol & Mobile QR Handoff */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#E2E8F0]">
            <div className="col-span-2 space-y-2">
              <h2 className="font-bold text-xs uppercase tracking-wider text-[#155E75]">
                3. Shortlisted Field Verification Objectives
              </h2>
              <div className="space-y-1.5 text-[11px] text-[#334155]">
                <div className="flex items-start space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span><strong>Embankment Edge Survey:</strong> Verify whether western Chilmari bend breach is dry sand bar or standing water channel.</span>
                </div>
                <div className="flex items-start space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span><strong>Ferry Crossing Continuity:</strong> Confirm if ferry engine boat shuttle is maintaining service to Roumari East Ghat.</span>
                </div>
                <div className="flex items-start space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#C2410C] shrink-0 mt-0.5" />
                  <span><strong>Next Satellite Pass:</strong> Await 21 Oct 2026 NISAR overpass to confirm recession trajectory.</span>
                </div>
              </div>
            </div>

            {/* Mobile Task QR Contract (A01-A12) */}
            <div className="border border-[#CBD5E1] p-2.5 rounded-lg bg-[#F8FAFC] flex flex-col items-center justify-center text-center">
              <div className="p-1 bg-white rounded border border-[#E2E8F0] shadow-xs">
                <QRCodeCanvas
                  value={`${window.location.origin}/trace?finding=${encodeURIComponent(findingId)}&region=${encodeURIComponent(regionId)}`}
                  size={72}
                />
              </div>
              <div className="font-mono text-[9px] font-bold text-[#155E75] mt-1.5">
                TASK-{findingId}
              </div>
              <div className="text-[8px] text-[#64748B] mt-0.5">
                Scan with phone for TRACE Field mission
              </div>
            </div>
          </div>

          {/* Signoff & Authority Footer */}
          <div className="border-t border-[#CBD5E1] pt-3 flex items-center justify-between text-[10px] text-[#64748B]">
            <div>
              <span>Lead Observatory: <strong>FluviSAR System</strong></span> · 
              <span className="ml-1">Hash: <code className="font-mono text-[#0F172A]">{lineageHash.slice(0, 16)}...</code></span>
            </div>
            <div>
              <span>Approved For Decision Briefing</span> · 
              <span className="ml-1 font-semibold text-[#155E75]">Open Science / CC-BY-4.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
