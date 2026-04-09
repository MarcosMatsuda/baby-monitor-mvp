import type { IRoomRepository, RoomCreatedDto } from '@baby-monitor/shared-types';
import { Room } from '../entities/room.entity';

interface ICreateRoomInput {
  readonly parentPeerId: string;
}

export class CreateRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  execute(input: ICreateRoomInput): RoomCreatedDto {
    let code: string;
    do {
      code = Room.generateCode();
    } while (this.roomRepository.findByCode(code) !== null);

    this.roomRepository.create(code, input.parentPeerId);
    return { roomCode: code };
  }
}
