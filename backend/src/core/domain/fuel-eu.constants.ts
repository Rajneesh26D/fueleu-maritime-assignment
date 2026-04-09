/**
 * Target intensity for calendar year 2025 (gCO2e per MJ), fixed by project spec.
 * Used strictly for `year === 2025` compliance calculations regardless of DB drift.
 */
export const TARGET_INTENSITY_2025_GCO2E_PER_MJ = 89.3368 as const;

/** MJ per metric tonne of fuel (project factor). Energy in scope (MJ) = fuel (t) × this value. */
export const MJ_PER_FUEL_TON = 41_000 as const;
