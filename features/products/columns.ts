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
    id: 'supplier_name',
    header: 'Supplier',
    accessor: 'supplier_name',
    sortable: true,
    width: 150,
  },
  {
    id: 'cost_price',
    header: 'Cost Price',
    accessor: 'cost_price',
    sortable: true,
    width: 130,
    cell: (value) => `$${parseFloat(value).toFixed(2)}`,
  },
  {
    id: 'selling_price',
    header: 'Selling Price',
    accessor: 'selling_price',
    sortable: true,
    width: 130,
    cell: (value) => `$${parseFloat(value).toFixed(2)}`,
  },
  {
    id: 'quantity',
    header: 'Stock',
    accessor: 'quantity',
    sortable: true,
    width: 100,
    cell: (value) => {
      const warning = value <= 10 ? ' ⚠' : ''
      return `${value}${warning}`
    },
  },
]
