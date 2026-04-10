/**
 * Assignment KPI dataset (Fuel EU dashboard spec). Used to enrich GET /routes?year=…
 * when presenting vessel/fuel/distance/emissions alongside live compliance rows.
 */
export interface RouteKpi {
  readonly vesselType: string;
  readonly fuelType: string;
  readonly ghgIntensity: number;
  readonly fuelConsumptionTons: number;
  readonly distanceKm: number;
  readonly totalEmissionsTons: number;
}

const KPI = new Map<string, RouteKpi>();

function add(code: string, year: number, k: RouteKpi): void {
  KPI.set(`${code}:${String(year)}`, k);
}

add('R001', 2024, {
  vesselType: 'Container',
  fuelType: 'HFO',
  ghgIntensity: 91.0,
  fuelConsumptionTons: 5000,
  distanceKm: 12000,
  totalEmissionsTons: 4500,
});
add('R002', 2024, {
  vesselType: 'BulkCarrier',
  fuelType: 'LNG',
  ghgIntensity: 88.0,
  fuelConsumptionTons: 4800,
  distanceKm: 11500,
  totalEmissionsTons: 4200,
});
add('R003', 2024, {
  vesselType: 'Tanker',
  fuelType: 'MGO',
  ghgIntensity: 93.5,
  fuelConsumptionTons: 5100,
  distanceKm: 12500,
  totalEmissionsTons: 4700,
});
add('R004', 2025, {
  vesselType: 'RoRo',
  fuelType: 'HFO',
  ghgIntensity: 89.2,
  fuelConsumptionTons: 4900,
  distanceKm: 11800,
  totalEmissionsTons: 4300,
});
add('R005', 2025, {
  vesselType: 'Container',
  fuelType: 'LNG',
  ghgIntensity: 90.5,
  fuelConsumptionTons: 4950,
  distanceKm: 11900,
  totalEmissionsTons: 4400,
});

export function getRouteKpi(code: string, year: number): RouteKpi | undefined {
  return KPI.get(`${code}:${String(year)}`);
}
