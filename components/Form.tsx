'use client'

import React, { useState } from 'react'
import { FormConfig } from '@/types'
import { TextInput, SelectInput, TextAreaInput, CheckboxInput, CategorySelect } from './inputs'
import { Button } from './Button'

interface FormProps {
  config: FormConfig
  onSubmit: (data: Record<string, any>) => Promise<void> | void
  onCancel?: () => void
  initialValues?: Record<string, any>
  isLoading?: boolean
}

export const Form: React.FC<FormProps> = ({
  config,
  onSubmit,
  onCancel,
  initialValues = {},
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const field = config.fields.find((f) => f.name === name)

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else if (type === 'number' || field?.type === 'number') {
      // Convert string value to number for number-type fields
      const numValue = value === '' ? '' : Number(value)
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    config.fields.forEach((field) => {
      const value = formData[field.name]

      if (field.required && (!value || value === '')) {
        newErrors[field.name] = 'This field is required'
      } else if (field.validation && value) {
        const result = field.validation.safeParse(value)
        if (!result.success) {
          const firstError = result.error.issues[0]
          newErrors[field.name] = firstError?.message || 'Invalid input'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {config.fields.map((field) => {
        const error = errors[field.name]
        const value = formData[field.name] ?? field.defaultValue ?? ''

        // Special handling for category fields
        if (field.name === 'category' && field.type === 'select') {
          return (
            <CategorySelect
              key={field.name}
              name={field.name}
              label={field.label}
              value={value}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              error={error}
              disabled={isLoading || isSubmitting}
              options={field.options || []}
            />
          )
        }

        switch (field.type) {
          case 'textarea':
            return (
              <TextAreaInput
                key={field.name}
                name={field.name}
                label={field.label}
                value={value}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                error={error}
                rows={field.rows}
                disabled={isLoading || isSubmitting}
              />
            )

          case 'select':
            return (
              <SelectInput
                key={field.name}
                name={field.name}
                label={field.label}
                value={value}
                onChange={handleChange}
                placeholder={field.placeholder}
                options={field.options || []}
                required={field.required}
                error={error}
                disabled={isLoading || isSubmitting}
              />
            )

          case 'checkbox':
            return (
              <CheckboxInput
                key={field.name}
                name={field.name}
                label={field.label}
                checked={!!value}
                onChange={handleChange}
                required={field.required}
                error={error}
                disabled={isLoading || isSubmitting}
              />
            )

          case 'email':
          case 'password':
          case 'number':
          case 'date':
            return (
              <TextInput
                key={field.name}
                name={field.name}
                type={field.type}
                label={field.label}
                value={value}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                error={error}
                disabled={isLoading || isSubmitting}
                min={field.min}
                max={field.max}
                pattern={field.pattern}
              />
            )

          default:
            return (
              <TextInput
                key={field.name}
                name={field.name}
                label={field.label}
                value={value}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                error={error}
                disabled={isLoading || isSubmitting}
                pattern={field.pattern}
              />
            )
        }
      })}

      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting} type="button">
            {config.cancelLabel || 'Cancel'}
          </Button>
        )}
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          {config.submitLabel || 'Submit'}
        </Button>
      </div>
    </form>
  )
}

Form.displayName = 'Form'
