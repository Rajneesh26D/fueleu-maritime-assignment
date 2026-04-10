import 'dotenv/config';
import { createServer } from 'node:http';
import { createHttpApp } from '../../adapters/inbound/http/http.server.js';
import { PrismaBankRepository } from '../../adapters/outbound/prisma/prisma-bank.repository.js';
import { PrismaComplianceRepository } from '../../adapters/outbound/prisma/prisma-compliance.repository.js';
import { PrismaPoolRepository } from '../../adapters/outbound/prisma/prisma-pool.repository.js';
import { PrismaRouteRepository } from '../../adapters/outbound/prisma/prisma-route.repository.js';
import { PostgresHealthProbeAdapter } from '../../adapters/outbound/postgres/health-probe.adapter.js';
import { ApplyBankUseCase } from '../../core/application/apply-bank.use-case.js';
import { BankSurplusUseCase } from '../../core/application/bank-surplus.use-case.js';
import { ComputeComplianceBalanceUseCase } from '../../core/application/compute-compliance-balance.use-case.js';
import { CreatePoolUseCase } from '../../core/application/create-pool.use-case.js';
import { GetAdjustedComplianceBalanceUseCase } from '../../core/application/get-adjusted-compliance-balance.use-case.js';
import { GetRoutesComparisonUseCase } from '../../core/application/get-routes-comparison.use-case.js';
import { GetBankBalanceUseCase } from '../../core/application/get-bank-balance.use-case.js';
import { ListBankRecordsUseCase } from '../../core/application/list-bank-records.use-case.js';
import { ListRoutesWithMetricsUseCase } from '../../core/application/list-routes-with-metrics.use-case.js';
import { GetHealthUseCase } from '../../core/application/get-health.use-case.js';
import { ListRoutesUseCase } from '../../core/application/list-routes.use-case.js';
import { SetBaselineRouteUseCase } from '../../core/application/set-baseline-route.use-case.js';
import { createPostgresConnection } from '../db/postgres.connection.js';
import { createPrismaClient } from '../db/prisma.factory.js';

const port = Number(process.env['PORT'] ?? 3000);

const prisma = createPrismaClient();
const connection = createPostgresConnection(prisma);
const probe = new PostgresHealthProbeAdapter(connection);

const routeRepo = new PrismaRouteRepository(prisma);
const complianceRepo = new PrismaComplianceRepository(prisma);
const bankRepo = new PrismaBankRepository(prisma);
const poolRepo = new PrismaPoolRepository(prisma);

const getHealth = new GetHealthUseCase(probe);
const listRoutes = new ListRoutesUseCase(routeRepo);
const setBaselineRoute = new SetBaselineRouteUseCase(routeRepo);
const computeComplianceBalance = new ComputeComplianceBalanceUseCase(complianceRepo);
const bankSurplus = new BankSurplusUseCase(bankRepo);
const applyBank = new ApplyBankUseCase(bankRepo);
const getBankBalance = new GetBankBalanceUseCase(bankRepo);
const createPool = new CreatePoolUseCase(poolRepo);
const listRoutesWithMetrics = new ListRoutesWithMetricsUseCase(routeRepo, complianceRepo);
const getRoutesComparison = new GetRoutesComparisonUseCase(routeRepo, complianceRepo);
const getAdjustedComplianceBalance = new GetAdjustedComplianceBalanceUseCase(complianceRepo, bankRepo);
const listBankRecords = new ListBankRecordsUseCase(bankRepo);

const app = createHttpApp({
  getHealth,
  getBankBalance,
  listRoutes,
  listRoutesWithMetrics,
  getRoutesComparison,
  getAdjustedComplianceBalance,
  listBankRecords,
  setBaselineRoute,
  computeComplianceBalance,
  bankSurplus,
  applyBank,
  createPool,
});

const server = createServer(app);

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${String(port)}`);
});

async function shutdown(): Promise<void> {
  await prisma.$disconnect();
}

process.on('SIGINT', () => {
  void shutdown().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  void shutdown().finally(() => process.exit(0));
});
