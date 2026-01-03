import * as vitest from 'vitest';

const isBun = typeof process !== 'undefined' && process.versions && !!process.versions.bun;

interface ViShim {
  fn: typeof vitest.vi.fn;
  useFakeTimers: typeof vitest.vi.useFakeTimers;
  useRealTimers: typeof vitest.vi.useRealTimers;
  advanceTimersByTime: typeof vitest.vi.advanceTimersByTime;
  restoreAllMocks: typeof vitest.vi.restoreAllMocks;
  clearAllMocks: typeof vitest.vi.clearAllMocks;
  resetModules: typeof vitest.vi.resetModules;
  stubGlobal: (name: string, value: unknown) => void;
}

let viShim: ViShim;
let describeShim: typeof vitest.describe;
let itShim: typeof vitest.it;
let testShim: typeof vitest.test;
let expectShim: typeof vitest.expect;
let beforeEachShim: typeof vitest.beforeEach;
let afterEachShim: typeof vitest.afterEach;
let afterAllShim: typeof vitest.afterAll;
let beforeAllShim: typeof vitest.beforeAll;

if (isBun) {
  const g = globalThis as unknown as Record<string, unknown>;
  
  // Safe wrapper for Jest globals which might be undefined in some Bun contexts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeJest = (g.jest as any) || {};
  
  viShim = {
    fn: safeJest.fn || (() => {}),
    useFakeTimers: (config?: unknown) => safeJest.useFakeTimers(config || { legacyFakeTimers: true }) || (() => {}),
    useRealTimers: safeJest.useRealTimers || (() => {}),
    advanceTimersByTime: safeJest.advanceTimersByTime || (() => {}),
    restoreAllMocks: safeJest.restoreAllMocks || (() => {}),
    clearAllMocks: safeJest.clearAllMocks || (() => {}),
    resetModules: safeJest.resetModules || (() => {}),
    stubGlobal: (name: string, value: unknown) => {
        (g as Record<string, unknown>)[name] = value;
    }
  };
  
  describeShim = g.describe as typeof vitest.describe;
  itShim = g.it as typeof vitest.it;
  testShim = g.test as typeof vitest.test;
  expectShim = g.expect as typeof vitest.expect;
  beforeEachShim = g.beforeEach as typeof vitest.beforeEach;
  afterEachShim = g.afterEach as typeof vitest.afterEach;
  afterAllShim = g.afterAll as typeof vitest.afterAll;
  beforeAllShim = g.beforeAll as typeof vitest.beforeAll;

} else {
  viShim = vitest.vi as unknown as ViShim;
  describeShim = vitest.describe;
  itShim = vitest.it;
  testShim = vitest.test;
  expectShim = vitest.expect;
  beforeEachShim = vitest.beforeEach;
  afterEachShim = vitest.afterEach;
  afterAllShim = vitest.afterAll;
  beforeAllShim = vitest.beforeAll;
}

export const vi = viShim;
export const describe = describeShim;
export const it = itShim;
export const test = testShim;
export const expect = expectShim;
export const beforeEach = beforeEachShim;
export const afterEach = afterEachShim;
export const afterAll = afterAllShim;
export const beforeAll = beforeAllShim;