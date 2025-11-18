# Widget System - Like ServiceNow

## What We Need to Build

### 1. Widget Types
- **List Widget** - Shows list of items (RITMs, Incidents, Users)
- **Chart Widget** - Pie chart, bar chart, line chart
- **Metric Widget** - Single number with label (count of items)
- **Table Widget** - Data table with columns
- **Text Widget** - Custom text/markdown

### 2. Widget Structure

```typescript
interface Widget {
  id: string
  type: 'list' | 'chart' | 'metric' | 'table' | 'text'
  title: string
  position: { x: number, y: number, w: number, h: number }
  config: {
    dataSource: 'ritms' | 'incidents' | 'users'
    limit?: number
    filters?: Record<string, string>
    chartType?: 'pie' | 'bar' | 'line' | 'donut'
    displayFields?: string[]
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    refreshInterval?: number
    color?: string
  }
}

interface DashboardConfig {
  id: string
  name: string
  description?: string
  widgets: Widget[]  // Array of widgets
  layout: 'grid' | 'freeform'
  createdAt: string
  updatedAt: string
}
```

### 3. User Experience

**Dashboard View:**
```
┌─────────────────────────────────────────────┐
│  Dashboard Name                  [+ Widget] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐  ┌─────────────┐         │
│  │  Widget 1   │  │  Widget 2   │         │
│  │  [⚙️ Config] │  │  [⚙️ Config] │         │
│  │             │  │             │         │
│  │  List of    │  │  Pie Chart  │         │
│  │  RITMs      │  │             │         │
│  └─────────────┘  └─────────────┘         │
│                                             │
│  ┌─────────────┐  ┌─────────────┐         │
│  │  Widget 3   │  │  Widget 4   │         │
│  │  [⚙️ Config] │  │  [⚙️ Config] │         │
│  │             │  │             │         │
│  │  Metric     │  │  Table      │         │
│  │  Count: 25  │  │             │         │
│  └─────────────┘  └─────────────┘         │
│                                             │
└─────────────────────────────────────────────┘
```

**Widget Configuration Modal:**
```
┌───────────────────────────────────┐
│ ⚙️ Configure Widget               │
├───────────────────────────────────┤
│                                   │
│ Widget Type: [List ▼]             │
│ Widget Title: [High Priority]     │
│                                   │
│ Data Source: [RITMs ▼]            │
│ Item Limit: [20]                  │
│ Sort By: [Priority ▼]             │
│ Sort Order: [Desc ▼]              │
│                                   │
│ Filters:                          │
│ [+ Add Filter]                    │
│ priority = high                   │
│ state = open                      │
│                                   │
│ Display Fields:                   │
│ ☑ Number                          │
│ ☑ Description                     │
│ ☑ Priority                        │
│ ☑ Assigned To                     │
│                                   │
│ [Cancel] [Save Widget]            │
└───────────────────────────────────┘
```

### 4. Features to Implement

**Phase 1: Basic Widgets**
- [ ] Widget type definitions
- [ ] Add widget button on dashboard
- [ ] Widget configuration modal
- [ ] List widget (show RITMs/Incidents/Users)
- [ ] Metric widget (count)
- [ ] Save/load widgets with dashboard

**Phase 2: Advanced Widgets**
- [ ] Chart widgets (pie, bar, line)
- [ ] Table widget with sorting
- [ ] Drag-and-drop widget positioning
- [ ] Resize widgets
- [ ] Widget templates

**Phase 3: Polish**
- [ ] Real-time data updates per widget
- [ ] Widget export/import
- [ ] Widget library/marketplace
- [ ] Widget sharing

### 5. Implementation Plan

1. Update `dashboard.ts` types to include widgets array
2. Create `Widget.tsx` component (base widget container)
3. Create individual widget components:
   - `ListWidget.tsx`
   - `MetricWidget.tsx`
   - `ChartWidget.tsx`
   - `TableWidget.tsx`
4. Create `WidgetConfigModal.tsx`
5. Update dashboard page to display widgets
6. Add "Add Widget" button
7. Enable widget configuration on each widget

---

**This is what ServiceNow does - each dashboard has multiple configurable widgets!**

