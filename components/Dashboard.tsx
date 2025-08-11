






import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import GridLayout, { WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
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
import { SalesData, DashboardWidget, KpiConfig, DataTableConfig, DynamicChartConfig, AggregationType, MatrixConfig, BubbleMapConfig, ChoroplethMapConfig, HeatmapConfig, DashboardConfig, WidgetLayout, ChartComponentType, FieldConfig } from '../types.ts';
import { ALL_CATEGORIES } from '../constants.ts';
import { getSalesData, getWaterfallData, getFunnelData, getAllMonths, getDashboardConfig, saveDashboardConfig } from '../services/dashboardData.ts';
import BubbleMap from './charts/BubbleMap.tsx';
import ChoroplethMap from './charts/ChoroplethMap.tsx';
import HeatmapChart from './charts/HeatmapChart.tsx';
import Modal from './Modal.tsx';
import WidgetPalette, { createWidgetFromType } from './WidgetPalette.tsx';

export type { SalesData };

const componentMap = { KpiCard, LineChart, BarChart, PieChart, DataTable, ScatterChart, AreaChart, ComboChart, WaterfallChart, FunnelChart, TreemapChart, Matrix, BubbleMap, ChoroplethMap, HeatmapChart };
const ReactGridLayout = WidthProvider(GridLayout);

export const applyLayoutToWidgets = (config: DashboardConfig, layout: Layout[]): DashboardConfig => {
    const map = layout.reduce<Record<string, WidgetLayout>>((acc, l) => {
        acc[l.i] = { x: l.x, y: l.y, w: l.w, h: l.h };
        return acc;
    }, {});
    return {
        ...config,
        widgets: config.widgets.map(w => ({ ...w, layout: map[w.id] || w.layout }))
    };
};

export const addWidget = (config: DashboardConfig, widget: DashboardWidget): DashboardConfig => ({
    ...config,
    widgets: [...config.widgets, widget]
});

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

const processChartData = (data: any[], config: DynamicChartConfig, monthsOrder: string[] = []): any[] => {
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
        // Sort data for time-series consistency if monthsOrder provided
        if (monthsOrder && monthsOrder.length > 0) {
            return aggregatedList.sort((a,b) => monthsOrder.indexOf(a[categoryKey]) - monthsOrder.indexOf(b[categoryKey]));
        }
        return aggregatedList;
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

    const [rawSalesData, setRawSalesData] = useState<SalesData[]>([]);
    const [waterfallSourceData, setWaterfallSourceData] = useState<any[]>([]);
    const [funnelSourceData, setFunnelSourceData] = useState<any[]>([]);
    const [allMonths, setAllMonths] = useState<string[]>([]);
    const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [layout, setLayout] = useState<Layout[]>([]);
    const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [sales, waterfall, funnel, months, config] = await Promise.all([
                getSalesData(),
                getWaterfallData(),
                getFunnelData(),
                getAllMonths(),
                getDashboardConfig()
            ]);
            setRawSalesData(sales);
            setWaterfallSourceData(waterfall);
            setFunnelSourceData(funnel);
            setAllMonths(months);
            setDashboardConfig(config);
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!dashboardConfig) return;

        // Infer default size from gridClass or component when layout is missing
        const spanFromGridClass = (gridClass?: string): number | undefined => {
            if (!gridClass) return undefined;
            // Prefer larger spans; look for any breakpoint and take the max (lg wins)
            const spans: number[] = [];
            const regex = /(?:^|\s)(?:[a-z]+:)?col-span-(\d+)/g;
            let m: RegExpExecArray | null;
            while ((m = regex.exec(gridClass)) !== null) {
                const v = Number(m[1]);
                if (!Number.isNaN(v)) spans.push(v);
            }
            if (spans.length === 0) return undefined;
            return Math.max(1, Math.min(12, Math.max(...spans)));
        };

        const defaultSizeForComponent = (component: ChartComponentType): { w: number; h: number } => {
            switch (component) {
                case 'KpiCard':
                    return { w: 3, h: 3 };
                case 'DataTable':
                    return { w: 12, h: 10 };
                case 'Matrix':
                    return { w: 12, h: 8 };
                case 'ChoroplethMap':
                case 'BubbleMap':
                    return { w: 12, h: 7 };
                case 'LineChart':
                    return { w: 12, h: 6 };
                case 'ComboChart':
                case 'WaterfallChart':
                case 'FunnelChart':
                case 'TreemapChart':
                case 'BarChart':
                case 'AreaChart':
                case 'PieChart':
                case 'ScatterChart':
                case 'HeatmapChart':
                default:
                    return { w: 6, h: 6 };
            }
        };

        const minHeightForComponent = (component: ChartComponentType): number => {
            switch (component) {
                case 'KpiCard':
                    return 3;
                case 'DataTable':
                    return 8;
                case 'Matrix':
                    return 7;
                case 'ChoroplethMap':
                case 'BubbleMap':
                    return 6;
                case 'LineChart':
                    return 5;
                default:
                    return 5;
            }
        };

        // First-fit bin packing into a 12-col grid to avoid any overlaps.
        const COLS = 12;

        type Cell = 0 | 1;
        const rows: Cell[][] = [];

        const ensureRows = (needed: number) => {
            while (rows.length < needed) rows.push(Array.from({ length: COLS }, () => 0));
        };

        const areaIsFree = (x: number, y: number, w: number, h: number): boolean => {
            ensureRows(y + h);
            for (let dy = 0; dy < h; dy++) {
                for (let dx = 0; dx < w; dx++) {
                    if (rows[y + dy][x + dx] === 1) return false;
                }
            }
            return true;
        };

        const occupy = (x: number, y: number, w: number, h: number) => {
            ensureRows(y + h);
            for (let dy = 0; dy < h; dy++) {
                for (let dx = 0; dx < w; dx++) rows[y + dy][x + dx] = 1;
            }
        };

        const findSpot = (w: number, h: number): { x: number; y: number } => {
            let y = 0;
            while (true) {
                ensureRows(y + h);
                for (let x = 0; x <= COLS - w; x++) {
                    if (areaIsFree(x, y, w, h)) return { x, y };
                }
                y += 1;
            }
        };

        const packedLayout: Layout[] = [];

        dashboardConfig.widgets.forEach((w) => {
            const inferredSpan = spanFromGridClass(w.gridClass);
            const defaults = defaultSizeForComponent(w.component);
            const itemW = Math.min(COLS, w.layout?.w ?? inferredSpan ?? defaults.w);
            const itemH = Math.max(1, w.layout?.h ?? defaults.h);
            const itemMinH = minHeightForComponent(w.component);
            const itemHRows = Math.max(itemH, itemMinH);

            // Try saved position first if it fits and is free
            const desiredX = w.layout?.x ?? undefined;
            const desiredY = w.layout?.y ?? undefined;
            let placed: { x: number; y: number };
            if (
                desiredX !== undefined && desiredY !== undefined &&
                desiredX >= 0 && desiredX + itemW <= COLS && desiredY >= 0 &&
                areaIsFree(desiredX, desiredY, itemW, itemHRows)
            ) {
                placed = { x: desiredX, y: desiredY };
            } else {
                placed = findSpot(itemW, itemHRows);
            }

            occupy(placed.x, placed.y, itemW, itemHRows);
            packedLayout.push({ i: w.id, x: placed.x, y: placed.y, w: itemW, h: itemHRows, minH: itemMinH });
        });

        setLayout(packedLayout);
    }, [dashboardConfig]);

    const allRegions = useMemo(() => [...new Set(rawSalesData.map(d => d.regiao))].sort(), [rawSalesData]);

    const filteredData = useMemo(() => rawSalesData.filter(item =>
        (selectedMonths.length === 0 || selectedMonths.includes(item.mes)) &&
        (selectedRegions.length === 0 || selectedRegions.includes(item.regiao)) &&
        (selectedCategories.length === 0 || selectedCategories.includes(item.categoria))
    ), [rawSalesData, selectedMonths, selectedRegions, selectedCategories]);
    
    const clearFilters = () => {
        setSelectedMonths([]);
        setSelectedRegions([]);
        setSelectedCategories([]);
    };

    const handleLayoutChange = (newLayout: Layout[]) => {
        if (isEditing) setLayout(newLayout);
    };

    const handleDrop = (_layout: Layout[], item: Layout, e: any) => {
        const type = e.dataTransfer?.getData('widgetType') as ChartComponentType;
        if (!type || !dashboardConfig) return;
        const id = `${type}-${Date.now()}`;
        const widget = createWidgetFromType(type, id);
        const layoutItem = { i: id, x: item.x, y: item.y, w: item.w, h: item.h };
        const widgetWithLayout = { ...widget, layout: { x: item.x, y: item.y, w: item.w, h: item.h } };
        const newConfig = addWidget(dashboardConfig, widgetWithLayout);
        setDashboardConfig(newConfig);
        setLayout(prev => [...prev, layoutItem]);
        saveDashboardConfig(newConfig);
    };

    const handleEditSubmit = (data: any) => {
        if (!editingWidget || !dashboardConfig) return;
        const newWidgets = dashboardConfig.widgets.map(w => w.id === editingWidget.id ? { ...w, title: data.title } : w);
        const newConfig = { ...dashboardConfig, widgets: newWidgets };
        setDashboardConfig(newConfig);
        saveDashboardConfig(newConfig);
        setEditingWidget(null);
    };

    const toggleEdit = async () => {
        if (isEditing && dashboardConfig) {
            const newConfig = applyLayoutToWidgets(dashboardConfig, layout);
            await saveDashboardConfig(newConfig);
            setDashboardConfig(newConfig);
        }
        setIsEditing(prev => !prev);
    };

    const widgetData = useMemo(() => {
        if (!dashboardConfig) return {};
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

        dashboardConfig.widgets.forEach(widget => {
            const isDynamicChart = !['KpiCard', 'DataTable', 'Matrix', 'BubbleMap', 'ChoroplethMap', 'HeatmapChart'].includes(widget.component);
            if (isDynamicChart) {
                const config = widget.config as DynamicChartConfig;
                const sourceData = dataMap[config.sourceDataKey];
                if (sourceData) {
                    dataMap[widget.id] = processChartData(sourceData, config, allMonths);
                }
            }
        });
        
        return dataMap;

    }, [filteredData, waterfallSourceData, funnelSourceData, dashboardConfig, allMonths]);
    
    const getWidgetProps = useCallback((widget: DashboardWidget): any => {
        const { id, title, config, component } = widget;
        switch(component) {
            case 'KpiCard': {
                const kpiConfig = config as KpiConfig;
                const kpiData = widgetData.kpiData;
                const fallbackFormatter = (value: number) => typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value ?? '');
                const formatter = typeof kpiConfig.formatter === 'function' ? kpiConfig.formatter : fallbackFormatter;
                return {
                    title,
                    value: kpiData ? formatter(kpiData[kpiConfig.valueKey]) : '',
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

    if (loading || !dashboardConfig) {
        return <div className="text-center p-10">Carregando...</div>;
    }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <h1 className="text-3xl font-bold text-gray-800">Dashboard Interativo</h1>
          <div className="flex flex-wrap items-center justify-end gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-full md:w-auto">
            {dashboardConfig.filters.map(filterKey => {
                const f = filterOptions[filterKey];
                return (
                    <React.Fragment key={filterKey}>
                        <MultiSelectFilter placeholder={`Filtrar por ${f.label}...`} options={f.options} selected={f.selected} onChange={f.setter} />
                    </React.Fragment>
                );
            })}
            {hasFilters && <button onClick={clearFilters} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Limpar Filtros"><XIcon title="Limpar Filtros" className="w-5 h-5"/></button>}
            <button onClick={toggleEdit} className="p-2 text-white bg-[#00A3E0] hover:bg-[#0082B8] rounded-md">{isEditing ? 'Salvar Layout' : 'Editar Layout'}</button>
          </div>
      </div>
      
      {noDataAfterFilter ? (
        <div className="bg-white p-10 rounded-lg shadow-lg text-center text-gray-600 h-96 flex flex-col justify-center items-center">
            <h3 className="text-xl font-semibold">Nenhum dado encontrado</h3>
            <p className="mt-2">Tente ajustar ou limpar os filtros para visualizar os dados.</p>
        </div>
      ) : (
        <>
        {isEditing && <WidgetPalette />}
        <ReactGridLayout
            layout={layout}
            cols={12}
            rowHeight={30}
            compactType="vertical"
            preventCollision={!isEditing}
            allowOverlap={false}
            isBounded={!isEditing}
            isDraggable={isEditing}
            isResizable={isEditing}
            resizeHandles={['se']}
            isDroppable={isEditing}
            onDrop={handleDrop}
            droppingItem={{ i: '__dropping', w: 6, h: 6 }}
            onLayoutChange={handleLayoutChange}
            onResizeStop={(_layout, item) => {
                setLayout(prev => prev.map(l => l.i === item.i ? { ...l, w: item.w, h: item.h } : l));
            }}
            onDragStop={(_layout, item) => {
                setLayout(prev => prev.map(l => l.i === item.i ? { ...l, x: item.x, y: item.y } : l));
            }}
            margin={[20,20]}
            containerPadding={[20,20]}
            className={isEditing ? 'dashboard-editing bg-gray-50 border-2 border-dashed' : ''}
            draggableHandle=".drag-handle"
        >
            {dashboardConfig.widgets.map(widget => {
                const Component = componentMap[widget.component];
                const props = getWidgetProps(widget);
                return (
                    <div
                        key={widget.id}
                        className={(isEditing ? 'border border-dashed relative ' : 'relative ') + 'h-full'}
                        style={{ minHeight: 220 }}
                    >
                        {isEditing && widget.component !== 'KpiCard' && (
                            <span className="drag-handle absolute top-1 left-1 cursor-move">⋮⋮</span>
                        )}
                        {isEditing && (
                            <button onClick={() => setEditingWidget(widget)} className="absolute top-1 right-1 bg-white p-1 rounded shadow" aria-label="Editar widget">✏️</button>
                        )}
                        <Component {...props} />
                    </div>
                );
            })}
        </ReactGridLayout>
        {isEditing && (
          <style>{`
            .dashboard-editing .react-grid-placeholder {
              background: rgba(0,163,224,0.2);
              border: 2px dashed #00A3E0;
            }
            /* Garante que o handle fique exatamente no canto inferior direito do item */
            .dashboard-editing .react-grid-item { position: relative; }
            .dashboard-editing .react-resizable-handle {
              right: 0;
              bottom: 0;
              width: 14px;
              height: 14px;
              padding: 0 !important; /* remove offset do CSS padrão do react-resizable */
              background: none; /* remove a imagem padrão para evitar desalinhamento visual */
              border-right: 3px solid #00A3E0;
              border-bottom: 3px solid #00A3E0;
              box-sizing: content-box;
              cursor: se-resize;
              z-index: 10;
            }
          `}</style>
        )}
        </>
      )}
      <Modal
        isOpen={!!editingWidget}
        onClose={() => setEditingWidget(null)}
        onSubmit={handleEditSubmit}
        title="Editar Widget"
        fields={[{ name: 'title', label: 'Título', type: 'text', required: true } as FieldConfig<any>]}
        initialData={{ title: editingWidget?.title || '' }}
      />
    </div>
  );
};

export default Dashboard;