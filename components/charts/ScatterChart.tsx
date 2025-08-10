
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
    ScatterChart as RechartsScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label,
    Line
} from 'recharts';
import { DynamicChartConfig } from '../../types.ts';
import useEditable from '../../hooks/useEditable.ts';
import PlayIcon from '../icons/PlayIcon.tsx';
import PauseIcon from '../icons/PauseIcon.tsx';

const lineColors = ['#00A3E0', '#D9262E', '#64B5F6', '#FFCA28', '#4CAF50', '#FF7043', '#2196F3', '#005A9C'];

interface ScatterChartProps {
    data: any[];
    title: string;
    config: DynamicChartConfig;
    showTrendline?: boolean;
    onDataChange?: (newData: any[]) => void;
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

const ScatterChart: React.FC<ScatterChartProps> = ({ data, title, config, showTrendline = false, onDataChange }) => {
    const { x, y, size, legend, playAxis, category } = config;
    const { isEditing, startEdit, stopEdit, showTrendline: trendlineVisible, toggleTrendline } = useEditable(false, showTrendline);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const [chartData, setChartData] = useState(data);
    useEffect(() => setChartData(data), [data]);
    const chartDataWithIndex = useMemo(() => chartData.map((d, i) => ({ ...d, __index: i })), [chartData]);

    const playAxisValues = useMemo(() => {
        if (!playAxis?.dataKey || !chartData) return [];
        const uniqueValues = [...new Set(chartData.map(item => item[playAxis.dataKey]))];
        // Assuming a chronological sort for months, etc. Can be improved with date objects if needed.
        return uniqueValues.sort();
    }, [chartData, playAxis]);

    const currentPlayAxisValue = playAxis ? playAxisValues[currentIndex] : null;

    const filteredData = useMemo(() => {
        if (!playAxis || !currentPlayAxisValue) return chartDataWithIndex;
        return chartDataWithIndex.filter(d => d[playAxis.dataKey] === currentPlayAxisValue);
    }, [chartDataWithIndex, playAxis, currentPlayAxisValue]);

    const trendLineData = useMemo(() => {
        if (!trendlineVisible || !x?.dataKey || !y?.dataKey || filteredData.length < 2) return [];
        const n = filteredData.length;
        const sumX = filteredData.reduce((acc, cur) => acc + cur[x.dataKey], 0);
        const sumY = filteredData.reduce((acc, cur) => acc + cur[y.dataKey], 0);
        const sumXY = filteredData.reduce((acc, cur) => acc + cur[x.dataKey] * cur[y.dataKey], 0);
        const sumXX = filteredData.reduce((acc, cur) => acc + cur[x.dataKey] * cur[x.dataKey], 0);
        const denominator = n * sumXX - sumX * sumX;
        if (denominator === 0) return [];
        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;
        const xValues = filteredData.map(d => d[x.dataKey]);
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        return [
            { [x.dataKey]: minX, trend: slope * minX + intercept },
            { [x.dataKey]: maxX, trend: slope * maxX + intercept }
        ];
    }, [trendlineVisible, filteredData, x?.dataKey, y?.dataKey]);

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

    const snap = (val: number) => Math.round(val / 10) * 10;
    const [dragInfo, setDragInfo] = useState<{
        index: number;
        startX: number;
        startY: number;
        origX: number;
        origY: number;
    } | null>(null);

    const startDrag = (index: number, event: React.MouseEvent<SVGCircleElement, MouseEvent>) => {
        const payload = chartData[index];
        setDragInfo({
            index,
            startX: event.clientX,
            startY: event.clientY,
            origX: payload[x.dataKey],
            origY: payload[y.dataKey]
        });
        event.preventDefault();
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!dragInfo) return;
        const dx = event.clientX - dragInfo.startX;
        const dy = event.clientY - dragInfo.startY;
        const newX = snap(dragInfo.origX + dx);
        const newY = snap(dragInfo.origY + dy);
        setChartData(prev => {
            const updated = [...prev];
            updated[dragInfo.index] = {
                ...updated[dragInfo.index],
                [x.dataKey]: newX,
                [y.dataKey]: newY
            };
            onDataChange && onDataChange(updated);
            return updated;
        });
    };

    const endDrag = () => setDragInfo(null);

    useEffect(() => {
        if (dragInfo) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', endDrag);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', endDrag);
        };
    }, [dragInfo]);

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

    const renderPoint = (props: any) => {
        const { cx, cy, payload, fill } = props;
        return (
            <circle
                cx={cx}
                cy={cy}
                r={5}
                fill={fill}
                onMouseDown={(e) => startDrag(payload.__index, e)}
                data-testid={`point-${payload.__index}`}
            />
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-full min-h-[28rem] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{title}</h3>
            {isEditing ? (
                <div className="flex justify-end gap-2 mb-2">
                    <button data-testid="toggle-trendline" onClick={toggleTrendline} className="px-2 py-1 border rounded">
                        {trendlineVisible ? 'Hide Trendline' : 'Show Trendline'}
                    </button>
                    <button data-testid="edit-toggle" onClick={stopEdit} className="px-2 py-1 border rounded">Done</button>
                </div>
            ) : (
                <div className="flex justify-end mb-2">
                    <button data-testid="edit-toggle" onClick={startEdit} className="px-2 py-1 border rounded">Edit</button>
                </div>
            )}
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

                        {trendlineVisible && trendLineData.length > 0 && (
                            <g data-testid="trendline">
                                <Line type="linear" dataKey="trend" data={trendLineData} stroke="#8884d8" dot={false} />
                            </g>
                        )}

                        {series.map((s, index) => (
                            <Scatter
                                key={s.name}
                                name={s.name}
                                data={s.data}
                                fill={lineColors[index % lineColors.length]}
                                shape={renderPoint}
                            />
                        ))}
                    </RechartsScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ScatterChart;
