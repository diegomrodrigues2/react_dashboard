import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent } from '../setup.ts';
import { test, expect, beforeAll, afterEach } from 'vitest';
import WaterfallChart from '../../components/charts/WaterfallChart.tsx';
import { DynamicChartConfig } from '../../types.ts';
import { cleanup } from '../setup.ts';

type WFPoint = { category: string; value: number };

const sampleData: WFPoint[] = [
  { category: 'A', value: 10 },
  { category: 'B', value: 20 },
  { category: 'C', value: 30 },
];

const config: DynamicChartConfig<WFPoint> = {
  sourceDataKey: 'waterfallData',
  chartType: 'Waterfall',
  value: { dataKey: 'value', label: 'Valor' }
};

beforeAll(() => {
  // jsdom doesn't implement ResizeObserver which is required by Recharts' ResponsiveContainer
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
});

test('reorders bars when dragged', () => {
  const { container } = render(<WaterfallChart data={sampleData} title="Test" config={config} />);
  const items = container.querySelectorAll('[data-testid^="wf-item-"]');
  fireEvent.dragStart(items[0]);
  fireEvent.dragOver(items[2]);
  fireEvent.drop(items[2]);
  const inputs = screen.getAllByLabelText(/label-input-/);
  expect(inputs[2]).toHaveValue('A');
});

test('label edits persist after reorder', async () => {
  const user = userEvent.setup();
  const { container } = render(<WaterfallChart data={sampleData} title="Test" config={config} />);
  const firstInput = screen.getByLabelText('label-input-0');
  await user.clear(firstInput);
  await user.type(firstInput, 'Alpha');
  const items = container.querySelectorAll('[data-testid^="wf-item-"]');
  fireEvent.dragStart(items[0]);
  fireEvent.dragOver(items[2]);
  fireEvent.drop(items[2]);
  const inputs = screen.getAllByLabelText(/label-input-/);
  expect(inputs[2]).toHaveValue('Alpha');
});
