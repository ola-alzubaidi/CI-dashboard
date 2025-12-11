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
    
    const accessToken = (session as any)?.accessToken
    const basicAuth = (session as any)?.basicAuth
    
    if (!accessToken && !basicAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { table } = await params
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '50'
    const query = searchParams.get('query') || ''

    const servicenowClient = createServiceNowClient(accessToken || basicAuth, !!accessToken)
    
    const data = await servicenowClient.getTableData(table, {
      sysparm_limit: parseInt(limit),
      sysparm_query: query,
    })

    return NextResponse.json({ 
      data,
      total: data.length,
      table,
    })
  } catch (error) {
    console.error(`Error fetching ${(await params).table}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

