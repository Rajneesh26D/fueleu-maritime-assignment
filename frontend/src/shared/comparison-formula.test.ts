import { describe, expect, it } from 'vitest';
import { percentDiffVsBaselineRoute } from './comparison-formula.js';

describe('percentDiffVsBaselineRoute', () => {
  it('computes ((comparison / baseline) - 1) × 100', () => {
    expect(percentDiffVsBaselineRoute(100, 100)).toBe(0);
    expect(percentDiffVsBaselineRoute(110, 100)).toBeCloseTo(10, 10);
    expect(percentDiffVsBaselineRoute(87.2, 90.0)).toBeCloseTo(((87.2 / 90.0) - 1) * 100, 10);
  });

  it('rejects non-positive baseline', () => {
    expect(() => percentDiffVsBaselineRoute(1, 0)).toThrow();
  });
});
