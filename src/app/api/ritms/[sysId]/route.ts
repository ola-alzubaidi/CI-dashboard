import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createServiceNowClient } from '@/lib/servicenow'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/ritms/[sysId] - Update RITM (e.g. discovery workflow fields)
 * Body: { u_discovery_status?, u_last_email_date?, u_host_ip?, u_network_type?, u_notes? }
 * ServiceNow custom fields on sc_req_item must exist for this to succeed.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sysId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const accessToken = (session as any)?.accessToken
    const basicAuth = (session as any)?.basicAuth

    if (!accessToken && !basicAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sysId } = await params
    if (!sysId) {
      return NextResponse.json({ error: 'Missing sysId' }, { status: 400 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.u_discovery_status !== undefined) {
      updates.u_discovery_status = body.u_discovery_status
    }
    if (body.u_last_email_date !== undefined) {
      updates.u_last_email_date = body.u_last_email_date
    }
    if (body.u_host_ip !== undefined) {
      updates.u_host_ip = body.u_host_ip
    }
    if (body.u_network_type !== undefined) {
      updates.u_network_type = body.u_network_type
    }
    if (body.u_notes !== undefined) {
      updates.u_notes = body.u_notes
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const servicenowClient = createServiceNowClient(accessToken || basicAuth, !!accessToken)
    const updated = await servicenowClient.updateRecord('sc_req_item', sysId, updates)

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating RITM:', error)
    return NextResponse.json(
      {
        error: 'Failed to update RITM',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
