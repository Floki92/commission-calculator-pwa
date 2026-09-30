export interface ComponentInput {
  target: number | null;
  actual: number | null;
}

export interface MonthProgressConfig {
  today: number;
  totalDays: number;
}

export interface ComponentResult {
  achievement: number | null; // VS% = (Actual / Target) * 100
  vs?: number | null; // Explicit VS% alias
  re?: number | null; // RE% = VS% * (Total Month Days / Today)
  contribution: number | null;
  missing: number | null;
}

export interface AcquisitionInput {
  low: ComponentInput;
  high: ComponentInput;
  cash: ComponentInput;
}

export interface AcquisitionResult {
  low: ComponentResult;
  high: ComponentResult;
  cash: ComponentResult;
  total: ComponentResult;
  totalTarget: number | null;
  totalActual: number | null;
}

export interface EnterpriseInput {
  accounts: ComponentInput;
  lines: ComponentInput;
}

export interface EnterpriseResult {
  accounts: ComponentResult;
  lines: ComponentResult;
  totalContribution: number | null;
  totalRE?: number | null;
}

export interface FixedInput {
  dsl: ComponentInput;
  connectivity: ComponentInput;
}

export interface FixedResult {
  dsl: ComponentResult;
  connectivity: ComponentResult;
  totalContribution: number | null;
  totalRE?: number | null;
}

export interface CommissionInput {
  acquisition: AcquisitionInput;
  enterprise: EnterpriseInput;
  terminal: ComponentInput;
  fixed: FixedInput;
  voice?: ComponentInput; // Optional legacy compatibility
}

export interface OverallResult {
  achievement: number | null; // Overall VS%
  vs?: number | null; // Overall VS%
  re?: number | null; // Overall RE% = Overall VS% * (Total Month Days / Today)
  isComplete: boolean;
}

export interface CommissionResult {
  acquisition: AcquisitionResult;
  voice: ComponentResult; // Backward-compatible alias to acquisition.total
  enterprise: EnterpriseResult;
  terminal: ComponentResult;
  fixed: FixedResult;
  overall: OverallResult;
}
