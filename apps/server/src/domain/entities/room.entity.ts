import {
  type RoomEntity,
  type PeerRole,
  ROOM_CODE_LENGTH,
  ROOM_CODE_CHARS,
} from '@baby-monitor/shared-types';

export class Room implements RoomEntity {
  constructor(
    public readonly code: string,
    public babyPeerId: string | null,
    public parentPeerId: string | null,
    public readonly createdAt: number = Date.now(),
  ) {}

  get isFull(): boolean {
    return this.babyPeerId !== null && this.parentPeerId !== null;
  }

  get isEmpty(): boolean {
    return this.babyPeerId === null && this.parentPeerId === null;
  }

  get peerCount(): number {
    return (this.babyPeerId ? 1 : 0) + (this.parentPeerId ? 1 : 0);
  }

  addPeer(peerId: string, role: PeerRole): void {
    if (role === 'baby') {
      if (this.babyPeerId) throw new Error('Baby slot already taken');
      this.babyPeerId = peerId;
    } else {
      if (this.parentPeerId) throw new Error('Parent slot already taken');
      this.parentPeerId = peerId;
    }
  }

  removePeer(role: PeerRole): void {
    if (role === 'baby') this.babyPeerId = null;
    else this.parentPeerId = null;
  }

  static generateCode(): string {
    let code = '';
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
      code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
    }
    return code;
  }
}
