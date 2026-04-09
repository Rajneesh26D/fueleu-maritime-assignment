import { MJ_PER_FUEL_TON } from './fuel-eu.constants.js';

/**
 * Energy in scope (MJ) = fuelConsumption (t) × 41,000 MJ/t
 * `fuelConsumptionTons` is mass of fuel in metric tonnes (t).
 */
export function energyInScopeMj(fuelConsumptionTons: number): number {
  return fuelConsumptionTons * MJ_PER_FUEL_TON;
}

/**
 * Compliance Balance [gCO2eq] = (GHGI_target − GHGI_actual) × Energy_in_scope [MJ]
 * Intensities in gCO2e/MJ; energy in MJ → result in gCO2e (same as gCO2eq here).
 * Positive CB ⇒ surplus; negative CB ⇒ deficit.
 */
export function complianceBalanceGco2e(
  targetIntensityGco2ePerMj: number,
  actualIntensityGco2ePerMj: number,
  energyMj: number,
): number {
  return (targetIntensityGco2ePerMj - actualIntensityGco2ePerMj) * energyMj;
}
