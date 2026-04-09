import type { RouteRepositoryPort } from '../ports/route.repository.port.js';

export class SetBaselineRouteUseCase {
  constructor(private readonly routes: RouteRepositoryPort) {}

  async execute(routeKey: string): Promise<void> {
    await this.routes.setBaselineRoute(routeKey);
  }
}
