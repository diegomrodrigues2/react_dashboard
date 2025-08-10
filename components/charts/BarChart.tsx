import React, { useMemo } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

const barColors = ['#00A3E0', '#005A9C', '#64B5F6', '#2196F3', '#FFCA28', '#FF7043', '#4CAF50', '#F44336'];

interface BarChartProps {
    data: any[];
    title: string;
    config: DynamicChartConfig;
    colors?: string[];
}

const CustomTooltip = ({ active, payload, label, is100Percent }: any) => {
    if (active && payload && payload.length) {
        const total = is100Percent ? 1 : payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
        return (
            <div className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="font-semibold text-gray-700 mb-2">{label}</p>
                {payload.map((pld: any, index: number) => (
                    <div key={index} style={{ color: pld.fill }} className="text-sm">
                        {`${pld.name}: ${is100Percent 
                            ? (pld.value * 100).toFixed(2) + '%' 
                            : (pld.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                    </div>
                ))}
                {payload.length > 1 && !is100Percent && (
                     <div className="pt-2 mt-2 border-t border-gray-200 font-bold text-gray-800 text-sm">
                        {`Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const BarChart: React.FC<BarChartProps> = ({ data, title, config, colors }) => {
    const {
        category,
        value,
        legend,
        layout = 'horizontal',
        stackType = 'none',
    } = config;

    const barDataKeys = useMemo(() => {
        if (!legend) {
            return [{ key: value.dataKey, name: value.label || value.dataKey }];
        }
        if (!data || data.length === 0) return [];
        const firstRow = data[0];
        return Object.keys(firstRow)
            .filter(key => key !== category.dataKey)
            .map(key => ({ key, name: key }));
    }, [data, legend, category.dataKey, value.dataKey, value.label]);


    const isStacked = stackType === 'stacked' || stackType === '100%stacked';
    const is100Percent = stackType === '100%stacked';
    const isVertical = layout === 'vertical';

    const percentFormatter = (tick: number) => `${(tick * 100).toFixed(0)}%`;
    const currencyFormatter = (val: any) => {
        if (typeof val !== 'number') return val;
        return val.toLocaleString('pt-BR', {
            notation: 'compact',
            compactDisplay: 'short',
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        });
    };
    
    const barRadius: [number, number, number, number] = isStacked ? [0, 0, 0, 0] : (isVertical ? [4, 4, 0, 0] : [0, 4, 4, 0]);

    const chartColors = colors ?? barColors;

    const xAxisProps = isVertical
        ? { // Vertical layout: X-axis is the category axis.
            type: 'category' as const,
            dataKey: category.dataKey,
            stroke: "#6B7280",
            tick: { fontSize: 12 },
            dy: 10,
        }
        : { // Horizontal layout: X-axis is the value axis.
            type: 'number' as const,
            stroke: "#6B7280",
            tick: { fontSize: 12 },
            dy: 5,
            tickFormatter: is100Percent ? percentFormatter : currencyFormatter,
            domain: is100Percent ? [0, 1] : undefined,
        };

    const yAxisProps = isVertical
        ? { // Vertical layout: Y-axis is the value axis.
            type: 'number' as const,
            stroke: "#6B7280",
            tick: { fontSize: 12 },
            width: 80,
            tickFormatter: is100Percent ? percentFormatter : currencyFormatter,
            domain: is100Percent ? [0, 1] : undefined,
        }
        : { // Horizontal layout: Y-axis is the category axis.
            type: 'category' as const,
            dataKey: category.dataKey,
            stroke: "#6B7280",
            tick: { fontSize: 12 },
            width: 100,
            dx: -5,
            interval: 0,
        };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                        data={data}
                        layout={layout}
                        stackOffset={is100Percent ? 'expand' : undefined}
                        margin={{ top: 10, right: 30, left: 40, bottom: 40 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={!isVertical} horizontal={isVertical} />
                        
                        <XAxis {...xAxisProps}>
                            <Label value={isVertical ? category.label : value.label} angle={0} offset={-35} position="insideBottom" style={{ textAnchor: 'middle' }} fill="#6B7280" fontSize={14} />
                        </XAxis>
                        <YAxis {...yAxisProps}>
                             <Label value={isVertical ? value.label : category.label} angle={-90} offset={isVertical ? -25 : -80} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#6B7280" fontSize={14} />
                        </YAxis>

                        <Tooltip content={<CustomTooltip is100Percent={is100Percent} />} cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }} />
                        <Legend wrapperStyle={{fontSize: "12px", paddingTop: "20px"}} />

                        {barDataKeys.map((bar, index) => (
                            <Bar
                                key={index}
                                dataKey={bar.key}
                                name={bar.name}
                                fill={chartColors[index % chartColors.length]}
                                stackId={isStacked ? 'a' : undefined}
                                radius={barRadius}
                            />
                        ))}
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BarChart;