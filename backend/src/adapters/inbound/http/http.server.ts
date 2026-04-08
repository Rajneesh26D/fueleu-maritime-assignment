import express, { type Express, type Request, type Response } from 'express';
import type { GetHealthUseCase } from '../../../core/application/get-health.use-case.js';

export function createHttpApp(getHealth: GetHealthUseCase): Express {
  const app = express();
  app.use(express.json());

  app.get('/health', async (_req: Request, res: Response) => {
    const result = await getHealth.execute();
    res.status(200).json(result);
  });

  return app;
}
