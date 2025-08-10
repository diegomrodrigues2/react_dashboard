






import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import KpiCard from './charts/KpiCard.tsx';
import LineChart from './charts/LineChart.tsx';
import BarChart from './charts/BarChart.tsx';
import PieChart from './charts/PieChart.tsx';
import ScatterChart from './charts/ScatterChart.tsx';
import AreaChart from './charts/AreaChart.tsx';
import ComboChart from './charts/ComboChart.tsx';
import WaterfallChart from './charts/WaterfallChart.tsx';
import FunnelChart from './charts/FunnelChart.tsx';
import TreemapChart from './charts/TreemapChart.tsx';
import Matrix from './charts/Matrix.tsx';
import XIcon from './icons/XIcon.tsx';
import DataTable from './DataTable.tsx';
import { SalesData, DashboardWidget, KpiConfig, DataTableConfig, DynamicChartConfig, AggregationType, MatrixConfig, BubbleMapConfig, ChoroplethMapConfig, HeatmapConfig } from '../types.ts';
import { DASHBOARD_CONFIG } from './dashboardConfig.ts';
import { ALL_CATEGORIES } from '../constants.ts';
import BubbleMap from './charts/BubbleMap.tsx';
import ChoroplethMap from './charts/ChoroplethMap.tsx';
import HeatmapChart from './charts/HeatmapChart.tsx';

export type { SalesData };

const rawSalesData: SalesData[] = [
    { id: 'sale1', mes: 'Jan', regiao: 'Sudeste', categoria: 'Eletrônicos', vendas: 4000, lucro: 2400, clientes: 20, coordinates: [-46.63, -23.55] },
    { id: 'sale2', mes: 'Jan', regiao: 'Sul', categoria: 'Vestuário', vendas: 2200, lucro: 900, clientes: 15, coordinates: [-51.22, -30.03] },
    { id: 'sale3', mes: 'Fev', regiao: 'Sudeste', categoria: 'Eletrônicos', vendas: 4500, lucro: 2800, clientes: 22, coordinates: [-46.63, -23.55] },
    { id: 'sale4', mes: 'Fev', regiao: 'Nordeste', categoria: 'Alimentos', vendas: 3100, lucro: 1200, clientes: 30, coordinates: [-38.50, -12.97] },
    { id: 'sale5', mes: 'Mar', regiao: 'Sudeste', categoria: 'Vestuário', vendas: 3500, lucro: 1500, clientes: 18, coordinates: [-46.63, -23.55] },
    { id: 'sale6', mes: 'Mar', regiao: 'Norte', categoria: 'Eletrônicos', vendas: 1500, lucro: -200, clientes: 8, coordinates: [-60.02, -3.11] },
    { id: 'sale7', mes: 'Abr', regiao: 'Centro-Oeste', categoria: 'Livros', vendas: 1200, lucro: 500, clientes: 10, coordinates: [-47.88, -15.79] },
    { id: 'sale8', mes: 'Abr', regiao: 'Sul', categoria: 'Eletrônicos', vendas: 3800, lucro: 2100, clientes: 19, coordinates: [-51.22, -30.03] },
    { id: 'sale9', mes: 'Mai', regiao: 'Sudeste', categoria: 'Alimentos', vendas: 5200, lucro: 2500, clientes: 45, coordinates: [-46.63, -23.55] },
    { id: 'sale10', mes: 'Mai', regiao: 'Nordeste', categoria: 'Vestuário', vendas: 2800, lucro: 1100, clientes: 25, coordinates: [-38.50, -12.97] },
    { id: 'sale11', mes: 'Jun', regiao: 'Sul', categoria: 'Livros', vendas: 900, lucro: 350, clientes: 7, coordinates: [-51.22, -30.03] },
    { id: 'sale12', mes: 'Jun', regiao: 'Sudeste', categoria: 'Eletrônicos', vendas: 6100, lucro: 3500, clientes: 35, coordinates: [-46.63, -23.55] },
    { id: 'sale13', mes: 'Jul', regiao: 'Norte', categoria: 'Alimentos', vendas: 2100, lucro: 800, clientes: 20, coordinates: [-60.02, -3.11] },
    { id: 'sale14', mes: 'Jul', regiao: 'Centro-Oeste', categoria: 'Vestuário', vendas: 1800, lucro: 750, clientes: 15, coordinates: [-47.88, -15.79] },
];

const waterfallSourceData = [
    { category: 'Vendas Brutas', value: 25000 },
    { category: 'Devoluções', value: -1500 },
    { category: 'Custo de Mercadoria', value: -11000 },
    { category: 'Despesas Operacionais', value: -4500 },
    { category: 'Receita de Juros', value: 800 },
];

const funnelSourceData = [
    { stage: 'Leads', value: 5000 },
    { stage: 'Leads Qualificados', value: 3500 },
    { stage: 'Prospectos', value: 2000 },
    { stage: 'Contratos', value: 1000 },
    { stage: 'Fechado', value: 650 },
];


const allMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
const allRegions = [...new Set(rawSalesData.map(d => d.regiao))].sort();
// ALL_CATEGORIES is now imported from constants.ts

const componentMap = { KpiCard, LineChart, BarChart, PieChart, DataTable, ScatterChart, AreaChart, ComboChart, WaterfallChart, FunnelChart, TreemapChart, Matrix, BubbleMap, ChoroplethMap, HeatmapChart };

const MultiSelectFilter = ({ options, selected, onChange, placeholder }: {
    options: string[], selected: string[], onChange: (selected: string[]) => void, placeholder: string
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleSelect = (option: string) => onChange(selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option]);
    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full sm:w-56 bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-[#00A3E0] focus:border-[#00A3E0]">
                <span className="block truncate text-gray-700">{selected.length === 0 ? placeholder : selected.length > 2 ? `${selected.slice(0, 2).join(', ')}...` : selected.join(', ')}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg></span>
            </button>
            {isOpen && <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-10"><ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">{options.map(option => <li key={option} className="text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100" onClick={() => handleSelect(option)}><span className={`${selected.includes(option) ? 'font-semibold' : 'font-normal'} block truncate`}>{option}</span>{selected.includes(option) && <span className="text-[#00A3E0] absolute inset-y-0 right-0 flex items-center pr-4"><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>}</li>)}</ul></div>}
        </div>
    );
};

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

const processChartData = (data: any[], config: DynamicChartConfig): any[] => {
    const { chartType, category, value, legend, stackType, colorValue } = config;

    if (chartType === 'Scatter' || chartType === 'Waterfall' || chartType === 'Funnel') {
        // These charts handle their own data processing or use static/pre-processed data.
        return data;
    }
    
    if (chartType === 'Treemap') {
        const categoryKey = category?.dataKey;
        const sizeKey = value?.dataKey;
        const colorKey = colorValue?.dataKey;

        if (!categoryKey || !sizeKey || !colorKey || !data) return [];

        const groups = new Map<string, SalesData[]>();
        (data as SalesData[]).forEach(item => {
            const key = String(item[categoryKey as keyof SalesData]);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(item);
        });
        
        const treemapData = Array.from(groups.entries()).map(([key, items]) => {
          return {
            name: key,
            size: aggregate(items, sizeKey as keyof SalesData, value?.aggregation || 'SUM'),
            colorMetric: aggregate(items, colorKey as keyof SalesData, colorValue?.aggregation || 'AVERAGE'),
          };
        });
        return treemapData;
    }

    if (chartType === 'Combo') {
        const categoryKey = category?.dataKey;
        const barValueKey = value?.dataKey;
        const lineValueKey = config.lineValue?.dataKey;
  
        if (!categoryKey || !barValueKey || !lineValueKey) return [];
  
        const groups = new Map<string, SalesData[]>();
        data.forEach(item => {
            const key = String(item[categoryKey as keyof SalesData]);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(item);
        });
        
        const aggregatedList: any[] = [];
        groups.forEach((items, key) => {
          const barValue = aggregate(items, barValueKey as keyof SalesData, value.aggregation);
          const lineValue = aggregate(items, lineValueKey as keyof SalesData, config.lineValue.aggregation);
          aggregatedList.push({
            [categoryKey]: key,
            [barValueKey]: barValue,
            [lineValueKey]: lineValue,
          });
        });
        // Sort data for time-series consistency
        const sortedMonths = allMonths;
        return aggregatedList.sort((a,b) => sortedMonths.indexOf(a[categoryKey]) - sortedMonths.indexOf(b[categoryKey]));
    }
    

    // This logic is for Bar, Line, Pie, Area
    const categoryKey = category?.dataKey;
    const valueKey = value?.dataKey;
    if (!categoryKey || !valueKey) return [];

    const groups = new Map<string, SalesData[]>();
    data.forEach(item => {
        const categoryValue = String(item[categoryKey as keyof SalesData]);
        const legendValue = legend ? String(item[legend.dataKey as keyof SalesData]) : 'default';
        const key = `${categoryValue}__${legendValue}`;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(item);
    });

    const aggregatedList: any[] = [];
    groups.forEach((items, key) => {
        const [categoryValue, legendValue] = key.split('__');
        const aggregatedValue = aggregate(items, valueKey as keyof SalesData, value.aggregation);
        const entry: any = {
            [categoryKey]: categoryValue,
            [valueKey]: aggregatedValue,
        };
        if (legend) {
            entry[legend.dataKey as keyof SalesData] = legendValue;
        }
        aggregatedList.push(entry);
    });
    
    if (chartType === 'Pie') {
        return aggregatedList.map(item => ({
            name: item[categoryKey],
            value: item[valueKey],
        }));
    }

    if (legend) {
        const pivotedMap = new Map<string, any>();
        aggregatedList.forEach(item => {
            const categoryValue = item[categoryKey];
            const legendValue = item[legend.dataKey as keyof SalesData];
            const numericValue = item[valueKey];

            if (!pivotedMap.has(categoryValue)) {
                pivotedMap.set(categoryValue, { [categoryKey]: categoryValue });
            }
            const pivotedEntry = pivotedMap.get(categoryValue)!;
            pivotedEntry[legendValue] = numericValue;
        });

        const finalData = Array.from(pivotedMap.values());
        
        if (stackType === '100%stacked') {
            finalData.forEach(row => {
                const legendKeys = Object.keys(row).filter(k => k !== categoryKey);
                const total = legendKeys.reduce((sum, key) => sum + (row[key] || 0), 0);
                if (total > 0) {
                    legendKeys.forEach(key => {
                        row[key] = (row[key] || 0) / total;
                    });
                }
            });
        }
        return finalData;
    }

    return aggregatedList;
};

const Dashboard: React.FC = () => {
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const filteredData = useMemo(() => rawSalesData.filter(item => 
        (selectedMonths.length === 0 || selectedMonths.includes(item.mes)) &&
        (selectedRegions.length === 0 || selectedRegions.includes(item.regiao)) &&
        (selectedCategories.length === 0 || selectedCategories.includes(item.categoria))
    ), [selectedMonths, selectedRegions, selectedCategories]);
    
    const clearFilters = () => {
        setSelectedMonths([]);
        setSelectedRegions([]);
        setSelectedCategories([]);
    };

    const widgetData = useMemo(() => {
        const dataMap: Record<string, any> = {};

        dataMap.kpiData = {
            totalVendas: filteredData.reduce((acc, item) => acc + item.vendas, 0),
            totalLucro: filteredData.reduce((acc, item) => acc + item.lucro, 0),
            totalClientes: filteredData.reduce((acc, item) => acc + item.clientes, 0),
            ticketMedio: filteredData.reduce((acc, item) => acc + item.clientes, 0) > 0 ? filteredData.reduce((acc, item) => acc + item.vendas, 0) / filteredData.reduce((acc, item) => acc + item.clientes, 0) : 0,
        };
        
        dataMap.detailedData = filteredData;
        dataMap.waterfallData = waterfallSourceData;
        dataMap.funnelData = funnelSourceData;

        DASHBOARD_CONFIG.widgets.forEach(widget => {
            const isDynamicChart = !['KpiCard', 'DataTable', 'Matrix', 'BubbleMap', 'ChoroplethMap', 'HeatmapChart'].includes(widget.component);
            if (isDynamicChart) {
                const config = widget.config as DynamicChartConfig;
                const sourceData = dataMap[config.sourceDataKey];
                if (sourceData) {
                    dataMap[widget.id] = processChartData(sourceData, config);
                }
            }
        });
        
        return dataMap;

    }, [filteredData]);
    
    const getWidgetProps = useCallback((widget: DashboardWidget): any => {
        const { id, title, config, component } = widget;
        switch(component) {
            case 'KpiCard': {
                const kpiConfig = config as KpiConfig;
                const kpiData = widgetData.kpiData;
                return {
                    title,
                    value: kpiData ? kpiConfig.formatter(kpiData[kpiConfig.valueKey]) : '',
                    description: kpiConfig.description,
                    isLoading: widget.isLoading,
                    error: widget.error,
                };
            }
            case 'LineChart':
            case 'BarChart':
            case 'PieChart':
            case 'AreaChart':
            case 'ComboChart':
            case 'WaterfallChart':
            case 'FunnelChart':
            case 'TreemapChart': {
                const chartConfig = config as DynamicChartConfig;
                const data = widgetData[id];

                const fallbackData = component === 'PieChart' 
                  ? ALL_CATEGORIES.map(c => ({name: c, value: 0})) 
                  : [];
                
                return { 
                    title, 
                    data: data && data.length > 0 ? data : fallbackData,
                    config: chartConfig 
                };
            }
            case 'ScatterChart': {
                 const chartConfig = config as DynamicChartConfig;
                 return { 
                    title, 
                    data: widgetData[chartConfig.sourceDataKey] || [],
                    config: chartConfig 
                };
            }
            case 'DataTable': {
                const tableConfig = config as DataTableConfig;
                return { 
                    title, 
                    data: widgetData.detailedData || [], 
                    columns: tableConfig.columns,
                    userRole: 'viewer', 
                    onAddItem:()=>{}, 
                    onEditItem:()=>{}, 
                    onDeleteItem:()=>{} 
                };
            }
            case 'Matrix': {
                const matrixConfig = config as MatrixConfig;
                return {
                    title,
                    data: widgetData.detailedData || [],
                    config: matrixConfig,
                };
            }
            case 'BubbleMap': {
                const mapConfig = config as BubbleMapConfig;
                return {
                    title,
                    data: widgetData.detailedData || [],
                    config: mapConfig,
                };
            }
            case 'ChoroplethMap': {
                const mapConfig = config as ChoroplethMapConfig;
                return {
                    title,
                    data: widgetData.detailedData || [],
                    config: mapConfig,
                };
            }
            case 'HeatmapChart': {
                const heatmapConfig = config as HeatmapConfig;
                return {
                    title,
                    data: widgetData.detailedData || [],
                    config: heatmapConfig,
                };
            }
            default: return {};
        }
    }, [widgetData]);

    const hasFilters = selectedMonths.length > 0 || selectedRegions.length > 0 || selectedCategories.length > 0;
    const noDataAfterFilter = hasFilters && filteredData.length === 0;

    const filterOptions: Record<string, {label: string, options: string[], selected: string[], setter: (val: string[]) => void}> = {
        month: { label: "Mês", options: allMonths, selected: selectedMonths, setter: setSelectedMonths },
        region: { label: "Região", options: allRegions, selected: selectedRegions, setter: setSelectedRegions },
        category: { label: "Categoria", options: ALL_CATEGORIES, selected: selectedCategories, setter: setSelectedCategories },
    }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <h1 className="text-3xl font-bold text-gray-800">Dashboard Interativo</h1>
         <div className="flex flex-wrap items-center justify-end gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-full md:w-auto">
            {DASHBOARD_CONFIG.filters.map(filterKey => {
                const f = filterOptions[filterKey];
                return <MultiSelectFilter key={filterKey} placeholder={`Filtrar por ${f.label}...`} options={f.options} selected={f.selected} onChange={f.setter} />
            })}
            {hasFilters && <button onClick={clearFilters} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Limpar Filtros"><XIcon title="Limpar Filtros" className="w-5 h-5"/></button>}
        </div>
      </div>
      
      {noDataAfterFilter ? (
        <div className="bg-white p-10 rounded-lg shadow-lg text-center text-gray-600 h-96 flex flex-col justify-center items-center">
            <h3 className="text-xl font-semibold">Nenhum dado encontrado</h3>
            <p className="mt-2">Tente ajustar ou limpar os filtros para visualizar os dados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {DASHBOARD_CONFIG.widgets.map(widget => {
                const Component = componentMap[widget.component];
                const props = getWidgetProps(widget);
                                
                return (
                    <div key={widget.id} className={widget.gridClass}>
                        <Component {...props} />
                    </div>
                );
            })}
        </div>
       )}
    </div>
  );
};

export default Dashboard;