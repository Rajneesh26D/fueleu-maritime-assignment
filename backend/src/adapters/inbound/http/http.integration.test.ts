import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import type { ApplyBankUseCase } from '../../../core/application/apply-bank.use-case.js';
import type { BankSurplusUseCase } from '../../../core/application/bank-surplus.use-case.js';
import type { ComputeComplianceBalanceUseCase } from '../../../core/application/compute-compliance-balance.use-case.js';
import type { CreatePoolUseCase } from '../../../core/application/create-pool.use-case.js';
import type { GetBankBalanceUseCase } from '../../../core/application/get-bank-balance.use-case.js';
import type { GetHealthUseCase } from '../../../core/application/get-health.use-case.js';
import type { GetAdjustedComplianceBalanceUseCase } from '../../../core/application/get-adjusted-compliance-balance.use-case.js';
import type { GetRoutesComparisonUseCase } from '../../../core/application/get-routes-comparison.use-case.js';
import type { ListBankRecordsUseCase } from '../../../core/application/list-bank-records.use-case.js';
import type { ListRoutesUseCase } from '../../../core/application/list-routes.use-case.js';
import type { ListRoutesWithMetricsUseCase } from '../../../core/application/list-routes-with-metrics.use-case.js';
import type { SetBaselineRouteUseCase } from '../../../core/application/set-baseline-route.use-case.js';
import { createHttpApp } from './http.server.js';
import type { HttpAppDeps } from './http.server.js';

const sampleCb = {
  shipId: 'SHIP-R001',
  year: 2025,
  targetIntensityGco2ePerMj: 89.3368,
  actualIntensityGco2ePerMj: 88.0,
  fuelConsumptionTons: 100,
  energyMj: 4_100_000,
  complianceBalanceGco2e: 5488.8,
  computedAt: new Date().toISOString(),
};

function mockDeps(overrides: Partial<HttpAppDeps> = {}): HttpAppDeps {
  const base: HttpAppDeps = {
    getHealth: { execute: () => Promise.resolve({ status: 'ok' }) } as GetHealthUseCase,
    getBankBalance: { execute: () => Promise.resolve(0) } as GetBankBalanceUseCase,
    listRoutes: {
      execute: () =>
        Promise.resolve([
          {
            id: 'r1',
            code: 'R001',
            name: 'A',
            description: null,
            isBaseline: true,
            createdAt: new Date(),
          },
        ]),
    } as ListRoutesUseCase,
    listRoutesWithMetrics: { execute: () => Promise.resolve([]) } as ListRoutesWithMetricsUseCase,
    getRoutesComparison: {
      execute: () => Promise.resolve({ year: 2025, rows: [] }),
    } as GetRoutesComparisonUseCase,
    getAdjustedComplianceBalance: {
      execute: () =>
        Promise.resolve({
          shipId: 'S',
          year: 2025,
          complianceBalanceGco2e: 1,
          adjustedComplianceBalanceGco2e: 1,
        }),
    } as GetAdjustedComplianceBalanceUseCase,
    listBankRecords: { execute: () => Promise.resolve([]) } as ListBankRecordsUseCase,
    setBaselineRoute: { execute: () => Promise.resolve(undefined) } as SetBaselineRouteUseCase,
    computeComplianceBalance: { execute: () => Promise.resolve(sampleCb) } as ComputeComplianceBalanceUseCase,
    bankSurplus: { execute: () => Promise.resolve(undefined) } as BankSurplusUseCase,
    applyBank: { execute: () => Promise.resolve(undefined) } as ApplyBankUseCase,
    createPool: {
      execute: () =>
        Promise.resolve({
          poolId: 'pool-1',
          allocation: { transfers: [], surplusRemainingGco2e: 0 },
          memberBalances: [],
        }),
    } as CreatePoolUseCase,
  };
  return { ...base, ...overrides };
}

describe('HTTP API (integration)', () => {
  it('GET /health returns JSON', async () => {
    const app = createHttpApp(mockDeps());
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /routes returns route list', async () => {
    const app = createHttpApp(mockDeps());
    const res = await request(app).get('/routes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const rows = res.body as { code: string }[];
    expect(rows[0]?.code).toBe('R001');
  });

  it('GET /compliance/cb requires shipId and year', async () => {
    const app = createHttpApp(mockDeps());
    const res = await request(app).get('/compliance/cb');
    expect(res.status).toBe(400);
  });

  it('GET /compliance/cb returns snapshot', async () => {
    const app = createHttpApp(mockDeps());
    const res = await request(app).get('/compliance/cb').query({ shipId: 'SHIP-R001', year: '2025' });
    expect(res.status).toBe(200);
    const body = res.body as { shipId: string; complianceBalanceGco2e: number };
    expect(body.shipId).toBe('SHIP-R001');
    expect(body.complianceBalanceGco2e).toBeDefined();
  });

  it('GET /banking/balance returns numeric balance', async () => {
    const app = createHttpApp(mockDeps({ getBankBalance: { execute: () => Promise.resolve(42) } as GetBankBalanceUseCase }));
    const res = await request(app).get('/banking/balance').query({ shipId: 'S', year: '2025' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ balance: 42 });
  });

  it('POST /pools creates pool', async () => {
    const executeCreatePool = vi.fn().mockResolvedValue({
      poolId: 'p-new',
      allocation: {
        transfers: [{ fromShipId: 'A', toShipId: 'B', amountGco2e: 10 }],
        surplusRemainingGco2e: 0,
      },
      memberBalances: [
        { shipId: 'A', cbBefore: 10, cbAfter: 0 },
        { shipId: 'B', cbBefore: -10, cbAfter: 0 },
      ],
    });
    const app = createHttpApp(
      mockDeps({
        createPool: { execute: executeCreatePool } as CreatePoolUseCase,
      }),
    );
    const res = await request(app)
      .post('/pools')
      .send({
        year: 2025,
        members: [
          { shipId: 'A', complianceBalance: 10 },
          { shipId: 'B', complianceBalance: -10 },
        ],
      });
    expect(res.status).toBe(201);
    const body = res.body as { poolId: string };
    expect(body.poolId).toBe('p-new');
    expect(executeCreatePool).toHaveBeenCalled();
  });

  it('POST /pools rejects invalid body', async () => {
    const app = createHttpApp(mockDeps());
    const res = await request(app).post('/pools').send({ year: 2025 });
    expect(res.status).toBe(400);
  });
});
