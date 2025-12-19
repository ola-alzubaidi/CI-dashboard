"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BarChart3, 
  Table2, 
  Hash, 
  List,
  PieChart,
  Activity,
  Rows,
  Square,
  Minimize2,
  ChevronRight,
  Check,
  X,
  TrendingUp
} from 'lucide-react'
import { 
  Widget, 
  WidgetType, 
  ChartType, 
  DataSource, 
  LayoutType,
  WidgetSize,
  DATA_SOURCE_LABELS,
  DATA_SOURCE_FIELDS 
} from '@/types/widget'

interface WidgetConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (widget: Partial<Widget>) => void
  widget?: Widget | null
}

export function WidgetConfigModal({
  open,
  onOpenChange,
  onSave,
  widget
}: WidgetConfigModalProps) {
  const [widgetType, setWidgetType] = useState<WidgetType>('chart')
  const [title, setTitle] = useState('')
  const [dataSource, setDataSource] = useState<DataSource>('sc_req_item')
  const [chartType, setChartType] = useState<ChartType>('donut')
  const [groupBy, setGroupBy] = useState('state')
  const [layout, setLayout] = useState<LayoutType>('card')
  const [size, setSize] = useState<WidgetSize>('medium')
  const [filter, setFilter] = useState('')
  const [limit, setLimit] = useState(50)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (open && widget) {
      setWidgetType(widget.type)
      setTitle(widget.title)
      setDataSource(widget.dataSource)
      setChartType(widget.chartType || 'donut')
      setGroupBy(widget.groupBy || 'state')
      setLayout(widget.layout || 'card')
      setSize(widget.size || 'medium')
      setFilter(widget.filter || '')
      setLimit(widget.limit || 50)
      setShowAdvanced(false)
    } else if (open && !widget) {
      setWidgetType('chart')
      setTitle('')
      setDataSource('sc_req_item')
      setChartType('donut')
      setGroupBy('state')
      setLayout('card')
      setSize('medium')
      setFilter('')
      setLimit(50)
      setShowAdvanced(false)
    }
  }, [open, widget])

  const handleSave = () => {
    onSave({
      type: widgetType,
      title: title || `${DATA_SOURCE_LABELS[dataSource]} ${widgetType}`,
      dataSource,
      chartType: widgetType === 'chart' ? chartType : undefined,
      groupBy: widgetType === 'chart' ? groupBy : undefined,
      layout,
      size,
      filter,
      limit,
    })
    onOpenChange(false)
  }

  const widgetTypes = [
    { 
      type: 'chart' as WidgetType, 
      icon: BarChart3, 
      label: 'Chart', 
      desc: 'Pie, Bar, Line, Donut',
      gradient: 'from-violet-500 to-purple-600'
    },
    { 
      type: 'metric' as WidgetType, 
      icon: TrendingUp, 
      label: 'Metric', 
      desc: 'Single number display',
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      type: 'table' as WidgetType, 
      icon: Table2, 
      label: 'Table', 
      desc: 'Data rows & columns',
      gradient: 'from-blue-500 to-cyan-600'
    },
    { 
      type: 'list' as WidgetType, 
      icon: List, 
      label: 'List', 
      desc: 'Simple item list',
      gradient: 'from-orange-500 to-amber-600'
    },
  ]

  const dataSources = [
    { value: 'sc_req_item' as DataSource, label: 'Request Items', icon: '📋' },
    { value: 'incident' as DataSource, label: 'Incidents', icon: '🔥' },
    { value: 'change_request' as DataSource, label: 'Changes', icon: '🔄' },
    { value: 'problem' as DataSource, label: 'Problems', icon: '⚠️' },
    { value: 'task' as DataSource, label: 'Tasks', icon: '✅' },
    { value: 'sys_user' as DataSource, label: 'Users', icon: '👤' },
  ]

  const chartTypes = [
    { type: 'donut' as ChartType, icon: PieChart, label: 'Donut' },
    { type: 'pie' as ChartType, icon: PieChart, label: 'Pie' },
    { type: 'bar' as ChartType, icon: BarChart3, label: 'Bar' },
    { type: 'line' as ChartType, icon: Activity, label: 'Line' },
  ]

  const layoutTypes = [
    { type: 'card' as LayoutType, icon: Square, label: 'Cards' },
    { type: 'table' as LayoutType, icon: Table2, label: 'Table' },
    { type: 'list' as LayoutType, icon: Rows, label: 'List' },
    { type: 'compact' as LayoutType, icon: Minimize2, label: 'Compact' },
  ]

  const sizeTypes = [
    { type: 'small' as WidgetSize, label: 'Small' },
    { type: 'medium' as WidgetSize, label: 'Medium' },
    { type: 'large' as WidgetSize, label: 'Large' },
    { type: 'full' as WidgetSize, label: 'Full' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">{widget ? 'Edit Widget' : 'Create Widget'}</DialogTitle>
        <DialogDescription className="sr-only">Configure your widget settings</DialogDescription>
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 relative">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold">{widget ? 'Edit Widget' : 'Create New Widget'}</h2>
          <p className="text-slate-400 text-sm mt-1">Choose a type and configure your widget</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Widget Type Selection */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-3 block">Widget Type</label>
            <div className="grid grid-cols-4 gap-3">
              {widgetTypes.map(({ type, icon: Icon, label, desc, gradient }) => (
                <button
                  key={type}
                  onClick={() => setWidgetType(type)}
                  className={`relative p-4 rounded-xl text-center transition-all ${
                    widgetType === type
                      ? 'ring-2 ring-slate-900 bg-white shadow-lg scale-[1.02]'
                      : 'bg-slate-50 hover:bg-white hover:shadow-md border border-slate-200'
                  }`}
                >
                  {widgetType === type && (
                    <div className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-2`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">{label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Data Source */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-3 block">Data Source</label>
            <div className="grid grid-cols-3 gap-2">
              {dataSources.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setDataSource(value)
                    setGroupBy(DATA_SOURCE_FIELDS[value][0])
                  }}
                  className={`flex items-center gap-2 p-3 rounded-lg text-left transition-all ${
                    dataSource === value
                      ? 'ring-2 ring-slate-900 bg-white shadow-md'
                      : 'bg-slate-50 hover:bg-white border border-slate-200'
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <span className="font-medium text-sm text-slate-900">{label}</span>
                  {dataSource === value && (
                    <Check className="h-4 w-4 ml-auto text-slate-900" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Widget Title */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Widget Title</label>
            <Input
              placeholder={`${DATA_SOURCE_LABELS[dataSource]} ${widgetType}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Chart Type (only for charts) */}
          {widgetType === 'chart' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Chart Style</label>
                <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                  {chartTypes.map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm transition-all ${
                        chartType === type
                          ? 'bg-white shadow text-slate-900 font-medium'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Group By</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full h-11 px-3 border rounded-lg bg-white text-sm"
                >
                  {DATA_SOURCE_FIELDS[dataSource].map((field) => (
                    <option key={field} value={field}>
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Layout for table/list */}
          {(widgetType === 'table' || widgetType === 'list') && (
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Layout Style</label>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                {layoutTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setLayout(type)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm transition-all ${
                      layout === type
                        ? 'bg-white shadow text-slate-900 font-medium'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Widget Size */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Widget Size</label>
            <div className="flex gap-2">
              {sizeTypes.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => setSize(type)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    size === type
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
              Advanced Options
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-4 pl-5 border-l-2 border-slate-200">
                <div>
                  <label className="text-sm text-slate-600 mb-1.5 block">Filter Query</label>
                  <Input
                    placeholder="e.g., priority=1^state=open"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1.5 block">Record Limit</label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
                    className="w-32 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-slate-50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Check className="h-4 w-4 mr-1.5" />
            {widget ? 'Update Widget' : 'Create Widget'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
