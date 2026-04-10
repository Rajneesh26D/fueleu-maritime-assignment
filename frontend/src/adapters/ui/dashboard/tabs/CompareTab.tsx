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
import type { RouteComparisonRowDto } from '../../../../core/ports/fuel-eu-api.port.js';
import { TARGET_INTENSITY_GCO2E_PER_MJ } from '../../../../shared/fuel-eu.js';
import { useFuelEuApi } from '../../useFuelEuApi.js';

export function CompareTab(): ReactElement {
  const api = useFuelEuApi();
  const [year, setYear] = useState(2025);
  const [rows, setRows] = useState<readonly RouteComparisonRowDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRoutesComparison(year);
      setRows(data.rows);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  }, [api, year]);

  useEffect(() => {
    void load();
  }, [load]);

  const regulatoryTargetRef = useMemo(() => {
    const t = rows.map((r) => r.targetIntensityGco2ePerMj).find((v) => Number.isFinite(v));
    return t ?? TARGET_INTENSITY_GCO2E_PER_MJ;
  }, [rows]);

  const chartData = useMemo(
    () =>
      rows.map((r) => ({
        code: r.routeCode,
        intensity: r.ghgIntensityGco2ePerMj,
        baseline: regulatoryTargetRef,
      })),
    [rows, regulatoryTargetRef],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Compare</h2>
          <p className="mt-1 text-sm text-slate-400">
            Data from <code className="text-slate-300">GET /routes/comparison?year=…</code>. GHG intensity actual
            (gCO2e/MJ). <strong>% vs baseline</strong>:{' '}
            <code className="text-slate-300">((comparison / baseline) - 1) × 100</code>. <strong>vs target</strong>:{' '}
            {TARGET_INTENSITY_GCO2E_PER_MJ} gCO2e/MJ (2025 target 89.3368). Seed:{' '}
            <code className="text-slate-300">npm run prisma:seed</code>.
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

      {!loading && chartData.length === 0 && !error && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          No comparison rows for <strong>{String(year)}</strong> — run backend seed.
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
                  <tr key={row.routeId} className="border-b border-slate-800/80">
                    <td className="px-3 py-2">
                      <span className="font-mono text-emerald-300">{row.routeCode}</span>
                      {row.isBaseline && (
                        <span className="ml-2 text-xs text-amber-400/90">baseline</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-200">
                      {row.ghgIntensityGco2ePerMj.toFixed(4)}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {row.percentDiff !== null ? `${row.percentDiff.toFixed(2)}%` : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {row.compliant ? (
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
                  <ReferenceLine y={regulatoryTargetRef} stroke="#fbbf24" strokeDasharray="4 4" />
                  <Bar dataKey="intensity" fill="#34d399" name="GHG intensity" barSize={32} radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    dot={false}
                    name={`Target (${regulatoryTargetRef.toFixed(4)})`}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {rows.length > 0 && !loading && (
        <p className="text-xs text-slate-500">
          Data: <code className="text-slate-400">GET /routes/comparison</code> for year {year}.
        </p>
      )}
    </section>
  );
}
