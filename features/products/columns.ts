import { TableColumn } from '@/types'

export const productColumns: TableColumn[] = [
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
    width: 120,
  },
  {
    id: 'costPrice',
    header: 'Cost Price',
    accessor: 'costPrice',
    sortable: true,
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
    width: 130,
    cell: (value) => {
      const num = typeof value === 'string' ? parseFloat(value) : value
      return isNaN(num) ? '-' : `$${num.toFixed(2)}`
    },
  },
  {
    id: 'reorderLevel',
    header: 'Stock',
    accessor: 'reorderLevel',
    sortable: true,
    width: 100,
    cell: (value) => {
      const num = typeof value === 'number' ? value : parseInt(value)
      const warning = num <= 10 ? ' ⚠' : ''
      return `${num}${warning}`
    },
  },
]
