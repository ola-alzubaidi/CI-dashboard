"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  RefreshCw, 
  Trash2, 
  GripVertical, 
  BarChart3, 
  Table2, 
  Hash, 
  List,
  Maximize2,
  Minimize2,
  ChevronDown
} from 'lucide-react'
import { Widget, DATA_SOURCE_LABELS, WidgetSize } from '@/types/widget'
import { ChartWidget } from './widgets/ChartWidget'
import { TableWidget } from './widgets/TableWidget'
import { MetricWidget } from './widgets/MetricWidget'
import { ListWidget } from './widgets/ListWidget'
import { useState } from 'react'

interface DraggableWidgetProps {
  widget: Widget
  onConfigure: (id: string) => void
  onDelete: (id: string) => void
  onSizeChange: (id: string, size: WidgetSize) => void
  darkMode?: boolean
  globalFilter?: string
}

const widgetIcons = {
  chart: BarChart3,
  table: Table2,
  metric: Hash,
  list: List,
}

const sizeLabels: Record<WidgetSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  full: 'Full Width',
}

export function DraggableWidget({ 
  widget, 
  onConfigure, 
  onDelete, 
  onSizeChange,
  darkMode = false,
  globalFilter = ''
}: DraggableWidgetProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSizeMenu, setShowSizeMenu] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  const Icon = widgetIcons[widget.type]

  // Combine widget filter with global filter
  const effectiveFilter = globalFilter 
    ? (widget.filter ? `${widget.filter}^${globalFilter}` : globalFilter)
    : widget.filter

  const widgetWithFilter = { ...widget, filter: effectiveFilter }

  const renderWidget = () => {
    // Include dataSource, filter, and other config in key to force re-render on changes
    const key = `${widget.id}-${widget.dataSource}-${widget.chartType}-${widget.groupBy}-${widget.limit}-${refreshKey}-${globalFilter}`
    
    switch (widget.type) {
      case 'chart':
        return <ChartWidget key={key} widget={widgetWithFilter} />
      case 'table':
        return <TableWidget key={key} widget={widgetWithFilter} />
      case 'metric':
        return <MetricWidget key={key} widget={widgetWithFilter} />
      case 'list':
        return <ListWidget key={key} widget={widgetWithFilter} />
      default:
        return <div>Unknown widget type</div>
    }
  }

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
        <Card className={`w-full max-w-6xl max-h-[90vh] overflow-auto ${
          darkMode ? 'bg-slate-800 border-slate-700' : ''
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <div>
                <CardTitle className={`text-xl font-semibold ${darkMode ? 'text-white' : ''}`}>
                  {widget.title}
                </CardTitle>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {DATA_SOURCE_LABELS[widget.dataSource]}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className={darkMode ? 'border-slate-600 text-slate-300' : ''}
            >
              <Minimize2 className="h-4 w-4 mr-1" />
              Exit Fullscreen
            </Button>
          </CardHeader>
          <CardContent className="min-h-[500px]">
            {renderWidget()}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`shadow-lg h-full ${isDragging ? 'shadow-2xl ring-2 ring-blue-500' : ''} ${
        darkMode ? 'bg-slate-800 border-slate-700' : ''
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className={`cursor-grab active:cursor-grabbing p-1 rounded ${
                darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
              }`}
              title="Drag to reorder"
            >
              <GripVertical className={`h-5 w-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>
            <Icon className={`h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <div>
              <CardTitle className={`text-base font-semibold ${darkMode ? 'text-white' : ''}`}>
                {widget.title}
              </CardTitle>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {DATA_SOURCE_LABELS[widget.dataSource]}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {/* Size Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSizeMenu(!showSizeMenu)}
                title="Resize"
                className={darkMode ? 'text-slate-300 hover:bg-slate-700' : ''}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showSizeMenu && (
                <div className={`absolute right-0 top-full mt-1 py-1 rounded-md shadow-lg z-10 min-w-[120px] ${
                  darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-white border'
                }`}>
                  {(['small', 'medium', 'large', 'full'] as WidgetSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        onSizeChange(widget.id, size)
                        setShowSizeMenu(false)
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm ${
                        widget.size === size 
                          ? 'bg-blue-50 text-blue-600' 
                          : darkMode 
                            ? 'text-slate-300 hover:bg-slate-600' 
                            : 'hover:bg-slate-50'
                      }`}
                    >
                      {sizeLabels[size]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(true)}
              title="Fullscreen"
              className={darkMode ? 'text-slate-300 hover:bg-slate-700' : ''}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRefreshKey(k => k + 1)}
              title="Refresh"
              className={darkMode ? 'text-slate-300 hover:bg-slate-700' : ''}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* Configure */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onConfigure(widget.id)}
              title="Configure"
              className={darkMode ? 'text-slate-300 hover:bg-slate-700' : ''}
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(widget.id)}
              title="Delete"
              className="text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderWidget()}
        </CardContent>
      </Card>
    </div>
  )
}
