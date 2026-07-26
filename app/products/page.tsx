import { requirePageAuth } from '@/lib/auth-utils'
import { ProductsClient } from './products-client'

export default async function ProductsPage() {
  await requirePageAuth()
  return <ProductsClient />
}
