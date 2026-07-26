import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { productRepository } from '@/lib/repositories/ProductRepository'
import { productService } from '@/lib/services/ProductService'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  try {
    const { id } = await params
    const data = await request.json()

    const result = await productService.updateProduct(session.user.id, id, data, ipAddress, userAgent)

    return Response.json(result)
  } catch (error) {
    console.error('[Products API] PUT Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  try {
    const { id } = await params
    const url = new URL(request.url)
    const permanent = url.searchParams.get('permanent') === 'true'

    const result = await productService.deleteProduct(session.user.id, id, permanent, ipAddress, userAgent)

    return Response.json(result)
  } catch (error) {
    console.error('[Products API] DELETE Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
