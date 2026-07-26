import { TableColumn } from '@/types'

export const supplierColumns: TableColumn[] = [
  {
    id: 'code',
    header: 'Code',
    accessor: 'code',
    sortable: true,
    filterable: true,
    width: 110,
  },
  {
    id: 'name',
    header: 'Supplier Name',
    accessor: 'name',
    sortable: true,
    filterable: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'email',
    sortable: true,
    filterable: true,
    width: 220,
  },
  {
    id: 'phone',
    header: 'Phone',
    accessor: 'phone',
    sortable: true,
    filterable: true,
    width: 150,
  },
  {
    id: 'address',
    header: 'Address',
    accessor: 'address',
    sortable: true,
    filterable: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    filterable: true,
    width: 100,
  },
]
