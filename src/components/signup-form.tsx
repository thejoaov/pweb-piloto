'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

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
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const { execute, result, status } = useAction(signUp)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      execute(values)

      if (!result || status === 'hasErrored') {
        toast('Algo deu errado. Por favor, tente novamente.')
      } else {
        toast('Your account has been created.')
        router.push('/dashboard')
      }
    } catch (error) {
      toast('Algo deu errado. Por favor, tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seu nome</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
                <Input placeholder="john@example.com" {...field} />
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
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormDescription>
                Sua senha deve ter no mínimo 8 caracteres.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader className="mr-2 animate-spin" />}
          {isLoading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>
    </Form>
  )
}
