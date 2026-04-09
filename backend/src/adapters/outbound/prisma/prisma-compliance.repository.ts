import type { PrismaClient } from '@prisma/client';
import type {
  ComplianceRepositoryPort,
  ShipComplianceRecord,
} from '../../../core/ports/compliance.repository.port.js';

export class PrismaComplianceRepository implements ComplianceRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findByShipYear(shipId: string, year: number): Promise<ShipComplianceRecord | null> {
    const row = await this.prisma.shipCompliance.findUnique({
      where: {
        shipId_year: { shipId, year },
      },
    });
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      shipId: row.shipId,
      year: row.year,
      routeId: row.routeId,
      actualIntensityGco2eMj: row.actualIntensityGco2eMj,
      fuelConsumptionTons: row.fuelConsumptionTons,
      targetIntensityGco2eMj: row.targetIntensityGco2eMj,
    };
  }

  async updateComputedSnapshot(
    id: string,
    snapshot: {
      readonly energyMj: number;
      readonly complianceBalance: number;
      readonly computedAt: Date;
    },
  ): Promise<void> {
    await this.prisma.shipCompliance.update({
      where: { id },
      data: {
        energyMj: snapshot.energyMj,
        complianceBalance: snapshot.complianceBalance,
        computedAt: snapshot.computedAt,
      },
    });
  }
}
