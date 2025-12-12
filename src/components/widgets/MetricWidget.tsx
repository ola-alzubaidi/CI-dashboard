"use client"

import { useState, useEffect, useCallback } from 'react'
import { Widget, DATA_SOURCE_LABELS } from '@/types/widget'
import { RefreshCw } from 'lucide-react'

interface MetricWidgetProps {
  widget: Widget
}

export function MetricWidget({ widget }: MetricWidgetProps) {
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: '1000',
      })
      if (widget.filter) {
        params.append('query', widget.filter)
      }
      
      console.log(`[MetricWidget] Fetching from /api/servicenow/${widget.dataSource}?${params}`)
      
      const response = await fetch(`/api/servicenow/${widget.dataSource}?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('Session expired. Please sign in again.')
        }
        throw new Error(errorData.details || errorData.error || `Failed to fetch: ${response.status}`)
      }
      
      const result = await response.json()
      console.log(`[MetricWidget] Received ${result.data?.length || 0} records from ${widget.dataSource}`)
      const records = result.data || []
      setCount(records.length)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      console.error('[MetricWidget] Error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [widget.dataSource, widget.filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[150px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    const isSessionError = error.includes('Session expired') || error.includes('sign in')
    return (
      <div className="flex flex-col items-center justify-center h-[150px] text-red-500 p-4 text-center">
        <p className="font-medium text-sm">Error</p>
        <p className="text-xs mt-1">{error}</p>
        {isSessionError ? (
          <a 
            href="/auth/signin"
            className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            Sign in
          </a>
        ) : (
          <button 
            onClick={fetchData}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Retry
          </button>
        )}
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

