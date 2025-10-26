import { DashboardConfig, DashboardStore } from '@/types/dashboard'

const STORAGE_KEY = 'servicenow_dashboards'

// Default RITMS dashboard
export const DEFAULT_DASHBOARD: DashboardConfig = {
  id: 'default-ritms',
  name: 'Team Dashboard',
  description: '',
  type: 'ritms',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    limit: 50,
    layout: 'grid',
    filters: {},
  }
}

export function getDashboards(): DashboardStore {
  if (typeof window === 'undefined') {
    return {
      dashboards: [DEFAULT_DASHBOARD],
      activeDashboardId: DEFAULT_DASHBOARD.id
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const initialStore: DashboardStore = {
        dashboards: [DEFAULT_DASHBOARD],
        activeDashboardId: DEFAULT_DASHBOARD.id
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStore))
      return initialStore
    }
    return JSON.parse(stored)
  } catch (error) {
    // Error loading dashboards
    return {
      dashboards: [DEFAULT_DASHBOARD],
      activeDashboardId: DEFAULT_DASHBOARD.id
    }
  }
}

export function saveDashboards(store: DashboardStore): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch (error) {
    // Error saving dashboards
  }
}

export function createDashboard(dashboard: Omit<DashboardConfig, 'id' | 'createdAt' | 'updatedAt'>): DashboardConfig {
  const newDashboard: DashboardConfig = {
    ...dashboard,
    id: `dashboard-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const store = getDashboards()
  store.dashboards.push(newDashboard)
  saveDashboards(store)

  return newDashboard
}

export function updateDashboard(id: string, updates: Partial<DashboardConfig>): void {
  const store = getDashboards()
  const index = store.dashboards.findIndex(d => d.id === id)
  
  if (index !== -1) {
    store.dashboards[index] = {
      ...store.dashboards[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveDashboards(store)
  }
}

export function deleteDashboard(id: string): void {
  const store = getDashboards()
  
  // Don't allow deleting the default dashboard
  if (id === DEFAULT_DASHBOARD.id) {
    throw new Error('Cannot delete the default dashboard')
  }
  
  store.dashboards = store.dashboards.filter(d => d.id !== id)
  
  // If the deleted dashboard was active, switch to default
  if (store.activeDashboardId === id) {
    store.activeDashboardId = DEFAULT_DASHBOARD.id
  }
  
  saveDashboards(store)
}

export function setActiveDashboard(id: string): void {
  const store = getDashboards()
  store.activeDashboardId = id
  saveDashboards(store)
}

export function getActiveDashboard(): DashboardConfig | null {
  const store = getDashboards()
  return store.dashboards.find(d => d.id === store.activeDashboardId) || null
}

