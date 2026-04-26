// Holds a screen Wake Lock so the baby phone does not dim/sleep
// while it is streaming. Without this the OS turns the screen off
// after a few minutes; once that happens the browser may throttle
// timers, the dB meter loses temporal granularity, and the noise
// alert fires late.
//
// The Wake Lock is released by the OS whenever the page becomes
// hidden (tab switch, screen lock, app backgrounded). To survive
// transient hides we listen for `visibilitychange` and re-acquire
// when the page comes back to the foreground.
//
// Browsers without the Wake Lock API (older iOS Safari, Firefox
// Android) silently no-op — the app keeps working, just without
// the protection.

export class WakeLockRepository {
  private sentinel: WakeLockSentinel | null = null;
  private wantHeld = false;
  private visibilityListener: (() => void) | null = null;

  isSupported(): boolean {
    return 'wakeLock' in navigator;
  }

  async acquire(): Promise<boolean> {
    if (!this.isSupported()) return false;

    this.wantHeld = true;
    await this.requestSentinel();

    if (!this.visibilityListener) {
      this.visibilityListener = () => {
        if (document.visibilityState === 'visible' && this.wantHeld && !this.sentinel) {
          this.requestSentinel().catch(() => {});
        }
      };
      document.addEventListener('visibilitychange', this.visibilityListener);
    }

    return this.sentinel !== null;
  }

  async release(): Promise<void> {
    this.wantHeld = false;

    if (this.visibilityListener) {
      document.removeEventListener('visibilitychange', this.visibilityListener);
      this.visibilityListener = null;
    }

    if (this.sentinel && !this.sentinel.released) {
      try {
        await this.sentinel.release();
      } catch {
        // sentinel might already be released by the OS — safe to ignore
      }
    }
    this.sentinel = null;
  }

  private async requestSentinel(): Promise<void> {
    if (!this.isSupported()) return;

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinel.addEventListener('release', () => {
        this.sentinel = null;
      });
      this.sentinel = sentinel;
    } catch {
      // Permission denied / not allowed in this context — degrade silently
      this.sentinel = null;
    }
  }
}
