import { test, expect, beforeEach } from 'vitest';
import { applyLayoutToWidgets, addWidget } from '../components/Dashboard.tsx';
import { saveDashboardConfig, getDashboardConfig } from '../services/dashboardData.ts';
import { DashboardConfig, DashboardWidget } from '../types.ts';

beforeEach(() => {
  localStorage.clear();
});

test('drag updates widget position', () => {
  const config: DashboardConfig = {
    filters: [],
    widgets: [
      { id: 'w1', component: 'KpiCard', gridClass: '', config: {} as any, layout: { x: 0, y: 0, w: 1, h: 1 } }
    ]
  };
  const layout = [{ i: 'w1', x: 5, y: 6, w: 1, h: 1 }];
  const updated = applyLayoutToWidgets(config, layout);
  expect(updated.widgets[0].layout).toEqual({ x: 5, y: 6, w: 1, h: 1 });
});

test('resize updates widget size', () => {
  const config: DashboardConfig = {
    filters: [],
    widgets: [
      { id: 'w1', component: 'KpiCard', gridClass: '', config: {} as any, layout: { x: 0, y: 0, w: 1, h: 1 } }
    ]
  };
  const layout = [{ i: 'w1', x: 0, y: 0, w: 3, h: 4 }];
  const updated = applyLayoutToWidgets(config, layout);
  expect(updated.widgets[0].layout).toEqual({ x: 0, y: 0, w: 3, h: 4 });
});

test('addWidget appends widget to config', async () => {
  const config: DashboardConfig = { filters: [], widgets: [] };
  const widget: DashboardWidget = { id: 'new', component: 'KpiCard', gridClass: '', config: {} as any };
  const updated = addWidget(config, widget);
  expect(updated.widgets).toHaveLength(1);
  await saveDashboardConfig(updated);
  const loaded = await getDashboardConfig();
  expect(loaded.widgets).toHaveLength(1);
});
