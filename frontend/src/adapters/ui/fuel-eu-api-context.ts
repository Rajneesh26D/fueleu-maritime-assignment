import { createContext } from 'react';
import type { FuelEuApiPort } from '../../core/ports/fuel-eu-api.port.js';

export const FuelEuApiContext = createContext<FuelEuApiPort | null>(null);
