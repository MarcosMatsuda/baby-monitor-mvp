import { CreateRoomUseCase } from '../../src/domain/use-cases/create-room.use-case';
import type { IRoomRepository } from '@babycam/shared-types';

const mockRepository: jest.Mocked<IRoomRepository> = {
  create: jest.fn(),
  findByCode: jest.fn(),
  addBaby: jest.fn(),
  removePeer: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

describe('CreateRoomUseCase', () => {
  let useCase: CreateRoomUseCase;

  beforeEach(() => {
    useCase = new CreateRoomUseCase(mockRepository);
    mockRepository.findByCode.mockReturnValue(null);
  });

  it('should create a room with a valid code', () => {
    const result = useCase.execute({ parentPeerId: 'parent-1' });

    expect(result.roomCode).toHaveLength(6);
    expect(mockRepository.create).toHaveBeenCalledWith(
      result.roomCode,
      'parent-1',
    );
  });

  it('should regenerate code if collision found', () => {
    mockRepository.findByCode
      .mockReturnValueOnce({ code: 'EXISTS', babyPeerId: null, parentPeerId: 'p', createdAt: 0 })
      .mockReturnValue(null);

    const result = useCase.execute({ parentPeerId: 'parent-1' });

    expect(result.roomCode).toHaveLength(6);
    expect(mockRepository.findByCode).toHaveBeenCalledTimes(2);
  });
});
