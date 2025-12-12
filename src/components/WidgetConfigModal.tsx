"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  BarChart3, 
  Table2, 
  Hash, 
  List,
  PieChart,
  Activity,
  LayoutGrid,
  Rows,
  Square,
  Minimize2,
  RectangleHorizontal,
  RectangleVertical,
  Maximize2
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
    } else if (open && !widget) {
      // Reset for new widget
      setWidgetType('chart')
      setTitle('')
      setDataSource('sc_req_item')
      setChartType('donut')
      setGroupBy('state')
      setLayout('card')
      setSize('medium')
      setFilter('')
      setLimit(50)
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

  const widgetTypes: { type: WidgetType; icon: any; label: string; desc: string }[] = [
    { type: 'chart', icon: BarChart3, label: 'Chart', desc: 'Visualize data' },
    { type: 'table', icon: Table2, label: 'Table', desc: 'Show records' },
    { type: 'metric', icon: Hash, label: 'Metric', desc: 'Single number' },
    { type: 'list', icon: List, label: 'List', desc: 'Item list' },
  ]

  const chartTypes: { type: ChartType; icon: any; label: string }[] = [
    { type: 'donut', icon: PieChart, label: 'Donut' },
    { type: 'pie', icon: PieChart, label: 'Pie' },
    { type: 'bar', icon: BarChart3, label: 'Bar' },
    { type: 'line', icon: Activity, label: 'Line' },
  ]

  const layoutTypes: { type: LayoutType; icon: any; label: string; desc: string }[] = [
    { type: 'card', icon: Square, label: 'Cards', desc: 'Card grid view' },
    { type: 'table', icon: Table2, label: 'Table', desc: 'Table rows' },
    { type: 'list', icon: Rows, label: 'List', desc: 'Simple list' },
    { type: 'compact', icon: Minimize2, label: 'Compact', desc: 'Minimal view' },
  ]

  const sizeTypes: { type: WidgetSize; icon: any; label: string; desc: string }[] = [
    { type: 'small', icon: Minimize2, label: 'Small', desc: '1 column' },
    { type: 'medium', icon: RectangleVertical, label: 'Medium', desc: '1 column' },
    { type: 'large', icon: RectangleHorizontal, label: 'Large', desc: '2 columns' },
    { type: 'full', icon: Maximize2, label: 'Full Width', desc: '3 columns' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{widget ? 'Edit Widget' : 'Add Widget'}</DialogTitle>
          <DialogDescription>
            Configure your widget to display data from ServiceNow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Widget Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Widget Type</Label>
            <div className="grid grid-cols-4 gap-3">
              {widgetTypes.map(({ type, icon: Icon, label, desc }) => (
                <button
                  key={type}
                  onClick={() => setWidgetType(type)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    widgetType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${
                    widgetType === type ? 'text-blue-600' : 'text-slate-500'
                  }`} />
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Selection (for table, list, metric widgets) */}
          {(widgetType === 'table' || widgetType === 'list') && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Display Layout</Label>
              <div className="grid grid-cols-4 gap-3">
                {layoutTypes.map(({ type, icon: Icon, label, desc }) => (
                  <button
                    key={type}
                    onClick={() => setLayout(type)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      layout === type
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mx-auto mb-1 ${
                      layout === type ? 'text-green-600' : 'text-slate-500'
                    }`} />
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Data Source */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Data Source</Label>
            <select
              value={dataSource}
              onChange={(e) => {
                setDataSource(e.target.value as DataSource)
                setGroupBy(DATA_SOURCE_FIELDS[e.target.value as DataSource][0])
              }}
              className="w-full h-10 px-3 py-2 border rounded-md bg-background"
            >
              {Object.entries(DATA_SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Widget Title */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Widget Title</Label>
            <Input
              placeholder={`e.g., ${DATA_SOURCE_LABELS[dataSource]} by State`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Chart Type (only for chart widgets) */}
          {widgetType === 'chart' && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Chart Type</Label>
              <div className="grid grid-cols-4 gap-3">
                {chartTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      chartType === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mx-auto mb-1 ${
                      chartType === type ? 'text-blue-600' : 'text-slate-500'
                    }`} />
                    <div className="font-medium text-sm">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group By (only for chart widgets) */}
          {widgetType === 'chart' && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Group By</Label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full h-10 px-3 py-2 border rounded-md bg-background"
              >
                {DATA_SOURCE_FIELDS[dataSource].map((field) => (
                  <option key={field} value={field}>
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Widget Size */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Widget Size</Label>
            <div className="grid grid-cols-4 gap-3">
              {sizeTypes.map(({ type, icon: Icon, label, desc }) => (
                <button
                  key={type}
                  onClick={() => setSize(type)}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    size === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`h-5 w-5 mx-auto mb-1 ${
                    size === type ? 'text-blue-600' : 'text-slate-500'
                  }`} />
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Filter (Optional)</Label>
            <Input
              placeholder="e.g., priority=high^state=open"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              Use ServiceNow query syntax. Multiple conditions: field=value^field2=value2
            </p>
          </div>

          {/* Limit */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Record Limit</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {widget ? 'Update Widget' : 'Add Widget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
