import { render, screen, fireEvent, cleanup } from './setup.ts';
import { afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { test, expect, vi } from 'vitest';
import LoginPage from '../components/LoginPage.tsx';

afterEach(() => {
  cleanup();
});

// Validation error when fields are empty

test('shows error when required fields are empty', async () => {
  const onLogin = vi.fn();
  render(<LoginPage onLoginAttempt={onLogin} />);
  const form = screen.getByRole('button', { name: /^login$/i }).closest('form')!;
  fireEvent.submit(form);
  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent('Por favor, preencha o usuário e a senha.');
});

// Password visibility toggle

test('toggles password visibility', async () => {
  const onLogin = vi.fn();
  render(<LoginPage onLoginAttempt={onLogin} />);
  const password = screen.getByLabelText(/^senha$/i) as HTMLInputElement;
  expect(password.type).toBe('password');
  fireEvent.click(screen.getByLabelText(/mostrar senha/i));
  expect(password.type).toBe('text');
});

// Invalid credentials error

test('shows error on invalid credentials', async () => {
  const onLogin = vi.fn().mockReturnValue(false);
  const user = userEvent.setup();
  render(<LoginPage onLoginAttempt={onLogin} />);
  await user.type(screen.getByLabelText(/usuário/i), 'admin');
  await user.type(screen.getByLabelText(/^senha$/i), 'wrong');
  const form = screen.getByRole('button', { name: /^login$/i }).closest('form')!;
  fireEvent.submit(form);
  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent('Usuário ou senha inválidos.');
});

// Drag positioning

test('allows dragging the login card', async () => {
  const onLogin = vi.fn();
  const { getAllByTestId } = render(<LoginPage onLoginAttempt={onLogin} />);
  const card = getAllByTestId('login-card')[0];
  await new Promise((r) => setTimeout(r, 0));
  window.dispatchEvent(
    new CustomEvent('test-drag', { detail: { x: 60, y: 40 } })
  );
  await new Promise((r) => setTimeout(r, 0));
  expect(card.style.transform).toContain('60px');
  expect(card.style.transform).toContain('40px');
});

