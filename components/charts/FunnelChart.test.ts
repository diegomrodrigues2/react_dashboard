import { describe, it, expect } from 'vitest';
import { calculateConversionRates } from './FunnelChart';

describe('calculateConversionRates', () => {
    it('computes conversion percentages between steps', () => {
        const data = [
            { name: 'A', value: 100 },
            { name: 'B', value: 50 },
            { name: 'C', value: 25 },
        ];

        const result = calculateConversionRates(data);
        expect(result.map(r => r.conversionRate)).toEqual([null, 50, 50]);
    });

    it('ignores non-positive previous values', () => {
        const data = [
            { name: 'A', value: 0 },
            { name: 'B', value: 50 },
        ];

        const result = calculateConversionRates(data);
        expect(result.map(r => r.conversionRate)).toEqual([null, null]);
    });
});

