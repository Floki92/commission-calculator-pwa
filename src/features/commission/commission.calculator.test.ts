import { describe, it, expect } from 'vitest';
import { calculateCommission } from './commission.calculator';
import { CommissionInput } from './commission.types';

describe('Commission Calculator', () => {
  const defaultValidInput: CommissionInput = {
    acquisition: {
      low: { target: 40, actual: 40 },
      high: { target: 30, actual: 30 },
      cash: { target: 30, actual: 30 },
    },
    enterprise: {
      accounts: { target: 100, actual: 100 },
      lines: { target: 100, actual: 100 },
    },
    terminal: { target: 100, actual: 100 },
    fixed: {
      dsl: { target: 100, actual: 100 },
      connectivity: { target: 100, actual: 100 },
    }
  };

  it('1. All targets and actuals equal target => overall 100%', () => {
    const result = calculateCommission(defaultValidInput);
    expect(result.overall.achievement).toBe(100);
    expect(result.overall.isComplete).toBe(true);
    expect(result.acquisition.totalTarget).toBe(100);
    expect(result.acquisition.totalActual).toBe(100);
  });

  it('2. Acquisition with Low, High, Cash summed into Total Acquisition at 75%', () => {
    const input: CommissionInput = {
      ...defaultValidInput,
      acquisition: {
        low: { target: 2000, actual: 1500 },
        high: { target: 1000, actual: 800 },
        cash: { target: 1000, actual: 700 },
      }
    };
    const result = calculateCommission(input);
    // Total target: 2000 + 1000 + 1000 = 4000
    // Total actual: 1500 + 800 + 700 = 3000
    expect(result.acquisition.totalTarget).toBe(4000);
    expect(result.acquisition.totalActual).toBe(3000);
    expect(result.acquisition.total.achievement).toBe(75);
    expect(result.acquisition.total.contribution).toBe(45);
    expect(result.acquisition.total.missing).toBe(1000);
    // Backward compatibility alias:
    expect(result.voice.achievement).toBe(75);
    expect(result.voice.contribution).toBe(45);
  });

  it('3. Enterprise Accounts at 50%', () => {
    const input = { ...defaultValidInput, enterprise: { ...defaultValidInput.enterprise, accounts: { target: 2, actual: 1 } } };
    const result = calculateCommission(input);
    expect(result.enterprise.accounts.achievement).toBe(50);
    expect(result.enterprise.accounts.contribution).toBe(2.5);
  });

  it('4. Enterprise Lines at 50%', () => {
    const input = { ...defaultValidInput, enterprise: { ...defaultValidInput.enterprise, lines: { target: 6, actual: 3 } } };
    const result = calculateCommission(input);
    expect(result.enterprise.lines.achievement).toBe(50);
    expect(result.enterprise.lines.contribution).toBe(2.5);
  });

  it('5. Terminal at 75%', () => {
    const input = { ...defaultValidInput, terminal: { target: 80000, actual: 60000 } };
    const result = calculateCommission(input);
    expect(result.terminal.achievement).toBe(75);
    expect(result.terminal.contribution).toBe(7.5);
  });

  it('6. DSL at 80%', () => {
    const input = { ...defaultValidInput, fixed: { ...defaultValidInput.fixed, dsl: { target: 5, actual: 4 } } };
    const result = calculateCommission(input);
    expect(result.fixed.dsl.achievement).toBe(80);
    expect(result.fixed.dsl.contribution).toBe(12.8);
  });

  it('7. Connectivity at 50%', () => {
    const input = { ...defaultValidInput, fixed: { ...defaultValidInput.fixed, connectivity: { target: 100, actual: 50 } } };
    const result = calculateCommission(input);
    expect(result.fixed.connectivity.contribution).toBe(2);
  });

  it('8. Over-achievement on Acquisition', () => {
    const input = {
      ...defaultValidInput,
      acquisition: {
        low: { target: 2000, actual: 2500 },
        high: { target: 1000, actual: 1500 },
        cash: { target: 1000, actual: 1000 },
      }
    };
    const result = calculateCommission(input);
    // Total target: 4000, Total actual: 5000 -> 125% achievement -> 75% contribution
    expect(result.acquisition.total.achievement).toBe(125);
    expect(result.acquisition.total.contribution).toBe(75);
    expect(result.acquisition.total.missing).toBe(0);
  });

  it('9. Target = 0 => must not divide by zero and should be incomplete', () => {
    const input = {
      ...defaultValidInput,
      acquisition: {
        low: { target: 0, actual: 100 },
        high: { target: 0, actual: 0 },
        cash: { target: 0, actual: 0 },
      }
    };
    const result = calculateCommission(input);
    expect(result.acquisition.total.achievement).toBeNull();
    expect(result.acquisition.total.contribution).toBeNull();
    expect(result.overall.isComplete).toBe(false);
    expect(result.overall.achievement).toBeNull();
  });

  it('10. Negative values are rejected (incomplete)', () => {
    const input = { ...defaultValidInput, terminal: { target: 100, actual: -10 } };
    const result = calculateCommission(input);
    expect(result.terminal.achievement).toBeNull();
    expect(result.overall.isComplete).toBe(false);
  });

  it('11. Decimal values where appropriate in Acquisition sub-boxes', () => {
    const input = {
      ...defaultValidInput,
      acquisition: {
        low: { target: 5.25, actual: 2.625 },
        high: { target: 5.25, actual: 2.625 },
        cash: { target: 0, actual: 0 },
      }
    };
    const result = calculateCommission(input);
    expect(result.acquisition.totalTarget).toBe(10.5);
    expect(result.acquisition.totalActual).toBe(5.25);
    expect(result.acquisition.total.achievement).toBe(50);
    expect(result.acquisition.total.contribution).toBe(30);
  });

  it('12. Overall total calculation sample with Low, High, Cash', () => {
    const input: CommissionInput = {
      acquisition: {
        low: { target: 2000, actual: 1500 },
        high: { target: 1000, actual: 1000 },
        cash: { target: 1000, actual: 500 },
      },
      enterprise: {
        accounts: { target: 2, actual: 2 },
        lines: { target: 6, actual: 3 },
      },
      terminal: { target: 80000, actual: 60000 },
      fixed: {
        dsl: { target: 5, actual: 4 },
        connectivity: { target: 250, actual: 125 },
      }
    };

    const result = calculateCommission(input);
    // Acquisition: Target 4000, Actual 3000 -> 75% -> 45%
    expect(result.acquisition.total.achievement).toBe(75);
    expect(result.acquisition.total.contribution).toBe(45);
    expect(result.enterprise.accounts.achievement).toBe(100);
    expect(result.enterprise.accounts.contribution).toBe(5);
    expect(result.enterprise.lines.achievement).toBe(50);
    expect(result.enterprise.lines.contribution).toBe(2.5);
    expect(result.enterprise.totalContribution).toBe(7.5);
    expect(result.terminal.achievement).toBe(75);
    expect(result.terminal.contribution).toBe(7.5);
    expect(result.fixed.dsl.achievement).toBe(80);
    expect(result.fixed.dsl.contribution).toBe(12.8);
    expect(result.fixed.connectivity.achievement).toBe(50);
    expect(result.fixed.connectivity.contribution).toBe(2);
    expect(result.fixed.totalContribution).toBe(14.8);
    
    // Overall: 45 + 7.5 + 7.5 + 14.8 = 74.8
    expect(result.overall.achievement).toBeCloseTo(74.8, 2);
    expect(result.overall.isComplete).toBe(true);
  });

  it('13. Calculates VS% and RE% accurately with monthConfig', () => {
    // If today is day 15 of a 30-day month, RE% is exactly double VS%
    const input: CommissionInput = {
      acquisition: {
        low: { target: 100, actual: 50 },
        high: { target: 100, actual: 50 },
        cash: { target: 100, actual: 50 },
      },
      enterprise: {
        accounts: { target: 10, actual: 5 },
        lines: { target: 10, actual: 5 },
      },
      terminal: { target: 1000, actual: 500 },
      fixed: {
        dsl: { target: 10, actual: 5 },
        connectivity: { target: 10, actual: 5 },
      }
    };

    const monthConfig = { today: 15, totalDays: 30 };
    const result = calculateCommission(input, monthConfig);

    // VS% is (50 / 100) * 100 = 50%
    // RE% is 50% * (30 / 15) = 100%
    expect(result.acquisition.total.vs).toBe(50);
    expect(result.acquisition.total.re).toBe(100);

    expect(result.enterprise.accounts.vs).toBe(50);
    expect(result.enterprise.accounts.re).toBe(100);

    expect(result.terminal.vs).toBe(50);
    expect(result.terminal.re).toBe(100);

    // Overall VS% = 50%, RE% = 100%
    expect(result.overall.vs).toBe(50);
    expect(result.overall.re).toBe(100);
  });

  it('14. RE% with fractional days and over-achievement', () => {
    // If today is day 20 of a 30-day month (factor 1.5), and VS% is 80%, RE% is 120%
    const input: CommissionInput = {
      acquisition: {
        low: { target: 100, actual: 80 },
        high: { target: 100, actual: 80 },
        cash: { target: 100, actual: 80 },
      },
      enterprise: {
        accounts: { target: 10, actual: 8 },
        lines: { target: 10, actual: 8 },
      },
      terminal: { target: 1000, actual: 800 },
      fixed: {
        dsl: { target: 10, actual: 8 },
        connectivity: { target: 10, actual: 8 },
      }
    };

    const monthConfig = { today: 20, totalDays: 30 };
    const result = calculateCommission(input, monthConfig);

    expect(result.overall.vs).toBe(80);
    expect(result.overall.re).toBe(120);
  });
});
