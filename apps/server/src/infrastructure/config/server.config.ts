export interface IServerConfig {
  readonly port: number;
  readonly corsOrigin: string;
}

export function loadConfig(): IServerConfig {
  return {
    port: Number(process.env.PORT) || 3003,
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
  };
}
