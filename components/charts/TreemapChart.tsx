
import React, { useMemo } from 'react';
import { Treemap as RechartsTreemap, ResponsiveContainer, Tooltip } from 'recharts';
import { DynamicChartConfig } from '../../types.ts';

export interface TreemapNode {
    name: string;
    size: number;
    colorMetric: number;
    children?: TreemapNode[];
}

interface TreemapProps {
    data: TreemapNode[];
    title: string;
    config: DynamicChartConfig;
}

// Moves a leaf node identified by `nodeName` under a new parent `newParentName`.
// The operation mutates the tree in place.
export const moveNode = (
    nodes: TreemapNode[],
    nodeName: string,
    newParentName: string
): void => {
    let movingNode: TreemapNode | null = null;

    const remove = (arr: TreemapNode[]): TreemapNode[] =>
        arr.filter((n) => {
            if (n.name === nodeName) {
                movingNode = n;
                return false;
            }
            if (n.children) {
                n.children = remove(n.children);
                if (n.children.length === 0) {
                    n.size = 0;
                    n.colorMetric = 0;
                }
            }
            return true;
        });

    const insert = (arr: TreemapNode[]): boolean => {
        for (const n of arr) {
            if (n.name === newParentName) {
                if (!n.children) n.children = [];
                n.children.push(movingNode!);
                return true;
            }
            if (n.children && insert(n.children)) return true;
        }
        return false;
    };

    // Remove node and then insert under new parent
    remove(nodes);
    if (movingNode) insert(nodes);
};

// Recalculates size and color metrics for the tree.
// Parents get the sum of child sizes and the average of child color metrics.
export const updateMetrics = (
    nodes: TreemapNode[],
    formula?: (n: TreemapNode) => number
): void => {
    const traverse = (node: TreemapNode): { size: number; color: number } => {
        if (!node.children || node.children.length === 0) {
            if (formula) node.colorMetric = formula(node);
            return { size: node.size, color: node.colorMetric };
        }
        let totalSize = 0;
        let totalColor = 0;
        node.children.forEach((child) => {
            const { size, color } = traverse(child);
            totalSize += size;
            totalColor += color;
        });
        node.size = totalSize;
        node.colorMetric = node.children.length ? totalColor / node.children.length : 0;
        return { size: node.size, color: node.colorMetric };
    };
    nodes.forEach(traverse);
};

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', compactDisplay: 'short' });

// Simple color scale function from light blue to dark blue
const getColor = (value: number, min: number, max: number): string => {
    if (min === max || value <= min) return '#64B5F6'; // Lightest blue
    if (value >= max) return '#005A9C'; // Darkest blue

    const ratio = (value - min) / (max - min);
    const startColor = { r: 100, g: 181, b: 246 }; // #64B5F6
    const endColor = { r: 0, g: 90, b: 156 };   // #005A9C

    const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
    const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
    const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));
    return `rgb(${r}, ${g}, ${b})`;
};

const CustomizedContent: React.FC<any> = ({ root, depth, x, y, width, height, index, name, size, colorMetric, colorMetricRange }) => {
    if (width < 30 || height < 20) return null; // Don't render for tiny rectangles
    
    const [min, max] = colorMetricRange;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: getColor(colorMetric, min, max),
                    stroke: '#fff',
                    strokeWidth: 2,
                    strokeOpacity: 1,
                }}
            />
            <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={12} fontWeight="bold">
                {name}
            </text>
        </g>
    );
};

const CustomTooltip = ({ active, payload, config }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const { value: sizeConfig, colorValue } = config;

        return (
            <div className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm text-sm">
                <p className="font-bold text-base mb-2 truncate text-gray-800">{data.name}</p>
                <p className="mb-1 text-gray-700">{`${sizeConfig.label || 'Tamanho'}: ${formatCurrency(data.size)}`}</p>
                <p className="text-gray-700">{`${colorValue.label || 'Métrica Cor'}: ${formatCurrency(data.colorMetric)}`}</p>
            </div>
        );
    }
    return null;
};

const TreemapChart: React.FC<TreemapProps> = ({ data, title, config }) => {
    const colorMetricRange = useMemo((): [number, number] => {
        if (!data || data.length === 0) return [0, 0];
        const values: number[] = [];
        const collect = (nodes: TreemapNode[]) => {
            nodes.forEach((n) => {
                values.push(n.colorMetric);
                if (n.children) collect(n.children);
            });
        };
        collect(data);
        return [Math.min(...values), Math.max(...values)];
    }, [data]);
    
    if (!config.value || !config.colorValue) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsTreemap
                        isAnimationActive={false} // Animation can be distracting for treemaps
                        data={data}
                        dataKey="size"
                        nameKey="name"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        content={<CustomizedContent colorMetricRange={colorMetricRange} />}
                    >
                         <Tooltip content={<CustomTooltip config={config} />} />
                    </RechartsTreemap>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TreemapChart;
