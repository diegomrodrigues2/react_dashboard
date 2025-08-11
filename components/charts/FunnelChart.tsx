import React, { useMemo } from 'react';
import { FunnelChart as RechartsFunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

interface FunnelChartProps<T extends Record<string, number | string>> {
    data: T[];
    title: string;
    config: DynamicChartConfig<T>;
    /** Optional color palette to color each funnel level */
    colorPalette?: string[];
    /** Chart orientation (defaults to vertical). If omitted, uses config.layout when provided. */
    orientation?: 'horizontal' | 'vertical';
}

const formatValue = (value: number) => value.toLocaleString('pt-BR');

const defaultFunnelColors = ['#2864DC', '#2EA44F', '#FF9800', '#D32F2F', '#8E24AA', '#00A3E0', '#5C6BC0', '#26A69A'];

function getContrastingTextColor(hexColor: string): string {
    // Fallback for unexpected values
    if (!hexColor || typeof hexColor !== 'string') return '#000';
    const hex = hexColor.replace('#', '');
    if (hex.length !== 6) return '#000';
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Perceived brightness (WCAG)
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.55 ? '#000' : '#fff';
}

const CustomTooltip = ({ active, payload, data, orientation = 'vertical' }: { active?: boolean; payload?: any[]; data: any[]; orientation?: 'horizontal' | 'vertical' }) => {
    if (active && payload && payload.length) {
        const currentPayload = payload[0].payload;
        const { name, value } = currentPayload;
        const currentIndex = data.findIndex((item) => item.name === name);

        let conversionRate: number | null = null;
        if (currentIndex > 0) {
            const prevValue = data[currentIndex - 1].value;
            conversionRate = prevValue > 0 ? (value / prevValue) * 100 : 0;
        }
        const topValue = data[0]?.value ?? 0;
        const pctOfTop = topValue > 0 ? (value / topValue) * 100 : 0;

        return (
            <div
                className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm"
                style={orientation === 'horizontal' ? { transform: 'rotate(-90deg)' } : undefined}
            >
                <p className="font-semibold text-gray-700 mb-2">{name}</p>
                <p className="text-sm text-blue-600">Valor: {formatValue(value)}</p>
                {conversionRate !== null && (
                    <p className="text-sm text-green-600 mt-1">{`Conversão: ${conversionRate.toFixed(1)}% do estágio anterior`}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">{`% do topo: ${pctOfTop.toFixed(2)}%`}</p>
            </div>
        );
    }
    return null;
};

const FunnelChart = <T extends Record<string, number | string>>({ data, title, config, colorPalette, orientation }: FunnelChartProps<T>) => {
    const { category, value } = config;
    const resolvedOrientation: 'horizontal' | 'vertical' = (orientation ?? (config.layout as any) ?? 'vertical');
    const isHorizontal = resolvedOrientation === 'horizontal';

    const paletteFromConfig = (config as any)?.palette as string[] | undefined;
    const paletteToUse = colorPalette ?? paletteFromConfig ?? defaultFunnelColors;

    const stages = useMemo(() => data.map((item, index) => ({
        name: category ? String(item[category.dataKey as keyof T]) : '',
        value: value ? Number(item[value.dataKey as keyof T]) : 0,
        id: index.toString(),
        fill: paletteToUse[index % paletteToUse.length]
    })), [data, category, value, paletteToUse]);

    const renderCenterLabel = (props: any) => {
        const { index, viewBox, x, y } = props as {
            index: number;
            x?: number; y?: number;
            viewBox?: { x: number; y: number; width: number; height: number };
        };
        const stage = stages[index];
        if (!stage) return null;
        const shortVal = stage.value.toLocaleString('pt-BR');
        const centerX = viewBox ? viewBox.x + viewBox.width / 2 : (x ?? 0);
        const centerY = viewBox ? viewBox.y + viewBox.height / 2 : (y ?? 0);
        const textFill = getContrastingTextColor(stage.fill);
        const outlineColor = textFill === '#fff' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.75)';
        return (
            <g pointerEvents="none" transform={isHorizontal ? `rotate(-90 ${centerX} ${centerY})` : undefined}>
                <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={textFill}
                    fontSize={12}
                    fontWeight={700}
                    stroke={outlineColor}
                    strokeWidth={2}
                    style={{ paintOrder: 'stroke' }}
                >
                    <tspan x={centerX} dy={-2}>{stage.name}</tspan>
                    <tspan x={centerX} dy={16}>{shortVal}</tspan>
                </text>
            </g>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsFunnelChart>
                        <Tooltip content={<CustomTooltip data={stages} orientation={resolvedOrientation} />} />
                        <Funnel dataKey="value" nameKey="name" data={stages} isAnimationActive>
                            <LabelList content={renderCenterLabel} />
                        </Funnel>
                    </RechartsFunnelChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FunnelChart;

