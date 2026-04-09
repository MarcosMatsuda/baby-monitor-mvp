import { InMemoryRoomRepository } from '../../src/data/repositories/in-memory-room.repository';

describe('InMemoryRoomRepository', () => {
  let repo: InMemoryRoomRepository;

  beforeEach(() => {
    repo = new InMemoryRoomRepository();
  });

  it('should create and find a room', () => {
    const room = repo.create('ABC123', 'parent-1');

    expect(room.code).toBe('ABC123');
    expect(room.parentPeerId).toBe('parent-1');
    expect(room.babyPeerId).toBeNull();

    const found = repo.findByCode('ABC123');
    expect(found).not.toBeNull();
    expect(found?.code).toBe('ABC123');
  });

  it('should return null for unknown code', () => {
    expect(repo.findByCode('NOPE00')).toBeNull();
  });

  it('should add baby to room', () => {
    repo.create('ABC123', 'parent-1');
    const updated = repo.addBaby('ABC123', 'baby-1');

    expect(updated?.babyPeerId).toBe('baby-1');
  });

  it('should return null when adding baby to non-existent room', () => {
    expect(repo.addBaby('NOPE00', 'baby-1')).toBeNull();
  });

  it('should remove peer from room', () => {
    repo.create('ABC123', 'parent-1');
    repo.addBaby('ABC123', 'baby-1');
    repo.removePeer('ABC123', 'baby');

    const room = repo.findByCode('ABC123');
    expect(room?.babyPeerId).toBeNull();
    expect(room?.parentPeerId).toBe('parent-1');
  });

  it('should delete room', () => {
    repo.create('ABC123', 'parent-1');
    expect(repo.count()).toBe(1);

    repo.delete('ABC123');
    expect(repo.count()).toBe(0);
    expect(repo.findByCode('ABC123')).toBeNull();
  });

  it('should track room count', () => {
    expect(repo.count()).toBe(0);
    repo.create('AAA111', 'p1');
    repo.create('BBB222', 'p2');
    expect(repo.count()).toBe(2);
  });
});
