"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, RefreshCw, Trash2 } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'

interface ChartConfig {
  id: string
  title: string
  groupBy: 'state' | 'priority' | 'assigned_to'
}

interface SimpleChartProps {
  config: ChartConfig
  onConfigure: (id: string) => void
  onDelete: (id: string) => void
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57']

export function SimpleChart({ config, onConfigure, onDelete }: SimpleChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ritms?limit=100')
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      const ritms = result.ritms || []

      // Group data by the selected field
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
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{config.title}</CardTitle>
        <div className="flex gap-2">
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-slate-500">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}

