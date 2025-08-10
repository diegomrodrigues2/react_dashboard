import React, { useMemo, useState } from 'react';
import { SalesData, HeatmapConfig as HeatmapConfigType, AggregationType } from '../../types.ts';
import useEditable from '../../hooks/useEditable.ts';

interface HeatmapChartProps {
    data: SalesData[];
    title: string;
    config: HeatmapConfigType;
}

interface TooltipState {
    content: string;
    x: number;
    y: number;
}

const aggregate = (items: SalesData[], dataKey: keyof SalesData, type: AggregationType = 'SUM'): number => {
    if (items.length === 0) return 0;
    switch (type) {
        case 'SUM':
            return items.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);
        case 'COUNT':
            return items.length;
        case 'AVERAGE':
            const sum = items.reduce((s, item) => s + (Number(item[dataKey]) || 0), 0);
            return items.length > 0 ? sum / items.length : 0;
        default:
            return 0;
    }
};

const formatValue = (value: number, label: string) => {
    if (label.toLowerCase().includes('lucro') || label.toLowerCase().includes('vendas')) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' });
    }
    return value.toLocaleString('pt-BR');
};

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, title, config }) => {
    const { x: xConfig, y: yConfig, value: valConfig } = config;
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const { isEditing, startEdit, stopEdit } = useEditable(false);
    const [startColor, setStartColor] = useState('#C7E4F7');
    const [endColor, setEndColor] = useState('#005A9C');

    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

    const { gridData, xLabels, yLabels, valueRange } = useMemo(() => {
        if (!data || data.length === 0) return { gridData: new Map(), xLabels: [], yLabels: [], valueRange: [0, 0] };

        const xKey = xConfig.dataKey as keyof SalesData;
        const yKey = yConfig.dataKey as keyof SalesData;
        const valKey = valConfig.dataKey as keyof SalesData;
        const valAgg = valConfig.aggregation || 'SUM';

        const allX = Array.from(new Set(data.map(d => String(d[xKey] ?? ''))));
        // Special sort for months
        const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        if (allX.every(x => monthOrder.includes(x))) {
            allX.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
        } else {
            allX.sort();
        }

        const allY = Array.from(new Set(data.map(d => String(d[yKey] ?? '')))).sort();

        const gridData = new Map<string, number>();
        const values: number[] = [];

        allY.forEach(yVal => {
            allX.forEach(xVal => {
                const filteredItems = data.filter(d => String(d[yKey]) === yVal && String(d[xKey]) === xVal);
                const aggregatedValue = aggregate(filteredItems, valKey, valAgg);
                const gridKey = `${yVal}|${xVal}`;
                gridData.set(gridKey, aggregatedValue);

                if (filteredItems.length > 0) {
                    values.push(aggregatedValue);
                }
            });
        });

        let minVal = values.length ? Math.min(...values) : 0;
        let maxVal = values.length ? Math.max(...values) : 0;

        if (minVal === maxVal) {
            minVal = minVal >= 0 ? 0 : minVal - 1;
            maxVal = maxVal > 0 ? maxVal + 1 : 0;
        }

        return { gridData, xLabels: allX, yLabels: allY, valueRange: [minVal, maxVal] };
    }, [data, xConfig, yConfig, valConfig]);

    const parseHex = (hex: string) => {
        const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthand, (_m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
            : { r: 0, g: 0, b: 0 };
    };

    const getColor = (value: number) => {
        const [min, max] = valueRange;

        if (value === undefined || (min === 0 && max === 0 && value === 0)) return '#f0f0f0';

        const ratio = max === min ? 0.5 : (value - min) / (max - min);
        const start = parseHex(startColor);
        const end = parseHex(endColor);

        const r = Math.round(start.r + ratio * (end.r - start.r));
        const g = Math.round(start.g + ratio * (end.g - start.g));
        const b = Math.round(start.b + ratio * (end.b - start.b));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const legendStyle = useMemo(
        () => ({
            background: `linear-gradient(to right, ${getColor(valueRange[0])}, ${getColor(valueRange[1])})`
        }),
        [valueRange, startColor, endColor]
    );

    const updateSelection = (xIndex: number, yIndex: number) => {
        if (!dragStart) return;
        const x1 = Math.min(dragStart.x, xIndex);
        const x2 = Math.max(dragStart.x, xIndex);
        const y1 = Math.min(dragStart.y, yIndex);
        const y2 = Math.max(dragStart.y, yIndex);
        const newSet = new Set<string>();
        for (let yi = y1; yi <= y2; yi++) {
            for (let xi = x1; xi <= x2; xi++) {
                const xv = xLabels[xi];
                const yv = yLabels[yi];
                newSet.add(`${yv}|${xv}`);
            }
        }
        setSelectedCells(newSet);
    };

    const handleCellMouseEnter = (
        xVal: string,
        yVal: string,
        xIndex: number,
        yIndex: number,
        e: React.MouseEvent
    ) => {
        const value = gridData.get(`${yVal}|${xVal}`);
        if (value !== undefined) {
            const content = `
            <div class="font-semibold text-base">${yConfig.label}: ${yVal}</div>
            <div class="text-sm">${xConfig.label}: ${xVal}</div>
            <div class="text-sm mt-1">${valConfig.label}: <span class="font-bold">${formatValue(value, valConfig.label || '')}</span></div>
        `;
            setTooltip({ content, x: e.clientX, y: e.clientY });
        }
        if (dragStart) {
            updateSelection(xIndex, yIndex);
        }
    };

    const handleMouseDown = (xIndex: number, yIndex: number) => {
        setDragStart({ x: xIndex, y: yIndex });
        const xv = xLabels[xIndex];
        const yv = yLabels[yIndex];
        setSelectedCells(new Set([`${yv}|${xv}`]));
    };

    const handleMouseLeave = () => setTooltip(null);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (tooltip) {
            setTooltip({ ...tooltip, x: e.clientX, y: e.clientY });
        }
    };
    const handleMouseUp = () => setDragStart(null);

    return (
        <div
            className="bg-white p-6 rounded-lg shadow-lg h-full min-h-[28rem] flex flex-col"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 text-center flex-1">{title}</h3>
                <button
                    onClick={isEditing ? stopEdit : startEdit}
                    className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                    {isEditing ? 'Done' : 'Edit Colors'}
                </button>
            </div>
            {isEditing && (
                <div className="flex gap-4 mb-2 text-xs">
                    <label className="flex items-center gap-1">
                        Start
                        <input
                            type="color"
                            aria-label="start color"
                            value={startColor}
                            onChange={(e) => setStartColor(e.target.value)}
                        />
                    </label>
                    <label className="flex items-center gap-1">
                        End
                        <input
                            type="color"
                            aria-label="end color"
                            value={endColor}
                            onChange={(e) => setEndColor(e.target.value)}
                        />
                    </label>
                </div>
            )}
            {tooltip && (
                <div
                    style={{ position: 'fixed', top: tooltip.y + 15, left: tooltip.x + 15, pointerEvents: 'none', zIndex: 1000 }}
                    className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm"
                    dangerouslySetInnerHTML={{ __html: tooltip.content }}
                />
            )}
            <div className="flex-grow overflow-auto text-xs">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2 border border-gray-200 bg-gray-50 sticky top-0 left-0 z-10">
                                {yConfig.label} / {xConfig.label}
                            </th>
                            {xLabels.map(xVal => (
                                <th key={xVal} className="p-2 border border-gray-200 bg-gray-50 sticky top-0 font-semibold">
                                    {xVal}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {yLabels.map((yVal, yi) => (
                            <tr key={yVal}>
                                <th className="p-2 border border-gray-200 bg-gray-50 sticky left-0 font-semibold text-left">
                                    {yVal}
                                </th>
                                {xLabels.map((xVal, xi) => {
                                    const value = gridData.get(`${yVal}|${xVal}`);
                                    const color = value !== undefined ? getColor(value) : '#f0f0f0';
                                    const cellKey = `${yVal}|${xVal}`;
                                    const isSelected = selectedCells.has(cellKey);
                                    return (
                                        <td
                                            key={xVal}
                                            data-testid={`cell-${yi}-${xi}`}
                                            data-selected={isSelected ? 'true' : 'false'}
                                            className={`p-2 border border-white hover:border-gray-800 transition-all cursor-pointer ${
                                                isSelected ? 'ring-2 ring-black' : ''
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onMouseEnter={(e) => handleCellMouseEnter(xVal, yVal, xi, yi, e)}
                                            onMouseDown={() => handleMouseDown(xi, yi)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <div className="w-full h-full min-w-[30px] min-h-[30px]"></div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-center gap-2 pt-4">
                <span className="text-xs text-gray-600">{formatValue(valueRange[0], valConfig.label || '')}</span>
                <div className="w-48 h-3 rounded-full" style={legendStyle}></div>
                <span className="text-xs text-gray-600">{formatValue(valueRange[1], valConfig.label || '')}</span>
            </div>
        </div>
    );
};

export default HeatmapChart;

