import type { PoolMemberInput } from '../domain/pool-allocation.js';

export interface PoolRepositoryPort {
  createPoolWithMembers(
    year: number,
    name: string | undefined,
    members: readonly PoolMemberInput[],
  ): Promise<{ readonly poolId: string }>;
}
