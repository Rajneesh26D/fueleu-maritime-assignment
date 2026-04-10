import { useCallback, useEffect, useMemo, useState } from 'react';
import { Anchor, Loader2 } from 'lucide-react';
import type { RouteDto, RouteWithMetricsDto } from '../../../../core/ports/fuel-eu-api.port.js';
import { getRouteFilterMeta } from '../../../infrastructure/route-filters.meta.js';
import { useFuelEuApi } from '../../useFuelEuApi.js';

const VESSEL_OPTIONS = ['All', 'Container', 'Tanker', 'RoPax', 'Bulk', 'BulkCarrier', 'RoRo'] as const;
const FUEL_OPTIONS = ['All', 'MGO', 'LNG', 'HFO', 'Methanol'] as const;
const YEAR_OPTIONS = ['All', 2024, 2025, 2026] as const;

export function RoutesTab(): React.ReactElement {
  const api = useFuelEuApi();
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [routesMetrics, setRoutesMetrics] = useState<RouteWithMetricsDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [vesselFilter, setVesselFilter] = useState<(typeof VESSEL_OPTIONS)[number]>('All');
  const [fuelFilter, setFuelFilter] = useState<(typeof FUEL_OPTIONS)[number]>('All');
  const [yearFilter, setYearFilter] = useState<(typeof YEAR_OPTIONS)[number]>('All');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (yearFilter === 'All') {
        const data = await api.listRoutes();
        setRoutes(data);
        setRoutesMetrics(null);
      } else {
        const data = await api.listRoutesWithMetrics(yearFilter);
        setRoutesMetrics(data);
        setRoutes([]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  }, [api, yearFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (routesMetrics) {
      return routesMetrics.filter((r) => {
        if (vesselFilter !== 'All' && r.vesselType !== vesselFilter) {
          return false;
        }
        if (fuelFilter !== 'All' && r.fuelType !== fuelFilter) {
          return false;
        }
        return true;
      });
    }
    return routes.filter((r) => {
      const meta = getRouteFilterMeta(r.code);
      if (!meta) {
        return true;
      }
      if (vesselFilter !== 'All' && meta.vesselType !== vesselFilter) {
        return false;
      }
      if (fuelFilter !== 'All' && meta.fuelType !== fuelFilter) {
        return false;
      }
      if (yearFilter !== 'All' && !meta.activeYears.includes(yearFilter)) {
        return false;
      }
      return true;
    });
  }, [routes, routesMetrics, vesselFilter, fuelFilter, yearFilter]);

  async function onSetBaseline(routeKey: string): Promise<void> {
    setBusyId(routeKey);
    setError(null);
    try {
      await api.setBaselineRoute(routeKey);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to set baseline');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Routes</h2>
        <p className="mt-1 text-sm text-slate-400">
          Select a <strong>year</strong> to load KPI columns from <code className="text-slate-400">GET /routes?year=…</code>{' '}
          (assignment dataset + live intensities). “All” uses <code className="text-slate-400">GET /routes</code> with UI
          metadata filters.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Vessel type
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={vesselFilter}
            onChange={(e) => setVesselFilter(e.target.value as (typeof VESSEL_OPTIONS)[number])}
          >
            {VESSEL_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Fuel type
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={fuelFilter}
            onChange={(e) => setFuelFilter(e.target.value as (typeof FUEL_OPTIONS)[number])}
          >
            {FUEL_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Year
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={yearFilter === 'All' ? 'All' : String(yearFilter)}
            onChange={(e) => {
              const v = e.target.value;
              setYearFilter(v === 'All' ? 'All' : (Number(v) as 2024 | 2025 | 2026));
            }}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={String(y)} value={String(y)}>
                {String(y)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="px-4 py-3 font-medium">routeId</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Name</th>
              {routesMetrics && (
                <>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Vessel</th>
                  <th className="px-4 py-3 font-medium">Fuel</th>
                  <th className="px-4 py-3 font-medium text-right">ghg (gCO2e/MJ)</th>
                  <th className="px-4 py-3 font-medium text-right">fuel (t)</th>
                  <th className="px-4 py-3 font-medium text-right">distance (km)</th>
                  <th className="px-4 py-3 font-medium text-right">emissions (t)</th>
                </>
              )}
              {!routesMetrics && (
                <>
                  <th className="px-4 py-3 font-medium">Vessel</th>
                  <th className="px-4 py-3 font-medium">Fuel</th>
                </>
              )}
              <th className="px-4 py-3 font-medium">Baseline</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={routesMetrics ? 12 : 7} className="px-4 py-12 text-center text-slate-500">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" aria-label="Loading" />
                </td>
              </tr>
            ) : routesMetrics ? (
              (filtered as RouteWithMetricsDto[]).map((r) => (
                <tr key={r.routeId} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.routeId.slice(0, 8)}…</td>
                  <td className="px-4 py-3 font-mono text-emerald-300">{r.code}</td>
                  <td className="px-4 py-3 text-slate-200">{r.name}</td>
                  <td className="px-4 py-3 text-slate-400">{r.year}</td>
                  <td className="px-4 py-3 text-slate-400">{r.vesselType ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{r.fuelType ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {r.ghgIntensityGco2ePerMj !== null ? r.ghgIntensityGco2ePerMj.toFixed(2) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {r.fuelConsumptionTons !== null ? r.fuelConsumptionTons.toFixed(0) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {r.distanceKm !== null ? String(r.distanceKm) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {r.totalEmissionsTons !== null ? String(r.totalEmissionsTons) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {r.isBaseline ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
                        <Anchor className="h-3.5 w-3.5" aria-hidden />
                        Baseline
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={busyId !== null || r.isBaseline}
                      onClick={() => void onSetBaseline(r.routeId)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white"
                    >
                      {busyId === r.routeId ? '…' : 'Set baseline'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              (filtered as RouteDto[]).map((r) => {
                const meta = getRouteFilterMeta(r.code);
                return (
                  <tr key={r.id} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 font-mono text-emerald-300">{r.code}</td>
                    <td className="px-4 py-3 text-slate-200">{r.name}</td>
                    <td className="px-4 py-3 text-slate-400">{meta?.vesselType ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{meta?.fuelType ?? '—'}</td>
                    <td className="px-4 py-3">
                      {r.isBaseline ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
                          <Anchor className="h-3.5 w-3.5" aria-hidden />
                          Baseline
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={busyId !== null || r.isBaseline}
                        onClick={() => void onSetBaseline(r.id)}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white"
                      >
                        {busyId === r.id ? '…' : 'Set baseline'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
