"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, RefreshCw, Trash2 } from 'lucide-react'
import { Widget } from '@/types/widget'
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from 'recharts'

interface ChartWidgetProps {
  widget: Widget
  onConfigure: (widget: Widget) => void
  onDelete: (widgetId: string) => void
  onRefresh?: (widgetId: string) => void
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export function ChartWidget({ widget, onConfigure, onDelete, onRefresh }: ChartWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [widget.config])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch data based on widget config
      const endpoint = getEndpoint(widget.config.dataSource)
      const response = await fetch(`${endpoint}?limit=${widget.config.limit || 100}`)
      
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      const items = result.ritms || result.incidents || result.users || []
      
      // Transform data for charts based on groupBy
      const transformedData = transformDataForChart(items, widget.config.groupBy || 'state')
      setData(transformedData)
    } catch (error) {
      console.error('Error fetching widget data:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const getEndpoint = (dataSource: string) => {
    switch (dataSource) {
      case 'ritms':
        return '/api/ritms'
      case 'incidents':
        return '/api/servicenow/incidents'
      case 'users':
        return '/api/servicenow/users'
      default:
        return '/api/ritms'
    }
  }

  const transformDataForChart = (items: any[], groupByField: string) => {
    // Group items by the specified field
    const grouped: Record<string, number> = {}
    
    items.forEach(item => {
      const key = item[groupByField] || 'Unknown'
      grouped[key] = (grouped[key] || 0) + 1
    })

    // Convert to array format for recharts
    return Object.entries(grouped).map(([name, value]) => ({
      name: String(name),
      value: value,
      count: value
    }))
  }

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <p>No data available</p>
        </div>
      )
    }

    switch (widget.config.chartType) {
      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                innerRadius={widget.config.chartType === 'donut' ? 40 : 0}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Count" />
            </LineChart>
          </ResponsiveContainer>
        )

      default:
        return <p>Unsupported chart type</p>
    }
  }

  return (
    <Card className="relative group shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{widget.title}</CardTitle>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fetchData()}
              className="h-8 w-8 p-0"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onConfigure(widget)}
              className="h-8 w-8 p-0"
              title="Configure"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(widget.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {widget.config.dataSource.toUpperCase()} • {widget.config.chartType?.toUpperCase()}
        </p>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}

