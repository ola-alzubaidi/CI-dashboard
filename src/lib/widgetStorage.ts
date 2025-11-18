import { Widget } from '@/types/widget'
import { getDashboards, updateDashboard } from './dashboardStorage'

export function addWidgetToDashboard(dashboardId: string, widget: Partial<Widget>): Widget {
  const store = getDashboards()
  const dashboard = store.dashboards.find(d => d.id === dashboardId)
  
  if (!dashboard) {
    throw new Error('Dashboard not found')
  }

  const newWidget: Widget = {
    id: widget.id || crypto.randomUUID(),
    type: widget.type || 'chart',
    title: widget.title || 'Untitled Widget',
    position: widget.position || { x: 0, y: 0, w: 6, h: 4 },
    config: widget.config || {
      dataSource: 'ritms',
      limit: 100,
      chartType: 'pie',
      groupBy: 'state',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const existingWidgets = dashboard.widgets || []
  const updatedWidgets = [...existingWidgets, newWidget]

  updateDashboard(dashboardId, { widgets: updatedWidgets })

  return newWidget
}

export function updateWidgetInDashboard(
  dashboardId: string,
  widgetId: string,
  updates: Partial<Widget>
): void {
  const store = getDashboards()
  const dashboard = store.dashboards.find(d => d.id === dashboardId)
  
  if (!dashboard) {
    throw new Error('Dashboard not found')
  }

  const widgets = dashboard.widgets || []
  const widgetIndex = widgets.findIndex(w => w.id === widgetId)
  
  if (widgetIndex === -1) {
    throw new Error('Widget not found')
  }

  widgets[widgetIndex] = {
    ...widgets[widgetIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  updateDashboard(dashboardId, { widgets })
}

export function deleteWidgetFromDashboard(dashboardId: string, widgetId: string): void {
  const store = getDashboards()
  const dashboard = store.dashboards.find(d => d.id === dashboardId)
  
  if (!dashboard) {
    throw new Error('Dashboard not found')
  }

  const widgets = (dashboard.widgets || []).filter(w => w.id !== widgetId)
  updateDashboard(dashboardId, { widgets })
}

export function getWidgetsForDashboard(dashboardId: string): Widget[] {
  const store = getDashboards()
  const dashboard = store.dashboards.find(d => d.id === dashboardId)
  
  return dashboard?.widgets || []
}

