'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { currencyToFloat } from '~/lib/utils'
import { api } from '~/trpc/react'
import { PaymentSucess } from './_components/payment-succesful'

type PixInfo = {
  transactionId: string
  amount: string
}

const formSchema = z.object({
  cpf: z
    .string()
    .min(12)
    .transform((v) => v.replace(/\D/g, '')),
  amount: z.coerce.string(),
  transactionId: z.string(),
})

type PixSchema = z.infer<typeof formSchema>

export default function Pix() {
  const [pixInfo, setPixInfo] = useState<PixInfo | null>(null)
  const [success, setSuccess] = useState(false)

  const searchParams = useSearchParams()
  const q = searchParams.get('q')

  const pixTransactionApi = api.pix.simulatePixPayment.useMutation()

  useEffect(() => {
    if (!q) return

    const pixInfoBas64 = atob(q)
    const json = JSON.parse(pixInfoBas64) as PixInfo

    setPixInfo(json)
  }, [q])

  const submitPayment = async (data: PixSchema) => {
    if (!pixInfo) return

    try {
      await pixTransactionApi.mutateAsync({
        ...data,
        amount: currencyToFloat(data.amount),
      })

      setSuccess(true)
    } catch (error) {
      console.error(error)
    }
  }

  const pixForm = useForm<PixSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: pixInfo?.amount,
      transactionId: pixInfo?.transactionId,
    },
  })

  useEffect(() => {
    if (!pixInfo) return

    pixForm.setValue('amount', pixInfo.amount)
    pixForm.setValue('transactionId', pixInfo.transactionId)
  }, [pixInfo, pixForm])

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      {success ? (
        <PaymentSucess
          amount={currencyToFloat(pixInfo?.amount ?? '0')}
          transactionId={pixInfo?.transactionId || ''}
        />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              Simulador de Pagamento pix{' '}
            </CardTitle>
          </CardHeader>
          <CardHeader>
            <CardTitle>Id da transação: </CardTitle>
            <CardDescription>{pixInfo?.transactionId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col items-center justify-center">
            <form
              onSubmit={pixForm.handleSubmit(submitPayment)}
              className="gap-4 flex flex-col w-full"
            >
              <Label htmlFor="cpf">CPF</Label>
              <Input
                type="cpf"
                id="cpf"
                maxLength={12}
                {...pixForm.register('cpf')}
              />

              <Label htmlFor="amount">Valor</Label>
              <Input
                type="currency"
                id="amount"
                max={pixInfo?.amount}
                {...pixForm.register('amount')}
              />

              <Button
                type="submit"
                disabled={
                  pixTransactionApi.isPending ||
                  !pixInfo ||
                  !pixForm.formState.isValid
                }
              >
                Pagar
                {pixTransactionApi.isPending && (
                  <Loader2 className="animate-spin" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
