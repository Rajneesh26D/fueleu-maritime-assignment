import { complianceBalanceGco2e, energyInScopeMj } from '../domain/compliance-balance.js';
import { TARGET_INTENSITY_2025_GCO2E_PER_MJ } from '../domain/fuel-eu.constants.js';
import type { ComplianceRepositoryPort } from '../ports/compliance.repository.port.js';
import { NotFoundError } from '../../shared/errors.js';

export interface ComplianceBalanceSnapshot {
  readonly shipId: string;
  readonly year: number;
  readonly targetIntensityGco2ePerMj: number;
  readonly actualIntensityGco2ePerMj: number;
  readonly fuelConsumptionTons: number;
  readonly energyMj: number;
  readonly complianceBalanceGco2e: number;
  readonly computedAt: string;
}

export class ComputeComplianceBalanceUseCase {
  constructor(private readonly compliance: ComplianceRepositoryPort) {}

  async execute(shipId: string, year: number): Promise<ComplianceBalanceSnapshot> {
    const row = await this.compliance.findByShipYear(shipId, year);
    if (!row) {
      throw new NotFoundError(`No compliance inputs for ship ${shipId} and year ${String(year)}`);
    }

    const energyMj = energyInScopeMj(row.fuelConsumptionTons);
    /** Calendar year 2025: regulatory target is strictly 89.3368 gCO2e/MJ (project formula). */
    const targetIntensityGco2ePerMj =
      row.year === 2025 ? TARGET_INTENSITY_2025_GCO2E_PER_MJ : row.targetIntensityGco2eMj;
    const cb = complianceBalanceGco2e(
      targetIntensityGco2ePerMj,
      row.actualIntensityGco2eMj,
      energyMj,
    );
    const computedAt = new Date();
    await this.compliance.updateComputedSnapshot(row.id, {
      energyMj,
      complianceBalance: cb,
      computedAt,
    });

    return {
      shipId: row.shipId,
      year: row.year,
      targetIntensityGco2ePerMj,
      actualIntensityGco2ePerMj: row.actualIntensityGco2eMj,
      fuelConsumptionTons: row.fuelConsumptionTons,
      energyMj,
      complianceBalanceGco2e: cb,
      computedAt: computedAt.toISOString(),
    };
  }
}
