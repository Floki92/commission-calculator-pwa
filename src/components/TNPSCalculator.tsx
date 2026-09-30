import React, { useState, useEffect, useId } from 'react';
import { RotateCcw } from 'lucide-react';

interface TNPSState {
  promoters: number | null;
  passive: number | null;
  detractors: number | null;
  customTotal: number | null;
}

const TNPS_STORAGE_KEY = 'vodafone_tnps_state_v1';

export function getStoredTNPSState(): TNPSState {
  const defaultState: TNPSState = {
    promoters: null,
    passive: null,
    detractors: null,
    customTotal: null,
  };
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(TNPS_STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      promoters: typeof parsed?.promoters === 'number' ? parsed.promoters : null,
      passive: typeof parsed?.passive === 'number' ? parsed.passive : null,
      detractors: typeof parsed?.detractors === 'number' ? parsed.detractors : null,
      customTotal: typeof parsed?.customTotal === 'number' ? parsed.customTotal : null,
    };
  } catch (err) {
    console.error('Error reading saved TNPS state:', err);
    return defaultState;
  }
}

export function TNPSCalculator() {
  const [values, setValues] = useState<TNPSState>(getStoredTNPSState);

  // Save changes to device local storage
  useEffect(() => {
    try {
      localStorage.setItem(TNPS_STORAGE_KEY, JSON.stringify(values));
    } catch (err) {
      console.error('Error saving TNPS state:', err);
    }
  }, [values]);

  const p = values.promoters ?? 0;
  const pass = values.passive ?? 0;
  const d = values.detractors ?? 0;

  // Auto-calculated total from the 3 components
  const autoTotal = (values.promoters !== null || values.passive !== null || values.detractors !== null)
    ? p + pass + d
    : null;

  const total = values.customTotal !== null ? values.customTotal : autoTotal;

  // Formula: (Promoters - Detractors) / Total * 100
  let tnpsScore: number | null = null;
  if (total !== null && total > 0 && (values.promoters !== null || values.detractors !== null)) {
    tnpsScore = ((p - d) / total) * 100;
  }

  const pPct = total && total > 0 ? (p / total) * 100 : 0;
  const passPct = total && total > 0 ? (pass / total) * 100 : 0;
  const dPct = total && total > 0 ? (d / total) * 100 : 0;

  const handleReset = () => {
    setValues({
      promoters: null,
      passive: null,
      detractors: null,
      customTotal: null,
    });
    try {
      localStorage.removeItem(TNPS_STORAGE_KEY);
    } catch (err) {
      console.error('Error clearing saved TNPS state:', err);
    }
  };

  const pInputId = useId();
  const passInputId = useId();
  const dInputId = useId();
  const totalInputId = useId();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3.5 sm:p-5 lg:p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 sm:pb-3 mb-2 sm:mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E60000]"></span>
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">TNPS Calculator</h3>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
            (Promoters - Detractors) / Total
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            className="text-[10px] sm:text-[11px] font-medium text-slate-500 hover:text-[#E60000] transition-colors p-1 rounded-md hover:bg-red-50 flex items-center gap-1"
            title="Clear TNPS inputs"
            aria-label="Clear TNPS inputs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 4 Inputs Grid: Promoters, Passive, Detractors, Total - 2x2 on mobile, 4 cols on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2 mb-2.5 sm:mb-4">
        {/* Promoters */}
        <div className="flex flex-col">
          <label htmlFor={pInputId} className="text-[11px] font-bold text-emerald-700 mb-1 flex items-center gap-1 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">Promoters</span>
          </label>
          <input
            id={pInputId}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            value={values.promoters ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              setValues((prev) => ({ ...prev, promoters: val }));
            }}
            className="w-full text-center px-2 py-2 text-sm sm:text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50/30 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 print:hidden export-hide-input min-h-[40px] sm:min-h-0"
          />
          <div className="hidden print:flex export-show-text items-center justify-center font-bold text-xs py-1.5 px-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-950 min-h-[32px]">
            {values.promoters !== null ? values.promoters : <span className="text-emerald-400 font-normal">0</span>}
          </div>
        </div>

        {/* Passive */}
        <div className="flex flex-col">
          <label htmlFor={passInputId} className="text-[11px] font-bold text-amber-700 mb-1 flex items-center gap-1 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
            <span className="truncate">Passive</span>
          </label>
          <input
            id={passInputId}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            value={values.passive ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              setValues((prev) => ({ ...prev, passive: val }));
            }}
            className="w-full text-center px-2 py-2 text-sm sm:text-xs font-bold rounded-lg border border-amber-200 bg-amber-50/30 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 print:hidden export-hide-input min-h-[40px] sm:min-h-0"
          />
          <div className="hidden print:flex export-show-text items-center justify-center font-bold text-xs py-1.5 px-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-950 min-h-[32px]">
            {values.passive !== null ? values.passive : <span className="text-amber-400 font-normal">0</span>}
          </div>
        </div>

        {/* Detractors */}
        <div className="flex flex-col">
          <label htmlFor={dInputId} className="text-[11px] font-bold text-[#E60000] mb-1 flex items-center gap-1 truncate">
            <span className="w-2 h-2 rounded-full bg-[#E60000] shrink-0"></span>
            <span className="truncate">Detractors</span>
          </label>
          <input
            id={dInputId}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            value={values.detractors ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              setValues((prev) => ({ ...prev, detractors: val }));
            }}
            className="w-full text-center px-2 py-2 text-sm sm:text-xs font-bold rounded-lg border border-red-200 bg-red-50/30 text-red-950 focus:outline-none focus:ring-2 focus:ring-[#E60000] print:hidden export-hide-input min-h-[40px] sm:min-h-0"
          />
          <div className="hidden print:flex export-show-text items-center justify-center font-bold text-xs py-1.5 px-2 rounded-lg border border-red-200 bg-red-50 text-red-950 min-h-[32px]">
            {values.detractors !== null ? values.detractors : <span className="text-red-400 font-normal">0</span>}
          </div>
        </div>

        {/* Total (Sum of 3 or custom) */}
        <div className="flex flex-col">
          <label htmlFor={totalInputId} className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between truncate">
            <span className="truncate">Total Responses</span>
            {values.customTotal !== null && (
              <span className="text-[9px] text-slate-400 font-normal print:hidden export-hide-input">custom</span>
            )}
          </label>
          <input
            id={totalInputId}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder={autoTotal !== null ? String(autoTotal) : '0'}
            value={values.customTotal ?? (autoTotal !== null ? autoTotal : '')}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              setValues((prev) => ({ ...prev, customTotal: val }));
            }}
            className="w-full text-center px-2 py-2 text-sm sm:text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 print:hidden export-hide-input min-h-[40px] sm:min-h-0"
          />
          <div className="hidden print:flex export-show-text items-center justify-center font-bold text-xs py-1.5 px-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 min-h-[32px]">
            {total !== null ? total : <span className="text-slate-400 font-normal">0</span>}
          </div>
        </div>
      </div>

      {/* Result Display & Distribution Bar */}
      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TNPS Score
            </span>
            <span className="text-[11px] text-slate-500">
              {total && total > 0 ? `(${p} - ${d}) / ${total}` : 'Enter response counts'}
            </span>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black tracking-tight ${
                tnpsScore === null
                  ? 'text-slate-400'
                  : tnpsScore > 0
                  ? 'text-emerald-600'
                  : tnpsScore < 0
                  ? 'text-[#E60000]'
                  : 'text-slate-800'
              }`}
            >
              {tnpsScore !== null
                ? `${tnpsScore > 0 ? '+' : ''}${tnpsScore.toFixed(1)}%`
                : '—'}
            </span>
          </div>
        </div>

        {/* Visual Distribution Segment Bar */}
        {total !== null && total > 0 && (
          <div className="space-y-1 mt-1">
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${pPct}%` }}
                className="bg-emerald-500 h-full transition-all duration-300"
                title={`Promoters: ${pPct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${passPct}%` }}
                className="bg-amber-400 h-full transition-all duration-300"
                title={`Passive: ${passPct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${dPct}%` }}
                className="bg-[#E60000] h-full transition-all duration-300"
                title={`Detractors: ${dPct.toFixed(1)}%`}
              />
            </div>

            <div className="flex justify-between text-[10px] font-semibold text-slate-500 px-0.5">
              <span className="text-emerald-700">P: {pPct.toFixed(0)}%</span>
              <span className="text-amber-700">Pass: {passPct.toFixed(0)}%</span>
              <span className="text-[#E60000]">D: {dPct.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
