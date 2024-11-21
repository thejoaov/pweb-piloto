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
    title: 'Easy Task Management',
    description:
      'Organize and prioritize your tasks with our intuitive interface.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Team Collaboration',
    description: 'Work seamlessly with your team members in real-time.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Boost Productivity',
    description:
      'Increase your efficiency with our powerful productivity tools.',
  },
]

export function FeatureSection() {
  return (
    <section id="features" className="container mx-auto px-4 py-24">
      <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Card key={index}>
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
