import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGameStore } from './gameStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('GameStore Persistence & Migration', () => {
  const STORAGE_KEY = 'charades-game-storage';

  beforeEach(() => {
    localStorageMock.clear();
    useGameStore.setState(useGameStore.getInitialState(), true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should reset state when version does not match (Migration)', () => {
    // 1. Simulate legacy storage (Version 1 or unknown)
    const legacyState = {
      state: {
        roundDuration: 999, // Distinct value
        // Legacy structure
        phase: 'ACTIVE', 
        isPaused: false
      },
      version: 1 // OLD VERSION
    };
    
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(legacyState));

    // 2. Re-initialize store (simulate app reload)
    // We need to force rehydration. In a real app this happens on mount.
    // For Zustand persist, we can manually trigger rehydration or just rely on the mock being present before import?
    // Since useGameStore is a singleton, we typically rely on its initial load.
    // However, since we are in a test environment, we might need to verify the migrate logic specifically.
    
    // Attempting to manually invoke the migrate logic via internal Zustand persist API if accessible, 
    // or simply asserting that after rehydration, the state is default.
    
    // Force rehydrate
    useGameStore.persist.rehydrate();

    const state = useGameStore.getState();

    // 3. Assert: The state should be DEFAULT (roundDuration 60), not 999.
    // Because migrate returns {} on version mismatch, triggering a reset to defaults.
    expect(state.roundDuration).toBe(60); 
    expect((state as any).phase).toBeUndefined(); // Legacy field gone
  });

  it('should load state when version matches', () => {
    // 1. Simulate valid storage (Version 2)
    const validState = {
      state: {
        roundDuration: 120,
        gameState: { phase: 'SETUP' },
        teams: []
      },
      version: 2 // CURRENT VERSION
    };

    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(validState));

    // 2. Rehydrate
    useGameStore.persist.rehydrate();

    const state = useGameStore.getState();

    // 3. Assert: State is loaded
    expect(state.roundDuration).toBe(120);
    expect(state.gameState.phase).toBe('SETUP');
  });

  it('should auto-pause when rehydrating active game', () => {
    // 1. Simulate active game state (Version 2)
    const activeState = {
      state: {
        gameState: { phase: 'ACTIVE', isPaused: false },
        currentRound: 2
      },
      version: 2
    };

    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(activeState));

    // 2. Rehydrate
    useGameStore.persist.rehydrate();

    const state = useGameStore.getState();

    // 3. Assert: Phase is ACTIVE but isPaused is forced to TRUE
    expect(state.gameState.phase).toBe('ACTIVE');
    expect(state.gameState.isPaused).toBe(true);
  });
});
