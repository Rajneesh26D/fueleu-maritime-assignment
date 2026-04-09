export interface ShipComplianceRecord {
  readonly id: string;
  readonly shipId: string;
  readonly year: number;
  readonly routeId: string | null;
  readonly actualIntensityGco2eMj: number;
  readonly fuelConsumptionTons: number;
  readonly targetIntensityGco2eMj: number;
}

export interface ComplianceRepositoryPort {
  findByShipYear(shipId: string, year: number): Promise<ShipComplianceRecord | null>;
  updateComputedSnapshot(
    id: string,
    snapshot: {
      readonly energyMj: number;
      readonly complianceBalance: number;
      readonly computedAt: Date;
    },
  ): Promise<void>;
}
