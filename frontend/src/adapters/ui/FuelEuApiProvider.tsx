import type { ReactElement, ReactNode } from 'react';
import type { FuelEuApiPort } from '../../core/ports/fuel-eu-api.port.js';
import { FuelEuApiContext } from './fuel-eu-api-context.js';

export function FuelEuApiProvider(props: {
  readonly api: FuelEuApiPort;
  readonly children: ReactNode;
}): ReactElement {
  return <FuelEuApiContext.Provider value={props.api}>{props.children}</FuelEuApiContext.Provider>;
}
