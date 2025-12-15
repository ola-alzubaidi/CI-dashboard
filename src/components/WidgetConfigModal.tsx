"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
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
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Database,
  Palette,
  Settings2,
  Sparkles,
  Check,
  X
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
  const [step, setStep] = useState(1)
  const [widgetType, setWidgetType] = useState<WidgetType>('chart')
  const [title, setTitle] = useState('')
  const [dataSource, setDataSource] = useState<DataSource>('sc_req_item')
  const [chartType, setChartType] = useState<ChartType>('donut')
  const [groupBy, setGroupBy] = useState('state')
  const [layout, setLayout] = useState<LayoutType>('card')
  const [size, setSize] = useState<WidgetSize>('medium')
  const [filter, setFilter] = useState('')
  const [limit, setLimit] = useState(50)

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
      setStep(1)
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
      setStep(1)
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
    { type: 'chart' as WidgetType, icon: BarChart3, label: 'Chart', desc: 'Visualize data with charts', color: 'from-violet-500 to-purple-600' },
    { type: 'table' as WidgetType, icon: Table2, label: 'Table', desc: 'Display data in rows', color: 'from-blue-500 to-cyan-600' },
    { type: 'metric' as WidgetType, icon: Hash, label: 'Metric', desc: 'Show a single number', color: 'from-emerald-500 to-teal-600' },
    { type: 'list' as WidgetType, icon: List, label: 'List', desc: 'Simple item list', color: 'from-orange-500 to-amber-600' },
  ]

  const dataSources = [
    { value: 'sc_req_item' as DataSource, label: 'Request Items', icon: '📋', color: 'bg-blue-100 text-blue-700' },
    { value: 'incident' as DataSource, label: 'Incidents', icon: '🔥', color: 'bg-red-100 text-red-700' },
    { value: 'change_request' as DataSource, label: 'Changes', icon: '🔄', color: 'bg-purple-100 text-purple-700' },
    { value: 'problem' as DataSource, label: 'Problems', icon: '⚠️', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'task' as DataSource, label: 'Tasks', icon: '✅', color: 'bg-green-100 text-green-700' },
    { value: 'sys_user' as DataSource, label: 'Users', icon: '👤', color: 'bg-slate-100 text-slate-700' },
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
    { type: 'small' as WidgetSize, label: 'S', width: 'w-8' },
    { type: 'medium' as WidgetSize, label: 'M', width: 'w-12' },
    { type: 'large' as WidgetSize, label: 'L', width: 'w-20' },
    { type: 'full' as WidgetSize, label: 'Full', width: 'w-full' },
  ]

  const totalSteps = 3

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{widget ? 'Edit Widget' : 'Create Widget'}</h2>
              <p className="text-slate-300 text-sm">Step {step} of {totalSteps}</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-white' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[350px]">
          {/* Step 1: Widget Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Palette className="h-5 w-5" />
                <span className="font-medium">Choose Widget Type</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {widgetTypes.map(({ type, icon: Icon, label, desc, color }) => (
                  <button
                    key={type}
                    onClick={() => setWidgetType(type)}
                    className={`relative p-4 rounded-xl text-left transition-all group ${
                      widgetType === type
                        ? 'ring-2 ring-slate-900 bg-white shadow-lg'
                        : 'bg-white hover:shadow-md border border-slate-200'
                    }`}
                  >
                    {widgetType === type && (
                      <div className="absolute top-2 right-2 bg-slate-900 text-white rounded-full p-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${color} mb-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="font-semibold text-slate-900">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Data Source */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Database className="h-5 w-5" />
                <span className="font-medium">Select Data Source</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {dataSources.map(({ value, label, icon, color }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setDataSource(value)
                      setGroupBy(DATA_SOURCE_FIELDS[value][0])
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      dataSource === value
                        ? 'ring-2 ring-slate-900 bg-white shadow-md'
                        : 'bg-white hover:shadow border border-slate-200'
                    }`}
                  >
                    <span className={`text-xl p-2 rounded-lg ${color}`}>{icon}</span>
                    <div>
                      <div className="font-medium text-slate-900">{label}</div>
                      <div className="text-xs text-slate-500">{DATA_SOURCE_LABELS[value]}</div>
                    </div>
                    {dataSource === value && (
                      <Check className="h-4 w-4 ml-auto text-slate-900" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Customize */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Settings2 className="h-5 w-5" />
                <span className="font-medium">Customize Widget</span>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Widget Title</label>
                <Input
                  placeholder={`${DATA_SOURCE_LABELS[dataSource]} ${widgetType}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Chart Options */}
              {widgetType === 'chart' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Chart Style</label>
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                      {chartTypes.map(({ type, icon: Icon, label }) => (
                        <button
                          key={type}
                          onClick={() => setChartType(type)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm transition-all ${
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
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Group By</label>
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
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Layout Style</label>
                  <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                    {layoutTypes.map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => setLayout(type)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm transition-all ${
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

              {/* Size */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Widget Size</label>
                <div className="flex gap-2">
                  {sizeTypes.map(({ type, label, width }) => (
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
              <details className="group">
                <summary className="text-sm font-medium text-slate-500 cursor-pointer hover:text-slate-700 flex items-center gap-1">
                  <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
                  Advanced Options
                </summary>
                <div className="mt-3 space-y-3 pl-5 border-l-2 border-slate-100">
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Filter Query</label>
                    <Input
                      placeholder="e.g., priority=1^state=open"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Record Limit</label>
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
              </details>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-slate-50">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {step > 1 ? 'Back' : 'Cancel'}
          </Button>
          
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="bg-slate-900 hover:bg-slate-800 gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-1"
            >
              <Check className="h-4 w-4" />
              {widget ? 'Update Widget' : 'Create Widget'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
