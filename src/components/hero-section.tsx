import Link from 'next/link'
import { Button } from '~/components/ui/button'

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
        Projeto <span className="text-green-700">Cadweb</span>
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
        Disciplina de Progrmação Web 2024.1
      </p>
      <div className="flex justify-center mt-8 gap-4">
        <Button variant="outline" asChild>
          <Link href="/signin">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Cadastro</Link>
        </Button>
      </div>
    </section>
  )
}
