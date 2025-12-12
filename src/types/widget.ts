export type WidgetType = 'chart' | 'table' | 'metric' | 'list'

export type ChartType = 'pie' | 'donut' | 'bar' | 'line'

export type LayoutType = 'card' | 'table' | 'list' | 'compact'

export type DataSource = 
  | 'sc_req_item'      // RITMs
  | 'incident'         // Incidents
  | 'change_request'   // Change Requests
  | 'sys_user'         // Users
  | 'problem'          // Problems
  | 'task'             // Tasks

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  'sc_req_item': 'Request Items (RITMs)',
  'incident': 'Incidents',
  'change_request': 'Change Requests',
  'sys_user': 'Users',
  'problem': 'Problems',
  'task': 'Tasks',
}

export const DATA_SOURCE_FIELDS: Record<DataSource, string[]> = {
  'sc_req_item': ['state', 'priority', 'assigned_to', 'category', 'request'],
  'incident': ['state', 'priority', 'assigned_to', 'category', 'severity'],
  'change_request': ['state', 'priority', 'assigned_to', 'type', 'risk'],
  'sys_user': ['department', 'location', 'active', 'title'],
  'problem': ['state', 'priority', 'assigned_to', 'category'],
  'task': ['state', 'priority', 'assigned_to', 'task_type'],
}

export type WidgetSize = 'small' | 'medium' | 'large' | 'full'

export interface Widget {
  id: string
  type: WidgetType
  title: string
  dataSource: DataSource
  size?: WidgetSize
  layout?: LayoutType
  // Chart specific
  chartType?: ChartType
  groupBy?: string
  // Table specific
  columns?: string[]
  // Metric specific
  aggregation?: 'count' | 'sum' | 'avg'
  field?: string
  // Common
  filter?: string
  limit?: number
}

