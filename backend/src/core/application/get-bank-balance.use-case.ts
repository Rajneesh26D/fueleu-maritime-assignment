import type { BankRepositoryPort } from '../ports/bank.repository.port.js';

export class GetBankBalanceUseCase {
  constructor(private readonly bank: BankRepositoryPort) {}

  async execute(shipId: string, year: number): Promise<number> {
    return this.bank.getAvailableBalance(shipId, year);
  }
}
