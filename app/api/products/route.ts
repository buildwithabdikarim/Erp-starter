import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { productRepository } from '@/lib/repositories/ProductRepository'
import { productService } from '@/lib/services/ProductService'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const action = url.searchParams.get('action') // 'search', 'category', 'active'
  const query = url.searchParams.get('q')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 500)

  try {
    let result

    if (action === 'search' && query) {
      result = await productRepository.searchByName(query, limit)
    } else if (action === 'category' && query) {
      result = await productRepository.findByCategory(query, limit)
    } else if (action === 'active') {
      result = await productRepository.findActive(limit)
    } else {
      result = await productRepository.getAllProducts(limit)
    }

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error('[Products API] GET Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  try {
    const data = await request.json()

    const result = await productService.createProduct(session.user.id, data, ipAddress, userAgent)

    return Response.json(result)
  } catch (error) {
    console.error('[Products API] POST Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
