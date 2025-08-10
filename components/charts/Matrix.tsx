
import React, { useMemo, useState, useCallback } from 'react';
import { SalesData, MatrixConfig as MatrixConfigType, AggregationType, ChartWell } from '../../types.ts';

interface MatrixProps {
    data: SalesData[];
    title: string;
    config: MatrixConfigType;
}

interface TreeNode {
    uniqueKey: string;
    label: string;
    level: number;
    children: TreeNode[];
    items: SalesData[];
    subtotal: number;
}

const aggregate = (items: SalesData[], dataKey: keyof SalesData, type: AggregationType = 'SUM'): number => {
    switch (type) {
        case 'SUM':
            return items.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);
        case 'COUNT':
            return items.length;
        case 'AVERAGE':
            const sum = items.reduce((s, item) => s + (Number(item[dataKey]) || 0), 0);
            return items.length > 0 ? sum / items.length : 0;
        case 'NONE':
             const firstValue = items.length > 0 ? items[0][dataKey] : undefined;
             return typeof firstValue === 'number' ? firstValue : 0;
        default:
            return 0;
    }
};

const formatValue = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


const Matrix: React.FC<MatrixProps> = ({ data, title, config }) => {
    const {
        rows: initialRows,
        columns: initialCols,
        values: initialValues,
        rowSubtotals = true,
        columnSubtotals = true,
    } = config;

    const [rows, setRows] = useState<ChartWell[]>(initialRows);
    const [cols, setCols] = useState<ChartWell[]>(initialCols);
    const [values] = useState<ChartWell[]>(initialValues);
    const [valueField, setValueField] = useState<ChartWell>(initialValues[0]);

    const [expandedRows, setExpandedRows] = useState(new Set<string>());
    const [expandedCols, setExpandedCols] = useState(new Set<string>());
    const [selectedCell, setSelectedCell] = useState<{ row: string; col: string } | null>(null);
    const [rowSortAsc, setRowSortAsc] = useState(true);
    const [colSortAsc, setColSortAsc] = useState(true);

    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        source: 'rows' | 'columns',
        index: number
    ) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ source, index }));
    };

    const handleDrop = (
        e: React.DragEvent<HTMLDivElement>,
        target: 'rows' | 'columns'
    ) => {
        e.preventDefault();
        const dataStr = e.dataTransfer.getData('text/plain');
        if (!dataStr) return;
        const { source, index } = JSON.parse(dataStr);
        if (source === target) return;
        if (source === 'rows') {
            const item = rows[index];
            setRows(r => r.filter((_, i) => i !== index));
            setCols(c => [...c, item]);
        } else {
            const item = cols[index];
            setCols(c => c.filter((_, i) => i !== index));
            setRows(r => [...r, item]);
        }
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newField = values.find(v => v.dataKey === e.target.value);
        if (newField) {
            setValueField(prev => ({ ...newField, aggregation: prev.aggregation }));
        }
    };

    const handleAggregationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const agg = e.target.value as AggregationType;
        setValueField(prev => ({ ...prev, aggregation: agg }));
    };
    
    const toggleRow = useCallback((key: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) newSet.delete(key);
            else newSet.add(key);
            return newSet;
        });
    }, []);

    const toggleCol = useCallback((key: string) => {
        setExpandedCols(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) newSet.delete(key);
            else newSet.add(key);
            return newSet;
        });
    }, []);

    const { rowTree, colTree, grandTotal } = useMemo(() => {
        if (!data || data.length === 0 || rows.length === 0 || cols.length === 0 || !valueField) {
            return { rowTree: [], colTree: [], grandTotal: 0 };
        }

        const valueKey = valueField.dataKey as keyof SalesData;
        const valueAgg = valueField.aggregation || 'SUM';

        const buildTree = (
            items: SalesData[],
            hierarchy: ChartWell[],
            sortAsc: boolean,
            level = 0,
            parentKey = ''
        ): TreeNode[] => {
            if (level >= hierarchy.length) return [];

            const field = hierarchy[level].dataKey as keyof SalesData;
            const groups = new Map<string, SalesData[]>();

            items.forEach(item => {
                const key = String(item[field] ?? '');
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key)!.push(item);
            });

            return Array.from(groups.entries()).map(([label, groupItems]) => {
                const uniqueKey = parentKey ? `${parentKey}|${label}` : label;
                return {
                    uniqueKey,
                    label,
                    level,
                    items: groupItems,
                    subtotal: aggregate(groupItems, valueField.dataKey as keyof SalesData, valueAgg),
                    children: buildTree(groupItems, hierarchy, sortAsc, level + 1, uniqueKey),
                };
            }).sort((a, b) => (sortAsc ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)));
        };

        const rowTree = buildTree(data, rows, rowSortAsc);
        const colTree = buildTree(data, cols, colSortAsc);
        const grandTotal = aggregate(data, valueKey, valueAgg);

        return { rowTree, colTree, grandTotal };
    }, [data, rows, cols, valueField, rowSortAsc, colSortAsc]);

    const getVisibleNodes = (nodes: TreeNode[], expandedKeys: Set<string>): TreeNode[] => {
        const visible: TreeNode[] = [];
        const recurse = (nodesToProcess: TreeNode[]) => {
            for (const node of nodesToProcess) {
                visible.push(node);
                if (node.children.length > 0 && expandedKeys.has(node.uniqueKey)) {
                    recurse(node.children);
                }
            }
        };
        recurse(nodes);
        return visible;
    };
    
    const getValue = useCallback(
        (rowNode: TreeNode, colNode: TreeNode): number => {
            const rowItemIds = new Set(rowNode.items.map(i => i.id));
            const intersectingItems = colNode.items.filter(item => rowItemIds.has(item.id));
            return aggregate(
                intersectingItems,
                valueField.dataKey as keyof SalesData,
                valueField.aggregation
            );
        },
        [valueField]
    );


    const getAllKeys = (nodes: TreeNode[], keys: Set<string>) => {
        nodes.forEach(node => {
            if (node.children.length > 0) {
                keys.add(node.uniqueKey);
                getAllKeys(node.children, keys);
            }
        });
    };

    const expandAllRows = () => {
        const allKeys = new Set<string>();
        getAllKeys(rowTree, allKeys);
        setExpandedRows(allKeys);
    };
    const collapseAllRows = () => setExpandedRows(new Set());
    
    const expandAllCols = () => {
        const allKeys = new Set<string>();
        getAllKeys(colTree, allKeys);
        setExpandedCols(allKeys);
    };
    const collapseAllCols = () => setExpandedCols(new Set());

    const handleCellClick = (rowKey: string, colKey: string) => {
        setSelectedCell(prev =>
            prev && prev.row === rowKey && prev.col === colKey ? null : { row: rowKey, col: colKey }
        );
    };


    const visibleRows = getVisibleNodes(rowTree, expandedRows);
    const visibleCols = getVisibleNodes(colTree, expandedCols);

    if (rowTree.length === 0 || colTree.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
                <div className="flex-grow flex items-center justify-center text-gray-500">
                    Dados insuficientes ou configuração inválida para a matriz.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{title}</h3>

            <div className="flex gap-4 mb-4">
                <div
                    className="p-2 border rounded"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, 'rows')}
                    data-testid="rows-well"
                >
                    <div className="text-xs font-semibold mb-1">Linhas</div>
                    {rows.map((r, idx) => (
                        <div
                            key={r.dataKey as string}
                            draggable
                            onDragStart={e => handleDragStart(e, 'rows', idx)}
                            className="cursor-move text-xs bg-gray-100 rounded px-1 py-0.5 mb-1"
                        >
                            {r.label || r.dataKey}
                        </div>
                    ))}
                </div>
                <div
                    className="p-2 border rounded"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, 'columns')}
                    data-testid="columns-well"
                >
                    <div className="text-xs font-semibold mb-1">Colunas</div>
                    {cols.map((c, idx) => (
                        <div
                            key={c.dataKey as string}
                            draggable
                            onDragStart={e => handleDragStart(e, 'columns', idx)}
                            className="cursor-move text-xs bg-gray-100 rounded px-1 py-0.5 mb-1"
                        >
                            {c.label || c.dataKey}
                        </div>
                    ))}
                </div>
                <div className="p-2 border rounded flex flex-col" data-testid="value-editor">
                    <label className="text-xs font-semibold mb-1">Valor</label>
                    <select
                        className="border p-1 text-xs mb-1"
                        value={valueField.dataKey as string}
                        onChange={handleFieldChange}
                        data-testid="value-field-select"
                    >
                        {values.map(v => (
                            <option key={v.dataKey as string} value={v.dataKey as string}>
                                {v.label || v.dataKey}
                            </option>
                        ))}
                    </select>
                    <select
                        className="border p-1 text-xs"
                        value={valueField.aggregation || 'SUM'}
                        onChange={handleAggregationChange}
                        data-testid="aggregation-select"
                    >
                        <option value="SUM">SUM</option>
                        <option value="COUNT">COUNT</option>
                        <option value="AVERAGE">AVERAGE</option>
                        <option value="NONE">NONE</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-gray-600 mr-2">Linhas:</span>
                <button onClick={expandAllRows} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Expandir Tudo</button>
                <button onClick={collapseAllRows} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Recolher Tudo</button>
                <button onClick={() => setRowSortAsc(true)} className={`px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded ${rowSortAsc ? 'font-semibold' : ''}`}>A-Z</button>
                <button onClick={() => setRowSortAsc(false)} className={`px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded ${!rowSortAsc ? 'font-semibold' : ''}`}>Z-A</button>
                {cols.length > 0 && <>
                    <span className="text-xs font-semibold text-gray-600 ml-4 mr-2">Colunas:</span>
                    <button onClick={expandAllCols} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Expandir Tudo</button>
                    <button onClick={collapseAllCols} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Recolher Tudo</button>
                    <button onClick={() => setColSortAsc(true)} className={`px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded ${colSortAsc ? 'font-semibold' : ''}`}>A-Z</button>
                    <button onClick={() => setColSortAsc(false)} className={`px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded ${!colSortAsc ? 'font-semibold' : ''}`}>Z-A</button>
                </>}
            </div>

            <div className="overflow-auto rounded-md border border-gray-200" style={{maxHeight: '600px'}}>
                <table className="min-w-full divide-y divide-gray-300 text-sm border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-20">
                        <tr>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900 sticky left-0 bg-gray-50 z-30 border-r border-gray-300 min-w-[200px]">
                               {rows.map(r => r.label || r.dataKey).join(' / ')}
                            </th>
                            {visibleCols.map(col => (
                                <th key={col.uniqueKey} scope="col" className="px-3 py-3.5 text-right font-semibold text-gray-900" style={{ paddingLeft: `${col.level * 1.5 + 0.75}rem`}}>
                                   <div className="flex items-center justify-end gap-1">
                                       {col.children.length > 0 && (
                                           <button onClick={() => toggleCol(col.uniqueKey)} className="text-gray-500 hover:text-gray-900" title={expandedCols.has(col.uniqueKey) ? 'Recolher' : 'Expandir'}>
                                               {expandedCols.has(col.uniqueKey) ? '▼' : '►'}
                                           </button>
                                       )}
                                       <span>{col.label}</span>
                                   </div>
                                </th>
                            ))}
                            {rowSubtotals && <th scope="col" className="px-3 py-3.5 text-right font-semibold text-gray-900 border-l-2 border-gray-300 bg-gray-100 sticky right-0 z-10">Total</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {visibleRows.map(row => (
                            <tr key={row.uniqueKey} className="hover:bg-gray-50">
                                <th scope="row" className="px-3 py-2 font-medium text-gray-900 text-left sticky left-0 bg-white hover:bg-gray-50 z-10 border-r border-gray-300" style={{ paddingLeft: `${row.level * 1.5 + 0.75}rem`}}>
                                    <div className="flex items-center gap-1">
                                       {row.children.length > 0 && (
                                            <button onClick={() => toggleRow(row.uniqueKey)} className="text-gray-500 hover:text-gray-900" title={expandedRows.has(row.uniqueKey) ? 'Recolher' : 'Expandir'}>
                                               {expandedRows.has(row.uniqueKey) ? '▼' : '►'}
                                           </button>
                                       )}
                                       <span>{row.label}</span>
                                    </div>
                                </th>
                                {visibleCols.map(col => (
                                    <td
                                        key={col.uniqueKey}
                                        onClick={() => handleCellClick(row.uniqueKey, col.uniqueKey)}
                                        className={`px-3 py-2 text-right text-gray-700 whitespace-nowrap cursor-pointer ${
                                            selectedCell?.row === row.uniqueKey && selectedCell?.col === col.uniqueKey
                                                ? 'bg-yellow-100'
                                                : ''
                                        }`}
                                    >
                                        {formatValue(getValue(row, col))}
                                    </td>
                                ))}
                                {rowSubtotals && <td className="px-3 py-2 text-right font-semibold text-gray-900 border-l-2 border-gray-300 bg-gray-50 sticky right-0 z-10 whitespace-nowrap">{formatValue(row.subtotal)}</td>}
                            </tr>
                        ))}
                    </tbody>
                    {columnSubtotals && (
                        <tfoot className="bg-gray-100 border-t-2 border-gray-300 sticky bottom-0 z-20">
                            <tr>
                                <th scope="row" className="px-3 py-3 text-left font-semibold text-gray-900 sticky left-0 bg-gray-100 z-10 border-r border-gray-300">Total</th>
                                {visibleCols.map(col => <td key={col.uniqueKey} className="px-3 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">{formatValue(col.subtotal)}</td>)}
                                {rowSubtotals && <td className="px-3 py-3 text-right font-bold text-gray-900 border-l-2 border-gray-300 bg-gray-200 sticky right-0 z-10 whitespace-nowrap">{formatValue(grandTotal)}</td>}
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default Matrix;
