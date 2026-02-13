"use client"

import { useState, useEffect, Fragment } from "react"
import { ServiceNowRecord } from "@/lib/servicenow"
import { 
  FileText,
  ExternalLink,
  User,
  Zap,
  CheckCircle2,
  Mail,
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  Network,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DiscoveryWorkflowProps {
  requestItems: ServiceNowRecord[]
  instanceUrl?: string
}

type Phase = 'new' | 'email_1' | 'email_2' | 'email_3' | 'escalation' | 'response_received' | 'completed'

interface WorkflowState {
  phase: Phase
  startDate: string
  email1Date?: string
  email2Date?: string
  email3Date?: string
  hostIP?: string
  networkType?: 'N' | 'F'
  notes?: string
}

const PHASE_LABELS: Record<Phase, string> = {
  new: 'Escalated',
  email_1: 'Email 1 Sent',
  email_2: 'Email 2 Sent',
  email_3: 'Email 3 Sent',
  escalation: 'Escalated',
  response_received: 'Response received',
  completed: 'Completed'
}

// Automation schedule (days)
const SCHEDULE = {
  email1ToEmail2: 7,
  email2ToEmail3: 7,
  email3ToEscalation: 3
}

export function DiscoveryWorkflow({ requestItems, instanceUrl }: DiscoveryWorkflowProps) {
  const [workflowStates, setWorkflowStates] = useState<Record<string, WorkflowState>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [demoMode, setDemoMode] = useState(false)
  const [ipModal, setIpModal] = useState<{ ritmId: string; ritm: ServiceNowRecord } | null>(null)
  const [ipInput, setIpInput] = useState('')
  const [ipNetworkType, setIpNetworkType] = useState<'N' | 'F'>('N')
  const [ipNotes, setIpNotes] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const extractSysId = (ritm: ServiceNowRecord): string => {
    const sysId = ritm.sys_id
    if (typeof sysId === 'object' && sysId !== null) {
      return (sysId as any)?.value || (sysId as any)?.display_value || ''
    }
    return String(sysId || '')
  }

  // Map ServiceNow u_discovery_status to our Phase
  const snStatusToPhase = (sn: string): Phase => {
    const v = (sn || '').toLowerCase()
    if (v === 'email_1_sent') return 'email_1'
    if (v === 'email_2_sent') return 'email_2'
    if (v === 'email_3_sent') return 'email_3'
    if (v === 'escalated') return 'escalation'
    if (v === 'response_received') return 'response_received'
    if (v === 'completed') return 'completed'
    return 'new'
  }

  const getSnField = (ritm: ServiceNowRecord, key: string): string => {
    const raw = (ritm as any)[key]
    if (raw == null) return ''
    if (typeof raw === 'object') return (raw as any)?.value ?? (raw as any)?.display_value ?? ''
    return String(raw)
  }

  // Persist workflow state to ServiceNow (app automation)
  const persistToServiceNow = async (ritmId: string, payload: { u_discovery_status?: string; u_last_email_date?: string; u_host_ip?: string; u_network_type?: string; u_notes?: string }) => {
    try {
      await fetch(`/api/ritms/${ritmId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (e) {
      console.warn('Failed to persist RITM to ServiceNow:', e)
    }
  }

  useEffect(() => {
    const newStates: Record<string, WorkflowState> = {}
    const discoveryRitms = requestItems.filter(r => {
      const cat = r.cat_item
      const catName = typeof cat === 'object' ? (cat as any)?.display_value?.toLowerCase() || '' : String(cat || '').toLowerCase()
      return catName.includes('initiate discovery') || catName.includes('discovery process')
    })

    requestItems.forEach(ritm => {
      const ritmSysId = extractSysId(ritm)
      if (!workflowStates[ritmSysId]) {
        const snStatus = getSnField(ritm, 'u_discovery_status')
        const snLastEmail = getSnField(ritm, 'u_last_email_date')
        const phaseFromSn = snStatus ? snStatusToPhase(snStatus) : null

        if (demoMode && discoveryRitms.includes(ritm)) {
          const idx = discoveryRitms.indexOf(ritm)
          const past = new Date()
          past.setDate(past.getDate() - 10)
          if (idx === 0) {
            newStates[ritmSysId] = { phase: 'response_received', startDate: past.toISOString() }
          } else if (idx === 1) {
            newStates[ritmSysId] = { phase: 'email_1', startDate: past.toISOString(), email1Date: past.toISOString() }
          } else if (idx === 2) {
            const past8 = new Date()
            past8.setDate(past8.getDate() - 8)
            newStates[ritmSysId] = { phase: 'email_2', startDate: past8.toISOString(), email1Date: new Date(past8.getTime() - 7 * 86400000).toISOString(), email2Date: past8.toISOString() }
          } else {
            newStates[ritmSysId] = { phase: 'new', startDate: ritm.sys_created_on ? String(ritm.sys_created_on) : new Date().toISOString() }
          }
        } else if (phaseFromSn && phaseFromSn !== 'new') {
          const startDate = ritm.sys_created_on ? String(ritm.sys_created_on) : new Date().toISOString()
          const lastDate = snLastEmail || undefined
          const hostIP = getSnField(ritm, 'u_host_ip') || undefined
          const networkType = (getSnField(ritm, 'u_network_type') === 'F' ? 'F' : 'N') as 'N' | 'F'
          const notes = getSnField(ritm, 'u_notes') || undefined
          newStates[ritmSysId] = {
            phase: phaseFromSn,
            startDate,
            ...(phaseFromSn === 'email_1' && lastDate && { email1Date: lastDate }),
            ...(phaseFromSn === 'email_2' && lastDate && { email2Date: lastDate }),
            ...(phaseFromSn === 'email_3' && lastDate && { email3Date: lastDate }),
            ...(hostIP && { hostIP }),
            ...(networkType && { networkType }),
            ...(notes && { notes })
          }
        } else {
          newStates[ritmSysId] = { phase: 'new', startDate: ritm.sys_created_on ? String(ritm.sys_created_on) : new Date().toISOString() }
        }
      }
    })
    if (Object.keys(newStates).length > 0) {
      setWorkflowStates(prev => ({ ...prev, ...newStates }))
    }
  }, [requestItems, demoMode])

  const getState = (ritmId: string): WorkflowState => {
    return workflowStates[ritmId] || { phase: 'new', startDate: new Date().toISOString() }
  }

  const updateState = (ritmId: string, updates: Partial<WorkflowState>) => {
    setWorkflowStates(prev => ({
      ...prev,
      [ritmId]: { ...getState(ritmId), ...updates }
    }))
  }

  // Automation: next action due date and overdue
  const getActionDueInfo = (ritm: ServiceNowRecord): { dueDate: Date | null; daysOverdue: number; nextAction: string } => {
    const state = getState(extractSysId(ritm))
    const now = new Date()

    switch (state.phase) {
      case 'new':
        return { dueDate: new Date(state.startDate), daysOverdue: 0, nextAction: 'Send Email 1' }
      case 'email_1':
        if (state.email1Date) {
          const dueDate = new Date(state.email1Date)
          dueDate.setDate(dueDate.getDate() + SCHEDULE.email1ToEmail2)
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return { dueDate, daysOverdue: Math.max(0, daysOverdue), nextAction: 'Send Email 2' }
        }
        return { dueDate: null, daysOverdue: 0, nextAction: 'Send Email 2' }
      case 'email_2':
        if (state.email2Date) {
          const dueDate = new Date(state.email2Date)
          dueDate.setDate(dueDate.getDate() + SCHEDULE.email2ToEmail3)
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return { dueDate, daysOverdue: Math.max(0, daysOverdue), nextAction: 'Send Email 3' }
        }
        return { dueDate: null, daysOverdue: 0, nextAction: 'Send Email 3' }
      case 'email_3':
        if (state.email3Date) {
          const dueDate = new Date(state.email3Date)
          dueDate.setDate(dueDate.getDate() + SCHEDULE.email3ToEscalation)
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return { dueDate, daysOverdue: Math.max(0, daysOverdue), nextAction: 'Escalate' }
        }
        return { dueDate: null, daysOverdue: 0, nextAction: 'Escalate' }
      case 'response_received':
        return { dueDate: null, daysOverdue: 0, nextAction: 'Schedule TEM / Complete' }
      default:
        return { dueDate: null, daysOverdue: 0, nextAction: '' }
    }
  }

  const isOverdue = (ritm: ServiceNowRecord): boolean => {
    if (!isDiscoveryItem(ritm)) return false
    const { daysOverdue } = getActionDueInfo(ritm)
    return daysOverdue > 0
  }

  const getFieldValue = (field: unknown): string => {
    if (!field) return '—'
    if (typeof field === 'object' && field !== null) {
      return (field as any)?.display_value || (field as any)?.value || (field as any)?.name || '—'
    }
    return String(field) || '—'
  }

  const getRitmNumber = (ritm: ServiceNowRecord): string => getFieldValue(ritm.number)
  const getCatalogItem = (ritm: ServiceNowRecord): string => getFieldValue(ritm.cat_item)
  const getRequesterName = (ritm: ServiceNowRecord): string => getFieldValue(ritm.requested_for)
  const getRitmState = (ritm: ServiceNowRecord): string => getFieldValue(ritm.state)

  const isDiscoveryItem = (ritm: ServiceNowRecord): boolean => {
    const catItem = getCatalogItem(ritm).toLowerCase()
    return catItem.includes('initiate discovery') || catItem.includes('discovery process')
  }

  const getUrl = (sysId: string) => {
    if (!instanceUrl) return null
    return `${instanceUrl}/nav_to.do?uri=sc_req_item.do?sys_id=${sysId}`
  }

  const handleOpenIpModal = (ritm: ServiceNowRecord) => {
    const ritmId = extractSysId(ritm)
    setIpModal({ ritmId, ritm })
    const state = getState(ritmId)
    setIpInput(state.hostIP || '')
    setIpNetworkType(state.networkType || 'N')
    setIpNotes(state.notes || '')
  }

  const handleSaveIP = () => {
    if (!ipModal || !ipInput.trim()) return
    updateState(ipModal.ritmId, { hostIP: ipInput.trim(), networkType: ipNetworkType, notes: ipNotes.trim() || undefined })
    persistToServiceNow(ipModal.ritmId, { u_host_ip: ipInput.trim(), u_network_type: ipNetworkType, u_notes: ipNotes.trim() || undefined })
    setIpModal(null)
    setExpandedRows(prev => new Set(prev).add(ipModal.ritmId))
  }

  const toggleRowExpanded = (ritmId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(ritmId)) next.delete(ritmId)
      else next.add(ritmId)
      return next
    })
  }

  const getPhaseColor = (phase: Phase, ritmNumber?: string): string => {
    if (phase === 'completed') return 'bg-green-100 text-green-700'
    if (phase === 'new' && ritmNumber === 'RITM0000005') return 'bg-slate-100 text-slate-700'
    if (phase === 'new' || phase === 'escalation') return 'bg-red-100 text-red-700'
    if (phase === 'response_received') return 'bg-emerald-100 text-emerald-700'
    if (phase.startsWith('email')) return 'bg-blue-100 text-blue-700'
    return 'bg-slate-100 text-slate-700'
  }

  const discoveryItems = requestItems.filter(ritm => isDiscoveryItem(ritm))

  // RITM State helpers (must be before filteredRitms / stats that use them)
  const stateStr = (r: ServiceNowRecord) => getRitmState(r).trim().toLowerCase()
  const isPending = (r: ServiceNowRecord) => stateStr(r).includes('pending')

  const filteredRitms = requestItems.filter(ritm => {
    const matchesSearch = searchTerm === '' ||
      getRitmNumber(ritm).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCatalogItem(ritm).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRequesterName(ritm).toLowerCase().includes(searchTerm.toLowerCase())

    if (statusFilter === 'all') return matchesSearch
    if (statusFilter === 'discovery') return matchesSearch && isDiscoveryItem(ritm)
    if (statusFilter === 'escalation') return matchesSearch && isDiscoveryItem(ritm) && isPending(ritm)

    const state = getState(extractSysId(ritm))
    return matchesSearch && state.phase === statusFilter
  })

  // Escalated = Discovery RITMs with Pending state only; expand row = Enter IP for those
  const pendingDiscoveryCount = discoveryItems.filter(r => isPending(r)).length
  const stats = {
    total: discoveryItems.length,
    open: requestItems.filter(r => stateStr(r).includes('open')).length,
    pending: requestItems.filter(r => stateStr(r).includes('pending')).length,
    inProgress: requestItems.filter(r => stateStr(r).includes('progress')).length,
    escalated: pendingDiscoveryCount,
    completed: discoveryItems.filter(r => getState(extractSysId(r)).phase === 'completed').length
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        <strong>Escalated</strong> = Discovery RITMs with status Pending. Use the <strong>chevron (▶)</strong> on rows with status "In Progress" or similar to expand and enter IP info.
      </p>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.total}</p>
              <p className="text-xs text-slate-500">Discovery RITMs</p>
            </div>
            <Zap className="h-8 w-8 text-green-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-700">{stats.open}</p>
              <p className="text-xs text-slate-500">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.escalated}</p>
              <p className="text-xs text-red-600 font-medium">Escalated</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-xs text-slate-500">In Progress</p>
            </div>
            <Mail className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-200" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by RITM number, catalog item, or requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All RITMs</option>
              <option value="discovery">Discovery Only</option>
              <option value="escalation">Escalated</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="w-9 px-2 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">RITM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Requester</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">RITM State</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Discovery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRitms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p>No RITMs found</p>
                  </td>
                </tr>
              ) : (
                filteredRitms.map(ritm => {
                  const ritmId = extractSysId(ritm)
                  const state = getState(ritmId)
                  const url = getUrl(ritmId)
                  const isDiscovery = isDiscoveryItem(ritm)
                  const showExpandAndEnterIp = isDiscovery && stateStr(ritm).includes('progress')
                  const isExpanded = expandedRows.has(ritmId)

                  return (
                    <Fragment key={ritmId}>
                      <tr className="hover:bg-slate-50">
                        <td className="px-2 py-3 w-9">
                          {showExpandAndEnterIp ? (
                            <button type="button" onClick={() => toggleRowExpanded(ritmId)} className="p-1 rounded hover:bg-slate-200" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          {url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                              {getRitmNumber(ritm)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="font-medium text-slate-900">{getRitmNumber(ritm)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-700 max-w-[180px] truncate">{getCatalogItem(ritm)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-700">{getRequesterName(ritm)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-700">{getRitmState(ritm)}</span>
                        </td>
                        <td className="px-4 py-3">
                          {isDiscovery ? (
                            isPending(ritm) ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Escalated
                              </span>
                            ) : state.phase === 'new' || state.phase === 'escalation' ? (
                              <span className="text-xs text-slate-400">—</span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getPhaseColor(state.phase, getRitmNumber(ritm))}`}>
                                {PHASE_LABELS[state.phase]}
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                      {showExpandAndEnterIp && isExpanded && (
                        <tr className="bg-slate-50">
                          <td className="px-2 py-2" />
                          <td colSpan={5} className="px-4 py-3">
                            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
                              <p className="font-medium text-slate-700 mb-2">Enter IP &amp; info</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <span className="text-slate-500">Host IP</span>
                                  <p className="font-mono font-medium">{state.hostIP || '—'}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Network type</span>
                                  <p className="font-medium">{state.networkType === 'N' ? 'N' : state.networkType === 'F' ? 'F' : '—'}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Notes</span>
                                  <p className="font-medium">{state.notes || '—'}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => handleOpenIpModal(ritm)} className="mt-2 text-xs">
                                <Network className="h-3 w-3 mr-1" /> Enter IP / Edit info
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t text-xs text-slate-600">
          <span>Showing {filteredRitms.length} RITMs ({stats.total} Discovery)</span>
        </div>
      </div>

      {/* IP entry modal */}
      {ipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-5 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Network className="h-5 w-5 text-indigo-600" /> Enter Host IP
            </h3>
            <p className="text-sm text-slate-600 mb-4">{getRitmNumber(ipModal.ritm)}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Host IP Address</label>
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="e.g. 192.168.1.100"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Network Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="ipNetworkType" checked={ipNetworkType === 'N'} onChange={() => setIpNetworkType('N')} className="text-indigo-600" />
                    <span className="text-sm"><strong>N</strong></span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="ipNetworkType" checked={ipNetworkType === 'F'} onChange={() => setIpNetworkType('F')} className="text-indigo-600" />
                    <span className="text-sm"><strong>F</strong></span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                <textarea
                  value={ipNotes}
                  onChange={(e) => setIpNotes(e.target.value)}
                  placeholder="Other info..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIpModal(null)}>Cancel</Button>
              <Button onClick={handleSaveIP} disabled={!ipInput.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                Save IP
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
