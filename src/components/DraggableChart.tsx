"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, RefreshCw, Trash2, GripVertical } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { useState, useEffect } from 'react'

interface ChartConfig {
  id: string
  title: string
  groupBy: 'state' | 'priority' | 'assigned_to'
}

interface DraggableChartProps {
  config: ChartConfig
  onConfigure: (id: string) => void
  onDelete: (id: string) => void
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57']

export function DraggableChart({ config, onConfigure, onDelete }: DraggableChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: config.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ritms?limit=100')
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      const ritms = result.ritms || []

      const grouped = ritms.reduce((acc: any, ritm: any) => {
        const key = ritm[config.groupBy]?.toString() || 'Unknown'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      const chartData = Object.entries(grouped).map(([name, value]) => ({
        name,
        value
      }))

      setData(chartData)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [config.groupBy])

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`shadow-lg ${isDragging ? 'shadow-2xl ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
              title="Drag to reorder"
            >
              <GripVertical className="h-5 w-5 text-slate-400" />
            </button>
            <CardTitle className="text-lg font-semibold">{config.title}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchData()}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onConfigure(config.id)}
              title="Configure"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(config.id)}
              title="Delete"
              className="text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : data.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center pt-2 border-t">
                <p className="text-sm text-slate-600">
                  Total RITMs: <span className="font-semibold text-slate-900">{data.reduce((sum, item) => sum + item.value, 0)}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

