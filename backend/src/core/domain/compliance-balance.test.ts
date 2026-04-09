import { describe, expect, it } from 'vitest';
import { complianceBalanceGco2e, energyInScopeMj } from './compliance-balance.js';
import { MJ_PER_FUEL_TON, TARGET_INTENSITY_2025_GCO2E_PER_MJ } from './fuel-eu.constants.js';

describe('energyInScopeMj (Compute energy)', () => {
  it('computes fuel (t) × 41,000 MJ/t', () => {
    expect(energyInScopeMj(1)).toBe(41_000);
    expect(energyInScopeMj(120.5)).toBe(120.5 * MJ_PER_FUEL_TON);
  });
});

describe('complianceBalanceGco2e (Compute CB)', () => {
  it('computes (Target − Actual) × Energy — surplus when Actual < Target', () => {
    const energy = energyInScopeMj(100);
    const cb = complianceBalanceGco2e(TARGET_INTENSITY_2025_GCO2E_PER_MJ, 88.0, energy);
    expect(cb).toBe((TARGET_INTENSITY_2025_GCO2E_PER_MJ - 88.0) * energy);
    expect(cb).toBeGreaterThan(0);
  });

  it('computes deficit when Actual > Target', () => {
    const energy = energyInScopeMj(50);
    const cb = complianceBalanceGco2e(TARGET_INTENSITY_2025_GCO2E_PER_MJ, 92.0, energy);
    expect(cb).toBeLessThan(0);
  });
});
