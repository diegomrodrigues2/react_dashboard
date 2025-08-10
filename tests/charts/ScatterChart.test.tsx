import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup, setChartDimensions } from '../setup.ts';

vi.mock('recharts', async () => {
  const mod: any = await vi.importActual('recharts');
  return {
    ...mod,
    ResponsiveContainer: ({ children }: any) => (
      <div style={{ width: 500, height: 400 }}>
        {React.cloneElement(children, { width: 500, height: 400 })}
      </div>
    ),
  };
});

import ScatterChart from '../../components/charts/ScatterChart';
import { DynamicChartConfig } from '../../types';

beforeEach(() => setChartDimensions(500, 400));

describe('ScatterChart interactions', () => {
  const config: DynamicChartConfig = {
    sourceDataKey: 'detailedData',
    chartType: 'Scatter',
    x: { dataKey: 'x', label: 'X' },
    y: { dataKey: 'y', label: 'Y' },
  };

  test('dragging a point updates coordinates with snapping', async () => {
    const data = [
      { x: 10, y: 20 },
      { x: 20, y: 30 },
    ];
    const onChange = vi.fn();
    render(
      <ScatterChart data={data} title="Test" config={config} onDataChange={onChange} />
    );
    const point = await screen.findByTestId('point-0');
    fireEvent.mouseDown(point, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(window, { clientX: 7, clientY: 13 });
    fireEvent.mouseUp(window);
    const updated = onChange.mock.calls.at(-1)[0];
    expect(updated[0].x).toBe(20);
    expect(updated[0].y).toBe(30);
  });

  test('trendline can be toggled via editing', async () => {
    const data = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];
    render(
      <ScatterChart data={data} title="Test" config={config} showTrendline={true} />
    );
    expect(await screen.findByTestId('trendline')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('edit-toggle'));
    fireEvent.click(screen.getByTestId('toggle-trendline'));
    expect(screen.queryByTestId('trendline')).not.toBeInTheDocument();
  });
});

afterEach(() => {
  cleanup();
  setChartDimensions(800, 600);
});

