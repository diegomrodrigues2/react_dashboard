
import React from 'react';
import { FunnelChart as RechartsFunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

interface FunnelChartProps {
    data: { name: string; value: number }[];
    title: string;
    config: DynamicChartConfig;
    onStageClick?: (stageId: string) => void;
    colors?: Record<string, string>;
}

const formatValue = (value: number) => value.toLocaleString('pt-BR');

const CustomTooltip = ({ active, payload, data }: { active?: boolean, payload?: any[], data: any[] }) => {
    if (active && payload && payload.length) {
        const currentPayload = payload[0].payload;
        const { name, value } = currentPayload;
        const currentIndex = data.findIndex(item => item.name === name);

        let conversionRate: number | null = null;
        if (currentIndex > 0) {
            const prevValue = data[currentIndex - 1].value;
            conversionRate = prevValue > 0 ? (value / prevValue) * 100 : 0;
        }

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

const FunnelChart: React.FC<FunnelChartProps> = ({ data, title, config, onStageClick, colors }) => {
    const { category, value } = config;

    const chartData = data.map(item => {
        // @ts-ignore
        const stageName = item[category?.dataKey];
        // @ts-ignore
        const stageValue = item[value?.dataKey];

        return {
            name: stageName,
            value: stageValue,
            fill: colors?.[stageName] ?? '#00A3E0'
        };
    });

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsFunnelChart>
                        <Tooltip content={<CustomTooltip data={chartData} />} />
                        <Funnel
                            dataKey="value"
                            data={chartData}
                            isAnimationActive
                            onClick={(_, index) => onStageClick?.(chartData[index].name)}
                            cursor={onStageClick ? 'pointer' : undefined}
                        >
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
