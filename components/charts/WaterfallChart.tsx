
import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell, LabelList
} from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

interface WaterfallChartDataPoint {
    category: string;
    value: number;
    subtotal?: boolean;
}

interface WaterfallChartProps {
    data: WaterfallChartDataPoint[];
    title: string;
    config: DynamicChartConfig;
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

const processData = (data: WaterfallChartDataPoint[]) => {
    let cumulative = 0;
    const processed: {
        category: string;
        value: number;
        range: [number, number];
        type: 'increase' | 'decrease' | 'subtotal' | 'total';
        label?: string;
    }[] = [];

    data.forEach(item => {
        const start = cumulative;
        cumulative += item.value;
        processed.push({
            category: item.category,
            value: item.value,
            range: [start, cumulative],
            type: item.value >= 0 ? 'increase' : 'decrease'
        });

        if (item.subtotal) {
            processed.push({
                category: 'Subtotal',
                value: cumulative,
                range: [0, cumulative],
                type: 'subtotal',
                label: 'Subtotal'
            });
        }
    });

    processed.push({
        category: 'Total Final',
        value: cumulative,
        range: [0, cumulative],
        type: 'total'
    });

    return processed;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="font-semibold text-gray-700 mb-1">{label}</p>
                <div className="text-sm" style={{ color: data.type === 'increase' ? '#4CAF50' : data.type === 'decrease' ? '#D9262E' : data.type === 'subtotal' ? '#FF9800' : '#00A3E0' }}>
                    {data.type === 'total' ? 'Total: ' : data.type === 'subtotal' ? 'Subtotal: ' : 'Variação: '}
                    {currencyFormatter(data.value)}
                </div>
            </div>
        );
    }
    return null;
};

const WaterfallChart: React.FC<WaterfallChartProps> = ({ data, title, config }) => {
    const processedData = useMemo(() => processData(data), [data]);

    const { value: valueConfig } = config;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={processedData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="category" stroke="#6B7280" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#6B7280" tickFormatter={currencyFormatter} tick={{ fontSize: 12 }}>
                            <Label value={valueConfig?.label} angle={-90} offset={-5} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#6B7280" fontSize={14} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }} />
                        <Bar dataKey="range" radius={[2, 2, 0, 0]}>
                            {processedData.map((entry, index) => {
                                let color = '#000';
                                if (entry.type === 'increase') color = '#4CAF50';
                                else if (entry.type === 'decrease') color = '#D9262E';
                                else if (entry.type === 'total') color = '#00A3E0';
                                else if (entry.type === 'subtotal') color = '#FF9800';
                                return <Cell key={`cell-${index}`} fill={color} />;
                            })}
                            <LabelList dataKey="label" position="top" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WaterfallChart;
