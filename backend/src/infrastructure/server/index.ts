import { createServer } from 'node:http';
import { createHttpApp } from '../../adapters/inbound/http/http.server.js';
import { GetHealthUseCase } from '../../core/application/get-health.use-case.js';
import { PostgresHealthProbeAdapter } from '../../adapters/outbound/postgres/health-probe.adapter.js';
import { createPostgresConnection } from '../db/postgres.connection.js';

const port = Number(process.env['PORT'] ?? 3000);

const connection = createPostgresConnection();
const probe = new PostgresHealthProbeAdapter(connection);
const getHealth = new GetHealthUseCase(probe);
const app = createHttpApp(getHealth);

const server = createServer(app);

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${String(port)}`);
});
