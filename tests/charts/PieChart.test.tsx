import { fireEvent } from '@testing-library/react';
import { beforeAll, expect, test } from 'vitest';
import { render, screen } from '../setup.ts';
import PieChart from '../../components/charts/PieChart.tsx';

  beforeAll(() => {
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (global as any).ResizeObserver = ResizeObserver;
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: function () {
        return {
          width: parseInt((this as HTMLElement).style.width || '400', 10),
          height: parseInt((this as HTMLElement).style.height || '400', 10),
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        } as DOMRect;
      },
    });
  });

const data = [
  { name: 'A', value: 30 },
  { name: 'B', value: 70 }
];

const config = { sourceDataKey: 'detailedData', chartType: 'Pie' } as const;

test('renders slice controls', () => {
  render(<PieChart data={data} title="Test" config={config} showLabels />);
  const list = screen.getByLabelText('slice controls');
  expect(list.querySelectorAll('li').length).toBe(2);
});

test('updates slice color through color input', () => {
  render(<PieChart data={data} title="Test" config={config} showLabels />);
  const inputs = screen.getAllByLabelText('color');
  fireEvent.input(inputs[0], { target: { value: '#000000' } });
  expect(inputs[0]).toHaveValue('#000000');
});
