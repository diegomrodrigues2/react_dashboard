import React, { useMemo, useState } from 'react';
import { SalesData, HeatmapConfig as HeatmapConfigType, AggregationType } from '../../types.ts';

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
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, title, config }) => {
    const { x: xConfig, y: yConfig, value: valConfig } = config;
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

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
            allX.sort((a,b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
        } else {
            allX.sort();
        }

        const allY = Array.from(new Set(data.map(d => String(d[yKey] ?? '')))).sort();

        const gridData = new Map<string, number>();
        let minVal = Infinity;
        let maxVal = -Infinity;

        allY.forEach(yVal => {
            allX.forEach(xVal => {
                const filteredItems = data.filter(d => String(d[yKey]) === yVal && String(d[xKey]) === xVal);
                const aggregatedValue = aggregate(filteredItems, valKey, valAgg);
                const gridKey = `${yVal}|${xVal}`;
                gridData.set(gridKey, aggregatedValue);

                if(filteredItems.length > 0) {
                    if (aggregatedValue < minVal) minVal = aggregatedValue;
                    if (aggregatedValue > maxVal) maxVal = aggregatedValue;
                }
            });
        });

        // handle case where all values are the same or only one value exists
        if (minVal === Infinity) minVal = 0;
        if (maxVal === -Infinity) maxVal = 0;
        if (minVal === maxVal) {
             minVal = minVal >= 0 ? 0 : minVal -1;
             maxVal = maxVal > 0 ? maxVal + 1 : 0;
        }


        return { gridData, xLabels: allX, yLabels: allY, valueRange: [minVal, maxVal] };
    }, [data, xConfig, yConfig, valConfig]);

    const getColor = (value: number) => {
        const [min, max] = valueRange;
        
        // Handle no data case
        if (value === undefined || (min === 0 && max === 0 && value === 0)) return '#f0f0f0';

        // From light blue (low/negative) to dark blue (high profit)
        const ratio = max === min ? 0.5 : (value - min) / (max - min);
        const startColor = { r: 199, g: 228, b: 247 }; // #C7E4F7 lighter blue
        const endColor = { r: 0, g: 90, b: 156 };     // #005A9C darker blue

        const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
        const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
        const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const handleMouseEnter = (xVal: string, yVal: string, e: React.MouseEvent) => {
        const value = gridData.get(`${yVal}|${xVal}`);
        if (value === undefined) return;

        const content = `
            <div class="font-semibold text-base">${yConfig.label}: ${yVal}</div>
            <div class="text-sm">${xConfig.label}: ${xVal}</div>
            <div class="text-sm mt-1">${valConfig.label}: <span class="font-bold">${formatValue(value, valConfig.label || '')}</span></div>
        `;
        setTooltip({ content, x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => setTooltip(null);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (tooltip) {
            setTooltip({ ...tooltip, x: e.clientX, y: e.clientY });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-96 flex flex-col" onMouseMove={handleMouseMove}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
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
                            <th className="p-2 border border-gray-200 bg-gray-50 sticky top-0 left-0 z-10">{yConfig.label} / {xConfig.label}</th>
                            {xLabels.map(xVal => (
                                <th key={xVal} className="p-2 border border-gray-200 bg-gray-50 sticky top-0 font-semibold">{xVal}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {yLabels.map(yVal => (
                            <tr key={yVal}>
                                <th className="p-2 border border-gray-200 bg-gray-50 sticky left-0 font-semibold text-left">{yVal}</th>
                                {xLabels.map(xVal => {
                                    const value = gridData.get(`${yVal}|${xVal}`);
                                    const color = value !== undefined ? getColor(value) : '#f0f0f0';
                                    return (
                                        <td
                                            key={xVal}
                                            className="p-2 border border-white hover:border-gray-800 transition-all cursor-pointer"
                                            style={{ backgroundColor: color }}
                                            onMouseEnter={(e) => handleMouseEnter(xVal, yVal, e)}
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
                <div className="w-48 h-3 rounded-full" style={{ background: `linear-gradient(to right, ${getColor(valueRange[0])}, ${getColor(valueRange[1])})` }}></div>
                <span className="text-xs text-gray-600">{formatValue(valueRange[1], valConfig.label || '')}</span>
            </div>
        </div>
    );
};

export default HeatmapChart;
