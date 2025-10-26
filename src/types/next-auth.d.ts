declare module "next-auth" {
  interface Session {
    basicAuth?: string
    username?: string
    error?: string
  }
}
