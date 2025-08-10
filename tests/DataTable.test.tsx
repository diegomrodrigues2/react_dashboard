import { render } from '@testing-library/react';
import { test, expect } from 'vitest';
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
