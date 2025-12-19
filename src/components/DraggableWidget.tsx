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
  ChevronDown,
  MoreHorizontal
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

// Get min height based on widget size
const getMinHeight = (size?: WidgetSize) => {
  switch (size) {
    case 'small': return 'min-h-[200px]'
    case 'medium': return 'min-h-[280px]'
    case 'large': return 'min-h-[320px]'
    case 'full': return 'min-h-[350px]'
    default: return 'min-h-[280px]'
  }
}

export function DraggableWidget({ 
  widget, 
  onConfigure, 
  onDelete, 
  onSizeChange
}: DraggableWidgetProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSizeMenu, setShowSizeMenu] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

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
  const isSmall = widget.size === 'small'

  const renderWidget = () => {
    const key = `${widget.id}-${widget.dataSource}-${widget.chartType}-${widget.groupBy}-${widget.limit}-${refreshKey}`
    
    switch (widget.type) {
      case 'chart':
        return <ChartWidget key={key} widget={widget} />
      case 'table':
        return <TableWidget key={key} widget={widget} />
      case 'metric':
        return <MetricWidget key={key} widget={widget} />
      case 'list':
        return <ListWidget key={key} widget={widget} />
      default:
        return <div>Unknown widget type</div>
    }
  }

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
        <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Icon className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  {widget.title}
                </CardTitle>
                <p className="text-sm text-slate-500">
                  {DATA_SOURCE_LABELS[widget.dataSource]}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
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
    <div ref={setNodeRef} style={style} className="h-full">
      <Card className={`shadow-lg h-full flex flex-col ${isDragging ? 'shadow-2xl ring-2 ring-blue-500' : ''}`}>
        {/* Header - Compact for small, normal for others */}
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isSmall ? 'p-3 pb-2' : 'p-4 pb-2'}`}>
          {/* Left side: Drag handle + Icon + Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 flex-shrink-0 group relative"
              title="Drag to reorder"
            >
              <GripVertical className={`${isSmall ? 'h-4 w-4' : 'h-5 w-5'} text-slate-400`} />
              {/* Tooltip */}
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Drag to reorder
              </span>
            </button>
            <div className={`p-1.5 rounded-md bg-slate-100 flex-shrink-0`}>
              <Icon className={`${isSmall ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-slate-600`} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className={`${isSmall ? 'text-sm' : 'text-base'} font-semibold truncate`}>
                {widget.title}
              </CardTitle>
              {!isSmall && (
                <p className="text-xs text-slate-500 truncate">
                  {DATA_SOURCE_LABELS[widget.dataSource]}
                </p>
              )}
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {/* For small widgets, use a dropdown menu */}
            {isSmall ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="h-7 w-7"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-1 py-1 rounded-md shadow-lg z-20 min-w-[140px] bg-white border">
                    <button
                      onClick={() => { setShowSizeMenu(!showSizeMenu); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 flex items-center gap-2"
                    >
                      <ChevronDown className="h-3.5 w-3.5" /> Resize
                    </button>
                    <button
                      onClick={() => { setIsFullscreen(true); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
                    </button>
                    <button
                      onClick={() => { setRefreshKey(k => k + 1); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 flex items-center gap-2"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Refresh
                    </button>
                    <button
                      onClick={() => { onConfigure(widget.id); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Settings className="h-3.5 w-3.5" /> Configure
                    </button>
                    <div className="border-t my-1" />
                    <button
                      onClick={() => { onDelete(widget.id); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                )}
                {showSizeMenu && (
                  <div className="absolute right-0 top-full mt-1 py-1 rounded-md shadow-lg z-20 min-w-[120px] bg-white border">
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
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {sizeLabels[size]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Size Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSizeMenu(!showSizeMenu)}
                    title="Resize"
                    className="h-8 w-8"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {showSizeMenu && (
                    <div className="absolute right-0 top-full mt-1 py-1 rounded-md shadow-lg z-10 min-w-[120px] bg-white border">
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
                  className="h-8 w-8"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>

                {/* Refresh */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRefreshKey(k => k + 1)}
                  title="Refresh"
                  className="h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>

                {/* Configure */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onConfigure(widget.id)}
                  title="Configure"
                  className="h-8 w-8"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(widget.id)}
                  title="Delete"
                  className="text-red-500 hover:bg-red-50 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className={`flex-1 ${isSmall ? 'p-3 pt-0' : 'p-4 pt-0'} ${getMinHeight(widget.size)}`}>
          {renderWidget()}
        </CardContent>
      </Card>
    </div>
  )
}
