import { render, screen, fireEvent, setChartDimensions } from '../setup.ts';
import BarChart from '../../components/charts/BarChart.tsx';
import { DynamicChartConfig } from '../../types.ts';
import { test, expect, beforeEach, afterEach } from 'vitest';

declare const document: Document;

beforeEach(() => setChartDimensions(400, 400));
afterEach(() => setChartDimensions(800, 600));

const data = [
  { category: 'A', s1: 10, s2: 20 },
  { category: 'B', s1: 15, s2: 25 }
];

const baseConfig: DynamicChartConfig = {
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
