import userEvent from '@testing-library/user-event';
import { render, screen, within, fireEvent } from '../setup.ts';
import { test, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import Matrix from '../../components/charts/Matrix.tsx';
import { MatrixConfig, SalesData } from '../../types.ts';

afterEach(cleanup);

const sampleData: SalesData[] = [
  { id: '1', regiao: 'Norte', categoria: 'A', mes: 'Jan', vendas: 100, lucro: 10 },
  { id: '2', regiao: 'Norte', categoria: 'B', mes: 'Jan', vendas: 50, lucro: 5 },
  { id: '3', regiao: 'Sul', categoria: 'A', mes: 'Jan', vendas: 80, lucro: 8 },
];

test('dragging a row field to columns pivots the matrix', () => {
  const config: MatrixConfig = {
    sourceDataKey: 'detailedData',
    rows: [
      { dataKey: 'regiao', label: 'Região' },
      { dataKey: 'categoria', label: 'Categoria' },
    ],
    columns: [{ dataKey: 'mes', label: 'Mês' }],
    values: [{ dataKey: 'vendas', aggregation: 'SUM', label: 'Vendas' }],
  };

  render(<Matrix data={sampleData} title="Test" config={config} />);

  const rowsWell = screen.getByTestId('rows-well');
  const columnsWell = screen.getByTestId('columns-well');
  const regiaoItem = within(rowsWell).getByText('Região');

  const dataTransfer: any = {
    data: {},
    setData(key: string, val: string) {
      this.data[key] = val;
    },
    getData(key: string) {
      return this.data[key];
    },
  };
  fireEvent.dragStart(regiaoItem, { dataTransfer });
  fireEvent.dragOver(columnsWell, { dataTransfer });
  fireEvent.drop(columnsWell, { dataTransfer });

  expect(within(rowsWell).queryByText('Região')).toBeNull();
  expect(within(columnsWell).getByText('Região')).toBeInTheDocument();

  const headerCell = screen.getAllByRole('columnheader')[0];
  expect(headerCell).toHaveTextContent('Categoria');
});

test('aggregation and field edits update cell values', async () => {
  const config: MatrixConfig = {
    sourceDataKey: 'detailedData',
    rows: [{ dataKey: 'regiao', label: 'Região' }],
    columns: [{ dataKey: 'mes', label: 'Mês' }],
    values: [
      { dataKey: 'vendas', aggregation: 'SUM', label: 'Vendas' },
      { dataKey: 'lucro', aggregation: 'SUM', label: 'Lucro' },
    ],
  };

  render(<Matrix data={sampleData} title="Test" config={config} />);

  const firstCell = screen.getAllByRole('cell')[0];
  expect(firstCell.textContent).toMatch('150');

  const fieldSelect = screen.getAllByTestId('value-field-select').pop()!;
  await userEvent.selectOptions(fieldSelect, 'lucro');
  expect(screen.getAllByRole('cell')[0].textContent).toMatch('15');

  const aggSelect = screen.getAllByTestId('aggregation-select').pop()!;
  await userEvent.selectOptions(aggSelect, 'COUNT');
  expect(screen.getAllByRole('cell')[0].textContent).toMatch('2');
});
