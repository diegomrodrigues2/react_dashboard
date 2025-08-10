import { render, screen, fireEvent, setChartDimensions } from '../setup.ts';
import userEvent from '@testing-library/user-event';
import { test, expect, beforeEach, afterEach } from 'vitest';
import FunnelChart from '../../components/charts/FunnelChart.tsx';
import { DynamicChartConfig } from '../../types.ts';

beforeEach(() => setChartDimensions(800, 600));
afterEach(() => setChartDimensions(800, 600));

const config: DynamicChartConfig = {
  sourceDataKey: 'funnelData',
  chartType: 'Funnel',
  category: { dataKey: 'name' },
  value: { dataKey: 'value' },
};

test('dragging stages reorders them', () => {
  const data = [
    { name: 'Stage 1', value: 100 },
    { name: 'Stage 2', value: 80 },
    { name: 'Stage 3', value: 60 },
  ];
  render(<FunnelChart data={data} title="Funnel" config={config} />);

  const items = screen.getAllByTestId('stage-item');
  fireEvent.dragStart(items[0]);
  fireEvent.dragOver(items[2]);
  fireEvent.drop(items[2]);

  const names = screen
    .getAllByTestId('stage-name')
    .map((input) => (input as HTMLInputElement).value);
  expect(names).toEqual(['Stage 2', 'Stage 3', 'Stage 1']);
});

test('inline editing updates stage labels and values', async () => {
  const data = [
    { name: 'Stage 1', value: 100 },
    { name: 'Stage 2', value: 80 },
  ];
  render(<FunnelChart data={data} title="Funnel" config={config} />);

  const user = userEvent.setup();
  const nameInput = screen.getAllByTestId('stage-name')[0] as HTMLInputElement;
  const valueInput = screen.getAllByTestId('stage-value')[0] as HTMLInputElement;

  await user.clear(nameInput);
  await user.type(nameInput, 'Updated');
  await user.clear(valueInput);
  await user.type(valueInput, '123');

  expect(nameInput.value).toBe('Updated');
  expect(valueInput.value).toBe('123');
});

