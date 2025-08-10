import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, screen, cleanup } from '../setup.ts';
import { test, expect, afterEach } from 'vitest';
import HeatmapChart from '../../components/charts/HeatmapChart.tsx';
import { SalesData, HeatmapConfig } from '../../types.ts';

const data: SalesData[] = [
  { id: '1', mes: 'Jan', regiao: 'North', categoria: '', vendas: 10, lucro: 0, clientes: 0 },
  { id: '2', mes: 'Feb', regiao: 'North', categoria: '', vendas: 20, lucro: 0, clientes: 0 },
  { id: '3', mes: 'Jan', regiao: 'South', categoria: '', vendas: 30, lucro: 0, clientes: 0 },
  { id: '4', mes: 'Feb', regiao: 'South', categoria: '', vendas: 40, lucro: 0, clientes: 0 }
];

const config: HeatmapConfig = {
  sourceDataKey: 'detailedData',
  x: { dataKey: 'mes', label: 'Month' },
  y: { dataKey: 'regiao', label: 'Region' },
  value: { dataKey: 'vendas', label: 'Sales', aggregation: 'SUM' }
};

afterEach(() => cleanup());

test('allows drag selecting a range of cells', () => {
  render(<HeatmapChart data={data} title="Heatmap" config={config} />);

  const startCell = screen.getByTestId('cell-0-0');
  const endCell = screen.getByTestId('cell-1-1');

  fireEvent.mouseDown(startCell);
  fireEvent.mouseEnter(endCell);
  fireEvent.mouseUp(endCell);

  expect(screen.getByTestId('cell-0-0')).toHaveAttribute('data-selected', 'true');
  expect(screen.getByTestId('cell-0-1')).toHaveAttribute('data-selected', 'true');
  expect(screen.getByTestId('cell-1-0')).toHaveAttribute('data-selected', 'true');
  expect(screen.getByTestId('cell-1-1')).toHaveAttribute('data-selected', 'true');
});

test('updates colors when editing color scale', async () => {
  render(<HeatmapChart data={data} title="Heatmap" config={config} />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: /edit colors/i }));
  const startInput = screen.getByLabelText(/start color/i);

  fireEvent.change(startInput, { target: { value: '#ff0000' } });

  const cell = screen.getByTestId('cell-0-1');
  expect(cell).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });
});

