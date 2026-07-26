'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Simple label primitive used with TextInput when needed.
 * Prefer TextInput's built-in `label` prop in app screens.
 */
export function Label({
  className,
  ...props
}: React.ComponentProps<'label'>) {
  return (
    <label
      className={cn('block text-sm font-medium text-foreground mb-1.5', className)}
      {...props}
    />
  )
}
