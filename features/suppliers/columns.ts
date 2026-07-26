import { TableColumn } from '@/types'

export const supplierColumns: TableColumn[] = [
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
]
