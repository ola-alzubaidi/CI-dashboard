import { type JWT } from "next-auth/jwt"

// ServiceNow Credentials Provider using Basic Auth
const ServiceNowProvider = {
  id: "servicenow",
  name: "ServiceNow",
  type: "credentials" as const,
  credentials: {
    username: { label: "Username", type: "text" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials: Record<string, string> | undefined) {
    if (!credentials?.username || !credentials?.password) {
      return null
    }

    try {
      // Create Basic Auth header
      const basicAuth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')
      
      // Test authentication by fetching user info directly
      const userResponse = await fetch(`${process.env.SERVICENOW_INSTANCE_URL}/api/now/table/sys_user?sysparm_query=user_name=${credentials.username}&sysparm_fields=sys_id,user_name,email,first_name,last_name`, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Accept': 'application/json',
        },
      })

      if (!userResponse.ok) {
        return null
      }

      const userData = await userResponse.json()
      const user = userData.result?.[0]

      if (!user) {
        return null
      }

      return {
        id: user.sys_id,
        name: user.user_name,
        email: user.email || `${user.user_name}@servicenow.com`,
        // Store Basic Auth for API calls
        basicAuth: basicAuth,
        username: credentials.username,
      }
    } catch {
      return null
    }
  },
}

export const authOptions = {
  providers: [ServiceNowProvider],
  logger: {
    error: (_code: string, _metadata: any) => {
      // Log errors in production
    },
    warn: (_code: string) => {
      // Log warnings in production
    },
    debug: (_code: string, _metadata: any) => {
      // Debug logging disabled
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: false,
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // If redirecting to baseUrl or a relative path, redirect to /ritms
      if (url.startsWith(baseUrl)) return `${baseUrl}/ritms`
      // If redirecting to external URL, allow it
      else if (url.startsWith("/")) return `${baseUrl}/ritms`
      return `${baseUrl}/ritms`
    },
          async jwt({ token, user }: { token: JWT; user: any }) {
            // Persist the Basic Auth credentials to the token right after signin
            if (user) {
              token.basicAuth = user.basicAuth
              token.username = user.username
            }

            return token
          },
    async session({ session, token }: { session: any; token: JWT }) {
      // Send Basic Auth properties to the client
      session.basicAuth = token.basicAuth
      session.username = token.username
      session.error = token.error
      return session
    },
    async signIn() {
      return true
    },
  },
  session: {
    strategy: "jwt" as const,
  },
}
