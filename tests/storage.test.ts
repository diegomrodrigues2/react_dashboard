import { test, expect, vi } from 'vitest';
import { getItem, setItem, removeItem } from '../utils/storage.ts';

test('getItem returns default when window is undefined', () => {
  const originalWindow = globalThis.window;
  // @ts-ignore
  (globalThis as any).window = undefined;
  expect(getItem('foo', 'bar')).toBe('bar');
  (globalThis as any).window = originalWindow;
});

test('helpers handle storage errors gracefully', () => {
  const getSpy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
    throw new Error('get error');
  });
  const setSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
    throw new Error('set error');
  });
  const removeSpy = vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
    throw new Error('remove error');
  });

  expect(getItem('foo', 'bar')).toBe('bar');
  expect(() => setItem('foo', 'bar')).not.toThrow();
  expect(() => removeItem('foo')).not.toThrow();

  getSpy.mockRestore();
  setSpy.mockRestore();
  removeSpy.mockRestore();
});
