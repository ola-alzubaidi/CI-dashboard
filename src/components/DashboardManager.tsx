"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Trash2, 
  Edit, 
  LayoutDashboard, 
  Check,
  X
} from 'lucide-react'
import {
  getDashboards,
  createDashboard,
  deleteDashboard,
  updateDashboard,
  setActiveDashboard,
  DEFAULT_DASHBOARD
} from '@/lib/dashboardStorage'
import { DashboardConfig } from '@/types/dashboard'

interface DashboardManagerProps {
  onDashboardChange?: (dashboard: DashboardConfig) => void
}

export function DashboardManager({ onDashboardChange }: DashboardManagerProps) {
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([])
  const [activeDashboardId, setActiveDashboardIdState] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string
    description: string
    type: 'ritms' | 'incidents' | 'users' | 'custom'
    limit: number
    layout: 'grid' | 'list' | 'table'
  }>({
    name: '',
    description: '',
    type: 'ritms',
    limit: 50,
    layout: 'grid',
  })

  // Load dashboards on mount
  useEffect(() => {
    loadDashboards()
  }, [])

  const loadDashboards = () => {
    const store = getDashboards()
    setDashboards(store.dashboards)
    setActiveDashboardIdState(store.activeDashboardId)
  }

  const handleCreateDashboard = () => {
    try {
      setError(null)
      
      if (!formData.name.trim()) {
        setError('Dashboard name is required')
        return
      }

      const newDashboard = createDashboard({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        settings: {
          limit: formData.limit,
          layout: formData.layout,
          filters: {},
        }
      })

      loadDashboards()
      setShowCreateForm(false)
      resetForm()
      
      // Notify parent of change
      if (onDashboardChange) {
        onDashboardChange(newDashboard)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dashboard')
    }
  }

  const handleUpdateDashboard = (id: string) => {
    try {
      setError(null)
      
      if (!formData.name.trim()) {
        setError('Dashboard name is required')
        return
      }

      updateDashboard(id, {
        name: formData.name,
        description: formData.description,
        settings: {
          limit: formData.limit,
          layout: formData.layout,
        }
      })

      loadDashboards()
      setEditingId(null)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dashboard')
    }
  }

  const handleDeleteDashboard = (id: string) => {
    try {
      setError(null)
      deleteDashboard(id)
      loadDashboards()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dashboard')
    }
  }

  const handleSetActive = (dashboard: DashboardConfig) => {
    setActiveDashboard(dashboard.id)
    setActiveDashboardIdState(dashboard.id)
    
    if (onDashboardChange) {
      onDashboardChange(dashboard)
    }
  }

  const startEdit = (dashboard: DashboardConfig) => {
    setEditingId(dashboard.id)
    setFormData({
      name: dashboard.name,
      description: dashboard.description || '',
      type: dashboard.type,
      limit: dashboard.settings.limit || 50,
      layout: dashboard.settings.layout || 'grid',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'ritms',
      limit: 50,
      layout: 'grid',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Manager</h2>
          <p className="text-muted-foreground mt-1">Create and manage your custom dashboards</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Dashboard
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Create Dashboard Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Dashboard</CardTitle>
            <CardDescription>Configure your new testing dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dashboard Name</Label>
              <Input
                id="name"
                placeholder="e.g., Test Dashboard 1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What is this dashboard for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Dashboard Type</Label>
                <select
                  id="type"
                  className="w-full border border-input rounded-md px-3 py-2 bg-background"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="ritms">Request Items (RITMs)</option>
                  <option value="incidents">Incidents</option>
                  <option value="users">Users</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Items Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 50 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="layout">Layout</Label>
              <select
                id="layout"
                className="w-full border border-input rounded-md px-3 py-2 bg-background"
                value={formData.layout}
                onChange={(e) => setFormData({ ...formData, layout: e.target.value as any })}
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="table">Table</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateDashboard}>
                Create Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Dashboards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Dashboards</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((dashboard) => (
            <Card 
              key={dashboard.id}
              className={`relative ${
                activeDashboardId === dashboard.id 
                  ? 'ring-2 ring-primary' 
                  : ''
              }`}
            >
              {editingId === dashboard.id ? (
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Dashboard Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => handleUpdateDashboard(dashboard.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                      </div>
                      {activeDashboardId === dashboard.id && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    {dashboard.description && (
                      <CardDescription>{dashboard.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium capitalize">{dashboard.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Limit:</span>
                        <span className="font-medium">{dashboard.settings.limit || 50} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Layout:</span>
                        <span className="font-medium capitalize">{dashboard.settings.layout || 'grid'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {activeDashboardId !== dashboard.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleSetActive(dashboard)}
                        >
                          Set Active
                        </Button>
                      )}
                      {dashboard.id !== DEFAULT_DASHBOARD.id && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(dashboard)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDashboard(dashboard.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

