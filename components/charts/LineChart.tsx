
import React, { useMemo } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { LineProps } from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

interface LineChartProps {
  data: any[];
  title: string;
  config: DynamicChartConfig;
  /**
   * Propriedades adicionais para personalizar cada `<Line>`.
   * Exemplos:
   * ```tsx
   * <LineChart lineProps={{ strokeWidth: 4, type: 'step', dot: false }} />
   * <LineChart lineProps={{ dot: { r: 6 }, strokeDasharray: '5 5' }} />
   * ```
   */
  lineProps?: Partial<LineProps>;
}

const lineColors = ['#00A3E0', '#D9262E', '#64B5F6', '#FFCA28'];


const LineChart: React.FC<LineChartProps> = ({ data, title, config, lineProps }) => {
  const { category, value, legend } = config;

  const lineDataKeys = useMemo(() => {
    if (!legend) {
      return [{ key: value.dataKey, name: value.label || value.dataKey }];
    }
    if (!data || data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow)
      .filter(key => key !== category.dataKey)
      .map(key => ({ key, name: key }));
  }, [data, legend, category.dataKey, value.dataKey, value.label]);


  const currencyFormatter = (val: any) => {
    if (typeof val !== 'number') return val;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(val);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={category.dataKey} stroke="#6B7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6B7280" tickFormatter={currencyFormatter} tick={{ fontSize: 12 }} />
            <Tooltip
                formatter={(val: number, name: string) => [currencyFormatter(val), name]}
                contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                }}
            />
            <Legend wrapperStyle={{fontSize: "12px"}}/>
            {lineDataKeys.map((line, index) => (
                <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    name={line.name}
                    stroke={lineColors[index % lineColors.length]}
                    strokeWidth={2}
                    activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                    dot={{r: 4, strokeWidth: 2}}
                    {...lineProps}
                />
            ))}
            </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;
