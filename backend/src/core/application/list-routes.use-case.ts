import type { RouteRecord, RouteRepositoryPort } from '../ports/route.repository.port.js';

export class ListRoutesUseCase {
  constructor(private readonly routes: RouteRepositoryPort) {}

  async execute(): Promise<RouteRecord[]> {
    return this.routes.findAll();
  }
}
