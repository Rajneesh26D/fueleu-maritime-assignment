export interface BankRepositoryPort {
  getAvailableBalance(shipId: string, year: number): Promise<number>;
  recordBank(shipId: string, year: number, amount: number): Promise<void>;
  recordApply(shipId: string, year: number, amount: number): Promise<void>;
}
