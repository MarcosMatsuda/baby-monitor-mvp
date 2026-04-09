import { AlertEngine, type AlertAction } from '../entities/alert-engine.entity';
import { DbReading } from '../entities/db-reading.entity';

interface IProcessDbInput {
  readonly value: number;
  readonly ts: number;
  readonly threshold: number;
}

interface IProcessDbOutput {
  readonly reading: DbReading;
  readonly alertAction: AlertAction;
}

export class ProcessDbReadingUseCase {
  constructor(private readonly alertEngine: AlertEngine) {}

  execute(input: IProcessDbInput): IProcessDbOutput {
    const reading = new DbReading(input.value, input.ts);
    const alertAction = this.alertEngine.push(input.value, input.threshold);

    return { reading, alertAction };
  }
}
