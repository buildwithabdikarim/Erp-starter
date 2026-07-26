import { TableColumn } from '@/types'

export const productColumns: TableColumn[] = [
  {
    id: 'code',
    header: 'Code',
    accessor: 'code',
    sortable: true,
    filterable: true,
    width: 110,
  },
  {
    id: 'sku',
    header: 'SKU',
    accessor: 'sku',
    sortable: true,
    filterable: true,
    width: 120,
  },
  {
    id: 'name',
    header: 'Product Name',
    accessor: 'name',
    sortable: true,
    filterable: true,
  },
  {
    id: 'category',
    header: 'Category',
    accessor: 'category',
    sortable: true,
    filterable: true,
    width: 120,
  },
  {
    id: 'costPrice',
    header: 'Cost Price',
    accessor: 'costPrice',
    sortable: true,
    filterable: false,
    width: 130,
    cell: (value) => {
      const num = typeof value === 'string' ? parseFloat(value) : value
      return isNaN(num) ? '-' : `$${num.toFixed(2)}`
    },
  },
  {
    id: 'sellingPrice',
    header: 'Selling Price',
    accessor: 'sellingPrice',
    sortable: true,
    filterable: false,
    width: 130,
    cell: (value) => {
      const num = typeof value === 'string' ? parseFloat(value) : value
      return isNaN(num) ? '-' : `$${num.toFixed(2)}`
    },
  },
  {
    id: 'reorderLevel',
    header: 'Reorder',
    accessor: 'reorderLevel',
    sortable: true,
    filterable: false,
    width: 100,
    cell: (value) => {
      const num = typeof value === 'number' ? value : parseInt(value)
      const warning = num <= 10 ? ' ⚠' : ''
      return `${num}${warning}`
    },
  },
]
