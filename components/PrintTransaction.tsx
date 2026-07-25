'use client'

import React from 'react'
import { Sale, Product, Supplier } from '@/types'

interface PrintTransactionProps {
  sale: Sale & { product_name: string; supplier_name: string }
  product?: Product
  supplier?: Supplier
}

export const PrintTransaction: React.FC<PrintTransactionProps> = ({
  sale,
  product,
  supplier,
}) => {
  return (
    <div className="p-8 bg-white text-black max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-black pb-4">
          <h1 className="text-3xl font-bold">TRANSACTION RECEIPT</h1>
          <p className="text-sm text-gray-600 mt-2">Transaction ID: {sale.id}</p>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Supplier</p>
              <p className="text-lg font-medium">{sale.supplier_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Product</p>
              <p className="text-lg font-medium">{sale.product_name}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 text-right">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Date</p>
              <p className="text-lg font-medium">
                {new Date(sale.sale_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Time</p>
              <p className="text-lg font-medium">
                {new Date(sale.sale_date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Items Table */}
        <div className="border-t-2 border-b-2 border-black py-4">
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 font-bold text-sm uppercase border-b border-gray-300 pb-2">
              <div>Item</div>
              <div className="text-center">Qty</div>
              <div className="text-right">Unit Price</div>
              <div className="text-right">Total</div>
            </div>
            <div className="grid grid-cols-4 gap-4 py-3">
              <div className="text-sm">{sale.product_name}</div>
              <div className="text-center text-sm">{sale.quantity}</div>
              <div className="text-right text-sm">${sale.unit_price.toFixed(2)}</div>
              <div className="text-right font-semibold">${sale.total_amount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2 ml-auto w-64">
          <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
            <span>Subtotal:</span>
            <span>${sale.total_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-2">
            <span>Total Amount:</span>
            <span>${sale.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black pt-4 text-center text-xs text-gray-600 space-y-1">
          <p>Thank you for your business</p>
          <p>This is a computer generated receipt</p>
          <p className="mt-3 text-gray-400">Printed on {new Date().toLocaleString('en-US')}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

PrintTransaction.displayName = 'PrintTransaction'
