import { JSDOM } from 'jsdom';
import { 
  jest, 
  expect, 
  describe, 
  test, 
  it, 
  beforeEach, 
  afterEach, 
  beforeAll, 
  afterAll 
} from "bun:test";

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).window = dom.window;
(global as unknown as { document: unknown }).document = dom.window.document;
(global as unknown as { navigator: unknown }).navigator = dom.window.navigator;

// Assign Bun test globals
Object.assign(globalThis, {
  jest,
  expect,
  describe,
  test,
  it,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll
});

// Shim localStorage if not present
if (!global.localStorage) {
  (global as unknown as { localStorage: Storage }).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as Storage;
}