import { describe, expect, it, vi } from 'vitest';
import { CreatePoolUseCase } from './create-pool.use-case.js';
import type { PoolRepositoryPort } from '../ports/pool.repository.port.js';

describe('CreatePoolUseCase', () => {
  it('runs greedy allocation then persists pool', async () => {
    const createPoolWithMembers = vi.fn().mockResolvedValue({ poolId: 'pool-1' });
    const pool: PoolRepositoryPort = {
      createPoolWithMembers,
    };
    const uc = new CreatePoolUseCase(pool);
    const result = await uc.execute({
      year: 2025,
      name: 'Test',
      members: [
        { shipId: 'S1', complianceBalance: 10 },
        { shipId: 'S2', complianceBalance: -10 },
      ],
    });
    expect(result.poolId).toBe('pool-1');
    expect(result.allocation.surplusRemainingGco2e).toBe(0);
    expect(createPoolWithMembers).toHaveBeenCalledTimes(1);
  });
});
