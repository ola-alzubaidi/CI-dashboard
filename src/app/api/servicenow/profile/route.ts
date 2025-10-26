import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createServiceNowClient } from '@/lib/servicenow'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
          if (!(session as any)?.basicAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
          }

    const servicenowClient = createServiceNowClient((session as any).basicAuth as string)
    
    const profile = await servicenowClient.getUserProfile()

    return NextResponse.json({ profile })
  } catch (error) {
    // Error fetching user profile
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
