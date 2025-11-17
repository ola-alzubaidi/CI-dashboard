# Vercel Deployment Guide

This guide will help you deploy your ServiceNow Integration App to Vercel with your new repository.

---

## Option 1: Create New Vercel Project (Recommended)

### Step 1: Go to Vercel Dashboard

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with your account
3. Click **"Add New"** → **"Project"**

### Step 2: Import Your New Repository

1. In the "Import Git Repository" section:
   - Click **"Import"** next to your new repository
   - If you don't see it, click **"Adjust GitHub App Permissions"** to grant Vercel access
   
2. Select your repository from the list

### Step 3: Configure Project Settings

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (auto-filled)

**Output Directory:** `.next` (auto-filled)

**Install Command:** `npm install` (auto-filled)

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add the following:

**Required Variables:**

```env
# ServiceNow Configuration
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com

# NextAuth Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your_secure_secret_here_change_this

# App Configuration
NEXT_PUBLIC_APP_NAME=ServiceNow Integration
```

**Important Notes:**
- ⚠️ `NEXTAUTH_URL` should be your Vercel app URL (you can update this after first deployment)
- ⚠️ Generate a new `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- ⚠️ Never commit `.env.local` to git - these secrets should only be in Vercel

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (2-3 minutes)
3. Once deployed, you'll get a URL like: `https://your-app-name.vercel.app`

### Step 6: Update NEXTAUTH_URL

After first deployment:
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Update `NEXTAUTH_URL` to your actual Vercel URL
4. Click **Save**
5. Redeploy (Vercel → Deployments → Click "..." → Redeploy)

---

## Option 2: Update Existing Vercel Project

If you want to keep the same Vercel project but point it to your new repository:

### Step 1: Disconnect Old Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your existing project
3. Go to **Settings** → **Git**
4. Scroll to **"Disconnect Git Repository"**
5. Click **"Disconnect"**

### Step 2: Connect New Repository

1. Still in Settings → Git
2. Click **"Connect Git Repository"**
3. Select your new repository
4. Click **"Connect"**

### Step 3: Verify and Deploy

1. Verify environment variables are still correct (Settings → Environment Variables)
2. Go to **Deployments** tab
3. Click **"Redeploy"** or push a new commit to trigger deployment

---

## Environment Variables Setup

### Generate NEXTAUTH_SECRET

Use one of these methods:

**Method 1: Using OpenSSL (Mac/Linux)**
```bash
openssl rand -base64 32
```

**Method 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 3: Online Generator**
Visit: https://generate-secret.vercel.app/32

### Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVICENOW_INSTANCE_URL` | Your ServiceNow instance URL | `https://dev12345.service-now.com` |
| `NEXTAUTH_URL` | Your Vercel deployment URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret key for JWT signing | `abc123...xyz` (32+ characters) |
| `NEXT_PUBLIC_APP_NAME` | App display name | `ServiceNow Integration` |

**Optional (for OAuth):**
| Variable | Description |
|----------|-------------|
| `SERVICENOW_CLIENT_ID` | OAuth client ID from ServiceNow |
| `SERVICENOW_CLIENT_SECRET` | OAuth client secret |
| `AUTH_METHOD` | Set to `oauth` to use OAuth instead of Basic Auth |

---

## Custom Domain (Optional)

### Add Your Own Domain

1. In Vercel project settings, go to **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `servicenow.yourcompany.com`)
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` to your custom domain
6. Redeploy

---

## Deployment Configuration

### vercel.json (Optional)

If you need custom configuration, create `vercel.json` in your root:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_NAME": "ServiceNow Integration"
  }
}
```

### .vercelignore (Optional)

Create `.vercelignore` to exclude files from deployment:

```
node_modules
.env.local
.env*.local
*.log
.DS_Store
.vscode
.idea
coverage
.next
out
```

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] ✅ App loads at Vercel URL
- [ ] ✅ Can reach sign-in page
- [ ] ✅ Can sign in with ServiceNow credentials
- [ ] ✅ Can fetch data (incidents, users, RITMs)
- [ ] ✅ Dashboards load correctly
- [ ] ✅ No console errors
- [ ] ✅ Environment variables are correct

---

## Troubleshooting

### Issue: "Invalid Environment Variables"

**Cause:** Missing or incorrect environment variables

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Verify all required variables are set
3. Check for typos
4. Redeploy after fixing

### Issue: "Authentication Error" or "Failed to fetch"

**Cause:** `NEXTAUTH_URL` doesn't match actual URL

**Solution:**
1. Update `NEXTAUTH_URL` to match your Vercel URL exactly
2. Include `https://` prefix
3. No trailing slash
4. Redeploy

### Issue: "CORS Error" when calling ServiceNow

**Cause:** ServiceNow needs to allow your Vercel domain

**Solution:**
1. Log into ServiceNow as admin
2. Navigate to **System Definition** → **System Properties**
3. Find `glide.rest.cors.origin`
4. Add your Vercel URL: `https://your-app.vercel.app`
5. Save

### Issue: Build Fails

**Common causes:**
- Missing dependencies in `package.json`
- TypeScript errors
- Linter errors

**Solution:**
1. Run locally: `npm run build`
2. Fix any errors
3. Push fixes to repository
4. Vercel will auto-redeploy

### Issue: "Module not found" errors

**Cause:** Case-sensitive imports or missing files

**Solution:**
1. Check import paths match actual file names (case-sensitive)
2. Verify all imported files exist
3. Check `tsconfig.json` paths

---

## Continuous Deployment

Vercel automatically deploys:
- ✅ **Main branch:** Every push to `main` → Production deployment
- ✅ **Other branches:** Every push → Preview deployment
- ✅ **Pull requests:** Automatic preview deployments

### Disable Auto-Deploy (Optional)

If you want manual control:
1. Go to Settings → Git
2. Toggle **"Production Branch"**
3. Select deployment mode

---

## Monitoring & Logs

### View Deployment Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click **Deployments**
4. Click on a deployment
5. View build logs and runtime logs

### View Runtime Logs

1. In deployment details
2. Click **"Functions"** tab
3. Click on a function to see logs
4. Use for debugging API routes

---

## Performance Optimization

### Enable Edge Functions (Optional)

For better global performance:

1. Update your API routes to use Edge Runtime:

```typescript
// src/app/api/servicenow/incidents/route.ts
export const runtime = 'edge'  // Add this line

export async function GET(request: NextRequest) {
  // Your code
}
```

**Note:** Not all Node.js APIs work in Edge runtime. Test thoroughly.

### Enable Caching

Add caching headers to API routes:

```typescript
export async function GET() {
  const data = await fetchData()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
```

---

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use different secrets for dev/prod
- ✅ Rotate `NEXTAUTH_SECRET` periodically
- ✅ Restrict ServiceNow user permissions

### 2. HTTPS Only
- ✅ Vercel provides free SSL/TLS
- ✅ Always use `https://` in `NEXTAUTH_URL`
- ✅ Configure ServiceNow to require HTTPS

### 3. CORS Configuration
- ✅ Only allow your Vercel domain in ServiceNow
- ✅ Don't use wildcard (`*`) in production

### 4. Rate Limiting
Consider adding rate limiting to API routes:

```typescript
// Example: Simple rate limiting
const requestCounts = new Map()

export async function GET(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const count = requestCounts.get(ip) || 0
  
  if (count > 100) {
    return new Response('Too many requests', { status: 429 })
  }
  
  requestCounts.set(ip, count + 1)
  // Your logic here
}
```

---

## Vercel CLI (Optional)

Install Vercel CLI for command-line deployments:

```bash
# Install globally
npm i -g vercel

# Login
vercel login

# Deploy from terminal
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

---

## Quick Reference Commands

```bash
# Test build locally before deploying
npm run build
npm run start

# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# View Vercel CLI help
vercel --help

# Pull environment variables from Vercel
vercel env pull .env.local
```

---

## Migration Checklist

Moving from old repo to new repo:

- [ ] ✅ New repository created
- [ ] ✅ Code pushed to new repository
- [ ] ✅ Old Vercel project disconnected (or new project created)
- [ ] ✅ New repository connected to Vercel
- [ ] ✅ Environment variables configured
- [ ] ✅ `NEXTAUTH_SECRET` generated and added
- [ ] ✅ `NEXTAUTH_URL` set to Vercel URL
- [ ] ✅ ServiceNow CORS updated with new Vercel URL
- [ ] ✅ First deployment successful
- [ ] ✅ `NEXTAUTH_URL` updated after first deploy
- [ ] ✅ Redeployed with correct URL
- [ ] ✅ Tested authentication
- [ ] ✅ Tested data fetching
- [ ] ✅ All features working

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **NextAuth.js Deployment:** https://next-auth.js.org/deployment
- **Vercel Support:** https://vercel.com/support

---

## Summary

**Easiest Path:**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your new repository
4. Add environment variables
5. Deploy
6. Update `NEXTAUTH_URL` after first deploy
7. Redeploy

**Total time:** ~10 minutes

**Costs:** Free for personal projects (Hobby plan)

---

**Need help? Check the troubleshooting section or Vercel's documentation!**

