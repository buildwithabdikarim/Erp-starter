'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Product {
  id: string
  name: string
  sku: string
  category?: string
  costPrice?: number
  sellingPrice?: number
  isActive: boolean
  createdAt: Date
}

const PRODUCTS_QUERY_KEY = ['products']

export function useProducts(options?: { limit?: number; action?: string; q?: string }) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, options],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.limit) params.append('limit', options.limit.toString())
      if (options?.action) params.append('action', options.action)
      if (options?.q) params.append('q', options.q)

      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      return response.json()
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`)
      if (!response.ok) throw new Error('Failed to fetch product')
      return response.json()
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create product')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update product')
      return response.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, id] })
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, permanent }: { id: string; permanent?: boolean }) => {
      const response = await fetch(`/api/products/${id}?permanent=${permanent ? 'true' : 'false'}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete product')
      return response.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, id] })
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}

export function useProductStats() {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/products?action=stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
  })
}
