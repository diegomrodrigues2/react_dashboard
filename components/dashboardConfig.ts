




import { DashboardConfig, ColumnConfig, SalesData, DynamicChartConfig, MatrixConfig, HeatmapConfig } from '../types.ts';
import { ALL_CATEGORIES } from '../constants.ts';

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const salesColumns: ColumnConfig<SalesData>[] = [
    { header: "Mês", accessor: "mes" },
    { header: "Região", accessor: "regiao" },
    { header: "Categoria", accessor: "categoria" },
    { header: "Vendas", accessor: "vendas", render: (value) => formatCurrency(value as number) },
    { header: "Lucro", accessor: "lucro", render: (value) => formatCurrency(value as number) },
    { header: "Clientes", accessor: "clientes" },
];

export const DASHBOARD_CONFIG: DashboardConfig = {
    filters: ['month', 'region', 'category'],
    widgets: [
        {
            id: 'kpi-vendas',
            component: 'KpiCard',
            gridClass: 'col-span-1 md:col-span-2 lg:col-span-3',
            title: 'Vendas Totais',
            config: {
                valueKey: 'totalVendas',
                description: 'para a seleção atual',
                formatter: formatCurrency
            }
        },
        {
            id: 'kpi-lucro',
            component: 'KpiCard',
            gridClass: 'col-span-1 md:col-span-2 lg:col-span-3',
            title: 'Lucro Total',
            config: {
                valueKey: 'totalLucro',
                description: 'para a seleção atual',
                formatter: formatCurrency
            }
        },
        {
            id: 'kpi-clientes',
            component: 'KpiCard',
            gridClass: 'col-span-1 md:col-span-2 lg:col-span-3',
            title: 'Total de Clientes',
            config: {
                valueKey: 'totalClientes',
                description: 'na seleção atual',
                formatter: (value) => value.toLocaleString('pt-BR')
            }
        },
        {
            id: 'kpi-ticket',
            component: 'KpiCard',
            gridClass: 'col-span-1 md:col-span-2 lg:col-span-3',
            title: 'Ticket Médio',
            config: {
                valueKey: 'ticketMedio',
                description: 'por cliente na seleção',
                formatter: formatCurrency
            }
        },
        {
            id: 'line-vendas-mes',
            component: 'LineChart',
            gridClass: 'col-span-1 lg:col-span-12',
            title: 'Tendência de Vendas Mensal',
            config: {
                sourceDataKey: 'detailedData',
                chartType: 'Line',
                category: { dataKey: 'mes', label: 'Mês' },
                value: { dataKey: 'vendas', aggregation: 'SUM', label: 'Vendas (BRL)' }
            } as DynamicChartConfig
        },
        {
            id: 'funnel-vendas',
            component: 'FunnelChart',
            gridClass: 'col-span-1 lg:col-span-6',
            title: 'Funil de Vendas',
            config: {
                sourceDataKey: 'funnelData',
                chartType: 'Funnel',
                category: { dataKey: 'stage' },
                value: { dataKey: 'value' }
            } as DynamicChartConfig
        },
        {
            id: 'treemap-vendas-regiao',
            component: 'TreemapChart',
            gridClass: 'col-span-1 lg:col-span-6',
            title: 'Composição de Vendas por Região e Lucratividade',
            config: {
                sourceDataKey: 'detailedData',
                chartType: 'Treemap',
                category: { dataKey: 'regiao', label: 'Região' },
                value: { dataKey: 'vendas', aggregation: 'SUM', label: 'Vendas' },
                colorValue: { dataKey: 'lucro', aggregation: 'AVERAGE', label: 'Lucro Médio' }
            } as DynamicChartConfig
        },
        {
            id: 'combo-vendas-lucro',
            component: 'ComboChart',
            gridClass: 'col-span-1 lg:col-span-6',
            title: 'Vendas vs. Lucro Mensal',
            config: {
                sourceDataKey: 'detailedData',
                chartType: 'Combo',
                category: { dataKey: 'mes', label: 'Mês' },
                value: { dataKey: 'vendas', aggregation: 'SUM', label: 'Vendas (BRL)' },
                lineValue: { dataKey: 'lucro', aggregation: 'SUM', label: 'Lucro (BRL)' }
            } as DynamicChartConfig
        },
        {
            id: 'waterfall-lucro',
            component: 'WaterfallChart',
            gridClass: 'col-span-1 lg:col-span-6',
            title: 'Decomposição do Resultado',
            config: {
                sourceDataKey: 'waterfallData',
                chartType: 'Waterfall',
                category: { dataKey: 'category', label: 'Etapa' },
                value: { dataKey: 'value', label: 'Valor (BRL)' }
            } as DynamicChartConfig
        },
        {
            id: 'bar-lucro-regiao',
            component: 'BarChart',
            gridClass: 'col-span-1 lg:col-span-6',
            title: 'Lucro por Região',
            config: {
                sourceDataKey: 'detailedData',
                chartType: 'Bar',
                layout: 'horizontal',
                category: { dataKey: 'regiao', label: 'Região' },
                value: { dataKey: 'lucro', aggregation: 'SUM', label: 'Lucro (BRL)' }
            } as DynamicChartConfig
        },
        {
            id: 'pie-vendas-categoria',
            component: 'PieChart',
            gridClass: 'col-span-1 lg:col-span-6',
            title: 'Distribuição de Vendas por Categoria',
            config: {
                sourceDataKey: 'detailedData',
                chartType: 'Pie',
                category: { dataKey: 'categoria' },
                value: { dataKey: 'vendas', aggregation: 'SUM' }
            } as DynamicChartConfig
        },
        {
            id: 'area-vendas-categoria-overlap',
            component: 'AreaChart',
            gridClass: 'col-span-1 lg:col-span-6',
            title: 'Tendência de Vendas por Categoria (Sobreposto)',
            config: {
                sourceDataKey: 'detailedData',
                chartType: 'Area',
                stackType: 'none', // Overlapping
                category: { dataKey: 'mes', label: 'Mês' },
                value: { dataKey: 'vendas', aggregation: 'SUM', label: 'Vendas (BRL)' },
                legend: { dataKey: 'categoria' }
            } as DynamicChartConfig
        },
        {
            id: 'stacked-area-vendas-regiao',
            component: 'AreaChart',
            gridClass: 'col-span-1 lg:col-span-6',
            title: 'Composição de Vendas por Região (Empilhado)',
            config: {
                sourceDataKey: 'detailedData',
                chartType: 'Area',
                stackType: 'stacked', 
                category: { dataKey: 'mes', label: 'Mês' },
                value: { dataKey: 'vendas', aggregation: 'SUM', label: 'Vendas (BRL)' },
                legend: { dataKey: 'regiao' }
            } as DynamicChartConfig
        },
        {
            id: 'scatter-vendas-lucro',
            component: 'ScatterChart',
            gridClass: 'col-span-1 lg:col-span-6',
            title: 'Análise de Vendas vs. Lucro por Região',
            config: {
                sourceDataKey: 'detailedData',
                chartType: 'Scatter',
                category: { dataKey: 'id', label: 'Venda ID' },
                x: { dataKey: 'vendas', label: 'Vendas (BRL)', aggregation: 'NONE' },
                y: { dataKey: 'lucro', label: 'Lucro (BRL)', aggregation: 'NONE' },
                size: { dataKey: 'clientes', label: 'Clientes', aggregation: 'NONE' },
                legend: { dataKey: 'regiao', label: 'Região' },
                playAxis: { dataKey: 'mes', label: 'Mês' }
            } as DynamicChartConfig
        },
        {
            id: 'heatmap-lucro-mes-regiao',
            component: 'HeatmapChart',
            gridClass: 'col-span-1 lg:col-span-6',
            title: 'Mapa de Calor de Lucro (Região x Mês)',
            config: {
                sourceDataKey: 'detailedData',
                x: { dataKey: 'mes', label: 'Mês' },
                y: { dataKey: 'regiao', label: 'Região' },
                value: { dataKey: 'lucro', aggregation: 'SUM', label: 'Lucro Total' },
            } as HeatmapConfig
        },
        {
            id: 'matrix-vendas-regiao-categoria',
            component: 'Matrix',
            gridClass: 'col-span-1 lg:col-span-12',
            title: 'Matriz de Vendas por Região e Categoria',
            config: {
                sourceDataKey: 'detailedData',
                rows: [
                    { dataKey: 'regiao', label: 'Região' },
                    { dataKey: 'categoria', label: 'Categoria' }
                ],
                columns: [{ dataKey: 'mes', label: 'Mês' }],
                values: [{ dataKey: 'vendas', aggregation: 'SUM', label: 'Total Vendas' }],
                rowSubtotals: true,
                columnSubtotals: true,
            } as MatrixConfig
        },
        {
            id: 'datatable-detalhes',
            component: 'DataTable',
            gridClass: 'col-span-1 lg:col-span-12',
            title: 'Dados Detalhados da Venda',
            config: {
                dataKey: 'detailedData',
                columns: salesColumns
            }
        }
    ]
}