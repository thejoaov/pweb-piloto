import { Button } from '~/components/ui/button'

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
        Welcome to <span className="text-primary">YourApp</span>
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
        Discover a new way to manage your tasks, collaborate with your team, and
        boost your productivity.
      </p>
      <div className="mt-8">
        <Button size="lg" asChild>
          <a href="#features">Learn More</a>
        </Button>
      </div>
    </section>
  )
}
