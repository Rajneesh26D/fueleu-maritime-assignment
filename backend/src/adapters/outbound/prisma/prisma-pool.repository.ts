import type { PrismaClient } from '@prisma/client';
import type { PoolMemberInput } from '../../../core/domain/pool-allocation.js';
import type { PoolRepositoryPort } from '../../../core/ports/pool.repository.port.js';

export class PrismaPoolRepository implements PoolRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async createPoolWithMembers(
    year: number,
    name: string | undefined,
    members: readonly PoolMemberInput[],
  ): Promise<{ readonly poolId: string }> {
    const pool = await this.prisma.pool.create({
      data: {
        year,
        name: name ?? null,
        members: {
          create: members.map((m) => ({
            shipId: m.shipId,
            complianceBalance: m.complianceBalance,
          })),
        },
      },
      select: { id: true },
    });
    return { poolId: pool.id };
  }
}
