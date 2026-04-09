// ============================================================
// Composition Root — wires all layers together
// Domain ← Data ← Infrastructure ← Presentation
// No layer imports from a layer above it.
// ============================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { loadConfig } from './infrastructure/config/server.config';
import { InMemoryRoomRepository } from './data/repositories/in-memory-room.repository';
import { CreateRoomUseCase } from './domain/use-cases/create-room.use-case';
import { JoinRoomUseCase } from './domain/use-cases/join-room.use-case';
import { HandleDisconnectUseCase } from './domain/use-cases/handle-disconnect.use-case';
import { SocketHandler } from './presentation/handlers/socket.handler';
import { HealthHandler } from './presentation/handlers/health.handler';

function bootstrap(): void {
  const config = loadConfig();

  // ---- Data layer ----
  const roomRepository = new InMemoryRoomRepository();

  // ---- Domain layer (use cases with injected deps) ----
  const createRoomUseCase = new CreateRoomUseCase(roomRepository);
  const joinRoomUseCase = new JoinRoomUseCase(roomRepository);
  const handleDisconnectUseCase = new HandleDisconnectUseCase(roomRepository);

  // ---- Infrastructure layer ----
  const app = express();
  const http = createServer(app);
  const io = new Server(http, {
    cors: { origin: config.corsOrigin, methods: ['GET', 'POST'] },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  // ---- Presentation layer ----
  const socketHandler = new SocketHandler(
    createRoomUseCase,
    joinRoomUseCase,
    handleDisconnectUseCase,
  );
  socketHandler.register(io);

  const healthHandler = new HealthHandler(roomRepository);
  healthHandler.register(app);

  // ---- Start ----
  http.listen(config.port, () => {
    console.log(`[server] listening on port ${config.port}`);
    console.log(`[server] health: http://localhost:${config.port}/health`);
  });
}

bootstrap();
