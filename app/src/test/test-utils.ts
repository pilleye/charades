import * as vitest from 'vitest';

const isBun = typeof process !== 'undefined' && process.versions && process.versions.bun;

let viShim: any;
let describeShim: any;
let itShim: any;
let testShim: any;
let expectShim: any;
let beforeEachShim: any;
let afterEachShim: any;
let afterAllShim: any;
let beforeAllShim: any;

if (isBun) {
  const g = globalThis as any;
  
  // Safe wrapper for Jest globals which might be undefined in some Bun contexts if not preloaded correctly
  const safeJest = g.jest || {};
  
  viShim = {
    fn: safeJest.fn || (() => {}),
    useFakeTimers: (config?: any) => safeJest.useFakeTimers(config || { legacyFakeTimers: true }) || (() => {}),
    useRealTimers: safeJest.useRealTimers || (() => {}),
    advanceTimersByTime: safeJest.advanceTimersByTime || (() => {}),
    restoreAllMocks: safeJest.restoreAllMocks || (() => {}),
    clearAllMocks: safeJest.clearAllMocks || (() => {}),
    resetModules: safeJest.resetModules || (() => {}), // No-op if missing
    stubGlobal: (name: string, value: any) => {
        g[name] = value;
    }
  };
  
  describeShim = g.describe;
  itShim = g.it;
  testShim = g.test;
  expectShim = g.expect;
  beforeEachShim = g.beforeEach;
  afterEachShim = g.afterEach;
  afterAllShim = g.afterAll;
  beforeAllShim = g.beforeAll;

} else {
  viShim = vitest.vi;
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
