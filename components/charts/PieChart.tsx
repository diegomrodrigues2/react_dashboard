
import React, { useState } from 'react';
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Sector,
} from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

interface PieSlice {
    id: string;
    name: string;
    value: number;
    color: string;
    showLabel: boolean;
}

interface PieChartProps {
    data: { name: string; value: number }[];
    title: string;
    config: DynamicChartConfig;
    showLabels?: boolean;
}

const COLORS = [
    '#00A3E0',
    '#005A9C',
    '#64B5F6',
    '#2196F3',
    '#FFCA28',
    '#FF7043',
    '#4CAF50',
    '#F44336',
];

const RADIAN = Math.PI / 180;

const renderActiveShape = ({
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
}: any) => (
    <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
    />
);

const PieChart: React.FC<PieChartProps> = ({ data, title, config, showLabels = false }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [slices, setSlices] = useState<PieSlice[]>(
        data.map((d, index) => ({
            id: `${index}-${d.name}`,
            ...d,
            color: COLORS[index % COLORS.length],
            showLabel: true,
        }))
    );

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    const handleColorChange = (i: number, color: string) => {
        setSlices((prev) => {
            const next = [...prev];
            next[i].color = color;
            return next;
        });
    };

    const handleToggleLabel = (i: number) => {
        setSlices((prev) => {
            const next = [...prev];
            next[i].showLabel = !next[i].showLabel;
            return next;
        });
    };

    const moveSlice = (from: number, to: number) => {
        setSlices((prev) => {
            const copy = [...prev];
            const [removed] = copy.splice(from, 1);
            copy.splice(to, 0, removed);
            return copy;
        });
    };

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDrop = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        const from = Number(e.dataTransfer.getData('text/plain'));
        if (!Number.isNaN(from) && from !== index) {
            moveSlice(from, index);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, index: number) => {
        if (e.key === 'ArrowUp' && index > 0) {
            e.preventDefault();
            moveSlice(index, index - 1);
        } else if (e.key === 'ArrowDown' && index < slices.length - 1) {
            e.preventDefault();
            moveSlice(index, index + 1);
        }
    };

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index,
    }: any) => {
        if (!slices[index].showLabel || percent < 0.05) return null;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-semibold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col" style={{ height: '24rem' }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="flex-grow flex">
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                            <Pie
                                data={slices}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={'60%'}
                                outerRadius={'80%'}
                                fill="#8884d8"
                                paddingAngle={2}
                                labelLine={false}
                                label={showLabels ? renderCustomizedLabel : undefined}
                                activeIndex={activeIndex ?? undefined}
                                activeShape={renderActiveShape}
                                onMouseEnter={onPieEnter}
                                onMouseLeave={onPieLeave}
                            >
                                {slices.map((entry, index) => (
                                    <Cell
                                        key={entry.id}
                                        fill={entry.color}
                                        stroke={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [
                                    `${(value as number).toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                    })}`,
                                    name,
                                ]}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </div>
                <ul aria-label="slice controls" className="ml-4 w-48">
                    {slices.map((slice, index) => (
                        <li
                            key={slice.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, index)}
                            tabIndex={0}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="flex items-center gap-2 mb-2"
                        >
                            <span className="flex-1">{slice.name}</span>
                            <input
                                aria-label="color"
                                type="color"
                                value={slice.color}
                                onChange={(e) => handleColorChange(index, e.target.value)}
                            />
                            <input
                                aria-label="toggle label"
                                type="checkbox"
                                checked={slice.showLabel}
                                onChange={() => handleToggleLabel(index)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PieChart;
