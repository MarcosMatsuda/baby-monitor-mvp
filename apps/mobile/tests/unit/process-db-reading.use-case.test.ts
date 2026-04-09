import { ProcessDbReadingUseCase } from '../../src/domain/use-cases/process-db-reading.use-case';
import { AlertEngine } from '../../src/domain/entities/alert-engine.entity';

describe('ProcessDbReadingUseCase', () => {
  let useCase: ProcessDbReadingUseCase;
  let alertEngine: AlertEngine;

  beforeEach(() => {
    alertEngine = new AlertEngine();
    useCase = new ProcessDbReadingUseCase(alertEngine);
  });

  it('should create a DbReading from input', () => {
    const result = useCase.execute({
      value: -42.5,
      ts: 1000,
      threshold: -35,
    });

    expect(result.reading.value).toBe(-42.5);
    expect(result.reading.ts).toBe(1000);
    expect(result.alertAction).toBe('none');
  });

  it('should classify silence correctly', () => {
    const result = useCase.execute({
      value: -50,
      ts: 1000,
      threshold: -35,
    });

    expect(result.reading.isSilence).toBe(true);
    expect(result.reading.isLoud).toBe(false);
  });

  it('should classify loud correctly', () => {
    const result = useCase.execute({
      value: -15,
      ts: 1000,
      threshold: -35,
    });

    expect(result.reading.isLoud).toBe(true);
    expect(result.reading.isSilence).toBe(false);
  });

  it('should delegate alert logic to engine', () => {
    const spy = jest.spyOn(alertEngine, 'push');

    useCase.execute({ value: -10, ts: 1000, threshold: -35 });

    expect(spy).toHaveBeenCalledWith(-10, -35);
  });
});
