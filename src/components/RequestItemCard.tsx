"use client"

import { ServiceNowRecord } from "@/lib/servicenow"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  User, 
  FileText,
  ExternalLink
} from "lucide-react"

interface RequestItemCardProps {
  requestItem: ServiceNowRecord
  instanceUrl?: string
}

export function RequestItemCard({ requestItem, instanceUrl }: RequestItemCardProps) {
  const getPriorityConfig = (priority: string) => {
    const p = priority?.toLowerCase()
    if (p === '1' || p === 'critical') {
      return { 
        label: 'Critical', 
        class: 'bg-red-100 text-red-700 border-red-300'
      }
    }
    if (p === '2' || p === 'high') {
      return { 
        label: 'High', 
        class: 'bg-orange-100 text-orange-700 border-orange-300'
      }
    }
    if (p === '3' || p === 'medium') {
      return { 
        label: 'Medium', 
        class: 'bg-yellow-100 text-yellow-700 border-yellow-300'
      }
    }
    return { 
      label: 'Low', 
      class: 'bg-green-100 text-green-700 border-green-300'
    }
  }

  const getStateConfig = (state: string) => {
    const s = state?.toLowerCase()
    if (s === 'new' || s === '1') {
      return { 
        label: 'New', 
        class: 'bg-blue-100 text-blue-700 border-blue-300'
      }
    }
    if (s === 'in progress' || s === 'assigned' || s === '2' || s === '3') {
      return { 
        label: 'In\u00A0Progress', 
        class: 'bg-purple-100 text-purple-700 border-purple-300'
      }
    }
    if (s === 'resolved' || s === '4') {
      return { 
        label: 'Resolved', 
        class: 'bg-teal-100 text-teal-700 border-teal-300'
      }
    }
    if (s === 'closed' || s === '6' || s === '7') {
      return { 
        label: 'Closed', 
        class: 'bg-slate-100 text-slate-700 border-slate-300'
      }
    }
    if (s === 'cancelled' || s === '5') {
      return { 
        label: 'Cancelled', 
        class: 'bg-red-100 text-red-700 border-red-300'
      }
    }
    return { 
      label: state || 'Unknown', 
      class: 'bg-slate-100 text-slate-700 border-slate-300'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const formatFullDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Generate ServiceNow URL for the record
  const serviceNowUrl = instanceUrl && requestItem.sys_id 
    ? `${instanceUrl}/nav_to.do?uri=sc_req_item.do?sys_id=${requestItem.sys_id}`
    : null
  const priorityConfig = requestItem.priority ? getPriorityConfig(String(requestItem.priority)) : null
  const stateConfig = requestItem.state ? getStateConfig(String(requestItem.state)) : null

  return (
    <Card className="hover:shadow-xl transition-all duration-200 border-l-4 hover:border-l-blue-500 group">
      <CardHeader className="pb-3">
        {/* Header with Number and Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
              {serviceNowUrl ? (
                <a
                  href={serviceNowUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-base text-blue-600 hover:text-blue-800 hover:underline truncate flex items-center gap-1 group/link"
                  title="Open in ServiceNow"
                >
                  {String(requestItem.number || requestItem.sys_id)}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                </a>
              ) : (
                <h3 className="font-bold text-base text-slate-900 truncate">
                  {String(requestItem.number || requestItem.sys_id)}
                </h3>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 items-end">
            {stateConfig && (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${stateConfig.class}`}>
                {stateConfig.label}
              </div>
            )}
            {priorityConfig && (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityConfig.class}`}>
                {priorityConfig.label}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
          {String(requestItem.short_description || requestItem.description || 'No description available')}
        </p>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* User Information */}
        <div className="grid grid-cols-2 gap-3">
          {requestItem.requested_for != null && (
            <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
              <User className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 mb-0.5">Requested For</p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {(requestItem.requested_for as any)?.display_value || 
                   (requestItem.requested_for as any)?.value || 
                   String(requestItem.requested_for)}
                </p>
              </div>
            </div>
          )}

          {requestItem.requested_by != null && (
            <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
              <User className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 mb-0.5">Requested By</p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {(requestItem.requested_by as any)?.display_value || 
                   (requestItem.requested_by as any)?.value || 
                   String(requestItem.requested_by)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Date Information */}
        <div className="flex items-center justify-between text-xs pt-2 border-t">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="font-medium">Created:</span>
            <span title={formatFullDate(requestItem.created_on || '')}>
              {formatDate(requestItem.created_on || '')}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="font-medium">Updated:</span>
            <span title={formatFullDate(requestItem.updated_on || '')}>
              {formatDate(requestItem.updated_on || '')}
            </span>
          </div>
        </div>

        {/* Sys ID - Hidden until hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 font-mono pt-1">
          {requestItem.sys_id}
        </div>
      </CardContent>
    </Card>
  )
}
