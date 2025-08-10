

import React from 'react';
import { SalesData as SalesDataType } from './components/Dashboard.tsx'; // Import to resolve name conflict


export interface ContaGestora {
  id: string;
  Conta: string | number; // Can be number
  NomeCliente: string;
  NomeClienteBTB?: string;
  SubManager?: string;
  TIPO?: string;
}

export interface ContaAssessor {
  id:string;
  AssessorSINACOROriginal: string;
  AssessorSINACOR: string;
  Assessor: string;
}

export interface CbioBtc {
  id: string;
  Historico: string; 
  Broker: string;
  ContaTipoB: string; // 'Y'/'N'
  Segmento: string;
  CommodityProduto: string;
  Mercado: string;
}

export interface SplitExcecao {
  id: string;
  DataAlteracao: string; // YYYY-MM-DD for date type
  Conta: string | number; // Can be number
  Segmento: string;
  Produto: string;
  Assessor: string;
  Proporcao: string | number; // e.g., "100" for 100% if number type
  AssessorSinacor: string;
  SegmentoCliente: string;
}

export interface BrokerCode {
  id: string;
  Type: string;
  OTCBrokerCode: string;
  FUTBrokerCode: string;
  Commission: string | number; // number if type 'number'
  ShareCode: string;
  BCTeam: string;
  TeamNickname: string;
  PoolName: string;
  Department: string;
  Entity: string;
  Region: string;
  Office: string;
  Head: string;
  ChangedOrCreatedOn: string; // YYYY-MM-DD for date type
  Status: string;
  Obs?: string;
}

export interface SalesData {
  id: string;
  mes: string;
  regiao: string;
  categoria: string;
  vendas: number;
  lucro: number;
  clientes: number;
  coordinates?: [number, number];
}

export type DataItem = ContaGestora | ContaAssessor | CbioBtc | SplitExcecao | BrokerCode | SalesData;

export interface ColumnConfig<T extends DataItem | ActivityLog> { 
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FieldConfig<T extends DataItem = DataItem> { // Made generic, default to DataItem for broader use if needed
  name: keyof T; // Changed from keyof DataItem
  label: string;
  type: 'text' | 'number' | 'select' | 'date'; 
  options?: string[]; 
  required?: boolean;
}

export interface MenuItem<T extends DataItem> {
  id: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  columns?: ColumnConfig<T>[];
  fields?: FieldConfig<T>[];
  dataKey?: keyof AppData;
  getRowClass?: (item: T) => string;
}

export interface AppData {
  contaGestora: ContaGestora[];
  contaAssessor: ContaAssessor[];
  cbioBtc: CbioBtc[];
  splitExcecao: SplitExcecao[];
  brokerCodes: BrokerCode[];
}

// User Profile Types
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserData {
  id: string; // Typically the username
  name: string; // Display name, e.g., "Admin User"
  role: UserRole;
}

export interface ActivityLog {
  id: string;
  timestamp: string; 
  action: string;
  details: string;
  targetTable?: string; 
}

// Dashboard Types
export interface KpiData {
    totalVendas: number;
    totalLucro: number;
    totalClientes: number;
    ticketMedio: number;
}

export type ChartComponentType = 'KpiCard' | 'LineChart' | 'BarChart' | 'PieChart' | 'DataTable' | 'ScatterChart' | 'AreaChart' | 'ComboChart' | 'WaterfallChart' | 'FunnelChart' | 'TreemapChart' | 'Matrix' | 'BubbleMap' | 'ChoroplethMap' | 'HeatmapChart';

// Configuration for individual widgets
export interface KpiConfig {
    valueKey: keyof KpiData;
    description: string;
    formatter: (value: number) => string;
}

export interface DataTableConfig {
    dataKey: 'detailedData';
    columns: ColumnConfig<SalesDataType>[];
}

// New Dynamic Chart Configuration Types
export type AggregationType = 'SUM' | 'COUNT' | 'AVERAGE' | 'NONE';

export interface ChartWell {
    dataKey: keyof SalesData | 'category' | 'value' | 'stage' | 'name' | 'size' | 'colorMetric';
    label?: string;
    aggregation?: AggregationType;
}

export interface DynamicChartConfig {
    sourceDataKey: 'detailedData' | 'waterfallData' | 'funnelData';
    chartType: 'Bar' | 'Line' | 'Pie' | 'Scatter' | 'Area' | 'Combo' | 'Waterfall' | 'Funnel' | 'Treemap';
    
    // Wells (data fields)
    category?: ChartWell; // For Pie: slices. For Bar/Line: axis categories. For Scatter: 'Details' for each point. For Funnel/Treemap: category name.
    value?: ChartWell;    // For Pie: slice values. For Bar/Line: axis values. For Combo: Bar value. For Waterfall: Change value. For Funnel: stage value. For Treemap: node size.
    colorValue?: ChartWell; // For Treemap color scale.
    lineValue?: ChartWell; // For Combo chart's line value
    
    // Wells for Scatter charts
    x?: ChartWell;
    y?: ChartWell;
    size?: ChartWell;     // Turns Scatter into Bubble chart
    playAxis?: ChartWell; // Adds animation dimension

    legend?: ChartWell;  // For splitting/coloring data in Bar, Line, Scatter
    
    // Config specific to chart visuals
    layout?: 'horizontal' | 'vertical'; // For Bar charts
    stackType?: 'none' | 'stacked' | '100%stacked'; // For Bar/Area charts

    // Future-proofing for more advanced features
    smallMultiples?: ChartWell;
    tooltips?: ChartWell[];
}

export interface MatrixConfig {
    sourceDataKey: 'detailedData';
    rows: ChartWell[];
    columns: ChartWell[];
    values: ChartWell[];
    rowSubtotals?: boolean;
    columnSubtotals?: boolean;
}

export interface HeatmapConfig {
    sourceDataKey: 'detailedData';
    x: ChartWell;
    y: ChartWell;
    value: ChartWell;
}

export interface BubbleMapConfig {
    sourceDataKey: 'detailedData';
    location: {
        coordinatesKey: 'coordinates';
        labelKey: keyof SalesData;
    };
    size: ChartWell;
    color: ChartWell;
}

export interface ChoroplethMapConfig {
    sourceDataKey: 'detailedData';
    geo: {
        dataKey: keyof SalesData;
        featureKey: string;
    };
    value: ChartWell;
}

export type WidgetConfig = KpiConfig | DynamicChartConfig | DataTableConfig | MatrixConfig | BubbleMapConfig | ChoroplethMapConfig | HeatmapConfig;

export interface DashboardWidget {
    id: string;
    component: ChartComponentType;
    gridClass: string;
    title?: string;
    config: WidgetConfig;
}

export interface DashboardConfig {
    filters: ('month' | 'region' | 'category')[];
    widgets: DashboardWidget[];
}