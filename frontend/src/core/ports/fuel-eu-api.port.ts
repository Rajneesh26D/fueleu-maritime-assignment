/** DTOs aligned with backend JSON responses (camelCase). */

export interface RouteDto {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly isBaseline: boolean;
  readonly createdAt: string;
}

/** GET /routes?year= — assignment KPI columns merged with compliance. */
export interface RouteWithMetricsDto {
  readonly routeId: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly isBaseline: boolean;
  readonly createdAt: string;
  readonly year: number;
  readonly vesselType: string | null;
  readonly fuelType: string | null;
  readonly ghgIntensityGco2ePerMj: number | null;
  readonly fuelConsumptionTons: number | null;
  readonly distanceKm: number | null;
  readonly totalEmissionsTons: number | null;
}

export interface RouteComparisonRowDto {
  readonly routeId: string;
  readonly routeCode: string;
  readonly shipId: string;
  readonly ghgIntensityGco2ePerMj: number;
  readonly targetIntensityGco2ePerMj: number;
  readonly percentDiff: number | null;
  readonly compliant: boolean;
  readonly isBaseline: boolean;
}

export interface RoutesComparisonDto {
  readonly year: number;
  readonly rows: readonly RouteComparisonRowDto[];
}

export interface ComplianceSnapshotDto {
  readonly shipId: string;
  readonly year: number;
  readonly targetIntensityGco2ePerMj: number;
  /** GHG intensity (gCO2e / MJ) — same as backend `actualIntensityGco2ePerMj`. */
  readonly actualIntensityGco2ePerMj: number;
  readonly fuelConsumptionTons: number;
  readonly energyMj: number;
  readonly complianceBalanceGco2e: number;
  readonly computedAt: string;
}

export interface AdjustedComplianceBalanceDto {
  readonly shipId: string;
  readonly year: number;
  readonly complianceBalanceGco2e: number;
  readonly adjustedComplianceBalanceGco2e: number;
}

export interface BankRecordDto {
  readonly id: string;
  readonly kind: 'BANK' | 'APPLY';
  readonly amount: number;
  readonly createdAt: string;
}

export interface PoolCreatedDto {
  readonly poolId: string;
  readonly transfers: readonly {
    readonly fromShipId: string;
    readonly toShipId: string;
    readonly amountGco2e: number;
  }[];
  readonly surplusRemainingGco2e: number;
  readonly members: readonly {
    readonly shipId: string;
    readonly cbBefore: number;
    readonly cbAfter: number;
  }[];
}

/** Outbound port: FuelEU backend HTTP API. */
export interface FuelEuApiPort {
  listRoutes(): Promise<RouteDto[]>;
  listRoutesWithMetrics(year: number): Promise<RouteWithMetricsDto[]>;
  getRoutesComparison(year: number): Promise<RoutesComparisonDto>;
  setBaselineRoute(routeKey: string): Promise<void>;
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceSnapshotDto>;
  getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalanceDto>;
  getBankBalance(shipId: string, year: number): Promise<number>;
  getBankingRecords(shipId: string, year: number): Promise<readonly BankRecordDto[]>;
  postBank(shipId: string, year: number, amount: number): Promise<void>;
  postApply(shipId: string, year: number, amount: number): Promise<void>;
  createPool(input: {
    readonly year: number;
    readonly name?: string | undefined;
    readonly members: readonly { readonly shipId: string; readonly complianceBalance: number }[];
  }): Promise<PoolCreatedDto>;
}
