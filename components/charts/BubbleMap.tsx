

import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { BubbleMapConfig, SalesData, AggregationType } from '../../types.ts';
import { world110m } from '../maps/world-110m-topojson.ts';

interface BubbleMapProps {
    data: SalesData[];
    title: string;
    config: BubbleMapConfig;
}

interface TooltipState {
    content: string;
    x: number;
    y: number;
}

const aggregate = (items: SalesData[], dataKey: keyof SalesData, type: AggregationType = 'SUM'): number => {
    switch (type) {
        case 'SUM': return items.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);
        case 'AVERAGE': {
            const sum = items.reduce((s, item) => s + (Number(item[dataKey]) || 0), 0);
            return items.length > 0 ? sum / items.length : 0;
        }
        default: return 0;
    }
};

const BubbleMap: React.FC<BubbleMapProps> = ({ data, title, config }) => {
    const { location, size, color } = config;
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const processedData = useMemo(() => {
        if (!data || !location || !size || !color) return [];

        const groups = new Map<string, SalesData[]>();
        data.forEach(item => {
            const coords = item[location.coordinatesKey];
            if (!coords) return;
            const key = coords.join(',');
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(item);
        });

        return Array.from(groups.entries()).map(([key, items]) => {
            const [lon, lat] = key.split(',').map(Number);
            const sizeValue = aggregate(items, size.dataKey as keyof SalesData, size.aggregation);
            const colorValue = aggregate(items, color.dataKey as keyof SalesData, color.aggregation);
            const regiao = items[0]?.regiao || 'N/A';
            return {
                coordinates: [lon, lat] as [number, number],
                sizeValue,
                colorValue,
                regiao,
                count: items.length
            };
        });
    }, [data, location, size, color]);

    const valueRanges = useMemo(() => {
        if (processedData.length === 0) return { size: [0, 1], color: [0, 1] };
        const sizes = processedData.map(d => d.sizeValue);
        const colors = processedData.map(d => d.colorValue);
        return {
            size: [Math.min(...sizes), Math.max(...sizes)],
            color: [Math.min(...colors), Math.max(...colors)]
        };
    }, [processedData]);

    const sizeScale = (value: number) => {
        const [min, max] = valueRanges.size;
        if (max === min) return 5;
        const scale = (value - min) / (max - min);
        return 5 + scale * 25; // Bubble radius from 5px to 30px
    };
    
    const colorScale = (value: number) => {
        const [min, max] = valueRanges.color;
        if (max === min) return '#FFCA28'; // yellow
        const ratio = (value - min) / (max - min);
        // From yellow (low/negative profit) to blue (high profit)
        const isPositive = value >= 0;
        if (!isPositive) return `rgba(217, 38, 46, ${0.4 + ratio * 0.6})`; // Red for negative
        return `rgba(0, 163, 224, ${0.4 + ratio * 0.6})`; // Blue for positive
    };

    const handleMouseEnter = (d: any, e: React.MouseEvent) => {
        const content = `
            <div class="font-bold text-base mb-1">${d.regiao}</div>
            <div>${size.label}: ${d.sizeValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div>${color.label}: ${d.colorValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div>Transações: ${d.count}</div>
        `;
        setTooltip({ content, x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (tooltip) {
            setTooltip({ ...tooltip, x: e.clientX, y: e.clientY });
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-full min-h-[28rem] flex flex-col relative" onMouseMove={handleMouseMove}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            {tooltip && (
                 <div
                    style={{
                        position: 'fixed',
                        top: tooltip.y + 15,
                        left: tooltip.x + 15,
                        pointerEvents: 'none',
                        zIndex: 1000,
                    }}
                    className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm text-sm"
                    dangerouslySetInnerHTML={{ __html: tooltip.content }}
                />
            )}
            <div className="flex-grow">
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: 400, center: [-52, -15] }}>
                    <ZoomableGroup zoom={1} minZoom={1} maxZoom={8}>
                        <Geographies geography={world110m}>
                            {({ geographies }) =>
                                geographies.map(geo => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#E9EAEA"
                                        stroke="#D6D6DA"
                                        style={{
                                            default: { outline: 'none' },
                                            hover: { outline: 'none' },
                                            pressed: { outline: 'none' },
                                        }}
                                    />
                                ))
                            }
                        </Geographies>
                        {processedData.map((d, i) => (
                            <Marker
                                key={i}
                                coordinates={d.coordinates}
                                onMouseEnter={(e) => handleMouseEnter(d, e)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <circle
                                    r={sizeScale(d.sizeValue)}
                                    fill={colorScale(d.colorValue)}
                                    stroke="#fff"
                                    strokeWidth={1}
                                />
                            </Marker>
                        ))}
                    </ZoomableGroup>
                </ComposableMap>
            </div>
        </div>
    );
};

export default BubbleMap;