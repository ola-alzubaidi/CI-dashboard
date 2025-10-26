export interface DashboardConfig {
  id: string
  name: string
  description?: string
  type: 'ritms' | 'incidents' | 'users' | 'custom'
  createdAt: string
  updatedAt: string
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

