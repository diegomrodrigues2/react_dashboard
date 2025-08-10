import userEvent from '@testing-library/user-event';
import { render, screen } from './setup.ts';
import { test, expect, vi } from 'vitest';
import DataTable from '../components/DataTable.tsx';
import { ColumnConfig } from '../types.ts';

type Row = { id: string; name: string };

const columns: ColumnConfig<Row>[] = [
  { header: 'Name', accessor: 'name' }
];

const data: Row[] = [{ id: '1', name: 'Alice' }];

test('data table container is scrollable', () => {
  const { container } = render(
    <DataTable
      columns={columns}
      data={data}
      onAddItem={() => {}}
      onEditItem={() => {}}
      onDeleteItem={() => {}}
      title="Test"
      userRole="viewer"
    />
  );
  const wrapper = container.querySelector('div.overflow-auto');
  expect(wrapper).not.toBeNull();
});

test('calls onAddItem when add button is clicked', async () => {
  const handleAdd = vi.fn();
  render(
    <DataTable
      columns={columns}
      data={data}
      onAddItem={handleAdd}
      onEditItem={() => {}}
      onDeleteItem={() => {}}
      title="Test"
      userRole="admin"
    />
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /adicionar novo/i }));
  expect(handleAdd).toHaveBeenCalled();
});
