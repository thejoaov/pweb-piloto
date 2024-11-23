import { CheckCircle, Users, Zap } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

const features = [
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Gerenciamento de produtos',
    description:
      'Crud completo, com listagem, criação, edição, ordenamento e remoção, de produtos e pedidos. Avançe ou cancele os pedidos, e veja os detalhes de cada.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Listagem de usuários',
    description:
      'Login, cadastro e listagem de usuários com autenticação e confirmação via email.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Tecnologia em seu estado da arte',
    description:
      'Next.JS 15, tRPC, Drizzle ORM, Supabase, TailwindCSS e Biome. Tudo para garantir a melhor experiência de desenvolvimento e performance.',
  },
]

export function FeatureSection() {
  return (
    <section id="features" className="container mx-auto px-4 py-24">
      <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="mb-4">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
