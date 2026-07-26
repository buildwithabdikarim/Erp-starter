import { requirePageAuth } from '@/lib/auth-utils'
import { SalesClient } from './sales-client'

export default async function SalesPage() {
  await requirePageAuth()
  return <SalesClient />
}
