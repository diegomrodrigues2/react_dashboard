import { SalesData, DynamicChartConfig, AggregationType } from '../types.ts';

export const ALL_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];

export const aggregate = (items: SalesData[], dataKey: keyof SalesData, type: AggregationType = 'SUM'): number => {
    switch (type) {
        case 'SUM':
            return items.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);
        case 'COUNT':
            return items.length;
        case 'AVERAGE':
            const sum = items.reduce((s, item) => s + (Number(item[dataKey]) || 0), 0);
            return items.length > 0 ? sum / items.length : 0;
        case 'NONE':
            const firstValue = items.length > 0 ? items[0][dataKey] : undefined;
            return typeof firstValue === 'number' ? firstValue : 0;
        default:
            return 0;
    }
};

export const processChartData = (data: any[], config: DynamicChartConfig): any[] => {
    const { chartType, category, value, legend, stackType, colorValue } = config;

    if (chartType === 'Scatter' || chartType === 'Waterfall' || chartType === 'Funnel') {
        return data;
    }

    if (chartType === 'Treemap') {
        const categoryKey = category?.dataKey;
        const sizeKey = value?.dataKey;
        const colorKey = colorValue?.dataKey;

        if (!categoryKey || !sizeKey || !colorKey || !data) return [];

        const groups = new Map<string, SalesData[]>();
        (data as SalesData[]).forEach(item => {
            const key = String(item[categoryKey as keyof SalesData]);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(item);
        });

        const treemapData = Array.from(groups.entries()).map(([key, items]) => {
          return {
            name: key,
            size: aggregate(items, sizeKey as keyof SalesData, value?.aggregation || 'SUM'),
            colorMetric: aggregate(items, colorKey as keyof SalesData, colorValue?.aggregation || 'AVERAGE'),
          };
        });
        return treemapData;
    }

    if (chartType === 'Combo') {
        const categoryKey = category?.dataKey;
        const barValueKey = value?.dataKey;
        const lineValueKey = config.lineValue?.dataKey;

        if (!categoryKey || !barValueKey || !lineValueKey) return [];

        const groups = new Map<string, SalesData[]>();
        data.forEach(item => {
            const key = String(item[categoryKey as keyof SalesData]);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(item);
        });

        const aggregatedList: any[] = [];
        groups.forEach((items, key) => {
          const barValue = aggregate(items, barValueKey as keyof SalesData, value.aggregation);
          const lineValue = aggregate(items, lineValueKey as keyof SalesData, config.lineValue.aggregation);
          aggregatedList.push({
            [categoryKey]: key,
            [barValueKey]: barValue,
            [lineValueKey]: lineValue,
          });
        });
        const sortedMonths = ALL_MONTHS;
        return aggregatedList.sort((a,b) => sortedMonths.indexOf(a[categoryKey]) - sortedMonths.indexOf(b[categoryKey]));
    }

    const categoryKey = category?.dataKey;
    const valueKey = value?.dataKey;
    if (!categoryKey || !valueKey) return [];

    const groups = new Map<string, SalesData[]>();
    data.forEach(item => {
        const categoryValue = String(item[categoryKey as keyof SalesData]);
        const legendValue = legend ? String(item[legend.dataKey as keyof SalesData]) : 'default';
        const key = `${categoryValue}__${legendValue}`;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(item);
    });

    const aggregatedList: any[] = [];
    groups.forEach((items, key) => {
        const [categoryValue, legendValue] = key.split('__');
        const aggregatedValue = aggregate(items, valueKey as keyof SalesData, value.aggregation);
        const entry: any = {
            [categoryKey]: categoryValue,
            [valueKey]: aggregatedValue,
        };
        if (legend) {
            entry[legend.dataKey as keyof SalesData] = legendValue;
        }
        aggregatedList.push(entry);
    });

    if (chartType === 'Pie') {
        return aggregatedList.map(item => ({
            name: item[categoryKey],
            value: item[valueKey],
        }));
    }

    if (legend) {
        const pivotedMap = new Map<string, any>();
        aggregatedList.forEach(item => {
            const categoryValue = item[categoryKey];
            const legendValue = item[legend.dataKey as keyof SalesData];
            const numericValue = item[valueKey];

            if (!pivotedMap.has(categoryValue)) {
                pivotedMap.set(categoryValue, { [categoryKey]: categoryValue });
            }
            const pivotedEntry = pivotedMap.get(categoryValue)!;
            pivotedEntry[legendValue] = numericValue;
        });

        const finalData = Array.from(pivotedMap.values());

        if (stackType === '100%stacked') {
            finalData.forEach(row => {
                const legendKeys = Object.keys(row).filter(k => k !== categoryKey);
                const total = legendKeys.reduce((sum, key) => sum + (row[key] || 0), 0);
                if (total > 0) {
                    legendKeys.forEach(key => {
                        row[key] = (row[key] || 0) / total;
                    });
                }
            });
        }
        return finalData;
    }

    return aggregatedList;
};

