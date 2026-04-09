import type { ConnectionState } from '@baby-monitor/shared-types';

export interface IConnectionEntity {
  readonly state: ConnectionState;
  readonly roomCode: string | null;
  readonly connectedAt: number | null;
}

export class Connection implements IConnectionEntity {
  public state: ConnectionState = 'idle';
  public roomCode: string | null = null;
  public connectedAt: number | null = null;

  transition(next: ConnectionState): void {
    this.state = next;
    if (next === 'connected' && !this.connectedAt) {
      this.connectedAt = Date.now();
    }
    if (next === 'disconnected' || next === 'idle') {
      this.connectedAt = null;
    }
  }

  get elapsedSeconds(): number {
    if (!this.connectedAt) return 0;
    return Math.floor((Date.now() - this.connectedAt) / 1000);
  }
}
