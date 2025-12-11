"use client"

import { useState, useEffect } from 'react'
import { Widget, DATA_SOURCE_FIELDS } from '@/types/widget'
import { RefreshCw } from 'lucide-react'

interface TableWidgetProps {
  widget: Widget
}

export function TableWidget({ widget }: TableWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const columns = widget.columns || ['number', 'short_description', 'state', 'priority']

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
      console.error('Error fetching table data:', error)
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
        No records found
      </div>
    )
  }

  return (
    <div className="overflow-auto max-h-[300px]">
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
                  {row[col]?.toString() || '-'}
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

