import { productRepository } from '@/lib/repositories/ProductRepository'
import { auditRepository } from '@/lib/repositories/AuditRepository'
import { logAudit } from '@/lib/audit-logger'

export class ProductService {
  async createProduct(userId: string, data: any, ipAddress?: string, userAgent?: string) {
    try {
      const product = await productRepository.create({
        ...data,
        userId,
      })

      await logAudit({
        userId,
        action: 'CREATE',
        module: 'products',
        entityId: product.id,
        entityType: 'Product',
        changes: data,
        status: 'success',
        ipAddress,
        userAgent,
      })

      return { success: true, product }
    } catch (error) {
      await logAudit({
        userId,
        action: 'CREATE',
        module: 'products',
        entityId: 'unknown',
        entityType: 'Product',
        changes: data,
        status: 'failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        ipAddress,
        userAgent,
      })
      throw error
    }
  }

  async updateProduct(userId: string, productId: string, data: any, ipAddress?: string, userAgent?: string) {
    try {
      const product = await productRepository.findById(productId)
      if (!product) {
        throw new Error('Product not found')
      }

      const updated = await productRepository.update(productId, data)

      await logAudit({
        userId,
        action: 'UPDATE',
        module: 'products',
        entityId: productId,
        entityType: 'Product',
        changes: {
          before: product,
          after: data,
        },
        status: 'success',
        ipAddress,
        userAgent,
      })

      return { success: true, product: updated }
    } catch (error) {
      await logAudit({
        userId,
        action: 'UPDATE',
        module: 'products',
        entityId: productId,
        entityType: 'Product',
        changes: data,
        status: 'failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        ipAddress,
        userAgent,
      })
      throw error
    }
  }

  async deleteProduct(userId: string, productId: string, permanent = false, ipAddress?: string, userAgent?: string) {
    try {
      const product = await productRepository.findById(productId)
      if (!product) {
        throw new Error('Product not found')
      }

      let deleted
      if (permanent) {
        deleted = await productRepository.hardDelete(productId)
      } else {
        deleted = await productRepository.softDelete(productId)
      }

      await logAudit({
        userId,
        action: 'DELETE',
        module: 'products',
        entityId: productId,
        entityType: 'Product',
        changes: { permanent },
        status: 'success',
        ipAddress,
        userAgent,
      })

      return { success: true, product: deleted }
    } catch (error) {
      await logAudit({
        userId,
        action: 'DELETE',
        module: 'products',
        entityId: productId,
        entityType: 'Product',
        changes: { permanent },
        status: 'failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        ipAddress,
        userAgent,
      })
      throw error
    }
  }

  async getProductStats(userId: string) {
    const allProducts = await productRepository.findAll({ includeSoftDeleted: false })
    const products = allProducts.where?.((p: any) => p.userId === userId) || []

    return {
      total: products.length,
      active: products.filter((p: any) => p.isActive).length,
      deleted: (await productRepository.findDeleted()).filter((p: any) => p.userId === userId).length,
      byCategory: this.groupByCategory(products),
    }
  }

  private groupByCategory(products: any[]) {
    return products.reduce(
      (acc, p) => {
        acc[p.category || 'Uncategorized'] = (acc[p.category || 'Uncategorized'] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }
}

export const productService = new ProductService()
