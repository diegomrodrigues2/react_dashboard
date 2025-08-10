
import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { ChoroplethMapConfig, SalesData, AggregationType } from '../../types.ts';
import { brazilRegionsGeoJson } from '../maps/brazil-regions-geojson.ts';

interface ChoroplethMapProps {
    data: SalesData[];
    title: string;
    config: ChoroplethMapConfig;
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

const ChoroplethMap: React.FC<ChoroplethMapProps> = ({ data, title, config }) => {
    const { geo, value } = config;
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const processedData = useMemo(() => {
        if (!data || !geo || !value) return new Map();

        const groups = new Map<string, SalesData[]>();
        data.forEach(item => {
            const key = String(item[geo.dataKey as keyof SalesData]);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(item);
        });

        const aggregatedMap = new Map<string, number>();
        groups.forEach((items, key) => {
            const aggregatedValue = aggregate(items, value.dataKey as keyof SalesData, value.aggregation);
            aggregatedMap.set(key, aggregatedValue);
        });

        return aggregatedMap;
    }, [data, geo, value]);
    
    const valueRange = useMemo(() => {
        if (processedData.size === 0) return [0, 1];
        const values = Array.from(processedData.values());
        return [Math.min(...values), Math.max(...values)];
    }, [processedData]);
    
    const colorScale = (val: number | undefined) => {
        if (val === undefined) return '#DDD'; // Default color for no data
        const [min, max] = valueRange;
        if (max === min) return '#64B5F6'; // Light blue if all values are the same
        
        const ratio = (val - min) / (max - min);
        const startColor = { r: 199, g: 228, b: 247 }; // #C7E4F7 lighter blue
        const endColor = { r: 0, g: 90, b: 156 };     // #005A9C darker blue

        const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
        const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
        const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const handleMouseEnter = (geoName: string, e: React.MouseEvent) => {
        const val = processedData.get(geoName);
        const formattedValue = val !== undefined ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A';
        const content = `<div class="font-bold text-base">${geoName}</div><div>${value.label}: ${formattedValue}</div>`;
        setTooltip({ content, x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => setTooltip(null);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (tooltip) {
            setTooltip({ ...tooltip, x: e.clientX, y: e.clientY });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-full min-h-[28rem] flex flex-col relative" onMouseMove={handleMouseMove}>
             <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{title}</h3>
             {tooltip && (
                 <div
                    style={{ position: 'fixed', top: tooltip.y + 15, left: tooltip.x + 15, pointerEvents: 'none', zIndex: 1000 }}
                    className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm text-sm"
                    dangerouslySetInnerHTML={{ __html: tooltip.content }}
                />
            )}
            <div className="flex-grow">
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: 700, center: [-52, -15] }}>
                    <ZoomableGroup zoom={1} minZoom={1} maxZoom={8}>
                        <Geographies geography={brazilRegionsGeoJson}>
                            {({ geographies }) =>
                                geographies.map(geoItem => {
                                    const geoName = geoItem.properties[config.geo.featureKey];
                                    const regionData = processedData.get(geoName);
                                    return (
                                        <Geography
                                            key={geoItem.rsmKey}
                                            geography={geoItem}
                                            fill={colorScale(regionData)}
                                            stroke="#FFF"
                                            onMouseEnter={(e) => handleMouseEnter(geoName, e)}
                                            onMouseLeave={handleMouseLeave}
                                            style={{
                                                default: { outline: 'none' },
                                                hover: { fill: '#00A3E0', outline: 'none' },
                                                pressed: { fill: '#005A9C', outline: 'none' },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>
            </div>
            <div className="flex items-center justify-center gap-2 pt-4">
                <span className="text-xs text-gray-600">{valueRange[0].toLocaleString('pt-BR', { notation: 'compact' })}</span>
                <div className="w-48 h-3 rounded-full" style={{ background: `linear-gradient(to right, ${colorScale(valueRange[0])}, ${colorScale(valueRange[1])})` }}></div>
                <span className="text-xs text-gray-600">{valueRange[1].toLocaleString('pt-BR', { notation: 'compact' })}</span>
            </div>
        </div>
    );
};

export default ChoroplethMap;
