import type { AppConfigPort } from '../ports/app-config.port';

export interface AppMetadata {
  readonly title: string;
}

export class GetAppMetadataUseCase {
  private readonly config: AppConfigPort;

  constructor(config: AppConfigPort) {
    this.config = config;
  }

  execute(): AppMetadata {
    return { title: this.config.getAppTitle() };
  }
}
