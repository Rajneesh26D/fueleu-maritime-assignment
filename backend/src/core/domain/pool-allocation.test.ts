import { describe, expect, it } from 'vitest';
import { greedyAllocatePool, PoolAllocationError } from './pool-allocation.js';

describe('greedyAllocatePool (CreatePool / pooling)', () => {
  it('rejects Sum(adjustedCB) < 0', () => {
    expect(() =>
      greedyAllocatePool([
        { shipId: 'A', complianceBalance: -100 },
        { shipId: 'B', complianceBalance: -50 },
      ]),
    ).toThrow(PoolAllocationError);
  });

  it('returns transfers and non-negative surplus remaining when feasible', () => {
    const result = greedyAllocatePool([
      { shipId: 'A', complianceBalance: 100 },
      { shipId: 'B', complianceBalance: -40 },
      { shipId: 'C', complianceBalance: -30 },
    ]);
    expect(result.surplusRemainingGco2e).toBeGreaterThanOrEqual(0);
    expect(result.transfers.length).toBeGreaterThan(0);
  });

  it('allows zero-sum pool', () => {
    const result = greedyAllocatePool([
      { shipId: 'A', complianceBalance: 50 },
      { shipId: 'B', complianceBalance: -50 },
    ]);
    expect(result.surplusRemainingGco2e).toBe(0);
  });
});
