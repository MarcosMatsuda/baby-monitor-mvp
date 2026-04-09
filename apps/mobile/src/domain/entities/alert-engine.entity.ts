import {
  ALERT_WINDOW_SIZE,
  ALERT_DEBOUNCE_COUNT,
  ALERT_DISMISS_DELAY_MS,
  type AlertState,
} from '@babycam/shared-types';

export type AlertAction = 'trigger' | 'dismiss' | 'none';

export class AlertEngine {
  private readings: number[] = [];
  private consecutiveBreaches = 0;
  private state: AlertState = 'idle';
  private lastBelowTs = 0;

  push(db: number, threshold: number): AlertAction {
    this.readings.push(db);
    if (this.readings.length > ALERT_WINDOW_SIZE) {
      this.readings.shift();
    }

    const avg = this.readings.reduce((a, b) => a + b, 0) / this.readings.length;

    if (avg > threshold) {
      this.consecutiveBreaches++;
      this.lastBelowTs = 0;

      if (this.state === 'idle' && this.consecutiveBreaches >= ALERT_DEBOUNCE_COUNT) {
        this.state = 'triggered';
        return 'trigger';
      }
    } else {
      this.consecutiveBreaches = 0;

      if (this.state === 'triggered') {
        if (!this.lastBelowTs) {
          this.lastBelowTs = Date.now();
        }
        if (Date.now() - this.lastBelowTs > ALERT_DISMISS_DELAY_MS) {
          this.state = 'idle';
          return 'dismiss';
        }
      }
    }

    return 'none';
  }

  dismiss(): void {
    this.state = 'idle';
    this.consecutiveBreaches = 0;
    this.lastBelowTs = 0;
  }

  getState(): AlertState {
    return this.state;
  }

  reset(): void {
    this.readings = [];
    this.consecutiveBreaches = 0;
    this.state = 'idle';
    this.lastBelowTs = 0;
  }
}
