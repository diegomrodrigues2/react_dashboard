

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

/** Utility type to extract string keys from a record */
export type DataKey<T extends object> = Extract<keyof T, string>;

/** Utility type for retrieving the value type of a key from a record */
export type DataValue<T extends object, K extends DataKey<T>> = T[K];

export interface ColumnConfig<T extends object | ActivityLog> {
  header: string;
  accessor: DataKey<T>;
  render?: (value: DataValue<T, DataKey<T>>, row: T) => React.ReactNode;
}

export interface FieldConfig<T extends object = DataItem> {
  name: DataKey<T>;
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
  hidden?: boolean;
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

export interface ChartWell<T extends object = Record<string, unknown>> {
    dataKey: DataKey<T> | 'category' | 'value' | 'stage' | 'name' | 'size' | 'colorMetric';
    label?: string;
    aggregation?: AggregationType;
    formatter?: (value: number) => string;
}

export interface DynamicChartConfig<T extends object = Record<string, unknown>> {
    sourceDataKey: 'detailedData' | 'waterfallData' | 'funnelData';
    chartType: 'Bar' | 'Line' | 'Pie' | 'Scatter' | 'Area' | 'Combo' | 'Waterfall' | 'Funnel' | 'Treemap';

    // Wells (data fields)
    category?: ChartWell<T>; // For Pie: slices. For Bar/Line: axis categories. For Scatter: 'Details' for each point. For Funnel/Treemap: category name.
    value?: ChartWell<T>;    // For Pie: slice values. For Bar/Line: axis values. For Combo: Bar value. For Waterfall: Change value. For Funnel: stage value. For Treemap: node size.
    colorValue?: ChartWell<T>; // For Treemap color scale.
    lineValue?: ChartWell<T>; // For Combo chart's line value

    // Wells for Scatter charts
    x?: ChartWell<T>;
    y?: ChartWell<T>;
    size?: ChartWell<T>;     // Turns Scatter into Bubble chart
    playAxis?: ChartWell<T>; // Adds animation dimension

    legend?: ChartWell<T>;  // For splitting/coloring data in Bar, Line, Scatter

    // Config specific to chart visuals
    layout?: 'horizontal' | 'vertical'; // For Bar charts
    stackType?: 'none' | 'stacked' | '100%stacked'; // For Bar/Area charts

    // Future-proofing for more advanced features
    smallMultiples?: ChartWell<T>;
    tooltips?: ChartWell<T>[];
}

export interface MatrixConfig<T extends object = Record<string, unknown>> {
    sourceDataKey: 'detailedData';
    rows: ChartWell<T>[];
    columns: ChartWell<T>[];
    values: ChartWell<T>[];
    rowSubtotals?: boolean;
    columnSubtotals?: boolean;
}

export interface HeatmapConfig<T extends object = Record<string, unknown>> {
    sourceDataKey: 'detailedData';
    x: ChartWell<T>;
    y: ChartWell<T>;
    value: ChartWell<T>;
}

export interface BubbleMapConfig<T extends object = Record<string, unknown>> {
    sourceDataKey: 'detailedData';
    location: {
        coordinatesKey: 'coordinates';
        labelKey: DataKey<T>;
    };
    size: ChartWell<T>;
    color: ChartWell<T>;
}

export interface ChoroplethMapConfig<T extends object = Record<string, unknown>> {
    sourceDataKey: 'detailedData';
    geo: {
        dataKey: DataKey<T>;
        featureKey: string;
    };
    value: ChartWell<T>;
}

export type WidgetConfig<T extends object = Record<string, unknown>> =
    | KpiConfig
    | DynamicChartConfig<T>
    | DataTableConfig
    | MatrixConfig<T>
    | BubbleMapConfig<T>
    | ChoroplethMapConfig<T>
    | HeatmapConfig<T>;

export interface WidgetLayout {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface DashboardWidget {
    id: string;
    component: ChartComponentType;
    gridClass: string;
    title?: string;
    config: WidgetConfig;
    isLoading?: boolean;
    error?: string;
    layout?: WidgetLayout;
}

export interface DashboardConfig {
    filters: ('month' | 'region' | 'category')[];
    widgets: DashboardWidget[];
}