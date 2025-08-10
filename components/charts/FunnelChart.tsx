import React from 'react';
import {
    FunnelChart as RechartsFunnelChart,
    Funnel,
    Tooltip,
    LabelList,
    ResponsiveContainer,
} from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

interface FunnelChartProps {
    data: any[];
    title: string;
    config: DynamicChartConfig;
}

const formatValue = (value: number) => value.toLocaleString('pt-BR');

export const calculateConversionRates = (
    data: { name: string; value: number }[],
) => {
    return data.map((item, index) => {
        const prev = data[index - 1]?.value;
        const rate =
            index > 0 && typeof prev === 'number' && prev > 0
                ? (item.value / prev) * 100
                : null;
        return { ...item, conversionRate: rate };
    });
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
        const { name, value, conversionRate } = payload[0].payload;
        return (
            <div className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="font-semibold text-gray-700 mb-2">{name}</p>
                <p className="text-sm text-blue-600">Valor: {formatValue(value)}</p>
                {conversionRate !== null && (
                    <p className="text-sm text-green-600 mt-1">
                        Conversão: {conversionRate.toFixed(1)}% do estágio anterior
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const FunnelChart: React.FC<FunnelChartProps> = ({ data, title, config }) => {
    const { category, value } = config;

    const chartData = calculateConversionRates(
        data
            .map((item) => ({
                // @ts-ignore
                name: item[category?.dataKey],
                // @ts-ignore
                value: Number(item[value?.dataKey]),
                // @ts-ignore
                fill: '#00A3E0', // Default color, can be customized
            }))
            .filter((item) => Number.isFinite(item.value))
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsFunnelChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Funnel dataKey="value" data={chartData} isAnimationActive>
                            <LabelList
                                position="center"
                                fill="#fff"
                                stroke="none"
                                dataKey="name"
                                className="text-xs font-semibold"
                            />
                        </Funnel>
                    </RechartsFunnelChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FunnelChart;

