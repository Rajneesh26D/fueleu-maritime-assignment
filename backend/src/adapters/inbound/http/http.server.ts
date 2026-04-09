import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import type { GetHealthUseCase } from '../../../core/application/get-health.use-case.js';
import type { ListRoutesUseCase } from '../../../core/application/list-routes.use-case.js';
import type { SetBaselineRouteUseCase } from '../../../core/application/set-baseline-route.use-case.js';
import type { ComputeComplianceBalanceUseCase } from '../../../core/application/compute-compliance-balance.use-case.js';
import type { BankSurplusUseCase } from '../../../core/application/bank-surplus.use-case.js';
import type { ApplyBankUseCase } from '../../../core/application/apply-bank.use-case.js';
import type { CreatePoolUseCase } from '../../../core/application/create-pool.use-case.js';
import { PoolAllocationError } from '../../../core/domain/pool-allocation.js';
import { NotFoundError, ValidationError } from '../../../shared/errors.js';

export interface HttpAppDeps {
  readonly getHealth: GetHealthUseCase;
  readonly listRoutes: ListRoutesUseCase;
  readonly setBaselineRoute: SetBaselineRouteUseCase;
  readonly computeComplianceBalance: ComputeComplianceBalanceUseCase;
  readonly bankSurplus: BankSurplusUseCase;
  readonly applyBank: ApplyBankUseCase;
  readonly createPool: CreatePoolUseCase;
}

export function createHttpApp(deps: HttpAppDeps): Express {
  const app = express();
  app.use(express.json());

  app.get('/health', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await deps.getHealth.execute();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  app.get(
    '/routes',
    asyncHandler(async (_req, res) => {
      const routes = await deps.listRoutes.execute();
      res.status(200).json(routes);
    }),
  );

  app.post(
    '/routes/:id/baseline',
    asyncHandler(async (req, res) => {
      const id = readPathParam(req.params['id']);
      if (!id) {
        res.status(400).json({ error: 'Route id is required' });
        return;
      }
      await deps.setBaselineRoute.execute(id);
      res.status(204).send();
    }),
  );

  app.get(
    '/compliance/cb',
    asyncHandler(async (req, res) => {
      const shipId = readQueryString(req.query['shipId']);
      const year = readQueryInt(req.query['year']);
      if (!shipId || year === undefined) {
        res.status(400).json({ error: 'Query parameters shipId and year are required' });
        return;
      }
      const snapshot = await deps.computeComplianceBalance.execute(shipId, year);
      res.status(200).json(snapshot);
    }),
  );

  app.post(
    '/banking/bank',
    asyncHandler(async (req, res) => {
      const body = readBankBody(req.body);
      if (!body) {
        res.status(400).json({ error: 'JSON body must include shipId, year, amount' });
        return;
      }
      await deps.bankSurplus.execute(body.shipId, body.year, body.amount);
      res.status(204).send();
    }),
  );

  app.post(
    '/banking/apply',
    asyncHandler(async (req, res) => {
      const body = readBankBody(req.body);
      if (!body) {
        res.status(400).json({ error: 'JSON body must include shipId, year, amount' });
        return;
      }
      await deps.applyBank.execute(body.shipId, body.year, body.amount);
      res.status(204).send();
    }),
  );

  app.post(
    '/pools',
    asyncHandler(async (req, res) => {
      const parsed = readPoolBody(req.body);
      if (!parsed) {
        res.status(400).json({
          error: 'JSON body must include year (integer) and members: [{ shipId, complianceBalance }]',
        });
        return;
      }
      const result = await deps.createPool.execute(parsed);
      res.status(201).json({
        poolId: result.poolId,
        transfers: result.allocation.transfers,
        surplusRemainingGco2e: result.allocation.surplusRemainingGco2e,
      });
    }),
  );

  app.use(
    (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
        return;
      }
      if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (err instanceof PoolAllocationError) {
        res.status(400).json({ error: err.message, code: err.code });
        return;
      }
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    },
  );

  return app;
}

function asyncHandler(
  fn: (req: Request, res: Response) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    void fn(req, res).catch(next);
  };
}

function readPathParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
    return value[0];
  }
  return undefined;
}

function readQueryString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }
  return undefined;
}

function readQueryInt(value: unknown): number | undefined {
  const raw = readQueryString(value);
  if (!raw) {
    return undefined;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    return undefined;
  }
  return n;
}

function readBankBody(body: unknown): { shipId: string; year: number; amount: number } | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const b = body as Record<string, unknown>;
  const shipId = b['shipId'];
  const year = b['year'];
  const amount = b['amount'];
  if (typeof shipId !== 'string' || shipId.length === 0) {
    return null;
  }
  if (typeof year !== 'number' || !Number.isInteger(year)) {
    return null;
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return null;
  }
  return { shipId, year, amount };
}

function readPoolBody(body: unknown): {
  year: number;
  name?: string | undefined;
  members: { shipId: string; complianceBalance: number }[];
} | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const b = body as Record<string, unknown>;
  const year = b['year'];
  const members = b['members'];
  if (typeof year !== 'number' || !Number.isInteger(year)) {
    return null;
  }
  if (!Array.isArray(members) || members.length === 0) {
    return null;
  }
  const mapped: { shipId: string; complianceBalance: number }[] = [];
  for (const m of members) {
    if (!m || typeof m !== 'object') {
      return null;
    }
    const row = m as Record<string, unknown>;
    const shipId = row['shipId'];
    const complianceBalance = row['complianceBalance'];
    if (typeof shipId !== 'string' || shipId.length === 0) {
      return null;
    }
    if (typeof complianceBalance !== 'number' || !Number.isFinite(complianceBalance)) {
      return null;
    }
    mapped.push({ shipId, complianceBalance });
  }
  const nameRaw = b['name'];
  if (nameRaw === undefined) {
    return { year, members: mapped };
  }
  if (typeof nameRaw !== 'string') {
    return null;
  }
  return { year, name: nameRaw, members: mapped };
}
