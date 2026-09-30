import React from 'react';
import { CommissionInput, CommissionResult, ComponentInput } from '../features/commission/commission.types';
import { COMMISSION_WEIGHTS, UNITS } from '../features/commission/commission.constants';
import { formatPercentage } from '../features/commission/commission.utils';
import { Zap, Building2, Smartphone, Wifi, Layers, Boxes, Sigma } from 'lucide-react';
import { NewsTickerNote } from './NewsTickerNote';

export interface CommissionMatrixProps {
  input: CommissionInput;
  result: CommissionResult;
  onChange: (updater: (prev: CommissionInput) => CommissionInput) => void;
  acqNote: string;
  onAcqNoteChange: (val: string) => void;
}

interface ColumnTheme {
  accentDot: string;
  subHeaderBg: string;
  titleColor: string;
  badgeBg: string;
  badgeText: string;
  unitColor: string;
  focusRing: string;
  contribBg: string;
  contribBorder: string;
  contribText: string;
}

export interface ColumnConfig {
  id: string;
  category: string;
  categoryWeight: string;
  subTitle: string;
  weight: number;
  weightLabel: string;
  unit: string;
  theme: ColumnTheme;
  isSubBox?: boolean;
  isSummary?: boolean;
  getter: (input: CommissionInput) => ComponentInput;
  setter?: (prev: CommissionInput, val: ComponentInput) => CommissionInput;
  resultGetter: (result: CommissionResult) => { 
    achievement: number | null; 
    vs?: number | null; 
    re?: number | null; 
    contribution: number | null; 
    missing: number | null 
  };
}

// Static columns definition - created ONCE, avoiding garbage collection overhead on every render
export const MATRIX_COLUMNS: ColumnConfig[] = [
  // --- ACQUISITION: 3 SUB-BOXES (Low, High, Cash) + 1 TOTAL ACQUISITION BOX ---
  {
    id: 'acq-low',
    category: 'Acquisition',
    categoryWeight: '60%',
    subTitle: 'Low',
    weight: 0,
    weightLabel: '',
    unit: UNITS.ACQUISITION_LOW,
    isSubBox: true,
    theme: {
      accentDot: 'bg-rose-500',
      subHeaderBg: 'bg-rose-50/50 hover:bg-rose-50/70 border-t-2 border-t-rose-400',
      titleColor: 'text-rose-950',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-700',
      unitColor: 'text-rose-700/80',
      focusRing: 'focus:ring-rose-500 focus:border-rose-500',
      contribBg: 'bg-rose-50/90',
      contribBorder: 'border-rose-200',
      contribText: 'text-rose-700',
    },
    getter: (inp) => inp.acquisition.low,
    setter: (prev, val) => ({
      ...prev,
      acquisition: { ...prev.acquisition, low: val },
    }),
    resultGetter: (res) => res.acquisition.low,
  },
  {
    id: 'acq-high',
    category: 'Acquisition',
    categoryWeight: '60%',
    subTitle: 'High',
    weight: 0,
    weightLabel: '',
    unit: UNITS.ACQUISITION_HIGH,
    isSubBox: true,
    theme: {
      accentDot: 'bg-red-600',
      subHeaderBg: 'bg-red-50/50 hover:bg-red-50/70 border-t-2 border-t-red-500',
      titleColor: 'text-red-950',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
      unitColor: 'text-red-700/80',
      focusRing: 'focus:ring-red-500 focus:border-red-500',
      contribBg: 'bg-red-50/90',
      contribBorder: 'border-red-200',
      contribText: 'text-red-700',
    },
    getter: (inp) => inp.acquisition.high,
    setter: (prev, val) => ({
      ...prev,
      acquisition: { ...prev.acquisition, high: val },
    }),
    resultGetter: (res) => res.acquisition.high,
  },
  {
    id: 'acq-cash',
    category: 'Acquisition',
    categoryWeight: '60%',
    subTitle: 'Cash',
    weight: 0,
    weightLabel: '',
    unit: UNITS.ACQUISITION_CASH,
    isSubBox: true,
    theme: {
      accentDot: 'bg-orange-600',
      subHeaderBg: 'bg-orange-50/50 hover:bg-orange-50/70 border-t-2 border-t-orange-400',
      titleColor: 'text-orange-950',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800',
      unitColor: 'text-orange-800/80',
      focusRing: 'focus:ring-orange-500 focus:border-orange-500',
      contribBg: 'bg-orange-50/90',
      contribBorder: 'border-orange-200',
      contribText: 'text-orange-700',
    },
    getter: (inp) => inp.acquisition.cash,
    setter: (prev, val) => ({
      ...prev,
      acquisition: { ...prev.acquisition, cash: val },
    }),
    resultGetter: (res) => res.acquisition.cash,
  },
  {
    id: 'acq-total',
    category: 'Acquisition',
    categoryWeight: '60%',
    subTitle: 'Total Acq',
    weight: COMMISSION_WEIGHTS.ACQUISITION,
    weightLabel: 'Sum 60%',
    unit: UNITS.ACQUISITION_TOTAL,
    isSummary: true,
    theme: {
      accentDot: 'bg-[#E60000]',
      subHeaderBg: 'bg-gradient-to-b from-red-100/90 via-red-50/90 to-red-50/70 border-t-2 border-t-[#E60000]',
      titleColor: 'text-red-950 font-black',
      badgeBg: 'bg-[#E60000]',
      badgeText: 'text-white',
      unitColor: 'text-red-700/90',
      focusRing: 'focus:ring-[#E60000] focus:border-[#E60000]',
      contribBg: 'bg-red-100',
      contribBorder: 'border-red-300',
      contribText: 'text-[#E60000]',
    },
    getter: (inp) => ({
      target: ((inp.acquisition.low.target ?? 0) + (inp.acquisition.high.target ?? 0) + (inp.acquisition.cash.target ?? 0)) || null,
      actual: ((inp.acquisition.low.actual ?? 0) + (inp.acquisition.high.actual ?? 0) + (inp.acquisition.cash.actual ?? 0)) || null,
    }),
    resultGetter: (res) => res.acquisition.total,
  },

  // --- ENTERPRISE: 2 SUB-COLUMNS (Accounts 5%, Lines 5%) ---
  {
    id: 'ent-accounts',
    category: 'Enterprise',
    categoryWeight: '10%',
    subTitle: 'Accounts',
    weight: COMMISSION_WEIGHTS.ENTERPRISE_ACCOUNTS,
    weightLabel: '5%',
    unit: UNITS.ENTERPRISE_ACCOUNTS,
    theme: {
      accentDot: 'bg-indigo-600',
      subHeaderBg: 'bg-indigo-50/50 hover:bg-indigo-50/70 border-t-2 border-t-indigo-400',
      titleColor: 'text-indigo-950',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-700',
      unitColor: 'text-indigo-700/80',
      focusRing: 'focus:ring-indigo-500 focus:border-indigo-500',
      contribBg: 'bg-indigo-50/90',
      contribBorder: 'border-indigo-200',
      contribText: 'text-indigo-700',
    },
    getter: (inp) => inp.enterprise.accounts,
    setter: (prev, val) => ({
      ...prev,
      enterprise: { ...prev.enterprise, accounts: val },
    }),
    resultGetter: (res) => res.enterprise.accounts,
  },
  {
    id: 'ent-lines',
    category: 'Enterprise',
    categoryWeight: '10%',
    subTitle: 'Lines',
    weight: COMMISSION_WEIGHTS.ENTERPRISE_LINES,
    weightLabel: '5%',
    unit: UNITS.ENTERPRISE_LINES,
    theme: {
      accentDot: 'bg-blue-600',
      subHeaderBg: 'bg-blue-50/50 hover:bg-blue-50/70 border-t-2 border-t-blue-400',
      titleColor: 'text-blue-950',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
      unitColor: 'text-blue-700/80',
      focusRing: 'focus:ring-blue-500 focus:border-blue-500',
      contribBg: 'bg-blue-50/90',
      contribBorder: 'border-blue-200',
      contribText: 'text-blue-700',
    },
    getter: (inp) => inp.enterprise.lines,
    setter: (prev, val) => ({
      ...prev,
      enterprise: { ...prev.enterprise, lines: val },
    }),
    resultGetter: (res) => res.enterprise.lines,
  },

  // --- TERMINAL: 1 COLUMN (10%) ---
  {
    id: 'terminal',
    category: 'Terminal',
    categoryWeight: '10%',
    subTitle: 'Sales Value',
    weight: COMMISSION_WEIGHTS.TERMINAL,
    weightLabel: '10%',
    unit: UNITS.TERMINAL,
    theme: {
      accentDot: 'bg-amber-600',
      subHeaderBg: 'bg-amber-50/50 hover:bg-amber-50/70 border-t-2 border-t-amber-400',
      titleColor: 'text-amber-950',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      unitColor: 'text-amber-800/80',
      focusRing: 'focus:ring-amber-500 focus:border-amber-500',
      contribBg: 'bg-amber-50/90',
      contribBorder: 'border-amber-200',
      contribText: 'text-amber-700',
    },
    getter: (inp) => inp.terminal,
    setter: (prev, val) => ({ ...prev, terminal: val }),
    resultGetter: (res) => res.terminal,
  },

  // --- FIXED: 2 SUB-COLUMNS (DSL 16%, Connectivity 4%) ---
  {
    id: 'fixed-dsl',
    category: 'Fixed',
    categoryWeight: '20%',
    subTitle: 'DSL',
    weight: COMMISSION_WEIGHTS.DSL,
    weightLabel: '16%',
    unit: UNITS.DSL,
    theme: {
      accentDot: 'bg-emerald-600',
      subHeaderBg: 'bg-emerald-50/50 hover:bg-emerald-50/70 border-t-2 border-t-emerald-400',
      titleColor: 'text-emerald-950',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      unitColor: 'text-emerald-800/80',
      focusRing: 'focus:ring-emerald-500 focus:border-emerald-500',
      contribBg: 'bg-emerald-50/90',
      contribBorder: 'border-emerald-200',
      contribText: 'text-emerald-700',
    },
    getter: (inp) => inp.fixed.dsl,
    setter: (prev, val) => ({
      ...prev,
      fixed: { ...prev.fixed, dsl: val },
    }),
    resultGetter: (res) => res.fixed.dsl,
  },
  {
    id: 'fixed-conn',
    category: 'Fixed',
    categoryWeight: '20%',
    subTitle: 'Connectivity',
    weight: COMMISSION_WEIGHTS.CONNECTIVITY,
    weightLabel: '4%',
    unit: UNITS.CONNECTIVITY,
    theme: {
      accentDot: 'bg-teal-600',
      subHeaderBg: 'bg-teal-50/50 hover:bg-teal-50/70 border-t-2 border-t-teal-400',
      titleColor: 'text-teal-950',
      badgeBg: 'bg-teal-100',
      badgeText: 'text-teal-800',
      unitColor: 'text-teal-800/80',
      focusRing: 'focus:ring-teal-500 focus:border-teal-500',
      contribBg: 'bg-teal-50/90',
      contribBorder: 'border-teal-200',
      contribText: 'text-teal-700',
    },
    getter: (inp) => inp.fixed.connectivity,
    setter: (prev, val) => ({
      ...prev,
      fixed: { ...prev.fixed, connectivity: val },
    }),
    resultGetter: (res) => res.fixed.connectivity,
  },
];

/**
 * Reusable Matrix Input Cell for Row 1 (Target) & Row 2 (Actual).
 */
interface MatrixInputCellProps {
  col: ColumnConfig;
  value: number | null;
  onChange?: (val: string) => void;
  summaryValue?: number | null;
  isTarget?: boolean;
}

const MatrixInputCell = React.memo(function MatrixInputCell({
  col,
  value,
  onChange,
  summaryValue,
  isTarget = false,
}: MatrixInputCellProps) {
  if (col.isSummary) {
    return (
      <td className="p-2 sm:p-2.5 border-r border-slate-200 align-top bg-red-50/40">
        <div className="flex flex-col items-center justify-center p-1.5 sm:p-2 bg-gradient-to-b from-red-100/90 to-red-50/80 border border-red-300 rounded-lg text-center shadow-2xs min-h-[58px] sm:min-h-[64px]">
          <div className="text-sm sm:text-base font-black text-red-950">
            {summaryValue !== null && summaryValue !== undefined ? (
              summaryValue.toLocaleString()
            ) : (
              <span className="text-slate-400 font-normal">0</span>
            )}
          </div>
        </div>
      </td>
    );
  }

  const isZero = isTarget && value === 0;
  const isNegative = value !== null && value < 0;

  return (
    <td className="p-2 sm:p-2.5 border-r last:border-r-0 border-slate-200 align-top">
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0"
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full text-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all focus:outline-none focus:ring-2 print:hidden export-hide-input ${
            isZero || isNegative
              ? 'border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500'
              : `border-slate-300 bg-white text-slate-900 ${col.theme.focusRing}`
          }`}
        />
        <div className="hidden print:flex export-show-text items-center justify-center text-center font-bold text-xs sm:text-sm text-slate-900 py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg min-h-[34px] sm:min-h-[38px]">
          {value !== null ? value : <span className="text-slate-400 font-normal">0</span>}
        </div>
        {col.unit ? (
          <span className="block text-[10px] text-slate-400 text-center mt-0.5 sm:mt-1">
            {col.unit}
          </span>
        ) : null}
        {isZero && (
          <span className="block text-[9px] sm:text-[10px] text-[#E60000] text-center font-semibold print:hidden export-hide-input">
            Must be &gt; 0
          </span>
        )}
      </div>
    </td>
  );
});

/**
 * Reusable Matrix Percentage Cell for Row 3 (Percentages: VS%, RE%, Contributions & Missing).
 */
interface MatrixPercentageCellProps {
  col: ColumnConfig;
  res: { 
    achievement: number | null; 
    vs?: number | null; 
    re?: number | null; 
    contribution: number | null; 
    missing: number | null 
  };
}

const MatrixPercentageCell = React.memo(function MatrixPercentageCell({
  col,
  res,
}: MatrixPercentageCellProps) {
  const isExceeded = res.missing === 0 && res.achievement !== null && res.achievement >= 100;
  const vs = res.vs ?? res.achievement;
  const re = res.re ?? null;

  return (
    <td className={`p-2 sm:p-2.5 border-r last:border-r-0 border-slate-200 align-top ${col.isSummary ? 'bg-red-50/40' : ''}`}>
      <div className="flex flex-col gap-1.5 sm:gap-2 h-full justify-between">
        {/* VS% (Actual Achievement) Box */}
        <div className="bg-white border border-slate-200 rounded-lg p-1.5 sm:p-2 text-center shadow-2xs min-h-[48px] flex flex-col justify-center">
          <div className="flex items-center justify-between px-0.5 mb-0.5">
            <span className="text-[9px] uppercase font-black text-slate-800 tracking-wider">VS%</span>
            <span className="text-[8px] font-semibold text-slate-400">Actual</span>
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">
            {formatPercentage(vs)}
          </span>
        </div>

        {/* RE% (Run-Rate Expected by Month End) Box */}
        <div className="bg-gradient-to-b from-indigo-50/90 to-indigo-50/40 border border-indigo-200 rounded-lg p-1.5 sm:p-2 text-center shadow-2xs min-h-[48px] flex flex-col justify-center">
          <div className="flex items-center justify-between px-0.5 mb-0.5">
            <span className="text-[9px] uppercase font-black text-indigo-700 tracking-wider">RE%</span>
            <span className="text-[8px] font-bold text-indigo-500">Expected</span>
          </div>
          <span className="text-xs sm:text-sm font-black text-indigo-900 block leading-tight">
            {formatPercentage(re)}
          </span>
        </div>

        {/* Contribution % Box - Equal height across all columns */}
        {!col.isSubBox ? (
          <div className={`${col.theme.contribBg} border ${col.theme.contribBorder} rounded-lg p-1.5 sm:p-2 text-center shadow-2xs min-h-[52px] flex flex-col justify-center`}>
            <span className={`text-[9px] uppercase font-extrabold ${col.theme.contribText} block mb-0.5`}>
              Contribution %
            </span>
            <span className={`text-xs sm:text-sm font-extrabold ${col.theme.contribText} block leading-tight`}>
              {formatPercentage(res.contribution)}
            </span>
            {!col.isSummary && (
              <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-0.5 font-semibold">
                of {col.weightLabel}
              </span>
            )}
          </div>
        ) : (
          <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-lg p-1.5 sm:p-2 text-center min-h-[52px] flex flex-col justify-center">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
              Contribution %
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 block leading-tight">
              Included in Total
            </span>
          </div>
        )}

        {/* Missing Box */}
        <div className="bg-white border border-slate-200 rounded-lg p-1.5 sm:p-2 text-center shadow-2xs min-h-[48px] flex flex-col justify-center">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
            Missing
          </span>
          <span
            className={`text-xs sm:text-sm font-bold block leading-tight ${
              res.missing !== null
                ? res.missing > 0
                  ? 'text-[#E60000]'
                  : 'text-emerald-600'
                : 'text-slate-400'
            }`}
          >
            {res.missing !== null ? (
              res.missing > 0 ? (
                `-${res.missing.toLocaleString()}`
              ) : (
                isExceeded ? '✓ Met' : '0'
              )
            ) : (
              '—'
            )}
          </span>
          {res.missing !== null && (
            <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5">
              {col.unit || 'Points'}
            </span>
          )}
        </div>
      </div>
    </td>
  );
});

export function CommissionMatrix({ input, result, onChange, acqNote, onAcqNoteChange }: CommissionMatrixProps) {
  const handleInputChange = (col: ColumnConfig, field: 'target' | 'actual', rawValue: string) => {
    if (!col.setter) return;
    const num = rawValue === '' ? null : Number(rawValue);
    onChange((prev) => {
      const current = col.getter(prev);
      return col.setter!(prev, { ...current, [field]: num });
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Mobile Swipe Hint Bar */}
      <div className="md:hidden flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-medium">
        <span>Swipe horizontally to view all metrics</span>
        <span className="text-[#E60000] font-semibold flex items-center gap-1">
          Acquisition (3 Sub-Boxes + Sum) • 9 Columns &rarr;
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px] sm:min-w-[1100px]">
          {/* Header Row: Main Categories & Weights */}
          <thead>
            {/* Top Categories grouping */}
            <tr className="border-b border-slate-200 text-xs">
              {/* Category Header Label Box */}
              <th className="p-2 sm:p-3.5 w-28 sm:w-44 text-center border-r border-slate-200 bg-slate-100 border-t-4 border-t-slate-400 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <div className="inline-flex items-center justify-center gap-1 sm:gap-1.5 font-black text-slate-700 uppercase tracking-wider text-[11px] sm:text-xs">
                  <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
                  <span>Category</span>
                </div>
              </th>

              {/* Acquisition Category Box (Spans 4 columns: Low, High, Cash, Total) */}
              <th colSpan={4} className="p-2 sm:p-2.5 text-center border-r border-slate-200 bg-gradient-to-b from-red-100/80 via-red-50/60 to-red-50/30 border-t-4 border-t-[#E60000]">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E60000] shrink-0" />
                  <span className="font-black text-red-950 text-xs sm:text-sm tracking-tight">Acquisition</span>
                  <span className="bg-[#E60000] text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                    Weight: 60%
                  </span>
                </div>
                
                {/* News Bar Marquee Note moving from Right to Left */}
                <div className="mt-1 flex items-center justify-center">
                  <NewsTickerNote
                    note={acqNote}
                    onNoteChange={onAcqNoteChange}
                    className="w-full max-w-[480px]"
                  />
                </div>
              </th>

              {/* Enterprise Category Box (2 cols) */}
              <th colSpan={2} className="p-2.5 sm:p-3.5 text-center border-r border-slate-200 bg-gradient-to-b from-indigo-100/80 via-indigo-50/60 to-indigo-50/30 border-t-4 border-t-indigo-600">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
                  <span className="font-black text-indigo-950 text-xs sm:text-sm tracking-tight">Enterprise</span>
                  <span className="bg-indigo-600 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs">
                    Total: 10%
                  </span>
                </div>
                <div className="text-indigo-800 font-semibold text-[10px] sm:text-[11px]">Accounts 5% • Lines 5%</div>
              </th>

              {/* Terminal Category Box (1 col) */}
              <th className="p-2.5 sm:p-3.5 text-center border-r border-slate-200 bg-gradient-to-b from-amber-100/80 via-amber-50/60 to-amber-50/30 border-t-4 border-t-amber-500">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                  <span className="font-black text-amber-950 text-xs sm:text-sm tracking-tight">Terminal</span>
                </div>
                <div className="inline-flex items-center gap-1 bg-amber-600 text-white font-extrabold text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs">
                  Weight: 10%
                </div>
              </th>

              {/* Fixed Category Box (2 cols) */}
              <th colSpan={2} className="p-2.5 sm:p-3.5 text-center bg-gradient-to-b from-emerald-100/80 via-emerald-50/60 to-emerald-50/30 border-t-4 border-t-emerald-600">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                  <span className="font-black text-emerald-950 text-xs sm:text-sm tracking-tight">Fixed</span>
                  <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs">
                    Total: 20%
                  </span>
                </div>
                <div className="text-emerald-800 font-semibold text-[10px] sm:text-[11px]">DSL 16% • Connectivity 4%</div>
              </th>
            </tr>

            {/* Sub-column Titles and Units (Component Boxes Row) */}
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-700">
              <th className="p-2 sm:p-3 text-center border-r border-slate-200 bg-slate-100 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <div className="inline-flex items-center justify-center gap-1 sm:gap-1.5 font-black text-slate-700 uppercase tracking-wider text-[11px] sm:text-xs">
                  <Boxes className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
                  <span>Component</span>
                </div>
              </th>

              {MATRIX_COLUMNS.map((col) => (
                <th
                  key={col.id}
                  className={`p-2 sm:p-2.5 text-center border-r last:border-r-0 border-slate-200 transition-colors ${col.theme.subHeaderBg}`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    {col.isSummary ? (
                      <Sigma className="w-3 h-3 text-[#E60000] shrink-0" />
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${col.theme.accentDot} shrink-0`}></span>
                    )}
                    <span className={`font-extrabold text-xs sm:text-sm ${col.theme.titleColor}`}>{col.subTitle}</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-normal flex items-center justify-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1 min-h-[16px]">
                    {col.weightLabel ? (
                      <span className={`font-extrabold px-1.5 sm:px-2 py-0.5 rounded-sm text-[9px] sm:text-[10px] ${col.theme.badgeBg} ${col.theme.badgeText}`}>
                        {col.weightLabel}
                      </span>
                    ) : null}
                    {col.weightLabel && col.unit ? (
                      <span className="text-slate-300">•</span>
                    ) : null}
                    {col.unit ? (
                      <span className={`text-[10px] sm:text-[11px] font-semibold ${col.theme.unitColor}`}>{col.unit}</span>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* ROW 1: Target */}
            <tr className="border-b border-slate-200 hover:bg-slate-50/70 transition-colors">
              <td className="p-2 sm:p-3 font-bold text-slate-900 border-r border-slate-200 bg-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-800 shrink-0"></span>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">Target</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-normal">Assigned target</div>
                  </div>
                </div>
              </td>
              {MATRIX_COLUMNS.map((col) => (
                <MatrixInputCell
                  key={col.id}
                  col={col}
                  isTarget={true}
                  value={col.getter(input).target}
                  summaryValue={result.acquisition.totalTarget}
                  onChange={(val) => handleInputChange(col, 'target', val)}
                />
              ))}
            </tr>

            {/* ROW 2: Actual / Achieve */}
            <tr className="border-b border-slate-200 hover:bg-slate-50/70 transition-colors">
              <td className="p-2 sm:p-3 font-bold text-slate-900 border-r border-slate-200 bg-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E60000] shrink-0"></span>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Actual</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-normal">Delivered result</div>
                  </div>
                </div>
              </td>
              {MATRIX_COLUMNS.map((col) => (
                <MatrixInputCell
                  key={col.id}
                  col={col}
                  isTarget={false}
                  value={col.getter(input).actual}
                  summaryValue={result.acquisition.totalActual}
                  onChange={(val) => handleInputChange(col, 'actual', val)}
                />
              ))}
            </tr>

            {/* ROW 3: Percentages (VS% & RE% & Contributions & Missing) */}
            <tr className="bg-slate-50/60">
              <td className="p-2 sm:p-3 font-bold text-slate-900 border-r border-slate-200 bg-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] align-top">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E60000] shrink-0"></span>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">VS% & RE%</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-normal">Actual & Expected Run-Rate</div>
                  </div>
                </div>
              </td>
              {MATRIX_COLUMNS.map((col) => (
                <MatrixPercentageCell
                  key={col.id}
                  col={col}
                  res={col.resultGetter(result)}
                />
              ))}
            </tr>

            {/* Parent Categories Summary Sub-Row with VS% and RE% totals */}
            <tr className="border-t-2 border-slate-200 bg-slate-50 text-xs">
              <td className="p-2 sm:p-3 font-bold text-slate-700 border-r border-slate-200 text-center bg-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Category Total
              </td>
              {/* Acquisition Combined Total */}
              <td colSpan={4} className="p-2 sm:p-2.5 text-center border-r border-slate-200 bg-red-50/70 font-bold">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-red-950 font-bold text-xs">Total Acquisition:</span>
                  <span className="text-xs sm:text-sm font-black text-[#E60000]">
                    VS: {formatPercentage(result.acquisition.total.contribution)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs sm:text-sm font-black text-indigo-700">
                    RE: {formatPercentage(result.acquisition.total.re !== null && result.acquisition.total.re !== undefined ? result.acquisition.total.re * COMMISSION_WEIGHTS.ACQUISITION : null)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-red-700 font-semibold">(Weight: 60%)</span>
                </div>
                <div className="text-[10px] text-red-800/80 font-medium mt-0.5">
                  Low + High + Cash &rarr; Target: {result.acquisition.totalTarget ?? 0} • Actual: {result.acquisition.totalActual ?? 0} Points
                </div>
              </td>
              {/* Enterprise Combined Total */}
              <td colSpan={2} className="p-2 sm:p-2.5 text-center border-r border-slate-200 bg-indigo-50/70">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-indigo-900 font-bold text-xs">Enterprise:</span>
                  <span className="text-xs sm:text-sm font-black text-indigo-700">
                    VS: {formatPercentage(result.enterprise.totalContribution)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs sm:text-sm font-black text-indigo-900">
                    RE: {formatPercentage(result.enterprise.totalRE)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-indigo-600 font-bold">(10%)</span>
                </div>
              </td>
              {/* Terminal Total */}
              <td className="p-2 sm:p-2.5 text-center border-r border-slate-200 bg-amber-50/70 font-bold">
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-amber-950 font-bold text-xs">Terminal:</span>
                    <span className="text-[9px] sm:text-[10px] text-amber-800 font-semibold">(10%)</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-amber-700">
                      VS: {formatPercentage(result.terminal.contribution)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs sm:text-sm font-black text-amber-950">
                      RE: {formatPercentage(result.terminal.re !== null && result.terminal.re !== undefined ? result.terminal.re * COMMISSION_WEIGHTS.TERMINAL : null)}
                    </span>
                  </div>
                </div>
              </td>
              {/* Fixed Combined Total */}
              <td colSpan={2} className="p-2 sm:p-2.5 text-center bg-emerald-50/70">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-emerald-900 font-bold text-xs">Fixed:</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-700">
                    VS: {formatPercentage(result.fixed.totalContribution)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-900">
                    RE: {formatPercentage(result.fixed.totalRE)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold">(20%)</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
