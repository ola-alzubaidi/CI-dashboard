"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Table2, 
  BarChart3, 
  ListChecks,
  Users,
  AlertCircle,
  Settings,
  Trash2,
  LayoutDashboard,
  Sparkles
} from 'lucide-react'
import { DashboardConfig } from '@/types/dashboard'

interface Widget {
  id: string
  type: 'ritms' | 'incidents' | 'users' | 'chart' | 'stats'
  title: string
  size: 'small' | 'medium' | 'large'
}

interface DashboardBuilderProps {
  dashboard: DashboardConfig
}

export function DashboardBuilder({ dashboard }: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [showWidgetMenu, setShowWidgetMenu] = useState(false)

  const addWidget = (type: Widget['type'], title: string) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title,
      size: 'medium'
    }
    setWidgets([...widgets, newWidget])
    setShowWidgetMenu(false)
  }

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id))
  }

  const widgetOptions = [
    {
      type: 'ritms' as const,
      title: 'Request Items',
      description: 'Display ServiceNow Request Items (RITMs)',
      icon: ListChecks,
      bgColor: 'bg-blue-100',
      hoverBg: 'hover:bg-blue-50',
      iconColor: 'text-blue-600',
      borderHover: 'hover:border-blue-500'
    },
    {
      type: 'incidents' as const,
      title: 'Incidents',
      description: 'Show incident tickets',
      icon: AlertCircle,
      bgColor: 'bg-red-100',
      hoverBg: 'hover:bg-red-50',
      iconColor: 'text-red-600',
      borderHover: 'hover:border-red-500'
    },
    {
      type: 'users' as const,
      title: 'Users',
      description: 'List ServiceNow users',
      icon: Users,
      bgColor: 'bg-green-100',
      hoverBg: 'hover:bg-green-50',
      iconColor: 'text-green-600',
      borderHover: 'hover:border-green-500'
    },
    {
      type: 'chart' as const,
      title: 'Chart',
      description: 'Data visualization charts',
      icon: BarChart3,
      bgColor: 'bg-purple-100',
      hoverBg: 'hover:bg-purple-50',
      iconColor: 'text-purple-600',
      borderHover: 'hover:border-purple-500'
    },
    {
      type: 'stats' as const,
      title: 'Statistics',
      description: 'Key metrics and numbers',
      icon: Table2,
      bgColor: 'bg-orange-100',
      hoverBg: 'hover:bg-orange-50',
      iconColor: 'text-orange-600',
      borderHover: 'hover:border-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Builder Header */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{dashboard.name}</h2>
            {dashboard.description && (
              <p className="text-slate-600 mt-1">{dashboard.description}</p>
            )}
          </div>
          <Button
            onClick={() => setShowWidgetMenu(!showWidgetMenu)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </div>

        {/* Widget Selection Menu */}
        {showWidgetMenu && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Choose a Widget Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {widgetOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.type}
                    onClick={() => addWidget(option.type, option.title)}
                    className={`p-4 border-2 rounded-lg ${option.borderHover} ${option.hoverBg} transition-all text-left group`}
                  >
                    <div className={`inline-flex p-2 ${option.bgColor} rounded-lg mb-2`}>
                      <Icon className={`h-5 w-5 ${option.iconColor}`} />
                    </div>
                    <h4 className="font-semibold text-sm text-slate-900">{option.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{option.description}</p>
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidgetMenu(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Widgets Area */}
      {widgets.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
              <LayoutDashboard className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Your Dashboard is Empty
            </h3>
            <p className="text-slate-600 mb-6">
              Get started by adding widgets to display data, charts, and information. Click the &quot;Add Widget&quot; button above to begin customizing your dashboard.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => {
            const option = widgetOptions.find(o => o.type === widget.type)
            const Icon = option?.icon || Table2
            
            return (
              <Card key={widget.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${option?.bgColor || 'bg-slate-100'} rounded-lg`}>
                        <Icon className={`h-5 w-5 ${option?.iconColor || 'text-slate-600'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{widget.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {option?.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeWidget(widget.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center bg-slate-50">
                    <Settings className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Configure this widget</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Settings className="h-3 w-3 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Help Text */}
      {widgets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Customize Your Widgets
              </h4>
              <p className="text-xs text-blue-700">
                Click the settings button on each widget to configure data sources, filters, refresh rates, and display options. Drag and drop to rearrange (coming soon).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

