import type { AppConfigPort } from '../../core/ports/app-config.port';

export class StaticAppConfigAdapter implements AppConfigPort {
  getAppTitle(): string {
    return 'FuelEU Maritime Assignment';
  }
}
