import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../setup.ts';
import { test, expect } from 'vitest';
import ReactGridLayout from 'react-grid-layout';
import KpiCard from '../../components/charts/KpiCard.tsx';

const TestGrid = () => {
  const [layout, setLayout] = React.useState([
    { i: 'a', x: 0, y: 0, w: 1, h: 1 },
    { i: 'b', x: 1, y: 0, w: 1, h: 1 }
  ]);
  return (
    <div>
      <button onClick={() => setLayout([
        { i: 'a', x: 1, y: 0, w: 1, h: 1 },
        { i: 'b', x: 0, y: 0, w: 1, h: 1 }
      ])}>swap</button>
      <ReactGridLayout
        layout={layout}
        cols={2}
        rowHeight={30}
        width={300}
        draggableHandle=".drag-handle"
      >
        <div key="a" data-testid="card-a"><KpiCard title="A" value="1" /></div>
        <div key="b" data-testid="card-b"><KpiCard title="B" value="2" /></div>
      </ReactGridLayout>
    </div>
  );
};

test('drag handle exists and reorders layout when swapped', async () => {
  const user = userEvent.setup();
  const { container } = render(<TestGrid />);
  const handle = container.querySelector('.drag-handle');
  expect(handle).not.toBeNull();
  const cardA = screen.getByTestId('card-a');
  const before = cardA.style.transform;
  await user.click(screen.getByRole('button', { name: /swap/i }));
  expect(cardA.style.transform).not.toBe(before);
});

test('edits title and value inline with validation', async () => {
  const user = userEvent.setup();
  render(<KpiCard />);
  // edit title
  await user.click(screen.getByText('Vendas Totais'));
  const titleInput = screen.getByDisplayValue('Vendas Totais');
  await user.clear(titleInput);
  await user.type(titleInput, 'New Title');
  await user.keyboard('{Enter}');
  expect(screen.getByText('New Title')).toBeInTheDocument();

  // edit value
  await user.click(screen.getByText('R$1.2M'));
  const valueInput = screen.getByDisplayValue('R$1.2M');
  await user.clear(valueInput);
  await user.type(valueInput, 'R$2M');
  await user.keyboard('{Enter}');
  expect(screen.getByText('R$2M')).toBeInTheDocument();

  // validation
  await user.click(screen.getByText('R$2M'));
  const invalid = screen.getByDisplayValue('R$2M');
  await user.clear(invalid);
  await user.keyboard('{Enter}');
  expect(screen.getByText('Value is required')).toBeInTheDocument();
});
