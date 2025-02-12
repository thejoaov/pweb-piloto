'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { Loader } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { loginUser } from '~/lib/actions'

const formSchema = z.object({
  email: z.string().email({
    message: 'Por favor, insira um endereço de email válido.',
  }),
  password: z.string().min(8, {
    message: 'Senha deve ter no mínimo 8 caracteres.',
  }),
})

export function SigninForm() {
  const router = useRouter()

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    loginUser,
    zodResolver(formSchema),
    {
      actionProps: {
        onSuccess: () => {
          toast('Bem-vindo de volta!')
          router.push('/dashboard')
        },
        onError: (e) => {
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="john@example.com"
                  type="email"
                  autoComplete="email"
                  disabled={action.isExecuting}
                  {...field}
                />
              </FormControl>
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
                  autoComplete="current-password"
                  disabled={action.isExecuting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={action.isExecuting} className="w-full">
          {action.isExecuting && <Loader className="mr-2 animate-spin" />}
          {action.isExecuting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </Form>
  )
}
