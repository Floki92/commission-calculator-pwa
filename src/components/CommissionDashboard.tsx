import React, { useState, useMemo, useEffect } from 'react';
import { CommissionInput, ComponentInput, MonthProgressConfig } from '../features/commission/commission.types';
import { calculateCommission } from '../features/commission/commission.calculator';
import { formatPercentage } from '../features/commission/commission.utils';
import { CommissionMatrix } from './CommissionMatrix';
import { MobileCommissionCards } from './MobileCommissionCards';
import { VodafoneLogo } from './VodafoneLogo';
import { TNPSCalculator } from './TNPSCalculator';
import { PDFReportTemplate } from './PDFReportTemplate';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Heart,
  FileText, 
  Loader2, 
  Zap, 
  Building2, 
  Smartphone, 
  Wifi, 
  Table as TableIcon, 
  LayoutGrid, 
  ArrowUp,
  Calendar,
  RotateCcw,
  TrendingUp,
  Percent,
  User
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const emptyComponent: ComponentInput = { target: null, actual: null };

const initialInput: CommissionInput = {
  acquisition: {
    low: { ...emptyComponent },
    high: { ...emptyComponent },
    cash: { ...emptyComponent },
  },
  enterprise: {
    accounts: { ...emptyComponent },
    lines: { ...emptyComponent },
  },
  terminal: { ...emptyComponent },
  fixed: {
    dsl: { ...emptyComponent },
    connectivity: { ...emptyComponent },
  }
};

const COMMISSION_STORAGE_KEY = 'vodafone_commission_input_v2';
const LEGACY_COMMISSION_STORAGE_KEY = 'vodafone_commission_input_v1';
const ACQ_NOTE_STORAGE_KEY = 'vodafone_acq_note_v2';
const MONTH_CONFIG_STORAGE_KEY = 'vodafone_commission_month_config_v1';
const AGENT_NAME_STORAGE_KEY = 'vodafone_agent_name_v1';
const DEFAULT_ACQ_NOTE = "Must Get 90% of High GA's to not lose any Over in Low GA's";

const parseComp = (comp?: any, fbT: number | null = null, fbA: number | null = null): ComponentInput => ({
  target: typeof comp?.target === 'number' ? comp.target : fbT,
  actual: typeof comp?.actual === 'number' ? comp.actual : fbA,
});

const getInitialMonthConfig = (): MonthProgressConfig => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = Math.min(now.getDate(), totalDays);
  return { today, totalDays };
};

function getStoredCommissionInput(): CommissionInput {
  if (typeof window === 'undefined') return initialInput;
  try {
    const raw = localStorage.getItem(COMMISSION_STORAGE_KEY) || localStorage.getItem(LEGACY_COMMISSION_STORAGE_KEY);
    if (!raw) return initialInput;
    const parsed = JSON.parse(raw);
    
    const legacyVoiceTarget = typeof parsed?.voice?.target === 'number' ? parsed.voice.target : null;
    const legacyVoiceActual = typeof parsed?.voice?.actual === 'number' ? parsed.voice.actual : null;

    return {
      acquisition: {
        low: parseComp(parsed?.acquisition?.low, legacyVoiceTarget, legacyVoiceActual),
        high: parseComp(parsed?.acquisition?.high),
        cash: parseComp(parsed?.acquisition?.cash),
      },
      enterprise: {
        accounts: parseComp(parsed?.enterprise?.accounts),
        lines: parseComp(parsed?.enterprise?.lines),
      },
      terminal: parseComp(parsed?.terminal),
      fixed: {
        dsl: parseComp(parsed?.fixed?.dsl),
        connectivity: parseComp(parsed?.fixed?.connectivity),
      },
    };
  } catch (err) {
    console.error('Error reading saved commission input:', err);
    return initialInput;
  }
}

export function CommissionDashboard() {
  const [input, setInput] = useState<CommissionInput>(getStoredCommissionInput);
  const [isExporting, setIsExporting] = useState(false);
  
  // Month Run-rate settings: Today & Total Month Days
  const [monthConfig, setMonthConfig] = useState<MonthProgressConfig>(() => {
    const defaults = getInitialMonthConfig();
    if (typeof window === 'undefined') return defaults;
    try {
      const raw = localStorage.getItem(MONTH_CONFIG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.today === 'number' && typeof parsed?.totalDays === 'number' && parsed.today > 0 && parsed.totalDays > 0) {
          return parsed;
        }
      }
    } catch {}
    return defaults;
  });

  // Responsive default: cards on mobile, table on desktop
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return 'table';
    }
    return 'cards';
  });

  // Note state for Acquisition rule
  const [acqNote, setAcqNote] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_ACQ_NOTE;
    try {
      const stored = localStorage.getItem(ACQ_NOTE_STORAGE_KEY);
      if (stored) return stored;
      const legacy = localStorage.getItem('vodafone_acq_note_v1');
      if (legacy && legacy !== "Must Get 90% of High GA's to get Over Achieve in Low GA's") {
        return legacy;
      }
      return DEFAULT_ACQ_NOTE;
    } catch {
      return DEFAULT_ACQ_NOTE;
    }
  });

  const handleAcqNoteChange = (val: string) => {
    setAcqNote(val);
    try {
      localStorage.setItem(ACQ_NOTE_STORAGE_KEY, val);
    } catch (err) {
      console.error('Error saving acquisition note:', err);
    }
  };

  // Agent name or Store name state with localStorage persistence
  const [agentName, setAgentName] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(AGENT_NAME_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const handleAgentNameChange = (val: string) => {
    setAgentName(val);
    try {
      localStorage.setItem(AGENT_NAME_STORAGE_KEY, val);
    } catch (err) {
      console.error('Error saving agent name:', err);
    }
  };

  // Save changes to device local storage
  useEffect(() => {
    try {
      localStorage.setItem(COMMISSION_STORAGE_KEY, JSON.stringify(input));
    } catch (err) {
      console.error('Error saving commission input:', err);
    }
  }, [input]);

  useEffect(() => {
    try {
      localStorage.setItem(MONTH_CONFIG_STORAGE_KEY, JSON.stringify(monthConfig));
    } catch (err) {
      console.error('Error saving month config:', err);
    }
  }, [monthConfig]);

  // Ensure dark mode class is completely removed
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('vodafone_commission_theme');
  }, []);

  const result = useMemo(() => calculateCommission(input, monthConfig), [input, monthConfig]);

  const handleReset = () => {
    setInput(initialInput);
    try {
      localStorage.removeItem(COMMISSION_STORAGE_KEY);
      localStorage.removeItem(LEGACY_COMMISSION_STORAGE_KEY);
    } catch (err) {
      console.error('Error clearing saved commission input:', err);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Generates a complete, high-resolution Full Report PDF using jsPDF with all updated features.
   */
  const handleDownloadPDFReport = async () => {
    try {
      setIsExporting(true);

      // Prefer the dedicated high-resolution template with all updated features
      const exportElement = document.getElementById('pdf-export-template') || document.getElementById('printable-report');
      if (!exportElement) return;

      // Small pause to guarantee DOM and fonts are ready
      await new Promise((resolve) => setTimeout(resolve, 150));

      const imgDataUrl = await toPng(exportElement, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 1400,
        style: {
          width: '1400px',
          maxWidth: '1400px',
          overflow: 'visible',
          opacity: '1',
          visibility: 'visible',
        },
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 7;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      const imgProps = pdf.getImageProperties(imgDataUrl);
      const pdfImgHeight = (imgProps.height * availableWidth) / imgProps.width;

      if (pdfImgHeight <= availableHeight) {
        // Center vertically on A4 landscape page
        const yOffset = margin + (availableHeight - pdfImgHeight) / 2;
        pdf.addImage(imgDataUrl, 'PNG', margin, yOffset, availableWidth, pdfImgHeight, undefined, 'FAST');
      } else {
        const scale = availableHeight / pdfImgHeight;
        const scaledWidth = availableWidth * scale;
        const xOffset = margin + (availableWidth - scaledWidth) / 2;
        pdf.addImage(imgDataUrl, 'PNG', xOffset, margin, scaledWidth, availableHeight, undefined, 'FAST');
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      pdf.save(`vodafone-commission-report-day-${monthConfig.today}-of-${monthConfig.totalDays}-${dateStr}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF report', err);
    } finally {
      setIsExporting(false);
    }
  };

  const monthProgressPct = Math.min(100, Math.max(0, (monthConfig.today / monthConfig.totalDays) * 100));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans">
      {/* Top Navigation with Vodafone Brandmark */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-[1920px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Vodafone Logo */}
            <div className="shrink-0 transition-transform hover:scale-105">
              <VodafoneLogo className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                  Commission Calculator
                </h1>
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                <span className="hidden sm:inline">Made With Love by</span>
                <span className="sm:hidden">By</span>
                <span className="font-bold text-slate-800">S3D</span>
                <span className="text-slate-500">( Qena Store )</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPDFReport}
              disabled={isExporting}
              className="no-print flex items-center gap-1.5 text-xs font-semibold bg-[#E60000] hover:bg-[#CC0000] active:bg-[#B30000] text-white transition-colors px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg shadow-xs hover:shadow-sm disabled:opacity-70"
              title="Download Full Commission Report as PDF"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="no-print flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#E60000] hover:bg-red-50 transition-colors px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-slate-200 hover:border-red-200"
              title="Reset all target and actual input fields"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1920px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 mt-3 sm:mt-6 space-y-4 sm:space-y-6">
        
        {/* Full Printable/Exportable Report Container */}
        <div id="printable-report" className="w-full space-y-4 sm:space-y-6">
          
          {/* Executive Branded Header - Included in PDF, PNG export and Print */}
          <div className="hidden print:flex report-export-header items-center justify-between border-b-2 border-[#E60000] pb-4 mb-2">
            <div className="flex items-center gap-3">
              <VodafoneLogo className="w-10 h-10 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Vodafone Commission & Achievement Report
                  </h1>
                  <span className="bg-red-50 text-[#E60000] border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Official
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sales Employee Performance, Weighted Contributions, VS% & RE% Run-Rate Analysis
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div className="font-bold text-slate-900 flex items-center justify-end gap-1">
                <span>Made With Love by</span>
                <span className="text-[#E60000]">S3D ( Qena Store )</span>
                <Heart className="w-3.5 h-3.5 text-[#E60000] fill-[#E60000]" />
              </div>
              {agentName && agentName.trim() ? (
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  <span>Agent / Store: </span>
                  <span className="text-[#E60000] font-bold">{agentName}</span>
                </div>
              ) : null}
              <div className="text-[11px] text-slate-500 mt-1">
                Report Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • Day {monthConfig.today}/{monthConfig.totalDays}
              </div>
            </div>
          </div>

          {/* Executive Run-Rate Print Banner (For standard browser printing) */}
          <div className="hidden print:flex items-center justify-between bg-slate-50 border border-slate-300 rounded-lg p-2.5 mb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800">Timeline & Run-Rate:</span>
              <span className="font-bold text-slate-600">Day {monthConfig.today} of {monthConfig.totalDays} ({monthProgressPct.toFixed(1)}% Month Elapsed)</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium">VS% = Actual/Target • RE% = VS% × ({monthConfig.totalDays}/{monthConfig.today})</span>
            </div>
            <div className="flex items-center gap-3 font-black">
              <span className="text-slate-900">VS% Actual: {formatPercentage(result.overall.achievement)}</span>
              <span className="text-indigo-700">RE% Projected: {formatPercentage(result.overall.re)}</span>
            </div>
          </div>

          {/* Month Run-Rate (RE%) Control Bar - Interactive Day, Name and Month Settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                    Run-Rate Settings (VS% & RE%)
                  </h2>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {monthProgressPct.toFixed(1)}% Month Elapsed
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  <strong className="text-slate-700 font-bold">VS%</strong> = Actual / Target • <strong className="text-indigo-700 font-bold">RE%</strong> = VS% × ({monthConfig.totalDays} / {monthConfig.today})
                </p>
              </div>
            </div>

            {/* Controls: Name, Today, Month Days, Auto */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Store / Agent Name Box */}
              <div className="h-10 flex items-center gap-2 bg-slate-50 hover:bg-white border border-slate-200 focus-within:border-[#E60000] focus-within:ring-2 focus-within:ring-red-100 rounded-xl px-3 transition-all shadow-2xs">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-600 shrink-0">Name:</span>
                <input
                  type="text"
                  placeholder="Store or Agent Name"
                  value={agentName}
                  onChange={(e) => handleAgentNameChange(e.target.value)}
                  className="w-32 sm:w-44 font-bold text-xs text-slate-900 bg-transparent border-none outline-none focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                  title="Store name or Agent name (included in PDF)"
                />
              </div>

              {/* Day & Month Progress Controls (Unified Equal Box) */}
              <div className="h-10 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-600">Today:</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max={monthConfig.totalDays}
                    value={monthConfig.today}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > 0) setMonthConfig(prev => ({ ...prev, today: Math.min(val, prev.totalDays) }));
                    }}
                    className="w-11 text-center font-black text-xs text-indigo-950 bg-white border border-slate-300 rounded-lg py-1 px-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    title="Current elapsed day of month (Today)"
                  />
                </div>

                <span className="text-slate-400 font-bold text-xs">/</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-600">Month:</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="28"
                    max="31"
                    value={monthConfig.totalDays}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 28 && val <= 31) setMonthConfig(prev => ({ ...prev, totalDays: val }));
                    }}
                    className="w-11 text-center font-black text-xs text-slate-900 bg-white border border-slate-300 rounded-lg py-1 px-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    title="Total days in this month"
                  />
                </div>
              </div>

              {/* Reset to Actual Calendar Day Button */}
              <button
                type="button"
                onClick={() => setMonthConfig(getInitialMonthConfig())}
                className="h-10 px-3 text-xs font-bold text-slate-700 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer active:scale-95"
                title="Reset to current calendar date"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          {/* EXECUTIVE KPI & TNPS BAR (Top Grid) */}
          <section aria-labelledby="executive-summary" className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 lg:gap-6">
            
            {/* Main KPI Card in Vodafone Red Palette (7 cols on lg) */}
            <div className="commission-summary-card lg:col-span-7 bg-gradient-to-br from-[#E60000] via-[#CC0000] to-[#990000] rounded-2xl shadow-md p-3.5 sm:p-5 lg:p-6 text-white flex flex-col justify-between relative overflow-hidden transition-all">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2 sm:mb-4 gap-2">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/90 bg-black/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-white/20 truncate">
                    Overall Commission & Run-Rate
                  </span>
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-medium bg-black/25 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md backdrop-blur-xs shrink-0">
                    {result.overall.isComplete ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span className="text-white font-semibold">Fully Calculated</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-white/80" />
                        <span className="text-white/80">Enter Targets &gt; 0</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Dual KPI: VS% (Actual) & RE% (Expected EOM) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 my-2 sm:my-3">
                  {/* VS% Card */}
                  <div className="bg-black/25 rounded-xl p-3 sm:p-3.5 border border-white/20 shadow-2xs h-full min-h-[110px] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-white/90 text-[10px] sm:text-xs font-bold mb-0.5">
                      <span className="text-white font-black">VS% (Actual)</span>
                      <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-bold text-white">To Date</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-black tracking-tight text-white my-1">
                      {formatPercentage(result.overall.achievement)}
                    </div>
                    <div className="text-[10px] text-white/80 truncate font-medium">
                      Actual Achieved / Assigned Target
                    </div>
                  </div>

                  {/* RE% Card */}
                  <div className="bg-black/25 rounded-xl p-3 sm:p-3.5 border border-white/25 shadow-2xs h-full min-h-[110px] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-white/90 text-[10px] sm:text-xs font-bold mb-0.5">
                      <span className="text-amber-200 font-black">RE% (Expected EOM)</span>
                      <span className="bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded">
                        Projected
                      </span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-black tracking-tight text-amber-200 my-1">
                      {formatPercentage(result.overall.re)}
                    </div>
                    <div className="text-[10px] text-white/80 truncate font-medium">
                      Projected at Day {monthConfig.today} of {monthConfig.totalDays}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category breakdown boxes with both VS and RE */}
              <div className="relative z-10 pt-2.5 sm:pt-3 mt-1 sm:mt-2 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-xs">
                {/* Acquisition */}
                <div className="bg-black/25 hover:bg-black/30 rounded-xl p-2.5 border border-white/15 shadow-xs transition-colors backdrop-blur-xs flex flex-col justify-between h-full min-h-[96px]">
                  <div className="flex items-center justify-between gap-1 text-white/95 text-[11px] font-bold pb-1 border-b border-white/15">
                    <div className="flex items-center gap-1.5 truncate">
                      <Zap className="w-3.5 h-3.5 text-white/90 shrink-0" />
                      <span className="truncate">Acquisition</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold text-white shrink-0">60%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <div className="bg-white/10 rounded-lg p-1.5 text-center border border-white/10">
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-white/80 block">VS%</span>
                      <span className="text-xs sm:text-sm font-black text-white block mt-0.5 leading-tight">
                        {formatPercentage(result.acquisition.total.contribution)}
                      </span>
                    </div>
                    <div className="bg-black/30 rounded-lg p-1.5 text-center border border-white/15">
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-amber-300 block">RE%</span>
                      <span className="text-xs sm:text-sm font-black text-amber-200 block mt-0.5 leading-tight">
                        {formatPercentage(result.acquisition.total.re !== null && result.acquisition.total.re !== undefined ? result.acquisition.total.re * 0.60 : null)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enterprise */}
                <div className="bg-black/25 hover:bg-black/30 rounded-xl p-2.5 border border-white/15 shadow-xs transition-colors backdrop-blur-xs flex flex-col justify-between h-full min-h-[96px]">
                  <div className="flex items-center justify-between gap-1 text-white/95 text-[11px] font-bold pb-1 border-b border-white/15">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-white/90 shrink-0" />
                      <span className="truncate">Enterprise</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold text-white shrink-0">10%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <div className="bg-white/10 rounded-lg p-1.5 text-center border border-white/10">
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-white/80 block">VS%</span>
                      <span className="text-xs sm:text-sm font-black text-white block mt-0.5 leading-tight">
                        {formatPercentage(result.enterprise.totalContribution)}
                      </span>
                    </div>
                    <div className="bg-black/30 rounded-lg p-1.5 text-center border border-white/15">
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-amber-300 block">RE%</span>
                      <span className="text-xs sm:text-sm font-black text-amber-200 block mt-0.5 leading-tight">
                        {formatPercentage(result.enterprise.totalRE)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terminal */}
                <div className="bg-black/25 hover:bg-black/30 rounded-xl p-2.5 border border-white/15 shadow-xs transition-colors backdrop-blur-xs flex flex-col justify-between h-full min-h-[96px]">
                  <div className="flex items-center justify-between gap-1 text-white/95 text-[11px] font-bold pb-1 border-b border-white/15">
                    <div className="flex items-center gap-1.5 truncate">
                      <Smartphone className="w-3.5 h-3.5 text-white/90 shrink-0" />
                      <span className="truncate">Terminal</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold text-white shrink-0">10%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <div className="bg-white/10 rounded-lg p-1.5 text-center border border-white/10">
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-white/80 block">VS%</span>
                      <span className="text-xs sm:text-sm font-black text-white block mt-0.5 leading-tight">
                        {formatPercentage(result.terminal.contribution)}
                      </span>
                    </div>
                    <div className="bg-black/30 rounded-lg p-1.5 text-center border border-white/15">
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-amber-300 block">RE%</span>
                      <span className="text-xs sm:text-sm font-black text-amber-200 block mt-0.5 leading-tight">
                        {formatPercentage(result.terminal.re !== null && result.terminal.re !== undefined ? result.terminal.re * 0.10 : null)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fixed */}
                <div className="bg-black/25 hover:bg-black/30 rounded-xl p-2.5 border border-white/15 shadow-xs transition-colors backdrop-blur-xs flex flex-col justify-between h-full min-h-[96px]">
                  <div className="flex items-center justify-between gap-1 text-white/95 text-[11px] font-bold pb-1 border-b border-white/15">
                    <div className="flex items-center gap-1.5 truncate">
                      <Wifi className="w-3.5 h-3.5 text-white/90 shrink-0" />
                      <span className="truncate">Fixed</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold text-white shrink-0">20%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <div className="bg-white/10 rounded-lg p-1.5 text-center border border-white/10">
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-white/80 block">VS%</span>
                      <span className="text-xs sm:text-sm font-black text-white block mt-0.5 leading-tight">
                        {formatPercentage(result.fixed.totalContribution)}
                      </span>
                    </div>
                    <div className="bg-black/30 rounded-lg p-1.5 text-center border border-white/15">
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-amber-300 block">RE%</span>
                      <span className="text-xs sm:text-sm font-black text-amber-200 block mt-0.5 leading-tight">
                        {formatPercentage(result.fixed.totalRE)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar line */}
              {result.overall.achievement !== null && result.overall.achievement > 0 && (
                <div 
                  className="absolute bottom-0 left-0 h-1.5 bg-white transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(result.overall.achievement, 100)}%` }}
                />
              )}
            </div>

            {/* TNPS Calculator Card (5 cols on lg) */}
            <div className="lg:col-span-5">
              <TNPSCalculator />
            </div>
          </section>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-between gap-2 pt-1 no-print">
            <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Mobile Cards</span>
                <span className="md:hidden bg-red-50 text-[#E60000] text-[9px] px-1.5 py-0.2 rounded font-extrabold">
                  Fast
                </span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Full Table</span>
              </button>
            </div>
          </div>

          {/* MAIN DATA INPUT SECTION */}
          <section aria-labelledby="matrix-section">
            {/* 1. Mobile Cards View */}
            <div className={viewMode === 'cards' ? 'block print:hidden report-hide-on-export' : 'hidden print:hidden report-hide-on-export'}>
              <MobileCommissionCards
                input={input}
                result={result}
                onChange={(updater) => setInput(updater)}
                acqNote={acqNote}
                onAcqNoteChange={handleAcqNoteChange}
              />
            </div>

            {/* 2. Full Table View */}
            <div className={viewMode === 'table' ? 'block' : 'hidden print:block report-show-on-export'}>
              <CommissionMatrix 
                input={input}
                result={result}
                onChange={(updater) => setInput(updater)}
                acqNote={acqNote}
                onAcqNoteChange={handleAcqNoteChange}
              />
            </div>
          </section>

          {/* Report Footer */}
          <div className="hidden print:flex report-export-header items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-500">
            <div>Vodafone Store Performance & Commission Tracking • Confidential</div>
            <div>Generated with Vodafone Commission Calculator • VS% & RE% Active</div>
          </div>
        </div>

      </main>

      {/* Mobile Floating Bottom Bar - Sticky status with VS% and RE% */}
      <aside aria-label="Mobile summary" className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg flex items-center justify-between gap-2 no-print">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E60000] shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <div>
              <div className="text-[9px] text-slate-500 font-bold leading-none uppercase">
                VS%
              </div>
              <div className="text-sm font-black text-slate-900 leading-tight">
                {formatPercentage(result.overall.achievement)}
              </div>
            </div>
            <span className="text-slate-300 font-bold">•</span>
            <div>
              <div className="text-[9px] text-indigo-600 font-bold leading-none uppercase">
                RE%
              </div>
              <div className="text-sm font-black text-indigo-700 leading-tight">
                {formatPercentage(result.overall.re)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-1 rounded">
            Day {monthConfig.today}/{monthConfig.totalDays}
          </span>

          <button
            type="button"
            onClick={scrollToTop}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Scroll to Top"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Offscreen High-Resolution PDF Export Template with All Updated Features */}
      <div
        style={{
          position: 'fixed',
          left: '-99999px',
          top: '0',
          width: '1400px',
          zIndex: -9999,
          pointerEvents: 'none',
          opacity: 0,
        }}
        aria-hidden="true"
      >
        <div id="pdf-export-template">
          <PDFReportTemplate
            input={input}
            result={result}
            monthConfig={monthConfig}
            acqNote={acqNote}
            agentName={agentName}
          />
        </div>
      </div>
    </div>
  );
}
