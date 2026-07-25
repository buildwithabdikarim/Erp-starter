'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, InfoIcon, AlertTriangle, X } from 'lucide-react'

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  onClose?: () => void
  dismissible?: boolean
  className?: string
}

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: InfoIcon,
} as const

const styleMap = {
  success: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-900 dark:text-green-50',
    icon: 'text-green-600 dark:text-green-400',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-50',
    icon: 'text-red-600 dark:text-red-400',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-900 dark:text-yellow-50',
    icon: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-50',
    icon: 'text-blue-600 dark:text-blue-400',
  },
} as const

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  dismissible = true,
  className,
}) => {
  const Icon = iconMap[type]
  const styles = styleMap[type]

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 rounded-lg border',
        styles.bg,
        styles.border,
        styles.text,
        className
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.icon)} />
      <div className="flex-1">
        {title && <p className="font-semibold text-sm">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

Alert.displayName = 'Alert'

// Toast notification - can be used with a toast container
interface ToastProps extends Omit<AlertProps, 'type'> {
  type: 'success' | 'error' | 'warning' | 'info'
  id?: string
  autoClose?: number
}

export const Toast: React.FC<ToastProps> = ({ autoClose = 5000, onClose, ...props }) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  return <Alert {...props} onClose={onClose} />
}

Toast.displayName = 'Toast'
