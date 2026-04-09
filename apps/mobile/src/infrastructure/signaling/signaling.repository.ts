import { io, type Socket } from 'socket.io-client';
import type {
  ISignalingRepository,
  IClientToServerEvents,
  IServerToClientEvents,
  SignalDto,
  PeerJoinedDto,
  PeerDisconnectedDto,
  RoomErrorDto,
} from '@baby-monitor/shared-types';

type TypedSocket = Socket<IServerToClientEvents, IClientToServerEvents>;

export class SignalingRepository implements ISignalingRepository {
  private socket: TypedSocket | null = null;

  async connect(serverUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        transports: ['websocket'],
      }) as TypedSocket;

      this.socket.on('connect', () => resolve());
      this.socket.on('connect_error', (err) => reject(err));
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  async createRoom(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Not connected'));

      this.socket.emit('create-room', {} as any);
      this.socket.once('room-created', (data) => resolve(data.roomCode));
      this.socket.once('room-error', (data) => reject(new Error(data.message)));
    });
  }

  async joinRoom(roomCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Not connected'));

      this.socket.emit('join-room', { roomCode });
      this.socket.once('peer-joined', () => resolve());
      this.socket.once('room-error', (data) => reject(new Error(data.message)));
    });
  }

  sendSignal(data: SignalDto): void {
    this.socket?.emit('signal', data);
  }

  onPeerJoined(callback: (data: PeerJoinedDto) => void): void {
    this.socket?.on('peer-joined', callback);
  }

  onPeerDisconnected(callback: (data: PeerDisconnectedDto) => void): void {
    this.socket?.on('peer-disconnected', callback);
  }

  onSignal(callback: (data: SignalDto) => void): void {
    this.socket?.on('signal', callback);
  }

  onRoomError(callback: (data: RoomErrorDto) => void): void {
    this.socket?.on('room-error', callback);
  }
}
