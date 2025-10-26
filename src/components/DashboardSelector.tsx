"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, ChevronDown } from 'lucide-react'
import { getDashboards, setActiveDashboard, getActiveDashboard } from '@/lib/dashboardStorage'
import { DashboardConfig } from '@/types/dashboard'

interface DashboardSelectorProps {
  onDashboardChange?: (dashboard: DashboardConfig) => void
}

export function DashboardSelector({ onDashboardChange }: DashboardSelectorProps) {
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([])
  const [activeDashboard, setActiveDashboardState] = useState<DashboardConfig | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadDashboards()
  }, [])

  const loadDashboards = () => {
    const store = getDashboards()
    setDashboards(store.dashboards)
    const active = getActiveDashboard()
    setActiveDashboardState(active)
  }

  const handleSelectDashboard = (dashboard: DashboardConfig) => {
    setActiveDashboard(dashboard.id)
    setActiveDashboardState(dashboard)
    setIsOpen(false)
    
    if (onDashboardChange) {
      onDashboardChange(dashboard)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="truncate">{activeDashboard?.name || 'Select Dashboard'}</span>
        </div>
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 w-full min-w-[250px] bg-white border rounded-lg shadow-lg z-50 max-h-[400px] overflow-auto">
            {dashboards.map((dashboard) => (
              <button
                key={dashboard.id}
                onClick={() => handleSelectDashboard(dashboard)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b last:border-b-0 ${
                  activeDashboard?.id === dashboard.id ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{dashboard.name}</div>
                    {dashboard.description && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {dashboard.description}
                      </div>
                    )}
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded capitalize">
                        {dashboard.type}
                      </span>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                        {dashboard.settings.limit || 50} items
                      </span>
                    </div>
                  </div>
                  {activeDashboard?.id === dashboard.id && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-primary"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

