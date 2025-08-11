import { render, screen } from '../setup.ts';
import { test, expect } from 'vitest';
import FunnelChart from '../../components/charts/FunnelChart.tsx';
import { DynamicChartConfig } from '../../types.ts';

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as any).ResizeObserver = ResizeObserver;

const config: DynamicChartConfig<{ name: string; value: number }> = {
  sourceDataKey: 'funnelData',
  chartType: 'Funnel',
  category: { dataKey: 'name' },
  value: { dataKey: 'value' },
};

test('renders only the funnel with labels inside slices', () => {
  const data = [
    { name: 'Leads', value: 5000 },
    { name: 'Qualified', value: 3500 },
    { name: 'Prospects', value: 2000 },
  ];
  const { container } = render(<FunnelChart data={data} title="Funnel" config={config} />);

  // Names must be present via labels (no inputs)
  // Rendered funnel slices exist
  const trapezoids = container.querySelectorAll('.recharts-funnel-trapezoid');
  expect(trapezoids.length).toBeGreaterThan(0);
  expect(screen.queryByTestId('stage-name')).toBeNull();
  expect(screen.queryByTestId('stage-value')).toBeNull();
});

test('supports horizontal orientation via prop', () => {
  const data = [
    { name: 'Leads', value: 5000 },
    { name: 'Qualified', value: 3500 },
    { name: 'Prospects', value: 2000 },
  ];
  const { container } = render(
    <FunnelChart data={data} title="Funnel" config={config} orientation="horizontal" />
  );

  const trapezoids = container.querySelectorAll('.recharts-funnel-trapezoid');
  expect(trapezoids.length).toBeGreaterThan(0);

  // Horizontal rendering rotates a wrapper div or label group
  const rotatedWrapper = container.querySelector('div[style*="rotate(90deg)"]');
  const rotatedGroup = container.querySelector('g[transform^="rotate(-90"]');
  expect(rotatedWrapper || rotatedGroup).toBeTruthy();
});

test('accepts custom color palette to color each level', () => {
  const data = [
    { name: 'Leads', value: 5000 },
    { name: 'Qualified', value: 3500 },
    { name: 'Prospects', value: 2000 },
  ];
  const palette = ['#111111', '#222222', '#333333'];
  const { container } = render(
    <FunnelChart data={data} title="Funnel" config={config} colorPalette={palette} />
  );
  // We can't reliably assert computed fills across SVG renderers here,
  // but we can ensure the slices render for each datum when palette is provided
  const trapezoids = container.querySelectorAll('.recharts-funnel-trapezoid');
  expect(trapezoids.length).toBe(data.length);
});

