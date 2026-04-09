import { create } from 'zustand';
import type { ConnectionState } from '@baby-monitor/shared-types';

interface IConnectionStoreState {
  state: ConnectionState;
  roomCode: string | null;
  connectedAt: number | null;
  setState: (state: ConnectionState) => void;
  setRoomCode: (code: string) => void;
  reset: () => void;
}

const useConnectionStoreBase = create<IConnectionStoreState>((set) => ({
  state: 'idle',
  roomCode: null,
  connectedAt: null,

  setState: (state) =>
    set((prev) => ({
      state,
      connectedAt:
        state === 'connected' && !prev.connectedAt
          ? Date.now()
          : state === 'disconnected'
            ? null
            : prev.connectedAt,
    })),

  setRoomCode: (code) => set({ roomCode: code }),

  reset: () =>
    set({
      state: 'idle',
      roomCode: null,
      connectedAt: null,
    }),
}));

// Hook wrapper per pattern
export function useConnection() {
  return useConnectionStoreBase();
}

// For testing — export raw store
export { useConnectionStoreBase };
