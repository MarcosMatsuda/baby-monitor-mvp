import { AlertEngine } from '../../src/domain/entities/alert-engine.entity';

describe('AlertEngine', () => {
  let engine: AlertEngine;
  const threshold = -35;

  beforeEach(() => {
    engine = new AlertEngine();
  });

  it('should not trigger on a single spike', () => {
    const result = engine.push(-10, threshold);
    expect(result).toBe('none');
    expect(engine.getState()).toBe('idle');
  });

  it('should not trigger with only 2 consecutive breaches', () => {
    engine.push(-10, threshold);
    const result = engine.push(-10, threshold);
    expect(result).toBe('none');
    expect(engine.getState()).toBe('idle');
  });

  it('should trigger after 3+ consecutive breaches above threshold', () => {
    engine.push(-10, threshold);
    engine.push(-10, threshold);
    const result = engine.push(-10, threshold);

    // 3rd consecutive reading above threshold triggers the alert
    expect(result).toBe('trigger');
    expect(engine.getState()).toBe('triggered');
  });

  it('should not trigger if readings are below threshold', () => {
    for (let i = 0; i < 20; i++) {
      const result = engine.push(-50, threshold);
      expect(result).not.toBe('trigger');
    }
    expect(engine.getState()).toBe('idle');
  });

  it('should dismiss manually', () => {
    // Fill buffer above threshold
    for (let i = 0; i < 15; i++) {
      engine.push(-10, threshold);
    }

    engine.dismiss();
    expect(engine.getState()).toBe('idle');
  });

  it('should reset all state', () => {
    for (let i = 0; i < 15; i++) {
      engine.push(-10, threshold);
    }

    engine.reset();
    expect(engine.getState()).toBe('idle');
  });
});
