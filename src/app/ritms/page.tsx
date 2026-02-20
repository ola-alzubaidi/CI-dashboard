"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DiscoveryWorkflow } from "@/components/DiscoveryWorkflow"
import { ITOMDemo } from "@/components/ITOMDemo"
import { DashboardBuilder } from "@/components/DashboardBuilder"
import { ServiceNowRecord } from "@/lib/servicenow"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, LogOut, LayoutDashboard, Zap, Activity } from "lucide-react"
import { DashboardSidebar } from "@/components/DashboardSidebar"
import { DashboardConfig } from "@/types/dashboard"

export default function RITMsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ritms, setRitms] = useState<ServiceNowRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeDashboard, setActiveDashboard] = useState<DashboardConfig | null>(null)
  const [instanceUrl, setInstanceUrl] = useState<string>('')
  const [showDiscovery, setShowDiscovery] = useState(false)
  const [showITOM, setShowITOM] = useState(false)

  const fetchRITMs = useCallback(async (limit?: number) => {
    setLoading(true)
    setError(null)
    try {
      const itemLimit = limit || activeDashboard?.settings.limit || 50
      const response = await fetch(`/api/ritms?limit=${itemLimit}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch RITMs: ${response.statusText}`)
      }
      const data = await response.json()
      setRitms(data.ritms || [])
      if (data.instanceUrl) {
        setInstanceUrl(data.instanceUrl)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while fetching RITMs')
    } finally {
      setLoading(false)
    }
  }, [activeDashboard?.settings.limit])

  const handleDashboardChange = (dashboard: DashboardConfig) => {
    setActiveDashboard(dashboard)
    setShowDiscovery(false)
    setShowITOM(false)
  }

  const handleDiscoveryClick = () => {
    if (!showDiscovery) fetchRITMs()
    setShowDiscovery(!showDiscovery)
    setShowITOM(false)
  }

  const handleITOMClick = () => {
    setShowITOM(!showITOM)
    setShowDiscovery(false)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [session, status, mounted, router])

  // Auto-refresh RITMs when in Discovery view so new items appear without manual refresh
  useEffect(() => {
    if (!showDiscovery || !mounted) return
    const interval = setInterval(() => fetchRITMs(), 45_000)
    return () => clearInterval(interval)
  }, [showDiscovery, mounted, fetchRITMs])

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null // Redirect is handled by useEffect
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700/50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${showDiscovery ? 'bg-green-500/10' : showITOM ? 'bg-indigo-500/10' : 'bg-blue-500/10'}`}>
                  {showDiscovery ? (
                    <Zap className="h-6 w-6 text-green-400" />
                  ) : showITOM ? (
                    <Activity className="h-6 w-6 text-indigo-400" />
                  ) : (
                    <LayoutDashboard className="h-6 w-6 text-blue-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {showDiscovery ? 'Discovery Onboarding' : showITOM ? 'ITOM Operations' : (activeDashboard?.name || 'Dashboard')}
                  </h1>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {showDiscovery
                      ? 'Track discovery onboarding for your RITMs'
                      : showITOM
                        ? 'Discovery, events, and service mapping (demo)'
                        : `Welcome, ${session?.user?.name || session?.user?.email}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* ITOM Button */}
              <Button
                onClick={handleITOMClick}
                size="default"
                className={showITOM
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'}
              >
                <Activity className="h-4 w-4 mr-2" />
                ITOM
              </Button>
              {/* Discovery Button */}
              <Button
                onClick={handleDiscoveryClick}
                size="default"
                className={showDiscovery
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-green-600 hover:text-white hover:border-green-600'}
              >
                <Zap className="h-4 w-4 mr-2" />
                Discovery
              </Button>
              {/* Refresh Button - only show in Discovery view */}
              {showDiscovery && (
                <Button
                  onClick={() => fetchRITMs()}
                  disabled={loading}
                  variant="outline"
                  size="default"
                  className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
              <Button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                variant="outline"
                size="default"
                className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-col h-[calc(100vh-73px)]">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <DashboardSidebar onDashboardChange={handleDashboardChange} />

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto bg-slate-100">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {showDiscovery ? (
                loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <DiscoveryWorkflow requestItems={ritms} instanceUrl={instanceUrl} />
                )
              ) : showITOM ? (
                <ITOMDemo />
              ) : (
                /* Dashboard Builder View */
                activeDashboard ? (
                  <DashboardBuilder dashboard={activeDashboard} />
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Select a dashboard from the sidebar</p>
                    <p className="text-sm mt-1">Or use Discovery or ITOM for operations</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-700/50 py-2 px-6">
        </footer>
      </div>
    </div>
  )
}
