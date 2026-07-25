'use client'

import React from 'react'
import { Sale } from '@/types'

interface PrintTransactionGroupProps {
  transactions: (Sale & { product_name: string; supplier_name: string })[]
  groupBy: 'date' | 'supplier' | 'manual'
  title?: string
}

interface GroupedTransactions {
  [key: string]: (Sale & { product_name: string; supplier_name: string })[]
}

export const PrintTransactionGroup: React.FC<PrintTransactionGroupProps> = ({
  transactions,
  groupBy,
  title,
}) => {
  const groupTransactions = (): GroupedTransactions => {
    const groups: GroupedTransactions = {}

    transactions.forEach((transaction) => {
      let key: string

      if (groupBy === 'date') {
        const date = new Date(transaction.sale_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        key = date
      } else if (groupBy === 'supplier') {
        key = transaction.supplier_name
      } else {
        key = 'All Transactions'
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(transaction)
    })

    return groups
  }

  const grouped = groupTransactions()
  const groupKeys = Object.keys(grouped).sort()

  return (
    <div className="p-8 bg-white text-black">
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .page-break {
            page-break-after: always;
            padding: 40px 0;
          }
        }
      `}</style>

      {groupKeys.map((groupKey, groupIndex) => (
        <div key={groupKey} className={`${groupIndex > 0 ? 'page-break' : ''}`}>
          {/* Header */}
          <div className="border-b-2 border-black pb-4 mb-6">
            <h1 className="text-3xl font-bold">TRANSACTION REPORT</h1>
            {title && <p className="text-sm text-gray-600 mt-2">{title}</p>}
            <p className="text-sm text-gray-600 mt-1">
              {groupBy === 'date' && `Date: ${groupKey}`}
              {groupBy === 'supplier' && `Supplier: ${groupKey}`}
              {groupBy === 'manual' && `Report: ${groupKey}`}
            </p>
          </div>

          {/* Transactions Table */}
          <div className="mb-8">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-2 px-2 font-bold uppercase">Transaction ID</th>
                  <th className="text-left py-2 px-2 font-bold uppercase">Product</th>
                  <th className="text-left py-2 px-2 font-bold uppercase">Supplier</th>
                  <th className="text-center py-2 px-2 font-bold uppercase">Qty</th>
                  <th className="text-right py-2 px-2 font-bold uppercase">Unit Price</th>
                  <th className="text-right py-2 px-2 font-bold uppercase">Total</th>
                  {groupBy !== 'date' && (
                    <th className="text-left py-2 px-2 font-bold uppercase">Date</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {grouped[groupKey].map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={`border-b border-gray-300 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                  >
                    <td className="py-2 px-2">{transaction.id.substring(0, 8)}</td>
                    <td className="py-2 px-2">{transaction.product_name}</td>
                    <td className="py-2 px-2">{transaction.supplier_name}</td>
                    <td className="py-2 px-2 text-center">{transaction.quantity}</td>
                    <td className="py-2 px-2 text-right">${transaction.unit_price.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-semibold">
                      ${transaction.total_amount.toFixed(2)}
                    </td>
                    {groupBy !== 'date' && (
                      <td className="py-2 px-2">
                        {new Date(transaction.sale_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Group Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                <span>Item Count:</span>
                <span className="font-semibold">{grouped[groupKey].length}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                <span>Total Quantity:</span>
                <span className="font-semibold">
                  {grouped[groupKey].reduce((sum, t) => sum + t.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-2">
                <span>Group Total:</span>
                <span>
                  ${grouped[groupKey].reduce((sum, t) => sum + t.total_amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-black pt-4 text-center text-xs text-gray-600 space-y-1">
            <p>This is a computer generated report</p>
            <p className="mt-3 text-gray-400">Printed on {new Date().toLocaleString('en-US')}</p>
          </div>
        </div>
      ))}

      {/* Grand Total */}
      {groupKeys.length > 1 && (
        <div className="mt-12 pt-8 border-t-2 border-black">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                <span>Total Transactions:</span>
                <span className="font-semibold">{transactions.length}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                <span>Total Quantity:</span>
                <span className="font-semibold">
                  {transactions.reduce((sum, t) => sum + t.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t-2 border-black pt-2">
                <span>GRAND TOTAL:</span>
                <span>${transactions.reduce((sum, t) => sum + t.total_amount, 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

PrintTransactionGroup.displayName = 'PrintTransactionGroup'
