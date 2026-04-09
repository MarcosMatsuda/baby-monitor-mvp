export interface IAudioLevelEntity {
  readonly db: number;
  readonly ts: number;
  readonly isAboveThreshold: boolean;
}

export class AudioLevel implements IAudioLevelEntity {
  constructor(
    public readonly db: number,
    public readonly ts: number = Date.now(),
    private readonly threshold: number = -35,
  ) {}

  get isAboveThreshold(): boolean {
    return this.db > this.threshold;
  }

  get isSilence(): boolean {
    return this.db < -45;
  }

  toJson(): string {
    return JSON.stringify({ type: 'db', value: Math.round(this.db * 10) / 10, ts: this.ts });
  }
}
