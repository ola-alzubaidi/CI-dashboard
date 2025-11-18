export type WidgetType = 'list' | 'metric' | 'chart' | 'table'

export type DataSource = 'ritms' | 'incidents' | 'users'

export type ChartType = 'pie' | 'bar' | 'line' | 'donut'

export interface WidgetConfig {
  dataSource: DataSource
  limit?: number
  filters?: Record<string, string>
  chartType?: ChartType
  displayFields?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  refreshInterval?: number
  color?: string
  groupBy?: string
}

export interface Widget {
  id: string
  type: WidgetType
  title: string
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  config: WidgetConfig
  createdAt: string
  updatedAt: string
}

