
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { LineProps } from 'recharts';
import { DynamicChartConfig } from '../../types.ts';
import { useEdit } from '../../context/EditContext.tsx';

interface LineChartProps {
  data: any[];
  title: string;
  config: DynamicChartConfig;
  /**
   * Propriedades adicionais para personalizar cada `<Line>`.
   * Exemplos:
   * ```tsx
   * <LineChart lineProps={{ strokeWidth: 4, type: 'step', dot: false }} />
   * <LineChart lineProps={{ dot: { r: 6 }, strokeDasharray: '5 5' }} />
   * ```
   */
  lineProps?: Partial<LineProps>;
}

const lineColors = ['#00A3E0', '#D9262E', '#64B5F6', '#FFCA28'];

interface ChartLine {
  key: string;
  name: string;
  color: string;
  strokeWidth: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, title, config, lineProps }) => {
  const { category, value, legend } = config;
  const { isEditing } = useEdit();

  const lineDataKeys = useMemo(() => {
    if (!legend) {
      return [{ key: value.dataKey, name: value.label || value.dataKey }];
    }
    if (!data || data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow)
      .filter(key => key !== category.dataKey)
      .map(key => ({ key, name: key }));
  }, [data, legend, category.dataKey, value.dataKey, value.label]);

  const [lines, setLines] = useState<ChartLine[]>([]);

  useEffect(() => {
    setLines(
      lineDataKeys.map((line, index) => ({
        key: line.key,
        name: line.name,
        color: lineColors[index % lineColors.length],
        strokeWidth: 2
      }))
    );
  }, [lineDataKeys]);

  const dragItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => () => {
    dragItem.current = index;
  };

  const handleDrop = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const from = dragItem.current;
    if (from === null || from === index) return;
    setLines(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    dragItem.current = null;
  };

  const updateLine = (key: string, changes: Partial<ChartLine>) => {
    setLines(prev => prev.map(l => (l.key === key ? { ...l, ...changes } : l)));
  };

  const currencyFormatter = (val: any) => {
    if (typeof val !== 'number') return val;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(val);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col" style={{ width: '100%', height: '100%' }}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
      <div className="flex-grow" style={{ flex: 1 }}>
        {process.env.NODE_ENV === 'test' ? (
          <RechartsLineChart width={500} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={category.dataKey} stroke="#6B7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6B7280" tickFormatter={currencyFormatter} tick={{ fontSize: 12 }} />
            <Tooltip
                formatter={(val: number, name: string) => [currencyFormatter(val), name]}
                contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              content={() => (
                <div className="flex space-x-4">
                  {lines.map((line, index) => (
                    <div
                      key={line.key}
                      data-testid={`legend-item`}
                      draggable
                      onDragStart={handleDragStart(index)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleDrop(index)}
                      className="flex items-center space-x-1 cursor-move"
                    >
                      <span
                        className="w-3 h-3 inline-block"
                        style={{ backgroundColor: line.color }}
                      />
                      <span>{line.name}</span>
                      {isEditing && (
                        <>
                          <input
                            aria-label={`${line.key}-color`}
                            type="color"
                            value={line.color}
                            onChange={e => updateLine(line.key, { color: e.target.value })}
                          />
                          <input
                            aria-label={`${line.key}-width`}
                            type="number"
                            min={1}
                            value={line.strokeWidth}
                            onChange={e =>
                              updateLine(line.key, { strokeWidth: Number(e.target.value) })
                            }
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            />
            {lines.map(line => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                dot={{ r: 4, strokeWidth: 2 }}
                {...lineProps}
              />
            ))}
          </RechartsLineChart>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={category.dataKey} stroke="#6B7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" tickFormatter={currencyFormatter} tick={{ fontSize: 12 }} />
              <Tooltip
                  formatter={(val: number, name: string) => [currencyFormatter(val), name]}
                  contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                  }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                content={() => (
                  <div className="flex space-x-4">
                    {lines.map((line, index) => (
                      <div
                        key={line.key}
                        data-testid={`legend-item`}
                        draggable
                        onDragStart={handleDragStart(index)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDrop(index)}
                        className="flex items-center space-x-1 cursor-move"
                      >
                        <span
                          className="w-3 h-3 inline-block"
                          style={{ backgroundColor: line.color }}
                        />
                        <span>{line.name}</span>
                        {isEditing && (
                          <>
                            <input
                              aria-label={`${line.key}-color`}
                              type="color"
                              value={line.color}
                              onChange={e => updateLine(line.key, { color: e.target.value })}
                            />
                            <input
                              aria-label={`${line.key}-width`}
                              type="number"
                              min={1}
                              value={line.strokeWidth}
                              onChange={e =>
                                updateLine(line.key, { strokeWidth: Number(e.target.value) })
                              }
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              />
              {lines.map(line => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                  dot={{ r: 4, strokeWidth: 2 }}
                  {...lineProps}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default LineChart;
