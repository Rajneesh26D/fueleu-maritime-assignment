export interface BankLedgerRow {
  readonly id: string;
  readonly kind: 'BANK' | 'APPLY';
  readonly amount: number;
  readonly createdAt: Date;
}

export interface BankRepositoryPort {
  getAvailableBalance(shipId: string, year: number): Promise<number>;
  recordBank(shipId: string, year: number, amount: number): Promise<void>;
  recordApply(shipId: string, year: number, amount: number): Promise<void>;
  findEntries(shipId: string, year: number): Promise<readonly BankLedgerRow[]>;
}
