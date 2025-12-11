"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, LayoutDashboard, Move } from 'lucide-react'
import { DashboardConfig } from '@/types/dashboard'
import { Widget } from '@/types/widget'
import { DraggableWidget } from './DraggableWidget'
import { WidgetConfigModal } from './WidgetConfigModal'
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

export function DashboardBuilder({ dashboard }: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)

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

  // Save widgets to localStorage
  const saveWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets)
    localStorage.setItem(getStorageKey(dashboard.id), JSON.stringify(newWidgets))
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
        chartType: config.chartType,
        groupBy: config.groupBy,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{dashboard.name}</h2>
            {dashboard.description && (
              <p className="text-slate-600 mt-1">{dashboard.description}</p>
            )}
            {widgets.length > 0 && (
              <div className="flex items-center gap-2 mt-3 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                <Move className="h-4 w-4" />
                <span>Drag widgets by the grip handle to reorder</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleAddWidget}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* Widgets Grid with Drag & Drop */}
      {widgets.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
              <LayoutDashboard className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Widgets Yet
            </h3>
            <p className="text-slate-600 mb-6">
              Add widgets to visualize your ServiceNow data. Choose from charts, tables, metrics, and lists!
            </p>
            <Button onClick={handleAddWidget} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Widget
            </Button>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-6 md:grid-cols-2">
              {widgets.map((widget) => (
                <DraggableWidget
                  key={widget.id}
                  widget={widget}
                  onConfigure={handleConfigureWidget}
                  onDelete={handleDeleteWidget}
                />
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
