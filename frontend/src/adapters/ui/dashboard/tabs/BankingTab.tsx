import { useCallback, useState } from 'react';
import { Landmark, Loader2 } from 'lucide-react';
import type { ComplianceSnapshotDto } from '../../../../core/ports/fuel-eu-api.port.js';
import { TARGET_INTENSITY_GCO2E_PER_MJ } from '../../../../shared/fuel-eu.js';
import { useFuelEuApi } from '../../useFuelEuApi.js';

export function BankingTab(): React.ReactElement {
  const api = useFuelEuApi();
  const [shipId, setShipId] = useState('SEED-SHIP-1');
  const [year, setYear] = useState(2025);
  const [snapshot, setSnapshot] = useState<ComplianceSnapshotDto | null>(null);
  const [adjusted, setAdjusted] = useState<number | null>(null);
  const [records, setRecords] = useState<
    readonly { id: string; kind: 'BANK' | 'APPLY'; amount: number; createdAt: string }[]
  >([]);
  const [bankBalance, setBankBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankAmount, setBankAmount] = useState('');
  const [applyAmount, setApplyAmount] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cb, bal, adj, rec] = await Promise.all([
        api.getComplianceBalance(shipId, year),
        api.getBankBalance(shipId, year),
        api.getAdjustedComplianceBalance(shipId, year),
        api.getBankingRecords(shipId, year),
      ]);
      setSnapshot(cb);
      setBankBalance(bal);
      setAdjusted(adj.adjustedComplianceBalanceGco2e);
      setRecords(rec);
    } catch (e: unknown) {
      setSnapshot(null);
      setBankBalance(null);
      setAdjusted(null);
      setRecords([]);
      setError(e instanceof Error ? e.message : 'Failed to load banking data');
    } finally {
      setLoading(false);
    }
  }, [api, shipId, year]);

  const cbVal = snapshot?.complianceBalanceGco2e ?? null;
  const bankDisabled = cbVal === null || cbVal <= 0 || busy;
  const applyDisabled = bankBalance === null || bankBalance <= 0 || busy;

  async function onBank(): Promise<void> {
    const amount = Number(bankAmount);
    if (!(amount > 0) || !Number.isFinite(amount)) {
      setError('Enter a positive amount to bank');
      return;
    }
    if (amount > (cbVal ?? 0)) {
      setError('Amount cannot exceed current compliance balance surplus');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.postBank(shipId, year, amount);
      setBankAmount('');
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Bank failed');
    } finally {
      setBusy(false);
    }
  }

  async function onApply(): Promise<void> {
    const amount = Number(applyAmount);
    if (!(amount > 0) || !Number.isFinite(amount)) {
      setError('Enter a positive amount to apply');
      return;
    }
    if (bankBalance !== null && amount > bankBalance) {
      setError('Amount exceeds available bank balance');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.postApply(shipId, year, amount);
      setApplyAmount('');
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Apply failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Banking</h2>
        <p className="mt-1 text-sm text-slate-400">
          Compliance balance (CB) and bank ledger for a ship/year. Bank moves surplus into the bank; Apply
          consumes from the bank. Target intensity reference: {TARGET_INTENSITY_GCO2E_PER_MJ} gCO2e/MJ.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Ship ID
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={shipId}
            onChange={(e) => setShipId(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Year
          <input
            type="number"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-200 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Landmark className="h-4 w-4" />}
          Load CB & bank balance
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-medium text-slate-300">CB (environmental)</h3>
          <p className="mt-1 text-xs text-slate-500">cb_before — GET /compliance/cb</p>
          {loading ? (
            <Loader2 className="mt-4 h-8 w-8 animate-spin text-slate-500" />
          ) : (
            <p className="mt-2 font-mono text-2xl text-white">
              {cbVal !== null ? `${cbVal.toLocaleString(undefined, { maximumFractionDigits: 2 })} gCO2e` : '—'}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">Bank disabled when CB ≤ 0.</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-medium text-slate-300">Adjusted CB</h3>
          <p className="mt-1 text-xs text-slate-500">cb_after bank ops — GET /compliance/adjusted-cb</p>
          {loading ? (
            <Loader2 className="mt-4 h-8 w-8 animate-spin text-slate-500" />
          ) : (
            <p className="mt-2 font-mono text-2xl text-amber-200">
              {adjusted !== null ? `${adjusted.toLocaleString(undefined, { maximumFractionDigits: 2 })} gCO2e` : '—'}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-medium text-slate-300">Bank ledger balance</h3>
          <p className="mt-1 text-xs text-slate-500">available — GET /banking/balance</p>
          {loading ? (
            <Loader2 className="mt-4 h-8 w-8 animate-spin text-slate-500" />
          ) : (
            <p className="mt-2 font-mono text-2xl text-emerald-300">
              {bankBalance !== null
                ? `${bankBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} gCO2e`
                : '—'}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">Apply disabled when ledger ≤ 0.</p>
        </div>
      </div>

      {!loading && records.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-300">Banking records (GET /banking/records)</h3>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 pr-4">Kind</th>
                <th className="py-2 pr-4 text-right">Amount (gCO2e)</th>
                <th className="py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-slate-800/80">
                  <td className="py-2 text-slate-300">{r.kind}</td>
                  <td className="py-2 text-right font-mono text-slate-200">{r.amount.toLocaleString()}</td>
                  <td className="py-2 text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
          <h3 className="text-sm font-medium text-white">Bank surplus</h3>
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Amount (gCO2e)
            <input
              type="number"
              min={0}
              step="any"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={bankAmount}
              onChange={(e) => setBankAmount(e.target.value)}
              disabled={bankDisabled}
            />
          </label>
          <button
            type="button"
            disabled={bankDisabled}
            onClick={() => void onBank()}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-emerald-500"
          >
            Bank
          </button>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
          <h3 className="text-sm font-medium text-white">Apply from bank</h3>
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Amount (gCO2e)
            <input
              type="number"
              min={0}
              step="any"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={applyAmount}
              onChange={(e) => setApplyAmount(e.target.value)}
              disabled={applyDisabled}
            />
          </label>
          <button
            type="button"
            disabled={applyDisabled}
            onClick={() => void onApply()}
            className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-sky-500"
          >
            Apply
          </button>
        </div>
      </div>
    </section>
  );
}
