import { requirePageAuth } from '@/lib/auth-utils'
import { SuppliersClient } from './suppliers-client'

export default async function SuppliersPage() {
  await requirePageAuth()
  return <SuppliersClient />
}
