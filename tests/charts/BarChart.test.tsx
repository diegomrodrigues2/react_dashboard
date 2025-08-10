import { render, screen, fireEvent } from '../setup.ts';
import BarChart from '../../components/charts/BarChart.tsx';
import { DynamicChartConfig } from '../../types.ts';
import { test, expect } from 'vitest';

declare const document: Document;

// Polyfill ResizeObserver for Recharts' ResponsiveContainer
class ResizeObserver {
  callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  observe(target: Element) {
    this.callback([
      {
        contentRect: {
          width: parseInt((target as HTMLElement).style.width || '400', 10),
          height: parseInt((target as HTMLElement).style.height || '400', 10),
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        } as DOMRectReadOnly,
        target,
      } as ResizeObserverEntry,
    ], this);
  }
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserver;

// Provide dimensions for elements used by Recharts
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: function () {
    return {
      width: parseInt(this.style.width || '400', 10),
      height: parseInt(this.style.height || '400', 10),
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    } as DOMRect;
  },
});

type BarData = { category: string; s1: number; s2: number; legend?: string };

const data: BarData[] = [
  { category: 'A', s1: 10, s2: 20 },
  { category: 'B', s1: 15, s2: 25 }
];

const baseConfig: DynamicChartConfig<BarData> = {
  sourceDataKey: 'detailedData',
  chartType: 'Bar',
  layout: 'vertical',
  category: { dataKey: 'category', label: 'Category' },
  value: { dataKey: 's1', label: 'Series 1' },
  legend: { dataKey: 'legend', label: 'Legend' }
};

test('allows reordering series via drag and drop', async () => {
  const { container } = render(
    <div style={{ width: 400, height: 400 }}>
      <BarChart
        data={data}
        title="Test"
        config={baseConfig}
        stackType="stacked"
        colorPalette={['red', 'blue']}
      />
    </div>
  );

  const items = screen.getAllByTestId('series-item');
  expect(items.map(i => i.textContent)).toEqual(['s1', 's2']);

  fireEvent.dragStart(items[1]);
  fireEvent.dragOver(items[0]);
  fireEvent.drop(items[0]);

  const reordered = screen.getAllByTestId('series-item');
  expect(reordered.map(i => i.textContent)).toEqual(['s2', 's1']);

  await new Promise(r => setTimeout(r, 0));
  const legendIcons = container.querySelectorAll('.recharts-legend-item path');
  expect(legendIcons[0]).toHaveAttribute('fill', 'blue');
});

test('accepts colorPalette and stackType props', async () => {
  const { rerender, container } = render(
    <div style={{ width: 400, height: 400 }}>
      <BarChart
        data={data}
        title="Test"
        config={baseConfig}
        stackType="none"
        colorPalette={['#111', '#222']}
      />
    </div>
  );

  await new Promise(r => setTimeout(r, 0));
  let legendIcons = container.querySelectorAll('.recharts-legend-item path');
  expect(legendIcons[0]).toHaveAttribute('fill', '#111');

  rerender(
    <div style={{ width: 400, height: 400 }}>
      <BarChart
        data={data}
        title="Test"
        config={baseConfig}
        stackType="stacked"
        colorPalette={['#333', '#444']}
      />
    </div>
  );

  await new Promise(r => setTimeout(r, 0));
  legendIcons = container.querySelectorAll('.recharts-legend-item path');
  expect(legendIcons[0]).toHaveAttribute('fill', '#333');
  expect(legendIcons.length).toBe(2);
});
