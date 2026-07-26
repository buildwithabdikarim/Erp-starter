import { requireApiAuth, getRequestMeta } from '@/lib/auth-utils'
import { productRepository } from '@/lib/repositories/ProductRepository'
import { productService } from '@/lib/services/ProductService'

export async function GET(request: Request) {
  const authResult = await requireApiAuth()
  if (authResult.error) return authResult.error

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
  const authResult = await requireApiAuth()
  if (authResult.error) return authResult.error

  const { ipAddress, userAgent } = await getRequestMeta()

  try {
    const data = await request.json()
    const result = await productService.createProduct(
      authResult.session.user.id,
      data,
      ipAddress,
      userAgent
    )

    return Response.json(result)
  } catch (error) {
    console.error('[Products API] POST Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
