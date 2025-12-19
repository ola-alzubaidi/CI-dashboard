import { DashboardConfig, DashboardStore } from '@/types/dashboard'

const STORAGE_KEY = 'servicenow_dashboards'
const WIDGETS_PREFIX = 'dashboard-widgets-'
const PREFERENCE_ID_KEY = 'servicenow_dashboard_preference_id'
const SN_FAVORITES_KEY = 'servicenow_dashboard_favorites' // Track favorites for SN dashboards

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

// Get all widgets for all dashboards
function getAllWidgets(): Record<string, any[]> {
  if (typeof window === 'undefined') return {}
  
  const widgets: Record<string, any[]> = {}
  const store = getDashboards()
  
  for (const dashboard of store.dashboards) {
    const widgetKey = `${WIDGETS_PREFIX}${dashboard.id}`
    const stored = localStorage.getItem(widgetKey)
    if (stored) {
      try {
        widgets[dashboard.id] = JSON.parse(stored)
      } catch {
        widgets[dashboard.id] = []
      }
    }
  }
  
  return widgets
}

// Save widgets for a specific dashboard
function setWidgets(dashboardId: string, widgets: any[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${WIDGETS_PREFIX}${dashboardId}`, JSON.stringify(widgets))
}

// Get stored preference ID
function getPreferenceId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PREFERENCE_ID_KEY)
}

// Set preference ID
function setPreferenceId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREFERENCE_ID_KEY, id)
}

// Get ServiceNow dashboard favorites
export function getServiceNowFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(SN_FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save ServiceNow dashboard favorites
export function saveServiceNowFavorites(favorites: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SN_FAVORITES_KEY, JSON.stringify(favorites))
}

// Toggle favorite for ServiceNow dashboards
export function toggleServiceNowFavorite(serviceNowId: string): boolean {
  const favorites = getServiceNowFavorites()
  const index = favorites.indexOf(serviceNowId)
  
  if (index === -1) {
    favorites.push(serviceNowId)
  } else {
    favorites.splice(index, 1)
  }
  
  saveServiceNowFavorites(favorites)
  
  // Sync to ServiceNow
  saveDashboardsToServiceNow().catch(console.error)
  
  return index === -1 // Returns true if now favorited
}

// Check if ServiceNow dashboard is favorited
export function isServiceNowFavorite(serviceNowId: string): boolean {
  return getServiceNowFavorites().includes(serviceNowId)
}

// Save dashboards to ServiceNow
export async function saveDashboardsToServiceNow(): Promise<{ success: boolean; error?: string }> {
  try {
    const store = getDashboards()
    const widgets = getAllWidgets()
    const preferenceId = getPreferenceId()
    const snFavorites = getServiceNowFavorites()

    const response = await fetch('/api/servicenow/dashboards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dashboards: store,
        widgets,
        snFavorites, // Include ServiceNow favorites
        preferenceId
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to save' }
    }

    // Store the preference ID for future updates
    if (data.preferenceId) {
      setPreferenceId(data.preferenceId)
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving to ServiceNow:', error)
    return { success: false, error: 'Network error' }
  }
}

// Load dashboards from ServiceNow
export async function loadDashboardsFromServiceNow(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/servicenow/dashboards')
    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to load' }
    }

    if (data.data) {
      // Restore dashboards
      if (data.data.dashboards) {
        saveDashboards(data.data.dashboards)
      }

      // Restore widgets
      if (data.data.widgets) {
        for (const [dashboardId, widgets] of Object.entries(data.data.widgets)) {
          setWidgets(dashboardId, widgets as any[])
        }
      }

      // Restore ServiceNow favorites
      if (data.data.snFavorites) {
        saveServiceNowFavorites(data.data.snFavorites)
      }

      // Store preference ID
      if (data.preferenceId) {
        setPreferenceId(data.preferenceId)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error loading from ServiceNow:', error)
    return { success: false, error: 'Network error' }
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

  // Auto-save to ServiceNow after creating
  saveDashboardsToServiceNow().catch(console.error)

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
    
    // Auto-save to ServiceNow after updating
    saveDashboardsToServiceNow().catch(console.error)
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
  
  // Remove widgets for this dashboard
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${WIDGETS_PREFIX}${id}`)
  }
  
  // Auto-save to ServiceNow after deleting
  saveDashboardsToServiceNow().catch(console.error)
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

export function toggleFavorite(id: string): void {
  const store = getDashboards()
  const index = store.dashboards.findIndex(d => d.id === id)
  
  if (index !== -1) {
    store.dashboards[index] = {
      ...store.dashboards[index],
      isFavorite: !store.dashboards[index].isFavorite,
      updatedAt: new Date().toISOString(),
    }
    saveDashboards(store)
    
    // Auto-save to ServiceNow
    saveDashboardsToServiceNow().catch(console.error)
  }
}

// Duplicate any dashboard (local or ServiceNow)
export function duplicateDashboard(id: string, sourceData?: DashboardConfig): DashboardConfig | null {
  const store = getDashboards()
  
  // First try to find in local dashboards
  let original = store.dashboards.find(d => d.id === id)
  
  // If not found locally and sourceData is provided (for ServiceNow dashboards)
  if (!original && sourceData) {
    original = sourceData
  }
  
  if (!original) return null
  
  const newDashboard: DashboardConfig = {
    ...original,
    id: `dashboard-${Date.now()}`,
    name: `${original.name} (Copy)`,
    isFavorite: false,
    isFromServiceNow: false, // Duplicated dashboard becomes a local dashboard
    serviceNowId: undefined, // Remove ServiceNow reference
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  store.dashboards.push(newDashboard)
  store.activeDashboardId = newDashboard.id // Set the new dashboard as active
  saveDashboards(store)
  
  // Copy widgets if any (for local dashboards)
  if (typeof window !== 'undefined' && !id.startsWith('sn-')) {
    const originalWidgets = localStorage.getItem(`${WIDGETS_PREFIX}${id}`)
    if (originalWidgets) {
      localStorage.setItem(`${WIDGETS_PREFIX}${newDashboard.id}`, originalWidgets)
    }
  }
  
  // Auto-save to ServiceNow
  saveDashboardsToServiceNow().catch(console.error)
  
  return newDashboard
}

// Save widgets and sync to ServiceNow
export function saveWidgetsAndSync(dashboardId: string, widgets: any[]): void {
  setWidgets(dashboardId, widgets)
  
  // Auto-save to ServiceNow
  saveDashboardsToServiceNow().catch(console.error)
}
