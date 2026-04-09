/**
 * UI-only metadata for Routes tab filters (vessel / fuel / active years).
 * Not stored on the backend in Phase 3.
 */
export interface RouteFilterMeta {
  readonly vesselType: 'Container' | 'Tanker' | 'RoPax' | 'Bulk';
  readonly fuelType: 'MGO' | 'LNG' | 'HFO' | 'Methanol';
  /** Years this route appears in planning filters */
  readonly activeYears: readonly number[];
}

export const ROUTE_FILTER_META: Readonly<Record<string, RouteFilterMeta>> = {
  R001: { vesselType: 'Container', fuelType: 'MGO', activeYears: [2024, 2025, 2026] },
  R002: { vesselType: 'RoPax', fuelType: 'LNG', activeYears: [2024, 2025] },
  R003: { vesselType: 'Tanker', fuelType: 'HFO', activeYears: [2025, 2026] },
  R004: { vesselType: 'Container', fuelType: 'MGO', activeYears: [2024, 2025, 2026] },
  R005: { vesselType: 'Bulk', fuelType: 'Methanol', activeYears: [2025, 2026] },
};

export function getRouteFilterMeta(code: string): RouteFilterMeta | undefined {
  return ROUTE_FILTER_META[code];
}
