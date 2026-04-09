import type { PrismaClient } from '@prisma/client';

export interface PostgresConnection {
  isReady(): Promise<boolean>;
}

export function createPostgresConnection(prisma: PrismaClient): PostgresConnection {
  return {
    async isReady() {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      } catch {
        return false;
      }
    },
  };
}
