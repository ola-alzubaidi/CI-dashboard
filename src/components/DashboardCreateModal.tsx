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
  Sparkles,
  Loader2
} from 'lucide-react'
import { DashboardConfig } from '@/types/dashboard'

interface DashboardCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (dashboard: DashboardConfig) => void
  editDashboard?: DashboardConfig | null
}

export function DashboardCreateModal({ 
  open, 
  onOpenChange, 
  onSuccess,
  editDashboard 
}: DashboardCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Reset form when modal opens with a different dashboard
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: editDashboard?.name || '',
        description: editDashboard?.description || '',
      })
      setError(null)
    }
  }, [open, editDashboard])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Dashboard name is required')
      return
    }

    setLoading(true)

    try {
      // Create dashboard in ServiceNow
      const response = await fetch('/api/servicenow/dashboards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create dashboard')
      }

      // Create the dashboard config to pass to onSuccess
      const newDashboard: DashboardConfig = {
        id: data.dashboard.sys_id,
        name: data.dashboard.name,
        description: data.dashboard.description || '',
        type: 'custom',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFromServiceNow: true,
        serviceNowId: data.dashboard.sys_id,
        settings: {
          limit: 50,
          layout: 'grid',
          filters: {},
        }
      }

      onSuccess(newDashboard)
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dashboard')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    })
    setError(null)
  }

  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-blue-50 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-blue-600" />
            </div>
            {editDashboard ? 'Edit Dashboard Info' : 'Create New Dashboard'}
          </DialogTitle>
          <DialogDescription>
            {editDashboard 
              ? 'Update dashboard name and description'
              : 'Create a new dashboard in ServiceNow. You can add widgets and customize it after creation.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Dashboard Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., My Custom Dashboard"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <textarea
                id="description"
                placeholder="Describe what this dashboard is for..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                rows={4}
                disabled={loading}
              />
            </div>

            {!editDashboard && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      ServiceNow Dashboard
                    </h4>
                    <p className="text-xs text-blue-700">
                      Your new dashboard will be created in ServiceNow. After creation, you can add widgets, configure data sources, and customize the layout.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LayoutDashboard className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Creating...' : (editDashboard ? 'Update' : 'Create Dashboard')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
