import Link from 'next/link'
import { SignupForm } from '~/components/signup-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

export default function SignUpPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cadastre-se</CardTitle>
          <CardDescription>Crie uma conta para começar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignupForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/signin" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
