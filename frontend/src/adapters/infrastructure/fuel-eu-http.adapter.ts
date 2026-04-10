import type {
  AdjustedComplianceBalanceDto,
  BankRecordDto,
  ComplianceSnapshotDto,
  FuelEuApiPort,
  PoolCreatedDto,
  RouteDto,
  RouteWithMetricsDto,
  RoutesComparisonDto,
} from '../../core/ports/fuel-eu-api.port.js';

function getBaseUrl(): string {
  const raw = import.meta.env['VITE_API_BASE_URL'] as string | undefined;
  if (raw !== undefined && raw.length > 0) {
    return raw.replace(/\/$/, '');
  }
  return '/api';
}

export class FuelEuHttpAdapter implements FuelEuApiPort {
  private readonly baseUrl: string;

  constructor(baseUrl: string = getBaseUrl()) {
    this.baseUrl = baseUrl;
  }

  private url(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${p}`;
  }

  private async parseJson<T>(res: Response): Promise<T> {
    const text = await res.text();
    if (!res.ok) {
      let message = res.statusText;
      try {
        const err = JSON.parse(text) as { error?: string };
        if (typeof err.error === 'string') {
          message = err.error;
        }
      } catch {
        if (text) {
          message = text;
        }
      }
      throw new FuelEuHttpError(res.status, message);
    }
    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  }

  async listRoutes(): Promise<RouteDto[]> {
    const res = await fetch(this.url('/routes'));
    return this.parseJson<RouteDto[]>(res);
  }

  async listRoutesWithMetrics(year: number): Promise<RouteWithMetricsDto[]> {
    const q = new URLSearchParams({ year: String(year) });
    const res = await fetch(`${this.url('/routes')}?${q.toString()}`);
    return this.parseJson<RouteWithMetricsDto[]>(res);
  }

  async getRoutesComparison(year: number): Promise<RoutesComparisonDto> {
    const q = new URLSearchParams({ year: String(year) });
    const res = await fetch(`${this.url('/routes/comparison')}?${q.toString()}`);
    return this.parseJson<RoutesComparisonDto>(res);
  }

  async setBaselineRoute(routeKey: string): Promise<void> {
    const res = await fetch(this.url(`/routes/${encodeURIComponent(routeKey)}/baseline`), {
      method: 'POST',
    });
    if (!res.ok) {
      await this.parseJson<unknown>(res);
    }
  }

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceSnapshotDto> {
    const q = new URLSearchParams({ shipId, year: String(year) });
    const res = await fetch(`${this.url('/compliance/cb')}?${q.toString()}`);
    return this.parseJson<ComplianceSnapshotDto>(res);
  }

  async getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalanceDto> {
    const q = new URLSearchParams({ shipId, year: String(year) });
    const res = await fetch(`${this.url('/compliance/adjusted-cb')}?${q.toString()}`);
    return this.parseJson<AdjustedComplianceBalanceDto>(res);
  }

  async getBankingRecords(shipId: string, year: number): Promise<readonly BankRecordDto[]> {
    const q = new URLSearchParams({ shipId, year: String(year) });
    const res = await fetch(`${this.url('/banking/records')}?${q.toString()}`);
    const body = await this.parseJson<{ records: BankRecordDto[] }>(res);
    return body.records;
  }

  async getBankBalance(shipId: string, year: number): Promise<number> {
    const q = new URLSearchParams({ shipId, year: String(year) });
    const res = await fetch(`${this.url('/banking/balance')}?${q.toString()}`);
    const body = await this.parseJson<{ balance: number }>(res);
    return body.balance;
  }

  async postBank(shipId: string, year: number, amount: number): Promise<void> {
    const res = await fetch(this.url('/banking/bank'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipId, year, amount }),
    });
    if (!res.ok) {
      await this.parseJson<unknown>(res);
    }
  }

  async postApply(shipId: string, year: number, amount: number): Promise<void> {
    const res = await fetch(this.url('/banking/apply'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipId, year, amount }),
    });
    if (!res.ok) {
      await this.parseJson<unknown>(res);
    }
  }

  async createPool(input: {
    readonly year: number;
    readonly name?: string | undefined;
    readonly members: readonly { readonly shipId: string; readonly complianceBalance: number }[];
  }): Promise<PoolCreatedDto> {
    const res = await fetch(this.url('/pools'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return this.parseJson<PoolCreatedDto>(res);
  }
}

export class FuelEuHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'FuelEuHttpError';
    this.status = status;
  }
}
