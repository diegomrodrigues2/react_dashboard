import { render, screen, fireEvent } from './setup.ts';
import userEvent from '@testing-library/user-event';
import { test, expect, vi } from 'vitest';
import React from 'react';
import UserProfilePage from '../components/UserProfilePage.tsx';
import { ActivityLog, UserData } from '../types.ts';

vi.mock('focus-trap-react', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const user: UserData = { id: '1', name: 'Alice', role: 'editor' };
const activities: ActivityLog[] = [
  { id: 'a1', timestamp: '2024-01-01', action: 'Login', details: 'first', targetTable: 'users' },
  { id: 'a2', timestamp: '2024-01-02', action: 'Edit', details: 'second', targetTable: 'users' }
];

test('allows editing profile name via modal', async () => {
  localStorage.clear();
  render(<UserProfilePage user={user} recentActivities={activities} />);
  const userEv = userEvent.setup();
  await userEv.click(screen.getByRole('button', { name: /editar perfil/i }));
  const nameInput = screen.getByLabelText(/nome/i);
  await userEv.clear(nameInput);
  await userEv.type(nameInput, 'Bob');
  await userEv.click(screen.getByRole('button', { name: /salvar/i }));
  expect(screen.getByText('Bob')).toBeInTheDocument();
});

test('reorders activity rows and persists order', () => {
  localStorage.clear();
  render(<UserProfilePage user={user} recentActivities={activities} />);
  const getActions = () => {
    const tbody = screen.getAllByRole('table')[0].querySelector('tbody')!;
    return Array.from(tbody.querySelectorAll('tr')).map(row => row.querySelectorAll('td')[1].textContent);
  };
  expect(getActions()).toEqual(['Login', 'Edit']);
  const tbody = screen.getAllByRole('table')[0].querySelector('tbody')!;
  const [firstRow, secondRow] = Array.from(tbody.querySelectorAll('tr'));
  fireEvent.dragStart(firstRow);
  fireEvent.dragOver(secondRow);
  fireEvent.dragEnd(firstRow);
  expect(getActions()).toEqual(['Edit', 'Login']);
  expect(localStorage.getItem('activity_order_1')).toBe(JSON.stringify(['a2', 'a1']));
});
