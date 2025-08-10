import React from 'react';
import { SortableList, useSortableList, useSortableItem } from '../utils/dnd.tsx';
import { CSS } from '@dnd-kit/utilities';
import MenuIcon from './icons/MenuIcon.tsx';
import PlusIcon from './icons/PlusIcon.tsx';
import PencilIcon from './icons/PencilIcon.tsx';
import TrashIcon from './icons/TrashIcon.tsx';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  enabled: boolean;
}

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: 'add', label: 'Adicionar', icon: PlusIcon, enabled: true },
  { id: 'edit', label: 'Editar', icon: PencilIcon, enabled: true },
  { id: 'delete', label: 'Excluir', icon: TrashIcon, enabled: false },
];

interface QuickActionsDropdownProps {
  menuItemRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}

const QuickActionsDropdown: React.FC<QuickActionsDropdownProps> = ({ menuItemRefs }) => {
  return (
    <SortableList items={DEFAULT_QUICK_ACTIONS}>
      <QuickActionsContent menuItemRefs={menuItemRefs} />
    </SortableList>
  );
};

const QuickActionsContent: React.FC<QuickActionsDropdownProps> = ({ menuItemRefs }) => {
  const { items, setItems } = useSortableList<QuickAction>();

  const toggleAction = (id: string) => {
    setItems(items.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  };

  return (
    <ul className="divide-y" role="menu">
      {items.map((action, index) => (
        <QuickActionRow
          key={action.id}
          action={action}
          index={index}
          onToggle={toggleAction}
          menuItemRefs={menuItemRefs}
        />
      ))}
    </ul>
  );
};

interface QuickActionRowProps {
  action: QuickAction;
  index: number;
  onToggle: (id: string) => void;
  menuItemRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}

const QuickActionRow: React.FC<QuickActionRowProps> = ({ action, index, onToggle, menuItemRefs }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortableItem(action.id);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const Icon = action.icon;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between px-4 py-2 bg-white"
    >
      <div className="flex items-center space-x-2">
        <button
          {...attributes}
          {...listeners}
          aria-label={`Reordenar ${action.label}`}
          className="cursor-grab p-1 text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3E0]"
        >
          <MenuIcon className="w-4 h-4" />
        </button>
        <Icon
          className={`w-5 h-5 sm:w-5 sm:h-5 ${
            action.enabled ? 'text-gray-700' : 'text-gray-300'
          }`}
        />
        <span className="text-sm">{action.label}</span>
      </div>
      <input
        type="checkbox"
        checked={action.enabled}
        onChange={() => onToggle(action.id)}
        ref={(el) => (menuItemRefs.current[index] = el)}
        className="h-4 w-4"
        aria-label={`Ativar ${action.label}`}
      />
    </li>
  );
};

export default QuickActionsDropdown;
