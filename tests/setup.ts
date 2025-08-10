import { render, RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import '@testing-library/jest-dom/vitest';

const customRender = (ui: ReactElement, options?: RenderOptions) => render(ui, options);

export * from '@testing-library/react';
export { customRender as render };

// Polyfill ResizeObserver for recharts tests
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = ResizeObserver;

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  value: 300
});
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 500
});
Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  value: 300
});
Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  value: 500
});
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: () => ({ width: 500, height: 300, top: 0, left: 0, bottom: 300, right: 500 })
});
