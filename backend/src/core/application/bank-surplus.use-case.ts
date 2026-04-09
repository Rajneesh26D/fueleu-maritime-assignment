import type { BankRepositoryPort } from '../ports/bank.repository.port.js';
import { ValidationError } from '../../shared/errors.js';

export class BankSurplusUseCase {
  constructor(private readonly bank: BankRepositoryPort) {}

  async execute(shipId: string, year: number, amount: number): Promise<void> {
    if (!(amount > 0) || !Number.isFinite(amount)) {
      throw new ValidationError('Amount must be a finite number > 0');
    }
    await this.bank.recordBank(shipId, year, amount);
  }
}
