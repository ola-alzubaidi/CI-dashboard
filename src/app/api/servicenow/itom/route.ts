import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createServiceNowClient } from '@/lib/servicenow'
import { ServiceNowRecord } from '@/lib/servicenow'

export const dynamic = 'force-dynamic'

function getDisplayValue(field: unknown): string {
  if (field == null) return '—'
  if (typeof field === 'object') {
    const o = field as Record<string, unknown>
    return String(o.display_value ?? o.value ?? o.name ?? '—')
  }
  return String(field)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const accessToken = (session as any)?.accessToken
    const basicAuth = (session as any)?.basicAuth

    if (!accessToken && !basicAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = createServiceNowClient(accessToken || basicAuth, !!accessToken)

    const metrics = {
      discoveryRuns: 0,
      cisDiscovered: 0,
      openEvents: 0,
      servicesMapped: 0,
    }
    const recentOperations: Array<{
      id: string
      type: string
      description: string
      time: string
      status: string
      createdAt: number
    }> = []

    // Discovery runs (recent) – discovery_status table
    try {
      const { result: discoveryRuns } = await client.getTableData('discovery_status', {
        sysparm_limit: 100,
        sysparm_fields: 'sys_id,sys_created_on,status',
        sysparm_order: 'sys_created_onDESC',
      })
      metrics.discoveryRuns = discoveryRuns?.length ?? 0
      // Add recent discovery runs to operations
      for (let i = 0; i < Math.min(3, discoveryRuns?.length ?? 0); i++) {
        const r = discoveryRuns![i] as ServiceNowRecord & { sys_created_on?: string; status?: unknown }
        const created = r.sys_created_on ? new Date(r.sys_created_on) : new Date()
        recentOperations.push({
          id: `discovery-${r.sys_id}`,
          type: 'Discovery',
          description: `Discovery run – ${getDisplayValue(r.status)}`,
          time: formatTimeAgo(created),
          status: 'Success',
          createdAt: created.getTime(),
        })
      }
    } catch {
      // Table may not exist or no ITOM Discovery
    }

    // CMDB CIs count
    try {
      const { result, totalCount } = await client.getTableDataWithCount('cmdb_ci', {
        sysparm_limit: 1,
        sysparm_fields: 'sys_id',
      })
      metrics.cisDiscovered = totalCount ?? result?.length ?? 0
    } catch {
      // Table may not exist
    }

    // Open events – em_event (state=1 or similar for open)
    try {
      const { result: events, totalCount } = await client.getTableDataWithCount('em_event', {
        sysparm_limit: 10,
        sysparm_query: 'state=1^ORstate=2', // 1=New, 2=In Progress often used for "open"
        sysparm_fields: 'sys_id,description,state,sys_created_on',
        sysparm_order: 'sys_created_onDESC',
      })
      metrics.openEvents = totalCount ?? events?.length ?? 0
      for (let i = 0; i < Math.min(2, events?.length ?? 0); i++) {
        const e = events![i] as ServiceNowRecord & { description?: unknown; sys_created_on?: string }
        const created = e.sys_created_on ? new Date(e.sys_created_on) : new Date()
        recentOperations.push({
          id: `event-${e.sys_id}`,
          type: 'Event',
          description: getDisplayValue(e.description) || 'Event',
          time: formatTimeAgo(created),
          status: 'Open',
          createdAt: created.getTime(),
        })
      }
    } catch {
      // Event Management may not be installed
    }

    // Services mapped – cmdb_ci_service or sa_service
    try {
      const { totalCount } = await client.getTableDataWithCount('cmdb_ci_service', {
        sysparm_limit: 1,
        sysparm_fields: 'sys_id',
      })
      if (totalCount != null) metrics.servicesMapped = totalCount
    } catch {
      try {
        const { totalCount } = await client.getTableDataWithCount('sa_service', {
          sysparm_limit: 1,
          sysparm_fields: 'sys_id',
        })
        if (totalCount != null) metrics.servicesMapped = totalCount
      } catch {
        // Neither table available
      }
    }

    // Sort by newest first and take top 5
    recentOperations.sort((a, b) => b.createdAt - a.createdAt)
    const topOperations = recentOperations.slice(0, 5).map(({ createdAt, ...op }) => op)

    return NextResponse.json({
      metrics,
      recentOperations: topOperations,
      instanceUrl: process.env.SERVICENOW_INSTANCE_URL || '',
    })
  } catch (error) {
    console.error('ITOM API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch ITOM data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHrs < 24) return `${diffHrs} hr ago`
  return `${diffDays} day(s) ago`
}
