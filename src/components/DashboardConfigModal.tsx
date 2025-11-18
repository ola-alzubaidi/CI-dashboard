"use client"

import { useState } from 'react'
import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  LayoutDashboard, 
  Settings,
  Grid3x3,
  List,
  Table2,
  RefreshCw,
  Filter,
  X,
  Plus
} from 'lucide-react'
import { createDashboard, updateDashboard } from '@/lib/dashboardStorage'
import { DashboardConfig } from '@/types/dashboard'

interface DashboardConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (dashboard: DashboardConfig) => void
  editDashboard?: DashboardConfig | null
}

export function DashboardConfigModal({ 
  open, 
  onOpenChange, 
  onSuccess,
  editDashboard 
}: DashboardConfigModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'ritms' as 'ritms' | 'incidents' | 'users' | 'custom',
    limit: 50,
    layout: 'grid' as 'grid' | 'list' | 'table',
    refreshInterval: 0, // 0 = manual only
  })

  const [filters, setFilters] = useState<Array<{ key: string; value: string }>>([])
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal opens with a different dashboard
  React.useEffect(() => {
    if (open) {
      if (editDashboard) {
        setFormData({
          name: editDashboard.name,
          description: editDashboard.description || '',
          type: editDashboard.type,
          limit: editDashboard.settings.limit || 50,
          layout: editDashboard.settings.layout || 'grid',
          refreshInterval: editDashboard.settings.refreshInterval || 0,
        })
        
        // Convert filters object to array
        const filterArray = Object.entries(editDashboard.settings.filters || {}).map(
          ([key, value]) => ({ key, value })
        )
        setFilters(filterArray)
      } else {
        setFormData({
          name: '',
          description: '',
          type: 'ritms',
          limit: 50,
          layout: 'grid',
          refreshInterval: 0,
        })
        setFilters([])
      }
      setError(null)
    }
  }, [open, editDashboard])

  const handleAddFilter = () => {
    setFilters([...filters, { key: '', value: '' }])
  }

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const handleFilterChange = (index: number, field: 'key' | 'value', value: string) => {
    const newFilters = [...filters]
    newFilters[index][field] = value
    setFilters(newFilters)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (!formData.name.trim()) {
        setError('Dashboard name is required')
        return
      }

      // Convert filters array to object
      const filtersObject: Record<string, string> = {}
      filters.forEach(filter => {
        if (filter.key.trim() && filter.value.trim()) {
          filtersObject[filter.key.trim()] = filter.value.trim()
        }
      })

      if (editDashboard) {
        // Update existing dashboard
        updateDashboard(editDashboard.id, {
          name: formData.name,
          description: formData.description,
          type: formData.type,
          settings: {
            limit: formData.limit,
            layout: formData.layout,
            refreshInterval: formData.refreshInterval,
            filters: filtersObject,
          }
        })
        onSuccess(editDashboard)
      } else {
        // Create new dashboard
        const newDashboard = createDashboard({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          settings: {
            limit: formData.limit,
            layout: formData.layout,
            refreshInterval: formData.refreshInterval,
            filters: filtersObject,
          }
        })
        onSuccess(newDashboard)
      }

      // Reset form and close
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save dashboard')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'ritms',
      limit: 50,
      layout: 'grid',
      refreshInterval: 0,
    })
    setFilters([])
    setError(null)
  }

  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            {editDashboard ? 'Configure Dashboard' : 'Create New Dashboard'}
          </DialogTitle>
          <DialogDescription>
            {editDashboard 
              ? 'Update dashboard settings and configuration'
              : 'Configure your dashboard with custom settings, filters, and layout options'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Basic Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Dashboard Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., High Priority RITMs"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <textarea
                id="description"
                placeholder="Describe what this dashboard shows..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
              />
            </div>
          </div>

          {/* Data Source */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Data Source & Display
            </h3>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Data Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full h-10 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ritms">Request Items (RITMs)</option>
                <option value="incidents">Incidents</option>
                <option value="users">Users</option>
                <option value="custom">Custom</option>
              </select>
              <p className="text-xs text-slate-500">Select the type of ServiceNow data to display</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit" className="text-sm font-medium">
                Item Limit
              </Label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="100"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 50 })}
                className="h-10"
              />
              <p className="text-xs text-slate-500">Maximum number of items to fetch (1-100)</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Layout Style
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, layout: 'grid' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.layout === 'grid' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Grid3x3 className={`h-6 w-6 mx-auto mb-2 ${
                    formData.layout === 'grid' ? 'text-blue-600' : 'text-slate-400'
                  }`} />
                  <p className="text-xs font-medium">Grid</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, layout: 'list' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.layout === 'list' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <List className={`h-6 w-6 mx-auto mb-2 ${
                    formData.layout === 'list' ? 'text-blue-600' : 'text-slate-400'
                  }`} />
                  <p className="text-xs font-medium">List</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, layout: 'table' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.layout === 'table' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Table2 className={`h-6 w-6 mx-auto mb-2 ${
                    formData.layout === 'table' ? 'text-blue-600' : 'text-slate-400'
                  }`} />
                  <p className="text-xs font-medium">Table</p>
                </button>
              </div>
            </div>
          </div>

          {/* Auto-Refresh */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Auto-Refresh
            </h3>

            <div className="space-y-2">
              <Label htmlFor="refreshInterval" className="text-sm font-medium">
                Refresh Interval (seconds)
              </Label>
              <select
                id="refreshInterval"
                value={formData.refreshInterval}
                onChange={(e) => setFormData({ ...formData, refreshInterval: parseInt(e.target.value) })}
                className="w-full h-10 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="0">Manual only (no auto-refresh)</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every 1 minute</option>
                <option value="300">Every 5 minutes</option>
                <option value="600">Every 10 minutes</option>
                <option value="1800">Every 30 minutes</option>
              </select>
              <p className="text-xs text-slate-500">Automatically refresh data at specified intervals</p>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters (Optional)
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFilter}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Filter
              </Button>
            </div>

            {filters.length > 0 ? (
              <div className="space-y-2">
                {filters.map((filter, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <Input
                      placeholder="Field name (e.g., priority)"
                      value={filter.key}
                      onChange={(e) => handleFilterChange(index, 'key', e.target.value)}
                      className="h-9 flex-1"
                    />
                    <Input
                      placeholder="Value (e.g., high)"
                      value={filter.value}
                      onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                      className="h-9 flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFilter(index)}
                      className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No filters added. Click "Add Filter" to create custom filters.</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              {editDashboard ? 'Update Dashboard' : 'Create Dashboard'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

