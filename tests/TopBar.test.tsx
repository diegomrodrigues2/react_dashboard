import { render, screen, fireEvent, waitFor } from './setup.ts';
import userEvent from '@testing-library/user-event';
import { test, expect } from 'vitest';
import TopBar from '../components/TopBar.tsx';

function setup() {
  return render(
    <TopBar
      userName="Alice"
      onToggleSidebar={() => {}}
      onProfileClick={() => {}}
      onLogoutClick={() => {}}
      isUserDropdownOpen={true}
      onToggleUserDropdown={() => {}}
    />
  );
}

test('keyboard navigation cycles through dropdown items', async () => {
  setup();
  const user = userEvent.setup();
  const toggles = await screen.findAllByRole('checkbox');
  await waitFor(() => expect(toggles[0]).toHaveFocus());
  await user.keyboard('{ArrowDown}');
  expect(toggles[1]).toHaveFocus();
  await user.keyboard('{ArrowDown}{ArrowDown}');
  const profileButton = screen.getByRole('menuitem', { name: /perfil/i });
  expect(profileButton).toHaveFocus();
});

test('quick actions expose focusable drag handles', () => {
  setup();
  const handles = screen.getAllByLabelText(/Reordenar/);
  handles[0].focus();
  expect(handles[0]).toHaveFocus();
});
