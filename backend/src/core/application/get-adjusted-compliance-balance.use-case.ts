import { complianceBalanceGco2e, energyInScopeMj } from '../domain/compliance-balance.js';
import { TARGET_INTENSITY_2025_GCO2E_PER_MJ } from '../domain/fuel-eu.constants.js';
import type { BankRepositoryPort } from '../ports/bank.repository.port.js';
import type { ComplianceRepositoryPort } from '../ports/compliance.repository.port.js';
import { NotFoundError } from '../../shared/errors.js';

export interface AdjustedComplianceBalanceResult {
  readonly shipId: string;
  readonly year: number;
  /** Environmental CB from (T−A)×E. */
  readonly complianceBalanceGco2e: number;
  /** CB after bank applications: raw − Σ(BANK) + Σ(APPLY) for this ship/year. */
  readonly adjustedComplianceBalanceGco2e: number;
}

export class GetAdjustedComplianceBalanceUseCase {
  constructor(
    private readonly compliance: ComplianceRepositoryPort,
    private readonly bank: BankRepositoryPort,
  ) {}

  async execute(shipId: string, year: number): Promise<AdjustedComplianceBalanceResult> {
    const row = await this.compliance.findByShipYear(shipId, year);
    if (!row) {
      throw new NotFoundError(`No compliance inputs for ship ${shipId} and year ${String(year)}`);
    }
    const energyMj = energyInScopeMj(row.fuelConsumptionTons);
    const targetIntensityGco2ePerMj =
      row.year === 2025 ? TARGET_INTENSITY_2025_GCO2E_PER_MJ : row.targetIntensityGco2eMj;
    const rawCb = complianceBalanceGco2e(
      targetIntensityGco2ePerMj,
      row.actualIntensityGco2eMj,
      energyMj,
    );
    const entries = await this.bank.findEntries(shipId, year);
    let bankOut = 0;
    let applyIn = 0;
    for (const e of entries) {
      if (e.kind === 'BANK') {
        bankOut += e.amount;
      } else {
        applyIn += e.amount;
      }
    }
    const adjusted = rawCb - bankOut + applyIn;
    return {
      shipId,
      year,
      complianceBalanceGco2e: rawCb,
      adjustedComplianceBalanceGco2e: adjusted,
    };
  }
}
