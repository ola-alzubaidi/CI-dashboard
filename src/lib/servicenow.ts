import axios from 'axios'

export interface ServiceNowConfig {
  instanceUrl: string
  token: string
  isOAuth: boolean // true for Bearer token, false for Basic Auth
}

export interface ServiceNowRecord {
  sys_id: string
  number?: string
  short_description?: string
  description?: string
  state?: string
  priority?: string
  created_on?: string
  updated_on?: string
  [key: string]: unknown
}

export interface ServiceNowResponse<T = unknown> {
  result: T[]
}

export class ServiceNowClient {
  private client: ReturnType<typeof axios.create>
  private config: ServiceNowConfig

  constructor(config: ServiceNowConfig) {
    this.config = config
    const authHeader = config.isOAuth 
      ? `Bearer ${config.token}` 
      : `Basic ${config.token}`
    
    this.client = axios.create({
      baseURL: `${config.instanceUrl}/api/now`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader,
      },
    })
  }

  // Get incidents
  async getIncidents(params?: Record<string, unknown> & {
    sysparm_limit?: number
    sysparm_offset?: number
    sysparm_query?: string
    sysparm_fields?: string
  }): Promise<ServiceNowRecord[]> {
    try {
      const response = 
        await this.client.get('/table/incident', { params })
      return (response.data as ServiceNowResponse<ServiceNowRecord>).result
    } catch (error) {
      // Error fetching incidents
      throw error
    }
  }

  // Get users
  async getUsers(params?: {
    sysparm_limit?: number
    sysparm_offset?: number
    sysparm_query?: string
    sysparm_fields?: string
  }): Promise<ServiceNowRecord[]> {
    try {
      const response = 
        await this.client.get('/table/sys_user', { params })
      return (response.data as ServiceNowResponse<ServiceNowRecord>).result
    } catch (error) {
      // Error fetching users
      throw error
    }
  }

  // Get change requests
  async getChangeRequests(params?: {
    sysparm_limit?: number
    sysparm_offset?: number
    sysparm_query?: string
    sysparm_fields?: string
  }): Promise<ServiceNowRecord[]> {
    try {
      const response = 
        await this.client.get('/table/change_request', { params })
      return (response.data as ServiceNowResponse<ServiceNowRecord>).result
    } catch (error) {
      // Error fetching change requests
      throw error
    }
  }

  // Get any table data
  async getTableData(tableName: string, params?: {
    sysparm_limit?: number
    sysparm_offset?: number
    sysparm_query?: string
    sysparm_fields?: string
  }): Promise<ServiceNowRecord[]> {
    try {
      const response = 
        await this.client.get(`/table/${tableName}`, { params })
      return (response.data as ServiceNowResponse<ServiceNowRecord>).result
    } catch (error) {
      // Error fetching data
      throw error
    }
  }

  // Create a record
  async createRecord(tableName: string, data: Partial<ServiceNowRecord>): Promise<ServiceNowRecord> {
    try {
      const response = 
        await this.client.post(`/table/${tableName}`, data)
      return (response.data as { result: ServiceNowRecord }).result
    } catch (error) {
      // Error creating record
      throw error
    }
  }

  // Update a record
  async updateRecord(tableName: string, sysId: string, data: Partial<ServiceNowRecord>): Promise<ServiceNowRecord> {
    try {
      const response = 
        await this.client.patch(`/table/${tableName}/${sysId}`, data)
      return (response.data as { result: ServiceNowRecord }).result
    } catch (error) {
      // Error updating record
      throw error
    }
  }

  // Delete a record
  async deleteRecord(tableName: string, sysId: string): Promise<void> {
    try {
      await this.client.delete(`/table/${tableName}/${sysId}`)
    } catch (error) {
      // Error deleting record
      throw error
    }
  }

  // Get user profile
  async getUserProfile(): Promise<ServiceNowRecord> {
    try {
      const response = 
        await this.client.get('/now/user/profile')
      return (response.data as { result: ServiceNowRecord }).result
    } catch (error) {
      // Error fetching user profile
      throw error
    }
  }

  // Get request items (sc_req_item table)
  async getRequestItems(params?: {
    sysparm_limit?: number
    sysparm_offset?: number
    sysparm_query?: string
    sysparm_fields?: string
  }): Promise<ServiceNowRecord[]> {
    try {
      const response = 
        await this.client.get('/table/sc_req_item', { params })
      return (response.data as ServiceNowResponse<ServiceNowRecord>).result
    } catch (error) {
      // Error fetching request items
      throw error
    }
  }
}

// Utility function to create ServiceNow client from session
export function createServiceNowClient(token: string, isOAuth: boolean = false): ServiceNowClient {
  const instanceUrl = process.env.SERVICENOW_INSTANCE_URL!
  
  if (!instanceUrl) {
    throw new Error('SERVICENOW_INSTANCE_URL environment variable is not set')
  }

  return new ServiceNowClient({
    instanceUrl,
    token,
    isOAuth,
  })
}
