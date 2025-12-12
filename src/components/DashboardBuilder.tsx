"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, LayoutDashboard, Move } from 'lucide-react'
import { DashboardConfig } from '@/types/dashboard'
import { Widget, WidgetSize } from '@/types/widget'
import { DraggableWidget } from './DraggableWidget'
import { WidgetConfigModal } from './WidgetConfigModal'
import { DashboardToolbar } from './DashboardToolbar'
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
const getDarkModeKey = () => 'dashboard-dark-mode'

const getSizeClass = (size?: WidgetSize) => {
  switch (size) {
    case 'small': return 'md:col-span-1'
    case 'large': return 'md:col-span-2 lg:col-span-2'
    case 'full': return 'md:col-span-2 lg:col-span-3'
    case 'medium':
    default: return 'md:col-span-1 lg:col-span-1'
  }
}

export function DashboardBuilder({ dashboard }: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

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
    // Load dark mode preference
    const darkModeStored = localStorage.getItem(getDarkModeKey())
    if (darkModeStored) {
      setDarkMode(darkModeStored === 'true')
    }
  }, [dashboard.id])

  // Save widgets to localStorage
  const saveWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets)
    localStorage.setItem(getStorageKey(dashboard.id), JSON.stringify(newWidgets))
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem(getDarkModeKey(), String(newDarkMode))
  }

  const handleRefreshAll = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

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
        size: 'medium',
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

  const handleSizeChange = (id: string, size: WidgetSize) => {
    const updated = widgets.map(w =>
      w.id === id ? { ...w, size } : w
    )
    saveWidgets(updated)
  }

  return (
    <div className={`space-y-4 min-h-screen p-4 ${darkMode ? 'bg-slate-900' : ''}`}>
      {/* Header */}
      <div className={`border rounded-lg p-6 shadow-sm ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {dashboard.name}
            </h2>
            {dashboard.description && (
              <p className={`mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {dashboard.description}
              </p>
            )}
            {widgets.length > 0 && (
              <div className={`flex items-center gap-2 mt-3 text-sm px-3 py-1.5 rounded-lg w-fit ${
                darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'
              }`}>
                <Move className="h-4 w-4" />
                <span>Drag widgets to reorder • Click ▼ to resize • Click ⛶ for fullscreen</span>
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

      {/* Toolbar */}
      <DashboardToolbar
        onFilterChange={setGlobalFilter}
        onRefreshAll={handleRefreshAll}
        darkMode={darkMode}
        onDarkModeToggle={toggleDarkMode}
      />

      {/* Global Filter Indicator */}
      {globalFilter && (
        <div className={`text-sm px-4 py-2 rounded-lg ${
          darkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-50 text-yellow-700'
        }`}>
          🔍 Global filter applied: <code className="font-mono">{globalFilter}</code>
        </div>
      )}

      {/* Widgets Grid with Drag & Drop */}
      {widgets.length === 0 ? (
        <div className={`border-2 border-dashed rounded-lg p-12 text-center ${
          darkMode ? 'border-slate-700 bg-slate-800/50' : 'bg-white'
        }`}>
          <div className="max-w-md mx-auto">
            <div className={`inline-flex p-4 rounded-full mb-4 ${
              darkMode ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <LayoutDashboard className={`h-8 w-8 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              No Widgets Yet
            </h3>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
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
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" key={refreshKey}>
              {widgets.map((widget) => (
                <div key={widget.id} className={getSizeClass(widget.size)}>
                  <DraggableWidget
                    widget={widget}
                    onConfigure={handleConfigureWidget}
                    onDelete={handleDeleteWidget}
                    onSizeChange={handleSizeChange}
                    darkMode={darkMode}
                    globalFilter={globalFilter}
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
