'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { MODAL_WIDTHS } from '@/constants'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  width?: 'sm' | 'md' | 'lg' | 'xl'
  isDismissible?: boolean
  footer?: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'md',
  isDismissible = true,
  footer,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDismissible) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, isDismissible, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={isDismissible ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className={cn(
            'bg-background text-foreground rounded-xl shadow-2xl',
            'border border-border/40',
            'flex flex-col overflow-hidden',
            'animate-in fade-in zoom-in-95 duration-300',
            MODAL_WIDTHS[width],
            'max-h-[95vh]'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Sticky */}
          <div className="flex items-start justify-between p-6 border-b border-border/40 bg-muted/30 flex-shrink-0">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{title}</h2>
              {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
            </div>
            {isDismissible && (
              <button
                onClick={onClose}
                className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

          {/* Footer - Sticky */}
          {footer && (
            <div className="border-t border-border/40 bg-muted/20 p-6 flex-shrink-0 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

Modal.displayName = 'Modal'
