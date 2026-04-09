import type { Router } from 'express';
import type { IRoomRepository } from '@baby-monitor/shared-types';

export class HealthHandler {
  constructor(private readonly roomRepository: IRoomRepository) {}

  register(router: Router): void {
    router.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        rooms: this.roomRepository.count(),
        uptime: Math.floor(process.uptime()),
      });
    });
  }
}
