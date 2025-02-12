'use client'

import { zodResolver } from '@hookform/resolvers/zod'
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
  password: z.string().min(8, {
    message: 'Senha deve ter no mínimo 8 caracteres.',
  }),
})

export function SignupForm() {
  const router = useRouter()

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
                  placeholder="john@example.com"
                  {...field}
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
        <Button type="submit" disabled={action.isExecuting} className="w-full">
          {action.isExecuting && <Loader className="mr-2 animate-spin" />}
          {action.isExecuting ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>
    </Form>
  )
}
