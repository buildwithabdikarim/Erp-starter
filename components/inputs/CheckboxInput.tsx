import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const CheckboxInput = forwardRef<HTMLInputElement, CheckboxInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'w-4 h-4 rounded border border-input bg-background',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'cursor-pointer transition-colors duration-200',
              'accent-primary',
              error && 'border-destructive focus:ring-destructive',
              className
            )}
            {...props}
          />
          {label && (
            <label className="text-sm font-medium text-foreground cursor-pointer">
              {label}
              {props.required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
        </div>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}
      </div>
    )
  }
)

CheckboxInput.displayName = 'CheckboxInput'
