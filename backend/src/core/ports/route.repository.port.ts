export interface RouteRecord {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly isBaseline: boolean;
  readonly createdAt: Date;
}

export interface RouteRepositoryPort {
  findAll(): Promise<RouteRecord[]>;
  setBaselineRoute(routeKey: string): Promise<void>;
}
