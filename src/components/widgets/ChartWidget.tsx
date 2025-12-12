"use client"

import { useState, useEffect, useCallback } from 'react'
import { Widget } from '@/types/widget'

// Helper to safely get display value from ServiceNow fields
// ServiceNow can return objects like {link: "...", value: "..."} for reference fields
const getDisplayValue = (value: any): string => {
  if (value === null || value === undefined) return 'Unknown'
  if (typeof value === 'object') {
    // Handle ServiceNow reference objects {link, value} or {display_value, value}
    return value.display_value || value.value || value.name || JSON.stringify(value)
  }
  return String(value)
}
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'
import { RefreshCw } from 'lucide-react'

interface ChartWidgetProps {
  widget: Widget
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57']

export function ChartWidget({ widget }: ChartWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: String(widget.limit || 100),
      })
      if (widget.filter) {
        params.append('query', widget.filter)
      }
      
      console.log(`[ChartWidget] Fetching from /api/servicenow/${widget.dataSource}?${params}`)
      
      const response = await fetch(`/api/servicenow/${widget.dataSource}?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('Session expired. Please sign in again.')
        }
        throw new Error(errorData.details || errorData.error || `Failed to fetch: ${response.status}`)
      }
      
      const result = await response.json()
      console.log(`[ChartWidget] Received ${result.data?.length || 0} records from ${widget.dataSource}`)
      
      const records = result.data || []

      // Group data by the selected field
      const grouped = records.reduce((acc: any, record: any) => {
        const rawValue = record[widget.groupBy || 'state']
        const key = getDisplayValue(rawValue)
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      const chartData = Object.entries(grouped).map(([name, value]) => ({
        name,
        value
      }))

      setData(chartData)
      setTotal(records.length)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      console.error('[ChartWidget] Error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [widget.dataSource, widget.filter, widget.limit, widget.groupBy])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    const isSessionError = error.includes('Session expired') || error.includes('sign in')
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-red-500 p-4 text-center">
        <p className="font-medium">Error loading data</p>
        <p className="text-sm mt-1">{error}</p>
        {isSessionError ? (
          <a 
            href="/auth/signin"
            className="mt-3 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            Sign in again
          </a>
        ) : (
          <button 
            onClick={fetchData}
            className="mt-3 text-xs text-blue-600 hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-slate-500">
        No data available for {widget.dataSource}
      </div>
    )
  }

  const renderChart = () => {
    switch (widget.chartType) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              label={({ name }) => name}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )
      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0088FE" />
          </BarChart>
        )
      
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#0088FE" strokeWidth={2} />
          </LineChart>
        )
      
      case 'donut':
      default:
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              label={({ name }) => name}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )
    }
  }

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={260}>
        {renderChart()}
      </ResponsiveContainer>
      <div className="text-center pt-2 border-t">
        <p className="text-sm text-slate-600">
          Total: <span className="font-semibold text-slate-900">{total}</span>
        </p>
      </div>
    </div>
  )
}

