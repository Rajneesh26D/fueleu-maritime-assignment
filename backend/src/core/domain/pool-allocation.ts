/**
 * Greedy surplus → deficit matching used by POST /pools.
 *
 * Preconditions (enforced by caller): `members.length >= 1`, and **Sum(adjustedCB) ≥ 0**
 * (here each member’s `complianceBalance` is the adjusted CB snapshot in gCO2e).
 *
 * Algorithm:
 * 1. Partition members into donors (CB > 0) and receivers (CB < 0).
 * 2. Sort donors by compliance balance descending (largest surplus first).
 * 3. Sort receivers by compliance balance ascending (largest deficit first).
 * 4. Walk receivers in order; for each deficit, draw from donors in sorted order until the deficit is covered
 *    or donors are exhausted (should not happen when total CB ≥ 0 and inputs are consistent).
 *
 * This satisfies the assignment requirement to sort by CB descending for surplus ships and to transfer
 * surplus to cover deficits; the receiver ordering completes the greedy pairing.
 */

export interface PoolMemberInput {
  readonly shipId: string;
  /** Compliance balance snapshot (gCO2e); may be negative. */
  readonly complianceBalance: number;
}

export interface PoolTransfer {
  readonly fromShipId: string;
  readonly toShipId: string;
  /** Amount of CB (gCO2e) moved from surplus ship to deficit ship. */
  readonly amountGco2e: number;
}

export interface GreedyPoolAllocationResult {
  readonly transfers: readonly PoolTransfer[];
  /** Sum of donor CB remaining after covering all deficits (≥ 0). */
  readonly surplusRemainingGco2e: number;
}

export function greedyAllocatePool(members: readonly PoolMemberInput[]): GreedyPoolAllocationResult {
  if (members.length === 0) {
    throw new PoolAllocationError('POOL_EMPTY', 'At least one pool member is required');
  }

  const total = members.reduce((s, m) => s + m.complianceBalance, 0);
  if (total < 0) {
    throw new PoolAllocationError('POOL_INFEASIBLE', 'Sum(adjustedCB) must be ≥ 0');
  }

  const donors = members
    .filter((m) => m.complianceBalance > 0)
    .sort((a, b) => b.complianceBalance - a.complianceBalance)
    .map((m) => ({ shipId: m.shipId, remaining: m.complianceBalance }));

  const receivers = members
    .filter((m) => m.complianceBalance < 0)
    .sort((a, b) => a.complianceBalance - b.complianceBalance)
    .map((m) => ({ shipId: m.shipId, need: -m.complianceBalance }));

  const transfers: PoolTransfer[] = [];
  let donorIdx = 0;

  for (const recv of receivers) {
    let need = recv.need;
    while (need > 0 && donorIdx < donors.length) {
      const donor = donors[donorIdx];
      if (!donor || donor.remaining <= 0) {
        donorIdx += 1;
        continue;
      }
      const move = Math.min(need, donor.remaining);
      transfers.push({
        fromShipId: donor.shipId,
        toShipId: recv.shipId,
        amountGco2e: move,
      });
      donor.remaining -= move;
      need -= move;
      if (donor.remaining <= 0) {
        donorIdx += 1;
      }
    }
    if (need > 0) {
      throw new PoolAllocationError('POOL_INFEASIBLE', 'Unable to cover deficits with available surplus');
    }
  }

  const surplusRemainingGco2e = donors.reduce((s, d) => s + d.remaining, 0);

  return { transfers, surplusRemainingGco2e };
}

export class PoolAllocationError extends Error {
  constructor(
    public readonly code: 'POOL_EMPTY' | 'POOL_INFEASIBLE',
    message: string,
  ) {
    super(message);
    this.name = 'PoolAllocationError';
  }
}
