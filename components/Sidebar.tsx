
import React, { useRef } from 'react';
import { MenuItem, DataItem } from '../types.ts'; 
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

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    id: string
  ) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = (index + 1) % menuItems.length;
        itemRefs.current[nextIndex]?.focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
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

  return (
    <div
      className={`bg-[#002D5A] text-white fixed top-16 left-0 bottom-0 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64 p-4' : 'w-20 p-4'} z-30`} // Added z-30
      aria-label="Menu de navegação principal"
      style={{ height: 'calc(100vh - 4rem)' }} // Ensure it doesn't overlap TopBar
    >
      {/* Header section (toggle button and title) is removed and moved to TopBar */}
      {/* Optional: Add a small padding or border if the first item is too close to the top after removing header */}
      <div className={`${isOpen && menuItems.length > 0 ? 'pt-4' : ''}`}> 
      </div>
      <nav className="space-y-2 flex-grow overflow-y-auto">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, index, item.id)}
            ref={(el) => (itemRefs.current[index] = el)}
            className={`w-full flex items-center p-3 rounded-md text-left hover:bg-[#003C73] transition-colors duration-150
                        ${isOpen ? 'justify-start space-x-3' : 'justify-center'}
                        ${activeTabId === item.id ? 'bg-[#00A3E0] text-white' : 'text-gray-300 hover:text-white'}`}
            title={item.label}
            aria-label={item.label}
            role="menuitem"
            aria-current={activeTabId === item.id ? 'page' : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
