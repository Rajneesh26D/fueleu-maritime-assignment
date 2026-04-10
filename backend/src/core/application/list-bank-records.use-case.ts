import type { BankRepositoryPort } from '../ports/bank.repository.port.js';

export interface BankRecordDto {
  readonly id: string;
  readonly kind: 'BANK' | 'APPLY';
  readonly amount: number;
  readonly createdAt: string;
}

export class ListBankRecordsUseCase {
  constructor(private readonly bank: BankRepositoryPort) {}

  async execute(shipId: string, year: number): Promise<readonly BankRecordDto[]> {
    const rows = await this.bank.findEntries(shipId, year);
    return rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      amount: r.amount,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
