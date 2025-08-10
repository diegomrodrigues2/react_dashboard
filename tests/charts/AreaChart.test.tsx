import { render, screen, fireEvent } from '../setup.ts';
import { describe, it, expect, beforeAll } from 'vitest';
import AreaChart from '../../components/charts/AreaChart.tsx';
import { DynamicChartConfig } from '../../types.ts';

describe('AreaChart', () => {
  beforeAll(() => {
    // mock ResizeObserver used by Recharts' ResponsiveContainer
    (global as any).ResizeObserver = class {
      private callback: any;
      constructor(cb: any) {
        this.callback = cb;
      }
      observe() {
        this.callback([{ contentRect: { width: 400, height: 300 } }]);
      }
      unobserve() {}
      disconnect() {}
    };
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: function () {
        return {
          width: parseInt((this as HTMLElement).style.width || '400', 10),
          height: parseInt((this as HTMLElement).style.height || '300', 10),
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        } as DOMRect;
      },
    });
  });
  const data = [
    { month: 'Jan', apples: 100, bananas: 200 },
    { month: 'Feb', apples: 150, bananas: 250 }
  ];

  const config: DynamicChartConfig = {
    sourceDataKey: 'detailedData',
    chartType: 'Area',
    category: { dataKey: 'month', label: 'Month' },
    legend: { dataKey: 'fruit' },
    value: { dataKey: 'apples', aggregation: 'SUM', label: 'Value' },
  } as any;

  it('snapshot renders', () => {
    const { container } = render(
      <div style={{ width: 400, height: 300 }}>
        <AreaChart data={data} title="Fruits" config={config} />
      </div>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('allows legend items to be reordered', () => {
    render(
      <div style={{ width: 400, height: 300 }}>
        <AreaChart data={data} title="Fruits" config={config} />
      </div>
    );
    const items = screen.getAllByTestId('legend-item');
    expect(items[0].textContent).toContain('apples');

    const dataTransfer: any = {
      data: {},
      setData(key: string, value: string) { this.data[key] = value; },
      getData(key: string) { return this.data[key]; }
    };

    fireEvent.dragStart(items[0], { dataTransfer });
    fireEvent.dragOver(items[1], { dataTransfer });
    fireEvent.drop(items[1], { dataTransfer });

    const reordered = screen.getAllByTestId('legend-item');
    expect(reordered[0].textContent).toContain('bananas');
  });
});
