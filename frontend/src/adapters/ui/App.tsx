import type { ReactElement } from 'react';
import { FuelEuHttpAdapter } from '../infrastructure/fuel-eu-http.adapter.js';
import { DashboardPage } from './dashboard/DashboardPage.js';
import { FuelEuApiProvider } from './FuelEuApiProvider.js';

const api = new FuelEuHttpAdapter();

export function App(): ReactElement {
  return (
    <FuelEuApiProvider api={api}>
      <DashboardPage />
    </FuelEuApiProvider>
  );
}
