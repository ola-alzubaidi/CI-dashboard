"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, RefreshCw, Trash2, GripVertical, BarChart3, Table2, Hash, List } from 'lucide-react'
import { Widget, DATA_SOURCE_LABELS } from '@/types/widget'
import { ChartWidget } from './widgets/ChartWidget'
import { TableWidget } from './widgets/TableWidget'
import { MetricWidget } from './widgets/MetricWidget'
import { ListWidget } from './widgets/ListWidget'
import { useState } from 'react'

interface DraggableWidgetProps {
  widget: Widget
  onConfigure: (id: string) => void
  onDelete: (id: string) => void
}

const widgetIcons = {
  chart: BarChart3,
  table: Table2,
  metric: Hash,
  list: List,
}

export function DraggableWidget({ widget, onConfigure, onDelete }: DraggableWidgetProps) {
  const [refreshKey, setRefreshKey] = useState(0)

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

  const renderWidget = () => {
    // Pass refreshKey to force re-render on refresh
    const key = `${widget.id}-${refreshKey}`
    
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

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`shadow-lg h-full ${isDragging ? 'shadow-2xl ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
              title="Drag to reorder"
            >
              <GripVertical className="h-5 w-5 text-slate-400" />
            </button>
            <Icon className="h-4 w-4 text-slate-500" />
            <div>
              <CardTitle className="text-base font-semibold">{widget.title}</CardTitle>
              <p className="text-xs text-slate-500">{DATA_SOURCE_LABELS[widget.dataSource]}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRefreshKey(k => k + 1)}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onConfigure(widget.id)}
              title="Configure"
            >
              <Settings className="h-4 w-4" />
            </Button>
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

