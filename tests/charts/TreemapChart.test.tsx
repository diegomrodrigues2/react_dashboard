import { describe, test, expect } from 'vitest';
import { moveNode, updateMetrics, TreemapNode } from '../../components/charts/TreemapChart.tsx';

const createSampleTree = (): TreemapNode[] => [
    {
        name: 'A',
        size: 0,
        colorMetric: 0,
        children: [{ name: 'leaf', size: 10, colorMetric: 10 }],
    },
    { name: 'B', size: 0, colorMetric: 0 },
];

describe('Treemap editing', () => {
    test('moveNode moves leaf to new parent and updates metrics', () => {
        const data = createSampleTree();
        updateMetrics(data); // establish initial parent metrics

        moveNode(data, 'leaf', 'B');
        updateMetrics(data);

        const a = data.find((n) => n.name === 'A')!;
        const b = data.find((n) => n.name === 'B')!;

        expect(a.children?.length).toBe(0);
        expect(a.size).toBe(0);
        expect(b.children?.[0].name).toBe('leaf');
        expect(b.size).toBe(10);
        expect(b.colorMetric).toBe(10);
    });

    test('updateMetrics applies custom formula', () => {
        const data: TreemapNode[] = [
            { name: 'A', size: 2, colorMetric: 0 },
            { name: 'B', size: 3, colorMetric: 0 },
        ];
        updateMetrics(data, (n) => n.size * 5);
        expect(data[0].colorMetric).toBe(10);
        expect(data[1].colorMetric).toBe(15);
    });
});
