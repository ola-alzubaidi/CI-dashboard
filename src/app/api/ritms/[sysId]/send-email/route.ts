import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createServiceNowClient } from '@/lib/servicenow'

export const dynamic = 'force-dynamic'

function getFieldValue(raw: unknown): string {
  if (raw == null) return ''
  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    return String((o.display_value ?? o.value ?? o.name ?? '') || '')
  }
  return String(raw)
}

function getFieldSysId(raw: unknown): string | null {
  if (raw == null) return null
  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    const v = o.value ?? o.link
    return v ? String(v) : null
  }
  return String(raw) || null
}

const EMAIL_TEMPLATES: Record<
  number,
  { subject: (num: string) => string; body: (name: string, num: string, desc: string) => string }
> = {
  1: {
    subject: (num) => `[Action Required] Discovery Onboarding - ${num}`,
    body: (name, num, desc) =>
      `Dear ${name},\n\nWe are reaching out regarding your request ${num}: "${desc}".\n\nTo proceed with Discovery onboarding, we need to schedule a Technical Engagement Meeting (TEM).\n\nPlease respond with your availability and technical contact.\n\nBest regards,\nDiscovery Team`,
  },
  2: {
    subject: (num) => `[Reminder] Discovery Onboarding - ${num}`,
    body: (name, num) =>
      `Dear ${name},\n\nThis is a follow-up regarding ${num}. We haven't received a response about Discovery onboarding.\n\nPlease respond with your availability for a TEM meeting.\n\nBest regards,\nDiscovery Team`,
  },
  3: {
    subject: (num) => `[Final Notice] Discovery Onboarding - ${num}`,
    body: (name, num) =>
      `Dear ${name},\n\nFINAL NOTICE for ${num}. If we don't receive a response within 3 days, this request will be escalated.\n\nPlease respond immediately.\n\nBest regards,\nDiscovery Team`,
  },
}

const STATUS_AFTER_EMAIL: Record<number, string> = {
  1: 'email_1_sent',
  2: 'email_2_sent',
  3: 'email_3_sent',
}

/**
 * POST /api/ritms/[sysId]/send-email - Send discovery email via ServiceNow (visible in System > Email > Outbound)
 * Body: { emailNum: 1 | 2 | 3 }
 * Requires: ServiceNow user must have email_api_send role; outbound email must be configured.
 */
export async function POST(
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

    const body = await request.json().catch(() => ({}))
    const emailNum = body.emailNum
    if (emailNum !== 1 && emailNum !== 2 && emailNum !== 3) {
      return NextResponse.json(
        { error: 'Invalid emailNum. Must be 1, 2, or 3.' },
        { status: 400 }
      )
    }

    const client = createServiceNowClient(accessToken || basicAuth, !!accessToken)

    // Fetch RITM with requested_for reference
    const ritms = await client.getTableData('sc_req_item', {
      sysparm_query: `sys_id=${sysId}`,
      sysparm_fields: 'sys_id,number,short_description,requested_for',
      sysparm_limit: 1,
    })
    const ritm = ritms[0]
    if (!ritm) {
      return NextResponse.json({ error: 'RITM not found' }, { status: 404 })
    }

    const num = getFieldValue(ritm.number) || 'RITM'
    const desc = getFieldValue(ritm.short_description) || 'Discovery request'
    const requesterRef = ritm.requested_for
    const requesterSysId = getFieldSysId(requesterRef)

    let toEmail = ''
    let requesterName = 'Customer'

    if (requesterSysId) {
      const users = await client.getTableData('sys_user', {
        sysparm_query: `sys_id=${requesterSysId}`,
        sysparm_fields: 'email,name',
        sysparm_limit: 1,
      })
      const user = users[0]
      if (user) {
        toEmail = getFieldValue(user.email) || ''
        requesterName = getFieldValue(user.name) || requesterName
      }
    }

    if (!toEmail) {
      return NextResponse.json(
        {
          error: 'Requester has no email. Add an email to the requested_for user in ServiceNow.',
        },
        { status: 400 }
      )
    }

    const template = EMAIL_TEMPLATES[emailNum]
    const subject = template.subject(num)
    const text = template.body(requesterName, num, desc)

    await client.sendEmail({
      to: [toEmail],
      subject,
      text,
      tableName: 'sc_req_item',
      tableRecordId: sysId,
    })

    const now = new Date()
    const snDate = now.toISOString().slice(0, 19).replace('T', ' ')

    await client.updateRecord('sc_req_item', sysId, {
      u_discovery_status: STATUS_AFTER_EMAIL[emailNum],
      u_last_email_date: snDate,
    } as Record<string, unknown>)

    return NextResponse.json({
      success: true,
      message: `Email ${emailNum} sent to ${toEmail}. Check ServiceNow: System > Email > Outbound.`,
    })
  } catch (error) {
    console.error('Error sending discovery email:', error)
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
