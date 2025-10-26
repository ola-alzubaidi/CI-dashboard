"use client"

import { ServiceNowRecord } from "@/lib/servicenow"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, User } from "lucide-react"

interface UserCardProps {
  user: ServiceNowRecord
}

export function UserCard({ user }: UserCardProps) {
  const getActiveStatus = (active: string | boolean) => {
    return active === 'true' || active === true
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isActive = getActiveStatus(user.active as string | boolean)
  const initials = ((user.first_name as string)?.[0] || '') + ((user.last_name as string)?.[0] || '') || (user.user_name as string)?.[0] || 'U'
  const fullName = (user.first_name as string) && (user.last_name as string) 
    ? `${user.first_name} ${user.last_name}`
    : (user.user_name as string) || 'Unknown User'

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {initials}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{fullName}</h3>
              <p className="text-sm text-muted-foreground">
                @{(user.user_name as string) || 'unknown'}
              </p>
            </div>
          </div>
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Contact Information</h4>
          <div className="space-y-2">
            {(user.email as string) && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email as string}</span>
              </div>
            )}
            {(user.phone as string) && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.phone as string}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium">Department1</dt>
            <dd className="text-muted-foreground">
              {(user.department as string) || 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Location</dt>
            <dd className="text-muted-foreground">
              {(user.location as string) || 'N/A'}
            </dd>
          </div>
        </div>

        {(user.last_login_time as string) && (
          <>
            <Separator />
            <div className="text-sm">
              <dt className="font-medium">Last Login</dt>
              <dd className="text-muted-foreground">
                {formatDate((user.last_login_time as string) || '')}
              </dd>
            </div>
          </>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="flex items-center justify-between pt-4">
        <span className="text-xs text-muted-foreground">
          ID: {user.sys_id}
        </span>
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </CardFooter>
    </Card>
  )
}
