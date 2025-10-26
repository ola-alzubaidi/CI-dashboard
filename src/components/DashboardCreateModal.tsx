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
  Sparkles
} from 'lucide-react'
import { createDashboard, updateDashboard } from '@/lib/dashboardStorage'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (!formData.name.trim()) {
        setError('Dashboard name is required')
        return
      }

      if (editDashboard) {
        // Update existing dashboard
        updateDashboard(editDashboard.id, {
          name: formData.name,
          description: formData.description,
        })
        onSuccess(editDashboard)
      } else {
        // Create new blank dashboard with default settings
        const newDashboard = createDashboard({
          name: formData.name,
          description: formData.description,
          type: 'custom', // Start as custom/blank
          settings: {
            limit: 50,
            layout: 'grid',
            filters: {},
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
              : 'Create a blank dashboard. You can add widgets and customize it after creation.'
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
              />
            </div>

            {!editDashboard && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Blank Dashboard
                    </h4>
                    <p className="text-xs text-blue-700">
                      Your new dashboard will be created empty. After creation, you can add widgets, configure data sources, set filters, and customize the layout directly within the dashboard.
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              {editDashboard ? 'Update' : 'Create Dashboard'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
