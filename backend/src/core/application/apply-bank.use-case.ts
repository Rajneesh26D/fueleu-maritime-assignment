import type { BankRepositoryPort } from '../ports/bank.repository.port.js';
import { ValidationError } from '../../shared/errors.js';

export class ApplyBankUseCase {
  constructor(private readonly bank: BankRepositoryPort) {}

  async execute(shipId: string, year: number, amount: number): Promise<void> {
    if (!(amount > 0) || !Number.isFinite(amount)) {
      throw new ValidationError('Amount must be a finite number > 0');
    }
    const available = await this.bank.getAvailableBalance(shipId, year);
    if (amount > available) {
      throw new ValidationError(
        `Apply amount exceeds available bank balance (${String(available)} gCO2e available)`,
      );
    }
    await this.bank.recordApply(shipId, year, amount);
  }
}
