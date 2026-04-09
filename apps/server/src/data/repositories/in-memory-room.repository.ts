import type { IRoomRepository, RoomEntity, PeerRole } from '@babycam/shared-types';
import { Room } from '../../domain/entities/room.entity';

export class InMemoryRoomRepository implements IRoomRepository {
  private readonly rooms = new Map<string, Room>();

  create(code: string, parentPeerId: string): RoomEntity {
    const room = new Room(code, null, parentPeerId);
    this.rooms.set(code, room);
    return room;
  }

  findByCode(code: string): RoomEntity | null {
    return this.rooms.get(code) ?? null;
  }

  addBaby(code: string, babyPeerId: string): RoomEntity | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    room.addPeer(babyPeerId, 'baby');
    return room;
  }

  removePeer(code: string, role: PeerRole): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.removePeer(role);
  }

  delete(code: string): void {
    this.rooms.delete(code);
  }

  count(): number {
    return this.rooms.size;
  }
}
