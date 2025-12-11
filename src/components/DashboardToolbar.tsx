"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Moon, 
  Sun, 
  RefreshCw, 
  Search, 
  X,
  Clock,
  Pause,
  Play
} from 'lucide-react'

interface DashboardToolbarProps {
  onFilterChange: (filter: string) => void
  onRefreshAll: () => void
  darkMode: boolean
  onDarkModeToggle: () => void
}

export function DashboardToolbar({ 
  onFilterChange, 
  onRefreshAll,
  darkMode,
  onDarkModeToggle
}: DashboardToolbarProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [refreshInterval, setRefreshInterval] = useState(30)

  // Auto-refresh countdown
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (autoRefresh && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (autoRefresh && countdown === 0) {
      onRefreshAll()
      setCountdown(refreshInterval)
    }
    return () => clearTimeout(timer)
  }, [autoRefresh, countdown, refreshInterval, onRefreshAll])

  const handleFilterChange = (value: string) => {
    setGlobalFilter(value)
    onFilterChange(value)
  }

  const clearFilter = () => {
    setGlobalFilter('')
    onFilterChange('')
  }

  const toggleAutoRefresh = () => {
    if (!autoRefresh) {
      setCountdown(refreshInterval)
    }
    setAutoRefresh(!autoRefresh)
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 p-4 rounded-lg mb-4 ${
      darkMode ? 'bg-slate-800' : 'bg-white border'
    }`}>
      {/* Global Search/Filter */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`} />
        <Input
          placeholder="Global filter (e.g., priority=high)"
          value={globalFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className={`pl-10 pr-10 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`}
        />
        {globalFilter && (
          <button
            onClick={clearFilter}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className={`h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>
        )}
      </div>

      {/* Auto-Refresh */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAutoRefresh}
          className={`${autoRefresh ? 'bg-green-50 border-green-500 text-green-700' : ''} ${
            darkMode ? 'border-slate-600 text-slate-300' : ''
          }`}
        >
          {autoRefresh ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              <span className="font-mono">{countdown}s</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Auto
            </>
          )}
        </Button>

        {autoRefresh && (
          <select
            value={refreshInterval}
            onChange={(e) => {
              setRefreshInterval(parseInt(e.target.value))
              setCountdown(parseInt(e.target.value))
            }}
            className={`h-9 px-2 text-sm border rounded-md ${
              darkMode ? 'bg-slate-700 border-slate-600 text-white' : ''
            }`}
          >
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>1m</option>
            <option value={300}>5m</option>
          </select>
        )}
      </div>

      {/* Refresh All */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRefreshAll}
        className={darkMode ? 'border-slate-600 text-slate-300' : ''}
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Refresh All
      </Button>

      {/* Dark Mode Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={onDarkModeToggle}
        className={darkMode ? 'border-slate-600 text-slate-300' : ''}
      >
        {darkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

