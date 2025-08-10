
import React, { useRef, useState, useEffect } from 'react';
import { MenuItem, DataItem } from '../types.ts';
import SortableList from './SortableList.tsx';
// MenuIcon is no longer needed here as it's moved to TopBar

interface SidebarProps {
  menuItems: MenuItem<DataItem>[];
  activeTabId: string | null; // Can be null if no tab is active
  onSelectTab: (id: string) => void;
  isOpen: boolean;
  // onToggle is no longer needed here, TopBar handles it
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems, activeTabId, onSelectTab, isOpen }) => {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [items, setItems] = useState<MenuItem<DataItem>[]>(() => {
    const stored = localStorage.getItem('sidebar-menu');
    if (stored) {
      try {
        const parsed: { id: string; label: string; hidden?: boolean }[] = JSON.parse(stored);
        const map = new Map(parsed.map((p, i) => [p.id, { ...p, order: i }]));
        const ordered = parsed
          .map((p) => {
            const base = menuItems.find((mi) => mi.id === p.id);
            return base ? { ...base, label: p.label, hidden: p.hidden } : undefined;
          })
          .filter(Boolean) as MenuItem<DataItem>[];
        const missing = menuItems.filter((mi) => !map.has(mi.id));
        return [...ordered, ...missing];
      } catch {
        return menuItems;
      }
    }
    return menuItems;
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const meta = items.map(({ id, label, hidden }) => ({ id, label, hidden }));
    localStorage.setItem('sidebar-menu', JSON.stringify(meta));
  }, [items]);

  const visibleItems = items.filter((item) => !item.hidden);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    id: string
  ) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = (index + 1) % visibleItems.length;
        itemRefs.current[nextIndex]?.focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prevIndex = (index - 1 + visibleItems.length) % visibleItems.length;
        itemRefs.current[prevIndex]?.focus();
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        onSelectTab(id);
        break;
      }
      default:
        break;
    }
  };

  const handleReorder = (newItems: MenuItem<DataItem>[]) => {
    setItems(newItems);
  };

  const handleLabelChange = (id: string, label: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, label } : it)));
  };

  const handleToggleHidden = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, hidden: !it.hidden } : it)));
  };

  const listItems = isEditing ? items : visibleItems;

  return (
    <div
      className={`bg-[#002D5A] text-white fixed top-16 left-0 bottom-0 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64 p-4' : 'w-20 p-4'} z-30`}
      aria-label="Menu de navegação principal"
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      <div className="mb-2">
        <button
          onClick={() => setIsEditing((p) => !p)}
          className="px-2 py-1 rounded bg-[#003C73] text-sm"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>
      <nav className="space-y-2 flex-grow overflow-y-auto">
        <SortableList
          items={listItems}
          onChange={handleReorder}
          disabled={!isEditing}
          renderItem={(item, index) =>
            isEditing ? (
              <div className="flex items-center space-x-2 p-2 bg-[#003C73] rounded-md">
                <input
                  value={item.label}
                  onChange={(e) => handleLabelChange(item.id, e.target.value)}
                  className="flex-grow bg-transparent border-b border-gray-300 focus:outline-none"
                  aria-label={`rename-${item.id}`}
                />
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={!item.hidden}
                    onChange={() => handleToggleHidden(item.id)}
                  />
                  <span className="ml-1">Show</span>
                </label>
              </div>
            ) : (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, index, item.id)}
                ref={(el) => (itemRefs.current[index] = el)}
                className={`w-full flex items-center p-3 rounded-md text-left hover:bg-[#003C73] transition-colors duration-150
                        ${isOpen ? 'justify-start space-x-3' : 'justify-center'}
                        ${activeTabId === item.id ? 'bg-[#00A3E0] text-white border-l-4 border-yellow-300' : 'text-gray-300 hover:text-white'}`}
                title={item.label}
                aria-label={item.label}
                role="menuitem"
                aria-current={activeTabId === item.id ? 'page' : undefined}
              >
                <item.icon title={item.label} className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="truncate">{item.label}</span>}
              </button>
            )
          }
        />
      </nav>
    </div>
  );
};

export default Sidebar;
