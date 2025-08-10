import { render, RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import '@testing-library/jest-dom/vitest';

let width = 800;
let height = 600;

function setChartDimensions(w: number, h: number) {
  width = w;
  height = h;
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    value: w,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    value: h,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: w,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: h,
  });
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ width: w, height: h, top: 0, left: 0, bottom: h, right: w }) as DOMRect,
  });
}

class ResizeObserver {
  private callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  observe(target: Element) {
    this.callback(
      [
        {
          contentRect: new DOMRect(0, 0, width, height) as DOMRectReadOnly,
          target,
        } as ResizeObserverEntry,
      ],
      this,
    );
  }
  unobserve() {}
  disconnect() {}
}

// @ts-ignore
(global as any).ResizeObserver = ResizeObserver;

setChartDimensions(width, height);

const customRender = (ui: ReactElement, options?: RenderOptions) => render(ui, options);

export * from '@testing-library/react';
export { customRender as render, setChartDimensions };

