"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, LayoutDashboard, Move } from 'lucide-react'
import { DashboardConfig } from '@/types/dashboard'
import { DraggableChart } from './DraggableChart'
import { ChartConfigModal } from './ChartConfigModal'
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

interface ChartConfig {
  id: string
  title: string
  groupBy: 'state' | 'priority' | 'assigned_to'
}

interface DashboardBuilderProps {
  dashboard: DashboardConfig
}

const getStorageKey = (dashboardId: string) => `dashboard-charts-${dashboardId}`

export function DashboardBuilder({ dashboard }: DashboardBuilderProps) {
  const [charts, setCharts] = useState<ChartConfig[]>([])
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null)

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

  // Load charts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(dashboard.id))
    if (stored) {
      try {
        setCharts(JSON.parse(stored))
      } catch (e) {
        console.error('Error loading charts:', e)
      }
    }
  }, [dashboard.id])

  // Save charts to localStorage
  const saveCharts = (newCharts: ChartConfig[]) => {
    setCharts(newCharts)
    localStorage.setItem(getStorageKey(dashboard.id), JSON.stringify(newCharts))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = charts.findIndex((chart) => chart.id === active.id)
      const newIndex = charts.findIndex((chart) => chart.id === over.id)
      
      const newCharts = arrayMove(charts, oldIndex, newIndex)
      saveCharts(newCharts)
    }
  }

  const handleAddChart = () => {
    setEditingChart(null)
    setShowConfigModal(true)
  }

  const handleConfigureChart = (id: string) => {
    const chart = charts.find(c => c.id === id)
    if (chart) {
      setEditingChart(chart)
      setShowConfigModal(true)
    }
  }

  const handleSaveChart = (config: Partial<ChartConfig>) => {
    if (editingChart) {
      const updated = charts.map(c =>
        c.id === editingChart.id
          ? { ...c, ...config }
          : c
      )
      saveCharts(updated)
    } else {
      const newChart: ChartConfig = {
        id: `chart-${Date.now()}`,
        title: config.title || 'New Chart',
        groupBy: config.groupBy || 'state'
      }
      saveCharts([...charts, newChart])
    }
  }

  const handleDeleteChart = (id: string) => {
    if (window.confirm('Delete this chart?')) {
      saveCharts(charts.filter(c => c.id !== id))
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
            {charts.length > 0 && (
              <div className="flex items-center gap-2 mt-3 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                <Move className="h-4 w-4" />
                <span>Drag charts by the grip handle to reorder</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleAddChart}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Chart
          </Button>
        </div>
      </div>

      {/* Charts Grid with Drag & Drop */}
      {charts.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
              <LayoutDashboard className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Charts Yet
            </h3>
            <p className="text-slate-600 mb-6">
              Add your first chart to visualize your RITM data. You can drag and drop to rearrange them!
            </p>
            <Button onClick={handleAddChart} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Chart
            </Button>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={charts.map(c => c.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-6 md:grid-cols-2">
              {charts.map((chart) => (
                <DraggableChart
                  key={chart.id}
                  config={chart}
                  onConfigure={handleConfigureChart}
                  onDelete={handleDeleteChart}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Configuration Modal */}
      <ChartConfigModal
        open={showConfigModal}
        onOpenChange={setShowConfigModal}
        onSave={handleSaveChart}
        config={editingChart}
      />
    </div>
  )
}
