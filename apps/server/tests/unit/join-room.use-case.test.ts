import { JoinRoomUseCase } from '../../src/domain/use-cases/join-room.use-case';
import type { IRoomRepository } from '@babycam/shared-types';

const mockRepository: jest.Mocked<IRoomRepository> = {
  create: jest.fn(),
  findByCode: jest.fn(),
  addBaby: jest.fn(),
  removePeer: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

describe('JoinRoomUseCase', () => {
  let useCase: JoinRoomUseCase;

  beforeEach(() => {
    useCase = new JoinRoomUseCase(mockRepository);
  });

  it('should join an existing room', () => {
    mockRepository.findByCode.mockReturnValue({
      code: 'ABC123',
      babyPeerId: null,
      parentPeerId: 'parent-1',
      createdAt: Date.now(),
    });
    mockRepository.addBaby.mockReturnValue({
      code: 'ABC123',
      babyPeerId: 'baby-1',
      parentPeerId: 'parent-1',
      createdAt: Date.now(),
    });

    const result = useCase.execute({ roomCode: 'ABC123', babyPeerId: 'baby-1' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.peerId).toBe('baby-1');
      expect(result.data.role).toBe('baby');
    }
  });

  it('should fail if room not found', () => {
    mockRepository.findByCode.mockReturnValue(null);

    const result = useCase.execute({ roomCode: 'NOPE00', babyPeerId: 'baby-1' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Room not found');
    }
  });

  it('should fail if room is full', () => {
    mockRepository.findByCode.mockReturnValue({
      code: 'ABC123',
      babyPeerId: 'baby-existing',
      parentPeerId: 'parent-1',
      createdAt: Date.now(),
    });

    const result = useCase.execute({ roomCode: 'ABC123', babyPeerId: 'baby-2' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Room full');
    }
  });
});
