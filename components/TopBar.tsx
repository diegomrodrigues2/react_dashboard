
import React, { useRef, useEffect, useState } from 'react';
import MenuIcon from './icons/MenuIcon.tsx';
import UserCircleIcon from './icons/UserCircleIcon.tsx';
import IdentificationIcon from './icons/IdentificationIcon.tsx';
import ArrowLeftOnRectangleIcon from './icons/ArrowLeftOnRectangleIcon.tsx'; // Updated import
import QuickActionsDropdown, { DEFAULT_QUICK_ACTIONS } from './QuickActionsDropdown.tsx';

interface TopBarProps {
  userName: string | undefined; // userName can be undefined if currentUser is null
  onToggleSidebar: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
  isUserDropdownOpen: boolean;
  onToggleUserDropdown: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  userName,
  onToggleSidebar,
  onProfileClick,
  onLogoutClick,
  isUserDropdownOpen,
  onToggleUserDropdown,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuItemRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const quickActionsCount = DEFAULT_QUICK_ACTIONS.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isUserDropdownOpen) {
          onToggleUserDropdown(); 
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen, onToggleUserDropdown]);

  useEffect(() => {
    if (isUserDropdownOpen) {
      setActiveIndex(0);
      menuItemRefs.current[0]?.focus();
    }
  }, [isUserDropdownOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onToggleUserDropdown();
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex =
        event.key === 'ArrowDown'
          ? (activeIndex + 1) % menuItemRefs.current.length
          : (activeIndex - 1 + menuItemRefs.current.length) %
            menuItemRefs.current.length;
      setActiveIndex(nextIndex);
      menuItemRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-[#002D5A] text-white flex items-center justify-between px-4 shadow-md z-40">
      {/* Left section: Toggle and Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-1 rounded-md hover:bg-[#003C73] focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
          aria-label="Alternar menu lateral"
        >
          <MenuIcon title="Abrir menu" className="w-7 h-7 text-[#00A3E0]" />
        </button>
        <h1 className="text-xl font-semibold truncate" title="StoneX Business Rules Manager">
          StoneX BRules
        </h1>
      </div>

      {/* Right section: User Profile Dropdown */}
      {userName && ( // Only show dropdown if user is logged in
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={onToggleUserDropdown}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#003C73] focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
            aria-haspopup="true"
            aria-expanded={isUserDropdownOpen}
            aria-controls="user-menu"
          >
            <UserCircleIcon title="Usuário" className="w-7 h-7" />
            <span className="hidden sm:inline text-sm font-medium">{userName}</span>
          </button>

          {isUserDropdownOpen && (
            <div
              id="user-menu"
              className="absolute right-0 mt-2 w-64 max-w-[90vw] sm:w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
              aria-activedescendant={`user-menu-item-${activeIndex}`}
              onKeyDown={handleKeyDown}
            >
              <div className="py-1" role="none">
                <div className="border-b">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-500">Ações rápidas</p>
                  <QuickActionsDropdown menuItemRefs={menuItemRefs} />
                </div>
                <button
                  ref={(el) => (menuItemRefs.current[quickActionsCount] = el)}
                  onClick={() => {
                    onProfileClick();
                  }}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none"
                  role="menuitem"
                  id={`user-menu-item-${quickActionsCount}`}
                >
                  <IdentificationIcon title="Perfil" className="w-5 h-5 mr-3 text-gray-500" />
                  Perfil
                </button>
                <button
                  ref={(el) => (menuItemRefs.current[quickActionsCount + 1] = el)}
                  onClick={() => {
                    onLogoutClick();
                  }}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none"
                  role="menuitem"
                  id={`user-menu-item-${quickActionsCount + 1}`}
                >
                  <ArrowLeftOnRectangleIcon title="Logout" className="w-5 h-5 mr-3 text-gray-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopBar;
