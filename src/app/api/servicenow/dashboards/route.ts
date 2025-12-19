import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import axios from 'axios'

const PREFERENCE_NAME = 'custom_dashboard_config'

// GET - Load dashboards from ServiceNow
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

    // Query sys_user_preference for dashboard config
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    } else if (basicAuth) {
      headers['Authorization'] = `Basic ${basicAuth}`
    }

    const response = await axios.get(
      `${instanceUrl}/api/now/table/sys_user_preference`,
      {
        headers,
        params: {
          sysparm_query: `name=${PREFERENCE_NAME}`,
          sysparm_limit: 1,
          sysparm_fields: 'sys_id,name,value,user'
        }
      }
    )

    const preferences = response.data?.result || []
    
    if (preferences.length > 0 && preferences[0].value) {
      try {
        const dashboardData = JSON.parse(preferences[0].value)
        return NextResponse.json({ 
          success: true, 
          data: dashboardData,
          preferenceId: preferences[0].sys_id 
        })
      } catch {
        return NextResponse.json({ success: true, data: null })
      }
    }

    return NextResponse.json({ success: true, data: null })
  } catch (error: any) {
    console.error('[Dashboard API] Error loading dashboards:', error.message)
    return NextResponse.json(
      { error: 'Failed to load dashboards', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Save dashboards to ServiceNow
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
    const { dashboards, widgets, snFavorites, preferenceId } = body

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    } else if (basicAuth) {
      headers['Authorization'] = `Basic ${basicAuth}`
    }

    const dataToSave = JSON.stringify({
      dashboards,
      widgets,
      snFavorites, // Include ServiceNow dashboard favorites
      savedAt: new Date().toISOString()
    })

    let response

    if (preferenceId) {
      // Update existing preference
      response = await axios.put(
        `${instanceUrl}/api/now/table/sys_user_preference/${preferenceId}`,
        {
          value: dataToSave
        },
        { headers }
      )
    } else {
      // Check if preference exists first
      const checkResponse = await axios.get(
        `${instanceUrl}/api/now/table/sys_user_preference`,
        {
          headers,
          params: {
            sysparm_query: `name=${PREFERENCE_NAME}`,
            sysparm_limit: 1
          }
        }
      )

      const existing = checkResponse.data?.result || []

      if (existing.length > 0) {
        // Update existing
        response = await axios.put(
          `${instanceUrl}/api/now/table/sys_user_preference/${existing[0].sys_id}`,
          {
            value: dataToSave
          },
          { headers }
        )
      } else {
        // Create new preference
        response = await axios.post(
          `${instanceUrl}/api/now/table/sys_user_preference`,
          {
            name: PREFERENCE_NAME,
            value: dataToSave,
            type: 'string'
          },
          { headers }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Dashboards saved to ServiceNow',
      preferenceId: response.data?.result?.sys_id 
    })
  } catch (error: any) {
    console.error('[Dashboard API] Error saving dashboards:', error.message)
    return NextResponse.json(
      { error: 'Failed to save dashboards', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove dashboard preference from ServiceNow
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
    const preferenceId = searchParams.get('preferenceId')

    if (!preferenceId) {
      return NextResponse.json({ error: 'Preference ID required' }, { status: 400 })
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    } else if (basicAuth) {
      headers['Authorization'] = `Basic ${basicAuth}`
    }

    await axios.delete(
      `${instanceUrl}/api/now/table/sys_user_preference/${preferenceId}`,
      { headers }
    )

    return NextResponse.json({ success: true, message: 'Dashboard preference deleted' })
  } catch (error: any) {
    console.error('[Dashboard API] Error deleting preference:', error.message)
    return NextResponse.json(
      { error: 'Failed to delete preference', details: error.message },
      { status: 500 }
    )
  }
}

