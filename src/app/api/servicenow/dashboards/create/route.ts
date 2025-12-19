import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import axios from 'axios'

// POST - Create a new dashboard in ServiceNow par_dashboard table
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Dashboard name is required' }, { status: 400 })
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

    console.log(`[Dashboard API] Creating dashboard: ${name}`)

    // Create dashboard in par_dashboard table
    const response = await axios.post(
      `${instanceUrl}/api/now/table/par_dashboard`,
      {
        name: name.trim(),
        description: description?.trim() || '',
        active: true
      },
      { headers }
    )

    const newDashboard = response.data?.result

    if (!newDashboard) {
      return NextResponse.json({ error: 'Failed to create dashboard' }, { status: 500 })
    }

    console.log(`[Dashboard API] Dashboard created: ${newDashboard.sys_id}`)

    return NextResponse.json({
      success: true,
      dashboard: {
        sys_id: newDashboard.sys_id,
        name: newDashboard.name,
        description: newDashboard.description || ''
      }
    })
  } catch (error: any) {
    console.error('[Dashboard API] Error creating dashboard:', error.message, error.response?.data)
    
    // Check for specific ServiceNow errors
    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Permission denied. You may not have access to create dashboards.' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create dashboard', details: error.message },
      { status: 500 }
    )
  }
}

