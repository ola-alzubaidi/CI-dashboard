"use client"

import { useState, useEffect } from 'react'
import { Widget } from '@/types/widget'
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

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(widget.limit || 100),
        ...(widget.filter && { query: widget.filter }),
      })
      
      const response = await fetch(`/api/servicenow/${widget.dataSource}?${params}`)
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      const records = result.data || []

      // Group data by the selected field
      const grouped = records.reduce((acc: any, record: any) => {
        const key = record[widget.groupBy || 'state']?.toString() || 'Unknown'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      const chartData = Object.entries(grouped).map(([name, value]) => ({
        name,
        value
      }))

      setData(chartData)
      setTotal(records.length)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [widget])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-slate-500">
        No data available
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

