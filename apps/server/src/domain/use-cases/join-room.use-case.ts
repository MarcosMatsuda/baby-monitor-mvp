import type { IRoomRepository, PeerJoinedDto } from '@babycam/shared-types';

interface IJoinRoomInput {
  readonly roomCode: string;
  readonly babyPeerId: string;
}

type JoinRoomResult =
  | { success: true; data: PeerJoinedDto }
  | { success: false; error: string };

export class JoinRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  execute(input: IJoinRoomInput): JoinRoomResult {
    const room = this.roomRepository.findByCode(input.roomCode);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.babyPeerId) {
      return { success: false, error: 'Room full' };
    }

    const updated = this.roomRepository.addBaby(input.roomCode, input.babyPeerId);

    if (!updated) {
      return { success: false, error: 'Failed to join room' };
    }

    return {
      success: true,
      data: { peerId: input.babyPeerId, role: 'baby' },
    };
  }
}
