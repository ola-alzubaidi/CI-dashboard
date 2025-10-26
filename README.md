# ServiceNow Integration App

A modern Next.js 16 application that connects to ServiceNow instances using Basic Authentication to manage incidents, users, RITMs (Request Items), and other ServiceNow data with customizable dashboards.

## Features

- **Basic Authentication**: Secure connection to ServiceNow using Basic Auth
- **Custom Dashboard Management**: Create, edit, and switch between multiple dashboards
- **Multi-Data Support**: View and manage ServiceNow incidents, users, and RITMs
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components
- **TypeScript Support**: Full type safety throughout the application
- **Real-time Data**: Live data from your ServiceNow instance
- **Local Storage**: Dashboard configurations persist across sessions
- **Next.js 16**: Latest Next.js with Turbopack for faster development

## Prerequisites

- Node.js 18+ 
- A ServiceNow instance with API access enabled
- ServiceNow user account with appropriate permissions to access the required tables

## ServiceNow Configuration

The application supports both Basic Authentication and OAuth 2.0 for connecting to ServiceNow. Choose the authentication method that best fits your security requirements.

### Authentication Methods

#### Option 1: Basic Authentication (Current Implementation)
Simple username/password authentication - easier to set up but less secure for production.

#### Option 2: OAuth 2.0 (Recommended for Production)
More secure authentication method using client credentials and access tokens.

---

## Basic Authentication Setup

Follow these steps if you want to use Basic Authentication (current default implementation).

### 1. ServiceNow Instance Setup

#### Enable REST API Access
1. Log into your ServiceNow instance as an administrator
2. Navigate to **System Definition** > **System Properties**
3. Search for and verify these properties are set:
   - `glide.rest.enable` = `true` (Enable REST API)
   - `glide.rest.require_authentication` = `true` (Require authentication)
   - `glide.rest.allow_cors` = `true` (Allow CORS for web requests)

#### Configure CORS (Cross-Origin Resource Sharing)
1. Navigate to **System Definition** > **System Properties**
2. Set the following properties:
   - `glide.rest.cors.enable` = `true`
   - `glide.rest.cors.origin` = `http://localhost:3000,http://localhost:3001` (add your app URLs)
   - `glide.rest.cors.credentials` = `true`

### 2. User Account Configuration

#### Create or Configure Integration User
1. Navigate to **User Administration** > **Users**
2. Create a new user or use an existing one for the integration
3. Ensure the user has the following roles:
   - `rest_service` - For REST API access
   - `itil` - For ITIL table access
   - `user_admin` - For user management (if needed)

#### Required Table Permissions
Ensure your ServiceNow user account has **read** access to the following tables:
- `incident` - For incident management
- `sys_user` - For user management  
- `sc_req_item` - For RITM (Request Item) management
- `change_request` - For change request management

### 3. API Access Configuration

#### Enable Table API Access
1. Navigate to **System Definition** > **Tables**
2. For each required table (`incident`, `sys_user`, `sc_req_item`, `change_request`):
   - Click on the table name
   - Go to **Access Control** tab
   - Ensure your integration user has **read** permissions
   - Verify **REST API** access is enabled

#### Configure REST API Security
1. Navigate to **System Security** > **REST API Security**
2. Create a new REST API security rule if needed:
   - **Name**: ServiceNow Integration App
   - **Table**: `*` (all tables) or specific tables
   - **Operation**: `read`
   - **Roles**: Include your integration user's roles

### 4. Testing API Access

#### Test Basic Authentication
You can test your ServiceNow API access using curl:

```bash
# Test user authentication and table access
curl -u "your_username:your_password" \
  -H "Accept: application/json" \
  -X GET \
  "https://your-instance.service-now.com/api/now/table/sys_user?sysparm_limit=1"
```

#### Test Specific Tables
```bash
# Test incidents table
curl -u "your_username:your_password" \
  -H "Accept: application/json" \
  -X GET \
  "https://your-instance.service-now.com/api/now/table/incident?sysparm_limit=1"

# Test RITMs table
curl -u "your_username:your_password" \
  -H "Accept: application/json" \
  -X GET \
  "https://your-instance.service-now.com/api/now/table/sc_req_item?sysparm_limit=1"
```

### 5. Security Considerations

#### Best Practices
- Use a dedicated integration user account (not a personal account)
- Grant only the minimum required permissions
- Regularly rotate integration user passwords
- Monitor API usage through ServiceNow logs
- Consider using ServiceNow's OAuth 2.0 for production environments

#### Network Security
- Ensure your ServiceNow instance is accessible from your application's network
- Configure firewall rules if necessary
- Use HTTPS for all API communications
- Consider IP whitelisting for additional security

### 6. Troubleshooting ServiceNow Configuration

#### Common Issues
1. **401 Unauthorized**: Check username/password and user permissions
2. **403 Forbidden**: Verify table access permissions and REST API security rules
3. **CORS Errors**: Ensure CORS is properly configured in ServiceNow
4. **404 Not Found**: Verify the ServiceNow instance URL is correct

#### Debug Steps
1. Check ServiceNow system logs: **System Logs** > **All**
2. Verify REST API security rules: **System Security** > **REST API Security**
3. Test API access using curl or Postman
4. Check user roles and permissions: **User Administration** > **Users**

---

## OAuth 2.0 Setup (Recommended for Production)

Follow these steps to configure OAuth 2.0 authentication with ServiceNow.

### 1. Create OAuth Application in ServiceNow

#### Step 1: Create OAuth Application Registry Entry
1. Log into your ServiceNow instance as an administrator
2. Navigate to **System OAuth** > **Application Registry**
3. Click **New** to create a new OAuth application
4. Fill in the following details:
   - **Name**: `ServiceNow Integration App`
   - **Client ID**: `servicenow-integration-app` (or generate a unique ID)
   - **Client Secret**: Generate a secure client secret (save this!)
   - **Redirect URL**: `http://localhost:3000/api/auth/callback/servicenow` (for development)
   - **Active**: ✅ Check this box
   - **Accessible from**: `All application scopes`
5. Click **Submit**

#### Step 2: Configure OAuth Provider
1. Navigate to **System OAuth** > **OAuth Providers**
2. Ensure the default OAuth provider is configured for your instance
3. If needed, create a new provider with these settings:
   - **Name**: `ServiceNow OAuth Provider`
   - **Client ID**: Use the same Client ID from step 1
   - **Client Secret**: Use the same Client Secret from step 1
   - **Authorization URL**: `https://your-instance.service-now.com/oauth_auth.do`
   - **Token URL**: `https://your-instance.service-now.com/oauth_token.do`
   - **User Info URL**: `https://your-instance.service-now.com/api/now/table/sys_user`

### 2. Configure OAuth Scopes and Permissions

#### Set OAuth Scopes
1. In your OAuth Application Registry entry, go to the **OAuth Scopes** tab
2. Add the following scopes:
   - `useraccount` - For user account access
   - `global` - For global access (if needed)
   - Custom scopes for specific tables if required

#### Configure User Permissions
1. Navigate to **User Administration** > **Users**
2. Find your integration user account
3. Ensure the user has these roles:
   - `rest_service` - For REST API access
   - `itil` - For ITIL table access
   - `oauth_scope` - For OAuth scope access

### 3. Environment Variables for OAuth

Create or update your `.env.local` file with the following OAuth variables:

```env
# ServiceNow OAuth Configuration
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com
SERVICENOW_CLIENT_ID=your_client_id_from_servicenow
SERVICENOW_CLIENT_SECRET=your_client_secret_from_servicenow
SERVICENOW_REDIRECT_URI=http://localhost:3000/api/auth/callback/servicenow

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_generate_a_secure_random_string

# App Configuration
NEXT_PUBLIC_APP_NAME="ServiceNow Integration"

# Authentication Method (set to 'oauth' to use OAuth instead of Basic Auth)
AUTH_METHOD=oauth
```

### 4. Testing OAuth Configuration

#### Test OAuth Flow
1. Start your application: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign in with ServiceNow"
4. You should be redirected to ServiceNow's OAuth authorization page
5. After authorization, you should be redirected back to your application

#### Test API Access with OAuth Token
You can test OAuth token access using curl:

```bash
# First, get an access token (this would normally be done by the app)
# Then test API access with the token
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json" \
  -X GET \
  "https://your-instance.service-now.com/api/now/table/sys_user?sysparm_limit=1"
```

### 5. OAuth Troubleshooting

#### Common OAuth Issues
1. **Invalid Client ID/Secret**: Verify the credentials in ServiceNow match your `.env.local`
2. **Redirect URI Mismatch**: Ensure the redirect URI in ServiceNow exactly matches your app's callback URL
3. **Scope Issues**: Verify the OAuth scopes are properly configured
4. **CORS Issues**: Ensure CORS is enabled for OAuth endpoints

#### Debug OAuth Flow
1. Check ServiceNow OAuth logs: **System Logs** > **OAuth**
2. Verify OAuth application registry settings
3. Test OAuth endpoints manually using Postman or curl
4. Check browser network tab for OAuth redirect flow

---

## Required Environment Variables

### For Basic Authentication (Current Default)
```env
# ServiceNow Configuration
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_generate_a_secure_random_string

# App Configuration
NEXT_PUBLIC_APP_NAME="ServiceNow Integration"
```

### For OAuth 2.0 Authentication
```env
# ServiceNow OAuth Configuration
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com
SERVICENOW_CLIENT_ID=your_client_id_from_servicenow
SERVICENOW_CLIENT_SECRET=your_client_secret_from_servicenow
SERVICENOW_REDIRECT_URI=http://localhost:3000/api/auth/callback/servicenow

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_generate_a_secure_random_string

# App Configuration
NEXT_PUBLIC_APP_NAME="ServiceNow Integration"

# Authentication Method
AUTH_METHOD=oauth
```

### Environment Variable Descriptions

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SERVICENOW_INSTANCE_URL` | Your ServiceNow instance URL | ✅ Yes | `https://mycompany.service-now.com` |
| `SERVICENOW_CLIENT_ID` | OAuth Client ID from ServiceNow | OAuth only | `servicenow-integration-app` |
| `SERVICENOW_CLIENT_SECRET` | OAuth Client Secret from ServiceNow | OAuth only | `abc123def456...` |
| `SERVICENOW_REDIRECT_URI` | OAuth redirect URI | OAuth only | `http://localhost:3000/api/auth/callback/servicenow` |
| `NEXTAUTH_URL` | Your application's base URL | ✅ Yes | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | ✅ Yes | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_NAME` | Application display name | ✅ Yes | `"ServiceNow Integration"` |
| `AUTH_METHOD` | Authentication method to use | Optional | `oauth` or `basic` |

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd servicenow-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:

```env
# ServiceNow Configuration
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_generate_a_secure_random_string

# App Configuration
NEXT_PUBLIC_APP_NAME="ServiceNow Integration"
```

**Note**: The application uses Basic Authentication, so you'll enter your ServiceNow username and password directly in the login form.

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Enter your ServiceNow username and password to authenticate

4. Once authenticated, you'll be redirected to the RITMs dashboard where you can:
   - View your ServiceNow data
   - Create custom dashboards using the sidebar
   - Switch between different dashboard configurations

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth.js configuration
│   │   ├── ritms/                  # RITM API endpoint
│   │   └── servicenow/             # ServiceNow API endpoints
│   ├── auth/                       # Authentication pages
│   ├── ritms/                      # RITM dashboard page
│   └── page.tsx                    # Home page with authentication
├── components/
│   ├── Dashboard.tsx               # Main dashboard component
│   ├── DashboardBuilder.tsx        # Dashboard creation component
│   ├── DashboardManager.tsx        # Dashboard management component
│   ├── DashboardSelector.tsx       # Dashboard selection component
│   ├── DashboardSidebar.tsx        # Sidebar navigation component
│   ├── IncidentCard.tsx            # Incident display component
│   ├── RequestItemCard.tsx         # RITM display component
│   ├── RequestItemTable.tsx        # RITM table component
│   ├── SessionProvider.tsx         # NextAuth session provider
│   ├── UserCard.tsx                # User display component
│   └── ui/                         # Reusable UI components
├── lib/
│   ├── auth.ts                     # Authentication configuration
│   ├── dashboardStorage.ts         # Dashboard storage management
│   ├── servicenow.ts               # ServiceNow API client
│   └── utils.ts                    # Utility functions
└── types/
    ├── dashboard.ts                # Dashboard type definitions
    └── next-auth.d.ts              # NextAuth type extensions
```

## API Endpoints

The application provides the following API endpoints:

- `GET /api/servicenow/incidents` - Fetch incidents from ServiceNow
- `GET /api/servicenow/users` - Fetch users from ServiceNow  
- `GET /api/servicenow/profile` - Get current user profile
- `GET /api/servicenow/request-items` - Fetch RITMs (Request Items) from ServiceNow
- `GET /api/ritms` - Fetch RITMs with pagination support

All endpoints require authentication and use Basic Auth for ServiceNow API calls.

## Dashboard Management

The application features a comprehensive dashboard management system:

### Creating Dashboards
- Use the sidebar to create new custom dashboards
- Configure dashboard type (RITMs, Incidents, Users, Custom)
- Set item limits and layout preferences
- Dashboards are stored locally and persist across sessions

### Dashboard Features
- **Collapsible Sidebar**: Space-efficient navigation
- **Quick Switching**: One-click dashboard switching
- **Inline Editing**: Edit dashboard settings directly in the sidebar
- **Visual Indicators**: Clear active dashboard identification
- **Default Dashboard**: Always-available "RITMS Dashboard"

For detailed dashboard management instructions, see [DASHBOARD_FEATURE_GUIDE.md](./DASHBOARD_FEATURE_GUIDE.md).

## Customization

### Adding New Tables

To fetch data from additional ServiceNow tables:

1. Add a new method to the `ServiceNowClient` class in `src/lib/servicenow.ts`
2. Create a corresponding API route in `src/app/api/servicenow/`
3. Add UI components to display the data

### Styling

The application uses Tailwind CSS and Radix UI components for styling. You can customize the appearance by modifying the Tailwind classes in the components.

### Technology Stack

- **Next.js 16**: Latest version with Turbopack for faster builds
- **React 19**: Latest React with improved performance
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **NextAuth.js**: Authentication framework
- **Axios**: HTTP client for API calls
- **Lucide React**: Icon library

## Troubleshooting

### Common Issues

1. **Authentication Failed**: 
   - Verify your ServiceNow username and password are correct
   - Ensure your ServiceNow instance URL is accessible
   - Check that your user account has proper permissions for the required tables

2. **API Errors**: 
   - Verify that your ServiceNow instance URL is correctly set in `.env.local`
   - Ensure your user has access to the required ServiceNow tables
   - Check that the ServiceNow instance allows API access

3. **Dashboard Issues**:
   - Clear browser local storage if dashboards aren't loading
   - Check browser console for any JavaScript errors

### Environment Variables

Make sure all required environment variables are set in your `.env.local` file:

```env
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secure_secret_here
NEXT_PUBLIC_APP_NAME="ServiceNow Integration"
```

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

### Code Quality

The project uses:
- **ESLint 9** with TypeScript support for code linting
- **TypeScript** for type safety
- **Prettier** (recommended) for code formatting

## Recent Updates

- ✅ **Upgraded to Next.js 16** with Turbopack for faster development
- ✅ **Upgraded to React 19** for improved performance
- ✅ **Enhanced Dashboard Management** with sidebar navigation
- ✅ **Added RITM Support** for Request Item management
- ✅ **Improved Authentication** with Basic Auth integration
- ✅ **Code Cleanup** - Removed debug logs and unused dependencies
- ✅ **Updated Dependencies** to latest stable versions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure the build passes (`npm run build`)
5. Run linting (`npm run lint`)
6. Submit a pull request

## License

This project is licensed under the MIT License.
