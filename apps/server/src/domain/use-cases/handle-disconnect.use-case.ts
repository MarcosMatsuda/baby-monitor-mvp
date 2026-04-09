import type { IRoomRepository, PeerRole } from '@baby-monitor/shared-types';

interface IHandleDisconnectInput {
  readonly roomCode: string;
  readonly role: PeerRole;
}

interface HandleDisconnectResult {
  readonly roomDeleted: boolean;
  readonly remainingPeerId: string | null;
}

export class HandleDisconnectUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  execute(input: IHandleDisconnectInput): HandleDisconnectResult {
    const room = this.roomRepository.findByCode(input.roomCode);

    if (!room) {
      return { roomDeleted: true, remainingPeerId: null };
    }

    this.roomRepository.removePeer(input.roomCode, input.role);

    const updatedRoom = this.roomRepository.findByCode(input.roomCode);

    if (!updatedRoom || (!updatedRoom.babyPeerId && !updatedRoom.parentPeerId)) {
      this.roomRepository.delete(input.roomCode);
      return { roomDeleted: true, remainingPeerId: null };
    }

    const remainingPeerId = updatedRoom.babyPeerId ?? updatedRoom.parentPeerId;
    return { roomDeleted: false, remainingPeerId };
  }
}
