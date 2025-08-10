
import React, { useMemo } from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

const areaColors = ['#00A3E0', '#D9262E', '#64B5F6', '#FFCA28', '#4CAF50', '#FF7043', '#2196F3', '#005A9C'];

interface AreaChartProps {
  data: any[];
  title: string;
  config: DynamicChartConfig;
  gradientColors?: [string, string];
}

const currencyFormatter = (val: any) => {
    if (typeof val !== 'number') return val;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(val);
};

const CustomTooltip = ({ active, payload, label, config }: any) => {
    if (active && payload && payload.length) {
        const isStacked = config.stackType === 'stacked';
        const total = isStacked ? payload.reduce((sum: number, entry: any) => sum + entry.value, 0) : null;
        return (
            <div className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="font-semibold text-gray-700 mb-2">{label}</p>
                {payload.map((pld: any, index: number) => (
                    <div key={index} style={{ color: pld.stroke }} className="text-sm">
                        {`${pld.name}: ${currencyFormatter(pld.value)}`}
                    </div>
                ))}
                {isStacked && total !== null && (
                     <div className="pt-2 mt-2 border-t border-gray-200 font-bold text-gray-800 text-sm">
                        {`Total: ${currencyFormatter(total)}`}
                    </div>
                )}
            </div>
        );
    }
    return null;
};


const AreaChart: React.FC<AreaChartProps> = ({ data, title, config, gradientColors }) => {
  const { category, value, legend, stackType = 'none' } = config;

  const areaDataKeys = useMemo(() => {
    if (!legend && value) {
      return [{ key: value.dataKey, name: value.label || String(value.dataKey) }];
    }
    if (!legend || !category || !data || data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow)
      .filter(key => key !== category.dataKey)
      .map(key => ({ key, name: key }));
  }, [data, legend, category, value]);
  
  const isStacked = stackType === 'stacked' || stackType === '100%stacked';
  const is100Percent = stackType === '100%stacked';
  
  const percentFormatter = (tick: number) => `${(tick * 100).toFixed(0)}%`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart 
              data={data} 
              margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
              stackOffset={is100Percent ? 'expand' : undefined}
            >
              <defs>
                {gradientColors ? (
                  <linearGradient id="customGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={gradientColors[0]} stopOpacity={isStacked ? 0.8 : 0.6} />
                    <stop offset="95%" stopColor={gradientColors[1] ?? gradientColors[0]} stopOpacity={isStacked ? 0.2 : 0} />
                  </linearGradient>
                ) : (
                  areaDataKeys.map((area, index) => (
                    <linearGradient key={`color-${area.key}`} id={`color-${area.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={areaColors[index % areaColors.length]} stopOpacity={isStacked ? 0.8 : 0.6} />
                      <stop offset="95%" stopColor={areaColors[index % areaColors.length]} stopOpacity={isStacked ? 0.2 : 0} />
                    </linearGradient>
                  ))
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={category?.dataKey} stroke="#6B7280" tick={{ fontSize: 12 }}>
                 <Label value={category?.label} offset={-15} position="insideBottom" fill="#6B7280" fontSize={14} />
              </XAxis>
              <YAxis 
                stroke="#6B7280" 
                tickFormatter={is100Percent ? percentFormatter : currencyFormatter} 
                tick={{ fontSize: 12 }}
                domain={is100Percent ? [0, 1] : undefined}
              >
                <Label value={value?.label} angle={-90} offset={-5} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#6B7280" fontSize={14} />
              </YAxis>
              <Tooltip
                  content={<CustomTooltip config={config} />}
                  contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                  }}
              />
              <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
              {areaDataKeys.map((area, index) => (
                  <Area
                      key={area.key}
                      type="monotone"
                      dataKey={area.key}
                      name={area.name}
                      stroke={areaColors[index % areaColors.length]}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={gradientColors ? 'url(#customGradient)' : `url(#color-${area.key})`}
                      stackId={isStacked ? '1' : undefined}
                  />
              ))}
            </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AreaChart;
