import { 
  CommissionInput, 
  CommissionResult, 
  ComponentInput, 
  ComponentResult, 
  AcquisitionInput,
  AcquisitionResult,
  EnterpriseInput, 
  EnterpriseResult,
  FixedInput,
  FixedResult,
  MonthProgressConfig
} from './commission.types';
import { COMMISSION_WEIGHTS } from './commission.constants';

export function calculateRunRate(
  vsPercentage: number | null,
  today: number,
  totalMonthDays: number
): number | null {
  if (vsPercentage === null || today <= 0 || totalMonthDays <= 0) return null;
  return vsPercentage * (totalMonthDays / today);
}

function calculateComponent(
  input: ComponentInput, 
  weight: number,
  monthConfig?: MonthProgressConfig
): ComponentResult {
  if (input.target === null || input.actual === null) {
    return { achievement: null, vs: null, re: null, contribution: null, missing: null };
  }
  
  if (input.target <= 0) {
    return { achievement: null, vs: null, re: null, contribution: null, missing: null };
  }

  if (input.actual < 0) {
    return { achievement: null, vs: null, re: null, contribution: null, missing: null };
  }

  // VS% = (Actual / Target) * 100
  const achievement = (input.actual / input.target) * 100;
  const vs = achievement;
  
  // RE% = VS% * (Total Month Days / Today)
  const re = monthConfig ? calculateRunRate(vs, monthConfig.today, monthConfig.totalDays) : null;
  
  const contribution = achievement * weight;
  
  // Calculate missing value (floor to 0 if actual exceeds target)
  const missing = Math.max(0, input.target - input.actual);

  return { achievement, vs, re, contribution, missing };
}

function calculateAcquisition(
  input: AcquisitionInput,
  monthConfig?: MonthProgressConfig
): AcquisitionResult {
  // Calculate individual achievements and missing metrics for Low, High, Cash
  const low = calculateComponent(input.low, 0, monthConfig);
  const high = calculateComponent(input.high, 0, monthConfig);
  const cash = calculateComponent(input.cash, 0, monthConfig);

  // Determine if any target or actual was provided
  const hasAnyTarget = input.low.target !== null || input.high.target !== null || input.cash.target !== null;
  const totalTarget = hasAnyTarget
    ? (input.low.target ?? 0) + (input.high.target ?? 0) + (input.cash.target ?? 0)
    : null;

  const hasAnyActual = input.low.actual !== null || input.high.actual !== null || input.cash.actual !== null;
  const totalActual = hasAnyActual
    ? (input.low.actual ?? 0) + (input.high.actual ?? 0) + (input.cash.actual ?? 0)
    : null;

  // Calculate Total Acquisition with 60% weight
  const total = calculateComponent(
    { target: totalTarget, actual: totalActual },
    COMMISSION_WEIGHTS.ACQUISITION,
    monthConfig
  );

  return {
    low,
    high,
    cash,
    total,
    totalTarget,
    totalActual,
  };
}

function calculateEnterprise(
  input: EnterpriseInput,
  monthConfig?: MonthProgressConfig
): EnterpriseResult {
  const accounts = calculateComponent(input.accounts, COMMISSION_WEIGHTS.ENTERPRISE_ACCOUNTS, monthConfig);
  const lines = calculateComponent(input.lines, COMMISSION_WEIGHTS.ENTERPRISE_LINES, monthConfig);

  const isComplete = accounts.contribution !== null && lines.contribution !== null;
  const totalContribution = isComplete ? (accounts.contribution! + lines.contribution!) : null;
  const totalRE = (isComplete && monthConfig) 
    ? calculateRunRate(totalContribution, monthConfig.today, monthConfig.totalDays) 
    : null;

  return { accounts, lines, totalContribution, totalRE };
}

function calculateFixed(
  input: FixedInput,
  monthConfig?: MonthProgressConfig
): FixedResult {
  const dsl = calculateComponent(input.dsl, COMMISSION_WEIGHTS.DSL, monthConfig);
  const connectivity = calculateComponent(input.connectivity, COMMISSION_WEIGHTS.CONNECTIVITY, monthConfig);

  const isComplete = dsl.contribution !== null && connectivity.contribution !== null;
  const totalContribution = isComplete ? (dsl.contribution! + connectivity.contribution!) : null;
  const totalRE = (isComplete && monthConfig) 
    ? calculateRunRate(totalContribution, monthConfig.today, monthConfig.totalDays) 
    : null;

  return { dsl, connectivity, totalContribution, totalRE };
}

export function calculateCommission(
  input: CommissionInput,
  monthConfig?: MonthProgressConfig
): CommissionResult {
  // Support legacy voice input gracefully if acquisition is not provided
  const acquisitionInput: AcquisitionInput = input.acquisition || {
    low: { target: input.voice?.target ?? null, actual: input.voice?.actual ?? null },
    high: { target: null, actual: null },
    cash: { target: null, actual: null },
  };

  const acquisition = calculateAcquisition(acquisitionInput, monthConfig);
  const enterprise = calculateEnterprise(input.enterprise, monthConfig);
  const terminal = calculateComponent(input.terminal, COMMISSION_WEIGHTS.TERMINAL, monthConfig);
  const fixed = calculateFixed(input.fixed, monthConfig);

  const isComplete = 
    acquisition.total.contribution !== null && 
    enterprise.totalContribution !== null && 
    terminal.contribution !== null && 
    fixed.totalContribution !== null;

  let overallAchievement: number | null = null;
  let overallRE: number | null = null;

  if (isComplete) {
    overallAchievement = 
      acquisition.total.contribution! + 
      enterprise.totalContribution! + 
      terminal.contribution! + 
      fixed.totalContribution!;

    if (monthConfig) {
      overallRE = calculateRunRate(overallAchievement, monthConfig.today, monthConfig.totalDays);
    }
  }

  return {
    acquisition,
    voice: acquisition.total, // Backward-compatible alias
    enterprise,
    terminal,
    fixed,
    overall: {
      achievement: overallAchievement,
      vs: overallAchievement,
      re: overallRE,
      isComplete
    }
  };
}
