"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  Edit,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  getDashboards,
  deleteDashboard,
  setActiveDashboard,
  DEFAULT_DASHBOARD
} from '@/lib/dashboardStorage'
import { DashboardConfig } from '@/types/dashboard'
import { DashboardCreateModal } from '@/components/DashboardCreateModal'
import { DashboardConfigModal } from '@/components/DashboardConfigModal'

interface DashboardSidebarProps {
  onDashboardChange?: (dashboard: DashboardConfig) => void
}

export function DashboardSidebar({ onDashboardChange }: DashboardSidebarProps) {
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([])
  const [activeDashboardId, setActiveDashboardIdState] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState<DashboardConfig | null>(null)

  useEffect(() => {
    loadDashboards()
  }, [])

  const loadDashboards = () => {
    const store = getDashboards()
    setDashboards(store.dashboards)
    setActiveDashboardIdState(store.activeDashboardId)
  }

  const handleCreateSuccess = (dashboard: DashboardConfig) => {
    loadDashboards()
    if (onDashboardChange) {
      onDashboardChange(dashboard)
    }
  }

  const handleConfigSuccess = (dashboard: DashboardConfig) => {
    loadDashboards()
    if (onDashboardChange) {
      onDashboardChange(dashboard)
    }
  }

  const handleDeleteDashboard = (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this dashboard?')) {
        deleteDashboard(id)
        loadDashboards()
      }
    } catch (err) {
      // Failed to delete dashboard
      alert(err instanceof Error ? err.message : 'Failed to delete dashboard')
    }
  }

  const handleSetActive = (dashboard: DashboardConfig) => {
    setActiveDashboard(dashboard.id)
    setActiveDashboardIdState(dashboard.id)
    
    if (onDashboardChange) {
      onDashboardChange(dashboard)
    }
  }

  const handleOpenCreateModal = () => {
    setEditingDashboard(null)
    setShowCreateModal(true)
  }

  const handleOpenEditModal = (dashboard: DashboardConfig) => {
    setEditingDashboard(dashboard)
    setShowCreateModal(true)
  }

  const handleOpenConfigModal = (dashboard: DashboardConfig) => {
    setEditingDashboard(dashboard)
    setShowConfigModal(true)
  }

  return (
    <div className={`bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 h-full flex flex-col transition-all duration-300 shadow-2xl ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Dashboards</h2>
              <p className="text-xs text-slate-400">Manage & Switch</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hover:bg-slate-700/50 text-slate-300 hover:text-white ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* Create Dashboard Button */}
          <div className="p-4 border-b border-slate-700/50">
            <Button
              onClick={handleOpenCreateModal}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 border-0"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Dashboard
            </Button>
          </div>

          {/* Dashboard List */}
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-3 space-y-2">
              {dashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className={`group relative rounded-xl transition-all duration-200 ${
                    activeDashboardId === dashboard.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30'
                      : 'bg-slate-800/50 hover:bg-slate-700/50'
                  }`}
                >
                  <button
                    onClick={() => handleSetActive(dashboard)}
                    className="w-full text-left p-3 rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            activeDashboardId === dashboard.id
                              ? 'bg-white/20'
                              : 'bg-slate-700/50'
                          }`}>
                            <LayoutDashboard className="h-3.5 w-3.5 flex-shrink-0" />
                          </div>
                          <span className="font-semibold text-sm truncate">{dashboard.name}</span>
                        </div>
                        {dashboard.description && (
                          <p className="text-xs opacity-70 truncate ml-8">{dashboard.description}</p>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Action buttons - show on hover */}
                  {dashboard.id !== DEFAULT_DASHBOARD.id && activeDashboardId !== dashboard.id && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenConfigModal(dashboard)
                        }}
                        className="h-7 w-7 p-0 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg"
                        title="Configure Settings"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEditModal(dashboard)
                        }}
                        className="h-7 w-7 p-0 bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg"
                        title="Edit Name"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDashboard(dashboard.id)
                        }}
                        className="h-7 w-7 p-0 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Settings button for active dashboard */}
                  {activeDashboardId === dashboard.id && dashboard.id !== DEFAULT_DASHBOARD.id && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenConfigModal(dashboard)
                        }}
                        className="h-7 w-7 p-0 bg-white/20 hover:bg-white/30 text-white rounded-lg"
                        title="Configure Settings"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer - Settings hint */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="p-1.5 bg-slate-700/50 rounded-md">
                <Settings className="h-3 w-3" />
              </div>
              <span className="font-medium">{dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </>
      )}

      {/* Collapsed state - show icons only */}
      {isCollapsed && (
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {dashboards.map((dashboard) => (
            <div key={dashboard.id} className="px-2">
              <button
                onClick={() => handleSetActive(dashboard)}
                className={`w-full p-3 flex justify-center transition-all duration-200 rounded-xl relative ${
                  activeDashboardId === dashboard.id
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800/50 hover:bg-slate-700/50'
                }`}
                title={dashboard.name}
              >
                <LayoutDashboard className="h-5 w-5" />
                {activeDashboardId === dashboard.id && (
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-400 rounded-l-full"></div>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard Create/Edit Name Modal */}
      <DashboardCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleCreateSuccess}
        editDashboard={editingDashboard}
      />
      
      {/* Dashboard Configuration Modal */}
      <DashboardConfigModal
        open={showConfigModal}
        onOpenChange={setShowConfigModal}
        onSuccess={handleConfigSuccess}
        editDashboard={editingDashboard}
      />
    </div>
  )
}

