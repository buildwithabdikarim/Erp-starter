import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const TextAreaInput = forwardRef<HTMLTextAreaElement, TextAreaInputProps>(
  ({ label, error, helperText, className, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5 text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full px-3 py-2 rounded border border-input bg-background text-foreground',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200 resize-vertical',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}
      </div>
    )
  }
)

TextAreaInput.displayName = 'TextAreaInput'
