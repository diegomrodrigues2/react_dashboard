
import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

interface PieChartProps {
    data: { name: string; value: number }[];
    title: string;
    config: DynamicChartConfig;
}

const COLORS = ['#00A3E0', '#005A9C', '#64B5F6', '#2196F3', '#FFCA28', '#FF7043', '#4CAF50', '#F44336'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't render label for small slices

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const PieChart: React.FC<PieChartProps> = ({
    data,
    title,
    config
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={'60%'}
                            outerRadius={'80%'}
                            fill="#8884d8"
                            paddingAngle={2}
                            labelLine={false}
                            label={renderCustomizedLabel}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${(value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, name]}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #E5E7EB',
                            borderRadius: '0.5rem',
                          }}
                        />
                        <Legend wrapperStyle={{fontSize: "12px"}} />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PieChart;
