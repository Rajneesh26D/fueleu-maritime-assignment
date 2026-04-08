/** Driving port: application reads app-level configuration through this boundary. */
export interface AppConfigPort {
  getAppTitle(): string;
}
