import React from 'react';
import { ChartComponentType, DashboardWidget, WidgetConfig } from '../types.ts';

interface PaletteItem {
  type: ChartComponentType;
  label: string;
  defaultConfig: WidgetConfig;
}

const paletteItems: PaletteItem[] = [
  {
    type: 'KpiCard',
    label: 'KPI',
    defaultConfig: {
      valueKey: 'totalVendas',
      description: '',
      formatter: (v: number) => v.toString(),
    } as any,
  },
  {
    type: 'BarChart',
    label: 'Bar',
    defaultConfig: {
      sourceDataKey: 'detailedData',
      chartType: 'Bar',
      category: { dataKey: 'mes' },
      value: { dataKey: 'vendas', aggregation: 'SUM' },
    } as any,
  },
];

const WidgetPalette: React.FC = () => {
  return (
    <div className="flex gap-2">
      {paletteItems.map((item) => (
        <div
          key={item.type}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('widgetType', item.type)}
          className="p-2 bg-gray-100 border rounded cursor-move select-none"
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default WidgetPalette;

export const createWidgetFromType = (type: ChartComponentType, id: string): DashboardWidget => {
  const item = paletteItems.find((i) => i.type === type);
  return {
    id,
    component: type,
    gridClass: 'col-span-1',
    title: item?.label || type,
    config: item?.defaultConfig || ({} as WidgetConfig),
  };
};
