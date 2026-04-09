import type { Server, Socket } from 'socket.io';
import type {
  IClientToServerEvents,
  IServerToClientEvents,
  PeerRole,
} from '@babycam/shared-types';
import { CreateRoomUseCase } from '../../domain/use-cases/create-room.use-case';
import { JoinRoomUseCase } from '../../domain/use-cases/join-room.use-case';
import { HandleDisconnectUseCase } from '../../domain/use-cases/handle-disconnect.use-case';

type TypedSocket = Socket<IClientToServerEvents, IServerToClientEvents>;
type TypedServer = Server<IClientToServerEvents, IServerToClientEvents>;

interface PeerSession {
  roomCode: string;
  role: PeerRole;
}

export class SocketHandler {
  private readonly sessions = new Map<string, PeerSession>();

  constructor(
    private readonly createRoom: CreateRoomUseCase,
    private readonly joinRoom: JoinRoomUseCase,
    private readonly handleDisconnect: HandleDisconnectUseCase,
  ) {}

  register(io: TypedServer): void {
    io.on('connection', (socket: TypedSocket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: TypedSocket): void {
    socket.on('create-room', () => {
      this.onCreateRoom(socket);
    });

    socket.on('join-room', (data) => {
      this.onJoinRoom(socket, data.roomCode);
    });

    socket.on('signal', (data) => {
      this.onSignal(socket, data);
    });

    socket.on('disconnect', () => {
      this.onDisconnect(socket);
    });
  }

  private onCreateRoom(socket: TypedSocket): void {
    const result = this.createRoom.execute({ parentPeerId: socket.id });

    this.sessions.set(socket.id, {
      roomCode: result.roomCode,
      role: 'parent',
    });

    socket.join(result.roomCode);
    socket.emit('room-created', result);
  }

  private onJoinRoom(socket: TypedSocket, roomCode: string): void {
    const result = this.joinRoom.execute({
      roomCode,
      babyPeerId: socket.id,
    });

    if (!result.success) {
      socket.emit('room-error', { message: result.error });
      return;
    }

    this.sessions.set(socket.id, { roomCode, role: 'baby' });

    socket.join(roomCode);
    socket.to(roomCode).emit('peer-joined', result.data);
    socket.emit('peer-joined', { peerId: socket.id, role: 'baby' });
  }

  private onSignal(socket: TypedSocket, data: unknown): void {
    const session = this.sessions.get(socket.id);
    if (!session) return;

    socket.to(session.roomCode).emit('signal', data as any);
  }

  private onDisconnect(socket: TypedSocket): void {
    const session = this.sessions.get(socket.id);
    if (!session) return;

    this.handleDisconnect.execute({
      roomCode: session.roomCode,
      role: session.role,
    });

    socket
      .to(session.roomCode)
      .emit('peer-disconnected', { peerId: socket.id });

    this.sessions.delete(socket.id);
  }
}
