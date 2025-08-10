
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
    const { rows: rowConfig, columns: colConfig, values: valConfig, rowSubtotals = true, columnSubtotals = true } = config;
    
    const [expandedRows, setExpandedRows] = useState(new Set<string>());
    const [expandedCols, setExpandedCols] = useState(new Set<string>());
    
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
        if (!data || data.length === 0 || rowConfig.length === 0 || colConfig.length === 0 || valConfig.length === 0) {
            return { rowTree: [], colTree: [], grandTotal: 0 };
        }

        const valueField = valConfig[0].dataKey as keyof SalesData;
        const valueAgg = valConfig[0].aggregation || 'SUM';

        const buildTree = (
            items: SalesData[], 
            hierarchy: ChartWell[], 
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
                    subtotal: aggregate(groupItems, valueField, valueAgg),
                    children: buildTree(groupItems, hierarchy, level + 1, uniqueKey),
                };
            }).sort((a,b) => a.label.localeCompare(b.label));
        };

        const rowTree = buildTree(data, rowConfig);
        const colTree = buildTree(data, colConfig);
        const grandTotal = aggregate(data, valueField, valueAgg);

        return { rowTree, colTree, grandTotal };
    }, [data, rowConfig, colConfig, valConfig]);

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
    
    const getValue = useCallback((rowNode: TreeNode, colNode: TreeNode): number => {
        // Find intersection of items. Inefficient, but works for this demo.
        // For performance, use item IDs in Sets.
        const rowItemIds = new Set(rowNode.items.map(i => i.id));
        const intersectingItems = colNode.items.filter(item => rowItemIds.has(item.id));
        return aggregate(intersectingItems, valConfig[0].dataKey as keyof SalesData, valConfig[0].aggregation);
    }, [valConfig]);


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
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
                 <span className="text-xs font-semibold text-gray-600 mr-2">Linhas:</span>
                 <button onClick={expandAllRows} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Expandir Tudo</button>
                 <button onClick={collapseAllRows} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Recolher Tudo</button>
                 {colConfig.length > 1 && <>
                    <span className="text-xs font-semibold text-gray-600 ml-4 mr-2">Colunas:</span>
                    <button onClick={expandAllCols} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Expandir Tudo</button>
                    <button onClick={collapseAllCols} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Recolher Tudo</button>
                 </>}
            </div>

            <div className="overflow-auto rounded-md border border-gray-200" style={{maxHeight: '600px'}}>
                <table className="min-w-full divide-y divide-gray-300 text-sm border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-20">
                        <tr>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900 sticky left-0 bg-gray-50 z-30 border-r border-gray-300 min-w-[200px]">
                               {rowConfig.map(r => r.label || r.dataKey).join(' / ')}
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
                                {visibleCols.map(col => <td key={col.uniqueKey} className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">{formatValue(getValue(row, col))}</td>)}
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
