/**
 * Compare-tab percentage vs the baseline route (GHG intensity actuals, gCO2e/MJ).
 * percentDiff = ((comparison / baseline) - 1) × 100
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
