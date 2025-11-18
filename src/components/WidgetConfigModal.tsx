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
import {
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingUp,
  Settings,
  X,
  Plus
} from 'lucide-react'
import { Widget, WidgetType, ChartType, DataSource } from '@/types/widget'

interface WidgetConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (widget: Partial<Widget>) => void
  widget?: Widget | null
}

export function WidgetConfigModal({
  open,
  onOpenChange,
  onSave,
  widget
}: WidgetConfigModalProps) {
  const [formData, setFormData] = useState({
    type: 'chart' as WidgetType,
    title: '',
    dataSource: 'ritms' as DataSource,
    chartType: 'pie' as ChartType,
    limit: 100,
    groupBy: 'state',
    sortBy: 'created_on',
    sortOrder: 'desc' as 'asc' | 'desc',
    refreshInterval: 0,
  })

  const [filters, setFilters] = useState<Array<{ key: string; value: string }>>([])

  useEffect(() => {
    if (open && widget) {
      setFormData({
        type: widget.type,
        title: widget.title,
        dataSource: widget.config.dataSource,
        chartType: widget.config.chartType || 'pie',
        limit: widget.config.limit || 100,
        groupBy: widget.config.groupBy || 'state',
        sortBy: widget.config.sortBy || 'created_on',
        sortOrder: widget.config.sortOrder || 'desc',
        refreshInterval: widget.config.refreshInterval || 0,
      })
      
      const filterArray = Object.entries(widget.config.filters || {}).map(
        ([key, value]) => ({ key, value })
      )
      setFilters(filterArray)
    } else if (open && !widget) {
      // Reset for new widget
      setFormData({
        type: 'chart',
        title: '',
        dataSource: 'ritms',
        chartType: 'pie',
        limit: 100,
        groupBy: 'state',
        sortBy: 'created_on',
        sortOrder: 'desc',
        refreshInterval: 0,
      })
      setFilters([])
    }
  }, [open, widget])

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

  const handleSave = () => {
    const filtersObject: Record<string, string> = {}
    filters.forEach(filter => {
      if (filter.key.trim() && filter.value.trim()) {
        filtersObject[filter.key.trim()] = filter.value.trim()
      }
    })

    const widgetData: Partial<Widget> = {
      id: widget?.id,
      type: formData.type,
      title: formData.title || 'Untitled Widget',
      config: {
        dataSource: formData.dataSource,
        chartType: formData.chartType,
        limit: formData.limit,
        groupBy: formData.groupBy,
        sortBy: formData.sortBy,
        sortOrder: formData.sortOrder,
        refreshInterval: formData.refreshInterval,
        filters: filtersObject,
      },
      position: widget?.position || { x: 0, y: 0, w: 6, h: 4 }
    }

    onSave(widgetData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            {widget ? 'Configure Widget' : 'Add Chart Widget'}
          </DialogTitle>
          <DialogDescription>
            Configure your chart widget settings, data source, and display options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Widget Title */}
          <div className="space-y-2">
            <Label>Widget Title *</Label>
            <Input
              placeholder="e.g., Priority Breakdown"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Data Source */}
          <div className="space-y-2">
            <Label>Data Source</Label>
            <select
              value={formData.dataSource}
              onChange={(e) => setFormData({ ...formData, dataSource: e.target.value as DataSource })}
              className="w-full h-10 px-3 text-sm border rounded-md"
            >
              <option value="ritms">Request Items (RITMs)</option>
              <option value="incidents">Incidents</option>
              <option value="users">Users</option>
            </select>
          </div>

          {/* Chart Type */}
          <div className="space-y-3">
            <Label>Chart Type</Label>
            <div className="grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, chartType: 'pie' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.chartType === 'pie'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <PieChartIcon className={`h-6 w-6 mx-auto mb-2 ${
                  formData.chartType === 'pie' ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <p className="text-xs font-medium">Pie</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, chartType: 'donut' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.chartType === 'donut'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <PieChartIcon className={`h-6 w-6 mx-auto mb-2 ${
                  formData.chartType === 'donut' ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <p className="text-xs font-medium">Donut</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, chartType: 'bar' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.chartType === 'bar'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <BarChart3 className={`h-6 w-6 mx-auto mb-2 ${
                  formData.chartType === 'bar' ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <p className="text-xs font-medium">Bar</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, chartType: 'line' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.chartType === 'line'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <LineChartIcon className={`h-6 w-6 mx-auto mb-2 ${
                  formData.chartType === 'line' ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <p className="text-xs font-medium">Line</p>
              </button>
            </div>
          </div>

          {/* Group By */}
          <div className="space-y-2">
            <Label>Group Data By</Label>
            <select
              value={formData.groupBy}
              onChange={(e) => setFormData({ ...formData, groupBy: e.target.value })}
              className="w-full h-10 px-3 text-sm border rounded-md"
            >
              <option value="state">State/Status</option>
              <option value="priority">Priority</option>
              <option value="assigned_to">Assigned To</option>
              <option value="category">Category</option>
            </select>
            <p className="text-xs text-slate-500">Field to group and count items by</p>
          </div>

          {/* Item Limit */}
          <div className="space-y-2">
            <Label>Data Limit</Label>
            <Input
              type="number"
              min="10"
              max="500"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 100 })}
            />
            <p className="text-xs text-slate-500">Maximum items to fetch (10-500)</p>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Filters (Optional)</Label>
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

            {filters.length > 0 && (
              <div className="space-y-2">
                {filters.map((filter, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Field (e.g., priority)"
                      value={filter.key}
                      onChange={(e) => handleFilterChange(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value (e.g., high)"
                      value={filter.value}
                      onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFilter(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto Refresh */}
          <div className="space-y-2">
            <Label>Auto Refresh</Label>
            <select
              value={formData.refreshInterval}
              onChange={(e) => setFormData({ ...formData, refreshInterval: parseInt(e.target.value) })}
              className="w-full h-10 px-3 text-sm border rounded-md"
            >
              <option value="0">Manual only</option>
              <option value="30">Every 30 seconds</option>
              <option value="60">Every 1 minute</option>
              <option value="300">Every 5 minutes</option>
            </select>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {widget ? 'Update Widget' : 'Add Widget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

