import type { PrismaClient } from '@prisma/client';
import type { RouteRecord, RouteRepositoryPort } from '../../../core/ports/route.repository.port.js';
import { NotFoundError } from '../../../shared/errors.js';

export class PrismaRouteRepository implements RouteRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<RouteRecord[]> {
    const rows = await this.prisma.route.findMany({ orderBy: { code: 'asc' } });
    return rows.map((r) => this.map(r));
  }

  async setBaselineRoute(routeKey: string): Promise<void> {
    const route = await this.prisma.route.findFirst({
      where: { OR: [{ id: routeKey }, { code: routeKey }] },
    });
    if (!route) {
      throw new NotFoundError(`Route not found: ${routeKey}`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.route.updateMany({ data: { isBaseline: false } });
      await tx.route.update({
        where: { id: route.id },
        data: { isBaseline: true },
      });
    });
  }

  private map(r: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isBaseline: boolean;
    createdAt: Date;
  }): RouteRecord {
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      isBaseline: r.isBaseline,
      createdAt: r.createdAt,
    };
  }
}
