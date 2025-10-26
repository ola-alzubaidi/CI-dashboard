# Dashboard Management Feature Guide

## Overview
This feature allows users to create, manage, and switch between multiple custom dashboards for testing and viewing ServiceNow data using an intuitive **sidebar navigation**.

## Features Implemented

### 1. **Dashboard Sidebar** (`src/components/DashboardSidebar.tsx`)
- **Collapsible sidebar** for space efficiency
- Create new custom dashboards inline
- Edit existing dashboards
- Delete custom dashboards (except the default)
- Quick switching between dashboards with one click
- Visual indicators for active dashboard
- Hover actions for edit/delete
- Configure dashboard settings:
  - Name and description
  - Type (RITMs, Incidents, Users, Custom)
  - Item limit (1-100)
  - Layout (Grid, List, Table)

### 2. **Dashboard Storage** (`src/lib/dashboardStorage.ts`)
- Local storage-based persistence
- CRUD operations for dashboards
- Default "RITMS Dashboard" always available
- Active dashboard state management

### 3. **Enhanced RITMS Page** (`src/app/ritms/page.tsx`)
- **Sidebar layout** with dashboards on the left
- Main content area displays active dashboard data
- Active dashboard indicator in header
- Dynamic layout based on dashboard settings
- Real-time data refresh
- Responsive design with collapsible sidebar

## How to Use

### Creating a New Dashboard

1. Navigate to the RITMS page (http://localhost:3003/ritms)
2. Look at the **sidebar on the left**
3. Click **"New Dashboard"** button at the top of the sidebar
4. Fill in the inline form:
   - **Name**: Give your dashboard a name (e.g., "Test Dashboard 1")
   - **Description**: Optional description
   - **Type**: Choose data type (RITMs, Incidents, Users, Custom)
   - **Items Limit**: Number of items to fetch (1-100)
   - **Layout**: Grid, List, or Table view
5. Click **"Create"** button
6. Your new dashboard will appear in the sidebar list

### Switching Dashboards

Simply **click on any dashboard** in the sidebar:
- The clicked dashboard becomes active immediately
- The main content area updates with the dashboard's data
- The active dashboard is highlighted in blue
- Dashboard info appears in the header

### Editing a Dashboard

1. **Hover** over any dashboard in the sidebar (except the active one)
2. Click the **Edit** icon (pencil) that appears on the right
3. The dashboard expands into an edit form
4. Modify the name, description, limit, or layout
5. Click the **Check** icon to save, or **X** to cancel

### Deleting a Dashboard

1. **Hover** over any dashboard in the sidebar (except the active one)
2. Click the **Delete** icon (trash) that appears on the right
3. Confirm the deletion when prompted
4. The dashboard will be removed (Default dashboard cannot be deleted)

### Collapsing the Sidebar

To save screen space:
1. Click the **collapse arrow** (◄) at the top of the sidebar
2. The sidebar collapses to show only icons
3. Click any icon to switch dashboards
4. Click the **expand arrow** (►) to restore the full sidebar

## Default Dashboard

The system comes with a default **"RITMS Dashboard"** that:
- Cannot be deleted
- Shows Request Items (RITMs)
- Displays 50 items in grid layout
- Is active by default on first load

## Dashboard Types

### RITMS (Request Items)
- Fetches and displays ServiceNow Request Items
- Uses the `/api/ritms` endpoint
- Shows RITM cards with details

### Incidents
- Designed for future incident tracking
- Can be configured for incident data

### Users
- Designed for user management
- Can be configured for user data

### Custom
- Flexible type for custom implementations
- Can be extended for specific use cases

## Storage

Dashboards are stored in browser's **localStorage** under the key `servicenow_dashboards`. This means:
- ✅ Dashboards persist across page refreshes
- ✅ Each browser has its own dashboard configuration
- ⚠️ Clearing browser data will reset dashboards
- ⚠️ Dashboards are not synced across devices

## Technical Details

### Data Structure

```typescript
interface DashboardConfig {
  id: string
  name: string
  description?: string
  type: 'ritms' | 'incidents' | 'users' | 'custom'
  createdAt: string
  updatedAt: string
  settings: {
    limit?: number
    filters?: Record<string, string>
    layout?: 'grid' | 'list' | 'table'
    refreshInterval?: number
  }
}
```

### Files Added/Modified

**New Files:**
- `src/types/dashboard.ts` - TypeScript types
- `src/lib/dashboardStorage.ts` - Storage utilities
- `src/components/DashboardSidebar.tsx` - Sidebar with dashboard management
- `src/components/DashboardManager.tsx` - Full-page dashboard manager (legacy)
- `src/components/DashboardSelector.tsx` - Dropdown selector (legacy)

**Modified Files:**
- `src/app/ritms/page.tsx` - Integrated sidebar layout

## Future Enhancements

Potential improvements:
1. **API-based storage**: Store dashboards in ServiceNow or database
2. **Dashboard sharing**: Share dashboards between users
3. **Advanced filters**: Add query builders for filtering data
4. **Widgets**: Add customizable widgets to dashboards
5. **Auto-refresh**: Configure automatic data refresh intervals
6. **Export/Import**: Export dashboard configurations as JSON
7. **Dashboard templates**: Pre-built dashboard templates
8. **Chart views**: Add chart and graph visualizations

## Testing Checklist

- [x] Create new dashboard
- [x] Edit dashboard name and description
- [x] Delete custom dashboard
- [x] Switch between dashboards
- [x] Dashboard settings persist after page refresh
- [x] Default dashboard cannot be deleted
- [x] Active dashboard indicator works
- [x] Layout changes (grid/list/table) apply correctly
- [x] Item limit changes fetch correct number of items

## Troubleshooting

**Dashboard not loading?**
- Check browser console for errors
- Clear localStorage and refresh: `localStorage.clear()`
- Ensure you're signed in to ServiceNow

**Data not refreshing?**
- Click the "Refresh Data" button
- Check network tab for API errors
- Verify ServiceNow credentials are valid

**Dashboard changes not saving?**
- Check browser's localStorage is not disabled
- Check console for storage errors
- Try creating a new dashboard to test

