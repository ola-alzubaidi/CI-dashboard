import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import axios from 'axios'

// DELETE - Delete a dashboard from ServiceNow par_dashboard table
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const sysId = searchParams.get('sys_id')

    if (!sysId) {
      return NextResponse.json({ error: 'Dashboard sys_id is required' }, { status: 400 })
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    } else if (basicAuth) {
      headers['Authorization'] = `Basic ${basicAuth}`
    }

    console.log(`[Dashboard API] Deleting dashboard: ${sysId}`)

    // Delete dashboard from par_dashboard table
    await axios.delete(
      `${instanceUrl}/api/now/table/par_dashboard/${sysId}`,
      { headers }
    )

    console.log(`[Dashboard API] Dashboard deleted: ${sysId}`)

    return NextResponse.json({
      success: true,
      message: 'Dashboard deleted successfully'
    })
  } catch (error: any) {
    console.error('[Dashboard API] Error deleting dashboard:', error.message, error.response?.data)
    
    // Check for specific ServiceNow errors
    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Permission denied. You may not have access to delete this dashboard.' },
        { status: 403 }
      )
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete dashboard', details: error.message },
      { status: 500 }
    )
  }
}

