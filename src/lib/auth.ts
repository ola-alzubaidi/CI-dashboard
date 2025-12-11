import { type JWT } from "next-auth/jwt"

export const authOptions = {
  providers: [
    {
      id: "servicenow",
      name: "ServiceNow",
      type: "oauth" as const,
      clientId: process.env.SERVICENOW_CLIENT_ID,
      clientSecret: process.env.SERVICENOW_CLIENT_SECRET,
      authorization: {
        url: `${process.env.SERVICENOW_INSTANCE_URL}/oauth_auth.do`,
        params: {
          response_type: "code",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/servicenow`,
        },
      },
      token: {
        url: `${process.env.SERVICENOW_INSTANCE_URL}/oauth_token.do`,
        async request({ client, params, checks, provider }: any) {
          const response = await fetch(`${process.env.SERVICENOW_INSTANCE_URL}/oauth_token.do`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: params.code as string,
              redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/servicenow`,
              client_id: process.env.SERVICENOW_CLIENT_ID as string,
              client_secret: process.env.SERVICENOW_CLIENT_SECRET as string,
            }),
          })
          
          const tokens = await response.json()
          console.log("Token response:", tokens)
          
          if (tokens.error) {
            throw new Error(tokens.error_description || tokens.error)
          }
          
          return { tokens }
        },
      },
      userinfo: {
        async request({ tokens }: any) {
          console.log("Fetching user info with token:", tokens.access_token?.substring(0, 20) + "...")
          
          const response = await fetch(
            `${process.env.SERVICENOW_INSTANCE_URL}/api/now/table/sys_user?sysparm_limit=1&sysparm_fields=sys_id,user_name,email,first_name,last_name`,
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                Accept: "application/json",
              },
            }
          )
          
          if (!response.ok) {
            console.error("User info fetch failed:", response.status, await response.text())
            return { sub: "oauth-user", name: "OAuth User", email: "user@servicenow.com" }
          }
          
          const data = await response.json()
          console.log("User info response:", data)
          
          const user = data.result?.[0]
          return {
            sub: user?.sys_id || "oauth-user",
            name: user?.user_name || "OAuth User",
            email: user?.email || "user@servicenow.com",
          }
        },
      },
      profile(profile: any) {
        console.log("Profile:", profile)
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        }
      },
    },
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: true,
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log("Redirect callback:", { url, baseUrl })
      return `${baseUrl}/ritms`
    },
    async jwt({ token, user, account }: { token: JWT; user: any; account: any }) {
      console.log("JWT callback:", { hasUser: !!user, hasAccount: !!account })
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      if (user) {
        token.username = user.name
      }
      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      session.accessToken = token.accessToken
      session.username = token.username
      return session
    },
    async signIn({ user, account }: any) {
      console.log("SignIn callback:", { user, hasAccount: !!account })
      return true
    },
  },
  session: {
    strategy: "jwt" as const,
  },
}
