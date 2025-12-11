"use client"

import { useState, useEffect } from 'react'
import { Widget, DATA_SOURCE_LABELS } from '@/types/widget'
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricWidgetProps {
  widget: Widget
}

export function MetricWidget({ widget }: MetricWidgetProps) {
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '1000',
        ...(widget.filter && { query: widget.filter }),
      })
      
      const response = await fetch(`/api/servicenow/${widget.dataSource}?${params}`)
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      const records = result.data || []
      setCount(records.length)
    } catch (error) {
      console.error('Error fetching metric data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [widget])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[150px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-[150px] space-y-2">
      <div className="text-5xl font-bold text-blue-600">
        {count.toLocaleString()}
      </div>
      <div className="text-sm text-slate-500">
        {DATA_SOURCE_LABELS[widget.dataSource]}
      </div>
      {widget.filter && (
        <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
          Filtered: {widget.filter}
        </div>
      )}
    </div>
  )
}

