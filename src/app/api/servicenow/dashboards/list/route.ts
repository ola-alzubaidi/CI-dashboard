import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import axios from 'axios'

// GET - List dashboards from ServiceNow Platform Analytics Workspace
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = (session as any)?.accessToken
    const basicAuth = (session as any)?.basicAuth

    if (!accessToken && !basicAuth) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }

    const instanceUrl = process.env.SERVICENOW_INSTANCE_URL
    if (!instanceUrl) {
      return NextResponse.json({ error: 'ServiceNow instance URL not configured' }, { status: 500 })
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    } else if (basicAuth) {
      headers['Authorization'] = `Basic ${basicAuth}`
    }

    // Fetch from par_dashboard - Platform Analytics Redesigned dashboards
    console.log('[Dashboard API] Fetching from par_dashboard...')
    
    const response = await axios.get(`${instanceUrl}/api/now/table/par_dashboard`, {
      headers,
      params: {
        sysparm_limit: 200,
        sysparm_display_value: 'true',
        sysparm_query: 'ORDERBYname'
      }
    })

    const dashboards = response.data?.result || []
    console.log(`[Dashboard API] Found ${dashboards.length} PAR dashboards`)

    // Normalize dashboard data
    const normalizedDashboards = dashboards.map((d: any) => ({
      sys_id: d.sys_id,
      name: d.name || d.title || d.label || 'Untitled Dashboard',
      description: d.description || d.short_description || '',
      active: d.active !== 'false' && d.active !== false,
      created_on: d.sys_created_on,
      updated_on: d.sys_updated_on,
      owner: typeof d.owner === 'object' ? d.owner?.display_value : d.owner || '',
      category: d.category || '',
      source: 'par_dashboard'
    }))

    return NextResponse.json({ 
      success: true, 
      dashboards: normalizedDashboards,
      total: normalizedDashboards.length,
      source: 'par_dashboard',
      instanceUrl: instanceUrl
    })
  } catch (error: any) {
    console.error('[Dashboard List API] Error:', error.message, error.response?.data)
    
    return NextResponse.json(
      { error: 'Failed to list dashboards', details: error.message },
      { status: 500 }
    )
  }
}
