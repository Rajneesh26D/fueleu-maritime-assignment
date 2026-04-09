import { useMemo, useRef, useState, type ReactElement } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { useFuelEuApi } from '../../useFuelEuApi.js';

interface MemberRow {
  readonly id: string;
  shipId: string;
  complianceBalance: string;
}

export function PoolingTab(): ReactElement {
  const api = useFuelEuApi();
  const rowId = useRef(2);
  function nextRowId(): string {
    rowId.current += 1;
    return `m-${String(rowId.current)}`;
  }
  const [year, setYear] = useState(2025);
  const [name, setName] = useState('');
  const [members, setMembers] = useState<MemberRow[]>([
    { id: 'm-1', shipId: 'SHIP-R001', complianceBalance: '120' },
    { id: 'm-2', shipId: 'SHIP-R002', complianceBalance: '-50' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const parsedMembers = useMemo(() => {
    return members.map((m) => ({
      id: m.id,
      shipId: m.shipId.trim(),
      value: Number(m.complianceBalance),
    }));
  }, [members]);

  const poolSum = useMemo(() => {
    return parsedMembers.reduce((s, m) => {
      if (!Number.isFinite(m.value)) {
        return s;
      }
      return s + m.value;
    }, 0);
  }, [parsedMembers]);

  const hasInvalidNumber = parsedMembers.some((m) => m.shipId.length > 0 && !Number.isFinite(m.value));
  const hasEmptyShip = parsedMembers.some((m) => m.shipId.length === 0);
  const duplicateShips = useMemo(() => {
    const seen = new Set<string>();
    for (const m of parsedMembers) {
      if (!m.shipId) {
        continue;
      }
      if (seen.has(m.shipId)) {
        return true;
      }
      seen.add(m.shipId);
    }
    return false;
  }, [parsedMembers]);

  const sumOk = Number.isFinite(poolSum) && poolSum >= 0;
  const canCreate =
    !submitting &&
    sumOk &&
    !hasInvalidNumber &&
    !hasEmptyShip &&
    !duplicateShips &&
    parsedMembers.length > 0 &&
    parsedMembers.every((m) => m.shipId.length > 0);

  function addRow(): void {
    setMembers((prev) => [...prev, { id: nextRowId(), shipId: '', complianceBalance: '0' }]);
  }

  function removeRow(id: string): void {
    setMembers((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  async function onCreate(): Promise<void> {
    if (!canCreate) {
      return;
    }
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        year,
        name: name.trim() || undefined,
        members: parsedMembers.map((m) => ({
          shipId: m.shipId,
          complianceBalance: m.value,
        })),
      };
      const res = await api.createPool(payload);
      setResult(
        `Pool ${res.poolId} created. Surplus remaining: ${res.surplusRemainingGco2e.toFixed(2)} gCO2e. Transfers: ${String(res.transfers.length)}.`,
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Pool creation failed');
    } finally {
      setSubmitting(false);
    }
  }

  const sumColor =
    hasInvalidNumber || duplicateShips || hasEmptyShip
      ? 'text-amber-400'
      : poolSum < 0
        ? 'text-red-400'
        : 'text-emerald-400';

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Pooling</h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter member ships and their compliance balance snapshots. Pool sum must be ≥ 0 for a feasible pool.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Year
          <input
            type="number"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Pool name (optional)
          <input
            className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. North Sea Q1"
          />
        </label>
      </div>

      <div
        className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${
          sumOk && !hasInvalidNumber && !duplicateShips && !hasEmptyShip
            ? 'border-emerald-500/40 bg-emerald-500/10'
            : 'border-red-500/40 bg-red-500/10'
        }`}
      >
        {sumOk && !hasInvalidNumber && !duplicateShips && !hasEmptyShip ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-400" aria-hidden />
        ) : (
          <AlertTriangle className="h-6 w-6 text-red-400" aria-hidden />
        )}
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Pool sum (Σ CB)</p>
          <p className={`font-mono text-2xl font-semibold ${sumColor}`}>
            {Number.isFinite(poolSum) ? poolSum.toFixed(2) : '—'}
          </p>
        </div>
        <p className="text-sm text-slate-400">
          {poolSum < 0
            ? 'Sum is negative — pooling is infeasible.'
            : duplicateShips
              ? 'Duplicate ship IDs are not allowed.'
              : hasEmptyShip
                ? 'Each row needs a ship ID.'
                : hasInvalidNumber
                  ? 'Each balance must be a valid number.'
                  : 'Ready to submit when rules pass.'}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      {result && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {result}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="px-4 py-3 font-medium">Ship ID</th>
              <th className="px-4 py-3 font-medium">Compliance balance (gCO2e)</th>
              <th className="px-4 py-3 text-right font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-slate-800/80">
                <td className="px-4 py-2">
                  <input
                    className="w-full min-w-[140px] rounded border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-slate-100"
                    value={m.shipId}
                    onChange={(e) =>
                      setMembers((prev) =>
                        prev.map((r) => (r.id === m.id ? { ...r, shipId: e.target.value } : r)),
                      )
                    }
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="w-full max-w-xs rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100"
                    value={m.complianceBalance}
                    onChange={(e) =>
                      setMembers((prev) =>
                        prev.map((r) => (r.id === m.id ? { ...r, complianceBalance: e.target.value } : r)),
                      )
                    }
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeRow(m.id)}
                    className="rounded p-2 text-slate-500 hover:bg-slate-800 hover:text-red-400"
                    aria-label="Remove row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" />
          Add member
        </button>
        <button
          type="button"
          disabled={!canCreate}
          onClick={() => void onCreate()}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-violet-500"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Create pool
        </button>
      </div>
    </section>
  );
}
