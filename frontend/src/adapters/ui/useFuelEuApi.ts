import { useContext } from 'react';
import type { FuelEuApiPort } from '../../core/ports/fuel-eu-api.port.js';
import { FuelEuApiContext } from './fuel-eu-api-context.js';

export function useFuelEuApi(): FuelEuApiPort {
  const ctx = useContext(FuelEuApiContext);
  if (!ctx) {
    throw new Error('useFuelEuApi must be used within FuelEuApiProvider');
  }
  return ctx;
}
