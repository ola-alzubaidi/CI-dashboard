import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createServiceNowClient } from '@/lib/servicenow'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('[API] Session:', session ? 'exists' : 'null')
    console.log('[API] Session data:', JSON.stringify(session, null, 2))
    
    const accessToken = (session as any)?.accessToken
    const basicAuth = (session as any)?.basicAuth
    
    console.log('[API] accessToken:', accessToken ? 'exists' : 'missing')
    console.log('[API] basicAuth:', basicAuth ? 'exists' : 'missing')
    
    if (!accessToken && !basicAuth) {
      console.log('[API] Unauthorized - no token found in session')
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'No access token found. Please sign in again.',
        hasSession: !!session 
      }, { status: 401 })
    }

    const { table } = await params
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '50'
    const query = searchParams.get('query') || ''

    console.log(`[API] Fetching table: ${table}, limit: ${limit}`)

    const servicenowClient = createServiceNowClient(accessToken || basicAuth, !!accessToken)
    
    const data = await servicenowClient.getTableData(table, {
      sysparm_limit: parseInt(limit),
      sysparm_query: query,
    })

    console.log(`[API] Fetched ${data.length} records from ${table}`)

    return NextResponse.json({ 
      data,
      total: data.length,
      table,
    })
  } catch (error) {
    const { table } = await params
    console.error(`[API] Error fetching ${table}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

