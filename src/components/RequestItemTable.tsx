"use client"

import { ServiceNowRecord } from "@/lib/servicenow"
import { 
  User, 
  FileText
} from "lucide-react"

interface RequestItemTableProps {
  requestItems: ServiceNowRecord[]
}

export function RequestItemTable({ requestItems }: RequestItemTableProps) {
  const getPriorityBadge = (priority: string) => {
    const p = priority?.toLowerCase()
    if (p === '1' || p === 'critical') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
        Critical
      </span>
    }
    if (p === '2' || p === 'high') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-300">
        High
      </span>
    }
    if (p === '3' || p === 'medium') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
        Medium
      </span>
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
      Low
    </span>
  }

  const getStateBadge = (state: string) => {
    const s = state?.toLowerCase()
    if (s === 'new' || s === '1') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
        New
      </span>
    }
    if (s === 'in progress' || s === 'assigned' || s === '2' || s === '3') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-300 whitespace-nowrap">
        In Progress
      </span>
    }
    if (s === 'resolved' || s === '4') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 border border-teal-300">
        Resolved
      </span>
    }
    if (s === 'closed' || s === '6' || s === '7') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
        Closed
      </span>
    }
    if (s === 'cancelled' || s === '5') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
        Cancelled
      </span>
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
      {state || 'Unknown'}
    </span>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Requested For
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {requestItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-slate-300" />
                    <p>No request items found</p>
                  </div>
                </td>
              </tr>
            ) : (
              requestItems.map((item) => (
                <tr 
                  key={item.sys_id} 
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="font-semibold text-sm text-slate-900">
                        {String(item.number || item.sys_id)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-md">
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {String(item.short_description || item.description || 'No description')}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {item.state && getStateBadge(String(item.state))}
                  </td>
                  <td className="px-4 py-4">
                    {item.priority && getPriorityBadge(String(item.priority))}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 truncate max-w-[150px]">
                        {(item.requested_for as any)?.display_value || 
                         (item.requested_for as any)?.value || 
                         String(item.requested_for || 'N/A')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span 
                      className="text-sm text-slate-600"
                      title={formatDate(item.created_on || '')}
                    >
                      {formatRelativeTime(item.created_on || '')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span 
                      className="text-sm text-slate-600"
                      title={formatDate(item.updated_on || '')}
                    >
                      {formatRelativeTime(item.updated_on || '')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer with count */}
      {requestItems.length > 0 && (
        <div className="px-4 py-3 bg-slate-50 border-t text-sm text-slate-600">
          Showing <span className="font-semibold">{requestItems.length}</span> request item{requestItems.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

