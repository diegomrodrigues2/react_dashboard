import { fireEvent, render, screen, waitFor } from '../setup.ts';
import { expect, test } from 'vitest';
import ComboChart from '../../components/charts/ComboChart.tsx';
import { DynamicChartConfig } from '../../types.ts';

const sampleData = [
  { mes: 'Jan', vendas: 100, lucro: 50 },
  { mes: 'Feb', vendas: 200, lucro: 80 }
];

const baseConfig: DynamicChartConfig = {
  sourceDataKey: 'detailedData',
  chartType: 'Combo',
  category: { dataKey: 'mes', label: 'Mês' },
  value: { dataKey: 'vendas', aggregation: 'SUM', label: 'Vendas' },
  lineValue: { dataKey: 'lucro', aggregation: 'SUM', label: 'Lucro' }
};

test('legend items can be reordered by drag', async () => {
  const { getByText, getByTestId } = render(
    <div style={{ width: 500, height: 400 }}>
      <ComboChart data={sampleData} title="Test" config={baseConfig} />
    </div>
  );
  let legend = getByTestId('legend');
  let items = legend.querySelectorAll('li');
  expect(items[0].textContent).toBe('Vendas');
  const barItem = getByText('Vendas').parentElement as HTMLElement;
  const lineItem = getByText('Lucro').parentElement as HTMLElement;
  fireEvent.dragStart(lineItem);
  fireEvent.dragOver(barItem);
  fireEvent.drop(barItem);
  await screen.findByText('Lucro');
  legend = getByTestId('legend');
  items = legend.querySelectorAll('li');
  expect(items[0].textContent).toBe('Lucro');
});

test('axis labels update when provided', () => {
  const { rerender } = render(
    <div style={{ width: 500, height: 400 }}>
      <ComboChart data={sampleData} title="Test" config={baseConfig} />
    </div>
  );
  expect(screen.getAllByText('Vendas').length).toBeGreaterThan(0);
  rerender(
    <div style={{ width: 500, height: 400 }}>
      <ComboChart
        data={sampleData}
        title="Test"
        config={baseConfig}
        yLabel="Receita"
        lineLabel="Ganho"
      />
    </div>
  );
  expect(screen.getByText('Receita')).toBeInTheDocument();
  expect(screen.getByText('Ganho')).toBeInTheDocument();
});

