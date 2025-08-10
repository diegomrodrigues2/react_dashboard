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
});

const data = [
  { name: 'A', value: 30 },
  { name: 'B', value: 70 }
];

const config = { sourceDataKey: 'detailedData', chartType: 'Pie' } as const;

test('allows dragging slices to reorder', () => {
  render(<PieChart data={data} title="Test" config={config} showLabels />);
  const items = screen.getAllByRole('listitem');
  const first = items[0];
  const second = items[1];
  const dataTransfer = {
    data: {} as Record<string, string>,
    setData(key: string, value: string) { this.data[key] = value; },
    getData(key: string) { return this.data[key]; }
  };
  fireEvent.dragStart(second, { dataTransfer });
  fireEvent.dragOver(first, { dataTransfer });
  fireEvent.drop(first, { dataTransfer });
  const reordered = screen.getAllByRole('listitem');
  expect(reordered[0]).toHaveTextContent('B');
});

test('updates slice color through color input', () => {
  render(<PieChart data={data} title="Test" config={config} showLabels />);
  const inputs = screen.getAllByLabelText('color');
  fireEvent.input(inputs[0], { target: { value: '#000000' } });
  expect(inputs[0]).toHaveValue('#000000');
});
