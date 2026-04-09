import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FuelEuApiPort } from '../../../core/ports/fuel-eu-api.port.js';
import { FuelEuApiProvider } from '../FuelEuApiProvider.js';
import { DashboardPage } from './DashboardPage.js';

function createMockApi(): FuelEuApiPort {
  return {
    listRoutes: vi.fn().mockResolvedValue([]),
    setBaselineRoute: vi.fn().mockResolvedValue(undefined),
    getComplianceBalance: vi.fn().mockResolvedValue({
      shipId: 'S',
      year: 2025,
      targetIntensityGco2ePerMj: 89.3368,
      actualIntensityGco2ePerMj: 88,
      fuelConsumptionTons: 1,
      energyMj: 41_000,
      complianceBalanceGco2e: 0,
      computedAt: new Date().toISOString(),
    }),
    getBankBalance: vi.fn().mockResolvedValue(0),
    postBank: vi.fn().mockResolvedValue(undefined),
    postApply: vi.fn().mockResolvedValue(undefined),
    createPool: vi.fn().mockResolvedValue({
      poolId: 'p',
      transfers: [],
      surplusRemainingGco2e: 0,
    }),
  };
}

describe('DashboardPage', () => {
  it('renders shell and primary navigation', () => {
    const api = createMockApi();
    render(
      <FuelEuApiProvider api={api}>
        <DashboardPage />
      </FuelEuApiProvider>,
    );
    expect(screen.getByRole('heading', { name: /Fuel EU Compliance/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compare' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });
});
