import React from 'react';
import { CommissionInput, CommissionResult, MonthProgressConfig } from '../features/commission/commission.types';
import { formatPercentage } from '../features/commission/commission.utils';
import { MATRIX_COLUMNS } from './CommissionMatrix';
import { VodafoneLogo } from './VodafoneLogo';
import { getStoredTNPSState } from './TNPSCalculator';
import { 
  Zap, 
  Building2, 
  Smartphone, 
  Wifi, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sigma, 
  Boxes, 
  Layers 
} from 'lucide-react';

interface PDFReportTemplateProps {
  input: CommissionInput;
  result: CommissionResult;
  monthConfig: MonthProgressConfig;
  acqNote: string;
  agentName?: string;
}

export function PDFReportTemplate({
  input,
  result,
  monthConfig,
  acqNote,
  agentName,
}: PDFReportTemplateProps) {
  const monthProgressPct = Math.min(100, Math.max(0, (monthConfig.today / monthConfig.totalDays) * 100));
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const tnpsValues = getStoredTNPSState();
  const p = tnpsValues.promoters ?? 0;
  const pass = tnpsValues.passive ?? 0;
  const d = tnpsValues.detractors ?? 0;
  const autoTotal = (tnpsValues.promoters !== null || tnpsValues.passive !== null || tnpsValues.detractors !== null)
    ? p + pass + d
    : null;
  const total = tnpsValues.customTotal !== null ? tnpsValues.customTotal : autoTotal;
  let tnpsScore: number | null = null;
  if (total !== null && total > 0 && (tnpsValues.promoters !== null || tnpsValues.detractors !== null)) {
    tnpsScore = ((p - d) / total) * 100;
  }
  const pPct = total && total > 0 ? (p / total) * 100 : 0;
  const passPct = total && total > 0 ? (pass / total) * 100 : 0;
  const dPct = total && total > 0 ? (d / total) * 100 : 0;
  const isGoalMet = tnpsScore !== null && tnpsScore >= 70;

  return (
    <div
      style={{ width: '1400px' }}
      className="bg-white text-slate-900 p-6 space-y-4 font-sans select-none"
    >
      {/* 1. Executive Branded Header */}
      <div className="flex items-center justify-between border-b-2 border-[#E60000] pb-3">
        <div className="flex items-center gap-3">
          <VodafoneLogo className="w-11 h-11 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Vodafone Commission & Achievement Report
              </h1>
              <span className="bg-red-50 text-[#E60000] border border-red-200 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Official
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Sales Employee Performance • Weighted Contributions • VS% (Actual) & RE% (Month-End Projected) Run-Rate Analysis
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-600">
          <div className="font-bold text-slate-900 flex items-center justify-end gap-1 text-sm">
            <span>Made With Love by</span>
            <span className="text-[#E60000] font-black">S3D ( Qena Store )</span>
          </div>
          {agentName && agentName.trim() ? (
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              <span>Agent / Store: </span>
              <span className="text-[#E60000] font-black">{agentName}</span>
            </div>
          ) : null}
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            Report Date: {currentDate} • Timeline: Day {monthConfig.today} of {monthConfig.totalDays} ({monthProgressPct.toFixed(1)}% Elapsed)
          </div>
        </div>
      </div>

      {/* 2. Run-Rate & Month Projection Executive Banner (Updated Feature) */}
      <div className="bg-gradient-to-r from-slate-50 via-indigo-50/50 to-slate-50 border border-indigo-200/80 rounded-xl p-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Run-Rate Settings & Projections (VS% & RE%)
              </h2>
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                {monthProgressPct.toFixed(1)}% Month Elapsed
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              <strong className="text-slate-900 font-bold">VS%</strong> = Actual Delivered / Assigned Target •{' '}
              <strong className="text-indigo-700 font-bold">RE%</strong> = VS% × ({monthConfig.totalDays} Total Days / {monthConfig.today} Elapsed Days)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-center shadow-2xs">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Overall VS% (Actual)</div>
            <div className="text-base font-black text-slate-900 leading-tight">
              {formatPercentage(result.overall.achievement)}
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-300 rounded-lg px-3 py-1.5 text-center shadow-2xs">
            <div className="text-[9px] font-black text-indigo-700 uppercase tracking-wider">Overall RE% (Projected)</div>
            <div className="text-base font-black text-indigo-900 leading-tight">
              {formatPercentage(result.overall.re)}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-center shadow-2xs">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Current Timeline</div>
            <div className="text-xs font-black text-slate-800 leading-tight mt-0.5">
              Day {monthConfig.today} / {monthConfig.totalDays}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Overall Commission KPI & Dual Metric Summary Card */}
      <div className="grid grid-cols-12 gap-3.5">
        {/* Main KPI Card in Vodafone Red Palette (8 cols) */}
        <div className="col-span-8 bg-gradient-to-br from-[#E60000] via-[#CC0000] to-[#990000] rounded-xl shadow-xs p-4 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-white/90 bg-black/25 px-2.5 py-0.5 rounded-md border border-white/20">
                Overall Commission & Achievement Status
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-black/25 px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                {result.overall.isComplete ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Fully Calculated</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-white/80" />
                    <span>Calculated with Current Targets</span>
                  </>
                )}
              </div>
            </div>

            {/* Primary Dual KPI: VS% (Actual) & RE% (Expected EOM) */}
            <div className="grid grid-cols-2 gap-3 my-1.5">
              {/* VS% Card */}
              <div className="bg-black/25 rounded-xl p-3 border border-white/20 h-full min-h-[100px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-white/90 text-xs font-bold mb-0.5">
                  <span className="text-white font-black">VS% (Actual Achieved)</span>
                  <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded text-white font-bold">To Date</span>
                </div>
                <div className="text-3xl font-black tracking-tight text-white my-0.5">
                  {formatPercentage(result.overall.achievement)}
                </div>
                <div className="text-[10px] text-white/80 font-medium">
                  Delivered Result / Assigned Target
                </div>
              </div>

              {/* RE% Card */}
              <div className="bg-black/25 rounded-xl p-3 border border-white/25 h-full min-h-[100px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-white/90 text-xs font-bold mb-0.5">
                  <span className="text-amber-200 font-black">RE% (Projected Month-End)</span>
                  <span className="bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded">
                    Expected
                  </span>
                </div>
                <div className="text-3xl font-black tracking-tight text-amber-200 my-0.5">
                  {formatPercentage(result.overall.re)}
                </div>
                <div className="text-[10px] text-white/80 font-medium">
                  Projected at Day {monthConfig.today} of {monthConfig.totalDays}
                </div>
              </div>
            </div>
          </div>

          {/* Category breakdown boxes with both VS and RE */}
          <div className="relative z-10 pt-2 border-t border-white/20 grid grid-cols-4 gap-2 text-xs">
            {/* Acquisition */}
            <div className="bg-black/25 rounded-xl p-2.5 border border-white/15 flex flex-col justify-between h-full min-h-[90px]">
              <div className="flex items-center justify-between pb-1 border-b border-white/15">
                <div className="flex items-center gap-1.5 text-white/95 text-[11px] font-bold">
                  <Zap className="w-3.5 h-3.5 text-white/90 shrink-0" />
                  <span>Acquisition</span>
                </div>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded font-bold text-white">60%</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                <div className="bg-white/10 rounded-lg p-1 text-center border border-white/10">
                  <span className="text-[8px] uppercase font-bold text-white/80 block">VS%</span>
                  <span className="text-xs font-black text-white block mt-0.5 leading-tight">
                    {formatPercentage(result.acquisition.total.contribution)}
                  </span>
                </div>
                <div className="bg-black/30 rounded-lg p-1 text-center border border-white/15">
                  <span className="text-[8px] uppercase font-bold text-amber-300 block">RE%</span>
                  <span className="text-xs font-black text-amber-200 block mt-0.5 leading-tight">
                    {formatPercentage(result.acquisition.total.re !== null && result.acquisition.total.re !== undefined ? result.acquisition.total.re * 0.60 : null)}
                  </span>
                </div>
              </div>
            </div>

            {/* Enterprise */}
            <div className="bg-black/25 rounded-xl p-2.5 border border-white/15 flex flex-col justify-between h-full min-h-[90px]">
              <div className="flex items-center justify-between pb-1 border-b border-white/15">
                <div className="flex items-center gap-1.5 text-white/95 text-[11px] font-bold">
                  <Building2 className="w-3.5 h-3.5 text-white/90 shrink-0" />
                  <span>Enterprise</span>
                </div>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded font-bold text-white">10%</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                <div className="bg-white/10 rounded-lg p-1 text-center border border-white/10">
                  <span className="text-[8px] uppercase font-bold text-white/80 block">VS%</span>
                  <span className="text-xs font-black text-white block mt-0.5 leading-tight">
                    {formatPercentage(result.enterprise.totalContribution)}
                  </span>
                </div>
                <div className="bg-black/30 rounded-lg p-1 text-center border border-white/15">
                  <span className="text-[8px] uppercase font-bold text-amber-300 block">RE%</span>
                  <span className="text-xs font-black text-amber-200 block mt-0.5 leading-tight">
                    {formatPercentage(result.enterprise.totalRE)}
                  </span>
                </div>
              </div>
            </div>

            {/* Terminal */}
            <div className="bg-black/25 rounded-xl p-2.5 border border-white/15 flex flex-col justify-between h-full min-h-[90px]">
              <div className="flex items-center justify-between pb-1 border-b border-white/15">
                <div className="flex items-center gap-1.5 text-white/95 text-[11px] font-bold">
                  <Smartphone className="w-3.5 h-3.5 text-white/90 shrink-0" />
                  <span>Terminal</span>
                </div>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded font-bold text-white">10%</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                <div className="bg-white/10 rounded-lg p-1 text-center border border-white/10">
                  <span className="text-[8px] uppercase font-bold text-white/80 block">VS%</span>
                  <span className="text-xs font-black text-white block mt-0.5 leading-tight">
                    {formatPercentage(result.terminal.contribution)}
                  </span>
                </div>
                <div className="bg-black/30 rounded-lg p-1 text-center border border-white/15">
                  <span className="text-[8px] uppercase font-bold text-amber-300 block">RE%</span>
                  <span className="text-xs font-black text-amber-200 block mt-0.5 leading-tight">
                    {formatPercentage(result.terminal.re !== null && result.terminal.re !== undefined ? result.terminal.re * 0.10 : null)}
                  </span>
                </div>
              </div>
            </div>

            {/* Fixed */}
            <div className="bg-black/25 rounded-xl p-2.5 border border-white/15 flex flex-col justify-between h-full min-h-[90px]">
              <div className="flex items-center justify-between pb-1 border-b border-white/15">
                <div className="flex items-center gap-1.5 text-white/95 text-[11px] font-bold">
                  <Wifi className="w-3.5 h-3.5 text-white/90 shrink-0" />
                  <span>Fixed</span>
                </div>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded font-bold text-white">20%</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                <div className="bg-white/10 rounded-lg p-1 text-center border border-white/10">
                  <span className="text-[8px] uppercase font-bold text-white/80 block">VS%</span>
                  <span className="text-xs font-black text-white block mt-0.5 leading-tight">
                    {formatPercentage(result.fixed.totalContribution)}
                  </span>
                </div>
                <div className="bg-black/30 rounded-lg p-1 text-center border border-white/15">
                  <span className="text-[8px] uppercase font-bold text-amber-300 block">RE%</span>
                  <span className="text-xs font-black text-amber-200 block mt-0.5 leading-tight">
                    {formatPercentage(result.fixed.totalRE)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TNPS Calculator Box (4 cols) */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E60000]"></span>
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  TNPS Performance Box
                </span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                tnpsScore === null
                  ? 'bg-slate-100 text-slate-600'
                  : isGoalMet
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-[#E60000]'
              }`}>
                {tnpsScore === null
                  ? 'Target: 70%'
                  : isGoalMet
                  ? 'Target Met (≥ 70%)'
                  : 'Below Target (< 70%)'}
              </span>
            </div>

            {/* 4 Responses Metric Cells */}
            <div className="grid grid-cols-4 gap-1.5 mb-2 text-center">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5">
                <div className="text-[9px] font-bold text-emerald-700">Promoters</div>
                <div className="text-sm font-black text-emerald-950">{tnpsValues.promoters ?? 0}</div>
                <div className="text-[8px] font-semibold text-emerald-600">{pPct.toFixed(0)}%</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-1.5">
                <div className="text-[9px] font-bold text-amber-700">Passive</div>
                <div className="text-sm font-black text-amber-950">{tnpsValues.passive ?? 0}</div>
                <div className="text-[8px] font-semibold text-amber-600">{passPct.toFixed(0)}%</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-1.5">
                <div className="text-[9px] font-bold text-red-700">Detractors</div>
                <div className="text-sm font-black text-red-950">{tnpsValues.detractors ?? 0}</div>
                <div className="text-[8px] font-semibold text-red-600">{dPct.toFixed(0)}%</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                <div className="text-[9px] font-bold text-slate-700">Total</div>
                <div className="text-sm font-black text-slate-900">{total ?? 0}</div>
                <div className="text-[8px] font-semibold text-slate-500">100%</div>
              </div>
            </div>

            {/* Visual Distribution Segment Bar */}
            {total !== null && total > 0 ? (
              <div className="space-y-1 mb-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${pPct}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${passPct}%` }} className="bg-amber-400 h-full" />
                  <div style={{ width: `${dPct}%` }} className="bg-[#E60000] h-full" />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-500 px-0.5">
                  <span className="text-emerald-700">P: {pPct.toFixed(0)}%</span>
                  <span className="text-amber-700">Pass: {passPct.toFixed(0)}%</span>
                  <span className="text-[#E60000]">D: {dPct.toFixed(0)}%</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Result Score Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-between">
            <div>
              <div className="text-[9px] font-bold text-slate-500 uppercase">Calculated TNPS Score</div>
              <div className="text-[10px] text-slate-600 font-medium">Formula: (P - D) / Total × 100</div>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-black tracking-tight ${
                tnpsScore === null
                  ? 'text-slate-400'
                  : tnpsScore >= 70
                  ? 'text-emerald-600'
                  : tnpsScore > 0
                  ? 'text-amber-600'
                  : 'text-[#E60000]'
              }`}>
                {tnpsScore !== null ? `${tnpsScore > 0 ? '+' : ''}${tnpsScore.toFixed(1)}%` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Complete Performance Matrix Table */}
      <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full border-collapse text-left">
          <thead>
            {/* Top Level Category Row */}
            <tr className="border-b border-slate-200 text-xs font-bold">
              <th className="p-2.5 w-40 text-center border-r border-slate-200 bg-slate-100 border-t-4 border-t-slate-400">
                <div className="inline-flex items-center justify-center gap-1.5 font-black text-slate-700 uppercase tracking-wider text-xs">
                  <Layers className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Category</span>
                </div>
              </th>

              {/* Acquisition Category Box (Spans 4 columns: Low, High, Cash, Total) */}
              <th colSpan={4} className="p-2 text-center border-r border-slate-200 bg-gradient-to-b from-red-100/90 via-red-50/70 to-red-50/40 border-t-4 border-t-[#E60000]">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-[#E60000] shrink-0" />
                  <span className="font-black text-red-950 text-sm tracking-tight">Acquisition</span>
                  <span className="bg-[#E60000] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                    Weight: 60%
                  </span>
                </div>
                {/* Static full rule note without truncation */}
                <div className="bg-red-50/80 border border-red-200 rounded-md px-2 py-0.5 text-[11px] font-bold text-red-950 text-center">
                  <span className="bg-[#E60000] text-white text-[9px] font-black px-1.5 py-0.2 rounded mr-1.5">NOTE</span>
                  {acqNote || "Must Get 90% of High GA's to not lose any Over in Low GA's"}
                </div>
              </th>

              {/* Enterprise Category Box (2 cols) */}
              <th colSpan={2} className="p-2.5 text-center border-r border-slate-200 bg-gradient-to-b from-indigo-100/90 via-indigo-50/70 to-indigo-50/40 border-t-4 border-t-indigo-600">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-black text-indigo-950 text-sm tracking-tight">Enterprise</span>
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                    Total: 10%
                  </span>
                </div>
                <div className="text-indigo-800 font-semibold text-[11px]">Accounts 5% • Lines 5%</div>
              </th>

              {/* Terminal Category Box (1 col) */}
              <th className="p-2.5 text-center border-r border-slate-200 bg-gradient-to-b from-amber-100/90 via-amber-50/70 to-amber-50/40 border-t-4 border-t-amber-500">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-black text-amber-950 text-sm tracking-tight">Terminal</span>
                </div>
                <div className="inline-flex items-center gap-1 bg-amber-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">
                  Weight: 10%
                </div>
              </th>

              {/* Fixed Category Box (2 cols) */}
              <th colSpan={2} className="p-2.5 text-center bg-gradient-to-b from-emerald-100/90 via-emerald-50/70 to-emerald-50/40 border-t-4 border-t-emerald-600">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-black text-emerald-950 text-sm tracking-tight">Fixed</span>
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                    Total: 20%
                  </span>
                </div>
                <div className="text-emerald-800 font-semibold text-[11px]">DSL 16% • Connectivity 4%</div>
              </th>
            </tr>

            {/* Sub-column Titles and Units */}
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-700">
              <th className="p-2.5 text-center border-r border-slate-200 bg-slate-100">
                <div className="inline-flex items-center justify-center gap-1 font-black text-slate-700 uppercase tracking-wider text-[11px]">
                  <Boxes className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Component</span>
                </div>
              </th>

              {MATRIX_COLUMNS.map((col) => (
                <th
                  key={col.id}
                  className={`p-2 text-center border-r last:border-r-0 border-slate-200 ${col.theme.subHeaderBg}`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    {col.isSummary ? (
                      <Sigma className="w-3 h-3 text-[#E60000] shrink-0" />
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${col.theme.accentDot} shrink-0`}></span>
                    )}
                    <span className={`font-extrabold text-xs ${col.theme.titleColor}`}>{col.subTitle}</span>
                  </div>
                  <div className="text-[10px] font-normal flex items-center justify-center gap-1 mt-0.5 min-h-[16px]">
                    {col.weightLabel ? (
                      <span className={`font-extrabold px-1.5 py-0.5 rounded-sm text-[9px] ${col.theme.badgeBg} ${col.theme.badgeText}`}>
                        {col.weightLabel}
                      </span>
                    ) : null}
                    {col.weightLabel && col.unit ? <span className="text-slate-300">•</span> : null}
                    {col.unit ? (
                      <span className={`text-[10px] font-bold ${col.theme.unitColor}`}>{col.unit}</span>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* ROW 1: Target */}
            <tr className="border-b border-slate-200 bg-white">
              <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 shrink-0"></span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Target</div>
                    <div className="text-[10px] text-slate-500 font-normal">Assigned target</div>
                  </div>
                </div>
              </td>
              {MATRIX_COLUMNS.map((col) => {
                const targetVal = col.getter(input).target;
                const summaryVal = result.acquisition.totalTarget;
                const display = col.isSummary
                  ? summaryVal !== null && summaryVal !== undefined ? summaryVal.toLocaleString() : '0'
                  : targetVal !== null && targetVal !== undefined ? targetVal.toLocaleString() : '0';

                return (
                  <td key={col.id} className={`p-2 border-r last:border-r-0 border-slate-200 text-center align-middle ${col.isSummary ? 'bg-red-50/40' : ''}`}>
                    <div className="py-1 px-2 font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg">
                      {display}
                    </div>
                    {col.unit ? (
                      <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">{col.unit}</span>
                    ) : null}
                  </td>
                );
              })}
            </tr>

            {/* ROW 2: Actual / Achieve */}
            <tr className="border-b border-slate-200 bg-white">
              <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E60000] shrink-0"></span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Actual</div>
                    <div className="text-[10px] text-slate-500 font-normal">Delivered result</div>
                  </div>
                </div>
              </td>
              {MATRIX_COLUMNS.map((col) => {
                const actualVal = col.getter(input).actual;
                const summaryVal = result.acquisition.totalActual;
                const display = col.isSummary
                  ? summaryVal !== null && summaryVal !== undefined ? summaryVal.toLocaleString() : '0'
                  : actualVal !== null && actualVal !== undefined ? actualVal.toLocaleString() : '0';

                return (
                  <td key={col.id} className={`p-2 border-r last:border-r-0 border-slate-200 text-center align-middle ${col.isSummary ? 'bg-red-50/40' : ''}`}>
                    <div className="py-1 px-2 font-black text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg">
                      {display}
                    </div>
                    {col.unit ? (
                      <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">{col.unit}</span>
                    ) : null}
                  </td>
                );
              })}
            </tr>

            {/* ROW 3: Percentages (VS% & RE% & Contributions & Missing) */}
            <tr className="bg-slate-50/60 border-b border-slate-200">
              <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200 bg-slate-100 align-top">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E60000] shrink-0"></span>
                  <div>
                    <div className="text-xs font-black text-slate-900">VS% & RE%</div>
                    <div className="text-[10px] text-slate-500 font-normal">Actual & Run-Rate</div>
                  </div>
                </div>
              </td>
              {MATRIX_COLUMNS.map((col) => {
                const res = col.resultGetter(result);
                const vs = res.vs ?? res.achievement;
                const re = res.re ?? null;
                const isExceeded = res.missing === 0 && res.achievement !== null && res.achievement >= 100;

                return (
                  <td key={col.id} className={`p-1.5 border-r last:border-r-0 border-slate-200 align-top ${col.isSummary ? 'bg-red-50/40' : ''}`}>
                    <div className="flex flex-col gap-1.5 h-full justify-between">
                      {/* VS% */}
                      <div className="bg-white border border-slate-200 rounded-lg p-1 text-center shadow-2xs min-h-[44px] flex flex-col justify-center">
                        <div className="flex items-center justify-between px-1 text-[8px] text-slate-500 font-bold">
                          <span>VS%</span>
                          <span>Actual</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 block leading-tight">
                          {formatPercentage(vs)}
                        </span>
                      </div>

                      {/* RE% */}
                      <div className="bg-gradient-to-b from-indigo-50/90 to-indigo-50/40 border border-indigo-200 rounded-lg p-1 text-center shadow-2xs min-h-[44px] flex flex-col justify-center">
                        <div className="flex items-center justify-between px-1 text-[8px] text-indigo-600 font-bold">
                          <span>RE%</span>
                          <span>Expected</span>
                        </div>
                        <span className="text-xs font-black text-indigo-900 block leading-tight">
                          {formatPercentage(re)}
                        </span>
                      </div>

                      {/* Contribution % */}
                      {!col.isSubBox ? (
                        <div className={`${col.theme.contribBg} border ${col.theme.contribBorder} rounded-lg p-1 text-center shadow-2xs min-h-[46px] flex flex-col justify-center`}>
                          <span className={`text-[8px] uppercase font-black ${col.theme.contribText} block mb-0.5`}>
                            Contribution %
                          </span>
                          <span className={`text-xs font-black ${col.theme.contribText} block leading-tight`}>
                            {formatPercentage(res.contribution)}
                          </span>
                          {!col.isSummary && (
                            <span className="text-[9px] text-slate-500 block font-semibold mt-0.5">
                              of {col.weightLabel}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-lg p-1 text-center min-h-[46px] flex flex-col justify-center">
                          <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">
                            Contribution %
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400 block leading-tight">
                            In Total Acq
                          </span>
                        </div>
                      )}

                      {/* Missing */}
                      <div className="bg-white border border-slate-200 rounded-lg p-1 text-center shadow-2xs min-h-[44px] flex flex-col justify-center">
                        <span className="text-[8px] uppercase font-bold text-slate-500 block mb-0.5">
                          Missing
                        </span>
                        <span className={`text-[11px] font-bold block leading-tight ${
                          res.missing !== null
                            ? res.missing > 0
                              ? 'text-[#E60000]'
                              : 'text-emerald-600'
                            : 'text-slate-400'
                        }`}>
                          {res.missing !== null
                            ? isExceeded
                              ? 'Exceeded 100%'
                              : res.missing === 0
                              ? 'Goal Met'
                              : `${res.missing.toLocaleString()} ${col.unit || 'Points'}`
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* ROW 4: Parent Categories Summary Sub-Row with VS% and RE% totals */}
            <tr className="border-t-2 border-slate-300 bg-slate-100 text-xs font-bold">
              <td className="p-2 text-center border-r border-slate-200 font-black text-slate-800">
                Boxs Summary
              </td>
              {/* Acquisition Combined Total */}
              <td colSpan={4} className="p-2 text-center border-r border-slate-200 bg-red-100/70">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-red-950 font-black text-xs">Total Acquisition:</span>
                  <span className="text-xs font-black text-[#E60000]">
                    VS: {formatPercentage(result.acquisition.total.contribution)}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-black text-indigo-700">
                    RE: {formatPercentage(result.acquisition.total.re !== null && result.acquisition.total.re !== undefined ? result.acquisition.total.re * 0.60 : null)}
                  </span>
                  <span className="text-[10px] text-red-800 font-bold">(Weight: 60%)</span>
                </div>
              </td>

              {/* Enterprise Combined Total */}
              <td colSpan={2} className="p-2 text-center border-r border-slate-200 bg-indigo-100/70">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-indigo-950 font-black text-xs">Enterprise:</span>
                  <span className="text-xs font-black text-indigo-700">
                    VS: {formatPercentage(result.enterprise.totalContribution)}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-black text-indigo-900">
                    RE: {formatPercentage(result.enterprise.totalRE)}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold">(10%)</span>
                </div>
              </td>

              {/* Terminal Total */}
              <td className="p-2 text-center border-r border-slate-200 bg-amber-100/70">
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-amber-950 font-black text-xs">Terminal:</span>
                    <span className="text-[9px] text-amber-800 font-bold">(10%)</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-amber-800">
                      VS: {formatPercentage(result.terminal.contribution)}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs font-black text-amber-950">
                      RE: {formatPercentage(result.terminal.re !== null && result.terminal.re !== undefined ? result.terminal.re * 0.10 : null)}
                    </span>
                  </div>
                </div>
              </td>

              {/* Fixed Combined Total */}
              <td colSpan={2} className="p-2 text-center bg-emerald-100/70">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-emerald-950 font-black text-xs">Fixed:</span>
                  <span className="text-xs font-black text-emerald-700">
                    VS: {formatPercentage(result.fixed.totalContribution)}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-black text-emerald-900">
                    RE: {formatPercentage(result.fixed.totalRE)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">(20%)</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Executive Confidential Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[11px] text-slate-500 font-medium">
        <div>Vodafone Store Performance & Commission Tracking • Confidential Document</div>
        <div>Generated with Vodafone Commission Calculator • VS% & RE% Active • Day {monthConfig.today}/{monthConfig.totalDays} ({monthProgressPct.toFixed(1)}% Month Elapsed)</div>
      </div>
    </div>
  );
}
