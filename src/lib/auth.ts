import { type JWT } from "next-auth/jwt"

// ServiceNow OAuth Provider
const ServiceNowOAuthProvider = {
  id: "servicenow",
  name: "ServiceNow",
  type: "oauth" as const,
  authorization: {
    url: `${process.env.SERVICENOW_INSTANCE_URL}/oauth_auth.do`,
    params: {
      response_type: "code",
      scope: "useraccount",
    },
  },
  token: {
    url: `${process.env.SERVICENOW_INSTANCE_URL}/oauth_token.do`,
  },
  userinfo: {
    url: `${process.env.SERVICENOW_INSTANCE_URL}/api/now/table/sys_user`,
    async request({ tokens, provider }: any) {
      const response = await fetch(
        `${process.env.SERVICENOW_INSTANCE_URL}/api/now/table/sys_user?sysparm_query=user_name=${tokens.access_token_owner}&sysparm_fields=sys_id,user_name,email,first_name,last_name&sysparm_limit=1`,
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            Accept: "application/json",
          },
        }
      )
      const data = await response.json()
      return data.result?.[0] || {}
    },
  },
  clientId: process.env.SERVICENOW_CLIENT_ID,
  clientSecret: process.env.SERVICENOW_CLIENT_SECRET,
  profile(profile: any, tokens: any) {
    return {
      id: profile.sys_id || profile.user_name,
      name: profile.user_name || profile.first_name,
      email: profile.email || `${profile.user_name}@servicenow.com`,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    }
  },
}

export const authOptions = {
  providers: [ServiceNowOAuthProvider],
  logger: {
    error: (_code: string, _metadata: any) => {
      // Log errors in production
    },
    warn: (_code: string) => {
      // Log warnings in production
    },
    debug: (_code: string, _metadata: any) => {
      // Debug logging disabled
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: false,
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith(baseUrl)) return `${baseUrl}/ritms`
      else if (url.startsWith("/")) return `${baseUrl}/ritms`
      return `${baseUrl}/ritms`
    },
    async jwt({ token, user, account }: { token: JWT; user: any; account: any }) {
      // Persist OAuth tokens to the JWT
      if (account && user) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.username = user.name
      }
      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      // Send OAuth properties to the client
      session.accessToken = token.accessToken
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
