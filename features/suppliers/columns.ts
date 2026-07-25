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
    width: 220,
    cell: (value) => value as string,
  },
  {
    id: 'phone',
    header: 'Phone',
    accessor: 'phone',
    sortable: true,
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
