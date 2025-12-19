"use client"

import { useState, useEffect, useCallback } from 'react'
import { Widget } from '@/types/widget'
import { RefreshCw, Circle, ExternalLink } from 'lucide-react'

// Helper to safely get display value from ServiceNow fields
const getDisplayValue = (value: any): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    return value.display_value || value.value || value.name || ''
  }
  return String(value)
}

// Map data source to ServiceNow table name
const getTableName = (dataSource: string): string => {
  const tableMap: Record<string, string> = {
    'sc_req_item': 'sc_req_item',
    'incident': 'incident',
    'change_request': 'change_request',
    'problem': 'problem',
    'task': 'task',
    'sys_user': 'sys_user',
  }
  return tableMap[dataSource] || dataSource
}

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
  const [instanceUrl, setInstanceUrl] = useState<string>('')

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
      
      const response = await fetch(`/api/servicenow/${widget.dataSource}?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('Session expired. Please sign in again.')
        }
        throw new Error(errorData.details || errorData.error || `Failed to fetch: ${response.status}`)
      }
      
      const result = await response.json()
      setData(result.data || [])
      if (result.instanceUrl) {
        setInstanceUrl(result.instanceUrl)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [widget.dataSource, widget.filter, widget.limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Generate ServiceNow URL for a record
  const getServiceNowUrl = (sysId: string) => {
    if (!instanceUrl || !sysId) return null
    const tableName = getTableName(widget.dataSource)
    return `${instanceUrl}/nav_to.do?uri=${tableName}.do?sys_id=${sysId}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    const isSessionError = error.includes('Session expired') || error.includes('sign in')
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-red-500 p-4 text-center">
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
      <div className="flex items-center justify-center h-[200px] text-slate-500">
        No items found for {widget.dataSource}
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-auto">
      {data.map((item, idx) => {
        const serviceNowUrl = getServiceNowUrl(item.sys_id)
        const displayNumber = getDisplayValue(item.number) || getDisplayValue(item.user_name) || `Item ${idx + 1}`
        
        return (
          <div 
            key={item.sys_id || idx} 
            className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Circle className={`h-3 w-3 mt-1.5 fill-current ${getPriorityColor(getDisplayValue(item.priority))}`} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {serviceNowUrl ? (
                  <a
                    href={serviceNowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 group"
                    title="Open in ServiceNow"
                  >
                    {displayNumber}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                ) : (
                  displayNumber
                )}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {getDisplayValue(item.short_description) || getDisplayValue(item.email) || getDisplayValue(item.state) || '-'}
              </div>
            </div>
            {item.state && (
              <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">
                {getDisplayValue(item.state)}
              </span>
            )}
          </div>
        )
      })}
      <div className="text-center py-2 text-xs text-slate-500">
        Showing {data.length} items
      </div>
    </div>
  )
}
