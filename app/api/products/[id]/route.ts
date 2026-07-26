import { requireApiAuth, getRequestMeta } from '@/lib/auth-utils'
import { productRepository } from '@/lib/repositories/ProductRepository'
import { productService } from '@/lib/services/ProductService'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireApiAuth()
  if (authResult.error) return authResult.error

  try {
    const { id } = await params
    const product = await productRepository.findById(id)

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    return Response.json(product)
  } catch (error) {
    console.error('[Products API] GET Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireApiAuth()
  if (authResult.error) return authResult.error

  const { ipAddress, userAgent } = await getRequestMeta()

  try {
    const { id } = await params
    const data = await request.json()

    const result = await productService.updateProduct(
      authResult.session.user.id,
      id,
      data,
      ipAddress,
      userAgent
    )

    return Response.json(result)
  } catch (error) {
    console.error('[Products API] PUT Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireApiAuth()
  if (authResult.error) return authResult.error

  const { ipAddress, userAgent } = await getRequestMeta()

  try {
    const { id } = await params
    const url = new URL(request.url)
    const permanent = url.searchParams.get('permanent') === 'true'

    const result = await productService.deleteProduct(
      authResult.session.user.id,
      id,
      permanent,
      ipAddress,
      userAgent
    )

    return Response.json(result)
  } catch (error) {
    console.error('[Products API] DELETE Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
