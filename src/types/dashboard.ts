import { Widget } from './widget'

export interface DashboardConfig {
  id: string
  name: string
  description?: string
  type: 'ritms' | 'incidents' | 'users' | 'custom'
  createdAt: string
  updatedAt: string
  widgets?: Widget[]  // Array of widgets on this dashboard
  settings: {
    limit?: number
    filters?: Record<string, string>
    layout?: 'grid' | 'list' | 'table'
    refreshInterval?: number
  }
}

export interface DashboardStore {
  dashboards: DashboardConfig[]
  activeDashboardId: string | null
}

