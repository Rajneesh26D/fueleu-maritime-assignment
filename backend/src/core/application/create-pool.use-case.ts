import {
  greedyAllocatePool,
  PoolAllocationError,
  type GreedyPoolAllocationResult,
  type PoolMemberInput,
} from '../domain/pool-allocation.js';
import type { PoolRepositoryPort } from '../ports/pool.repository.port.js';
import { ValidationError } from '../../shared/errors.js';

export interface CreatePoolCommand {
  readonly year: number;
  readonly name?: string | undefined;
  readonly members: readonly PoolMemberInput[];
}

export interface PoolMemberBalanceDto {
  readonly shipId: string;
  readonly cbBefore: number;
  readonly cbAfter: number;
}

export interface CreatePoolResult {
  readonly poolId: string;
  readonly allocation: GreedyPoolAllocationResult;
  readonly memberBalances: readonly PoolMemberBalanceDto[];
}

export class CreatePoolUseCase {
  constructor(private readonly pools: PoolRepositoryPort) {}

  async execute(cmd: CreatePoolCommand): Promise<CreatePoolResult> {
    if (!Number.isInteger(cmd.year)) {
      throw new ValidationError('year must be an integer');
    }
    if (cmd.members.length === 0) {
      throw new PoolAllocationError('POOL_EMPTY', 'At least one pool member is required');
    }

    const allocation = greedyAllocatePool(cmd.members);
    const { poolId } = await this.pools.createPoolWithMembers(cmd.year, cmd.name, cmd.members);
    const balances = new Map(cmd.members.map((m) => [m.shipId, m.complianceBalance] as const));
    for (const t of allocation.transfers) {
      balances.set(t.fromShipId, (balances.get(t.fromShipId) ?? 0) - t.amountGco2e);
      balances.set(t.toShipId, (balances.get(t.toShipId) ?? 0) + t.amountGco2e);
    }
    const memberBalances: PoolMemberBalanceDto[] = cmd.members.map((m) => ({
      shipId: m.shipId,
      cbBefore: m.complianceBalance,
      cbAfter: balances.get(m.shipId) ?? m.complianceBalance,
    }));

    return { poolId, allocation, memberBalances };
  }
}
