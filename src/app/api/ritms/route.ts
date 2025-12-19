import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createServiceNowClient } from '@/lib/servicenow'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Session in RITM API:', JSON.stringify(session, null, 2))
    
    // Support both OAuth (accessToken) and Basic Auth (basicAuth)
    const accessToken = (session as any)?.accessToken
    const basicAuth = (session as any)?.basicAuth
    
    console.log('Has accessToken:', !!accessToken)
    console.log('Has basicAuth:', !!basicAuth)
    
    if (!accessToken && !basicAuth) {
      console.log('No auth token found!')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '50'
    const offset = searchParams.get('offset') || '0'
    const query = searchParams.get('query') || ''
    const fields = searchParams.get('fields') || 'sys_id,number,short_description,state,priority,created_on,updated_on,requested_for,requested_by,description'

    console.log('Creating ServiceNow client with OAuth:', !!accessToken)
    const servicenowClient = createServiceNowClient(accessToken || basicAuth, !!accessToken)
    
    console.log('Fetching RITMs...')
    const ritms = await servicenowClient.getRequestItems({
      sysparm_limit: parseInt(limit),
      sysparm_offset: parseInt(offset),
      sysparm_query: query,
      sysparm_fields: fields,
    })

    console.log('RITMs fetched:', ritms?.length || 0)

    return NextResponse.json({ 
      ritms,
      total: ritms.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      instanceUrl: process.env.SERVICENOW_INSTANCE_URL || ''
    })
  } catch (error) {
    console.error('Error fetching RITMs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch RITMs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
