'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Cards from '@repay/react-credit-card'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Separator } from '~/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { cn, currencyToFloat, formatCurrency } from '~/lib/utils'
import { PaymentMethods, type payments } from '~/server/db/schema'
import { api } from '~/trpc/react'
import type { Order } from './columns'

type PaymentModalProps = {
  order: Order
  onClose: () => void
  isOpen: boolean
}

type CreatePayment = typeof payments.$inferInsert

enum CardType {
  Credit = 'credit',
  Debit = 'debit',
}

enum PaymentMethod {
  Pix = 'pix',
  Other = 'other',
  // Generic option for selecting Debit or Credit card afterwards
  Card = 'card',
}

const paymentMethodsSchema = {
  pix: z.object({
    amount: z.coerce.string().transform(currencyToFloat),
  }),
  card: z.object({
    type: z.enum(['credit', 'debit']),
    number: z.string(),
    expiry: z.string(),
    cvc: z.string(),
    name: z.string(),
    amount: z.coerce.string().transform(currencyToFloat),
  }),
  other: z.object({
    description: z.string().nonempty(),
    amount: z.coerce.string().transform(currencyToFloat),
  }),
}

enum PixPaymentStatus {
  Idle = 'idle',
  Pending = 'pending',
  Success = 'success',
}

export default function PaymentModal({
  isOpen,
  onClose,
  order,
}: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<PixPaymentStatus>(
    PixPaymentStatus.Idle,
  )
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    PaymentMethod.Pix,
  )

  const [pixInfo, setPixInfo] = useState<{
    transactionId: string
    amount: number
  }>({ transactionId: '', amount: 0 })

  const enablePixPayment = paymentStatus === PixPaymentStatus.Idle

  const apiUtils = api.useUtils()
  const getPixPayment = api.pix.getByTransactionId.useQuery(
    pixInfo.transactionId,
    {
      enabled: enablePixPayment,
      refetchInterval: 3000,
      refetchIntervalInBackground: true,
    },
  )

  const createPaymentApi = api.payments.create.useMutation({
    onSuccess(data) {
      setTotalPaid((prev) => prev + data.amount)
    },
  })
  const advanceOrderStatusApi = api.orders.advanceStatus.useMutation()

  const [totalPaid, setTotalPaid] = useState(0)

  useEffect(() => {
    const payment = getPixPayment.data?.amount || 0
    toast.success('Pagamento PIX recebido!')
    setTotalPaid((prev) => prev + payment)
    apiUtils.pix.getByTransactionId.invalidate(
      getPixPayment.data?.transactionId,
    )
    setPaymentStatus(PixPaymentStatus.Idle)
  }, [
    getPixPayment.data?.amount,
    getPixPayment.data?.transactionId,
    apiUtils.pix.getByTransactionId.invalidate,
  ])

  const pixForm = useForm<z.infer<typeof paymentMethodsSchema.pix>>({
    resolver: zodResolver(paymentMethodsSchema.pix),
  })

  const cardForm = useForm<z.infer<typeof paymentMethodsSchema.card>>({
    resolver: zodResolver(paymentMethodsSchema.card),
    defaultValues: {
      type: CardType.Credit,
      amount: order?.total,
      cvc: '',
      expiry: '',
      name: '',
      number: '',
    },
  })

  const otherForm = useForm<z.infer<typeof paymentMethodsSchema.other>>({
    resolver: zodResolver(paymentMethodsSchema.other),
  })

  const cardValues = cardForm.watch()

  const cardTypeLabel = {
    [CardType.Credit]: 'Crédito',
    [CardType.Debit]: 'Débito',
  }

  const pixAmount = pixForm.watch('amount')

  useEffect(() => {
    if (selectedMethod === PaymentMethod.Pix) {
      setPixInfo({
        transactionId: uuid(),
        amount: pixAmount,
      })
    }
  }, [selectedMethod, pixAmount])

  const pixUrl = useMemo(() => {
    const baseUrl = window.location.origin

    const pixInfoBase64 = btoa(
      JSON.stringify({
        transactionId: pixInfo?.transactionId,
        amount: pixInfo?.amount,
      }),
    )

    const pixParams = new URLSearchParams({
      q: pixInfoBase64,
    })

    const url = `${baseUrl}/pix?${pixParams}`

    return url
  }, [pixInfo])

  const handleCardSubmit = async (
    data: z.infer<typeof paymentMethodsSchema.card>,
  ) => {
    await createPaymentApi.mutateAsync({
      orderId: order.id,
      amount: data.amount,
      paymentDate: new Date(),
      paymentMethod:
        data.type === CardType.Credit
          ? PaymentMethods.CARD
          : PaymentMethods.DEBIT,
    })
  }

  const handleOtherSubmit = async (
    data: z.infer<typeof paymentMethodsSchema.other>,
  ) => {
    await createPaymentApi.mutateAsync({
      orderId: order.id,
      amount: data.amount,
      paymentDate: new Date(),
      paymentMethod: PaymentMethods.CASH,
    })
  }

  useEffect(() => {
    if (totalPaid >= order?.total) {
      advanceOrderStatusApi.mutate(order.id)
      apiUtils.orders.getTable.invalidate()
      apiUtils.orders.getTable.reset()
      toast.success('Pedido finalizado com sucesso!')

      // wait 3 seconds before closing the modal
      onClose()
    }
  }, [
    order?.id,
    onClose,
    order?.total,
    totalPaid,
    advanceOrderStatusApi.mutate,
    apiUtils.orders.getTable.invalidate,
    apiUtils.orders.getTable.reset,
  ])

  const remainingAmount = order?.total - totalPaid

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className={cn('overflow-y-scroll gap-8 max-h-[90vh]')}>
        <DialogHeader title="Pagamento">
          <DialogTitle>Pagamento</DialogTitle>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Valor Unit.</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order?.items?.map(({ product, quantity }) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-right">{quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.price * quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-bold">
                Total
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(order?.total)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3}>Pago</TableCell>
              <TableCell className="text-right">
                {formatCurrency(totalPaid)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3}>Restante</TableCell>
              <TableCell className="text-right">
                {formatCurrency(remainingAmount)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <Separator />
        <div className="flex flex-col gap-4">
          <RadioGroup
            defaultValue={PaymentMethod.Pix}
            onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
          >
            <Card>
              <CardHeader className="flex flex-row gap-2 items-end">
                <RadioGroupItem
                  value={PaymentMethod.Pix}
                  id={PaymentMethod.Pix}
                />
                <CardTitle>Pix</CardTitle>
              </CardHeader>
              {selectedMethod === PaymentMethod.Pix && (
                <CardContent className="animate-in fade-in duration-700">
                  <form
                    className="flex flex-col gap-3"
                    onSubmit={pixForm.handleSubmit(() => {
                      setPaymentStatus(PixPaymentStatus.Pending)
                    })}
                  >
                    <div className="p-4 bg-white self-center">
                      <QRCode size={256} value={pixUrl} />
                    </div>

                    <Label htmlFor="pixInfo">Chave Pix</Label>
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      {...pixForm.register('amount')}
                      type="currency"
                      min={0}
                      max={order?.total}
                    />
                    <CardTitle className="text-center">
                      Escaneie o QR Code para pagar
                    </CardTitle>
                    <Link
                      href={pixUrl}
                      target="_blank"
                      className="w-full"
                      passHref
                    >
                      <Button type="button" className="btn w-full">
                        Pagar
                      </Button>
                    </Link>
                  </form>
                </CardContent>
              )}
            </Card>
            <Card>
              <CardHeader className="flex flex-row gap-2 items-end">
                <RadioGroupItem
                  value={PaymentMethod.Card}
                  id={PaymentMethod.Card}
                />
                <CardTitle>Cartão</CardTitle>
              </CardHeader>
              {selectedMethod === PaymentMethod.Card && (
                <CardContent className="animate-in fade-in duration-700">
                  <form
                    className="flex flex-col gap-3 col-span-3"
                    onSubmit={cardForm.handleSubmit(handleCardSubmit)}
                  >
                    <div className="gap-3 flex flex-col w-full items-center">
                      <Cards
                        number={cardValues.number.replace(/\s/g, '')}
                        expiration={cardValues.expiry}
                        cvc={cardValues.cvc}
                        name={cardValues.name}
                      />
                      <RadioGroup
                        defaultValue={CardType.Credit}
                        onValueChange={(value) =>
                          cardForm.setValue('type', value as CardType)
                        }
                      >
                        <div className="flex flex-row gap-8">
                          <div className="flex flex-col gap-2 items-center">
                            <RadioGroupItem
                              value={CardType.Credit}
                              id={CardType.Credit}
                            />
                            <CardTitle>
                              {cardTypeLabel[CardType.Credit]}
                            </CardTitle>
                          </div>
                          <div className="flex flex-col gap-2 items-center">
                            <RadioGroupItem
                              value={CardType.Debit}
                              id={CardType.Debit}
                            />
                            <CardTitle>
                              {cardTypeLabel[CardType.Credit]}
                            </CardTitle>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <Label htmlFor="number">Número</Label>
                    <Input
                      {...cardForm.register('number')}
                      type="credit-card"
                      placeholder="0000 0000 0000 0000"
                      maxLength={16}
                    />

                    <Label htmlFor="expiry">Validade</Label>
                    <Input
                      {...cardForm.register('expiry')}
                      type="expiry"
                      placeholder="MM/AA"
                      maxLength={5}
                    />

                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      {...cardForm.register('cvc')}
                      type="text"
                      placeholder="123"
                      maxLength={3}
                    />

                    <Label htmlFor="amount">Valor</Label>
                    <Input {...cardForm.register('amount')} type="currency" />

                    <Button
                      type="submit"
                      className="btn"
                      isLoading={cardForm.formState.isSubmitting}
                    >
                      Pagar
                    </Button>
                  </form>
                </CardContent>
              )}
            </Card>
            <Card>
              <CardHeader className="flex flex-row gap-2 items-end">
                <RadioGroupItem
                  value={PaymentMethod.Other}
                  id={PaymentMethod.Other}
                />
                <CardTitle>Outro</CardTitle>
              </CardHeader>
              {selectedMethod === PaymentMethod.Other && (
                <CardContent className="animate-in fade-in duration-700">
                  <form
                    className="flex flex-col gap-3"
                    onSubmit={otherForm.handleSubmit(handleOtherSubmit)}
                  >
                    <Label htmlFor="description">Descrição</Label>
                    <Input {...otherForm.register('description')} />

                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      {...otherForm.register('amount')}
                      type="currency"
                      min={0}
                      max={order?.total}
                    />

                    <Button
                      type="submit"
                      className="btn"
                      isLoading={otherForm.formState.isSubmitting}
                    >
                      Pagar
                    </Button>
                  </form>
                </CardContent>
              )}
            </Card>
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  )
}
