"use client"

import { useState, useEffect, useCallback } from 'react'
import { Widget } from '@/types/widget'
import { RefreshCw, Circle } from 'lucide-react'

interface ListWidgetProps {
  widget: Widget
}

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case '1':
    case 'critical':
    case 'high':
      return 'text-red-500'
    case '2':
    case 'medium':
      return 'text-yellow-500'
    case '3':
    case 'low':
      return 'text-green-500'
    default:
      return 'text-slate-400'
  }
}

export function ListWidget({ widget }: ListWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: String(widget.limit || 10),
      })
      if (widget.filter) {
        params.append('query', widget.filter)
      }
      
      console.log(`[ListWidget] Fetching from /api/servicenow/${widget.dataSource}?${params}`)
      
      const response = await fetch(`/api/servicenow/${widget.dataSource}?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch: ${response.status}`)
      }
      
      const result = await response.json()
      console.log(`[ListWidget] Received ${result.data?.length || 0} records from ${widget.dataSource}`)
      setData(result.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      console.error('[ListWidget] Error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [widget.dataSource, widget.filter, widget.limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-red-500 p-4 text-center">
        <p className="font-medium">Error loading data</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-3 text-xs text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-slate-500">
        No items found for {widget.dataSource}
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-auto">
      {data.map((item, idx) => (
        <div 
          key={item.sys_id || idx} 
          className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Circle className={`h-3 w-3 mt-1.5 fill-current ${getPriorityColor(item.priority)}`} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {item.number || item.user_name || `Item ${idx + 1}`}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {item.short_description || item.email || item.state || '-'}
            </div>
          </div>
          {item.state && (
            <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">
              {item.state}
            </span>
          )}
        </div>
      ))}
      <div className="text-center py-2 text-xs text-slate-500">
        Showing {data.length} items
      </div>
    </div>
  )
}

