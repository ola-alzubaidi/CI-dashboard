"use client"

import { useState, useEffect, useCallback } from 'react'
import { Widget } from '@/types/widget'
import { RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface TableWidgetProps {
  widget: Widget
}

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case '1':
    case 'critical':
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200'
    case '2':
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case '3':
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const getStateColor = (state: string) => {
  const stateLower = state?.toLowerCase() || ''
  if (stateLower.includes('open') || stateLower.includes('new')) {
    return 'bg-blue-100 text-blue-700'
  } else if (stateLower.includes('progress') || stateLower.includes('pending')) {
    return 'bg-yellow-100 text-yellow-700'
  } else if (stateLower.includes('closed') || stateLower.includes('resolved')) {
    return 'bg-green-100 text-green-700'
  }
  return 'bg-slate-100 text-slate-700'
}

export function TableWidget({ widget }: TableWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const layout = widget.layout || 'table'

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
      
      console.log(`[TableWidget] Fetching from /api/servicenow/${widget.dataSource}?${params}`)
      
      const response = await fetch(`/api/servicenow/${widget.dataSource}?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch: ${response.status}`)
      }
      
      const result = await response.json()
      console.log(`[TableWidget] Received ${result.data?.length || 0} records from ${widget.dataSource}`)
      setData(result.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      console.error('[TableWidget] Error:', errorMessage)
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
        No records found for {widget.dataSource}
      </div>
    )
  }

  // Card Layout
  if (layout === 'card') {
    return (
      <div className="space-y-3 max-h-[350px] overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.map((row, idx) => (
            <Card key={row.sys_id || idx} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-blue-600">{row.number || `#${idx + 1}`}</span>
                  {row.priority && (
                    <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(row.priority)}`}>
                      P{row.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 line-clamp-2 mb-2">
                  {row.short_description || row.description || '-'}
                </p>
                <div className="flex justify-between items-center text-xs">
                  {row.state && (
                    <span className={`px-2 py-0.5 rounded ${getStateColor(row.state)}`}>
                      {row.state}
                    </span>
                  )}
                  {row.assigned_to && (
                    <span className="text-slate-500">{row.assigned_to}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center py-2 text-xs text-slate-500">
          Showing {data.length} records
        </div>
      </div>
    )
  }

  // List Layout
  if (layout === 'list') {
    return (
      <div className="space-y-2 max-h-[350px] overflow-auto">
        {data.map((row, idx) => (
          <div 
            key={row.sys_id || idx} 
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-blue-600">{row.number || `#${idx + 1}`}</span>
                {row.priority && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(row.priority)}`}>
                    P{row.priority}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 truncate">{row.short_description || '-'}</p>
            </div>
            {row.state && (
              <span className={`text-xs px-2 py-1 rounded ${getStateColor(row.state)}`}>
                {row.state}
              </span>
            )}
          </div>
        ))}
        <div className="text-center py-2 text-xs text-slate-500">
          Showing {data.length} records
        </div>
      </div>
    )
  }

  // Compact Layout
  if (layout === 'compact') {
    return (
      <div className="space-y-1 max-h-[350px] overflow-auto">
        {data.map((row, idx) => (
          <div 
            key={row.sys_id || idx} 
            className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 rounded text-sm"
          >
            <span className="font-medium text-blue-600 w-24 flex-shrink-0">{row.number || `#${idx + 1}`}</span>
            <span className="flex-1 truncate text-slate-600">{row.short_description || '-'}</span>
            {row.state && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${getStateColor(row.state)}`}>
                {row.state}
              </span>
            )}
          </div>
        ))}
        <div className="text-center py-2 text-xs text-slate-500">
          {data.length} records
        </div>
      </div>
    )
  }

  // Default Table Layout
  const columns = ['number', 'short_description', 'state', 'priority']

  return (
    <div className="overflow-auto max-h-[350px]">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 sticky top-0">
          <tr>
            {columns.map((col) => (
              <th key={col} className="text-left p-2 font-medium text-slate-700 border-b">
                {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.sys_id || idx} className="hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col} className="p-2 border-b border-slate-100 truncate max-w-[200px]">
                  {col === 'priority' && row[col] ? (
                    <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(row[col])}`}>
                      P{row[col]}
                    </span>
                  ) : col === 'state' && row[col] ? (
                    <span className={`text-xs px-2 py-0.5 rounded ${getStateColor(row[col])}`}>
                      {row[col]}
                    </span>
                  ) : (
                    row[col]?.toString() || '-'
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-center py-2 text-xs text-slate-500">
        Showing {data.length} records
      </div>
    </div>
  )
}
