"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import { IncidentCard } from "./IncidentCard"
import { UserCard } from "./UserCard"
import { RequestItemCard } from "./RequestItemCard"
import { ServiceNowRecord } from "@/lib/servicenow"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, LogOut, FileText } from "lucide-react"

export function Dashboard() {
  const { data: session, status } = useSession()
  const [incidents, setIncidents] = useState<ServiceNowRecord[]>([])
  const [users, setUsers] = useState<ServiceNowRecord[]>([])
  const [requestItems, setRequestItems] = useState<ServiceNowRecord[]>([])
  const [userProfile, setUserProfile] = useState<ServiceNowRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('profile')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      if (activeTab === 'incidents') {
        const response = await fetch('/api/servicenow/incidents?limit=20')
        if (!response.ok) {
          throw new Error(`Failed to fetch incidents: ${response.statusText}`)
        }
        const data = await response.json()
        setIncidents(data.incidents || [])
        setSuccess(`Successfully loaded ${data.incidents?.length || 0} incidents`)
      } else if (activeTab === 'users') {
        const response = await fetch('/api/servicenow/users?limit=20')
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`)
        }
        const data = await response.json()
        setUsers(data.users || [])
        setSuccess(`Successfully loaded ${data.users?.length || 0} users`)
      } else if (activeTab === 'request-items') {
        const response = await fetch('/api/servicenow/request-items?limit=20')
        if (!response.ok) {
          throw new Error(`Failed to fetch request items: ${response.statusText}`)
        }
        const data = await response.json()
        setRequestItems(data.requestItems || [])
        setSuccess(`Successfully loaded ${data.requestItems?.length || 0} request items`)
      } else if (activeTab === 'profile') {
        const response = await fetch('/api/servicenow/profile')
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`)
        }
        const data = await response.json()
        setUserProfile(data.profile || null)
        setSuccess('Successfully loaded user profile')
      }
    } catch (error) {
      // Error fetching data
      setError(error instanceof Error ? error.message : 'An error occurred while fetching data')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    if ((session as any)?.basicAuth) {
      fetchData()
    }
  }, [session, fetchData])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">ServiceNow Integration</CardTitle>
            <CardDescription className="text-center">
              Connect to your ServiceNow instance to manage incidents and users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => signIn('servicenow')}
              className="w-full"
              size="lg"
            >
              Sign in with ServiceNow
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ServiceNow Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome, {session?.user?.name || session?.user?.email}
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <a href="/ritms">
                  <FileText className="h-4 w-4 mr-2" />
                  View RITMs
                </a>
              </Button>
              <Button
                onClick={() => signOut()}
                variant="destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="profile">My Profile</TabsTrigger>
                <TabsTrigger value="incidents">Incidents</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="request-items">Request Items</TabsTrigger>
              </TabsList>
              
              <Button
                onClick={fetchData}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="mt-6">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <TabsContent value="profile" className="mt-0">
                    <div className="max-w-2xl">
                      {userProfile ? (
                        <UserCard user={userProfile} />
                      ) : (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No profile data available</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="incidents" className="mt-0">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {incidents.length > 0 ? (
                        incidents.map((incident) => (
                          <IncidentCard key={incident.sys_id} incident={incident} />
                        ))
                      ) : (
                        <Card className="col-span-full">
                          <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No incidents found</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="users" className="mt-0">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {users.length > 0 ? (
                        users.map((user) => (
                          <UserCard key={user.sys_id} user={user} />
                        ))
                      ) : (
                        <Card className="col-span-full">
                          <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No users found</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="request-items" className="mt-0">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {requestItems.length > 0 ? (
                        requestItems.map((requestItem) => (
                          <RequestItemCard key={requestItem.sys_id} requestItem={requestItem} />
                        ))
                      ) : (
                        <Card className="col-span-full">
                          <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No request items found</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
