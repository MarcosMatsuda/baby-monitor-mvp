import { Room } from '../../src/domain/entities/room.entity';
import { ROOM_CODE_LENGTH, ROOM_CODE_CHARS } from '@babycam/shared-types';

describe('Room entity', () => {
  it('should create with parent peer id', () => {
    const room = new Room('ABC123', null, 'parent-1');

    expect(room.code).toBe('ABC123');
    expect(room.parentPeerId).toBe('parent-1');
    expect(room.babyPeerId).toBeNull();
    expect(room.isFull).toBe(false);
    expect(room.isEmpty).toBe(false);
    expect(room.peerCount).toBe(1);
  });

  it('should add baby peer', () => {
    const room = new Room('ABC123', null, 'parent-1');
    room.addPeer('baby-1', 'baby');

    expect(room.babyPeerId).toBe('baby-1');
    expect(room.isFull).toBe(true);
    expect(room.peerCount).toBe(2);
  });

  it('should throw when adding baby to occupied slot', () => {
    const room = new Room('ABC123', 'baby-1', 'parent-1');

    expect(() => room.addPeer('baby-2', 'baby')).toThrow('Baby slot already taken');
  });

  it('should throw when adding parent to occupied slot', () => {
    const room = new Room('ABC123', null, 'parent-1');

    expect(() => room.addPeer('parent-2', 'parent')).toThrow('Parent slot already taken');
  });

  it('should remove peer by role', () => {
    const room = new Room('ABC123', 'baby-1', 'parent-1');
    room.removePeer('baby');

    expect(room.babyPeerId).toBeNull();
    expect(room.isFull).toBe(false);
    expect(room.peerCount).toBe(1);
  });

  it('should be empty after removing both peers', () => {
    const room = new Room('ABC123', 'baby-1', 'parent-1');
    room.removePeer('baby');
    room.removePeer('parent');

    expect(room.isEmpty).toBe(true);
    expect(room.peerCount).toBe(0);
  });

  describe('generateCode', () => {
    it('should generate code with correct length', () => {
      const code = Room.generateCode();
      expect(code).toHaveLength(ROOM_CODE_LENGTH);
    });

    it('should only contain valid characters', () => {
      for (let i = 0; i < 100; i++) {
        const code = Room.generateCode();
        for (const char of code) {
          expect(ROOM_CODE_CHARS).toContain(char);
        }
      }
    });

    it('should not contain ambiguous characters', () => {
      const ambiguous = ['0', 'O', '1', 'I', 'L'];
      for (let i = 0; i < 100; i++) {
        const code = Room.generateCode();
        for (const char of ambiguous) {
          expect(code).not.toContain(char);
        }
      }
    });
  });
});
