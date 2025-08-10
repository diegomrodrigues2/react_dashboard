
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
    ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label
} from 'recharts';
import { DynamicChartConfig } from '../../types.ts';
import PlayIcon from '../icons/PlayIcon.tsx';
import PauseIcon from '../icons/PauseIcon.tsx';

const lineColors = ['#00A3E0', '#D9262E', '#64B5F6', '#FFCA28', '#4CAF50', '#FF7043', '#2196F3', '#005A9C'];

interface ScatterChartProps {
    data: any[];
    title: string;
    config: DynamicChartConfig;
}

const CustomTooltip = ({ active, payload, config }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const { x, y, size, category, legend } = config;

        if (!data || !x || !y) return null;

        const formatValue = (val: any) => typeof val === 'number' ? val.toLocaleString('pt-BR') : val;

        return (
            <div className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm text-sm text-gray-800 w-64">
                {category?.dataKey && <p className="font-bold text-base mb-2 truncate">{`${category.label || 'Detalhe'}: ${data[category.dataKey]}`}</p>}
                {legend?.dataKey && <p className="mb-1"><span className="font-semibold">{legend.label || 'Legenda'}:</span> {data[legend.dataKey]}</p>}
                <p className="mb-1"><span className="font-semibold">{x.label || x.dataKey}:</span> {formatValue(data[x.dataKey])}</p>
                <p className="mb-1"><span className="font-semibold">{y.label || y.dataKey}:</span> {formatValue(data[y.dataKey])}</p>
                {size?.dataKey && <p><span className="font-semibold">{size.label || size.dataKey}:</span> {formatValue(data[size.dataKey])}</p>}
            </div>
        );
    }
    return null;
};

const ScatterChart: React.FC<ScatterChartProps> = ({ data, title, config }) => {
    const { x, y, size, legend, playAxis, category } = config;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const playAxisValues = useMemo(() => {
        if (!playAxis?.dataKey || !data) return [];
        const uniqueValues = [...new Set(data.map(item => item[playAxis.dataKey]))];
        // Assuming a chronological sort for months, etc. Can be improved with date objects if needed.
        return uniqueValues.sort();
    }, [data, playAxis]);

    const currentPlayAxisValue = playAxis ? playAxisValues[currentIndex] : null;

    const filteredData = useMemo(() => {
        if (!playAxis || !currentPlayAxisValue) return data;
        return data.filter(d => d[playAxis.dataKey] === currentPlayAxisValue);
    }, [data, playAxis, currentPlayAxisValue]);

    const series = useMemo(() => {
        if (!legend?.dataKey) {
            return [{ name: category?.label || 'Dados', data: filteredData }];
        }
        const grouped: { [key: string]: any[] } = {};
        filteredData.forEach(item => {
            const legendValue = item[legend.dataKey] as string;
            if (!grouped[legendValue]) grouped[legendValue] = [];
            grouped[legendValue].push(item);
        });
        return Object.entries(grouped).map(([name, data]) => ({ name, data }));
    }, [filteredData, legend, category]);

    const stopPlaying = useCallback(() => {
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);
    
    const startPlaying = useCallback(() => {
        setIsPlaying(true);
    }, []);

    useEffect(() => {
        if (isPlaying && playAxisValues.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex(prevIndex => {
                    const nextIndex = prevIndex + 1;
                    if (nextIndex >= playAxisValues.length) {
                        stopPlaying(); // Stop at the end
                        return prevIndex;
                    }
                    return nextIndex;
                });
            }, 1500);
        } else {
            stopPlaying();
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) };
    }, [isPlaying, playAxisValues.length, stopPlaying]);
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        stopPlaying();
        setCurrentIndex(Number(e.target.value));
    };

    if (!x?.dataKey || !y?.dataKey) {
        return <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex items-center justify-center text-red-500">Erro de Configuração: Eixos X e Y são obrigatórios.</div>;
    }

    const numberFormatter = (val: any) => {
        if (typeof val !== 'number') return val;
        return val.toLocaleString('pt-BR', { notation: 'compact', compactDisplay: 'short' });
    };

    const bubbleSizeRange: [number, number] = [20, 500]; // min/max bubble size in pixels area

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-[32rem] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{title}</h3>
            {playAxis && (
                <div className="flex items-center justify-center gap-4 mb-4 p-2 bg-gray-50 rounded-lg">
                    <button onClick={() => isPlaying ? stopPlaying() : startPlaying()} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        {isPlaying ? <PauseIcon title="Pausar" className="w-6 h-6 text-gray-700" /> : <PlayIcon title="Reproduzir" className="w-6 h-6 text-gray-700" />}
                    </button>
                    <label htmlFor="play-axis-slider" className="text-sm font-medium text-gray-600 whitespace-nowrap">{playAxis.label}: <span className="font-bold text-gray-800">{currentPlayAxisValue}</span></label>
                    <input
                        id="play-axis-slider"
                        type="range"
                        min="0"
                        max={playAxisValues.length > 0 ? playAxisValues.length - 1 : 0}
                        value={currentIndex}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        disabled={playAxisValues.length === 0}
                    />
                </div>
            )}
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey={x.dataKey} name={x.label} tickFormatter={numberFormatter} stroke="#6B7280" tick={{ fontSize: 12 }}>
                            <Label value={x.label} offset={-25} position="insideBottom" fill="#6B7280" fontSize={14} />
                        </XAxis>
                        <YAxis type="number" dataKey={y.dataKey} name={y.label} tickFormatter={numberFormatter} stroke="#6B7280" tick={{ fontSize: 12 }}>
                            <Label value={y.label} angle={-90} offset={-25} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#6B7280" fontSize={14} />
                        </YAxis>
                        {size?.dataKey && <ZAxis type="number" dataKey={size.dataKey} name={size.label} range={bubbleSizeRange} />}
                        <Tooltip content={<CustomTooltip config={config} />} cursor={{ strokeDasharray: '3 3' }} />
                        <Legend wrapperStyle={{fontSize: "12px", paddingTop: "40px"}} />

                        {series.map((s, index) => (
                            <Scatter key={s.name} name={s.name} data={s.data} fill={lineColors[index % lineColors.length]} shape="circle" />
                        ))}
                    </RechartsScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ScatterChart;