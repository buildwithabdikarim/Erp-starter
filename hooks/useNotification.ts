import { useState, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  autoClose?: number
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const add = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const fullNotification: Notification = {
        ...notification,
        id,
        autoClose: notification.autoClose ?? 5000,
      }

      setNotifications((prev) => [...prev, fullNotification])

      if (fullNotification.autoClose) {
        setTimeout(() => {
          remove(id)
        }, fullNotification.autoClose)
      }

      return id
    },
    []
  )

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const success = useCallback(
    (message: string, title?: string) => {
      return add({
        type: 'success',
        title,
        message,
      })
    },
    [add]
  )

  const error = useCallback(
    (message: string, title?: string) => {
      return add({
        type: 'error',
        title,
        message,
      })
    },
    [add]
  )

  const warning = useCallback(
    (message: string, title?: string) => {
      return add({
        type: 'warning',
        title,
        message,
      })
    },
    [add]
  )

  const info = useCallback(
    (message: string, title?: string) => {
      return add({
        type: 'info',
        title,
        message,
      })
    },
    [add]
  )

  return {
    notifications,
    add,
    remove,
    success,
    error,
    warning,
    info,
  }
}
