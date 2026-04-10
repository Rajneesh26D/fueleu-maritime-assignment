import type { PrismaClient } from '@prisma/client';
import { BankEntryKind } from '@prisma/client';
import type { BankLedgerRow, BankRepositoryPort } from '../../../core/ports/bank.repository.port.js';

export class PrismaBankRepository implements BankRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async getAvailableBalance(shipId: string, year: number): Promise<number> {
    const rows = await this.prisma.bankEntry.findMany({
      where: { shipId, year },
      select: { amount: true, kind: true },
    });
    return rows.reduce(
      (sum, r) => sum + (r.kind === BankEntryKind.BANK ? r.amount : -r.amount),
      0,
    );
  }

  async recordBank(shipId: string, year: number, amount: number): Promise<void> {
    await this.prisma.bankEntry.create({
      data: { shipId, year, amount, kind: BankEntryKind.BANK },
    });
  }

  async recordApply(shipId: string, year: number, amount: number): Promise<void> {
    await this.prisma.bankEntry.create({
      data: { shipId, year, amount, kind: BankEntryKind.APPLY },
    });
  }

  async findEntries(shipId: string, year: number): Promise<readonly BankLedgerRow[]> {
    const rows = await this.prisma.bankEntry.findMany({
      where: { shipId, year },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      kind: r.kind === BankEntryKind.BANK ? ('BANK' as const) : ('APPLY' as const),
      amount: r.amount,
      createdAt: r.createdAt,
    }));
  }
}
