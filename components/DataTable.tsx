
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ColumnConfig, DataItem, UserRole } from '../types.ts';
import PlusIcon from './icons/PlusIcon.tsx';
import PencilIcon from './icons/PencilIcon.tsx';
import TrashIcon from './icons/TrashIcon.tsx';
import FunnelIcon from './icons/FunnelIcon.tsx';
import FilterSlashIcon from './icons/FilterSlashIcon.tsx';
import CheckIcon from './icons/CheckIcon.tsx';
import XIcon from './icons/XIcon.tsx'; // For closing dropdown

interface DataTableProps<T extends DataItem> {
  columns: ColumnConfig<T>[];
  data: T[];
  onAddItem: () => void;
  onEditItem: (item: T) => void;
  onDeleteItem: (id: string) => void;
  title: string;
  userRole: UserRole;
  getRowClass?: (item: T) => string;
}

export default function DataTable<T extends DataItem>({ 
  columns, 
  data, 
  onAddItem, 
  onEditItem, 
  onDeleteItem, 
  title,
  userRole,
  getRowClass
}: DataTableProps<T>): React.ReactNode {
  const [searchTerm, setSearchTerm] = useState('');
  // Store selected unique values for each column: { accessor: ['value1', 'value2'] }
  const [columnFilters, setColumnFilters] = useState<Record<keyof T, string[]>>({} as Record<keyof T, string[]>);
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' | 'none' }>({ key: null, direction: 'none' });

  const [activeFilterDropdown, setActiveFilterDropdown] = useState<keyof T | null>(null);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState('');
  const [tempSelectedValues, setTempSelectedValues] = useState<Set<string>>(new Set());
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleGlobalSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = useCallback((key: keyof T) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'desc') return { key, direction: 'asc' };
        if (prev.direction === 'asc') return { key: null, direction: 'none' };
      }
      return { key, direction: 'desc' };
    });
  }, []);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setColumnFilters({} as Record<keyof T, string[]>);
    setSortConfig({ key: null, direction: 'none' });
    setActiveFilterDropdown(null); 
  };
  
  const getUniqueColumnValues = useCallback((accessor: keyof T): string[] => {
    if (!data || data.length === 0) return [];
    const uniqueValues = new Set<string>();
    data.forEach(item => {
      const value = item[accessor];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        uniqueValues.add(String(value));
      }
    });
    return Array.from(uniqueValues).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const openFilterDropdown = (accessor: keyof T) => {
    setActiveFilterDropdown(accessor);
    setDropdownSearchTerm('');
    const currentFilter = columnFilters[accessor] || [];
    setTempSelectedValues(new Set(currentFilter));
  };

  const closeFilterDropdown = useCallback(() => {
    setActiveFilterDropdown(null);
    setDropdownSearchTerm('');
    setTempSelectedValues(new Set());
  }, []);

  const handleApplyColumnFilter = () => {
    if (activeFilterDropdown) {
      setColumnFilters(prev => ({
        ...prev,
        [activeFilterDropdown]: Array.from(tempSelectedValues),
      }));
    }
    closeFilterDropdown();
  };

  const handleClearColumnFilter = () => {
    if (activeFilterDropdown) {
      setColumnFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters[activeFilterDropdown];
        return newFilters;
      });
    }
    closeFilterDropdown();
  };

  const handleToggleSelectAllUniqueValues = (allUniqueStringsInView: string[]) => {
    if (tempSelectedValues.size === allUniqueStringsInView.length) {
      // Deselect all currently visible
      const newSelected = new Set(tempSelectedValues);
      allUniqueStringsInView.forEach(val => newSelected.delete(val));
      setTempSelectedValues(newSelected);
    } else {
      // Select all currently visible
      setTempSelectedValues(new Set([...tempSelectedValues, ...allUniqueStringsInView]));
    }
  };
  
  const handleUniqueValueCheckboxChange = (value: string) => {
    setTempSelectedValues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        closeFilterDropdown();
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeFilterDropdown();
      }
    };

    if (activeFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [activeFilterDropdown, closeFilterDropdown]);


  const processedData = useMemo(() => {
    let items = [...data];

    // 1. Global Search Filter
    if (searchTerm.trim()) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      items = items.filter(item => 
        Object.keys(item).some(key => {
          const value = item[key as keyof T];
          return value !== null && value !== undefined && String(value).toLowerCase().includes(lowercasedSearchTerm);
        })
      );
    }
    
    // 2. Column-Specific Filters (New Logic)
    Object.entries(columnFilters).forEach(([accessor, selectedValues]) => {
      if (Array.isArray(selectedValues) && selectedValues.length > 0) {
        items = items.filter(item => {
          const itemValue = String(item[accessor as keyof T] ?? '');
          return selectedValues.includes(itemValue);
        });
      }
    });
    
    // 3. Sorting
    if (sortConfig.key && sortConfig.direction !== 'none') {
      items.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        if (valA == null && valB == null) return 0;
        if (valA == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (valB == null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
           const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
           if (dateRegex.test(valA) && dateRegex.test(valB)) {
             comparison = new Date(valA).getTime() - new Date(valB).getTime();
           } else {
             comparison = valA.toLowerCase().localeCompare(valB.toLowerCase());
           }
        } else {
          comparison = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());
        }
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return items;
  }, [data, searchTerm, columnFilters, sortConfig]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(processedData.length / rowsPerPage)),
    [processedData, rowsPerPage]
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const canPerformWriteActions = userRole === 'admin' || userRole === 'editor';

  const uniqueValuesForDropdown = useMemo(() => {
    if (!activeFilterDropdown) return [];
    return getUniqueColumnValues(activeFilterDropdown)
      .filter(val => val.toLowerCase().includes(dropdownSearchTerm.toLowerCase()));
  }, [activeFilterDropdown, getUniqueColumnValues, dropdownSearchTerm]);

  const allOriginalUniqueValuesForActiveColumn = useMemo(() => {
    if (!activeFilterDropdown) return [];
    return getUniqueColumnValues(activeFilterDropdown);
  }, [activeFilterDropdown, getUniqueColumnValues]);


  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 whitespace-nowrap">{title}</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <input
            type="search"
            placeholder="Buscar em todos os campos..."
            value={searchTerm}
            onChange={handleGlobalSearchChange}
            className="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A3E0] focus:border-[#00A3E0] sm:text-sm placeholder-gray-400 w-full sm:w-64 order-2 sm:order-1"
            aria-label="Buscar na tabela"
          />
          <button
            onClick={handleClearAllFilters}
            className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 w-full sm:w-auto justify-center order-2 sm:order-1 whitespace-nowrap"
            title="Limpar todos os filtros e ordenação"
          >
            <FilterSlashIcon title="Limpar filtros" className="w-5 h-5 mr-2" />
            Limpar Todos os Filtros
          </button>
          {canPerformWriteActions && (
            <button
              onClick={onAddItem}
              className="flex items-center bg-[#00A3E0] hover:bg-[#0082B8] text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3E0] w-full sm:w-auto justify-center order-1 sm:order-3"
            >
              <PlusIcon title="Adicionar novo" className="w-5 h-5 mr-2" />
              Adicionar Novo
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.accessor)}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap relative"
                >
                  <div className="flex items-center">
                    <span 
                      onClick={() => handleSort(col.accessor)} 
                      className="cursor-pointer hover:text-gray-700 flex-grow"
                      title={`Ordenar por ${col.header}`}
                    >
                      {col.header}
                      {sortConfig.key === col.accessor && sortConfig.direction !== 'none' && (
                        <span className={`ml-1 ${sortConfig.direction === 'asc' ? 'text-green-500' : 'text-red-500'}`}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </span>
                    <button
                      onClick={() => activeFilterDropdown === col.accessor ? closeFilterDropdown() : openFilterDropdown(col.accessor)}
                      className={`ml-2 p-1 rounded hover:bg-gray-200 
                                  ${(columnFilters[col.accessor] && columnFilters[col.accessor]!.length > 0) ? 'text-[#00A3E0]' : 'text-gray-400 hover:text-gray-600'}`}
                      title={`Filtrar ${col.header}`}
                      aria-haspopup="true"
                      aria-expanded={activeFilterDropdown === col.accessor}
                    >
                      <FunnelIcon title={`Filtrar ${col.header}`} className="w-4 h-4" />
                    </button>
                  </div>
                  {activeFilterDropdown === col.accessor && (
                    <div 
                      ref={filterDropdownRef}
                      className="absolute top-full mt-1 left-0 w-64 bg-white border border-gray-300 rounded-md shadow-xl p-3 z-20"
                      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                      <div className="flex justify-between items-center mb-2">
                         <h4 className="text-sm font-semibold text-gray-700">Filtrar {col.header}</h4>
                         <button onClick={closeFilterDropdown} className="p-1 text-gray-400 hover:text-gray-600">
                            <XIcon title="Fechar" className="w-4 h-4" />
                         </button>
                      </div>
                     
                      <input
                        type="search"
                        placeholder="Pesquisar valores..."
                        value={dropdownSearchTerm}
                        onChange={(e) => setDropdownSearchTerm(e.target.value)}
                        className="w-full px-2 py-1.5 mb-2 bg-white text-gray-700 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#00A3E0] focus:border-[#00A3E0] placeholder-gray-400"
                        autoFocus
                      />
                      <div className="max-h-48 overflow-y-auto mb-2 border-t border-b border-gray-200 py-1">
                        {allOriginalUniqueValuesForActiveColumn.length > 0 && (
                           <label className="flex items-center px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              className="form-checkbox h-3.5 w-3.5 text-[#00A3E0] border-gray-300 rounded focus:ring-[#00A3E0] focus:ring-offset-0"
                              checked={uniqueValuesForDropdown.length > 0 && uniqueValuesForDropdown.every(val => tempSelectedValues.has(val))}
                              onChange={() => handleToggleSelectAllUniqueValues(uniqueValuesForDropdown)}
                              disabled={uniqueValuesForDropdown.length === 0}
                            />
                            <span className="ml-2 truncate">(Selecionar Tudo na Vista)</span>
                          </label>
                        )}
                        {uniqueValuesForDropdown.length > 0 ? uniqueValuesForDropdown.map(value => (
                          <label key={value} className="flex items-center px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              className="form-checkbox h-3.5 w-3.5 text-[#00A3E0] border-gray-300 rounded focus:ring-[#00A3E0] focus:ring-offset-0"
                              checked={tempSelectedValues.has(value)}
                              onChange={() => handleUniqueValueCheckboxChange(value)}
                            />
                            <span className="ml-2 truncate" title={value}>{value === '' ? '(Vazio)' : value}</span>
                          </label>
                        )) : (
                           <p className="px-2 py-2 text-xs text-gray-500 text-center">
                            {allOriginalUniqueValuesForActiveColumn.length === 0 ? "Nenhum valor único." : "Nenhum valor encontrado."}
                            </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <button
                          onClick={handleClearColumnFilter}
                          className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Limpar Filtro da Coluna
                        </button>
                        <button
                          onClick={handleApplyColumnFilter}
                          className="text-xs bg-[#00A3E0] hover:bg-[#0082B8] text-white font-semibold px-3 py-1.5 rounded-md"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  )}
                </th>
              ))}
              {userRole !== 'viewer' && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Ações
                </th>
              )}
            </tr>
            {/* Old column filter inputs row is removed */}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={userRole !== 'viewer' ? columns.length + 1 : columns.length} className="px-6 py-10 text-center text-gray-500">
                  {searchTerm || Object.values(columnFilters).some(f => f && f.length > 0) ? `Nenhum resultado encontrado para os filtros aplicados.` : "Nenhum dado disponível."}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <tr key={item.id || rowIndex} className={`${getRowClass ? getRowClass(item) : ''} hover:bg-gray-50 transition-colors duration-150`}>
                  {columns.map((col) => (
                    <td key={`${String(col.accessor)}-${item.id || rowIndex}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {col.render ? col.render(item[col.accessor], item) : String(item[col.accessor] ?? '')}
                    </td>
                  ))}
                  {userRole !== 'viewer' && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {(userRole === 'admin' || userRole === 'editor') && (
                        <button
                          onClick={() => onEditItem(item)}
                          className="text-[#00A3E0] hover:text-[#0082B8] transition-colors duration-150 p-1 rounded hover:bg-[#E0F7FF]"
                          title="Editar"
                        >
                          <PencilIcon title="Editar" className="w-5 h-5" />
                        </button>
                      )}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="text-[#D9262E] hover:text-[#B01F25] transition-colors duration-150 p-1 rounded hover:bg-[#FEEBEE]"
                          title="Excluir"
                        >
                          <TrashIcon title="Excluir" className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
}
