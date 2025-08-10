import { test, expect, beforeEach } from 'vitest';
import { applyLayoutToWidgets } from '../components/Dashboard.tsx';
import { saveDashboardConfig, getDashboardConfig } from '../services/dashboardData.ts';
import { DashboardConfig } from '../types.ts';

beforeEach(() => {
  localStorage.clear();
});

test('applyLayoutToWidgets updates widget layout', () => {
  const config: DashboardConfig = {
    filters: [],
    widgets: [
      { id: 'w1', component: 'KpiCard', gridClass: '', config: {} as any }
    ]
  };
  const layout = [{ i: 'w1', x: 2, y: 3, w: 4, h: 5 }];
  const updated = applyLayoutToWidgets(config, layout);
  expect(updated.widgets[0].layout).toEqual({ x: 2, y: 3, w: 4, h: 5 });
});

test('saveDashboardConfig persists config', async () => {
  const config: DashboardConfig = {
    filters: [],
    widgets: [
      { id: 'w1', component: 'KpiCard', gridClass: '', config: {} as any, layout: { x: 0, y: 0, w: 1, h: 1 } }
    ]
  };
  await saveDashboardConfig(config);
  const loaded = await getDashboardConfig();
  expect(loaded.widgets[0].layout).toEqual({ x: 0, y: 0, w: 1, h: 1 });
});
