"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, LayoutDashboard } from 'lucide-react'
import { DashboardConfig } from '@/types/dashboard'
import { SimpleChart } from './SimpleChart'
import { ChartConfigModal } from './ChartConfigModal'

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
      // Update existing chart
      const updated = charts.map(c =>
        c.id === editingChart.id
          ? { ...c, ...config }
          : c
      )
      saveCharts(updated)
    } else {
      // Add new chart
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

      {/* Charts Grid */}
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
              Add your first donut chart to visualize your RITM data. Click the &quot;Add Chart&quot; button above to get started.
            </p>
            <Button onClick={handleAddChart} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Chart
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {charts.map((chart) => (
            <SimpleChart
              key={chart.id}
              config={chart}
              onConfigure={handleConfigureChart}
              onDelete={handleDeleteChart}
            />
          ))}
        </div>
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
