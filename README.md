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

## ServiceNow Setup

The application uses Basic Authentication to connect to ServiceNow. No special OAuth configuration is required.

### Required Permissions

Ensure your ServiceNow user account has access to the following tables:
- `incident` - For incident management
- `sys_user` - For user management  
- `sc_req_item` - For RITM (Request Item) management
- `change_request` - For change request management

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
