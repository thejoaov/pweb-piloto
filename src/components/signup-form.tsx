'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMask } from '@react-input/mask'
import { Loader } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { signUp } from '~/lib/actions'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome deve ter no mínimo 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor, insira um endereço de email válido.',
  }),
  cpf: z
    .string()
    .min(8, {
      message: 'CPF deve ter no mínimo 2 caracteres.',
    })
    .transform((value) => {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    }),
  password: z.string().min(8, {
    message: 'Senha deve ter no mínimo 8 caracteres.',
  }),
})

export function SignupForm() {
  const router = useRouter()

  const cpfInputRef = useMask({
    mask: '___.___.___-__',
    replacement: { _: /\d/ },
  })

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    signUp,
    zodResolver(formSchema),
    {
      actionProps: {
        onSuccess: () => {
          toast('Cadastro realizado com sucesso!')
          router.push('/dashboard')
        },
        onError: (e) => {
          console.error(e)
          toast('Algo deu errado. Por favor, tente novamente.')
        },
      },
      formProps: {},
      errorMapProps: {},
    },
  )

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seu nome</FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  {...field}
                  disabled={action.isExecuting}
                />
              </FormControl>
              <FormDescription>
                Seu nome será visto por outros usuários.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="john@example.com"
                  type="email"
                  disabled={action.isExecuting}
                />
              </FormControl>
              <FormDescription>
                Nunca compartilharemos seu email com ninguém.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  ref={cpfInputRef}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  disabled={action.isExecuting}
                />
              </FormControl>
              <FormDescription>
                Nunca compartilharemos seu cpf com ninguém.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...field}
                  disabled={action.isExecuting}
                />
              </FormControl>
              <FormDescription>
                Sua senha deve ter no mínimo 8 caracteres.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={action.isExecuting || !form.formState.isValid}
          className="w-full"
        >
          {action.isExecuting && <Loader className="mr-2 animate-spin" />}
          {action.isExecuting ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>
    </Form>
  )
}
