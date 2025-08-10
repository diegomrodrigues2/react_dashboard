import { SalesData, DashboardConfig } from '../types.ts';
import { DASHBOARD_CONFIG } from '../components/dashboardConfig.ts';

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

export const getSalesData = async (): Promise<SalesData[]> => Promise.resolve(rawSalesData);
export const getWaterfallData = async () => Promise.resolve(waterfallSourceData);
export const getFunnelData = async () => Promise.resolve(funnelSourceData);
export const getAllMonths = async () => Promise.resolve(allMonths);
export const getDashboardConfig = async (): Promise<DashboardConfig> => Promise.resolve(DASHBOARD_CONFIG);

