import { describe, it, expect } from 'vitest';
import { aggregate, processChartData } from '../dashboardData.ts';
import { SalesData, DynamicChartConfig } from '../../types.ts';

describe('aggregate', () => {
  const data: SalesData[] = [
    { id: '1', mes: 'Jan', regiao: 'Sul', categoria: 'A', vendas: 100, lucro: 50, clientes: 10, coordinates: [0,0] },
    { id: '2', mes: 'Fev', regiao: 'Sul', categoria: 'A', vendas: 200, lucro: 70, clientes: 20, coordinates: [0,0] },
  ];

  it('sums values', () => {
    expect(aggregate(data, 'vendas', 'SUM')).toBe(300);
  });

  it('averages values', () => {
    expect(aggregate(data, 'lucro', 'AVERAGE')).toBe(60);
  });

  it('counts items', () => {
    expect(aggregate(data, 'vendas', 'COUNT')).toBe(2);
  });
});

describe('processChartData', () => {
  const data: SalesData[] = [
    { id: '1', mes: 'Jan', regiao: 'Sul', categoria: 'A', vendas: 100, lucro: 50, clientes: 10, coordinates: [0,0] },
    { id: '2', mes: 'Jan', regiao: 'Sul', categoria: 'A', vendas: 200, lucro: 70, clientes: 20, coordinates: [0,0] },
    { id: '3', mes: 'Fev', regiao: 'Sul', categoria: 'A', vendas: 150, lucro: 60, clientes: 15, coordinates: [0,0] },
  ];

  const config: DynamicChartConfig = {
    chartType: 'Bar',
    category: { dataKey: 'mes' },
    value: { dataKey: 'vendas', aggregation: 'SUM' },
    legend: undefined,
    stackType: undefined,
    lineValue: undefined,
  };

  it('aggregates data for bar chart', () => {
    const result = processChartData(data, config);
    expect(result).toContainEqual({ mes: 'Jan', vendas: 300 });
    expect(result).toContainEqual({ mes: 'Fev', vendas: 150 });
  });
});
