/**
 * Compare-tab % vs baseline route (GHG intensity actuals, gCO2e/MJ).
 * Mirrors backend `percentDiffVsBaselineRoute` in `backend/src/core/domain/route-comparison.ts`.
 */
export function percentDiffVsBaselineRoute(
  comparisonGhgIntensity: number,
  baselineGhgIntensity: number,
): number {
  if (!(baselineGhgIntensity > 0)) {
    throw new Error('Baseline GHG intensity must be positive');
  }
  return ((comparisonGhgIntensity / baselineGhgIntensity) - 1) * 100;
}
