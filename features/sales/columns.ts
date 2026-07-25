import { TableColumn } from '@/types'

export const salesColumns: TableColumn[] = [
  {
    id: 'customer_name',
    header: 'Customer',
    accessor: 'customer_name',
    sortable: true,
    width: 150,
    filterable: true,
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
    width: 80,
    cell: (value) => `${value}x`,
  },
  {
    id: 'unit_price',
    header: 'Unit Price',
    accessor: 'unit_price',
    sortable: true,
    width: 120,
    cell: (value) => `$${(value as number).toFixed(2)}`,
  },
  {
    id: 'total_amount',
    header: 'Total',
    accessor: 'total_amount',
    sortable: true,
    width: 120,
    cell: (value) => `$${(value as number).toFixed(2)}`,
  },
  {
    id: 'sale_date',
    header: 'Date',
    accessor: 'sale_date',
    sortable: true,
    width: 130,
    cell: (value) => {
      const date = new Date(value as string)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
  },
]
