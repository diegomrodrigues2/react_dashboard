import userEvent from '@testing-library/user-event';
import { render, screen, cleanup, waitFor } from './setup.ts';
import { test, expect, afterEach } from 'vitest';
import { act } from 'react';
import Modal from '../components/Modal.tsx';
import { FieldConfig } from '../types.ts';

const fields: FieldConfig[] = [
  { name: 'first', label: 'First', type: 'text', required: true },
  { name: 'second', label: 'Second', type: 'text', required: true },
];

afterEach(() => cleanup());

test('focus is trapped within the modal', async () => {
  const user = userEvent.setup();
  const outside = document.createElement('button');
  outside.textContent = 'outside';
  document.body.appendChild(outside);
  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      onSubmit={() => {}}
      title="Focus"
      fields={fields}
    />
  );
  for (let i = 0; i < 8; i++) {
    await user.tab();
  }
  expect(outside).not.toHaveFocus();
  outside.remove();
});

test('modal can be dragged by header', async () => {
  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      onSubmit={() => {}}
      title="Drag"
      fields={[]}
    />
  );
  const modal = screen.getByTestId('modal-content');
  act(() => {
    // @ts-ignore
    window.__modalDragEnd({ delta: { x: 50, y: 40 } });
  });
  expect(modal.style.transform).toContain('translate3d(50px, 40px, 0)');
});

test('shows validation errors and focuses first invalid field', async () => {
  const user = userEvent.setup();
  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      onSubmit={() => {}}
      title="Validate"
      fields={fields}
    />
  );
  await user.click(screen.getByText('Salvar'));
  const errors = await screen.findAllByText('Campo obrigatório');
  expect(errors).toHaveLength(2);
  await waitFor(() => expect(screen.getByLabelText(/First/)).toHaveFocus());
});
