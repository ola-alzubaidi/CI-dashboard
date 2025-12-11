"use client"

import { useState, useEffect } from 'react'
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

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(widget.limit || 10),
        ...(widget.filter && { query: widget.filter }),
      })
      
      const response = await fetch(`/api/servicenow/${widget.dataSource}?${params}`)
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      setData(result.data || [])
    } catch (error) {
      console.error('Error fetching list data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [widget])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-slate-500">
        No items found
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

