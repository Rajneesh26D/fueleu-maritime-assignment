import type { ReactElement } from 'react';
import { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { BankingTab } from './tabs/BankingTab.js';
import { CompareTab } from './tabs/CompareTab.js';
import { PoolingTab } from './tabs/PoolingTab.js';
import { RoutesTab } from './tabs/RoutesTab.js';

const TABS = [
  { id: 'routes' as const, label: 'Routes' },
  { id: 'compare' as const, label: 'Compare' },
  { id: 'banking' as const, label: 'Banking' },
  { id: 'pooling' as const, label: 'Pooling' },
];

export function DashboardPage(): ReactElement {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('routes');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <LayoutDashboard className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">Fuel EU Compliance</h1>
              <p className="text-sm text-slate-400">Maritime dashboard</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Primary">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === 'routes' && <RoutesTab />}
        {tab === 'compare' && <CompareTab />}
        {tab === 'banking' && <BankingTab />}
        {tab === 'pooling' && <PoolingTab />}
      </main>
    </div>
  );
}
