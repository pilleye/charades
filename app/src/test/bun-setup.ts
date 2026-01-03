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

global.window = dom.window as any;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

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
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as any;
}
