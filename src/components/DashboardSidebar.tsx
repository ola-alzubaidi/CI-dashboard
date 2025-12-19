"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Star,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import {
  setActiveDashboard,
  toggleServiceNowFavorite,
  isServiceNowFavorite,
} from '@/lib/dashboardStorage'
import { DashboardConfig } from '@/types/dashboard'
import { DashboardCreateModal } from '@/components/DashboardCreateModal'

interface DashboardSidebarProps {
  onDashboardChange?: (dashboard: DashboardConfig) => void
}

export function DashboardSidebar({ onDashboardChange }: DashboardSidebarProps) {
  const [activeDashboardId, setActiveDashboardIdState] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([])
  const [instanceUrl, setInstanceUrl] = useState<string>('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState(false)

  // Load dashboards from ServiceNow only
  const loadFromServiceNow = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/servicenow/dashboards/list')
      const data = await response.json()
      
      if (response.ok && data.dashboards) {
        const snDashboards: DashboardConfig[] = data.dashboards.map((d: any) => ({
          id: d.sys_id,
          name: d.name || 'Untitled',
          description: d.description || '',
          type: 'custom' as const,
          createdAt: d.created_on || new Date().toISOString(),
          updatedAt: d.updated_on || new Date().toISOString(),
          isFromServiceNow: true,
          serviceNowId: d.sys_id,
          isFavorite: isServiceNowFavorite(d.sys_id),
          settings: { limit: 50, layout: 'grid' as const, filters: {} }
        }))
        
        setDashboards(snDashboards)
        if (data.instanceUrl) setInstanceUrl(data.instanceUrl)

        // Set first dashboard as active if none selected
        if (!activeDashboardId && snDashboards.length > 0) {
          const firstDashboard = snDashboards[0]
          setActiveDashboardIdState(firstDashboard.id)
          setActiveDashboard(firstDashboard.id)
          if (onDashboardChange) onDashboardChange(firstDashboard)
        }
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [activeDashboardId, onDashboardChange])

  useEffect(() => {
    loadFromServiceNow()
  }, [])

  const handleSetActive = (dashboard: DashboardConfig) => {
    setActiveDashboard(dashboard.id)
    setActiveDashboardIdState(dashboard.id)
    if (onDashboardChange) onDashboardChange(dashboard)
  }

  const handleToggleFavorite = (dashboard: DashboardConfig) => {
    if (dashboard.serviceNowId) {
      toggleServiceNowFavorite(dashboard.serviceNowId)
      setDashboards(prev => 
        prev.map(d => 
          d.serviceNowId === dashboard.serviceNowId 
            ? { ...d, isFavorite: !d.isFavorite }
            : d
        )
      )
    }
  }

  const handleDuplicate = async (dashboard: DashboardConfig) => {
    setDuplicating(true)
    try {
      const response = await fetch('/api/servicenow/dashboards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${dashboard.name} (Copy)`,
          description: dashboard.description || ''
        })
      })
      
      if (response.ok) {
        await loadFromServiceNow()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to duplicate dashboard')
      }
    } catch {
      alert('Failed to duplicate dashboard')
    } finally {
      setDuplicating(false)
      setOpenMenuId(null)
    }
  }

  const handleDelete = async (dashboard: DashboardConfig) => {
    if (!dashboard.serviceNowId) return
    
    if (window.confirm(`Delete "${dashboard.name}"? This will remove it from ServiceNow.`)) {
      try {
        const response = await fetch(`/api/servicenow/dashboards/delete?sys_id=${dashboard.serviceNowId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await loadFromServiceNow()
        } else {
          const data = await response.json()
          alert(data.error || 'Failed to delete dashboard')
        }
      } catch {
        alert('Failed to delete dashboard')
      }
    }
    setOpenMenuId(null)
  }

  const handleDashboardCreated = (dashboard: DashboardConfig) => {
    loadFromServiceNow()
    handleSetActive(dashboard)
  }

  const openInServiceNow = (serviceNowId: string) => {
    if (instanceUrl) {
      window.open(`${instanceUrl}/now/platform-analytics-workspace/dashboard/${serviceNowId}`, '_blank')
    }
    setOpenMenuId(null)
  }

  // Sort dashboards - favorites first, then alphabetically
  const sortedDashboards = [...dashboards].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return a.name.localeCompare(b.name)
  })

  if (isCollapsed) {
    return (
      <div className="w-16 bg-slate-900 h-full flex flex-col border-r border-slate-700/50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-4 hover:bg-slate-800 border-b border-slate-700/50"
        >
          <ChevronRight className="h-5 w-5 text-slate-400 mx-auto" />
        </button>
        <div className="flex-1 overflow-y-auto py-2">
          {sortedDashboards.map((d) => (
            <button
              key={d.id}
              onClick={() => handleSetActive(d)}
              className={`w-full p-3 flex justify-center ${
                activeDashboardId === d.id ? 'bg-blue-600/30' : 'hover:bg-slate-800'
              }`}
              title={`${d.name}${d.description ? `\n${d.description}` : ''}`}
            >
              <LayoutDashboard className="h-5 w-5 text-blue-400" />
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-slate-700/50">
          <button
            onClick={() => {
              setIsCollapsed(false)
              setShowModal(true)
            }}
            className="w-full p-3 flex justify-center hover:bg-slate-800 rounded"
            title="New Dashboard"
          >
            <Plus className="h-5 w-5 text-blue-400" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-72 bg-slate-900 h-full flex flex-col border-r border-slate-700/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-blue-400" />
          <span className="font-semibold text-white">Dashboards</span>
          <span className="text-xs text-slate-500">({sortedDashboards.length})</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>


      {/* Dashboard List */}
      <div className="flex-1 overflow-y-auto bg-slate-900">
        {sortedDashboards.map((dashboard) => {
          const isActive = activeDashboardId === dashboard.id
          const isMenuOpen = openMenuId === dashboard.id

          return (
            <div
              key={dashboard.id}
              className={`group relative ${isActive ? 'bg-blue-600/20' : 'hover:bg-slate-800/50'}`}
            >
              <div
                onClick={() => handleSetActive(dashboard)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer"
              >
                {/* Icon */}
                <div className="p-1.5 rounded-lg flex-shrink-0 bg-blue-500/10">
                  <LayoutDashboard className="h-4 w-4 text-blue-400" />
                </div>

                {/* Name & Description */}
                <div className="flex-1 min-w-0" title={`${dashboard.name}${dashboard.description ? `\n${dashboard.description}` : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {dashboard.name}
                    </span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                  </div>
                  {dashboard.description && (
                    <p className="text-xs text-slate-500 truncate">{dashboard.description}</p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Favorite */}
                  <button
                    onClick={() => handleToggleFavorite(dashboard)}
                    className={`p-1.5 rounded transition-colors ${
                      dashboard.isFavorite 
                        ? 'text-yellow-400' 
                        : 'text-slate-600 hover:text-yellow-400'
                    }`}
                    title={dashboard.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`h-4 w-4 ${dashboard.isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  {/* More Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(isMenuOpen ? null : dashboard.id)}
                      className="p-1.5 rounded text-slate-600 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50">
                        <button
                          onClick={() => handleDuplicate(dashboard)}
                          disabled={duplicating}
                          className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50"
                        >
                          {duplicating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                          Duplicate
                        </button>

                        {dashboard.serviceNowId && (
                          <button
                            onClick={() => openInServiceNow(dashboard.serviceNowId!)}
                            className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open in ServiceNow
                          </button>
                        )}

                        <div className="border-t border-slate-700 my-1" />
                        <button
                          onClick={() => handleDelete(dashboard)}
                          className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer - Just the button, no text */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-900">
        <Button
          onClick={() => setShowModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Dashboard
        </Button>
      </div>

      {/* Click outside to close menu */}
      {openMenuId && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* Create Dashboard Modal */}
      <DashboardCreateModal
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={handleDashboardCreated}
      />
    </div>
  )
}
