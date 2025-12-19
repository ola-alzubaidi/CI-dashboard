"use client"

import { ServiceNowRecord } from "@/lib/servicenow"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink } from "lucide-react"

interface IncidentCardProps {
  incident: ServiceNowRecord
  instanceUrl?: string
}

export function IncidentCard({ incident, instanceUrl }: IncidentCardProps) {
  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority?.toLowerCase()) {
      case '1':
      case 'critical':
        return 'destructive'
      case '2':
      case 'high':
        return 'default'
      case '3':
      case 'medium':
        return 'secondary'
      case '4':
      case 'low':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStateVariant = (state: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (state?.toLowerCase()) {
      case 'new':
        return 'default'
      case 'in progress':
      case 'assigned':
        return 'secondary'
      case 'resolved':
        return 'outline'
      case 'closed':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Generate ServiceNow URL for the incident
  const serviceNowUrl = instanceUrl && incident.sys_id 
    ? `${instanceUrl}/nav_to.do?uri=incident.do?sys_id=${incident.sys_id}`
    : null

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {serviceNowUrl ? (
              <a
                href={serviceNowUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 group"
                title="Open in ServiceNow"
              >
                {incident.number || incident.sys_id}
                <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ) : (
              incident.number || incident.sys_id
            )}
          </CardTitle>
          <div className="flex gap-2">
            {incident.priority && (
              <Badge variant={getPriorityVariant(incident.priority)}>
                P{incident.priority}
              </Badge>
            )}
            {incident.state && (
              <Badge variant={getStateVariant(incident.state)}>
                {incident.state}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {incident.short_description || incident.description || 'No description available'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium">Created</dt>
            <dd className="text-muted-foreground">
              {formatDate(incident.created_on || '')}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Updated</dt>
            <dd className="text-muted-foreground">
              {formatDate(incident.updated_on || '')}
            </dd>
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex items-center justify-between pt-4">
        <span className="text-xs text-muted-foreground">
          ID: {incident.sys_id}
        </span>
        {serviceNowUrl && (
          <a 
            href={serviceNowUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            View in ServiceNow
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardFooter>
    </Card>
  )
}
