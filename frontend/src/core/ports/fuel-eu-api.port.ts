/** DTOs aligned with backend JSON responses (camelCase). */

export interface RouteDto {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly isBaseline: boolean;
  readonly createdAt: string;
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

export interface PoolCreatedDto {
  readonly poolId: string;
  readonly transfers: readonly {
    readonly fromShipId: string;
    readonly toShipId: string;
    readonly amountGco2e: number;
  }[];
  readonly surplusRemainingGco2e: number;
}

/** Outbound port: FuelEU backend HTTP API. */
export interface FuelEuApiPort {
  listRoutes(): Promise<RouteDto[]>;
  setBaselineRoute(routeKey: string): Promise<void>;
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceSnapshotDto>;
  getBankBalance(shipId: string, year: number): Promise<number>;
  postBank(shipId: string, year: number, amount: number): Promise<void>;
  postApply(shipId: string, year: number, amount: number): Promise<void>;
  createPool(input: {
    readonly year: number;
    readonly name?: string | undefined;
    readonly members: readonly { readonly shipId: string; readonly complianceBalance: number }[];
  }): Promise<PoolCreatedDto>;
}
