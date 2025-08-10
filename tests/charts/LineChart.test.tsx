import { fireEvent, render, screen, waitFor } from '../setup.ts';
import { test, expect } from 'vitest';
import LineChart from '../../components/charts/LineChart.tsx';
import { DynamicChartConfig } from '../../types.ts';
import { EditProvider, useEdit } from '../../context/EditContext.tsx';
import { ReactNode, useEffect } from 'react';

type Datum = { month: string; uv: number; pv: number };

const data: Datum[] = [
  { month: 'Jan', uv: 400, pv: 240 },
  { month: 'Feb', uv: 300, pv: 139 }
];

const config: DynamicChartConfig = {
  sourceDataKey: 'detailedData',
  chartType: 'Line',
  category: { dataKey: 'month', label: 'month' },
  value: { dataKey: 'uv', label: 'uv' },
  legend: { dataKey: 'legend', label: 'legend' }
};

function SizeWrapper({ children }: { children: ReactNode }) {
  return <EditProvider><div style={{ width: 500, height: 300 }}>{children}</div></EditProvider>;
}

function EditingWrapper({ children }: { children: ReactNode }) {
  return (
    <EditProvider>
      <StartEditing>
        <div style={{ width: 500, height: 300 }}>{children}</div>
      </StartEditing>
    </EditProvider>
  );
}

function StartEditing({ children }: { children: ReactNode }) {
  const { startEdit } = useEdit();
  useEffect(() => {
    startEdit();
  }, [startEdit]);
  return <>{children}</>;
}

test('legend drag reorders lines', () => {
  render(<LineChart data={data} title="Test" config={config} />, {
    wrapper: SizeWrapper
  });
  const items = screen.getAllByTestId('legend-item');
  expect(items[0]).toHaveTextContent('uv');
  fireEvent.dragStart(items[1]);
  fireEvent.dragOver(items[0]);
  fireEvent.drop(items[0]);
  const reordered = screen.getAllByTestId('legend-item');
  expect(reordered[0]).toHaveTextContent('pv');
});

test('editing color and width updates line style', async () => {
  const { container } = render(
    <LineChart data={data} title="Test" config={config} />,
    { wrapper: EditingWrapper }
  );
  const colorInput = screen.getByLabelText('uv-color') as HTMLInputElement;
  fireEvent.change(colorInput, { target: { value: '#ff0000' } });
  await waitFor(() => {
    const path = container.querySelector('path[name="uv"]');
    expect(path?.getAttribute('stroke')).toBe('#ff0000');
  });
  const widthInput = screen.getByLabelText('pv-width') as HTMLInputElement;
  fireEvent.change(widthInput, { target: { value: '5' } });
  expect(widthInput.value).toBe('5');
});

