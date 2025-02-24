'use client'
import { ArrowLeftToLine, Download } from 'lucide-react'
import * as React from 'react'
import { usePDF } from 'react-to-pdf'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { formatCurrency } from '~/lib/utils'
import type { RouterOutputs } from '~/trpc/react'

type Product = RouterOutputs['orders']['getById']['items'][0]['product']

type InvoiceTemplateProps = {
  order: RouterOutputs['orders']['getById']
}

export function InvoiceTemplate({ order }: InvoiceTemplateProps) {
  const [accessKey, setAccessKey] = React.useState('')
  const { toPDF, targetRef } = usePDF({ filename: `${order.id}.pdf` })

  const orderItems = order.items

  // Calculate totals and taxes
  const subtotal = orderItems.reduce(
    (acc, orderItem) => acc + orderItem.quantity * orderItem.product.price,
    0,
  )

  const taxes = {
    icms: subtotal * 0.18,
    ipi: subtotal * 0.05,
    pis: subtotal * 0.0165,
    cofins: subtotal * 0.076,
  }
  const totalTaxes = Object.values(taxes).reduce((acc, tax) => acc + tax, 0)
  const total = subtotal + totalTaxes

  React.useEffect(() => {
    const generateAccessKey = () => {
      const date = new Date()
      const orderId = Math.floor(Math.random() * 1000000)
      const key = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${orderId}${Math.random().toString(36).substring(2, 15)}`
      setAccessKey(key)
    }
    generateAccessKey()
  }, [])

  // Download PDF function
  const downloadPDF = async () => {
    toPDF({
      resolution: 7,
      overrides: {
        canvas: {
          backgroundColor: 'white',
        },
      },
    })
  }

  return (
    <div className="container mx-auto p-4 max-w-[1024px]">
      <div className="bg-white rounded-xl p-4" ref={targetRef}>
        <Card id="invoice" className="bg-white text-black">
          <CardHeader className="gap-4 border-b">
            <CardTitle className="text-2xl text-center text-black">
              DANFE - Documento Auxiliar da Nota Fiscal Eletrônica
            </CardTitle>
            <div className="text-sm border rounded p-2 text-black">
              <span className="font-semibold">CHAVE DE ACESSO: </span>
              {accessKey}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2 border-b pb-4">
              <p className="text-black">
                <span className="font-semibold">Funcionário: </span>
                {order.user?.name}
              </p>
              <p className="text-black">
                <span className="font-semibold">Cliente: </span>
                {order.client?.name}
              </p>
              <p className="text-black">
                <span className="font-semibold">Data Nascimento: </span>
                {new Date(
                  order.client?.birthDate as string,
                ).toLocaleDateString()}
              </p>
              <p className="text-black">
                <span className="font-semibold">CPF/CNPJ: </span>
                {order.client?.cpf}
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-black">
                  <TableHead className="text-black">Código</TableHead>
                  <TableHead className="text-black">Descrição</TableHead>
                  <TableHead className="text-right text-black">Qtd</TableHead>
                  <TableHead className="text-right text-black">
                    Valor Unitário
                  </TableHead>
                  <TableHead className="text-right text-black">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((orderItem) => (
                  <TableRow key={orderItem.productId} className="border-black">
                    <TableCell className="text-black">
                      {orderItem.productId}
                    </TableCell>
                    <TableCell className="text-black">
                      {orderItem.product.name}
                    </TableCell>
                    <TableCell className="text-right text-black">
                      {orderItem.quantity}
                    </TableCell>
                    <TableCell className="text-right text-black">
                      {formatCurrency(orderItem.product.price)}
                    </TableCell>
                    <TableCell className="text-right text-black">
                      {formatCurrency(
                        orderItem.quantity * orderItem.product.price,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-2 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-black">Impostos:</h3>
                  <p className="text-black">
                    ICMS (18%): {formatCurrency(taxes.icms)}
                  </p>
                  <p className="text-black">
                    IPI (5%): {formatCurrency(taxes.ipi)}
                  </p>
                  <p className="text-black">
                    PIS (1.65%): {formatCurrency(taxes.pis)}
                  </p>
                  <p className="text-black">
                    COFINS (7.6%): {formatCurrency(taxes.cofins)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-black">
                    Subtotal: {formatCurrency(subtotal)}
                  </p>
                  <p className="font-semibold text-black">
                    Total Impostos: {formatCurrency(totalTaxes)}
                  </p>
                  <p className="text-lg font-bold mt-2 text-black">
                    Valor Final: {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 text-center text-sm text-black">
              Recebemos os produtos constantes nesta nota fiscal.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 gap-4 flex justify-end">
        <Button onClick={() => window.history.back()}>
          <ArrowLeftToLine className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={downloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </Button>
      </div>
    </div>
  )
}
