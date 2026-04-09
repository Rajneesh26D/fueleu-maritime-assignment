import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  ComposedChart,
  Legend,
} from 'recharts';
import type { ComplianceSnapshotDto, RouteDto } from '../../../../core/ports/fuel-eu-api.port.js';
import { shipIdForRouteCode } from '../../../infrastructure/ship-id.js';
import { TARGET_INTENSITY_GCO2E_PER_MJ } from '../../../../shared/fuel-eu.js';
import { useFuelEuApi } from '../../useFuelEuApi.js';

interface RowModel {
  readonly route: RouteDto;
  readonly snapshot: ComplianceSnapshotDto | null;
  readonly ghg: number | null;
  readonly percentDiff: number | null;
  readonly compliant: boolean | null;
}

export function CompareTab(): ReactElement {
  const api = useFuelEuApi();
  const [year, setYear] = useState(2025);
  const [rows, setRows] = useState<RowModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listRoutes();

      const snapshots = await Promise.all(
        list.map(async (r) => {
          const shipId = shipIdForRouteCode(r.code);
          try {
            const snap = await api.getComplianceBalance(shipId, year);
            return { route: r, snapshot: snap };
          } catch {
            return { route: r, snapshot: null };
          }
        }),
      );

      const baseline = snapshots.find((s) => s.route.isBaseline);
      const baselineGhg = baseline?.snapshot?.actualIntensityGco2ePerMj ?? null;

      const built: RowModel[] = snapshots.map(({ route, snapshot }) => {
        const ghg = snapshot?.actualIntensityGco2ePerMj ?? null;
        let percentDiff: number | null = null;
        if (ghg !== null && baselineGhg !== null && baselineGhg > 0) {
          if (route.isBaseline) {
            percentDiff = 0;
          } else {
            percentDiff = ((ghg / baselineGhg) - 1) * 100;
          }
        }
        const compliant = ghg !== null ? ghg <= TARGET_INTENSITY_GCO2E_PER_MJ : null;
        return { route, snapshot, ghg, percentDiff, compliant };
      });

      setRows(built);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  }, [api, year]);

  useEffect(() => {
    void load();
  }, [load]);

  const chartData = useMemo(
    () =>
      rows
        .filter((r) => r.ghg !== null)
        .map((r) => ({
          code: r.route.code,
          intensity: r.ghg as number,
          baseline: TARGET_INTENSITY_GCO2E_PER_MJ,
        })),
    [rows],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Compare</h2>
          <p className="mt-1 text-sm text-slate-400">
            GHG intensity (gCO2e/MJ) vs baseline route. % diff = ((comparison / baseline) − 1) × 100. Target{' '}
            {TARGET_INTENSITY_GCO2E_PER_MJ}.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Year
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
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

      <div className="space-y-6">
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-300">Intensity table</h3>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="px-3 py-2 font-medium">Route</th>
                <th className="px-3 py-2 font-medium">GHG intensity</th>
                <th className="px-3 py-2 font-medium">% vs baseline</th>
                <th className="px-3 py-2 font-medium">vs target</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.route.id} className="border-b border-slate-800/80">
                    <td className="px-3 py-2">
                      <span className="font-mono text-emerald-300">{row.route.code}</span>
                      {row.route.isBaseline && (
                        <span className="ml-2 text-xs text-amber-400/90">baseline</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-200">
                      {row.ghg !== null ? row.ghg.toFixed(4) : '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {row.percentDiff !== null ? `${row.percentDiff.toFixed(2)}%` : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {row.compliant === null ? (
                        '—'
                      ) : row.compliant ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400" title="Compliant with target">
                          <Check className="h-5 w-5" aria-hidden />
                          <span className="sr-only">Compliant</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400" title="Above target">
                          <X className="h-5 w-5" aria-hidden />
                          <span className="sr-only">Non-compliant</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-300">GHG intensity — bar &amp; line (vs regulatory target)</h3>
          <div className="h-80 w-full min-w-[280px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="code" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <ReferenceLine y={TARGET_INTENSITY_GCO2E_PER_MJ} stroke="#fbbf24" strokeDasharray="4 4" />
                  <Bar dataKey="intensity" fill="#34d399" name="GHG intensity" barSize={32} radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    dot={false}
                    name="Target (89.3368)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {rows.length > 0 && !loading && (
        <p className="text-xs text-slate-500">
          Data: <code className="text-slate-400">GET /compliance/cb</code> for{' '}
          <code className="text-slate-400">SHIP-{'{code}'}</code> ships (seeded per route).
        </p>
      )}
    </section>
  );
}
