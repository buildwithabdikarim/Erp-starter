import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { product, salesOrder, salesOrderLineItem } from '@/lib/db/schema'
import { BaseRepository } from './BaseRepository'

export class SalesOrderRepository extends BaseRepository<any> {
  constructor() {
    super(salesOrder)
  }

  async listDetailed(limit = 50) {
    const rows = await db
      .select({
        id: salesOrder.id,
        code: salesOrder.code,
        customerName: salesOrder.customerName,
        orderDate: salesOrder.orderDate,
        totalAmount: salesOrder.totalAmount,
        status: salesOrder.status,
        createdAt: salesOrder.createdAt,
        lineItemId: salesOrderLineItem.id,
        productId: salesOrderLineItem.productId,
        quantity: salesOrderLineItem.quantity,
        unitPrice: salesOrderLineItem.unitPrice,
        lineTotal: salesOrderLineItem.lineTotal,
        productName: product.name,
      })
      .from(salesOrder)
      .leftJoin(salesOrderLineItem, eq(salesOrderLineItem.salesOrderId, salesOrder.id))
      .leftJoin(product, eq(product.id, salesOrderLineItem.productId))
      .where(and(isNull(salesOrder.deletedAt), isNull(salesOrderLineItem.deletedAt)))
      .limit(limit)

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      customerName: row.customerName,
      productId: row.productId,
      product_name: row.productName || 'Unknown',
      // Print UI historically used supplier_name — map customer for compatibility
      supplier_name: row.customerName,
      quantity: row.quantity ?? 0,
      unit_price: Number(row.unitPrice ?? 0),
      total_amount: Number(row.lineTotal ?? row.totalAmount ?? 0),
      sale_date: row.orderDate ? new Date(row.orderDate).toISOString() : null,
      status: row.status,
      lineItemId: row.lineItemId,
      createdAt: row.createdAt,
    }))
  }

  async createWithLine(input: {
    userId: string
    customerName: string
    productId: string
    quantity: number
    unitPrice: number
    orderDate?: string | Date
  }) {
    const quantity = Number(input.quantity)
    const unitPrice = Number(input.unitPrice)
    const lineTotal = quantity * unitPrice
    const orderDate = input.orderDate ? new Date(input.orderDate) : new Date()
    const code = `SO-${Date.now()}`

    const [order] = await db
      .insert(salesOrder)
      .values({
        code,
        customerName: input.customerName,
        orderDate,
        subtotal: String(lineTotal.toFixed(2)),
        tax: '0',
        totalAmount: String(lineTotal.toFixed(2)),
        status: 'confirmed',
        paymentStatus: 'unpaid',
        createdBy: input.userId,
      })
      .returning()

    const [line] = await db
      .insert(salesOrderLineItem)
      .values({
        salesOrderId: order.id,
        productId: input.productId,
        quantity,
        unitPrice: String(unitPrice.toFixed(2)),
        lineTotal: String(lineTotal.toFixed(2)),
      })
      .returning()

    return { order, line }
  }

  async updateWithLine(
    orderId: string,
    input: {
      customerName?: string
      productId?: string
      quantity?: number
      unitPrice?: number
      orderDate?: string | Date
    }
  ) {
    const existingOrder = await this.findById(orderId)
    if (!existingOrder) {
      throw new Error('Sales order not found')
    }

    const lines = await db
      .select()
      .from(salesOrderLineItem)
      .where(
        and(eq(salesOrderLineItem.salesOrderId, orderId), isNull(salesOrderLineItem.deletedAt))
      )
      .limit(1)

    const line = lines[0]
    if (!line) {
      throw new Error('Sales order line item not found')
    }

    const quantity = Number(input.quantity ?? line.quantity)
    const unitPrice = Number(input.unitPrice ?? line.unitPrice)
    const lineTotal = quantity * unitPrice

    const [updatedOrder] = await db
      .update(salesOrder)
      .set({
        customerName: input.customerName ?? existingOrder.customerName,
        orderDate: input.orderDate ? new Date(input.orderDate) : existingOrder.orderDate,
        subtotal: String(lineTotal.toFixed(2)),
        totalAmount: String(lineTotal.toFixed(2)),
        updatedAt: new Date(),
      })
      .where(eq(salesOrder.id, orderId))
      .returning()

    const [updatedLine] = await db
      .update(salesOrderLineItem)
      .set({
        productId: input.productId ?? line.productId,
        quantity,
        unitPrice: String(unitPrice.toFixed(2)),
        lineTotal: String(lineTotal.toFixed(2)),
        updatedAt: new Date(),
      })
      .where(eq(salesOrderLineItem.id, line.id))
      .returning()

    return { order: updatedOrder, line: updatedLine }
  }
}

export const salesOrderRepository = new SalesOrderRepository()
