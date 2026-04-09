import type { ConnectionState } from '@babycam/shared-types';
import { semantic, getDbColor } from '@babycam/design-tokens';

export class BabyStationUi {
  private statusEl: HTMLElement;
  private dbMeterEl: HTMLElement;
  private dbValueEl: HTMLElement;
  private timerEl: HTMLElement;
  private disconnectBtn: HTMLButtonElement;
  private errorEl: HTMLElement;
  private containerEl: HTMLElement;

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private startTime = 0;

  constructor() {
    this.containerEl = document.getElementById('app') as HTMLElement;
    this.statusEl = document.getElementById('status') as HTMLElement;
    this.dbMeterEl = document.getElementById('db-meter') as HTMLElement;
    this.dbValueEl = document.getElementById('db-value') as HTMLElement;
    this.timerEl = document.getElementById('timer') as HTMLElement;
    this.disconnectBtn = document.getElementById('disconnect-btn') as HTMLButtonElement;
    this.errorEl = document.getElementById('error') as HTMLElement;
  }

  setConnectionState(state: ConnectionState): void {
    const labels: Record<ConnectionState, string> = {
      idle: 'Inicializando...',
      waiting: 'Aguardando parent...',
      connecting: 'Conectando...',
      connected: 'Transmitindo',
      reconnecting: 'Reconectando...',
      disconnected: 'Desconectado',
    };

    const colors: Record<ConnectionState, string> = {
      idle: semantic.text.muted,
      waiting: semantic.status.reconnecting,
      connecting: semantic.status.reconnecting,
      connected: semantic.status.connected,
      reconnecting: semantic.status.reconnecting,
      disconnected: semantic.status.disconnected,
    };

    this.statusEl.textContent = labels[state];
    this.statusEl.style.color = colors[state];

    if (state === 'connected') {
      this.startTimer();
      this.dimScreen();
      this.disconnectBtn.style.display = 'block';
    }

    if (state === 'disconnected') {
      this.stopTimer();
      this.undimScreen();
    }
  }

  updateDbLevel(db: number): void {
    const normalized = Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
    const color = getDbColor(db);

    this.dbMeterEl.style.width = `${normalized}%`;
    this.dbMeterEl.style.backgroundColor = color;
    this.dbValueEl.textContent = `${Math.round(db)} dB`;
    this.dbValueEl.style.color = color;
  }

  showError(message: string): void {
    this.errorEl.textContent = message;
    this.errorEl.style.display = 'block';
  }

  onDisconnect(callback: () => void): void {
    this.disconnectBtn.addEventListener('click', callback);
  }

  private startTimer(): void {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      this.timerEl.textContent = `${h}:${m}:${s}`;
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private dimScreen(): void {
    this.containerEl.style.filter = 'brightness(0.3)';
  }

  private undimScreen(): void {
    this.containerEl.style.filter = 'none';
  }
}
