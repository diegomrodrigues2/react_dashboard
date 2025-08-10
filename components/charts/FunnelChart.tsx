import React, { useState } from 'react';
import { FunnelChart as RechartsFunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

interface FunnelChartProps<T extends Record<string, number | string>> {
    data: T[];
    title: string;
    config: DynamicChartConfig<T>;
}

const formatValue = (value: number) => value.toLocaleString('pt-BR');

const CustomTooltip = ({ active, payload, data }: { active?: boolean; payload?: any[]; data: any[] }) => {
    if (active && payload && payload.length) {
        const currentPayload = payload[0].payload;
        const { name, value } = currentPayload;
        const currentIndex = data.findIndex((item) => item.name === name);

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
                    <p className="text-sm text-green-600 mt-1">Conversão: {conversionRate.toFixed(1)}% do estágio anterior</p>
                )}
            </div>
        );
    }
    return null;
};

const FunnelChart = <T extends Record<string, number | string>>({ data, title, config }: FunnelChartProps<T>) => {
    const { category, value } = config;

    const initialData = data.map((item, index) => ({
        name: category ? String(item[category.dataKey as keyof T]) : '',
        value: value ? Number(item[value.dataKey as keyof T]) : 0,
        id: index.toString(),
        fill: '#00A3E0'
    }));

    const [stages, setStages] = useState(initialData);
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => () => {
        setDragIndex(index);
    };

    const handleDragOver = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (index: number) => () => {
        if (dragIndex === null) return;
        setStages((prev) => {
            const updated = [...prev];
            const [removed] = updated.splice(dragIndex, 1);
            updated.splice(index, 0, removed);
            return updated;
        });
        setDragIndex(null);
    };

    const handleNameChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setStages((prev) => prev.map((stage, i) => (i === index ? { ...stage, name: newName } : stage)));
    };

    const handleValueChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        setStages((prev) =>
            prev.map((stage, i) => (i === index ? { ...stage, value: isNaN(newValue) ? 0 : newValue } : stage))
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="mb-4 space-y-2">
                {stages.map((stage, index) => (
                    <div
                        key={stage.id}
                        data-testid="stage-item"
                        draggable
                        onDragStart={handleDragStart(index)}
                        onDragOver={handleDragOver(index)}
                        onDrop={handleDrop(index)}
                        className="flex items-center space-x-2"
                    >
                        <input
                            data-testid="stage-name"
                            value={stage.name}
                            onChange={handleNameChange(index)}
                            className="border p-1 rounded flex-1"
                        />
                        <input
                            data-testid="stage-value"
                            type="number"
                            value={stage.value}
                            onChange={handleValueChange(index)}
                            className="border p-1 rounded w-24"
                        />
                    </div>
                ))}
            </div>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsFunnelChart>
                        <Tooltip content={<CustomTooltip data={stages} />} />
                        <Funnel dataKey="value" data={stages} isAnimationActive>
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

