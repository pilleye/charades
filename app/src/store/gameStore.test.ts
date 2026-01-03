import { describe, it, expect, beforeEach, vi, afterEach } from '../test/test-utils';

// Define the mock storage outside
const mockStorage = new Map<string, string>();

const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage.set(key, value.toString());
  }),
  removeItem: vi.fn((key: string) => {
    mockStorage.delete(key);
  }),
  clear: vi.fn(() => {
    mockStorage.clear();
  }),
  key: vi.fn((index: number) => Array.from(mockStorage.keys())[index] || null),
  length: 0,
};

// Force overwrite the global localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('GameStore Persistence & Migration', () => {
  const STORAGE_KEY = 'charades-game-storage';
  let useGameStore: any;

  beforeEach(async () => {
    vi.resetModules();
    mockStorage.clear();
    
    // Dynamically import the store so it picks up the mocked localStorage
    const mod = await import('./gameStore');
    useGameStore = mod.useGameStore;
    
    // Reset store to initial state
    useGameStore.setState(useGameStore.getInitialState(), true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should reset state when version does not match (Migration)', () => {
    const legacyState = {
      state: {
        roundDuration: 999,
        phase: 'ACTIVE',
        isPaused: false
      },
      version: 1
    };
    
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(legacyState));

    // Force rehydration
    useGameStore.persist.rehydrate();

    const state = useGameStore.getState();

    // Assert reset
    expect(state.roundDuration).toBe(60); 
    expect((state as any).phase).toBeUndefined();
  });

  it('should load state when version matches', () => {
    const validState = {
      state: {
        roundDuration: 120,
        gameState: { phase: 'SETUP' },
        teams: []
      },
      version: 2
    };

    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(validState));

    useGameStore.persist.rehydrate();

    const state = useGameStore.getState();

    expect(state.roundDuration).toBe(120);
    expect(state.gameState.phase).toBe('SETUP');
  });

  it('should auto-pause when rehydrating active game', () => {
    const activeState = {
      state: {
        gameState: { phase: 'ACTIVE', isPaused: false },
        currentRound: 2
      },
      version: 2
    };

    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(activeState));

    useGameStore.persist.rehydrate();

    const state = useGameStore.getState();

    expect(state.gameState.phase).toBe('ACTIVE');
    expect(state.gameState.isPaused).toBe(true);
    expect(state.currentRound).toBe(2);
  });
});
