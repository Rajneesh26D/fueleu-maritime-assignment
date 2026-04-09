import { MJ_PER_FUEL_TON } from './fuel-eu.constants.js';

/**
 * Energy in scope (MJ) ≈ fuelConsumption (t) × 41,000 MJ/t
 */
export function energyInScopeMj(fuelConsumptionTons: number): number {
  return fuelConsumptionTons * MJ_PER_FUEL_TON;
}

/**
 * Compliance Balance (CB) = (Target − Actual) × Energy in scope
 * All intensities in gCO2e/MJ; result in gCO2e.
 */
export function complianceBalanceGco2e(
  targetIntensityGco2ePerMj: number,
  actualIntensityGco2ePerMj: number,
  energyMj: number,
): number {
  return (targetIntensityGco2ePerMj - actualIntensityGco2ePerMj) * energyMj;
}
