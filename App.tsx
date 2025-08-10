
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import DataTable from './components/DataTable.tsx';
import Modal from './components/Modal.tsx';
import TopBar from './components/TopBar.tsx';
import UserProfilePage from './components/UserProfilePage.tsx';
import LoginPage from './components/LoginPage.tsx'; // Import LoginPage
import Dashboard from './components/Dashboard.tsx'; // Import Dashboard
import { AppData, DataItem, MenuItem as MenuItemType, FieldConfig, UserData, ActivityLog, UserRole } from './types.ts';
import { MENU_ITEMS, INITIAL_APP_DATA, generateId, MOCK_RECENT_ACTIVITIES } from './constants.ts';
import { EditProvider } from './context/EditContext.tsx';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Authentication state
  const [currentUser, setCurrentUser] = useState<UserData | null>(null); // Logged-in user details

  const [activeTabId, setActiveTabId] = useState<string>(MENU_ITEMS[0].id);
  const [appData, setAppData] = useState<AppData>(INITIAL_APP_DATA);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<DataItem | null>(null);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const [currentView, setCurrentView] = useState<'dataTable' | 'userProfile'>('dataTable');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  // MOCK_USER_DATA is no longer used for current user state; recentActivities is fine.
  const [recentActivities] = useState<ActivityLog[]>(MOCK_RECENT_ACTIVITIES);


  const currentMenuItem = useMemo(() => MENU_ITEMS.find(item => item.id === activeTabId) as MenuItemType<DataItem> | undefined, [activeTabId]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const toggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(prev => !prev);
  }, []);

  const navigateToProfile = useCallback(() => {
    setCurrentView('userProfile');
    setIsUserDropdownOpen(false); 
  }, []);
  
  const handleLoginAttempt = useCallback((usernameAttempt: string, passwordAttempt: string): boolean => {
    if (passwordAttempt === '12345') {
      let role: UserRole | null = null;
      let name: string = '';
      let id: string = usernameAttempt;

      if (usernameAttempt.toLowerCase() === 'admin') {
        role = 'admin';
        name = 'Admin User';
      } else if (usernameAttempt.toLowerCase() === 'editor') {
        role = 'editor';
        name = 'Editor User';
      } else if (usernameAttempt.toLowerCase() === 'viewer') {
        role = 'viewer';
        name = 'Viewer User';
      }

      if (role) {
        setCurrentUser({ id, name, role });
        setIsAuthenticated(true);
        setCurrentView('dataTable');
        setActiveTabId(MENU_ITEMS[0].id);
        setIsUserDropdownOpen(false);
        setIsSidebarOpen(true);
        return true;
      }
    }
    setCurrentUser(null); // Explicitly clear user if login fails
    setIsAuthenticated(false);
    return false;
  }, []);

  const handleLogout = useCallback(() => {
    // console.log("Logout action triggered for user:", currentUser?.name); // Optional log
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsUserDropdownOpen(false);
    setCurrentView('dataTable'); 
    setActiveTabId(MENU_ITEMS[0].id);
  }, []);


  const handleSelectTab = useCallback((id: string) => {
    setActiveTabId(id);
    setCurrentView('dataTable'); 
    setIsUserDropdownOpen(false); 
  }, []);


  const handleAddItem = useCallback(() => {
    if (currentMenuItem && currentMenuItem.fields && currentUser && (currentUser.role === 'admin' || currentUser.role === 'editor')) {
      const newItemTemplate: Partial<Record<keyof DataItem, unknown>> = {};
      currentMenuItem.fields.forEach((field: FieldConfig) => {
        const key = field.name as keyof DataItem;
        newItemTemplate[key] = field.type === 'select' && field.options && field.options.length > 0 ? field.options[0] : '';
      });
      setEditingItem(newItemTemplate as DataItem);
      setIsFormModalOpen(true);
    }
  }, [currentMenuItem, currentUser]);

  const handleEditItem = useCallback((itemToEdit: DataItem) => {
    if (currentMenuItem && currentMenuItem.fields && currentUser && (currentUser.role === 'admin' || currentUser.role === 'editor')) {
      setEditingItem(itemToEdit);
      setIsFormModalOpen(true);
    }
  }, [currentMenuItem, currentUser]);

  const handleDeleteItem = useCallback((id: string) => {
    if (!currentMenuItem || !currentMenuItem.dataKey || !currentUser || currentUser.role !== 'admin') {
      console.error("[Delete Setup Error] Conditions not met for deletion.");
      return;
    }
    if (typeof id !== 'string' || id.trim() === '') {
      console.error(`[Delete Setup Error] Invalid ID for deletion: ID is not a valid string or is empty ("${id}").`);
      return;
    }
    setItemToDeleteId(id);
    setShowDeleteConfirmModal(true);
  }, [currentMenuItem, currentUser]);

  const executeDelete = useCallback(() => {
    if (!itemToDeleteId || !currentMenuItem || !currentMenuItem.dataKey || !currentUser || currentUser.role !== 'admin') {
      console.error("[Delete Execution Error] Conditions not met for deletion execution.");
      setShowDeleteConfirmModal(false);
      setItemToDeleteId(null);
      return;
    }

    const dataKey = currentMenuItem.dataKey;
    console.log(`[Delete Attempt] Item ID: "${itemToDeleteId}", Table: "${String(dataKey)}" by User: ${currentUser.name} (${currentUser.role})`);

    setAppData(prevAppData => {
      const currentTableData = prevAppData[dataKey];
      
      if (!currentTableData || !Array.isArray(currentTableData)) {
          console.error(`[Delete Error] Data for key "${String(dataKey)}" is missing or not an array in appData. State:`, prevAppData);
          return prevAppData;
      }

      const itemExistsBeforeFilter = currentTableData.some(item => item.id === itemToDeleteId);
      const updatedTableData = currentTableData.filter(item => item.id !== itemToDeleteId);

      if (updatedTableData.length === currentTableData.length) {
        if (!itemExistsBeforeFilter) {
           console.warn(`[Delete Info] Item with ID "${itemToDeleteId}" was not found in table "${String(dataKey)}". No changes made to the state.`);
        } else {
           console.error(`[Delete Error] Item with ID "${itemToDeleteId}" was found in table "${String(dataKey)}" but was NOT removed by the filter. This is unexpected. Please check data integrity and filter logic. No changes made to the state.`);
        }
        return prevAppData;
      } else {
          console.log(`[Delete Success] Item with ID "${itemToDeleteId}" successfully removed from table "${String(dataKey)}".`);
          return {
            ...prevAppData,
            [dataKey]: updatedTableData,
          };
      }
    });

    setShowDeleteConfirmModal(false);
    setItemToDeleteId(null);
  }, [itemToDeleteId, currentMenuItem, currentUser]);

  const cancelDelete = useCallback(() => {
    if (itemToDeleteId && currentMenuItem) {
        console.log(`[Delete Cancelled] Deletion of item with ID "${itemToDeleteId}" from table "${currentMenuItem.label}" cancelled by user.`);
    } else {
        console.log(`[Delete Cancelled] Delete confirmation cancelled by user.`);
    }
    setShowDeleteConfirmModal(false);
    setItemToDeleteId(null);
  }, [itemToDeleteId, currentMenuItem]);


  const handleModalSubmit = useCallback((data: Partial<DataItem>) => {
    if (!currentMenuItem || !currentMenuItem.dataKey || !currentUser || !(currentUser.role === 'admin' || currentUser.role === 'editor')) return;

    setAppData(prevAppData => {
      const currentTableData = prevAppData[currentMenuItem.dataKey!];
      let updatedTableData;

      if (editingItem && editingItem.id) {
        updatedTableData = currentTableData.map(item =>
          item.id === editingItem.id ? { ...item, ...data, id: editingItem.id } : item
        );
      } else {
        const newItemWithId = { ...data, id: generateId() } as DataItem;
        updatedTableData = [...currentTableData, newItemWithId];
      }
      return {
        ...prevAppData,
        [currentMenuItem.dataKey!]: updatedTableData,
      };
    });
    setIsFormModalOpen(false);
    setEditingItem(null);
  }, [currentMenuItem, editingItem, currentUser]);


  const dataForCurrentTable = (currentMenuItem && currentMenuItem.dataKey) ? appData[currentMenuItem.dataKey] : [];
  const sidebarActiveTabId = currentView === 'dataTable' ? activeTabId : null;

  if (!isAuthenticated || !currentUser) { // Ensure currentUser is also checked
    return <LoginPage onLoginAttempt={handleLoginAttempt} />;
  }

  return (
    <EditProvider>
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar
        userName={currentUser.name} // Use currentUser.name
        onToggleSidebar={toggleSidebar}
        onProfileClick={navigateToProfile}
        onLogoutClick={handleLogout}
        isUserDropdownOpen={isUserDropdownOpen}
        onToggleUserDropdown={toggleUserDropdown}
      />
      <div className="flex flex-1 pt-16 overflow-hidden"> 
        <Sidebar 
          menuItems={MENU_ITEMS} 
          activeTabId={sidebarActiveTabId} 
          onSelectTab={handleSelectTab}
          isOpen={isSidebarOpen}
        />
        <main className={`flex-1 p-8 overflow-y-auto bg-gray-100 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          {currentView === 'userProfile' && ( // currentUser is guaranteed by isAuthenticated check
            <UserProfilePage user={currentUser} recentActivities={recentActivities} />
          )}

          {currentView === 'dataTable' && activeTabId === 'dashboard' && (
            <Dashboard />
          )}
          
          {currentView === 'dataTable' && activeTabId !== 'dashboard' && currentMenuItem?.dataKey && (
            <DataTable
              key={activeTabId} 
              columns={currentMenuItem.columns || []}
              data={dataForCurrentTable}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              title={currentMenuItem.label}
              userRole={currentUser.role}
              getRowClass={currentMenuItem.getRowClass}
            />
          )}

           {currentView === 'dataTable' && !activeTabId && (
             <div className="text-center p-10 text-gray-600">
               <h2 className="text-2xl font-semibold">Bem-vindo, {currentUser.name}!</h2>
               <p>Selecione uma tabela no menu lateral para começar.</p>
             </div>
           )}
        </main>
      </div>
      
      {currentMenuItem && currentMenuItem.fields && currentView === 'dataTable' && (currentUser.role === 'admin' || currentUser.role === 'editor') && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleModalSubmit}
          title={editingItem && editingItem.id ? `Editar ${currentMenuItem.label}` : `Adicionar ${currentMenuItem.label}`}
          fields={currentMenuItem.fields}
          initialData={editingItem}
        />
      )}

      {currentMenuItem && currentMenuItem.dataKey && itemToDeleteId && currentView === 'dataTable' && currentUser.role === 'admin' && (
         <Modal
            isOpen={showDeleteConfirmModal}
            onClose={cancelDelete}
            onSubmit={executeDelete} 
            title="Confirmar Exclusão"
            fields={[]} 
            submitButtonText="Confirmar Exclusão"
            submitButtonClassName="bg-[#D9262E] hover:bg-[#B01F25] focus:ring-[#D9262E]"
            cancelButtonText="Cancelar"
            bodyContent={
              <p className="text-gray-700 my-4">
                Tem certeza que deseja excluir o item com ID: <strong className="font-semibold">{itemToDeleteId}</strong> da tabela <strong className="font-semibold">{currentMenuItem.label}</strong>? Esta ação não pode ser desfeita.
              </p>
            }
          />
      )}
    </div>
    </EditProvider>
  );
};

export default App;