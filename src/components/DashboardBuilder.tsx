"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, LayoutDashboard, Share2, Check, Cloud, CloudOff } from 'lucide-react'
import { DashboardConfig } from '@/types/dashboard'
import { Widget, WidgetSize } from '@/types/widget'
import { DraggableWidget } from './DraggableWidget'
import { WidgetConfigModal } from './WidgetConfigModal'
import { saveWidgetsAndSync } from '@/lib/dashboardStorage'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'

interface DashboardBuilderProps {
  dashboard: DashboardConfig
}

const getStorageKey = (dashboardId: string) => `dashboard-widgets-${dashboardId}`

// Using a 12-column grid system for better size differentiation
const getSizeClass = (size?: WidgetSize) => {
  switch (size) {
    case 'small': return 'col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3'  // 1/4 width on large
    case 'medium': return 'col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4' // 1/3 width on large
    case 'large': return 'col-span-12 sm:col-span-12 md:col-span-8 lg:col-span-6' // 1/2 width on large
    case 'full': return 'col-span-12'                                              // full width
    default: return 'col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4'
  }
}

export function DashboardBuilder({ dashboard }: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)
  const [copied, setCopied] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load widgets from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(dashboard.id))
    if (stored) {
      try {
        setWidgets(JSON.parse(stored))
      } catch (e) {
        console.error('Error loading widgets:', e)
      }
    }
  }, [dashboard.id])

  // Save widgets to localStorage and sync to ServiceNow
  const saveWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets)
    localStorage.setItem(getStorageKey(dashboard.id), JSON.stringify(newWidgets))
    
    // Sync to ServiceNow
    setSyncStatus('saving')
    saveWidgetsAndSync(dashboard.id, newWidgets)
    
    // Show saved status briefly
    setTimeout(() => {
      setSyncStatus('saved')
      setTimeout(() => setSyncStatus('idle'), 2000)
    }, 500)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id)
      const newIndex = widgets.findIndex((w) => w.id === over.id)
      
      const newWidgets = arrayMove(widgets, oldIndex, newIndex)
      saveWidgets(newWidgets)
    }
  }

  const handleAddWidget = () => {
    setEditingWidget(null)
    setShowConfigModal(true)
  }

  const handleConfigureWidget = (id: string) => {
    const widget = widgets.find(w => w.id === id)
    if (widget) {
      setEditingWidget(widget)
      setShowConfigModal(true)
    }
  }

  const handleSaveWidget = (config: Partial<Widget>) => {
    if (editingWidget) {
      const updated = widgets.map(w =>
        w.id === editingWidget.id
          ? { ...w, ...config }
          : w
      )
      saveWidgets(updated)
    } else {
      const newWidget: Widget = {
        id: `widget-${Date.now()}`,
        type: config.type || 'chart',
        title: config.title || 'New Widget',
        dataSource: config.dataSource || 'sc_req_item',
        size: config.size || 'medium',
        chartType: config.chartType,
        groupBy: config.groupBy,
        layout: config.layout,
        filter: config.filter,
        limit: config.limit,
      }
      saveWidgets([...widgets, newWidget])
    }
  }

  const handleDeleteWidget = (id: string) => {
    if (window.confirm('Delete this widget?')) {
      saveWidgets(widgets.filter(w => w.id !== id))
    }
  }

  const handleSizeChange = (id: string, size: WidgetSize) => {
    const updated = widgets.map(w =>
      w.id === id ? { ...w, size } : w
    )
    saveWidgets(updated)
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: dashboard.name,
          text: dashboard.description || `Check out this dashboard: ${dashboard.name}`,
          url: shareUrl,
        })
        return
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
      }
    }
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-4 min-h-screen p-4">
      {/* Header */}
      <div className="border rounded-lg p-6 shadow-sm bg-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">
                {dashboard.name}
              </h2>
              {/* Sync Status Indicator */}
              {syncStatus === 'saving' && (
                <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <Cloud className="h-3 w-3 animate-pulse" />
                  Saving...
                </span>
              )}
              {syncStatus === 'saved' && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <Check className="h-3 w-3" />
                  Saved to ServiceNow
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <CloudOff className="h-3 w-3" />
                  Sync failed
                </span>
              )}
            </div>
            {dashboard.description && (
              <p className="mt-1 text-slate-600">
                {dashboard.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleShare}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              )}
            </Button>
            <Button
              onClick={handleAddWidget}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </div>
        </div>
      </div>

      {/* Widgets Grid with Drag & Drop */}
      {widgets.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center bg-white">
          <div className="max-w-md mx-auto">
            <div className="inline-flex p-4 rounded-full mb-4 bg-slate-100">
              <LayoutDashboard className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900">
              No Widgets Yet
            </h3>
            <p className="text-slate-600">
              Click the &quot;Add Widget&quot; button above to add charts, tables, metrics, and lists!
            </p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-12 gap-4">
              {widgets.map((widget) => (
                <div key={widget.id} className={getSizeClass(widget.size)}>
                  <DraggableWidget
                    widget={widget}
                    onConfigure={handleConfigureWidget}
                    onDelete={handleDeleteWidget}
                    onSizeChange={handleSizeChange}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Configuration Modal */}
      <WidgetConfigModal
        open={showConfigModal}
        onOpenChange={setShowConfigModal}
        onSave={handleSaveWidget}
        widget={editingWidget}
      />
    </div>
  )
}
