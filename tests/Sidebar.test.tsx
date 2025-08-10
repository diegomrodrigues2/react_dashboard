import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from './setup.ts';
import Sidebar from '../components/Sidebar.tsx';
import { MenuItem, DataItem } from '../types.ts';

const DummyIcon: React.FC<React.SVGProps<SVGSVGElement>> = () => (
  <svg data-testid="icon" />
);

const baseItems: MenuItem<DataItem>[] = [
  { id: 'a', label: 'Item A', icon: DummyIcon },
  { id: 'b', label: 'Item B', icon: DummyIcon },
  { id: 'c', label: 'Item C', icon: DummyIcon },
];

describe('Sidebar', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    cleanup();
  });

  test('supports keyboard navigation', () => {
    const handleSelect = vi.fn();
    render(
      <Sidebar
        menuItems={baseItems}
        activeTabId={null}
        onSelectTab={handleSelect}
        isOpen={true}
      />
    );

    const buttons = screen.getAllByRole('menuitem');
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(buttons[1]);
    fireEvent.keyDown(buttons[1], { key: 'ArrowUp' });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(buttons[0], { key: 'Enter' });
    expect(handleSelect).toHaveBeenCalledWith('a');
  });

  test('allows drag reorder', () => {
    render(
      <Sidebar
        menuItems={baseItems}
        activeTabId={null}
        onSelectTab={() => {}}
        isOpen={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    const items = screen.getAllByTestId('sortable-item');
    fireEvent.dragStart(items[0]);
    fireEvent.dragOver(items[1]);
    fireEvent.dragEnd(items[0]);
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    const buttons = screen.getAllByRole('menuitem');
    expect(buttons[0]).toHaveTextContent('Item B');
    const stored = JSON.parse(localStorage.getItem('sidebar-menu')!);
    expect(stored[0].id).toBe('b');
  });

  test('edit mode can rename and hide items', () => {
    render(
      <Sidebar
        menuItems={baseItems}
        activeTabId={null}
        onSelectTab={() => {}}
        isOpen={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    const nameInput = screen.getByDisplayValue('Item A');
    fireEvent.change(nameInput, { target: { value: 'Alpha' } });
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // hide Item B
    fireEvent.click(screen.getByRole('button', { name: /done/i }));

    expect(screen.getByRole('menuitem', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Item B' })).toBeNull();
    const stored = JSON.parse(localStorage.getItem('sidebar-menu')!);
    expect(stored.find((i: any) => i.id === 'a').label).toBe('Alpha');
    expect(stored.find((i: any) => i.id === 'b').hidden).toBe(true);
  });
});
