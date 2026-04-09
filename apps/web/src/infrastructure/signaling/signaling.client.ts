import { io, type Socket } from 'socket.io-client';
import type {
  IClientToServerEvents,
  IServerToClientEvents,
  SignalDto,
  PeerJoinedDto,
  PeerDisconnectedDto,
  RoomErrorDto,
} from '@babycam/shared-types';

type TypedSocket = Socket<IServerToClientEvents, IClientToServerEvents>;

export class SignalingClient {
  private socket: TypedSocket | null = null;

  connect(serverUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
      }) as TypedSocket;

      this.socket.on('connect', () => resolve());
      this.socket.on('connect_error', (err) => reject(err));
    });
  }

  joinRoom(roomCode: string): void {
    this.socket?.emit('join-room', { roomCode });
  }

  sendSignal(data: SignalDto): void {
    this.socket?.emit('signal', data);
  }

  onPeerJoined(callback: (data: PeerJoinedDto) => void): void {
    this.socket?.on('peer-joined', callback);
  }

  onSignal(callback: (data: SignalDto) => void): void {
    this.socket?.on('signal', callback);
  }

  onPeerDisconnected(callback: (data: PeerDisconnectedDto) => void): void {
    this.socket?.on('peer-disconnected', callback);
  }

  onRoomError(callback: (data: RoomErrorDto) => void): void {
    this.socket?.on('room-error', callback);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
