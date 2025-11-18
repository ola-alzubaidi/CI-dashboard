"use client"

import { useState, useEffect } from 'react'
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

interface ChartConfig {
  id: string
  title: string
  groupBy: 'state' | 'priority' | 'assigned_to'
}

interface ChartConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (config: Partial<ChartConfig>) => void
  config?: ChartConfig | null
}

export function ChartConfigModal({
  open,
  onOpenChange,
  onSave,
  config
}: ChartConfigModalProps) {
  const [title, setTitle] = useState('')
  const [groupBy, setGroupBy] = useState<'state' | 'priority' | 'assigned_to'>('state')

  useEffect(() => {
    if (open && config) {
      setTitle(config.title)
      setGroupBy(config.groupBy)
    } else if (open && !config) {
      setTitle('')
      setGroupBy('state')
    }
  }, [open, config])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ title, groupBy })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{config ? 'Edit Chart' : 'Add Chart'}</DialogTitle>
          <DialogDescription>
            Configure your donut chart to visualize RITM data
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Chart Title</Label>
            <Input
              id="title"
              placeholder="e.g., RITMs by State"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupBy">Group By</Label>
            <select
              id="groupBy"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-background"
            >
              <option value="state">State</option>
              <option value="priority">Priority</option>
              <option value="assigned_to">Assigned To</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {config ? 'Update Chart' : 'Add Chart'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

