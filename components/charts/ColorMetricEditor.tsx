import React from 'react';
import { TreemapNode } from './TreemapChart.tsx';

interface ColorMetricEditorProps {
    formula: string;
    onChange: (formula: string) => void;
}

// Simple editor that allows users to provide a formula used to calculate
// the color metric of treemap nodes. The formula can reference "size" and
// "colorMetric" fields of a node.
const ColorMetricEditor: React.FC<ColorMetricEditorProps> = ({ formula, onChange }) => {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="color-metric-formula" className="text-sm font-medium text-gray-700">
                Color Metric Formula
            </label>
            <input
                id="color-metric-formula"
                value={formula}
                onChange={(e) => onChange(e.target.value)}
                className="border rounded px-2 py-1"
            />
        </div>
    );
};

export default ColorMetricEditor;

// Utility to evaluate a color metric based on a formula string.
// This is intentionally simple and intended for controlled input from
// trusted users.
export const evaluateColorMetric = (node: TreemapNode, formula: string): number => {
    try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('size', 'colorMetric', `return ${formula};`);
        return Number(fn(node.size, node.colorMetric));
    } catch {
        return node.colorMetric;
    }
};
