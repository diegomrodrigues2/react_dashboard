






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
import { SalesData, DashboardWidget, KpiConfig, DataTableConfig, DynamicChartConfig, MatrixConfig, BubbleMapConfig, ChoroplethMapConfig, HeatmapConfig } from '../types.ts';
import { DASHBOARD_CONFIG } from './dashboardConfig.ts';
import { ALL_CATEGORIES } from '../constants.ts';
import { fetchSalesData, fetchWaterfallData, fetchFunnelData } from '../services/dataService.ts';
import { processChartData, ALL_MONTHS } from '../utils/dashboardData.ts';
import BubbleMap from './charts/BubbleMap.tsx';
import ChoroplethMap from './charts/ChoroplethMap.tsx';
import HeatmapChart from './charts/HeatmapChart.tsx';

export type { SalesData };
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


const Dashboard: React.FC = () => {
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [waterfallData, setWaterfallData] = useState<any[]>([]);
    const [funnelData, setFunnelData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [sales, waterfall, funnel] = await Promise.all([
                    fetchSalesData(),
                    fetchWaterfallData(),
                    fetchFunnelData()
                ]);
                setSalesData(sales);
                setWaterfallData(waterfall);
                setFunnelData(funnel);
            } catch (e) {
                setError('Erro ao carregar dados');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const allRegions = useMemo(() => [...new Set(salesData.map(d => d.regiao))].sort(), [salesData]);

    const filteredData = useMemo(() => salesData.filter(item =>
        (selectedMonths.length === 0 || selectedMonths.includes(item.mes)) &&
        (selectedRegions.length === 0 || selectedRegions.includes(item.regiao)) &&
        (selectedCategories.length === 0 || selectedCategories.includes(item.categoria))
    ), [salesData, selectedMonths, selectedRegions, selectedCategories]);

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
        dataMap.waterfallData = waterfallData;
        dataMap.funnelData = funnelData;

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

    }, [filteredData, waterfallData, funnelData]);
    
    const getWidgetProps = useCallback((widget: DashboardWidget): any => {
        const { id, title, config, component } = widget;
        switch(component) {
            case 'KpiCard': {
                const kpiConfig = config as KpiConfig;
                return { title, value: kpiConfig.formatter(widgetData.kpiData[kpiConfig.valueKey]), description: kpiConfig.description };
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
        month: { label: "Mês", options: ALL_MONTHS, selected: selectedMonths, setter: setSelectedMonths },
        region: { label: "Região", options: allRegions, selected: selectedRegions, setter: setSelectedRegions },
        category: { label: "Categoria", options: ALL_CATEGORIES, selected: selectedCategories, setter: setSelectedCategories },
    }

    if (loading) {
        return <div className="p-4">Carregando...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
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
             {hasFilters && <button onClick={clearFilters} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Limpar Filtros"><XIcon className="w-5 h-5"/></button>}
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