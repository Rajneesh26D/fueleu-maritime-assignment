import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Routes R001–R005 (assignment Phase 2). PDF route metadata was not available in-repo;
 * names are descriptive placeholders; R001 is the regulatory baseline flag.
 */
const ROUTES = [
  {
    code: 'R001',
    name: 'North Sea Standard Corridor',
    description: 'Baseline reference route (is_baseline = true).',
    isBaseline: true,
  },
  {
    code: 'R002',
    name: 'Baltic Shortsea Loop',
    description: 'Baltic feeder route R002.',
    isBaseline: false,
  },
  {
    code: 'R003',
    name: 'Mediterranean East–West',
    description: 'Central Mediterranean corridor R003.',
    isBaseline: false,
  },
  {
    code: 'R004',
    name: 'English Channel Link',
    description: 'Cross-Channel route R004.',
    isBaseline: false,
  },
  {
    code: 'R005',
    name: 'Atlantic Coastal Europe',
    description: 'Western European Atlantic coast R005.',
    isBaseline: false,
  },
] as const;

async function main(): Promise<void> {
  for (const r of ROUTES) {
    await prisma.route.upsert({
      where: { code: r.code },
      update: {
        name: r.name,
        description: r.description,
        isBaseline: r.isBaseline,
      },
      create: {
        code: r.code,
        name: r.name,
        description: r.description,
        isBaseline: r.isBaseline,
      },
    });
  }

  await prisma.shipCompliance.upsert({
    where: { shipId_year: { shipId: 'SEED-SHIP-1', year: 2025 } },
    update: {
      actualIntensityGco2eMj: 90.0,
      fuelConsumptionTons: 120.5,
      targetIntensityGco2eMj: 89.3368,
    },
    create: {
      shipId: 'SEED-SHIP-1',
      year: 2025,
      actualIntensityGco2eMj: 90.0,
      fuelConsumptionTons: 120.5,
      targetIntensityGco2eMj: 89.3368,
    },
  });
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
