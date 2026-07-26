import { productRepository } from '@/lib/repositories/ProductRepository'

export async function GET() {
  try {
    const products = await productRepository.getAllProducts(100)

    return Response.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error('[Public Products API] GET Error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
