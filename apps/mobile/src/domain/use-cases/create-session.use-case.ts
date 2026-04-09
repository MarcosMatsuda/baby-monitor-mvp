import type { ISignalingRepository } from '@babycam/shared-types';

interface ICreateSessionOutput {
  readonly roomCode: string;
}

export class CreateSessionUseCase {
  constructor(
    private readonly signalingRepository: ISignalingRepository,
  ) {}

  async execute(serverUrl: string): Promise<ICreateSessionOutput> {
    await this.signalingRepository.connect(serverUrl);
    const roomCode = await this.signalingRepository.createRoom();
    return { roomCode };
  }
}
