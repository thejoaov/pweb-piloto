'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await loginUser({
        email: values.email,
        password: values.password,
      })
      toast('Bem vindo!')

      router.push('/dashboard')
    } catch (error) {
      toast('Algo deu errado. Por favor, tente novamente.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isLoading}
          className="w-full"
        >
          {form.formState.isLoading && <Loader className="mr-2 animate-spin" />}
          {form.formState.isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </Form>
  )
}
