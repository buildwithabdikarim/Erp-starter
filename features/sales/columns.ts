import { TableColumn } from '@/types'

export const salesColumns: TableColumn[] = [
  {
    id: 'code',
    header: 'Order Code',
    accessor: 'code',
    sortable: true,
    filterable: true,
    width: 130,
  },
  {
    id: 'customerName',
    header: 'Customer',
    accessor: 'customerName',
    sortable: true,
    filterable: true,
    width: 160,
  },
  {
    id: 'product_name',
    header: 'Product',
    accessor: 'product_name',
    sortable: true,
    width: 180,
    filterable: true,
  },
  {
    id: 'quantity',
    header: 'Qty',
    accessor: 'quantity',
    sortable: true,
    filterable: false,
    width: 80,
    cell: (value) => `${value}x`,
  },
  {
    id: 'unit_price',
    header: 'Unit Price',
    accessor: 'unit_price',
    sortable: true,
    filterable: false,
    width: 120,
    cell: (value) => `$${Number(value).toFixed(2)}`,
  },
  {
    id: 'total_amount',
    header: 'Total',
    accessor: 'total_amount',
    sortable: true,
    filterable: false,
    width: 120,
    cell: (value) => `$${Number(value).toFixed(2)}`,
  },
  {
    id: 'sale_date',
    header: 'Date',
    accessor: 'sale_date',
    sortable: true,
    filterable: false,
    width: 130,
    cell: (value) => {
      if (!value) return '-'
      const date = new Date(value as string)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
  },
]
