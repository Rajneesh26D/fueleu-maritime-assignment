import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Routes R001–R005. KPI intensities for 2024/2025 follow the assignment dataset;
 * other year×route pairs reuse sensible defaults.
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

/** Assignment KPI dataset: route code + calendar year → intensity (gCO2e/MJ), fuel (t). */
function intensityFuelFor(code: string, year: number): { intensity: number; fuel: number } {
  if (code === 'R001' && year === 2024) {
    return { intensity: 91.0, fuel: 5000 };
  }
  if (code === 'R002' && year === 2024) {
    return { intensity: 88.0, fuel: 4800 };
  }
  if (code === 'R003' && year === 2024) {
    return { intensity: 93.5, fuel: 5100 };
  }
  if (code === 'R004' && year === 2025) {
    return { intensity: 89.2, fuel: 4900 };
  }
  if (code === 'R005' && year === 2025) {
    return { intensity: 90.5, fuel: 4950 };
  }
  const defaults: Record<string, { intensity: number; fuel: number }> = {
    R001: { intensity: 87.2, fuel: 100 },
    R002: { intensity: 91.4, fuel: 85 },
    R003: { intensity: 93.1, fuel: 110 },
    R004: { intensity: 88.9, fuel: 72 },
    R005: { intensity: 90.5, fuel: 95 },
  };
  return defaults[code] ?? { intensity: 90.0, fuel: 100 };
}

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

  const routes = await prisma.route.findMany();
  const idByCode = new Map(routes.map((x) => [x.code, x.id] as const));

  const PLAN_YEARS = [2024, 2025, 2026] as const;

  for (const planYear of PLAN_YEARS) {
    for (const code of ['R001', 'R002', 'R003', 'R004', 'R005'] as const) {
      const routeId = idByCode.get(code);
      if (!routeId) {
        throw new Error(`Missing route ${code}`);
      }
      const { intensity, fuel } = intensityFuelFor(code, planYear);
      const shipId = `SHIP-${code}`;
      await prisma.shipCompliance.upsert({
        where: { shipId_year: { shipId, year: planYear } },
        update: {
          actualIntensityGco2eMj: intensity,
          fuelConsumptionTons: fuel,
          targetIntensityGco2eMj: 89.3368,
          routeId,
        },
        create: {
          shipId,
          year: planYear,
          routeId,
          actualIntensityGco2eMj: intensity,
          fuelConsumptionTons: fuel,
          targetIntensityGco2eMj: 89.3368,
        },
      });
    }

    await prisma.shipCompliance.upsert({
      where: { shipId_year: { shipId: 'SEED-SHIP-1', year: planYear } },
      update: {
        actualIntensityGco2eMj: 90.0,
        fuelConsumptionTons: 120.5,
        targetIntensityGco2eMj: 89.3368,
      },
      create: {
        shipId: 'SEED-SHIP-1',
        year: planYear,
        actualIntensityGco2eMj: 90.0,
        fuelConsumptionTons: 120.5,
        targetIntensityGco2eMj: 89.3368,
      },
    });
  }
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
