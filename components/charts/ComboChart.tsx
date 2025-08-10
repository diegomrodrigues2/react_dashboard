
import React from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label
} from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

interface ComboChartProps {
    data: any[];
    title: string;
    config: DynamicChartConfig;
    xLabel?: string;
    yLabel?: string;
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

const CustomTooltip = ({ active, payload, label, barLabel, lineLabel }: any) => {
    if (active && payload && payload.length) {
        const barData = payload.find((p: any) => p.dataKey === 'vendas');
        const lineData = payload.find((p: any) => p.dataKey === 'lucro');
        return (
            <div className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="font-semibold text-gray-700 mb-2">{label}</p>
                {barData && <div style={{ color: barData.fill }} className="text-sm">{`${barLabel}: ${currencyFormatter(barData.value)}`}</div>}
                {lineData && <div style={{ color: lineData.stroke }} className="text-sm">{`${lineLabel}: ${currencyFormatter(lineData.value)}`}</div>}
            </div>
        );
    }
    return null;
};

const ComboChart: React.FC<ComboChartProps> = ({ data, title, config, xLabel, yLabel }) => {
    const { category, value, lineValue } = config;

    const xAxisLabel = xLabel ?? category.label;
    const yAxisLabel = yLabel ?? value.label;

    if (!category?.dataKey || !value?.dataKey || !lineValue?.dataKey) {
        return <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex items-center justify-center text-red-500">Erro: Configuração de Categoria, Valor e Valor de Linha é obrigatória.</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 30, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey={category.dataKey} stroke="#6B7280" tick={{ fontSize: 12 }}>
                            <Label value={xAxisLabel} offset={-15} position="insideBottom" fill="#6B7280" fontSize={14} />
                        </XAxis>
                        <YAxis yAxisId="left" stroke="#00A3E0" tickFormatter={currencyFormatter} tick={{ fontSize: 12 }}>
                            <Label value={yAxisLabel} angle={-90} offset={-15} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#00A3E0" fontSize={14} />
                        </YAxis>
                        <YAxis yAxisId="right" orientation="right" stroke="#D9262E" tickFormatter={currencyFormatter} tick={{ fontSize: 12 }}>
                             <Label value={lineValue.label} angle={-90} offset={-15} position="insideRight" style={{ textAnchor: 'middle' }} fill="#D9262E" fontSize={14} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip barLabel={yAxisLabel} lineLabel={lineValue.label}/>} cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }} />
                        <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                        <Bar yAxisId="left" dataKey={value.dataKey} name={yAxisLabel} fill="#00A3E0" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey={lineValue.dataKey} name={lineValue.label} stroke="#D9262E" strokeWidth={2} activeDot={{ r: 8 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ComboChart;
