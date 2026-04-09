export interface IDbReadingEntity {
  readonly value: number;
  readonly ts: number;
}

export class DbReading implements IDbReadingEntity {
  constructor(
    public readonly value: number,
    public readonly ts: number = Date.now(),
  ) {}

  get isSilence(): boolean {
    return this.value < -45;
  }

  get isQuiet(): boolean {
    return this.value >= -45 && this.value < -30;
  }

  get isModerate(): boolean {
    return this.value >= -30 && this.value < -20;
  }

  get isLoud(): boolean {
    return this.value >= -20;
  }
}
