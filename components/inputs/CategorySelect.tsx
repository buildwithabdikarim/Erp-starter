'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus } from 'lucide-react'

interface CategorySelectProps {
  name: string
  label: string
  value: string
  onChange: (e: { target: { name: string; value: string } }) => void
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
  options: Array<{ value: string | number; label: string }>
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  disabled,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsCreating(false)
        setNewCategory('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (selectedValue: string | number) => {
    onChange({ target: { name, value: String(selectedValue) } })
    setIsOpen(false)
  }

  const handleCreateCategory = () => {
    if (newCategory.trim() && !options.some((opt) => opt.value === newCategory)) {
      handleSelect(newCategory)
      setNewCategory('')
      setIsCreating(false)
    }
  }

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen)
            setIsCreating(false)
          }}
          disabled={disabled}
          className={`w-full px-4 py-2 text-left border rounded-lg flex items-center justify-between bg-background text-foreground transition-colors ${
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500'
              : 'border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-border'}`}
        >
          <span>{selectedLabel}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    value === option.value ? 'bg-muted text-primary font-medium' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Add New Category Option */}
            <div className="border-t border-border/30">
              {!isCreating ? (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Category
                </button>
              ) : (
                <div className="p-3 space-y-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateCategory()
                      } else if (e.key === 'Escape') {
                        setIsCreating(false)
                        setNewCategory('')
                      }
                    }}
                    placeholder="Enter category name"
                    autoFocus
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={!newCategory.trim()}
                      className="flex-1 px-2 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false)
                        setNewCategory('')
                      }}
                      className="flex-1 px-2 py-1 text-sm bg-muted text-foreground rounded hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
