import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createServiceNowClient } from '@/lib/servicenow'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const accessToken = (session as any)?.accessToken
    const basicAuth = (session as any)?.basicAuth
    
    if (!accessToken && !basicAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hostIP = searchParams.get('host_ip')
    const name = searchParams.get('name')

    const servicenowClient = createServiceNowClient(accessToken || basicAuth, !!accessToken)
    
    // Build query for MID servers
    let query = 'statusOKAY^ORstatusUP' // Only active MID servers
    if (hostIP) {
      query += `^host_nameSTARTSWITH${hostIP}^ORipSTARTSWITH${hostIP}`
    }
    if (name) {
      query += `^nameLIKE${name}`
    }

    // Get total count (best-effort: uses X-Total-Count when available)
    let totalCount: number | null = null
    try {
      const countRes = await (servicenowClient as any).getTableDataWithCount?.('ecc_agent', {
        sysparm_query: query,
        sysparm_fields: 'sys_id',
        sysparm_limit: 1,
      })
      totalCount = countRes?.totalCount ?? null
    } catch {
      totalCount = null
    }

    // Query ecc_agent table (MID servers) for details
    const midServers = await servicenowClient.getTableData('ecc_agent', {
      sysparm_query: query,
      sysparm_fields: 'sys_id,name,status,host_name,ip,version,last_refreshed,validated',
      sysparm_limit: 50,
      sysparm_display_value: 'all'
    } as any)

    return NextResponse.json({ 
      midServers,
      total: totalCount ?? midServers.length
    })
  } catch (error) {
    console.error('Error fetching MID servers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch MID servers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
